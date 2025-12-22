import { Metadata } from 'next'
import Link from 'next/link'
import {
  getBreadcrumbSchema,
  getArticleSchema,
  getFAQSchema,
  getHowToSchema,
  SITE_URL,
} from '@/lib/seo'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

export const metadata: Metadata = {
  title: 'How AI Analyzes Stocks: Machine Learning for Stock Analysis (2025)',
  description: 'Learn how AI and machine learning analyze stocks. Discover sentiment analysis, pattern recognition, and how AI processes thousands of data points for investment insights.',
  keywords: [
    'AI stock analysis',
    'machine learning stocks',
    'AI investing',
    'algorithmic stock analysis',
    'AI stock picker',
    'sentiment analysis stocks',
    'how AI analyzes stocks',
  ],
  openGraph: {
    title: 'How AI Analyzes Stocks - Machine Learning for Investment Analysis',
    description: 'Discover how artificial intelligence revolutionizes stock analysis with sentiment analysis, pattern recognition, and data processing.',
    type: 'article',
    url: `${SITE_URL}/learn/ai-stock-analysis`,
  },
  alternates: {
    canonical: `${SITE_URL}/learn/ai-stock-analysis`,
  },
}

const howAIWorks = [
  {
    name: 'Data Ingestion & Processing',
    text: 'AI systems ingest thousands of data points: financial statements (10-K, 10-Q), SEC filings, earnings transcripts, news articles, analyst reports, social media sentiment, macroeconomic indicators, and alternative data. Natural Language Processing (NLP) extracts insights from unstructured text that humans would take days to read.',
  },
  {
    name: 'Pattern Recognition',
    text: 'Machine learning models identify patterns across decades of historical data: price movements before earnings beats, sector rotation signals, insider trading patterns, institutional accumulation, and correlation breakdowns. AI recognizes complex multi-variable patterns humans can\'t easily spot.',
  },
  {
    name: 'Sentiment Analysis',
    text: 'AI analyzes sentiment from earnings calls, news headlines, analyst reports, and social media. NLP models detect tone shifts (optimistic to pessimistic), identify key topics (product launches, cost cutting), and quantify sentiment scores. Changes in management tone often precede stock moves.',
  },
  {
    name: 'Financial Statement Analysis',
    text: 'AI automatically extracts and analyzes financial metrics: revenue trends, margin expansion, cash flow quality, working capital efficiency, and unusual accounting entries. It compares to peers, historical performance, and industry benchmarks - processing in seconds what takes analysts hours.',
  },
  {
    name: 'Valuation & Price Prediction',
    text: 'AI models calculate intrinsic value using DCF analysis with various scenarios, apply relative valuation metrics, analyze price-to-fundamentals relationships, and generate price targets with probability distributions. Machine learning improves predictions by learning from past forecast accuracy.',
  },
  {
    name: 'Risk Assessment',
    text: 'AI identifies risks by analyzing debt covenants, regulatory filings, litigation mentions, customer concentration, supply chain dependencies, and competitive threats. It quantifies risk scores and highlights material changes that warrant attention.',
  },
]

const aiCapabilities = [
  {
    capability: 'Speed',
    description: 'Analyzes 1,000+ stocks in seconds vs hours for humans',
    icon: '⚡',
  },
  {
    capability: 'Scale',
    description: 'Processes decades of data across all markets simultaneously',
    icon: '📊',
  },
  {
    capability: 'Objectivity',
    description: 'No emotional bias, anchoring, or confirmation bias',
    icon: '🎯',
  },
  {
    capability: 'Pattern Recognition',
    description: 'Identifies complex multi-variable patterns invisible to humans',
    icon: '🔍',
  },
  {
    capability: 'Continuous Learning',
    description: 'Improves predictions by learning from outcomes',
    icon: '🧠',
  },
  {
    capability: 'Real-time Updates',
    description: 'Instantly incorporates new data and events',
    icon: '⚙️',
  },
]

const limitations = [
  {
    limitation: 'Black Swan Events',
    description: 'AI struggles with unprecedented events outside training data (pandemics, wars, regulatory shocks)',
  },
  {
    limitation: 'Qualitative Factors',
    description: 'Difficulty assessing management integrity, culture, or strategic vision without quantifiable data',
  },
  {
    limitation: 'Overfitting',
    description: 'Models may find spurious patterns in historical data that don\'t predict future performance',
  },
  {
    limitation: 'Data Quality',
    description: 'Garbage in, garbage out - AI is only as good as the data it receives',
  },
]

const faqs = [
  {
    question: 'How does AI analyze stocks?',
    answer: 'AI analyzes stocks by processing vast amounts of data including financial statements, SEC filings, earnings transcripts, news articles, and market data. Machine learning models identify patterns, calculate valuations, assess sentiment, and generate insights. Natural Language Processing extracts information from text, while statistical models identify correlations and predict outcomes. AI can analyze thousands of stocks simultaneously, finding opportunities humans might miss.',
  },
  {
    question: 'What is sentiment analysis in stock investing?',
    answer: 'Sentiment analysis uses Natural Language Processing to analyze text (news, earnings calls, social media) and determine if sentiment is positive, negative, or neutral. For stocks, AI analyzes CEO tone in earnings calls, news article sentiment, analyst report language, and social media discussions. Sentiment shifts often precede price movements. For example, increasingly negative management commentary may signal deteriorating business conditions before they show up in financial results.',
  },
  {
    question: 'Can AI predict stock prices?',
    answer: 'AI can make probabilistic predictions about stock price direction and ranges, but cannot predict exact prices with certainty. Machine learning models analyze historical patterns, fundamentals, sentiment, and technical factors to generate price targets with confidence intervals. AI predictions improve over time by learning from outcomes. However, markets are influenced by unpredictable events (news, policy changes, black swans) that even advanced AI cannot forecast. Use AI as one input, not the sole decision driver.',
  },
  {
    question: 'Is AI better than human stock analysts?',
    answer: 'AI and humans excel at different tasks. AI advantages: speed (analyze thousands of stocks instantly), scale (process decades of data), objectivity (no emotional bias), pattern recognition (identify complex correlations). Human advantages: qualitative judgment (management assessment), contextual understanding (industry dynamics), adaptability (react to unprecedented situations), skepticism (question AI outputs). The best approach combines AI data processing with human judgment and domain expertise.',
  },
  {
    question: 'What data does AI use for stock analysis?',
    answer: 'AI uses multiple data sources: (1) Fundamental data - financial statements, ratios, cash flows, (2) Market data - prices, volume, volatility, correlations, (3) Alternative data - satellite images, web traffic, credit card transactions, (4) Text data - SEC filings, earnings transcripts, news, social media, (5) Macroeconomic data - GDP, inflation, interest rates, (6) Institutional data - 13F filings, insider trades. More diverse data improves predictions.',
  },
  {
    question: 'How does Lician use AI for stock analysis?',
    answer: 'Lician\'s AI analyzes financial statements to extract key metrics, calculates DCF valuations with multiple scenarios, analyzes sentiment from earnings transcripts and news, identifies similar companies and competitive positioning, generates investment theses highlighting opportunities and risks, and monitors thousands of stocks for anomalies and opportunities. Our AI handles time-consuming data processing, letting you focus on decision-making. All analysis is transparent and explainable.',
  },
  {
    question: 'What is machine learning in stock investing?',
    answer: 'Machine learning enables computers to learn patterns from data without explicit programming. For stocks, ML models train on historical data (prices, fundamentals, news) to identify patterns that preceded price movements. The model learns relationships like "earnings beats + revenue guidance raise + positive sentiment = average 8% price increase over 3 months." As the model processes more data and outcomes, predictions improve. Common ML techniques: regression models, random forests, neural networks, and ensemble methods.',
  },
  {
    question: 'Are there risks to AI-driven investing?',
    answer: 'Yes. Risks include: (1) Overfitting - finding patterns in noise that don\'t generalize, (2) Black swans - AI struggles with unprecedented events, (3) Herding - if many use similar AI, market impact changes dynamics, (4) Flash crashes - algorithmic trading can amplify volatility, (5) Overconfidence - blindly trusting AI without understanding limitations. Mitigate by combining AI with human judgment, understanding how models work, diversifying strategies, and maintaining healthy skepticism.',
  },
]

export default function AIStockAnalysisPage() {
  const pageUrl = `${SITE_URL}/learn/ai-stock-analysis`

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Learn', url: `${SITE_URL}/learn` },
    { name: 'AI Stock Analysis', url: pageUrl },
  ])

  const articleSchema = getArticleSchema({
    headline: 'How AI Analyzes Stocks: Machine Learning for Investment Analysis',
    description: 'Comprehensive guide to how artificial intelligence and machine learning analyze stocks, process data, and generate investment insights.',
    url: pageUrl,
    keywords: ['AI stock analysis', 'machine learning investing', 'sentiment analysis', 'algorithmic trading', 'AI investing'],
  })

  const howToSchema = getHowToSchema({
    name: 'How AI Analyzes Stocks',
    description: 'Understanding the process AI uses to analyze stocks from data ingestion to insights generation.',
    steps: howAIWorks,
  })

  const faqSchema = getFAQSchema(faqs)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([breadcrumbSchema, articleSchema, howToSchema, faqSchema]),
        }}
      />
      <Header />
      <main className="min-h-screen bg-background text-foreground pt-20">
        <div className="max-w-4xl mx-auto px-6 py-12">
          {/* Breadcrumbs */}
          <nav className="text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-foreground">Home</Link>
            {' / '}
            <Link href="/learn" className="hover:text-foreground">Learn</Link>
            {' / '}
            <span>AI Stock Analysis</span>
          </nav>

          {/* Hero */}
          <div className="mb-12">
            <div className="inline-block px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-sm font-medium mb-4">
              Exclusive to Lician
            </div>
            <h1 className="text-4xl font-bold mb-4">
              How AI Analyzes Stocks
            </h1>
            <p className="text-xl text-muted-foreground">
              Discover how artificial intelligence and machine learning revolutionize stock analysis by processing
              vast amounts of data, identifying patterns, and generating insights in seconds that would take humans days.
            </p>
          </div>

          {/* What is AI Stock Analysis */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-4">What is AI Stock Analysis?</h2>
            <p className="text-muted-foreground mb-4">
              AI stock analysis uses machine learning, natural language processing, and statistical models to evaluate
              investment opportunities. Unlike traditional analysis limited by human time and cognitive bandwidth, AI
              can simultaneously analyze thousands of stocks, process decades of data, and identify complex patterns
              invisible to human analysts.
            </p>
            <div className="bg-gradient-to-br from-green-500/10 to-blue-500/10 p-6 rounded-xl border border-green-500/20">
              <h3 className="text-lg font-bold mb-3">The AI Advantage</h3>
              <p className="text-sm text-muted-foreground mb-3">
                A skilled analyst might deeply analyze 50-100 stocks per year, reading hundreds of pages of filings,
                transcripts, and reports for each. AI can analyze 10,000+ stocks daily, processing millions of data
                points, identifying emerging trends, and highlighting opportunities requiring human investigation.
              </p>
              <p className="text-sm text-muted-foreground">
                AI doesn't replace human judgment - it amplifies it by handling data-intensive tasks, freeing analysts
                to focus on qualitative assessment, strategic thinking, and final decisions.
              </p>
            </div>
          </section>

          {/* How AI Works */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">How AI Analyzes Stocks: The Process</h2>
            <div className="space-y-6">
              {howAIWorks.map((step, index) => (
                <div key={index} className="bg-card p-6 rounded-xl border border-border">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-green-500 to-blue-500 text-white rounded-full flex items-center justify-center font-bold text-lg">
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

          {/* AI Capabilities */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">What Makes AI Powerful for Stock Analysis</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {aiCapabilities.map((item) => (
                <div key={item.capability} className="bg-card p-6 rounded-xl border border-border">
                  <div className="text-4xl mb-3">{item.icon}</div>
                  <h3 className="text-lg font-bold mb-2">{item.capability}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Specific AI Techniques */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">AI Techniques for Stock Analysis</h2>
            <div className="space-y-6">
              <div className="bg-card p-6 rounded-xl border border-border">
                <h3 className="text-xl font-bold mb-3 text-green-500">Natural Language Processing (NLP)</h3>
                <p className="text-muted-foreground mb-3">
                  NLP enables AI to read and understand text like earnings transcripts, SEC filings, news articles, and
                  analyst reports. It extracts key information (revenue guidance, cost initiatives, risks), analyzes
                  sentiment (optimistic vs pessimistic tone), identifies topics (product launches, lawsuits), and
                  detects changes over time.
                </p>
                <div className="bg-background p-4 rounded text-sm">
                  <span className="font-bold">Example:</span> AI analyzes 50 quarterly transcripts to detect that
                  management mentions "supply chain" 3x more frequently this quarter, with increasingly negative
                  sentiment - a potential red flag.
                </div>
              </div>

              <div className="bg-card p-6 rounded-xl border border-border">
                <h3 className="text-xl font-bold mb-3 text-blue-500">Time Series Analysis</h3>
                <p className="text-muted-foreground mb-3">
                  AI models analyze historical price and volume data to identify trends, cycles, support/resistance
                  levels, and anomalies. Statistical techniques like ARIMA, GARCH, and recurrent neural networks
                  model temporal patterns and predict future movements with confidence intervals.
                </p>
                <div className="bg-background p-4 rounded text-sm">
                  <span className="font-bold">Example:</span> AI identifies that a stock historically rallies 6%
                  on average in the two weeks before earnings, with this pattern holding 73% of the time over 20 quarters.
                </div>
              </div>

              <div className="bg-card p-6 rounded-xl border border-border">
                <h3 className="text-xl font-bold mb-3 text-purple-500">Ensemble Methods</h3>
                <p className="text-muted-foreground mb-3">
                  Rather than relying on one model, ensemble methods combine multiple models (fundamental, technical,
                  sentiment, macroeconomic) to generate more robust predictions. If models disagree significantly, it
                  signals high uncertainty requiring caution.
                </p>
                <div className="bg-background p-4 rounded text-sm">
                  <span className="font-bold">Example:</span> Fundamental model says "buy" (low P/E), sentiment model
                  says "sell" (negative news), technical model is neutral. Ensemble flags this as high uncertainty,
                  suggesting more research needed.
                </div>
              </div>

              <div className="bg-card p-6 rounded-xl border border-border">
                <h3 className="text-xl font-bold mb-3 text-orange-500">Anomaly Detection</h3>
                <p className="text-muted-foreground mb-3">
                  AI identifies unusual patterns: sudden volume spikes, unexpected correlation changes, unusual insider
                  trading, accounting anomalies, or divergence between price and fundamentals. Anomalies often precede
                  major moves or signal risks.
                </p>
                <div className="bg-background p-4 rounded text-sm">
                  <span className="font-bold">Example:</span> AI detects that a company's accounts receivable is
                  growing 20% faster than revenue for three consecutive quarters - potentially signaling aggressive
                  revenue recognition or collection issues.
                </div>
              </div>
            </div>
          </section>

          {/* Human vs AI */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">AI vs Human Analysis: The Best Approach</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-card p-6 rounded-xl border border-border">
                <h3 className="text-xl font-bold mb-4 text-green-500">Where AI Excels</h3>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span><span className="font-bold">Data Processing:</span> Analyze thousands of pages instantly</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span><span className="font-bold">Pattern Recognition:</span> Identify complex multi-variable patterns</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span><span className="font-bold">Objectivity:</span> No emotional bias or anchoring</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span><span className="font-bold">Consistency:</span> Apply same criteria uniformly</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span><span className="font-bold">Scale:</span> Monitor entire market simultaneously</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span><span className="font-bold">Speed:</span> Real-time analysis and alerts</span>
                  </li>
                </ul>
              </div>

              <div className="bg-card p-6 rounded-xl border border-border">
                <h3 className="text-xl font-bold mb-4 text-blue-500">Where Humans Excel</h3>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">✓</span>
                    <span><span className="font-bold">Qualitative Assessment:</span> Judge management integrity and vision</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">✓</span>
                    <span><span className="font-bold">Context:</span> Understand industry dynamics and competitive positioning</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">✓</span>
                    <span><span className="font-bold">Adaptability:</span> React to unprecedented situations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">✓</span>
                    <span><span className="font-bold">Skepticism:</span> Question data and challenge assumptions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">✓</span>
                    <span><span className="font-bold">Strategic Thinking:</span> Connect disparate pieces of information</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">✓</span>
                    <span><span className="font-bold">Final Judgment:</span> Make ultimate investment decisions</span>
                  </li>
                </ul>
              </div>
            </div>
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6 mt-6">
              <p className="text-sm font-bold mb-2">The Winning Combination:</p>
              <p className="text-sm text-muted-foreground">
                Use AI for data processing, screening, pattern recognition, and quantitative analysis. Use human
                judgment for qualitative assessment, strategic thinking, risk evaluation, and final decisions.
                AI handles the "what" (facts, patterns), humans handle the "why" and "should we" (context, strategy).
              </p>
            </div>
          </section>

          {/* Limitations */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">AI Limitations in Stock Analysis</h2>
            <p className="text-muted-foreground mb-6">
              Understanding AI limitations is crucial for using it effectively:
            </p>
            <div className="space-y-4">
              {limitations.map((item) => (
                <div key={item.limitation} className="bg-card p-6 rounded-xl border border-orange-500/20">
                  <h3 className="font-bold mb-2 text-orange-500">{item.limitation}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* How Lician Uses AI */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">How Lician Uses AI</h2>
            <div className="bg-gradient-to-br from-green-500/10 to-blue-500/10 p-8 rounded-xl border border-green-500/20">
              <p className="text-muted-foreground mb-6">
                Lician combines AI power with human-centered design to make sophisticated analysis accessible:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-background/50 p-4 rounded-lg">
                  <h4 className="font-bold mb-2 text-green-500">Automated Financial Analysis</h4>
                  <p className="text-sm text-muted-foreground">
                    AI extracts and analyzes financial statements, calculates key metrics, identifies trends,
                    and compares to peers - delivering insights in seconds.
                  </p>
                </div>
                <div className="bg-background/50 p-4 rounded-lg">
                  <h4 className="font-bold mb-2 text-green-500">Intelligent DCF Valuation</h4>
                  <p className="text-sm text-muted-foreground">
                    AI calculates intrinsic value with customizable assumptions, runs sensitivity analysis,
                    and explains valuation drivers clearly.
                  </p>
                </div>
                <div className="bg-background/50 p-4 rounded-lg">
                  <h4 className="font-bold mb-2 text-green-500">Sentiment Analysis</h4>
                  <p className="text-sm text-muted-foreground">
                    NLP analyzes earnings transcripts, news articles, and analyst reports to quantify
                    sentiment and identify tone shifts.
                  </p>
                </div>
                <div className="bg-background/50 p-4 rounded-lg">
                  <h4 className="font-bold mb-2 text-green-500">Pattern Recognition</h4>
                  <p className="text-sm text-muted-foreground">
                    Machine learning identifies similar companies, correlations, historical patterns,
                    and anomalies across thousands of stocks.
                  </p>
                </div>
                <div className="bg-background/50 p-4 rounded-lg">
                  <h4 className="font-bold mb-2 text-green-500">Risk Assessment</h4>
                  <p className="text-sm text-muted-foreground">
                    AI evaluates financial risks, competitive threats, debt sustainability,
                    and regulatory concerns automatically.
                  </p>
                </div>
                <div className="bg-background/50 p-4 rounded-lg">
                  <h4 className="font-bold mb-2 text-green-500">Explainable AI</h4>
                  <p className="text-sm text-muted-foreground">
                    All AI analysis is transparent and explainable - you understand the reasoning
                    behind every insight, not just the conclusion.
                  </p>
                </div>
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

          {/* Continue Learning */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-6">Master the Fundamentals First</h2>
            <p className="text-muted-foreground mb-6">
              AI amplifies your knowledge - master traditional analysis first:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Link
                href="/learn/stock-analysis"
                className="bg-card p-6 rounded-xl border border-border hover:border-green-500/50 transition-all group"
              >
                <h3 className="text-xl font-bold mb-2 group-hover:text-green-500 transition-colors">
                  Stock Analysis Fundamentals
                </h3>
                <p className="text-muted-foreground">
                  Understand financial statements and valuation before leveraging AI.
                </p>
              </Link>
              <Link
                href="/learn/dcf-valuation"
                className="bg-card p-6 rounded-xl border border-border hover:border-green-500/50 transition-all group"
              >
                <h3 className="text-xl font-bold mb-2 group-hover:text-green-500 transition-colors">
                  DCF Valuation
                </h3>
                <p className="text-muted-foreground">
                  Learn the valuation method AI uses to calculate intrinsic value.
                </p>
              </Link>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-br from-green-500/10 via-blue-500/10 to-purple-500/10 p-8 rounded-xl border border-green-500/20 text-center">
            <h2 className="text-2xl font-bold mb-4">
              Experience AI-Powered Stock Analysis
            </h2>
            <p className="text-muted-foreground mb-6">
              See how AI analyzes stocks in seconds. Get comprehensive analysis, valuations, sentiment insights,
              and investment theses for any stock - powered by cutting-edge machine learning.
            </p>
            <Link
              href="/dashboard"
              className="inline-block bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-500 hover:to-blue-500 text-white px-8 py-3 rounded-lg font-medium transition-all"
            >
              Try AI Analysis Free
            </Link>
          </section>
        </div>
      </main>
      <Footer />
    </>
  )
}
