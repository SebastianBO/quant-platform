import { Metadata } from "next"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { SITE_URL, SITE_NAME } from "@/lib/seo"
import { FileText, BarChart3, DollarSign, TrendingUp, ArrowRight, CheckCircle2, AlertTriangle, Lightbulb, Calculator } from "lucide-react"

export const metadata: Metadata = {
  title: "How to Read Financial Statements: Complete Guide for Investors | Lician",
  description: "Learn how to read and analyze financial statements including income statement, balance sheet, and cash flow statement. Understand key metrics, ratios, and red flags for smarter investing decisions.",
  keywords: [
    "how to read financial statements",
    "financial statement analysis",
    "income statement explained",
    "balance sheet explained",
    "cash flow statement",
    "fundamental analysis",
    "financial ratios",
    "10-K analysis",
    "quarterly earnings"
  ],
  alternates: {
    canonical: `${SITE_URL}/learn/reading-financial-statements`,
  },
  openGraph: {
    title: "How to Read Financial Statements | Complete Investor Guide",
    description: "Master financial statement analysis to make better investment decisions. Learn to read income statements, balance sheets, and cash flow statements.",
    url: `${SITE_URL}/learn/reading-financial-statements`,
    siteName: SITE_NAME,
    type: "article",
  },
}

export default function ReadingFinancialStatementsPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        <article className="max-w-4xl mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-foreground">Home</Link>
            <span>/</span>
            <Link href="/learn" className="hover:text-foreground">Learn</Link>
            <span>/</span>
            <span>Reading Financial Statements</span>
          </nav>

          {/* Header */}
          <header className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              How to Read Financial Statements: A Complete Guide for Investors
            </h1>
            <p className="text-lg text-muted-foreground">
              Financial statements are the foundation of fundamental analysis. Learn to read income statements,
              balance sheets, and cash flow statements to make informed investment decisions.
            </p>
          </header>

          {/* Key Takeaways */}
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 mb-8">
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-primary" />
              Key Takeaways
            </h2>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>The three main financial statements are: Income Statement, Balance Sheet, and Cash Flow Statement</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Revenue growth, profit margins, and cash flow are key metrics to analyze</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Compare metrics over time and against competitors in the same industry</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Red flags include declining margins, rising debt, and negative cash flow</span>
              </li>
            </ul>
          </div>

          {/* The Three Financial Statements */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4">The Three Financial Statements</h2>
            <p className="text-muted-foreground mb-6">
              Public companies are required to file financial statements with the SEC. The three main statements
              provide different views of a company&apos;s financial health:
            </p>

            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="bg-card border border-border rounded-xl p-5">
                <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center mb-3">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
                <h3 className="font-semibold mb-2">Income Statement</h3>
                <p className="text-sm text-muted-foreground">
                  Shows revenue, expenses, and profit over a period. Answers: &quot;Is the company profitable?&quot;
                </p>
              </div>

              <div className="bg-card border border-border rounded-xl p-5">
                <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center mb-3">
                  <BarChart3 className="w-5 h-5 text-blue-500" />
                </div>
                <h3 className="font-semibold mb-2">Balance Sheet</h3>
                <p className="text-sm text-muted-foreground">
                  Shows assets, liabilities, and equity at a point in time. Answers: &quot;What does the company own and owe?&quot;
                </p>
              </div>

              <div className="bg-card border border-border rounded-xl p-5">
                <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center mb-3">
                  <DollarSign className="w-5 h-5 text-purple-500" />
                </div>
                <h3 className="font-semibold mb-2">Cash Flow Statement</h3>
                <p className="text-sm text-muted-foreground">
                  Shows cash movements in/out. Answers: &quot;Where did cash come from and go?&quot;
                </p>
              </div>
            </div>
          </section>

          {/* Income Statement Deep Dive */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <FileText className="w-6 h-6 text-green-500" />
              1. Income Statement (Profit & Loss)
            </h2>
            <p className="text-muted-foreground mb-6">
              The income statement shows how much money a company made (or lost) over a period, typically
              a quarter or year. It starts with revenue and deducts expenses to arrive at net income.
            </p>

            <div className="bg-card border border-border rounded-xl overflow-hidden mb-6">
              <div className="bg-secondary/50 px-4 py-3 font-semibold">
                Income Statement Structure (Top to Bottom)
              </div>
              <div className="divide-y divide-border">
                {[
                  { item: "Revenue (Sales)", desc: "Total money received from selling goods/services", formula: null, color: "text-green-500" },
                  { item: "Cost of Goods Sold (COGS)", desc: "Direct costs to produce goods/services", formula: null, color: "text-red-500" },
                  { item: "Gross Profit", desc: "Revenue minus COGS", formula: "Revenue - COGS", color: "text-blue-500" },
                  { item: "Operating Expenses", desc: "R&D, SG&A, depreciation", formula: null, color: "text-red-500" },
                  { item: "Operating Income (EBIT)", desc: "Profit from core operations", formula: "Gross Profit - OpEx", color: "text-blue-500" },
                  { item: "Interest & Taxes", desc: "Interest expense, income taxes", formula: null, color: "text-red-500" },
                  { item: "Net Income", desc: "The \"bottom line\" - final profit", formula: "EBIT - Interest - Taxes", color: "text-green-600 font-semibold" },
                ].map((row, i) => (
                  <div key={i} className="px-4 py-3 flex items-center justify-between">
                    <div>
                      <span className={`font-medium ${row.color}`}>{row.item}</span>
                      <p className="text-xs text-muted-foreground">{row.desc}</p>
                    </div>
                    {row.formula && (
                      <code className="text-xs bg-secondary px-2 py-1 rounded">{row.formula}</code>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <h3 className="text-lg font-semibold mb-3">Key Income Statement Metrics</h3>
            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              {[
                { name: "Gross Margin", formula: "(Gross Profit / Revenue) × 100", good: "> 30% for most industries" },
                { name: "Operating Margin", formula: "(Operating Income / Revenue) × 100", good: "> 15% is strong" },
                { name: "Net Margin", formula: "(Net Income / Revenue) × 100", good: "> 10% is excellent" },
                { name: "Revenue Growth", formula: "(Current Rev - Prior Rev) / Prior Rev", good: "Growing YoY" },
              ].map((metric, i) => (
                <div key={i} className="bg-secondary/50 rounded-lg p-4">
                  <h4 className="font-medium mb-1">{metric.name}</h4>
                  <code className="text-xs text-muted-foreground block mb-2">{metric.formula}</code>
                  <span className="text-xs text-green-500">{metric.good}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Balance Sheet Deep Dive */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-blue-500" />
              2. Balance Sheet (Financial Position)
            </h2>
            <p className="text-muted-foreground mb-6">
              The balance sheet shows what a company owns (assets), what it owes (liabilities), and the
              difference (shareholders&apos; equity) at a specific point in time. The fundamental equation is:
            </p>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-6 text-center">
              <span className="text-lg font-semibold">Assets = Liabilities + Shareholders&apos; Equity</span>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="bg-card border border-border rounded-xl p-4">
                <h3 className="font-semibold text-green-500 mb-3">Assets (What it owns)</h3>
                <ul className="text-sm space-y-2">
                  <li><strong>Current Assets:</strong> Cash, inventory, receivables (used within 1 year)</li>
                  <li><strong>Non-Current Assets:</strong> Property, equipment, intangibles (long-term)</li>
                </ul>
              </div>

              <div className="bg-card border border-border rounded-xl p-4">
                <h3 className="font-semibold text-red-500 mb-3">Liabilities (What it owes)</h3>
                <ul className="text-sm space-y-2">
                  <li><strong>Current Liabilities:</strong> Payables, short-term debt (due within 1 year)</li>
                  <li><strong>Long-term Liabilities:</strong> Long-term debt, lease obligations</li>
                </ul>
              </div>

              <div className="bg-card border border-border rounded-xl p-4">
                <h3 className="font-semibold text-blue-500 mb-3">Equity (Net worth)</h3>
                <ul className="text-sm space-y-2">
                  <li><strong>Common Stock:</strong> Par value of shares issued</li>
                  <li><strong>Retained Earnings:</strong> Accumulated profits not paid as dividends</li>
                </ul>
              </div>
            </div>

            <h3 className="text-lg font-semibold mb-3">Key Balance Sheet Ratios</h3>
            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              {[
                { name: "Current Ratio", formula: "Current Assets / Current Liabilities", good: "> 1.5 (can pay short-term debts)" },
                { name: "Debt-to-Equity", formula: "Total Debt / Shareholders' Equity", good: "< 1.0 for most industries" },
                { name: "Book Value/Share", formula: "Shareholders' Equity / Shares Outstanding", good: "Compare to stock price" },
                { name: "Quick Ratio", formula: "(Current Assets - Inventory) / Current Liabilities", good: "> 1.0 (more conservative)" },
              ].map((metric, i) => (
                <div key={i} className="bg-secondary/50 rounded-lg p-4">
                  <h4 className="font-medium mb-1">{metric.name}</h4>
                  <code className="text-xs text-muted-foreground block mb-2">{metric.formula}</code>
                  <span className="text-xs text-green-500">{metric.good}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Cash Flow Statement Deep Dive */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <DollarSign className="w-6 h-6 text-purple-500" />
              3. Cash Flow Statement
            </h2>
            <p className="text-muted-foreground mb-6">
              The cash flow statement shows actual cash moving in and out of the company. It&apos;s crucial because
              a company can be &quot;profitable&quot; on paper but still run out of cash. Cash flow is divided into three sections:
            </p>

            <div className="space-y-4 mb-6">
              <div className="bg-card border border-border rounded-xl p-5">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="font-bold text-green-500">1</span>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Operating Cash Flow (CFO)</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Cash from day-to-day business operations. Starts with net income and adjusts for
                      non-cash items (depreciation) and working capital changes.
                    </p>
                    <p className="text-xs text-green-500">
                      ✓ Healthy companies generate positive operating cash flow
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-xl p-5">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="font-bold text-blue-500">2</span>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Investing Cash Flow (CFI)</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Cash used for investments: buying equipment (CapEx), acquisitions, or selling assets.
                      Usually negative for growing companies investing in their future.
                    </p>
                    <p className="text-xs text-blue-500">
                      ✓ CapEx shows investment in growth; watch for excessive acquisitions
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-xl p-5">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="font-bold text-purple-500">3</span>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Financing Cash Flow (CFF)</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Cash from/to shareholders and lenders: issuing stock, paying dividends,
                      borrowing or repaying debt, share buybacks.
                    </p>
                    <p className="text-xs text-purple-500">
                      ✓ Buybacks and dividends show shareholder returns; watch debt levels
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <h3 className="text-lg font-semibold mb-3">Key Cash Flow Metric: Free Cash Flow</h3>
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-semibold">Free Cash Flow (FCF)</span>
                  <p className="text-sm text-muted-foreground">Cash available for dividends, buybacks, debt paydown, or acquisitions</p>
                </div>
                <code className="bg-secondary px-3 py-1 rounded text-sm">CFO - CapEx</code>
              </div>
            </div>
          </section>

          {/* Red Flags Section */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-red-500" />
              Red Flags to Watch For
            </h2>
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6">
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { flag: "Declining gross margins", why: "Competition or rising costs eating into profits" },
                  { flag: "Revenue growing faster than cash flow", why: "Aggressive accounting or collection problems" },
                  { flag: "Rising debt-to-equity ratio", why: "Company may be overleveraged" },
                  { flag: "Negative operating cash flow", why: "Business isn't generating cash from operations" },
                  { flag: "Inventory growing faster than sales", why: "Products may not be selling" },
                  { flag: "Frequent \"one-time\" charges", why: "May be masking ongoing problems" },
                  { flag: "Receivables growing faster than revenue", why: "Collection problems or channel stuffing" },
                  { flag: "Declining return on equity (ROE)", why: "Company using capital less efficiently" },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-medium text-sm">{item.flag}</span>
                      <p className="text-xs text-muted-foreground">{item.why}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Where to Find Financial Statements */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4">Where to Find Financial Statements</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-card border border-border rounded-xl p-5">
                <h3 className="font-semibold mb-2">SEC Filings</h3>
                <ul className="text-sm space-y-1">
                  <li><strong>10-K:</strong> Annual report with full financial statements</li>
                  <li><strong>10-Q:</strong> Quarterly financial statements</li>
                  <li><strong>8-K:</strong> Material events and updates</li>
                </ul>
                <a
                  href="https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary text-sm mt-3 inline-flex items-center gap-1 hover:underline"
                >
                  Visit SEC EDGAR <ArrowRight className="w-3 h-3" />
                </a>
              </div>

              <div className="bg-card border border-border rounded-xl p-5">
                <h3 className="font-semibold mb-2">Lician Stock Pages</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  View financial data, ratios, and analysis for any stock on Lician.
                </p>
                <Link
                  href="/stock/aapl"
                  className="text-primary text-sm inline-flex items-center gap-1 hover:underline"
                >
                  Example: Apple Financials <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </section>

          {/* Quick Analysis Checklist */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Calculator className="w-6 h-6 text-primary" />
              Quick Analysis Checklist
            </h2>
            <div className="bg-card border border-border rounded-xl p-6">
              <p className="text-muted-foreground mb-4">
                Use this checklist when analyzing a company&apos;s financials:
              </p>
              <ol className="space-y-3">
                {[
                  "Is revenue growing year-over-year?",
                  "Are profit margins stable or improving?",
                  "Is the company generating positive free cash flow?",
                  "Is debt manageable (D/E < 1.0)?",
                  "Is the current ratio > 1.5?",
                  "Is return on equity (ROE) > 15%?",
                  "Are there any unexplained spikes in receivables or inventory?",
                  "How does it compare to competitors?",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                      {i + 1}
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ol>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {[
                {
                  q: "What's the most important financial statement?",
                  a: "The cash flow statement is often considered most important because it shows actual cash movements. A company can report profits but still go bankrupt if it runs out of cash. Always verify that reported earnings are backed by real cash flow."
                },
                {
                  q: "What's the difference between gross profit and net income?",
                  a: "Gross profit is revenue minus the direct costs to produce goods (COGS). Net income is the 'bottom line' after ALL expenses including operating costs, interest, and taxes. A company can have high gross profit but low net income due to high operating expenses."
                },
                {
                  q: "How do I know if a company has too much debt?",
                  a: "Look at the debt-to-equity ratio (Total Debt / Shareholders' Equity). Above 1.0 means more debt than equity. Also check interest coverage ratio (EBIT / Interest Expense) - below 2.0 is concerning. Compare to industry averages since some sectors (utilities, REITs) typically carry more debt."
                },
                {
                  q: "What is working capital and why does it matter?",
                  a: "Working capital = Current Assets - Current Liabilities. It measures a company's short-term liquidity and ability to pay bills. Positive working capital is generally good. Negative working capital can be a warning sign, though some efficient retailers (like Amazon) operate with negative working capital by design."
                },
                {
                  q: "Why might earnings differ from cash flow?",
                  a: "Earnings are calculated using accrual accounting (recording revenue when earned, not when cash received). Cash flow shows actual cash movements. Key differences: depreciation is a non-cash expense, changes in receivables/inventory affect cash but not earnings, and stock-based compensation is often excluded from cash metrics."
                },
                {
                  q: "How often should I check a company's financials?",
                  a: "At minimum, review annual reports (10-K) once per year. For active investors, quarterly reports (10-Q) provide more timely data. Always read the Management Discussion & Analysis (MD&A) section for context and forward-looking statements."
                },
              ].map((faq, i) => (
                <details key={i} className="group bg-card border border-border rounded-xl">
                  <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-secondary/50">
                    <span className="font-medium pr-4">{faq.q}</span>
                    <span className="text-muted-foreground group-open:rotate-180 transition-transform flex-shrink-0">▼</span>
                  </summary>
                  <p className="px-4 pb-4 text-muted-foreground text-sm">{faq.a}</p>
                </details>
              ))}
            </div>
          </section>

          {/* Related Resources */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4">Related Resources</h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              <Link href="/learn/stock-analysis" className="bg-card border border-border rounded-xl p-4 hover:bg-secondary/50 transition-colors">
                <h3 className="font-medium mb-1">Stock Analysis Guide</h3>
                <p className="text-sm text-muted-foreground">Learn fundamental and technical analysis</p>
              </Link>
              <Link href="/learn/pe-ratio" className="bg-card border border-border rounded-xl p-4 hover:bg-secondary/50 transition-colors">
                <h3 className="font-medium mb-1">P/E Ratio Explained</h3>
                <p className="text-sm text-muted-foreground">Understanding the price-to-earnings ratio</p>
              </Link>
              <Link href="/learn/dcf-valuation" className="bg-card border border-border rounded-xl p-4 hover:bg-secondary/50 transition-colors">
                <h3 className="font-medium mb-1">DCF Valuation</h3>
                <p className="text-sm text-muted-foreground">Discounted cash flow analysis</p>
              </Link>
              <Link href="/learn/value-investing" className="bg-card border border-border rounded-xl p-4 hover:bg-secondary/50 transition-colors">
                <h3 className="font-medium mb-1">Value Investing</h3>
                <p className="text-sm text-muted-foreground">Find undervalued stocks</p>
              </Link>
              <Link href="/screener" className="bg-card border border-border rounded-xl p-4 hover:bg-secondary/50 transition-colors">
                <h3 className="font-medium mb-1">Stock Screener</h3>
                <p className="text-sm text-muted-foreground">Filter by financial metrics</p>
              </Link>
              <Link href="/insights/pe-ratio-by-sector" className="bg-card border border-border rounded-xl p-4 hover:bg-secondary/50 transition-colors">
                <h3 className="font-medium mb-1">P/E by Sector</h3>
                <p className="text-sm text-muted-foreground">Industry valuation benchmarks</p>
              </Link>
            </div>
          </section>
        </article>
      </main>
      <Footer />

      {/* Schema Markup */}
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "BreadcrumbList",
                itemListElement: [
                  { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
                  { "@type": "ListItem", position: 2, name: "Learn", item: `${SITE_URL}/learn` },
                  { "@type": "ListItem", position: 3, name: "Reading Financial Statements", item: `${SITE_URL}/learn/reading-financial-statements` },
                ],
              },
              {
                "@type": "Article",
                headline: "How to Read Financial Statements: Complete Guide for Investors",
                description: "Learn how to read and analyze financial statements including income statement, balance sheet, and cash flow statement for smarter investing decisions.",
                author: { "@type": "Organization", name: SITE_NAME },
                publisher: { "@type": "Organization", name: SITE_NAME },
                datePublished: "2026-01-16",
                dateModified: "2026-01-16",
              },
              {
                "@type": "FAQPage",
                mainEntity: [
                  {
                    "@type": "Question",
                    name: "What's the most important financial statement?",
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: "The cash flow statement is often considered most important because it shows actual cash movements. A company can report profits but still go bankrupt if it runs out of cash."
                    }
                  },
                  {
                    "@type": "Question",
                    name: "What's the difference between gross profit and net income?",
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: "Gross profit is revenue minus the direct costs to produce goods (COGS). Net income is the 'bottom line' after ALL expenses including operating costs, interest, and taxes."
                    }
                  },
                  {
                    "@type": "Question",
                    name: "How do I know if a company has too much debt?",
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: "Look at the debt-to-equity ratio (Total Debt / Shareholders' Equity). Above 1.0 means more debt than equity. Also check interest coverage ratio (EBIT / Interest Expense) - below 2.0 is concerning."
                    }
                  },
                ]
              },
              {
                "@type": "HowTo",
                name: "How to Analyze Financial Statements",
                step: [
                  { "@type": "HowToStep", name: "Review Revenue Growth", text: "Check if revenue is growing year-over-year" },
                  { "@type": "HowToStep", name: "Analyze Profit Margins", text: "Look at gross, operating, and net margins for stability" },
                  { "@type": "HowToStep", name: "Check Cash Flow", text: "Verify the company generates positive free cash flow" },
                  { "@type": "HowToStep", name: "Evaluate Debt Levels", text: "Ensure debt-to-equity ratio is manageable" },
                  { "@type": "HowToStep", name: "Compare to Competitors", text: "Benchmark metrics against industry peers" },
                ]
              }
            ],
          }),
        }}
      />
    </>
  )
}
