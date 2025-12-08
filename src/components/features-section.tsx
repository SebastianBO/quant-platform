import { Button } from "@/components/ui/button"
import { Globe, Calendar } from "lucide-react"

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16">
          <span className="inline-block px-3 py-1 bg-secondary rounded-full text-xs font-medium text-foreground mb-4">
            Lician Pro
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
            Find the information you need faster
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Increase efficiency and precision in your qualitative public market research. No more manually digging
            through PDFs and documents.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-16">
          <div className="bg-card border border-border rounded-2xl p-8">
            <h3 className="text-lg font-semibold text-foreground mb-3">Industry-leading live coverage</h3>
            <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
              Be the first to obtain crucial information with unmatched coverage of live earnings calls with real-time
              transcripts. No more hunting for webcast links or manually registering for company events.
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

          <div className="bg-secondary/30 border border-border rounded-2xl p-6 flex items-center justify-center min-h-[280px]">
            <div className="w-full max-w-md bg-card rounded-xl border border-border overflow-hidden">
              <div className="p-4 border-b border-border">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs text-green-500 font-medium">LIVE</span>
                </div>
                <h4 className="text-sm font-medium text-foreground">Apple Inc. Q4 2024 Earnings Call</h4>
              </div>
              <div className="p-4 space-y-3">
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">
                    <span className="text-foreground font-medium">Tim Cook:</span> We are thrilled to report
                    record-breaking results this quarter...
                  </p>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-foreground font-medium">Analyst:</span> Can you elaborate on the services
                    growth?
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-card border border-border rounded-2xl p-6">
            <Globe className="w-8 h-8 text-foreground mb-4" />
            <h3 className="text-base font-semibold text-foreground mb-2">All IR material in one place</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              All events and IR material from 14,000+ public companies across 27 markets. Live and recorded. Everything
              fully searchable and AI-integrated.
            </p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6">
            <Calendar className="w-8 h-8 text-foreground mb-4" />
            <h3 className="text-base font-semibold text-foreground mb-2">Seamless research workflow</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Maximize productivity with a streamlined workflow and a modern, world-class UI. Side-by-side docs, custom
              data extractions, and drag-and-drop insights.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
