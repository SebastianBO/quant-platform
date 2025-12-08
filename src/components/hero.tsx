import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center pt-24 pb-16 px-6">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-b from-muted/20 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-tight text-balance">
          Make better investment decisions faster
        </h1>
        <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Unmatched coverage of live earnings calls with real-time transcripts. Best-in-class AI-powered research
          platform.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            variant="outline"
            className="border-border text-foreground hover:bg-secondary px-6 py-6 text-base bg-transparent"
          >
            Find your plan
          </Button>
          <Link href="/dashboard">
            <Button className="bg-secondary text-foreground hover:bg-secondary/80 px-6 py-6 text-base group">
              Open Dashboard
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>

      <div className="relative z-10 mt-16 w-full max-w-6xl mx-auto">
        <div className="relative">
          <div className="absolute -inset-4 bg-gradient-to-b from-muted/30 to-transparent rounded-3xl blur-2xl" />
          <div className="relative bg-card/50 backdrop-blur border border-border rounded-2xl overflow-hidden shadow-2xl">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-secondary/30">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="bg-background/50 rounded-lg px-4 py-1 text-xs text-muted-foreground">
                  lician.com/dashboard
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-foreground">Live right now</h3>
                  <p className="text-xs text-muted-foreground">5 companies</p>
                  <div className="flex gap-2">
                    {["AAPL", "MSFT", "GOOGL", "AMZN", "META"].map((ticker) => (
                      <div
                        key={ticker}
                        className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center"
                      >
                        <span className="text-xs font-medium text-foreground">{ticker[0]}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-foreground">Latest events</h3>
                  <p className="text-xs text-muted-foreground">Based on your followed companies</p>
                  <div className="space-y-2">
                    {[
                      { name: "Tesla", event: "Q3 2024", date: "Today" },
                      { name: "NVIDIA", event: "Investor Day", date: "Tomorrow" },
                      { name: "Apple", event: "Q4 2024", date: "Dec 15" },
                    ].map((item) => (
                      <div key={item.name} className="flex items-center justify-between p-2 rounded-lg bg-secondary/50">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                            <span className="text-xs font-medium text-foreground">{item.name[0]}</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">{item.name}</p>
                            <p className="text-xs text-muted-foreground">{item.event}</p>
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground">{item.date}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute -left-8 top-1/2 -translate-y-1/4 w-48 bg-card border border-border rounded-2xl p-4 shadow-xl hidden lg:block">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-full bg-muted" />
              <span className="text-xs text-muted-foreground">9:41</span>
            </div>
            <h4 className="text-xs font-medium text-foreground mb-2">Home</h4>
            <p className="text-xs text-muted-foreground">Live right now</p>
            <div className="flex gap-1 mt-2">
              {["A", "G", "N"].map((letter) => (
                <div key={letter} className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center">
                  <span className="text-[10px] text-foreground">{letter}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
