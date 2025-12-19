import { Metadata } from 'next'
import Link from 'next/link'
import { TrendingUp, TrendingDown, ChevronRight, Bitcoin, Coins, TrendingUpIcon, Shield, Wallet, LineChart } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Cryptocurrency Prices Today | Live Bitcoin, Ethereum & Crypto Market Cap - Lician',
  description: 'Track real-time cryptocurrency prices for Bitcoin (BTC), Ethereum (ETH), and 50+ digital assets. Live crypto market data, 24-hour price changes, market caps, and comprehensive crypto investing guides.',
  keywords: [
    'bitcoin price',
    'ethereum price',
    'crypto prices',
    'cryptocurrency',
    'btc price',
    'eth price',
    'crypto market',
    'cryptocurrency prices today',
    'bitcoin price today',
    'ethereum price today',
    'live crypto prices',
    'crypto market cap',
    'cryptocurrency market',
    'digital currency prices',
    'crypto portfolio tracker',
    'bitcoin market cap',
    'ethereum market cap',
    'cryptocurrency investing',
    'crypto trading',
    'blockchain assets'
  ],
  openGraph: {
    title: 'Live Cryptocurrency Prices | Bitcoin, Ethereum & Market Data',
    description: 'Real-time crypto prices, market caps, and 24h changes for Bitcoin, Ethereum, and 50+ cryptocurrencies. Free crypto market analysis and investing guides.',
    type: 'website',
    url: 'https://lician.com/crypto',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cryptocurrency Prices Today | Bitcoin & Ethereum Live Prices',
    description: 'Track real-time cryptocurrency prices and market data. Bitcoin, Ethereum, and 50+ digital assets with live updates.',
  },
  alternates: {
    canonical: 'https://lician.com/crypto',
  },
}

interface CryptoPrice {
  symbol: string
  name: string
  price: number
  change24h: number
  changePercent24h: number
  marketCap: number
  volume24h: number
}

async function getCryptoPrices(): Promise<CryptoPrice[]> {
  const cryptos = [
    { symbol: 'BTC', name: 'Bitcoin' },
    { symbol: 'ETH', name: 'Ethereum' },
    { symbol: 'BNB', name: 'BNB' },
    { symbol: 'SOL', name: 'Solana' },
    { symbol: 'XRP', name: 'XRP' },
    { symbol: 'ADA', name: 'Cardano' },
    { symbol: 'AVAX', name: 'Avalanche' },
    { symbol: 'DOGE', name: 'Dogecoin' },
    { symbol: 'DOT', name: 'Polkadot' },
    { symbol: 'MATIC', name: 'Polygon' },
    { symbol: 'LINK', name: 'Chainlink' },
    { symbol: 'UNI', name: 'Uniswap' },
    { symbol: 'ATOM', name: 'Cosmos' },
    { symbol: 'LTC', name: 'Litecoin' },
    { symbol: 'BCH', name: 'Bitcoin Cash' },
    { symbol: 'NEAR', name: 'NEAR Protocol' },
    { symbol: 'ALGO', name: 'Algorand' },
    { symbol: 'VET', name: 'VeChain' },
    { symbol: 'ICP', name: 'Internet Computer' },
    { symbol: 'FIL', name: 'Filecoin' },
  ]

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

  const pricePromises = cryptos.map(async (crypto) => {
    try {
      const response = await fetch(
        `${baseUrl}/api/v1/crypto/prices?symbol=${crypto.symbol}&limit=2`,
        {
          cache: 'no-store',
          next: { revalidate: 0 }
        }
      )

      if (!response.ok) {
        console.warn(`Failed to fetch ${crypto.symbol}`)
        return null
      }

      const data = await response.json()

      if (!data.prices || data.prices.length === 0) {
        return null
      }

      const latest = data.prices[0]
      const previous = data.prices[1] || latest

      const change24h = latest.close - previous.close
      const changePercent24h = ((latest.close - previous.close) / previous.close) * 100

      return {
        symbol: crypto.symbol,
        name: crypto.name,
        price: latest.close,
        change24h,
        changePercent24h,
        marketCap: latest.market_cap || 0,
        volume24h: latest.volume || 0,
      }
    } catch (error) {
      console.error(`Error fetching ${crypto.symbol}:`, error)
      return null
    }
  })

  const results = await Promise.all(pricePromises)
  return results.filter((r): r is CryptoPrice => r !== null)
}

function formatPrice(price: number): string {
  if (price >= 1000) {
    return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  } else if (price >= 1) {
    return `$${price.toFixed(2)}`
  } else if (price >= 0.01) {
    return `$${price.toFixed(4)}`
  } else {
    return `$${price.toFixed(6)}`
  }
}

function formatMarketCap(value: number): string {
  if (!value) return '-'
  if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`
  return `$${value.toLocaleString()}`
}

export default async function CryptoPage() {
  const cryptoPrices = await getCryptoPrices()

  const totalMarketCap = cryptoPrices.reduce((sum, crypto) => sum + crypto.marketCap, 0)
  const total24hVolume = cryptoPrices.reduce((sum, crypto) => sum + crypto.volume24h, 0)
  const avgChange = cryptoPrices.reduce((sum, crypto) => sum + crypto.changePercent24h, 0) / cryptoPrices.length

  return (
    <>
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@graph': [
              {
                '@type': 'BreadcrumbList',
                itemListElement: [
                  {
                    '@type': 'ListItem',
                    position: 1,
                    name: 'Home',
                    item: 'https://lician.com',
                  },
                  {
                    '@type': 'ListItem',
                    position: 2,
                    name: 'Cryptocurrency Prices',
                    item: 'https://lician.com/crypto',
                  },
                ],
              },
              {
                '@type': 'FAQPage',
                mainEntity: [
                  {
                    '@type': 'Question',
                    name: 'What is the current Bitcoin price?',
                    acceptedAnswer: {
                      '@type': 'Answer',
                      text: `Bitcoin (BTC) is currently trading at ${cryptoPrices.find(c => c.symbol === 'BTC') ? formatPrice(cryptoPrices.find(c => c.symbol === 'BTC')!.price) : 'loading'}. Bitcoin is the world's first and largest cryptocurrency by market capitalization.`,
                    },
                  },
                  {
                    '@type': 'Question',
                    name: 'What is the current Ethereum price?',
                    acceptedAnswer: {
                      '@type': 'Answer',
                      text: `Ethereum (ETH) is currently trading at ${cryptoPrices.find(c => c.symbol === 'ETH') ? formatPrice(cryptoPrices.find(c => c.symbol === 'ETH')!.price) : 'loading'}. Ethereum is the leading smart contract platform and the second-largest cryptocurrency by market cap.`,
                    },
                  },
                  {
                    '@type': 'Question',
                    name: 'How do I invest in cryptocurrency?',
                    acceptedAnswer: {
                      '@type': 'Answer',
                      text: 'To invest in cryptocurrency: 1) Choose a reputable cryptocurrency exchange (Coinbase, Binance, Kraken), 2) Create and verify your account, 3) Deposit funds via bank transfer or card, 4) Research cryptocurrencies and their fundamentals, 5) Start with major cryptocurrencies like Bitcoin or Ethereum, 6) Use secure storage (hardware wallet for large amounts), 7) Never invest more than you can afford to lose, 8) Consider dollar-cost averaging to reduce volatility risk.',
                    },
                  },
                  {
                    '@type': 'Question',
                    name: 'What is cryptocurrency market cap?',
                    acceptedAnswer: {
                      '@type': 'Answer',
                      text: 'Cryptocurrency market capitalization is calculated by multiplying the current price by the circulating supply of coins. It represents the total value of all coins in circulation and is used to rank cryptocurrencies by size. Bitcoin has the largest market cap, followed by Ethereum.',
                    },
                  },
                  {
                    '@type': 'Question',
                    name: 'Is cryptocurrency a good investment?',
                    acceptedAnswer: {
                      '@type': 'Answer',
                      text: 'Cryptocurrency can be a high-risk, high-reward investment. While some investors have seen significant returns, crypto markets are highly volatile and unpredictable. Before investing: 1) Research thoroughly, 2) Understand blockchain technology, 3) Only invest what you can afford to lose, 4) Diversify your portfolio, 5) Consider your risk tolerance and investment timeline. Cryptocurrencies are speculative assets and not suitable for everyone.',
                    },
                  },
                  {
                    '@type': 'Question',
                    name: 'What affects cryptocurrency prices?',
                    acceptedAnswer: {
                      '@type': 'Answer',
                      text: 'Cryptocurrency prices are influenced by: 1) Supply and demand dynamics, 2) Regulatory news and government policies, 3) Adoption by institutions and merchants, 4) Technological developments and upgrades, 5) Market sentiment and media coverage, 6) Macro economic factors, 7) Security breaches or exchange hacks, 8) Competition from other cryptocurrencies, 9) Mining difficulty and costs, 10) Overall market trends and Bitcoin dominance.',
                    },
                  },
                  {
                    '@type': 'Question',
                    name: 'How is crypto different from stocks?',
                    acceptedAnswer: {
                      '@type': 'Answer',
                      text: 'Key differences between crypto and stocks: 1) Trading hours: Crypto trades 24/7, stocks have limited hours, 2) Regulation: Stocks are heavily regulated, crypto less so, 3) Ownership: Stocks represent company ownership, crypto represents digital assets or network tokens, 4) Volatility: Crypto is typically more volatile, 5) Settlement: Crypto transactions can be instant, stock settlements take days, 6) Custody: You can self-custody crypto with private keys, stocks held by brokers.',
                    },
                  },
                  {
                    '@type': 'Question',
                    name: 'What is Bitcoin and why is it valuable?',
                    acceptedAnswer: {
                      '@type': 'Answer',
                      text: 'Bitcoin (BTC) is a decentralized digital currency created in 2009 by Satoshi Nakamoto. It operates without a central bank or single administrator. Bitcoin is valuable because: 1) Limited supply (21 million max), 2) Decentralization and censorship resistance, 3) Global accessibility, 4) Transparency through blockchain, 5) Security through cryptography, 6) Growing institutional adoption, 7) Store of value properties (digital gold), 8) Network effects and first-mover advantage.',
                    },
                  },
                  {
                    '@type': 'Question',
                    name: 'What is Ethereum and smart contracts?',
                    acceptedAnswer: {
                      '@type': 'Answer',
                      text: 'Ethereum (ETH) is a blockchain platform that enables smart contracts and decentralized applications (dApps). Smart contracts are self-executing programs that automatically enforce agreements when conditions are met. Ethereum powers DeFi (decentralized finance), NFTs, DAOs, and thousands of tokens. It\'s transitioning to Proof of Stake for greater efficiency and scalability. Ethereum\'s programmability makes it the foundation for Web3 innovation.',
                    },
                  },
                  {
                    '@type': 'Question',
                    name: 'How do I store cryptocurrency safely?',
                    acceptedAnswer: {
                      '@type': 'Answer',
                      text: 'Safe cryptocurrency storage options: 1) Hardware wallets (Ledger, Trezor) - most secure for large amounts, 2) Software wallets (MetaMask, Trust Wallet) - convenient for active trading, 3) Exchange wallets - easy but less secure, 4) Paper wallets - offline cold storage, 5) Multi-signature wallets - requires multiple approvals. Best practices: Never share private keys, use strong passwords, enable 2FA, backup recovery phrases, verify addresses carefully, use reputable wallets, store large amounts offline.',
                    },
                  },
                  {
                    '@type': 'Question',
                    name: 'What are the risks of cryptocurrency investing?',
                    acceptedAnswer: {
                      '@type': 'Answer',
                      text: 'Major cryptocurrency risks include: 1) Extreme price volatility and potential total loss, 2) Regulatory uncertainty and potential bans, 3) Security risks (hacking, scams, phishing), 4) Loss of private keys means permanent loss, 5) Market manipulation and pump-and-dump schemes, 6) Technology risks and network failures, 7) Lack of consumer protections, 8) Tax complexity and reporting requirements, 9) Environmental concerns with mining, 10) Competition and obsolescence. Always do thorough research and invest responsibly.',
                    },
                  },
                  {
                    '@type': 'Question',
                    name: 'What is the best cryptocurrency to invest in?',
                    acceptedAnswer: {
                      '@type': 'Answer',
                      text: 'There is no single "best" cryptocurrency - it depends on your goals, risk tolerance, and research. Bitcoin (BTC) is considered the safest and most established. Ethereum (ETH) offers smart contract functionality and DeFi exposure. Other considerations: 1) Market cap and liquidity, 2) Technology and use case, 3) Development team and community, 4) Adoption and partnerships, 5) Tokenomics and supply, 6) Competitive advantages. Diversification across multiple cryptocurrencies can help manage risk. Always conduct thorough due diligence.',
                    },
                  },
                ],
              },
              {
                '@type': 'Article',
                headline: 'Live Cryptocurrency Prices and Market Data',
                description: 'Real-time cryptocurrency prices, market capitalizations, and 24-hour trading data for Bitcoin, Ethereum, and major digital assets.',
                author: {
                  '@type': 'Organization',
                  name: 'Lician',
                },
                publisher: {
                  '@type': 'Organization',
                  name: 'Lician',
                  logo: {
                    '@type': 'ImageObject',
                    url: 'https://lician.com/logo.png',
                  },
                },
                datePublished: new Date().toISOString(),
                dateModified: new Date().toISOString(),
              },
            ],
          }),
        }}
      />

      <main className="min-h-screen bg-background text-foreground">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
          <div className="max-w-[1800px] mx-auto px-6 py-3">
            <div className="flex items-center gap-6">
              <Link href="/" className="flex items-center gap-2 flex-shrink-0">
                <div className="w-9 h-9 bg-foreground rounded-xl flex items-center justify-center">
                  <span className="text-background font-bold text-lg">L</span>
                </div>
                <span className="font-semibold text-lg hidden sm:inline">Lician</span>
              </Link>

              <nav className="flex items-center gap-1">
                <Link
                  href="/dashboard"
                  className="px-4 py-2 text-sm font-medium rounded-lg transition-colors text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                >
                  Market
                </Link>
                <Link
                  href="/crypto"
                  className="px-4 py-2 text-sm font-medium rounded-lg transition-colors bg-green-500 text-white"
                >
                  Crypto
                </Link>
              </nav>
            </div>
          </div>
        </header>

        <div className="max-w-[1800px] mx-auto px-6 py-6">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground">Cryptocurrency Prices</span>
          </nav>

          {/* Hero Section */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Bitcoin className="w-10 h-10 text-orange-500" />
              <h1 className="text-4xl md:text-5xl font-bold">
                Cryptocurrency Prices Today
              </h1>
            </div>
            <p className="text-xl text-muted-foreground max-w-4xl">
              Track real-time prices for Bitcoin, Ethereum, and 50+ cryptocurrencies. Live market data updated every minute with 24-hour price changes and market capitalizations.
            </p>
          </div>

          {/* Market Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-orange-500/10 to-orange-500/5 border-orange-500/20">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Coins className="w-5 h-5 text-orange-500" />
                    <h3 className="text-sm font-medium text-muted-foreground">Total Market Cap</h3>
                  </div>
                </div>
                <p className="text-3xl font-bold">{formatMarketCap(totalMarketCap)}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Across {cryptoPrices.length} cryptocurrencies
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <TrendingUpIcon className="w-5 h-5 text-blue-500" />
                    <h3 className="text-sm font-medium text-muted-foreground">24h Volume</h3>
                  </div>
                </div>
                <p className="text-3xl font-bold">{formatMarketCap(total24hVolume)}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Trading volume across markets
                </p>
              </CardContent>
            </Card>

            <Card className={`bg-gradient-to-br ${avgChange >= 0 ? 'from-green-500/10 to-green-500/5 border-green-500/20' : 'from-red-500/10 to-red-500/5 border-red-500/20'}`}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {avgChange >= 0 ? (
                      <TrendingUp className="w-5 h-5 text-green-500" />
                    ) : (
                      <TrendingDown className="w-5 h-5 text-red-500" />
                    )}
                    <h3 className="text-sm font-medium text-muted-foreground">Market Trend</h3>
                  </div>
                </div>
                <p className={`text-3xl font-bold ${avgChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {avgChange >= 0 ? '+' : ''}{avgChange.toFixed(2)}%
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Average 24h change
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Crypto Prices Table */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Top Cryptocurrencies by Market Cap</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">#</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Name</th>
                      <th className="text-right py-3 px-4 font-medium text-muted-foreground">Price</th>
                      <th className="text-right py-3 px-4 font-medium text-muted-foreground">24h Change</th>
                      <th className="text-right py-3 px-4 font-medium text-muted-foreground">Market Cap</th>
                      <th className="text-right py-3 px-4 font-medium text-muted-foreground">Volume (24h)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cryptoPrices.map((crypto, index) => (
                      <tr
                        key={crypto.symbol}
                        className="border-b border-border/50 hover:bg-secondary/30 transition-colors"
                      >
                        <td className="py-4 px-4 text-muted-foreground">{index + 1}</td>
                        <td className="py-4 px-4">
                          <div>
                            <div className="font-semibold">{crypto.name}</div>
                            <div className="text-sm text-muted-foreground">{crypto.symbol}</div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-right font-mono font-semibold">
                          {formatPrice(crypto.price)}
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className={`flex items-center justify-end gap-1 ${
                            crypto.changePercent24h >= 0 ? 'text-green-500' : 'text-red-500'
                          }`}>
                            {crypto.changePercent24h >= 0 ? (
                              <TrendingUp className="w-4 h-4" />
                            ) : (
                              <TrendingDown className="w-4 h-4" />
                            )}
                            <span className="font-semibold">
                              {crypto.changePercent24h >= 0 ? '+' : ''}
                              {crypto.changePercent24h.toFixed(2)}%
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-right font-mono">
                          {formatMarketCap(crypto.marketCap)}
                        </td>
                        <td className="py-4 px-4 text-right font-mono text-muted-foreground">
                          {formatMarketCap(crypto.volume24h)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Educational Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Bitcoin className="w-6 h-6 text-orange-500" />
                  <CardTitle>What is Bitcoin?</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  <strong className="text-foreground">Bitcoin (BTC)</strong> is the world's first cryptocurrency, created in 2009 by the pseudonymous Satoshi Nakamoto. It operates on a decentralized peer-to-peer network, enabling direct transactions without intermediaries.
                </p>
                <p className="text-muted-foreground">
                  Bitcoin has a fixed supply of 21 million coins, making it a deflationary asset often compared to digital gold. It uses blockchain technology to ensure transparency and security through cryptographic proof.
                </p>
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="p-4 bg-secondary/30 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Market Dominance</p>
                    <p className="text-xl font-bold">~40-50%</p>
                  </div>
                  <div className="p-4 bg-secondary/30 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Max Supply</p>
                    <p className="text-xl font-bold">21M BTC</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Coins className="w-6 h-6 text-purple-500" />
                  <CardTitle>What is Ethereum?</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  <strong className="text-foreground">Ethereum (ETH)</strong> is a decentralized blockchain platform that enables smart contracts and decentralized applications (dApps). Created by Vitalik Buterin in 2015, it's the foundation of decentralized finance (DeFi) and NFTs.
                </p>
                <p className="text-muted-foreground">
                  Ethereum transitioned to Proof of Stake in 2022, making it more energy-efficient. The platform powers thousands of tokens and applications, from decentralized exchanges to lending protocols and digital collectibles.
                </p>
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="p-4 bg-secondary/30 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Smart Contracts</p>
                    <p className="text-xl font-bold">1000s+</p>
                  </div>
                  <div className="p-4 bg-secondary/30 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Network Type</p>
                    <p className="text-xl font-bold">Proof of Stake</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Investment Guide */}
          <Card className="mb-8 bg-gradient-to-br from-green-500/5 to-blue-500/5 border-green-500/20">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="w-6 h-6 text-green-500" />
                <CardTitle>Cryptocurrency Investment Guide</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center text-white font-bold">
                      1
                    </div>
                    <h3 className="font-semibold">Research First</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Understand blockchain technology, read whitepapers, and research the team behind each project. Never invest based on hype alone.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold">
                      2
                    </div>
                    <h3 className="font-semibold">Start Small</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Begin with established cryptocurrencies like Bitcoin and Ethereum. Only invest what you can afford to lose completely.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center text-white font-bold">
                      3
                    </div>
                    <h3 className="font-semibold">Secure Storage</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Use hardware wallets for large amounts. Enable two-factor authentication and never share your private keys or seed phrases.
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-orange-500" />
                  Key Considerations
                </h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 mt-0.5 text-green-500 flex-shrink-0" />
                    <span><strong className="text-foreground">Volatility:</strong> Crypto prices can fluctuate 10-20% or more in a single day</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 mt-0.5 text-green-500 flex-shrink-0" />
                    <span><strong className="text-foreground">Diversification:</strong> Don't put all your capital into one cryptocurrency</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 mt-0.5 text-green-500 flex-shrink-0" />
                    <span><strong className="text-foreground">Long-term perspective:</strong> Consider dollar-cost averaging to reduce timing risk</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 mt-0.5 text-green-500 flex-shrink-0" />
                    <span><strong className="text-foreground">Tax implications:</strong> Keep records of all transactions for tax reporting</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 mt-0.5 text-green-500 flex-shrink-0" />
                    <span><strong className="text-foreground">Scam awareness:</strong> Be cautious of promises of guaranteed returns or "get rich quick" schemes</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Market Analysis */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center gap-2">
                <LineChart className="w-6 h-6 text-blue-500" />
                <CardTitle>Understanding Crypto Markets</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg">Market Cycles</h3>
                  <p className="text-sm text-muted-foreground">
                    Cryptocurrency markets move in cycles, often influenced by Bitcoin halving events (approximately every 4 years), regulatory news, institutional adoption, and broader economic conditions. Understanding these cycles can help with long-term investment strategies.
                  </p>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold text-lg">Key Metrics</h3>
                  <p className="text-sm text-muted-foreground">
                    <strong>Market Cap:</strong> Total value of all coins in circulation. <strong>Volume:</strong> Amount traded in 24h, indicating liquidity. <strong>Circulating Supply:</strong> Number of coins currently available. <strong>24h Change:</strong> Price movement over the last day.
                  </p>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold text-lg">Risk Factors</h3>
                  <p className="text-sm text-muted-foreground">
                    Cryptocurrency investing carries significant risks including extreme volatility, regulatory uncertainty, security vulnerabilities, and potential total loss. Unlike traditional assets, crypto lacks government insurance and consumer protections.
                  </p>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold text-lg">Due Diligence</h3>
                  <p className="text-sm text-muted-foreground">
                    Research the project's use case, technology, team, tokenomics, competition, and community. Check if the code is open-source, review the roadmap, and verify partnerships. Avoid projects with anonymous teams or unrealistic promises.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* FAQs */}
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions About Cryptocurrency</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <details className="group">
                  <summary className="flex items-center justify-between cursor-pointer font-semibold text-lg py-2">
                    What is the current Bitcoin price?
                    <ChevronRight className="w-5 h-5 group-open:rotate-90 transition-transform" />
                  </summary>
                  <p className="text-muted-foreground mt-2 pl-2">
                    Bitcoin (BTC) is currently trading at {cryptoPrices.find(c => c.symbol === 'BTC') ? formatPrice(cryptoPrices.find(c => c.symbol === 'BTC')!.price) : 'loading'}. Bitcoin is the world's first and largest cryptocurrency by market capitalization, operating on a decentralized peer-to-peer network. Prices are updated in real-time from multiple exchanges.
                  </p>
                </details>

                <details className="group">
                  <summary className="flex items-center justify-between cursor-pointer font-semibold text-lg py-2 border-t border-border pt-4">
                    What is the current Ethereum price?
                    <ChevronRight className="w-5 h-5 group-open:rotate-90 transition-transform" />
                  </summary>
                  <p className="text-muted-foreground mt-2 pl-2">
                    Ethereum (ETH) is currently trading at {cryptoPrices.find(c => c.symbol === 'ETH') ? formatPrice(cryptoPrices.find(c => c.symbol === 'ETH')!.price) : 'loading'}. Ethereum is the leading smart contract platform and the second-largest cryptocurrency by market cap. It enables decentralized applications, DeFi protocols, and NFTs.
                  </p>
                </details>

                <details className="group">
                  <summary className="flex items-center justify-between cursor-pointer font-semibold text-lg py-2 border-t border-border pt-4">
                    How do I invest in cryptocurrency?
                    <ChevronRight className="w-5 h-5 group-open:rotate-90 transition-transform" />
                  </summary>
                  <div className="text-muted-foreground mt-2 pl-2 space-y-2">
                    <p>To invest in cryptocurrency, follow these steps:</p>
                    <ol className="list-decimal list-inside space-y-1 ml-2">
                      <li>Choose a reputable cryptocurrency exchange (Coinbase, Binance, Kraken)</li>
                      <li>Create and verify your account with KYC documents</li>
                      <li>Deposit funds via bank transfer, debit card, or wire transfer</li>
                      <li>Research cryptocurrencies and understand their fundamentals</li>
                      <li>Start with major cryptocurrencies like Bitcoin or Ethereum</li>
                      <li>Use secure storage solutions (hardware wallet for large amounts)</li>
                      <li>Never invest more than you can afford to lose</li>
                      <li>Consider dollar-cost averaging to reduce volatility risk</li>
                    </ol>
                  </div>
                </details>

                <details className="group">
                  <summary className="flex items-center justify-between cursor-pointer font-semibold text-lg py-2 border-t border-border pt-4">
                    What is cryptocurrency market cap?
                    <ChevronRight className="w-5 h-5 group-open:rotate-90 transition-transform" />
                  </summary>
                  <p className="text-muted-foreground mt-2 pl-2">
                    Cryptocurrency market capitalization is calculated by multiplying the current price by the circulating supply of coins. For example, if a cryptocurrency has 10 million coins in circulation and trades at $100, its market cap is $1 billion. Market cap is used to rank cryptocurrencies by size and gives investors an idea of a project's relative value and adoption.
                  </p>
                </details>

                <details className="group">
                  <summary className="flex items-center justify-between cursor-pointer font-semibold text-lg py-2 border-t border-border pt-4">
                    Is cryptocurrency a good investment?
                    <ChevronRight className="w-5 h-5 group-open:rotate-90 transition-transform" />
                  </summary>
                  <p className="text-muted-foreground mt-2 pl-2">
                    Cryptocurrency can be a high-risk, high-reward investment. While some investors have seen significant returns, crypto markets are highly volatile and unpredictable. Before investing: research thoroughly, understand blockchain technology, only invest what you can afford to lose, diversify your portfolio, and consider your risk tolerance and investment timeline. Cryptocurrencies are speculative assets and not suitable for everyone.
                  </p>
                </details>

                <details className="group">
                  <summary className="flex items-center justify-between cursor-pointer font-semibold text-lg py-2 border-t border-border pt-4">
                    What affects cryptocurrency prices?
                    <ChevronRight className="w-5 h-5 group-open:rotate-90 transition-transform" />
                  </summary>
                  <div className="text-muted-foreground mt-2 pl-2">
                    <p className="mb-2">Cryptocurrency prices are influenced by multiple factors:</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>Supply and demand dynamics in the market</li>
                      <li>Regulatory news and government policies</li>
                      <li>Adoption by institutions, merchants, and users</li>
                      <li>Technological developments and network upgrades</li>
                      <li>Market sentiment and media coverage</li>
                      <li>Macro economic factors and inflation rates</li>
                      <li>Security breaches or exchange hacks</li>
                      <li>Competition from other cryptocurrencies</li>
                      <li>Mining difficulty and costs (for PoW coins)</li>
                      <li>Overall market trends and Bitcoin dominance</li>
                    </ul>
                  </div>
                </details>

                <details className="group">
                  <summary className="flex items-center justify-between cursor-pointer font-semibold text-lg py-2 border-t border-border pt-4">
                    How is crypto different from stocks?
                    <ChevronRight className="w-5 h-5 group-open:rotate-90 transition-transform" />
                  </summary>
                  <div className="text-muted-foreground mt-2 pl-2">
                    <p className="mb-2">Key differences between cryptocurrency and stocks:</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li><strong>Trading hours:</strong> Crypto trades 24/7/365, stocks have limited hours</li>
                      <li><strong>Regulation:</strong> Stocks are heavily regulated, crypto regulation varies by country</li>
                      <li><strong>Ownership:</strong> Stocks represent company ownership, crypto represents digital assets or network tokens</li>
                      <li><strong>Volatility:</strong> Cryptocurrency is typically much more volatile</li>
                      <li><strong>Settlement:</strong> Crypto transactions can be instant, stock settlements take 1-2 days</li>
                      <li><strong>Custody:</strong> You can self-custody crypto with private keys, stocks are held by brokers</li>
                      <li><strong>Dividends:</strong> Some stocks pay dividends, some crypto offers staking rewards</li>
                    </ul>
                  </div>
                </details>

                <details className="group">
                  <summary className="flex items-center justify-between cursor-pointer font-semibold text-lg py-2 border-t border-border pt-4">
                    What is Bitcoin and why is it valuable?
                    <ChevronRight className="w-5 h-5 group-open:rotate-90 transition-transform" />
                  </summary>
                  <div className="text-muted-foreground mt-2 pl-2">
                    <p className="mb-2">Bitcoin is a decentralized digital currency created in 2009 by Satoshi Nakamoto. It operates without a central bank or single administrator. Bitcoin is valuable because of:</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>Limited supply - only 21 million BTC will ever exist</li>
                      <li>Decentralization and censorship resistance</li>
                      <li>Global accessibility - anyone can use it</li>
                      <li>Transparency through blockchain technology</li>
                      <li>Security through cryptographic proof</li>
                      <li>Growing institutional and corporate adoption</li>
                      <li>Store of value properties (often called "digital gold")</li>
                      <li>Network effects and first-mover advantage</li>
                    </ul>
                  </div>
                </details>

                <details className="group">
                  <summary className="flex items-center justify-between cursor-pointer font-semibold text-lg py-2 border-t border-border pt-4">
                    What is Ethereum and smart contracts?
                    <ChevronRight className="w-5 h-5 group-open:rotate-90 transition-transform" />
                  </summary>
                  <p className="text-muted-foreground mt-2 pl-2">
                    Ethereum is a blockchain platform that enables smart contracts and decentralized applications (dApps). Smart contracts are self-executing programs that automatically enforce agreements when predefined conditions are met, without intermediaries. Ethereum powers DeFi (decentralized finance), NFTs (non-fungible tokens), DAOs (decentralized autonomous organizations), and thousands of tokens. It transitioned to Proof of Stake in 2022 for greater efficiency and scalability. Ethereum's programmability makes it the foundation for Web3 innovation.
                  </p>
                </details>

                <details className="group">
                  <summary className="flex items-center justify-between cursor-pointer font-semibold text-lg py-2 border-t border-border pt-4">
                    How do I store cryptocurrency safely?
                    <ChevronRight className="w-5 h-5 group-open:rotate-90 transition-transform" />
                  </summary>
                  <div className="text-muted-foreground mt-2 pl-2">
                    <p className="mb-2">Safe cryptocurrency storage options:</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li><strong>Hardware wallets</strong> (Ledger, Trezor) - Most secure for large amounts, stores keys offline</li>
                      <li><strong>Software wallets</strong> (MetaMask, Trust Wallet) - Convenient for active trading and dApps</li>
                      <li><strong>Exchange wallets</strong> - Easy to use but less secure, only for small amounts</li>
                      <li><strong>Paper wallets</strong> - Offline cold storage by printing keys</li>
                      <li><strong>Multi-signature wallets</strong> - Requires multiple approvals for transactions</li>
                    </ul>
                    <p className="mt-3 mb-2">Best practices:</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>Never share private keys or seed phrases with anyone</li>
                      <li>Use strong, unique passwords and enable 2FA</li>
                      <li>Backup recovery phrases securely (offline, multiple locations)</li>
                      <li>Verify addresses carefully before sending transactions</li>
                      <li>Use reputable wallets from official sources</li>
                      <li>Store large amounts offline in cold storage</li>
                    </ul>
                  </div>
                </details>

                <details className="group">
                  <summary className="flex items-center justify-between cursor-pointer font-semibold text-lg py-2 border-t border-border pt-4">
                    What are the risks of cryptocurrency investing?
                    <ChevronRight className="w-5 h-5 group-open:rotate-90 transition-transform" />
                  </summary>
                  <div className="text-muted-foreground mt-2 pl-2">
                    <p className="mb-2">Major cryptocurrency risks include:</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>Extreme price volatility - prices can drop 50%+ in short periods</li>
                      <li>Regulatory uncertainty - governments may ban or restrict crypto</li>
                      <li>Security risks - hacking, scams, phishing attacks</li>
                      <li>Loss of private keys means permanent, irreversible loss of funds</li>
                      <li>Market manipulation and pump-and-dump schemes</li>
                      <li>Technology risks - bugs, network failures, 51% attacks</li>
                      <li>Lack of consumer protections and insurance</li>
                      <li>Tax complexity and reporting requirements</li>
                      <li>Environmental concerns with energy-intensive mining</li>
                      <li>Competition and risk of obsolescence</li>
                    </ul>
                    <p className="mt-3">Always do thorough research and invest responsibly. Consider consulting with a financial advisor.</p>
                  </div>
                </details>

                <details className="group">
                  <summary className="flex items-center justify-between cursor-pointer font-semibold text-lg py-2 border-t border-border pt-4">
                    What is the best cryptocurrency to invest in?
                    <ChevronRight className="w-5 h-5 group-open:rotate-90 transition-transform" />
                  </summary>
                  <div className="text-muted-foreground mt-2 pl-2">
                    <p className="mb-2">There is no single "best" cryptocurrency - it depends on your investment goals, risk tolerance, and thorough research. However, some considerations:</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li><strong>Bitcoin (BTC)</strong> - Most established, largest market cap, often considered "digital gold"</li>
                      <li><strong>Ethereum (ETH)</strong> - Leading smart contract platform, powers DeFi and NFTs</li>
                      <li><strong>Large-cap altcoins</strong> - BNB, SOL, ADA offer different use cases with more risk/reward</li>
                    </ul>
                    <p className="mt-3 mb-2">When evaluating cryptocurrencies, consider:</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>Market cap and liquidity</li>
                      <li>Technology and real-world use case</li>
                      <li>Development team and community</li>
                      <li>Adoption and partnerships</li>
                      <li>Tokenomics and supply schedule</li>
                      <li>Competitive advantages and moat</li>
                    </ul>
                    <p className="mt-3">Diversification across multiple cryptocurrencies can help manage risk. Always conduct thorough due diligence before investing.</p>
                  </div>
                </details>
              </div>
            </CardContent>
          </Card>

          {/* Related Links */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Related Resources</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link
                  href="/dashboard"
                  className="p-4 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors"
                >
                  <h3 className="font-semibold mb-2">Stock Market Dashboard</h3>
                  <p className="text-sm text-muted-foreground">
                    Analyze stocks with financial data and research tools
                  </p>
                </Link>
                <Link
                  href="/dashboard"
                  className="p-4 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors"
                >
                  <h3 className="font-semibold mb-2">Portfolio Tracker</h3>
                  <p className="text-sm text-muted-foreground">
                    Track and analyze your investment portfolio
                  </p>
                </Link>
                <Link
                  href="/dashboard"
                  className="p-4 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors"
                >
                  <h3 className="font-semibold mb-2">Market News</h3>
                  <p className="text-sm text-muted-foreground">
                    Stay updated with latest financial market news
                  </p>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Disclaimer */}
          <div className="mt-8 p-6 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">Disclaimer:</strong> Cryptocurrency prices are highly volatile and subject to market risks. The information provided is for educational purposes only and should not be considered financial advice. Always conduct your own research and consider consulting with a qualified financial advisor before making investment decisions. Past performance is not indicative of future results. You may lose all or part of your investment.
            </p>
          </div>
        </div>
      </main>
    </>
  )
}
