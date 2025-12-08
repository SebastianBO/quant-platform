import { Button } from "@/components/ui/button"
import { Search, History, MessageSquare } from "lucide-react"

export function AIFeatures() {
  return (
    <section className="py-24 px-6 bg-secondary/20">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16">
          <span className="inline-block px-3 py-1 bg-secondary rounded-full text-xs font-medium text-foreground mb-4">
            Lician Pro
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
            Research faster. Understand deeper.
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl">
            Ask anything across every event from 14,000+ public companies and instantly find what you need. Cite with
            confidence using only first-party information. Every quote, metric, and slide is always fully traceable to
            its original source.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-16">
          <div className="bg-card border border-border rounded-2xl p-8">
            <MessageSquare className="w-8 h-8 text-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-3">All IR material in one powerful chat</h3>
            <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
              Eliminate the need of manually searching for data points in company material. Just extract what you need,
              when you need it. Spend more time analyzing and thinking.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" className="border-border text-foreground hover:bg-secondary bg-transparent">
                Book demo
              </Button>
              <Button variant="ghost" className="text-foreground hover:bg-secondary">
                Explore features
              </Button>
            </div>
          </div>

          <div className="bg-secondary/30 border border-border rounded-2xl p-6 flex items-center justify-center min-h-[320px]">
            <div className="w-full max-w-md space-y-4">
              <div className="bg-card rounded-xl border border-border p-4">
                <p className="text-sm text-foreground mb-2">What was Apple&apos;s revenue growth in Q3?</p>
                <div className="flex items-start gap-3 mt-4">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                    <span className="text-xs font-medium text-foreground">AI</span>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Apple reported revenue of $85.8B in Q3 2024, representing a 5% YoY growth...
                    </p>
                    <div className="inline-flex items-center gap-2 text-xs text-muted-foreground bg-secondary/50 px-2 py-1 rounded">
                      <span>Source: AAPL Q3 2024 Earnings Call</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-card border border-border rounded-2xl p-6">
            <Search className="w-8 h-8 text-foreground mb-4" />
            <h3 className="text-base font-semibold text-foreground mb-2">Cut research time. Avoid blind spots.</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Search for any keyword across all investor relations documents simultaneously. Earnings reports, filings,
              slide presentations, and transcripts.
            </p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6">
            <History className="w-8 h-8 text-foreground mb-4" />
            <h3 className="text-base font-semibold text-foreground mb-2">Track narrative shifts</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Spot changes in messaging, KPIs, and strategic focus over time. See how individual slides evolve quarter
              by quarter, year by year.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
