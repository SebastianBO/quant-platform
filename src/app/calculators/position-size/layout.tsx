import { Metadata } from "next"
import { SITE_URL, SITE_NAME } from "@/lib/seo"

export const metadata: Metadata = {
  title: "Position Size Calculator | Risk Management Tool | Lician",
  description: "Free position size calculator for stocks and trading. Calculate optimal share quantity based on account size, risk percentage, entry price, and stop loss. Master risk management with the 2% rule.",
  keywords: [
    "position size calculator",
    "trading position calculator",
    "risk management calculator",
    "stock position sizing",
    "trade size calculator",
    "shares to buy calculator",
    "2% rule trading",
    "stop loss calculator",
    "risk per trade calculator",
    "kelly criterion calculator"
  ],
  alternates: {
    canonical: `${SITE_URL}/calculators/position-size`,
  },
  openGraph: {
    title: "Position Size Calculator - Calculate Optimal Trade Size",
    description: "Free position size calculator for stocks and trading. Determine how many shares to buy based on your account size and risk tolerance.",
    url: `${SITE_URL}/calculators/position-size`,
    siteName: SITE_NAME,
    type: "website",
    images: [
      {
        url: `${SITE_URL}/og/calculators/position-size.png`,
        width: 1200,
        height: 630,
        alt: "Position Size Calculator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Position Size Calculator | Lician",
    description: "Calculate the perfect position size for your trades. Free risk management calculator.",
  },
}

export default function PositionSizeCalculatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
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
                  {
                    "@type": "ListItem",
                    position: 1,
                    name: "Home",
                    item: SITE_URL,
                  },
                  {
                    "@type": "ListItem",
                    position: 2,
                    name: "Calculators",
                    item: `${SITE_URL}/calculators`,
                  },
                  {
                    "@type": "ListItem",
                    position: 3,
                    name: "Position Size Calculator",
                    item: `${SITE_URL}/calculators/position-size`,
                  },
                ],
              },
              {
                "@type": "WebApplication",
                name: "Position Size Calculator",
                description: "Calculate optimal position size for stock trades based on account size, risk tolerance, entry price, and stop loss level.",
                url: `${SITE_URL}/calculators/position-size`,
                applicationCategory: "FinanceApplication",
                operatingSystem: "Any",
                offers: {
                  "@type": "Offer",
                  price: "0",
                  priceCurrency: "USD",
                },
                featureList: [
                  "Position size calculation",
                  "Risk percentage management",
                  "Stop loss calculation",
                  "Risk/reward ratio analysis",
                  "Long and short position support",
                  "Break-even price calculation"
                ],
              },
              {
                "@type": "FAQPage",
                mainEntity: [
                  {
                    "@type": "Question",
                    name: "What is position sizing in trading?",
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: "Position sizing is a risk management technique that determines how many shares or contracts to trade based on your account size and risk tolerance. The goal is to limit your loss on any single trade to a predetermined percentage of your portfolio, typically 1-2%."
                    },
                  },
                  {
                    "@type": "Question",
                    name: "What is the 2% rule in trading?",
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: "The 2% rule states that you should never risk more than 2% of your trading account on any single trade. This means if you have a $50,000 account, your maximum loss per trade should be $1,000. This rule helps preserve capital during losing streaks."
                    },
                  },
                  {
                    "@type": "Question",
                    name: "How do I calculate position size?",
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: "Position Size = (Account Size × Risk Percentage) ÷ (Entry Price - Stop Loss Price). For example, with a $50,000 account, 2% risk ($1,000), entry at $150, and stop loss at $145 ($5 risk per share), you would buy 200 shares ($1,000 ÷ $5)."
                    },
                  },
                  {
                    "@type": "Question",
                    name: "What is a good risk/reward ratio for trading?",
                    acceptedAnswer: {
                      "@type": "Answer",
                      text: "A minimum risk/reward ratio of 2:1 is recommended, meaning your potential profit should be at least twice your potential loss. With a 2:1 ratio, you only need to win 34% of trades to break even, making it easier to be profitable over time."
                    },
                  },
                ],
              },
            ],
          }),
        }}
      />
      {children}
    </>
  )
}
