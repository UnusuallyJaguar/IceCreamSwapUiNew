import { FACTORY_ADDRESS, INIT_CODE_HASH } from '../common/swap'
import IceChain from '../ice-chain'

export const base: IceChain = {
  id: 8453,
  name: 'Base Blockchain',
  features: ['swap', 'bridge', "farms"],
  network: 'base',
  rpcUrls: {
    public: 'https://developer-access-mainnet.base.org',
    default: 'https://developer-access-mainnet.base.org',
  },
  blockExplorers: {
    default: { name: 'Base Explorer', url: 'https://basescan.org' },
  },
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  multicall: {
    address: '0xf3a3dAf360161B2f10c645EF039C709A3Fd4Ea62',
    blockCreated: 1915584,
  },
  blockInterval: 2,
  wrappedNative: {
    address: '0x4200000000000000000000000000000000000006',
    decimals: 18,
    symbol: 'WETH',
    name: 'Wrapped Ether',
  },
  swap: {
    factoryAddress: FACTORY_ADDRESS,
    initCodeHash: INIT_CODE_HASH,
  }
}
