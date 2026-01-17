import { Avatar, AvatarFallback } from "@/components/ui/avatar"

const testimonials = [
  {
    quote:
      "We build accurate AI, and millions of finance professionals depend on us for real-time, highly accurate answers, making our partnership with Lician a natural fit.",
    author: "Emily Zhang",
    role: "Corporate Development, FinanceAI",
    avatar: "EZ",
  },
  {
    quote:
      "The most valuable data in finance isn't always a number. It's a sentence. A shift in tone. A hint of hesitation from a CEO. That's what Lician lets us tap into.",
    author: "Marcus Johnson",
    role: "MD of Products, DataCore",
    avatar: "MJ",
  },
  {
    quote:
      "Through our collaboration with Lician, we are enhancing our platform to offer effortless access to essential company data. This makes us an even more comprehensive hub.",
    author: "Anna Schmidt",
    role: "Co-Head of Equities, Nordic Bank",
    avatar: "AS",
  },
]

export function APITestimonials() {
  return (
    <section className="py-24 px-6 bg-secondary/20">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-12 text-center">
          What our clients say about the Lician API
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-[#1a1a1a] border border-white/[0.08] rounded-2xl p-6">
              <p className="text-sm text-[#868f97] leading-relaxed mb-6">&quot;{testimonial.quote}&quot;</p>
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-white/[0.05] text-white text-sm">{testimonial.avatar}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium text-white">{testimonial.author}</p>
                  <p className="text-xs text-[#868f97]">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
