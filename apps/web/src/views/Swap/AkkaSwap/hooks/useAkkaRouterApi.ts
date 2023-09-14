import { ChainId, Currency, CurrencyAmount, JSBI, NATIVE } from '@pancakeswap/sdk'
import { FAST_INTERVAL, NATIVE_TOKEN_ADDRESS } from 'config/constants'
import { useIsAkkaSwapModeActive, useIsAkkaSwapModeStatus } from 'state/global/hooks'
import { Field } from 'state/swap/actions'
import { useDerivedSwapInfo, useSwapState } from 'state/swap/hooks'
import useSWR, { Fetcher } from 'swr'
import { AkkaRouterResponseType } from './types'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { useCurrency } from 'hooks/Tokens'
import { captureMessage } from '@sentry/nextjs'
import useActiveWeb3React from 'hooks/useActiveWeb3React'
import { useEffect, useState } from 'react'
import { setRouteApiChainName } from 'utils/akka/setRouteApiChainName'
import { useApproveCallbackFromAkkaTrade } from './useApproveCallbackFromAkkaTrade'
import { ApprovalState } from 'hooks/useApproveCallback'
import { useAkkaRouterContract, useAkkaRouterV2Contract } from 'utils/exchange'
import { useModal } from '@pancakeswap/uikit'

export const useAkkaRouterApi = (
  token0: Currency,
  token1: Currency,
  amount: CurrencyAmount<Currency>,
  slippage = 0.1,
) => {
  const {
    independentField,
    typedValue,
    recipient,
    [Field.INPUT]: { currencyId: inputCurrencyId },
    [Field.OUTPUT]: { currencyId: outputCurrencyId },
  } = useSwapState()
  const inputCurrency = useCurrency(inputCurrencyId)
  const outputCurrency = useCurrency(outputCurrencyId)
  const [isAkkaSwapMode, , toggleSetAkkaModeToFalse, toggleSetAkkaModeToTrue] = useIsAkkaSwapModeStatus()
  const {
    v2Trade,
    currencyBalances,
    parsedAmount,
    inputError: swapInputError,
  } = useDerivedSwapInfo(independentField, typedValue, inputCurrency, outputCurrency, recipient)
  const [akkaApproval, akkaApproveCallback] = useApproveCallbackFromAkkaTrade(parsedAmount)
  // isAkkaSwapActive checks if akka router is generally active or not
  const [isAkkaSwapActive, toggleSetAkkaActive, toggleSetAkkaActiveToFalse, toggleSetAkkaActiveToTrue] =
    useIsAkkaSwapModeActive()
  const [isRouteLoading, setIsRouteLoading] = useState(false)
  const [, , isAkkaConfirmModalOpen] = useModal('confirmSwapModal')
  const { isConnected, account } = useActiveWeb3React()
  const { chainId } = useActiveChainId()
  const akkaContract = useAkkaRouterContract()
  const akkaV2Contract = useAkkaRouterV2Contract()
  const methodName = 'multiPathSwap'
  const API_URL = 'https://api.akka.foundation'
  const isAkkaSupportedChain = chainId === ChainId.BITGERT || chainId === ChainId.XDC || chainId === ChainId.CORE || chainId === ChainId.TELOS
  // Take swap information from pancakeswap router
  const fetcher: Fetcher<AkkaRouterResponseType> = async (url) => {
    setIsRouteLoading(true)
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(url, { signal: controller.signal }).then((r) => {
      if (r.status !== 200) {
        toggleSetAkkaModeToFalse()
        return undefined
        // captureMessage('AKKA: Unsupported Token (Route 400)', {
        //   tags: {
        //     chain_id: chainId,
        //     amount: amount?.multiply(10 ** inputCurrency?.decimals)?.toExact(),
        //     fromToken: inputCurrencyId === NATIVE[chainId].symbol ? NATIVE_TOKEN_ADDRESS : token0?.wrapped?.address,
        //     toToken: outputCurrencyId === NATIVE[chainId].symbol ? NATIVE_TOKEN_ADDRESS : token1?.wrapped?.address,
        //   },
        // })
      }
      return r.json()
    })
      .then((response) => {
        if (response === undefined) {
          toggleSetAkkaModeToFalse()
          return response
        }
        if (response !== undefined && v2Trade === undefined) {
          toggleSetAkkaModeToTrue()
          return response
        }
        if (v2Trade.outputAmount.lessThan(JSBI.BigInt(response.route.return_amount_without_tax_wei))) {
          if (isConnected) {
            if (akkaApproval === ApprovalState.APPROVED) {
              if (currencyBalances[Field.INPUT] && parsedAmount && (currencyBalances[Field.INPUT].greaterThan(parsedAmount) || currencyBalances[Field.INPUT].equalTo(parsedAmount))) {
                if (chainId === ChainId.CORE || chainId === ChainId.XDC || chainId === ChainId.TELOS) {
                  akkaV2Contract.estimateGas[methodName](
                    response.swap.amountIn,
                    response.swap.amountOutMin,
                    response.swap.data,
                    account,
                    response.swap.akkaFee.fee,
                    response.swap.akkaFee.v,
                    response.swap.akkaFee.r,
                    response.swap.akkaFee.s,
                    {
                      value: inputCurrencyId === NATIVE[chainId].symbol ? response.swap.amountIn : '0',
                    },
                  )
                    .then((data) => {
                      if (data.gt('21000')) {
                        toggleSetAkkaModeToTrue()
                      } else {
                        toggleSetAkkaModeToFalse()
                        captureMessage(`AKKA: EstimateGas is lower than 21000`, {
                          tags: {
                            chain_id: chainId,
                            amount: parsedAmount?.multiply(10 ** inputCurrency?.decimals)?.toExact(),
                            fromToken: inputCurrencyId === NATIVE[chainId]?.symbol ? NATIVE_TOKEN_ADDRESS : inputCurrency?.wrapped?.address,
                            toToken: outputCurrencyId === NATIVE[chainId]?.symbol ? NATIVE_TOKEN_ADDRESS : outputCurrency?.wrapped?.address,
                          },
                        })
                      }
                    })
                    .catch((error) => {
                      toggleSetAkkaModeToFalse()
                      console.log(error);
                      captureMessage(`AKKA: EstimateGas Error -> ${error}`, {
                        tags: {
                          chain_id: chainId,
                          amount: parsedAmount?.multiply(10 ** inputCurrency?.decimals)?.toExact(),
                          fromToken: inputCurrencyId === NATIVE[chainId]?.symbol ? NATIVE_TOKEN_ADDRESS : inputCurrency?.wrapped?.address,
                          toToken: outputCurrencyId === NATIVE[chainId]?.symbol ? NATIVE_TOKEN_ADDRESS : outputCurrency?.wrapped?.address,
                        },
                      })
                    })
                }
                if (chainId === ChainId.BITGERT) {
                  akkaContract.estimateGas[methodName](
                    response.swap.amountIn,
                    response.swap.amountOutMin,
                    response.swap.data,
                    [],
                    [],
                    account,
                    {
                      value: inputCurrencyId === NATIVE[chainId].symbol ? response.swap.amountIn : '0',
                    },
                  )
                    .then((data) => {
                      if (data.gt('21000')) {
                        toggleSetAkkaModeToTrue()
                      } else {
                        toggleSetAkkaModeToFalse()
                        captureMessage(`AKKA: EstimateGas is lower than 21000`, {
                          tags: {
                            chain_id: chainId,
                            amount: parsedAmount?.multiply(10 ** inputCurrency?.decimals)?.toExact(),
                            fromToken: inputCurrencyId === NATIVE[chainId]?.symbol ? NATIVE_TOKEN_ADDRESS : inputCurrency?.wrapped?.address,
                            toToken: outputCurrencyId === NATIVE[chainId]?.symbol ? NATIVE_TOKEN_ADDRESS : outputCurrency?.wrapped?.address,
                          },
                        })
                      }
                    })
                    .catch((error) => {
                      toggleSetAkkaModeToFalse()
                      console.log(error);
                      captureMessage(`AKKA: EstimateGas Error -> ${error}`, {
                        tags: {
                          chain_id: chainId,
                          amount: parsedAmount?.multiply(10 ** inputCurrency?.decimals)?.toExact(),
                          fromToken: inputCurrencyId === NATIVE[chainId]?.symbol ? NATIVE_TOKEN_ADDRESS : inputCurrency?.wrapped?.address,
                          toToken: outputCurrencyId === NATIVE[chainId]?.symbol ? NATIVE_TOKEN_ADDRESS : outputCurrency?.wrapped?.address,
                        },
                      })
                    })
                }
              }
              else {
                toggleSetAkkaModeToTrue()
              }
            }
            else {
              toggleSetAkkaModeToTrue()
            }
          }
          else {
            toggleSetAkkaModeToTrue()
          }
        }
        else {
          toggleSetAkkaModeToFalse()
        }
        clearTimeout(id);
        return response
      })
      .finally(() => {
        setIsRouteLoading(false)
      })
    return res;
  }

  const { data, error, mutate, isValidating } = useSWR(
    `${API_URL}/route_swap?token0=${inputCurrencyId === NATIVE[chainId].symbol ? NATIVE_TOKEN_ADDRESS : token0?.wrapped?.address
    }&token1=${outputCurrencyId === NATIVE[chainId].symbol ? NATIVE_TOKEN_ADDRESS : token1?.wrapped?.address
    }&amount=${amount?.multiply(10 ** inputCurrency?.decimals)?.toExact()}&slipage=${slippage / 10000}&use_split=true${account ? `&user_wallet_addr=${account}` : ''
    }&chain0=${setRouteApiChainName(chainId)}&chain1=${setRouteApiChainName(chainId)}`,
    token0 &&
    token1 &&
    amount &&
    slippage &&
    isAkkaSupportedChain &&
    isAkkaSwapActive &&
    akkaApproval !== ApprovalState.PENDING &&
    !isAkkaConfirmModalOpen &&
    fetcher,
    {
      refreshInterval: FAST_INTERVAL,
      revalidateIfStale: true,
      revalidateOnFocus: false,
      revalidateOnReconnect: false
    },
  )
  return { data, error, mutate, isValidating, isRouteLoading }
}

// Call both apis route and args together in the same time
export const useAkkaRouterRouteWithArgs = (
  token0: Currency,
  token1: Currency,
  amount: CurrencyAmount<Currency>,
  slippage = 0.1,
) => {
  const route = useAkkaRouterApi(token0, token1, amount, slippage)

  const mutateAkkaRoute = () => {
    route.mutate()
  }

  const isLoading = route.isRouteLoading || route.isValidating

  return {
    route,
    args: route,
    mutateAkkaRoute,
    isLoading
  }
}