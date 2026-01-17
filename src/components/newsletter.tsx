"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CheckCircle2, Loader2 } from "lucide-react"

const articles = [
  {
    title: "AI Stocks Surge: Top Picks for 2026",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=500&fit=crop",
  },
  {
    title: "Dividend Kings: 50 Years of Growth",
    image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=500&fit=crop",
  },
  {
    title: "Biotech Catalysts: FDA Decisions Ahead",
    image: "https://images.unsplash.com/photo-1579165466741-7f35e4755169?w=400&h=500&fit=crop",
  },
  {
    title: "The Crypto Rally: Bitcoin's Next Move",
    image: "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=400&h=500&fit=crop",
  },
]

export function Newsletter() {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState("")

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !email.includes("@")) {
      setStatus("error")
      setMessage("Please enter a valid email address")
      return
    }

    setStatus("loading")

    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "homepage" }),
      })

      const data = await response.json()

      if (data.success) {
        setStatus("success")
        setMessage(data.message)
        setEmail("")
      } else {
        setStatus("error")
        setMessage(data.error || "Something went wrong")
      }
    } catch {
      setStatus("error")
      setMessage("Failed to subscribe. Please try again.")
    }
  }

  return (
    <section className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Lician Daily
          </h2>
          <p className="text-lg text-[#868f97]">
            Free daily market insights, stock picks, and AI-powered analysis delivered to your inbox.
          </p>
        </div>

        <form onSubmit={handleSubscribe} className="flex justify-center mb-12">
          <div className="flex flex-col sm:flex-row gap-2 max-w-md w-full">
            {status === "success" ? (
              <div className="flex items-center gap-2 text-[#4ebe96] py-2">
                <CheckCircle2 className="h-5 w-5" />
                <span>{message}</span>
              </div>
            ) : (
              <>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={status === "loading"}
                  className="bg-white/[0.05] border-white/[0.08] text-white placeholder:text-[#868f97]"
                />
                <Button
                  type="submit"
                  disabled={status === "loading"}
                  className="bg-[#4ebe96] text-black hover:bg-[#4ebe96]/90 shrink-0"
                >
                  {status === "loading" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Subscribe Free"
                  )}
                </Button>
              </>
            )}
          </div>
        </form>

        {status === "error" && (
          <p className="text-center text-red-500 text-sm mb-8">{message}</p>
        )}

        <div className="text-center text-sm text-[#868f97] mb-8">
          Join 10,000+ investors getting daily insights
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {articles.map((article, index) => (
            <div key={index} className="group cursor-pointer">
              <div className="aspect-[3/4] rounded-xl overflow-hidden mb-3 bg-white/[0.05]">
                <img
                  src={article.image || "/placeholder.svg"}
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <h3 className="text-sm font-medium text-white group-hover:text-[#4ebe96] transition-colors duration-100 line-clamp-2">
                {article.title}
              </h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
