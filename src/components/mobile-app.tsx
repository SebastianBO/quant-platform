import { Button } from "@/components/ui/button"
import { Star } from "lucide-react"

const reviews = [
  {
    quote:
      "Excellent app, it gives me free access to company earnings calls and annual reports. I love the convenience of calls being available offline.",
    author: "James K.",
    platform: "App Store",
  },
  {
    quote: "One of the very few apps you could call perfect. The interface is clean and the data is comprehensive.",
    author: "Alex M.",
    platform: "Google Play",
  },
  {
    quote: "This is genuinely one of the cleanest and fastest finance apps out there to track the market.",
    author: "Rachel T.",
    platform: "App Store",
  },
]

export function MobileApp() {
  return (
    <section className="py-24 px-6 bg-secondary/20">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-sm text-muted-foreground mb-4">Research anytime, anywhere</p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
              Built for professionals. Loved by everyone.
            </h2>
            <p className="text-lg text-muted-foreground mb-8">Try our free mobile app.</p>
            <Button className="bg-foreground text-background hover:bg-foreground/90">Download</Button>
          </div>

          <div className="space-y-4">
            {reviews.map((review, index) => (
              <div key={index} className="bg-card border border-border rounded-xl p-5">
                <div className="flex gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">&quot;{review.quote}&quot;</p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                    <span className="text-xs font-medium text-foreground">{review.author[0]}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{review.author}</p>
                    <p className="text-xs text-muted-foreground">{review.platform}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
