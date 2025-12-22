import { Metadata } from 'next'
import Link from 'next/link'
import { SITE_URL } from '@/lib/seo'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { FAQSchema, BreadcrumbSchema, ArticleSchema, HowToSchema } from '@/components/seo/StructuredData'

export const metadata: Metadata = {
  title: 'Technical Analysis Guide: Chart Patterns, Indicators & Trading Strategies (2025)',
  description: 'Master technical analysis with our complete guide. Learn chart patterns, RSI, MACD, moving averages, support & resistance, candlestick patterns, and how to read stock charts like a pro.',
  keywords: [
    'technical analysis',
    'stock charts',
    'chart patterns',
    'moving averages',
    'RSI indicator',
    'MACD',
    'support and resistance',
    'candlestick patterns',
    'Bollinger Bands',
    'how to read stock charts',
    'technical indicators',
    'trading strategies',
  ],
  openGraph: {
    title: 'Complete Technical Analysis Guide - Chart Patterns & Indicators',
    description: 'Learn technical analysis from basics to advanced. Master chart patterns, RSI, MACD, and trading strategies.',
    type: 'article',
    url: `${SITE_URL}/learn/technical-analysis`,
  },
  alternates: {
    canonical: `${SITE_URL}/learn/technical-analysis`,
  },
}

const howToSteps = [
  {
    name: 'Identify the Trend',
    text: 'Start by determining the overall trend using moving averages and trendlines. Is the stock in an uptrend (higher highs and higher lows), downtrend (lower highs and lower lows), or range-bound? The trend is your friend - trade in the direction of the primary trend for higher probability setups.',
  },
  {
    name: 'Find Support and Resistance Levels',
    text: 'Identify key support (price floor where buying pressure exceeds selling) and resistance (price ceiling where selling exceeds buying) levels using previous highs/lows, moving averages, and round numbers. These levels often act as entry/exit points and stop-loss placement zones.',
  },
  {
    name: 'Recognize Chart Patterns',
    text: 'Look for continuation patterns (flags, pennants, triangles) or reversal patterns (head and shoulders, double tops/bottoms). Patterns provide context about likely future price direction and help time entries and exits with better precision.',
  },
  {
    name: 'Apply Technical Indicators',
    text: 'Use indicators to confirm your analysis: RSI for overbought/oversold conditions, MACD for momentum and trend changes, Bollinger Bands for volatility and mean reversion. Never rely on one indicator alone - look for confluence of multiple signals.',
  },
  {
    name: 'Analyze Volume',
    text: 'Volume confirms price movements. Price increases on high volume are more reliable than low-volume rallies. Breakouts above resistance or below support should be accompanied by volume spikes. Declining volume during a trend suggests weakening momentum.',
  },
  {
    name: 'Plan Your Trade',
    text: 'Define your entry point, stop-loss (risk management), and profit target before entering. Use technical levels to set stops (below support for longs, above resistance for shorts). Calculate position size based on your risk tolerance. Never risk more than 1-2% of capital per trade.',
  },
]

const chartPatterns = [
  {
    name: 'Head and Shoulders',
    type: 'Reversal',
    description: 'Bearish reversal pattern with three peaks - a higher peak (head) between two lower peaks (shoulders). Break below the neckline confirms the pattern with a measured move equal to the height of the head.',
    reliability: 'High',
  },
  {
    name: 'Inverse Head and Shoulders',
    type: 'Reversal',
    description: 'Bullish reversal pattern - mirror image of head and shoulders. Three troughs with middle trough (head) lower than shoulders. Break above neckline signals bullish reversal.',
    reliability: 'High',
  },
  {
    name: 'Double Top',
    type: 'Reversal',
    description: 'Bearish reversal pattern forming two peaks at approximately the same level. Break below support between the peaks confirms the pattern. Common after extended uptrends.',
    reliability: 'Medium-High',
  },
  {
    name: 'Double Bottom',
    type: 'Reversal',
    description: 'Bullish reversal pattern with two troughs at similar levels. Break above resistance between troughs confirms pattern. Often signals end of downtrend.',
    reliability: 'Medium-High',
  },
  {
    name: 'Ascending Triangle',
    type: 'Continuation (Bullish)',
    description: 'Bullish pattern with flat top resistance and rising support. Buyers increasingly aggressive, eventually break through resistance. Higher volume on breakout confirms.',
    reliability: 'Medium',
  },
  {
    name: 'Descending Triangle',
    type: 'Continuation (Bearish)',
    description: 'Bearish pattern with flat bottom support and descending resistance. Sellers increasingly aggressive. Break below support on high volume confirms bearish continuation.',
    reliability: 'Medium',
  },
  {
    name: 'Symmetrical Triangle',
    type: 'Continuation',
    description: 'Consolidation pattern with converging trendlines. Typically continues prior trend. Direction of breakout (up or down) determines trade direction. Wait for breakout confirmation.',
    reliability: 'Medium',
  },
  {
    name: 'Cup and Handle',
    type: 'Continuation (Bullish)',
    description: 'Bullish continuation pattern. "Cup" is rounded bottom, "handle" is small consolidation. Break above handle resistance signals continuation of uptrend.',
    reliability: 'High',
  },
  {
    name: 'Bull Flag / Pennant',
    type: 'Continuation (Bullish)',
    description: 'Short-term consolidation (flag/pennant) after strong move up (pole). Typically breaks higher, continuing the uptrend. High-probability pattern in strong trends.',
    reliability: 'High',
  },
  {
    name: 'Bear Flag / Pennant',
    type: 'Continuation (Bearish)',
    description: 'Brief consolidation after sharp decline. Pattern slopes against downtrend before breaking lower. Reliable in strong downtrends with high volume.',
    reliability: 'High',
  },
]

const indicators = [
  {
    name: 'Relative Strength Index (RSI)',
    purpose: 'Momentum - Overbought/Oversold',
    how: 'RSI measures momentum on 0-100 scale. Above 70 = overbought (potential reversal down), below 30 = oversold (potential reversal up). Divergence between price and RSI signals trend weakness.',
    settings: '14-period is standard',
    usage: 'Look for oversold bounces in uptrends, overbought reversals in downtrends. Divergence (price makes new high, RSI doesn\'t) warns of reversal.',
  },
  {
    name: 'Moving Average Convergence Divergence (MACD)',
    purpose: 'Trend Following - Momentum',
    how: 'MACD = difference between 12-day and 26-day EMA. Signal line = 9-day EMA of MACD. Histogram shows distance between MACD and signal. Crossovers generate buy/sell signals.',
    settings: '12, 26, 9 (standard)',
    usage: 'MACD crossing above signal = bullish, below = bearish. Histogram expanding shows strengthening momentum. Divergence signals potential reversals.',
  },
  {
    name: 'Bollinger Bands',
    purpose: 'Volatility - Mean Reversion',
    how: 'Middle band = 20-day SMA. Upper/lower bands = 2 standard deviations. Bands widen in high volatility, narrow in low volatility. Price tends to mean-revert to middle band.',
    settings: '20-period, 2 std dev',
    usage: 'Price at upper band = potentially overbought, lower band = oversold. Squeeze (narrow bands) often precedes big moves. Walk the band in strong trends.',
  },
  {
    name: 'Moving Averages (SMA/EMA)',
    purpose: 'Trend Identification - Support/Resistance',
    how: 'SMA = simple average. EMA = exponential average (more weight to recent prices). Price above MA = uptrend, below = downtrend. MAs act as dynamic support/resistance.',
    settings: '20, 50, 200-day common',
    usage: 'Golden cross (50 > 200) = bullish, death cross (50 < 200) = bearish. Use as trailing stops. Multiple MA alignment confirms trend strength.',
  },
  {
    name: 'Volume',
    purpose: 'Confirmation - Strength',
    how: 'Number of shares traded. High volume = strong conviction, low volume = weak. Volume should confirm price moves. Increasing volume in trend = healthy, decreasing = weakening.',
    settings: 'Compare to average volume',
    usage: 'Breakouts need volume. Volume precedes price (accumulation/distribution). Volume divergence warns of reversals.',
  },
  {
    name: 'Stochastic Oscillator',
    purpose: 'Momentum - Overbought/Oversold',
    how: 'Compares closing price to price range over period. %K line (fast) and %D line (slow). Above 80 = overbought, below 20 = oversold. Crossovers generate signals.',
    settings: '14, 3, 3 (standard)',
    usage: 'Look for %K crossing above %D in oversold zone (buy) or below in overbought (sell). Works best in ranging markets.',
  },
]

const candlestickPatterns = [
  {
    name: 'Doji',
    signal: 'Indecision / Potential Reversal',
    description: 'Open and close nearly equal. Long wicks show indecision. At tops = potential reversal down, at bottoms = potential reversal up. Requires confirmation.',
  },
  {
    name: 'Hammer / Inverted Hammer',
    signal: 'Bullish Reversal',
    description: 'Small body, long lower wick (hammer) or upper wick (inverted). Found at bottoms. Shows rejection of lower prices and potential reversal higher.',
  },
  {
    name: 'Shooting Star / Hanging Man',
    signal: 'Bearish Reversal',
    description: 'Small body, long upper wick (shooting star) or lower wick (hanging man) at tops. Shows rejection of higher prices and potential reversal lower.',
  },
  {
    name: 'Bullish Engulfing',
    signal: 'Bullish Reversal',
    description: 'Small red candle followed by large green candle that "engulfs" prior candle. Shows strong buying pressure overwhelming sellers. High-probability reversal.',
  },
  {
    name: 'Bearish Engulfing',
    signal: 'Bearish Reversal',
    description: 'Small green candle followed by large red candle engulfing it. Strong selling overwhelms buyers. Reliable reversal pattern at tops.',
  },
  {
    name: 'Morning Star / Evening Star',
    signal: 'Strong Reversal',
    description: 'Three-candle pattern. Morning star (bullish): down candle, small-body indecision, strong up candle. Evening star (bearish): reverse. Very reliable.',
  },
]

const faqs = [
  {
    question: 'What is technical analysis and how does it work?',
    answer: 'Technical analysis is the study of historical price and volume data to forecast future price movements. It\'s based on the idea that price reflects all available information and that history tends to repeat as market psychology remains consistent. Technical analysts use charts, patterns, and indicators to identify trends, support/resistance levels, and trading opportunities. Unlike fundamental analysis (which values companies), technical analysis focuses purely on price action.',
  },
  {
    question: 'How do you read stock charts?',
    answer: 'Start by identifying the trend (uptrend, downtrend, or range). Look at timeframes from daily to weekly to monthly for context. Identify support (where price bounces) and resistance (where price stalls). Recognize chart patterns like triangles, head and shoulders, or flags. Apply indicators like RSI or MACD for confirmation. Analyze volume to confirm price moves. Candlestick patterns provide additional insights on short-term sentiment.',
  },
  {
    question: 'What is the RSI indicator and how do you use it?',
    answer: 'RSI (Relative Strength Index) measures momentum on a 0-100 scale. Above 70 indicates overbought conditions (potential to reverse down), below 30 indicates oversold (potential to reverse up). However, in strong trends, RSI can stay overbought/oversold for extended periods. The best signals come from divergence: if price makes a new high but RSI doesn\'t, momentum is weakening and a reversal may be coming. Use RSI in conjunction with other indicators for confirmation.',
  },
  {
    question: 'What is MACD and how does it work?',
    answer: 'MACD (Moving Average Convergence Divergence) shows the relationship between two moving averages. It consists of the MACD line (12-day EMA minus 26-day EMA), signal line (9-day EMA of MACD), and histogram (distance between MACD and signal). When MACD crosses above the signal line, it generates a bullish signal. Below = bearish. The histogram shows momentum strength. MACD works best in trending markets and can lag in choppy conditions.',
  },
  {
    question: 'What are support and resistance levels?',
    answer: 'Support is a price level where buying pressure exceeds selling pressure, creating a "floor" where price bounces. Resistance is where selling exceeds buying, creating a "ceiling" where price stalls. These levels form at previous highs/lows, moving averages, round numbers, or psychological levels. When price breaks through resistance, it often becomes new support (and vice versa). Stronger levels have multiple touches, high volume, and psychological significance.',
  },
  {
    question: 'What are the most reliable chart patterns?',
    answer: 'Head and shoulders (reversal) and cup and handle (continuation) are among the most reliable, especially with volume confirmation. Bull/bear flags in strong trends have high success rates. Double tops/bottoms are reliable at extremes. Triangles can be effective but need breakout confirmation. Pattern reliability improves with: (1) longer timeframes (daily+ better than intraday), (2) volume confirmation on breakout, (3) multiple timeframe alignment, (4) clean, well-formed patterns. No pattern is 100% reliable - always use stop losses.',
  },
  {
    question: 'How do moving averages work?',
    answer: 'Moving averages smooth price data to identify trends. Simple Moving Average (SMA) is the average price over X periods. Exponential Moving Average (EMA) gives more weight to recent prices. Common periods: 20-day (short-term), 50-day (medium-term), 200-day (long-term). Price above MA = uptrend, below = downtrend. MAs act as dynamic support/resistance. Golden cross (50-day crosses above 200-day) is bullish, death cross (below) is bearish. Use multiple MAs to confirm trend strength.',
  },
  {
    question: 'What is the difference between technical and fundamental analysis?',
    answer: 'Fundamental analysis values companies based on financial statements, earnings, cash flows, and economic factors to determine intrinsic value. Technical analysis studies price charts and patterns to predict future movements regardless of underlying value. Fundamentals answer "what to buy," technicals answer "when to buy/sell." Long-term investors often prefer fundamentals, traders prefer technicals. The best approach combines both: use fundamentals to find quality companies, technicals to time entry/exit.',
  },
  {
    question: 'What are Bollinger Bands and how are they used?',
    answer: 'Bollinger Bands consist of a middle band (20-day SMA) and upper/lower bands (2 standard deviations from middle). They measure volatility and potential overbought/oversold conditions. When bands narrow (squeeze), volatility is low and a big move is coming. When price touches upper band, it may be overbought; lower band = oversold. However, in strong trends, price can "walk the band." Use with RSI or other indicators for confirmation. Bollinger Band bounces work best in range-bound markets.',
  },
  {
    question: 'How important is volume in technical analysis?',
    answer: 'Volume is critical for confirmation. Price moves on high volume are more reliable than low volume. Key principles: (1) Volume should increase in direction of trend (up-volume in uptrends), (2) Breakouts need volume spikes to be valid, (3) Volume precedes price - accumulation (high volume at lows) or distribution (high volume at highs) signals future moves, (4) Decreasing volume in trend = weakening momentum. Always analyze volume alongside price action.',
  },
  {
    question: 'What are candlestick patterns?',
    answer: 'Candlestick patterns show price action within a specific period. Each candle displays open, high, low, close. The body (open to close) and wicks (high/low) reveal sentiment. Key patterns: Doji (indecision), hammer (bullish reversal), shooting star (bearish reversal), engulfing patterns (strong reversals), morning/evening star (major reversals). Candlesticks work best on daily+ timeframes and need confirmation from next candle or volume. They provide early signals of sentiment shifts.',
  },
  {
    question: 'Can technical analysis predict stock prices?',
    answer: 'Technical analysis doesn\'t predict exact prices but estimates probability and direction. It identifies high-probability setups based on historical patterns and market psychology. Success depends on proper risk management, confirmation from multiple indicators, and accepting that no setup is 100% reliable. Professional traders use technical analysis for entries/exits while managing risk with stop losses. It works best combined with fundamental analysis and proper position sizing. Expect 50-60% win rate with proper risk/reward ratios.',
  },
  {
    question: 'What timeframe should I use for technical analysis?',
    answer: 'Timeframe depends on your trading style: Day traders use 1-5 minute charts, swing traders use hourly to daily, investors use daily to weekly. Always analyze multiple timeframes - use higher timeframe (weekly/monthly) for overall trend, intermediate (daily) for entry timing, and lower (hourly) for precise entry. Longer timeframes are more reliable and have less noise. Start with daily charts until you master the basics. Signals that align across multiple timeframes have higher probability of success.',
  },
]

const exampleStocks = [
  { ticker: 'AAPL', name: 'Apple', why: 'Clear trends and respect for technical levels' },
  { ticker: 'TSLA', name: 'Tesla', why: 'High volatility perfect for technical setups' },
  { ticker: 'SPY', name: 'S&P 500 ETF', why: 'Most liquid, reliable technical patterns' },
  { ticker: 'NVDA', name: 'NVIDIA', why: 'Strong trends and momentum trading' },
]

export default function TechnicalAnalysisPage() {
  const pageUrl = `${SITE_URL}/learn/technical-analysis`

  return (
    <>
      <Header />

      {/* Structured Data for SEO */}
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: SITE_URL },
          { name: 'Learn', url: `${SITE_URL}/learn` },
          { name: 'Technical Analysis', url: pageUrl },
        ]}
      />
      <ArticleSchema
        headline="Complete Technical Analysis Guide: Chart Patterns, Indicators & Trading Strategies"
        description="Comprehensive guide to technical analysis including chart patterns, RSI, MACD, moving averages, and candlestick patterns."
        url={pageUrl}
        keywords={['technical analysis', 'chart patterns', 'RSI', 'MACD', 'support resistance', 'candlestick patterns']}
      />
      <HowToSchema
        name="How to Use Technical Analysis for Trading"
        description="Step-by-step guide to analyzing stock charts using technical analysis."
        steps={howToSteps}
      />
      <FAQSchema faqs={faqs} />
      <main className="min-h-screen bg-background text-foreground pt-20">
        <div className="max-w-4xl mx-auto px-6 py-12">
          {/* Breadcrumbs */}
          <nav className="text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-foreground">Home</Link>
            {' / '}
            <Link href="/learn" className="hover:text-foreground">Learn</Link>
            {' / '}
            <span>Technical Analysis</span>
          </nav>

          {/* Hero */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold mb-4">
              Complete Technical Analysis Guide
            </h1>
            <p className="text-xl text-muted-foreground">
              Master technical analysis from basics to advanced. Learn chart patterns, indicators like RSI and MACD,
              support and resistance, candlestick patterns, and how to read stock charts like professional traders.
            </p>
          </div>

          {/* What is Technical Analysis */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-4">What is Technical Analysis?</h2>
            <p className="text-muted-foreground mb-4">
              Technical analysis is the study of historical price and volume data to forecast future price movements.
              Unlike fundamental analysis that evaluates a company's financial health and intrinsic value, technical
              analysis focuses exclusively on price charts, patterns, and indicators.
            </p>
            <p className="text-muted-foreground mb-4">
              Technical analysis is built on three core principles:
            </p>
            <div className="bg-card p-6 rounded-xl border border-border space-y-4">
              <div>
                <h3 className="font-bold mb-2 text-green-500">1. Price Discounts Everything</h3>
                <p className="text-sm text-muted-foreground">
                  All information - fundamentals, news, sentiment - is already reflected in the stock price.
                  You don't need to analyze earnings; the market has already priced it in.
                </p>
              </div>
              <div>
                <h3 className="font-bold mb-2 text-green-500">2. Price Moves in Trends</h3>
                <p className="text-sm text-muted-foreground">
                  Stocks tend to trend rather than move randomly. Once a trend is established, it's more likely
                  to continue than reverse. "The trend is your friend."
                </p>
              </div>
              <div>
                <h3 className="font-bold mb-2 text-green-500">3. History Tends to Repeat</h3>
                <p className="text-sm text-muted-foreground">
                  Market psychology remains consistent. Patterns that worked in the past tend to work in the future
                  because human behavior around fear and greed is predictable.
                </p>
              </div>
            </div>
          </section>

          {/* How to Do Technical Analysis */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">How to Do Technical Analysis: Step-by-Step</h2>
            <div className="space-y-6">
              {howToSteps.map((step, index) => (
                <div key={index} className="bg-card p-6 rounded-xl border border-border">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-lg">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">{step.name}</h3>
                      <p className="text-muted-foreground">{step.text}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Chart Patterns */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Essential Chart Patterns</h2>
            <p className="text-muted-foreground mb-6">
              Chart patterns are formations created by price movements that tend to produce predictable outcomes.
              Patterns are classified as reversal (trend change) or continuation (trend continues).
            </p>
            <div className="space-y-4">
              {chartPatterns.map((pattern, index) => (
                <div key={index} className="bg-card p-6 rounded-xl border border-border">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-bold">{pattern.name}</h3>
                    <div className="flex gap-2">
                      <span className={`text-xs px-3 py-1 rounded-full ${
                        pattern.type.includes('Bullish') ? 'bg-green-500/20 text-green-500' :
                        pattern.type.includes('Bearish') ? 'bg-red-500/20 text-red-500' :
                        pattern.type === 'Reversal' ? 'bg-orange-500/20 text-orange-500' :
                        'bg-blue-500/20 text-blue-500'
                      }`}>
                        {pattern.type}
                      </span>
                      <span className={`text-xs px-3 py-1 rounded-full ${
                        pattern.reliability === 'High' ? 'bg-green-500/20 text-green-500' :
                        'bg-yellow-500/20 text-yellow-500'
                      }`}>
                        {pattern.reliability} Reliability
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{pattern.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Technical Indicators */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Key Technical Indicators Explained</h2>
            <p className="text-muted-foreground mb-6">
              Technical indicators use mathematical calculations on price and volume to generate trading signals.
              Never rely on one indicator alone - use multiple indicators for confirmation.
            </p>
            <div className="space-y-6">
              {indicators.map((indicator, index) => (
                <div key={index} className="bg-card p-6 rounded-xl border border-border">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-bold text-green-500">{indicator.name}</h3>
                    <span className="text-xs bg-blue-500/20 text-blue-500 px-3 py-1 rounded-full">
                      {indicator.purpose}
                    </span>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-bold mb-1">How It Works:</p>
                      <p className="text-sm text-muted-foreground">{indicator.how}</p>
                    </div>
                    <div>
                      <p className="text-sm font-bold mb-1">Settings:</p>
                      <p className="text-sm text-muted-foreground">{indicator.settings}</p>
                    </div>
                    <div>
                      <p className="text-sm font-bold mb-1">How to Use:</p>
                      <p className="text-sm text-muted-foreground">{indicator.usage}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Support and Resistance */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Support and Resistance: Foundation of Technical Analysis</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-card p-6 rounded-xl border border-border">
                <h3 className="text-xl font-bold mb-3 text-green-500">Support Levels</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Support is a price level where buying pressure exceeds selling pressure, creating a "floor"
                  that prevents price from falling further. Buyers believe the stock is undervalued at this level.
                </p>
                <div className="space-y-2 text-sm">
                  <p className="font-bold">How to Identify:</p>
                  <ul className="text-muted-foreground space-y-1 ml-4">
                    <li>• Previous lows where price bounced</li>
                    <li>• Moving averages (especially 50/200-day)</li>
                    <li>• Round numbers ($50, $100)</li>
                    <li>• Fibonacci retracement levels</li>
                    <li>• Previous resistance becomes support</li>
                  </ul>
                </div>
              </div>

              <div className="bg-card p-6 rounded-xl border border-border">
                <h3 className="text-xl font-bold mb-3 text-red-500">Resistance Levels</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Resistance is a price level where selling pressure exceeds buying pressure, creating a "ceiling"
                  that prevents price from rising further. Sellers believe the stock is overvalued.
                </p>
                <div className="space-y-2 text-sm">
                  <p className="font-bold">How to Identify:</p>
                  <ul className="text-muted-foreground space-y-1 ml-4">
                    <li>• Previous highs where price stalled</li>
                    <li>• Moving averages in downtrends</li>
                    <li>• Round numbers and psychological levels</li>
                    <li>• Fibonacci extension levels</li>
                    <li>• Previous support becomes resistance</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6">
              <h4 className="font-bold mb-2">Support/Resistance Trading Strategy</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Buy near support with stop below support. Sell near resistance or when support breaks.
                Breakouts above resistance (with volume) often lead to new uptrends. Breakdowns below
                support signal potential downtrends.
              </p>
              <p className="text-sm text-muted-foreground">
                <span className="font-bold">Key Principle:</span> When resistance is broken, it often becomes
                new support (and vice versa). This role reversal is a critical concept in technical analysis.
              </p>
            </div>
          </section>

          {/* Volume Analysis */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Volume Analysis: Confirmation is Key</h2>
            <p className="text-muted-foreground mb-6">
              Volume is the number of shares traded. It confirms the strength of price movements and validates
              patterns. The saying goes: "Volume precedes price" - smart money accumulates or distributes before
              major moves.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-card p-6 rounded-xl border border-border">
                <h3 className="text-lg font-bold mb-3 text-green-500">High Volume Signals</h3>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li className="flex gap-2">
                    <span>•</span>
                    <span><span className="font-bold">Breakouts:</span> Volume spike confirms breakout validity</span>
                  </li>
                  <li className="flex gap-2">
                    <span>•</span>
                    <span><span className="font-bold">Trend Strength:</span> Increasing volume in trend direction = healthy</span>
                  </li>
                  <li className="flex gap-2">
                    <span>•</span>
                    <span><span className="font-bold">Reversals:</span> High volume at tops/bottoms signals capitulation</span>
                  </li>
                  <li className="flex gap-2">
                    <span>•</span>
                    <span><span className="font-bold">Conviction:</span> Strong moves with volume are more reliable</span>
                  </li>
                </ul>
              </div>

              <div className="bg-card p-6 rounded-xl border border-border">
                <h3 className="text-lg font-bold mb-3 text-red-500">Low Volume Warnings</h3>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li className="flex gap-2">
                    <span>•</span>
                    <span><span className="font-bold">Weak Breakouts:</span> Low-volume breakouts often fail</span>
                  </li>
                  <li className="flex gap-2">
                    <span>•</span>
                    <span><span className="font-bold">Trend Weakness:</span> Declining volume = losing momentum</span>
                  </li>
                  <li className="flex gap-2">
                    <span>•</span>
                    <span><span className="font-bold">False Signals:</span> Price moves without volume lack conviction</span>
                  </li>
                  <li className="flex gap-2">
                    <span>•</span>
                    <span><span className="font-bold">Caution:</span> Trade carefully in low liquidity conditions</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Candlestick Patterns */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Candlestick Patterns</h2>
            <p className="text-muted-foreground mb-6">
              Candlestick charts display open, high, low, and close for each period. Patterns reveal market
              psychology and provide early reversal or continuation signals.
            </p>
            <div className="bg-card p-6 rounded-xl border border-border mb-6">
              <h3 className="text-lg font-bold mb-4">Understanding Candlesticks</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-bold mb-2 text-green-500">Bullish Candle (Green/White)</p>
                  <p className="text-muted-foreground">
                    Close above open. Body = difference between open/close. Upper wick = high above close.
                    Lower wick = low below open. Larger body = stronger conviction.
                  </p>
                </div>
                <div>
                  <p className="font-bold mb-2 text-red-500">Bearish Candle (Red/Black)</p>
                  <p className="text-muted-foreground">
                    Close below open. Body shows selling pressure. Long upper wick = rejection of higher prices.
                    Long lower wick = some buying support. Size matters - larger bodies show stronger sentiment.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {candlestickPatterns.map((pattern, index) => (
                <div key={index} className="bg-card p-6 rounded-xl border border-border">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-bold">{pattern.name}</h3>
                    <span className={`text-xs px-3 py-1 rounded-full ${
                      pattern.signal.includes('Bullish') ? 'bg-green-500/20 text-green-500' :
                      pattern.signal.includes('Bearish') ? 'bg-red-500/20 text-red-500' :
                      'bg-yellow-500/20 text-yellow-500'
                    }`}>
                      {pattern.signal}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{pattern.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Technical vs Fundamental */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Technical vs Fundamental Analysis</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-card p-6 rounded-xl border border-border">
                <h3 className="text-xl font-bold mb-4 text-green-500">Technical Analysis</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Studies price charts, patterns, and indicators to predict future price movements.
                  Focuses on WHEN to buy/sell.
                </p>
                <div className="space-y-2 text-sm">
                  <p className="font-bold">Best For:</p>
                  <ul className="text-muted-foreground space-y-1 ml-4">
                    <li>• Short-term trading (day/swing trading)</li>
                    <li>• Timing entries and exits</li>
                    <li>• Risk management (stop losses)</li>
                    <li>• Identifying trends and momentum</li>
                    <li>• Quick decision making</li>
                  </ul>
                </div>
              </div>

              <div className="bg-card p-6 rounded-xl border border-border">
                <h3 className="text-xl font-bold mb-4 text-blue-500">Fundamental Analysis</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Analyzes company financials, earnings, competitive position to determine intrinsic value.
                  Focuses on WHAT to buy.
                </p>
                <div className="space-y-2 text-sm">
                  <p className="font-bold">Best For:</p>
                  <ul className="text-muted-foreground space-y-1 ml-4">
                    <li>• Long-term investing</li>
                    <li>• Identifying undervalued companies</li>
                    <li>• Understanding business quality</li>
                    <li>• Value and growth investing</li>
                    <li>• Building conviction for holds</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-500/10 to-blue-500/10 p-6 rounded-xl border border-green-500/20 mt-6">
              <h4 className="font-bold mb-2">The Best Approach: Combine Both</h4>
              <p className="text-sm text-muted-foreground">
                Professional investors use fundamental analysis to identify quality companies with strong prospects,
                then use technical analysis to time optimal entry points. Fundamentals tell you WHAT to buy,
                technicals tell you WHEN. For example: identify a fundamentally strong company trading below
                intrinsic value, then wait for technical confirmation (break above resistance, oversold bounce,
                bullish pattern) before buying.
              </p>
            </div>
          </section>

          {/* Practice Stocks */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Practice Technical Analysis with Live Charts</h2>
            <p className="text-muted-foreground mb-6">
              Apply technical analysis to these liquid, technically-responsive stocks:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {exampleStocks.map((stock) => (
                <Link
                  key={stock.ticker}
                  href={`/stock/${stock.ticker}`}
                  className="bg-card p-4 rounded-xl border border-border hover:border-green-500/50 transition-all group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-lg group-hover:text-green-500 transition-colors">
                      {stock.ticker}
                    </span>
                    <span className="text-xs text-green-500">View Chart →</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">{stock.name}</p>
                  <p className="text-xs text-muted-foreground">{stock.why}</p>
                </Link>
              ))}
            </div>
          </section>

          {/* Common Mistakes */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Common Technical Analysis Mistakes</h2>
            <div className="space-y-4">
              <div className="bg-card p-6 rounded-xl border border-red-500/20">
                <h3 className="font-bold mb-2 text-red-500">Relying on One Indicator</h3>
                <p className="text-muted-foreground">
                  No single indicator is perfect. RSI can stay overbought for weeks in strong uptrends. MACD
                  can lag in fast markets. Always use multiple indicators for confirmation and understand
                  their limitations in different market conditions.
                </p>
              </div>
              <div className="bg-card p-6 rounded-xl border border-red-500/20">
                <h3 className="font-bold mb-2 text-red-500">Ignoring the Trend</h3>
                <p className="text-muted-foreground">
                  "The trend is your friend" - fighting the trend is costly. Don't short just because RSI
                  is overbought if the trend is strongly up. Don't buy oversold conditions in downtrends.
                  Trade WITH the trend for higher probability.
                </p>
              </div>
              <div className="bg-card p-6 rounded-xl border border-red-500/20">
                <h3 className="font-bold mb-2 text-red-500">No Risk Management</h3>
                <p className="text-muted-foreground">
                  Even the best technical setup can fail. Always use stop losses placed at logical levels
                  (below support, above resistance). Risk no more than 1-2% of capital per trade. Perfect
                  pattern recognition means nothing without proper position sizing.
                </p>
              </div>
              <div className="bg-card p-6 rounded-xl border border-red-500/20">
                <h3 className="font-bold mb-2 text-red-500">Overtrading Low-Probability Setups</h3>
                <p className="text-muted-foreground">
                  Not every pattern is worth trading. Wait for high-quality setups with multiple confirmations:
                  clean pattern, volume confirmation, trend alignment, indicator confluence. Quality over
                  quantity - better to trade 2-3 excellent setups than 10 mediocre ones.
                </p>
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-card p-6 rounded-xl border border-border">
                  <h3 className="text-lg font-bold mb-3">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-br from-green-500/10 to-blue-500/10 p-8 rounded-xl border border-green-500/20 text-center">
            <h2 className="text-2xl font-bold mb-4">
              Advanced Stock Charts with Technical Indicators
            </h2>
            <p className="text-muted-foreground mb-6">
              Access professional-grade charts with all major indicators (RSI, MACD, Bollinger Bands, Moving Averages),
              pattern recognition, and real-time data. Practice technical analysis with institutional-quality tools.
            </p>
            <Link
              href="/dashboard"
              className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium transition-colors"
            >
              View Live Stock Charts
            </Link>
          </section>
        </div>
      </main>
      <Footer />
    </>
  )
}
