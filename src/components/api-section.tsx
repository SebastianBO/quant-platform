import { Button } from "@/components/ui/button"
import { Code, Globe, Cpu } from "lucide-react"

export function APISection() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16">
          <span className="inline-block px-3 py-1 bg-white/[0.05] rounded-full text-xs font-medium text-white mb-4">
            Lician API
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 text-balance">
            Supercharge your platform
          </h2>
          <p className="text-lg text-[#868f97] max-w-3xl">
            Build custom solutions powered by live earnings calls, live transcripts, filings and reports, slide
            presentations, and more – delivered with best-in-class reliability and timeliness.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-16">
          <div className="bg-[#1a1a1a] border border-white/[0.08] rounded-2xl p-8">
            <Code className="w-8 h-8 text-white mb-4" />
            <h3 className="text-lg font-semibold text-white mb-3">Integrated in minutes. Unlimited API calls.</h3>
            <p className="text-[#868f97] text-sm mb-6 leading-relaxed">
              Seamless integration, scalability, and predictable costs - enabling maximized value without constraints.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" className="border-white/[0.08] text-white hover:bg-white/[0.08] bg-transparent transition-colors duration-100">
                Book demo
              </Button>
              <Button variant="ghost" className="text-white hover:bg-white/[0.08] transition-colors duration-100">
                Learn more
              </Button>
            </div>
          </div>

          <div className="bg-white/[0.015] border border-white/[0.08] rounded-2xl p-6 flex items-center justify-center min-h-[280px]">
            <div className="w-full max-w-md bg-[#1a1a1a] rounded-xl border border-white/[0.08] overflow-hidden">
              <div className="px-4 py-3 border-b border-white/[0.08] bg-white/[0.015]">
                <code className="text-xs text-[#868f97]">api.lician.com/v1/transcripts</code>
              </div>
              <div className="p-4">
                <pre className="text-xs text-[#868f97] overflow-x-auto">
                  {`{
  "company": "AAPL",
  "event": "Q4 2024 Earnings",
  "transcript": {
    "speakers": [...],
    "segments": [...]
  }
}`}
                </pre>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-[#1a1a1a] border border-white/[0.08] rounded-2xl p-6">
            <Globe className="w-8 h-8 text-white mb-4" />
            <h3 className="text-base font-semibold text-white mb-2">Global, industry-leading coverage</h3>
            <p className="text-sm text-[#868f97] leading-relaxed">
              Live transcripts, filings and reports, slide presentations, and both live and historical audio from
              earnings calls, capital markets days, M&A announcements, and more.
            </p>
          </div>

          <div className="bg-[#1a1a1a] border border-white/[0.08] rounded-2xl p-6">
            <Cpu className="w-8 h-8 text-white mb-4" />
            <h3 className="text-base font-semibold text-white mb-2">LLM-compatible</h3>
            <p className="text-sm text-[#868f97] leading-relaxed">
              Built for the future of AI. Structured, high-quality earnings data and transcripts optimized for LLMs.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
