import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function AIChatCTA() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
          All IR material. One powerful chat. Purpose-built for finance.
        </h2>
        <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
          Ask anything across all events and documents from public companies and instantly find what you need. No more
          manually digging through PDFs and documents.
        </p>
        <Button className="bg-foreground text-background hover:bg-foreground/90 group">
          Explore the AI chat
          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </section>
  )
}
