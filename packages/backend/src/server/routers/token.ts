import { z } from 'zod'
import { isKyc, isMod } from '../session'
import { publicProcedure, router } from '../trpc'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { prisma } from '../prisma'
import { Listed, Token } from '@icecreamswap/database'
import v2factoryAbi from '../../abi/v2factory.json'
import v2pairAbi from '../../abi/v2pair.json'
import { Contract, providers, utils } from 'ethers'
import { getChain } from '@icecreamswap/constants'
import { ICE, USD } from '@pancakeswap/tokens'

export const tokenRouter = router({
  add: publicProcedure
    .input(
      z.object({
        tokenAddress: z.string(),
        tokenName: z.string(),
        tokenSymbol: z.string(),
        tokenDecimals: z.number(),
        chainId: z.number(),
        logo: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.session?.user) {
        throw new Error('Unauthorized')
      }
      if (
        !isKyc(ctx.session.user) ||
        !checkDelegate(input.tokenAddress, ctx.session.user.wallet) ||
        !(await checkLiquidity(input.tokenAddress, input.chainId))
      ) {
        throw new Error('Unauthorized')
      } else if (!isMod(ctx.session.user)) {
        throw new Error('Unauthorized')
      }
      if (input.logo) {
        const s3Client = new S3Client({})
        const binary = Buffer.from(input.logo, 'base64')
        await s3Client.send(
          new PutObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME,
            Key: `token/${input.chainId}/${input.tokenAddress}.png`,
            Body: binary,
            ContentType: 'image/png',
            GrantRead: 'uri=http://acs.amazonaws.com/groups/global/AllUsers',
          }),
        )
      }
      await prisma.token.create({
        data: {
          name: input.tokenName,
          symbol: input.tokenSymbol,
          address: input.tokenAddress,
          decimals: input.tokenDecimals,
          chainId: input.chainId,
          listed: Listed.DEFAULT_LIST,
          addedBy: {
            connect: {
              wallet: ctx.session.user.wallet,
            },
          },
        },
      })
    }),
  defaultList: publicProcedure.query(async () => {
    const tokens: (Token & { tags?: string[] })[] = await prisma.token.findMany({
      where: {
        listed: Listed.DEFAULT_LIST,
      },
    })
    const kycs = await prisma.delegation.findMany({
      where: {
        target: {
          in: tokens.map((token) => token.address),
          mode: 'insensitive',
        },
        status: 'MINTED',
      },
    })
    kycs.forEach((kyc) => {
      const token = tokens.find((t) => t.address.toLowerCase() === kyc.target.toLowerCase())
      if (token) {
        token.tags = token.tags || []
        token.tags.push('KYCed')
      }
    })

    return {
      name: 'IceCreamSwap Default',
      timestamp: new Date().toISOString(),
      version: {
        major: 1,
        minor: 0,
        patch: 0,
      },
      tags: {},
      logoURI: 'https://icecreamswap.com/logo.png',
      keywords: ['icecreamswap', 'default'],
      tokens: tokens.map((token) => ({
        name: token.name,
        symbol: token.symbol,
        address: token.address,
        chainId: token.chainId,
        decimals: token.decimals,
        logoURI: `https://${process.env.S3_BUCKET_NAME}.s3.amazonaws.com/token/${token.chainId}/${token.address}.png`,
        tags: token.tags || [],
      })),
    }
  }),
})

const checkDelegate = async (tokenAddress: string, wallet: string) => {
  const kyc = await prisma.delegation.findFirst({
    where: {
      target: {
        equals: tokenAddress,
        mode: 'insensitive',
      },
      status: 'MINTED',
      source: {
        address: {
          equals: wallet,
          mode: 'insensitive',
        },
      },
    },
  })
  return !!kyc
}

const usdThreshold = 3000

const checkLiquidity = async (tokenAddress: string, chainId: number) => {
  const chain = getChain(chainId)
  if (!chain) {
    return false
  }
  const provider = new providers.JsonRpcProvider(chain.rpcUrls.default)
  const iceAddress = ICE[chainId].address
  const usdAddress = USD[chainId].address
  const iceUsdPair = new Contract(await getPairAddress(iceAddress, usdAddress, chainId), v2pairAbi, provider)
  const tokenIcePair = new Contract(await getPairAddress(tokenAddress, iceAddress, chainId), v2pairAbi, provider)

  const iceReserves = await iceUsdPair.getReserves()
  const usdPerIce = utils.parseUnits('1', 18).mul(iceReserves[0]).div(iceReserves[1])

  const tokenReserves = await tokenIcePair.getReserves()

  const iceValue = usdPerIce.mul(tokenReserves[1]).div(utils.parseUnits('1', 18))
  const liquidity = Number(utils.formatUnits(iceValue, 18)) * 2

  return liquidity >= usdThreshold
}

const getPairAddress = async (tokenA: string, tokenB: string, chainId: number) => {
  const chain = getChain(chainId)
  if (!chain || !chain.swap?.factoryAddress) {
    throw new Error('Invalid chainId')
  }
  const provider = new providers.JsonRpcProvider(chain.rpcUrls.default)
  const factory = new Contract(chain.swap?.factoryAddress, v2factoryAbi, provider)
  const pairAddress = await factory.getPair(tokenA, tokenB)
  return pairAddress
}
