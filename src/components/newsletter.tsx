import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const articles = [
  {
    title: "Keeping the Streak Alive: The Story of Duolingo",
    image: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=400&h=500&fit=crop",
  },
  {
    title: "Ball: The King of Cans",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=500&fit=crop",
  },
  {
    title: "Rolls-Royce: Full Thrust Ahead",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=500&fit=crop",
  },
  {
    title: "A Castle in the Sky: The Story of Oracle",
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=500&fit=crop",
  },
]

export function Newsletter() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">Get a taste of Edge</h2>
          <p className="text-lg text-muted-foreground">
            The free bi-weekly no-brainer newsletter for business and investing enthusiasts.
          </p>
        </div>

        <div className="flex justify-center mb-12">
          <div className="flex gap-2 max-w-md w-full">
            <Input
              type="email"
              placeholder="Enter your email"
              className="bg-secondary border-border text-foreground placeholder:text-muted-foreground"
            />
            <Button className="bg-foreground text-background hover:bg-foreground/90 shrink-0">Subscribe</Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {articles.map((article, index) => (
            <div key={index} className="group cursor-pointer">
              <div className="aspect-[3/4] rounded-xl overflow-hidden mb-3 bg-secondary">
                <img
                  src={article.image || "/placeholder.svg"}
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <h3 className="text-sm font-medium text-foreground group-hover:text-muted-foreground transition-colors line-clamp-2">
                {article.title}
              </h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
