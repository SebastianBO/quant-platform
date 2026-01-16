import { Metadata } from 'next'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { getBreadcrumbSchema, getArticleSchema, getFAQSchema, SITE_URL } from '@/lib/seo'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Stock Order Types Explained | Market, Limit, Stop Orders Guide',
  description: 'Learn about different stock order types: market orders, limit orders, stop-loss orders, stop-limit orders, and trailing stops. Complete guide for beginners.',
  keywords: [
    'stock order types',
    'market order',
    'limit order',
    'stop-loss order',
    'stop-limit order',
    'trailing stop',
    'how to buy stocks',
    'stock trading orders',
    'order execution',
    'bid ask spread'
  ],
  alternates: {
    canonical: `${SITE_URL}/learn/order-types`
  },
  openGraph: {
    title: 'Stock Order Types Explained | Complete Guide',
    description: 'Learn about market orders, limit orders, stop-loss orders, and more.',
    url: `${SITE_URL}/learn/order-types`,
    type: 'article'
  }
}

const orderTypes = [
  {
    name: 'Market Order',
    description: 'An order to buy or sell immediately at the best available price.',
    pros: ['Guaranteed execution', 'Fastest execution', 'Simple to use'],
    cons: ['No price guarantee', 'Can experience slippage', 'Risky in volatile markets'],
    bestFor: 'Highly liquid stocks when execution speed matters more than price',
    example: 'You want to buy AAPL immediately. A market order will buy at whatever price sellers are offering.'
  },
  {
    name: 'Limit Order',
    description: 'An order to buy or sell at a specific price or better.',
    pros: ['Price control', 'No slippage', 'Can get better prices'],
    cons: ['Not guaranteed to execute', 'May miss opportunities', 'Partial fills possible'],
    bestFor: 'Most situations where you want price certainty',
    example: 'AAPL is at $180. You set a limit buy at $175. Order only executes if price drops to $175 or below.'
  },
  {
    name: 'Stop-Loss Order',
    description: 'An order that becomes a market order when the stock reaches a specified price.',
    pros: ['Limits losses automatically', 'No need to monitor constantly', 'Enforces discipline'],
    cons: ['Can trigger on temporary dips', 'Becomes market order (slippage)', 'Gap risk'],
    bestFor: 'Protecting profits or limiting losses on existing positions',
    example: 'You bought AAPL at $180. You set a stop-loss at $170. If price drops to $170, a market sell is triggered.'
  },
  {
    name: 'Stop-Limit Order',
    description: 'A stop order that becomes a limit order instead of a market order.',
    pros: ['Combines stop protection with price control', 'Avoids slippage', 'More precise'],
    cons: ['May not execute in fast markets', 'More complex', 'Gap risk'],
    bestFor: 'When you want stop protection but need price certainty',
    example: 'Set stop at $170, limit at $168. When price hits $170, a limit sell at $168 is placed (not market).'
  },
  {
    name: 'Trailing Stop Order',
    description: 'A stop order that automatically adjusts as the stock price moves in your favor.',
    pros: ['Locks in profits as price rises', 'Automatic adjustment', 'No need to manually update'],
    cons: ['Can be triggered by normal volatility', 'Becomes market order', 'Requires understanding'],
    bestFor: 'Capturing gains while letting winners run',
    example: 'You set a 10% trailing stop on AAPL at $180. If it rises to $200, your stop moves to $180. If it drops 10% from any high, it sells.'
  }
]

const timeInForce = [
  { name: 'Day Order', description: 'Order expires at end of trading day if not filled. Most common default.' },
  { name: 'GTC (Good Till Canceled)', description: 'Order remains active until filled or manually canceled (usually 60-90 days max).' },
  { name: 'IOC (Immediate or Cancel)', description: 'Execute immediately what\'s available, cancel the rest. For urgent partial fills.' },
  { name: 'FOK (Fill or Kill)', description: 'Execute entire order immediately or cancel completely. All or nothing.' },
  { name: 'MOO (Market on Open)', description: 'Execute at market open price. Useful for overnight news reactions.' },
  { name: 'MOC (Market on Close)', description: 'Execute at market close price. Used by index funds for daily rebalancing.' },
  { name: 'Extended Hours', description: 'Allow order to execute during pre-market or after-hours sessions.' }
]

const faqs = [
  {
    question: 'What is the difference between a market order and a limit order?',
    answer: 'A market order executes immediately at the best available price but offers no price guarantee. A limit order only executes at your specified price or better, but may not execute if the price is never reached. Use market orders when execution speed is critical; use limit orders when price control matters more.'
  },
  {
    question: 'What is a stop-loss order and how does it work?',
    answer: 'A stop-loss order automatically sells your stock when it reaches a specified price, helping limit your losses. When the stop price is reached, it becomes a market order and executes at the next available price. For example, if you own a stock at $100 and set a stop-loss at $90, your shares will be sold if the price drops to $90.'
  },
  {
    question: 'Should beginners use market orders or limit orders?',
    answer: 'Beginners should generally use limit orders for most trades. Limit orders give you price control and prevent accidental overpaying in volatile markets. The only time market orders make sense is for highly liquid stocks like Apple or Microsoft when you need immediate execution and don\'t mind small price variations.'
  },
  {
    question: 'What is a trailing stop and when should I use it?',
    answer: 'A trailing stop is a dynamic stop-loss that moves up as your stock price rises but stays fixed when it falls. It helps lock in profits while letting winners run. Use trailing stops when you want to protect gains but don\'t want to exit too early. A common setting is 10-15% below the highest price reached.'
  },
  {
    question: 'What does GTC mean when placing a stock order?',
    answer: 'GTC stands for Good Till Canceled. It means your order will remain active until it executes or you manually cancel it (typically up to 60-90 days depending on your broker). This is useful for limit orders where you want to buy at a lower price and are willing to wait for the opportunity.'
  },
  {
    question: 'What happens if my limit order price is never reached?',
    answer: 'If your limit order price is never reached, the order will not execute. For day orders, it will expire at market close. For GTC orders, it will remain open until canceled or the broker\'s time limit is reached. You can always modify or cancel unfilled limit orders before they expire.'
  }
]

export default function OrderTypesPage() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Learn', url: `${SITE_URL}/learn` },
    { name: 'Order Types', url: `${SITE_URL}/learn/order-types` }
  ])

  const articleSchema = getArticleSchema({
    headline: 'Stock Order Types Explained: Market, Limit, Stop Orders',
    datePublished: '2026-01-01',
    dateModified: '2026-01-16',
    description: 'Complete guide to stock order types including market orders, limit orders, stop-loss orders, and trailing stops.',
    url: `${SITE_URL}/learn/order-types`
  })

  const faqSchema = getFAQSchema(faqs)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([breadcrumbSchema, articleSchema, faqSchema])
        }}
      />
      <Header />
      <main className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-muted/50 to-background py-12">
          <div className="container mx-auto px-4">
            <nav className="text-sm text-muted-foreground mb-4">
              <Link href="/" className="hover:text-primary">Home</Link>
              <span className="mx-2">/</span>
              <Link href="/learn" className="hover:text-primary">Learn</Link>
              <span className="mx-2">/</span>
              <span className="text-foreground">Order Types</span>
            </nav>
            <h1 className="text-4xl font-bold mb-4">
              Stock Order Types Explained
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl">
              Understanding different order types is essential for effective stock trading. Learn when to use market orders, limit orders, stop-loss orders, and more to execute trades the way you want.
            </p>
          </div>
        </section>

        {/* Quick Comparison */}
        <section className="py-12 border-b">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-6">Order Types at a Glance</h2>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-4 font-semibold">Order Type</th>
                    <th className="text-left p-4 font-semibold">Execution</th>
                    <th className="text-left p-4 font-semibold">Price Guarantee</th>
                    <th className="text-left p-4 font-semibold">Best For</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b hover:bg-muted/30">
                    <td className="p-4 font-medium">Market Order</td>
                    <td className="p-4 text-green-400">Guaranteed</td>
                    <td className="p-4 text-red-400">No</td>
                    <td className="p-4 text-muted-foreground">Speed matters most</td>
                  </tr>
                  <tr className="border-b hover:bg-muted/30">
                    <td className="p-4 font-medium">Limit Order</td>
                    <td className="p-4 text-yellow-400">Not Guaranteed</td>
                    <td className="p-4 text-green-400">Yes</td>
                    <td className="p-4 text-muted-foreground">Price matters most</td>
                  </tr>
                  <tr className="border-b hover:bg-muted/30">
                    <td className="p-4 font-medium">Stop-Loss</td>
                    <td className="p-4 text-yellow-400">When triggered</td>
                    <td className="p-4 text-red-400">No</td>
                    <td className="p-4 text-muted-foreground">Limiting losses</td>
                  </tr>
                  <tr className="border-b hover:bg-muted/30">
                    <td className="p-4 font-medium">Stop-Limit</td>
                    <td className="p-4 text-yellow-400">When triggered</td>
                    <td className="p-4 text-green-400">Yes</td>
                    <td className="p-4 text-muted-foreground">Price-controlled exits</td>
                  </tr>
                  <tr className="border-b hover:bg-muted/30">
                    <td className="p-4 font-medium">Trailing Stop</td>
                    <td className="p-4 text-yellow-400">When triggered</td>
                    <td className="p-4 text-red-400">No</td>
                    <td className="p-4 text-muted-foreground">Protecting gains</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Detailed Order Types */}
        <section className="py-12 border-b">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-8">Order Types in Detail</h2>

            <div className="space-y-8">
              {orderTypes.map((order, i) => (
                <div key={i} className="bg-card border rounded-lg p-6">
                  <h3 className="text-xl font-bold mb-3">{order.name}</h3>
                  <p className="text-muted-foreground mb-6">{order.description}</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                    <div>
                      <h4 className="font-semibold text-green-400 mb-2">Advantages</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                        {order.pros.map((pro, j) => (
                          <li key={j}>{pro}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-red-400 mb-2">Disadvantages</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                        {order.cons.map((con, j) => (
                          <li key={j}>{con}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-blue-400 mb-2">Best For</h4>
                      <p className="text-sm text-muted-foreground">{order.bestFor}</p>
                    </div>
                  </div>

                  <div className="bg-muted/50 rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Example</h4>
                    <p className="text-sm text-muted-foreground">{order.example}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Time in Force */}
        <section className="py-12 border-b">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-6">Time in Force Options</h2>
            <p className="text-muted-foreground mb-6">
              Time in force determines how long your order remains active before it expires or is canceled.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {timeInForce.map((tif, i) => (
                <div key={i} className="bg-card border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">{tif.name}</h3>
                  <p className="text-sm text-muted-foreground">{tif.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Market vs Limit Deep Dive */}
        <section className="py-12 border-b">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-6">Market Orders vs Limit Orders</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-6">
                <h3 className="font-semibold text-lg text-green-400 mb-4">When to Use Market Orders</h3>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-green-400">✓</span>
                    <span>Highly liquid stocks (Apple, Microsoft, major ETFs)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400">✓</span>
                    <span>When you need immediate execution</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400">✓</span>
                    <span>During regular market hours</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400">✓</span>
                    <span>When the bid-ask spread is tight</span>
                  </li>
                </ul>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-6">
                <h3 className="font-semibold text-lg text-blue-400 mb-4">When to Use Limit Orders</h3>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400">✓</span>
                    <span>Less liquid stocks with wide bid-ask spreads</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400">✓</span>
                    <span>When price matters more than speed</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400">✓</span>
                    <span>During volatile market conditions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400">✓</span>
                    <span>For extended hours trading</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-8 p-6 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <h3 className="font-semibold text-yellow-400 mb-2">Understanding the Bid-Ask Spread</h3>
              <p className="text-muted-foreground">
                The <strong>bid price</strong> is what buyers are willing to pay. The <strong>ask price</strong> is what sellers are asking. The difference is the spread. Market orders fill at the ask (buying) or bid (selling) immediately. Limit orders let you set your own price but may not fill. Tight spreads (&lt;$0.05) are favorable for market orders; wide spreads favor limit orders.
              </p>
            </div>
          </div>
        </section>

        {/* Stop Orders Deep Dive */}
        <section className="py-12 border-b">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-6">Using Stop Orders for Risk Management</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="font-semibold text-lg mb-4">Setting Stop-Loss Levels</h3>
                <p className="text-muted-foreground mb-4">
                  There&apos;s no one-size-fits-all stop-loss level. Common approaches include:
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li><strong>Percentage-based:</strong> 5-10% below purchase price for swing trades</li>
                  <li><strong>Support levels:</strong> Just below key technical support</li>
                  <li><strong>ATR-based:</strong> 1.5-2x Average True Range below entry</li>
                  <li><strong>Dollar amount:</strong> Based on your maximum risk per trade (1-2% of portfolio)</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-4">Stop Order Pitfalls</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li><strong>Gap risk:</strong> Stocks can gap past your stop price overnight</li>
                  <li><strong>Whipsaws:</strong> Temporary dips can trigger stops before recovery</li>
                  <li><strong>Stop hunting:</strong> Some believe large traders target common stop levels</li>
                  <li><strong>Slippage:</strong> Stop-loss becomes market order, may fill worse than expected</li>
                </ul>
              </div>
            </div>

            <div className="bg-card border rounded-lg p-6">
              <h3 className="font-semibold mb-4">Trailing Stop Strategy Example</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Stock Price</th>
                      <th className="text-left p-2">10% Trailing Stop</th>
                      <th className="text-left p-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="p-2">$100 (buy)</td>
                      <td className="p-2">$90</td>
                      <td className="p-2 text-muted-foreground">Initial stop set</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2">$110</td>
                      <td className="p-2">$99</td>
                      <td className="p-2 text-green-400">Stop moves up</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2">$120</td>
                      <td className="p-2">$108</td>
                      <td className="p-2 text-green-400">Stop moves up</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-2">$115 (drops)</td>
                      <td className="p-2">$108</td>
                      <td className="p-2 text-muted-foreground">Stop stays at $108</td>
                    </tr>
                    <tr>
                      <td className="p-2">$108 (drops)</td>
                      <td className="p-2">-</td>
                      <td className="p-2 text-red-400">TRIGGERED - Sold</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                Result: Bought at $100, sold at ~$108 for +8% gain even though stock dropped. The trailing stop locked in profits as the price rose.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-12 border-b">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-8">Frequently Asked Questions</h2>
            <div className="space-y-6">
              {faqs.map((faq, i) => (
                <div key={i} className="border rounded-lg p-6">
                  <h3 className="font-semibold text-lg mb-3">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Related Resources */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-6">Related Resources</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link href="/learn/how-to-invest" className="block p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h3 className="font-semibold mb-1">How to Invest</h3>
                <p className="text-sm text-muted-foreground">Complete beginner&apos;s guide</p>
              </Link>
              <Link href="/calculators/position-size" className="block p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h3 className="font-semibold mb-1">Position Size Calculator</h3>
                <p className="text-sm text-muted-foreground">Calculate proper position sizes</p>
              </Link>
              <Link href="/learn/day-trading" className="block p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h3 className="font-semibold mb-1">Day Trading Guide</h3>
                <p className="text-sm text-muted-foreground">Active trading strategies</p>
              </Link>
              <Link href="/glossary" className="block p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <h3 className="font-semibold mb-1">Investment Glossary</h3>
                <p className="text-sm text-muted-foreground">Trading terminology defined</p>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
