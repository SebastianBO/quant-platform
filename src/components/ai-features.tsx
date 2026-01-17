import { Button } from "@/components/ui/button"
import { Search, History, MessageSquare } from "lucide-react"

export function AIFeatures() {
  return (
    <section className="py-24 px-6 bg-white/[0.01]">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16">
          <span className="inline-block px-3 py-1 bg-white/[0.05] rounded-full text-xs font-medium text-white mb-4">
            Lician Pro
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 text-balance">
            Research faster. Understand deeper.
          </h2>
          <p className="text-lg text-[#868f97] max-w-3xl">
            Ask anything across every event from 14,000+ public companies and instantly find what you need. Cite with
            confidence using only first-party information. Every quote, metric, and slide is always fully traceable to
            its original source.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-16">
          <div className="bg-[#1a1a1a] border border-white/[0.08] rounded-2xl p-8">
            <MessageSquare className="w-8 h-8 text-white mb-4" />
            <h3 className="text-lg font-semibold text-white mb-3">All IR material in one powerful chat</h3>
            <p className="text-[#868f97] text-sm mb-6 leading-relaxed">
              Eliminate the need of manually searching for data points in company material. Just extract what you need,
              when you need it. Spend more time analyzing and thinking.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" className="border-white/[0.08] text-white hover:bg-white/[0.08] bg-transparent">
                Book demo
              </Button>
              <Button variant="ghost" className="text-white hover:bg-white/[0.08]">
                Explore features
              </Button>
            </div>
          </div>

          <div className="bg-white/[0.015] border border-white/[0.08] rounded-2xl p-6 flex items-center justify-center min-h-[320px]">
            <div className="w-full max-w-md space-y-4">
              <div className="bg-[#1a1a1a] rounded-xl border border-white/[0.08] p-4">
                <p className="text-sm text-white mb-2">What was Apple&apos;s revenue growth in Q3?</p>
                <div className="flex items-start gap-3 mt-4">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                    <span className="text-xs font-medium text-white">AI</span>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-[#868f97]">
                      Apple reported revenue of $85.8B in Q3 2024, representing a 5% YoY growth...
                    </p>
                    <div className="inline-flex items-center gap-2 text-xs text-[#868f97] bg-white/[0.025] px-2 py-1 rounded">
                      <span>Source: AAPL Q3 2024 Earnings Call</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-[#1a1a1a] border border-white/[0.08] rounded-2xl p-6">
            <Search className="w-8 h-8 text-white mb-4" />
            <h3 className="text-base font-semibold text-white mb-2">Cut research time. Avoid blind spots.</h3>
            <p className="text-sm text-[#868f97] leading-relaxed">
              Search for any keyword across all investor relations documents simultaneously. Earnings reports, filings,
              slide presentations, and transcripts.
            </p>
          </div>

          <div className="bg-[#1a1a1a] border border-white/[0.08] rounded-2xl p-6">
            <History className="w-8 h-8 text-white mb-4" />
            <h3 className="text-base font-semibold text-white mb-2">Track narrative shifts</h3>
            <p className="text-sm text-[#868f97] leading-relaxed">
              Spot changes in messaging, KPIs, and strategic focus over time. See how individual slides evolve quarter
              by quarter, year by year.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
