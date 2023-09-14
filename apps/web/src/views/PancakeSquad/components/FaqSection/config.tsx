import { Text, Link } from '@pancakeswap/uikit'
import { ContextApi } from '@pancakeswap/localization'

type FAQsType = {
  t: ContextApi['t']
}

const config = ({ t }: FAQsType) => [
  {
    title: t('What is IceCreamSwap building?'),
    description: [
      t('A one stop DeFi solution which users and founders can utilize on all chains and whichever DeFi utility they are searching for.' +
      " This removes the need to search for new utility providers on every blockchain and unifies all utility's in a single, simple to use, interface.")
    ],
  },
  {
    title: t('How is IceCreamSwap protecting me?'),
    description: [
      t('There are multiple levels of user protection like KYCing listed projects, providing full time support on our Telegram and utilizing audited and battle tested smart contracts')
    ],
  },
  {
    title: t('Are the Swap contracts audited?'),
    description: [
      <Text as="p" color="textSubtle" fontSize="16px">
        {t('Yes, IceCreamSwap has multiple Audits including an Audit, Bug Bounty and KYC by Certik: ',)}
        <Link
          display="inline-flex"
          color="text"
          title="Certik Audit"
          href="https://skynet.certik.com/projects/icecreamswap"
        >
          {t('Certik Audit')}
        </Link>
        .
        <br/>
        {t('Also our DEX is using the unmodified Uniswap V2 contracts, which are battle tested for years and trusted with billions of $')}
      </Text>,
    ],
  },
  {
    title: t('How is the Bridge secured?'),
    description: [
      <Text as="p" color="textSubtle" fontSize="16px">
        {t('The IceCream bridge builds on top of the industry leading ChainBridge, by ')}
        <Link
          display="inline-flex"
          color="text"
          title="ChainSafe"
          href="https://chainsafe.io/"
        >
          {t('ChainSafe')}
        </Link>
        {t(', codebase. This codebase has multiple audits and is used in many huge bridges like the Dogechain bridge or ')}
        <Link
          display="inline-flex"
          color="text"
          title="Meter passport"
          href="https://passport.meter.io"
        >
          {t('Meter passport')}
        </Link>
        .
      </Text>,
      <Text as="p" color="textSubtle" fontSize="16px">
        {t('In addition we completed an Audit with an member of the ')}
        <Link
          display="inline-flex"
          color="text"
          title="DeFi Security Alliance"
          href="https://defisec.info/"
        >
          {t('DeFi Security Alliance')}
        </Link>
        .
      </Text>,
    ],
  },
  {
    title: t('How does the IceCreamSwap DEX aggregator help me?'),
    description: [
      t('The IceCreamSwap DEX aggregator, powered by AKKA, aggregates the entire liquidity on the chain to find the optimal trading route for your swap.'),
      t('Basically you are guaranteed that there is no better place to do the swap as we utilize all other providers to find the optimal execution for you.'),
      t('All this happens in the background and in a single transaction.'),
    ],
  },
  {
    title: t('What is the IceCreamSwap KYC?'),
    description: [
      t('It is a fully automated Identity verification service that just takes a few minutes and mints you a soulbound token on completion, which attests the KYC on chain.'),
      t('Founders can use it to show their transparency and commitment to their project, while users can prove their unique identity to e.g. receive AirDrops not meant for Bots.'),
      t('Founders with KYC token are way less likely to scam their users as they can be tracked down by authorities.')
    ],
  },
  {
    title: t('How to list a token on IceCreamSwap?'),
    description: [
      t('Simply contact us on our Telegram.'),
    ],
  },
  {
    title: t('How to create a ERC20 token?'),
    description: [
      t('IceCreamSwap has a simple utility for that, which fully automates the process. You can find it in the Token Deployer tab.'),
    ],
  },
  {
    title: t('How much reward will I get for providing liquidity?'),
    description: [
      t(
        '5/6 (83%) of the trading fees are distributed by the dex smart contract to all liquidity providers. Also there are Farming pools to receive additional ICE tokens and some tokens like SCORE even generate rewards through securing the Blockchain.',
      ),
    ],
  },
  {
    title: t('Which chains are supported?'),
    description: [
      <Text as="p" color="textSubtle" fontSize="16px">
        {t('Currently we are supporting CORE, Telos, Bitgert (Brise), XDC, Shardeum, Binance smart chain (BSC), XoDex, Dogechain and Fuse Chains, as well as soon Iota Shimmer. For an always up to date list please take a look at our ')}
        <Link
          display="inline-flex"
          color="text"
          title="IceCreamSwap Wiki"
          href="https://wiki.icecreamswap.com/intro/multichain"
        >
          {t(' Wiki')}
        </Link>
        .
      </Text>,
    ],
  },
  {
    title: t('What is the address of the IceCream token?'),
    description: [
      t('IceCream is a multi chain token and therefore available on and bridgable between multiple blockchains:'),
      t('0xc0E49f8C615d3d4c245970F6Dc528E4A47d69a44 CORE'),
      t('0xB999Ea90607a826A3E6E6646B404c3C7d11fa39D Bitgert'),
      t('0xce6c9c70f91c6797873EFC80505f972290A88f5D BSC'),
      t('0x54051D9DbE99687867090d95fe15C3D3E35512Ba XDC'),
      t('0x81bCEa03678D1CEF4830942227720D542Aa15817 XoDex'),
      t('0x81bCEa03678D1CEF4830942227720D542Aa15817 Dogechain'),
      t('0x54051D9DbE99687867090d95fe15C3D3E35512Ba DoKEN'),
      t('0x867f08A3ab824b42e8058a1B48e32E1dF205b092 Fuse'),
      <Text as="p" color="textSubtle" fontSize="16px">
        {t('An up to date list of all IceCream addresses for all supported chains can be found on our ')}
        <Link
          display="inline-flex"
          color="text"
          title={t('Wiki')}
          external
          href="https://wiki.icecreamswap.com/intro/ice"
        >
          {t(' Wiki')}
        </Link>
      </Text>,
    ],
  },
  {
    title: t('What are the Router and Factory addresses?'),
    description: [
      t('The router and factory addresses are the same on every supported chain:'),
      `${t('Router02')} : 0xBb5e1777A331ED93E07cF043363e48d320eb96c4`,
      `${t('Factory')} : 0x9E6d21E759A7A288b80eef94E4737D313D31c13f`,
    ],
  },
]
export default config
