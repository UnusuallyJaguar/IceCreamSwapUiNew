import { FACTORY_ADDRESS, INIT_CODE_HASH } from '../common/swap'
import IceChain from '../ice-chain'

export const telos: IceChain = {
  id: 40,
  name: 'Telos',
  features: ['swap', 'bridge', 'farms'],
  network: 'telos',
  rpcUrls: {
    public: 'https://mainnet.telos.net/evm',
    default: 'https://mainnet.telos.net/evm',
  },
  blockExplorers: {
    default: { name: 'Telos Explorer', url: 'https://www.teloscan.io' },
  },
  nativeCurrency: {
    name: 'Telos',
    symbol: 'TLOS',
    decimals: 18,
  },
  multicall: {
    address: '0xf3a3dAf360161B2f10c645EF039C709A3Fd4Ea62',
    blockCreated: 286183313,
  },
  blockInterval: 0.5,
  wrappedNative: {
    address: '0xDC2393dc10734BF153153038943a5deB42b209cd',
    decimals: 18,
    symbol: 'WTLOS',
    name: 'Wrapped TLOS',
  },
  swap: {
    factoryAddress: FACTORY_ADDRESS,
    initCodeHash: INIT_CODE_HASH,
  },
}
