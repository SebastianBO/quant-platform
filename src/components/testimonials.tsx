import { Avatar, AvatarFallback } from "@/components/ui/avatar"

const testimonials = [
  {
    quote:
      "Research that used to take hours now takes seconds with Lician Pro. Whether I'm tracking shifts in tone and strategy or extracting tables on order book developments across an entire industry, it's as simple as typing a query.",
    author: "Michael Chen",
    role: "Investment Director, Capital Partners",
    avatar: "MC",
  },
  {
    quote:
      "Before Lician Pro, we spent hours manually compiling relevant insights through the peer earnings cycle. Now, these tasks are done faster and with greater precision.",
    author: "Sarah Williams",
    role: "VP of Investor Relations, TechCorp",
    avatar: "SW",
  },
  {
    quote:
      "Being able to ask specific questions across years of transcripts and reports and instantly get verified answers is a game-changer. It's like having a well-read research analyst, expert on every company and industry, ready with answers 24/7.",
    author: "David Park",
    role: "CEO & Investment Manager, Apex Funds",
    avatar: "DP",
  },
]

export function Testimonials() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-12 text-center">
          What our clients say about Lician Pro
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-card border border-border rounded-2xl p-6">
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">&quot;{testimonial.quote}&quot;</p>
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-secondary text-foreground text-sm">{testimonial.avatar}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium text-foreground">{testimonial.author}</p>
                  <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
