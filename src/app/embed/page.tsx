import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Free Embeddable Stock Widget | Lician',
  description: 'Add real-time stock quotes to your website with our free embeddable widget. One line of code, automatic updates, beautiful design.',
  openGraph: {
    title: 'Free Embeddable Stock Widget | Lician',
    description: 'Add real-time stock quotes to your website with one line of code.',
    url: 'https://lician.com/embed',
    siteName: 'Lician',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Embeddable Stock Widget',
    description: 'Add real-time stock quotes to your website with one line of code.',
  },
}

export default function EmbedPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Free Stock Widget
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Add real-time stock quotes to your blog, website, or app with just one line of code.
          </p>
        </div>

        {/* Live Demo */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-12">
          <h2 className="text-2xl font-bold mb-6">Live Demo</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-500 mb-3">Light Theme</p>
              <div className="border rounded-lg p-4 bg-gray-50">
                <iframe
                  src="/embed/preview/AAPL?theme=light"
                  className="w-full h-32 border-0"
                  title="AAPL Stock Widget"
                />
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-3">Dark Theme</p>
              <div className="border rounded-lg p-4 bg-gray-900">
                <iframe
                  src="/embed/preview/TSLA?theme=dark"
                  className="w-full h-32 border-0"
                  title="TSLA Stock Widget"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Start */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-12">
          <h2 className="text-2xl font-bold mb-6">Quick Start</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Copy and paste this code anywhere on your website:
          </p>
          <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
            <code className="text-green-400 text-sm">
              {`<script src="https://lician.com/embed/widget.js" data-ticker="AAPL"></script>`}
            </code>
          </div>
          <p className="text-sm text-gray-500 mt-3">
            Replace <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">AAPL</code> with any stock ticker.
          </p>
        </div>

        {/* Options */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-12">
          <h2 className="text-2xl font-bold mb-6">Customization Options</h2>
          <div className="space-y-4">
            <div className="border-b pb-4">
              <code className="text-blue-600 font-mono">data-ticker</code>
              <span className="text-red-500 ml-2">required</span>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Stock ticker symbol (e.g., AAPL, TSLA, GOOGL)
              </p>
            </div>
            <div className="border-b pb-4">
              <code className="text-blue-600 font-mono">data-theme</code>
              <span className="text-gray-400 ml-2">optional</span>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Widget theme: <code className="bg-gray-100 px-1 rounded">light</code> (default) or <code className="bg-gray-100 px-1 rounded">dark</code>
              </p>
            </div>
            <div className="border-b pb-4">
              <code className="text-blue-600 font-mono">data-show-change</code>
              <span className="text-gray-400 ml-2">optional</span>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Show price change: <code className="bg-gray-100 px-1 rounded">true</code> (default) or <code className="bg-gray-100 px-1 rounded">false</code>
              </p>
            </div>
            <div>
              <code className="text-blue-600 font-mono">data-show-volume</code>
              <span className="text-gray-400 ml-2">optional</span>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Show trading volume: <code className="bg-gray-100 px-1 rounded">true</code> (default) or <code className="bg-gray-100 px-1 rounded">false</code>
              </p>
            </div>
          </div>
        </div>

        {/* Examples */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-12">
          <h2 className="text-2xl font-bold mb-6">Examples</h2>
          <div className="space-y-6">
            <div>
              <p className="font-medium mb-2">Dark theme widget:</p>
              <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                <code className="text-green-400 text-sm">
                  {`<script src="https://lician.com/embed/widget.js" data-ticker="TSLA" data-theme="dark"></script>`}
                </code>
              </div>
            </div>
            <div>
              <p className="font-medium mb-2">Minimal widget (no volume):</p>
              <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                <code className="text-green-400 text-sm">
                  {`<script src="https://lician.com/embed/widget.js" data-ticker="GOOGL" data-show-volume="false"></script>`}
                </code>
              </div>
            </div>
            <div>
              <p className="font-medium mb-2">Multiple widgets:</p>
              <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                <code className="text-green-400 text-sm whitespace-pre">
{`<script src="https://lician.com/embed/widget.js" data-ticker="AAPL"></script>
<script src="https://lician.com/embed/widget.js" data-ticker="MSFT"></script>
<script src="https://lician.com/embed/widget.js" data-ticker="AMZN"></script>`}
                </code>
              </div>
            </div>
          </div>
        </div>

        {/* API Access */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl p-8 text-white mb-12">
          <h2 className="text-2xl font-bold mb-4">Need More? Use Our Free API</h2>
          <p className="opacity-90 mb-6">
            Access stock quotes, financials, insider trades, and more via our REST API.
          </p>
          <Link
            href="/api-docs"
            className="inline-block bg-white text-blue-600 font-semibold px-6 py-3 rounded-lg hover:bg-gray-100 transition"
          >
            View API Documentation
          </Link>
        </div>

        {/* Terms */}
        <div className="text-center text-sm text-gray-500">
          <p>
            Free for personal and commercial use. Attribution link required.
          </p>
          <p className="mt-2">
            Data provided by <Link href="/" className="text-blue-600 hover:underline">Lician</Link>.
            Delayed by 15-20 minutes.
          </p>
        </div>
      </div>
    </div>
  )
}
