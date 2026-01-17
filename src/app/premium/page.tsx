"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import {
  Shield,
  Star,
  TrendingUp,
  BarChart3,
  FileText,
  Mic,
  Brain,
  CreditCard,
  X,
  Check,
  Sparkles
} from "lucide-react"

const PLANS = {
  monthly: {
    id: "monthly",
    name: "Monthly",
    price: 109,
    interval: "month",
    priceId: process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID || "price_monthly",
    badge: null,
    trial: false
  },
  annual: {
    id: "annual",
    name: "Annual",
    price: 699,
    monthlyEquivalent: 58.25,
    interval: "year",
    priceId: process.env.NEXT_PUBLIC_STRIPE_ANNUAL_PRICE_ID || "price_annual",
    badge: "Save 47%",
    trial: true,
    trialDays: 3
  }
}

const FEATURES = [
  {
    icon: Brain,
    title: "AI-powered Analysis",
    description: "Get instant insights and recommendations from our advanced AI system."
  },
  {
    icon: BarChart3,
    title: "Advanced Charts & Indicators",
    description: "Access professional-grade charting tools with 50+ technical indicators."
  },
  {
    icon: TrendingUp,
    title: "Real-time Market Data",
    description: "Live quotes, options flow, and institutional trading activity."
  },
  {
    icon: FileText,
    title: "SEC Filings & Research",
    description: "Instant access to all SEC filings, earnings transcripts, and analyst reports."
  },
  {
    icon: Mic,
    title: "Earnings Call Transcripts",
    description: "10 years of searchable earnings call transcripts and summaries."
  },
  {
    icon: Sparkles,
    title: "Premium Features",
    description: "Watchlists, alerts, portfolio tracking, and exclusive market insights."
  }
]

const TESTIMONIALS = [
  {
    rating: 5,
    quote: "Lician has completely transformed how I research stocks.",
    detail: "The AI analysis saves me hours every week. Worth every penny.",
    author: "Premium member | 2024"
  },
  {
    rating: 5,
    quote: "Finally, professional-grade tools at an affordable price.",
    detail: "I canceled my Bloomberg terminal subscription after switching to Lician.",
    author: "Premium member | 2024"
  }
]

export default function PremiumPage() {
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "annual">("annual")
  const [emailOffers, setEmailOffers] = useState(true)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubscribe = async () => {
    if (!agreedToTerms) {
      setError("Please agree to the Terms of Use & Privacy Policy")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: selectedPlan,
          emailOffers
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session")
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error("No checkout URL returned")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  const plan = PLANS[selectedPlan]
  const isAnnual = selectedPlan === "annual"

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Close button */}
        <div className="flex justify-end mb-4">
          <button
            onClick={() => window.history.back()}
            className="p-2 rounded-full text-[#868f97] hover:text-white hover:bg-white/[0.08] motion-safe:transition-all motion-safe:duration-150"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left Column - Features */}
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                <span className="bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">Lician</span>
                <span className="text-[#ffa16c] align-super text-xl ml-1">Pro</span>
              </h1>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-white mb-4">
                Get <span className="text-[#ffa16c]">unlimited access</span> to professional trading tools
              </h2>
              <p className="text-[#868f97] text-lg">
                Join thousands of traders using Lician Pro to make smarter investment decisions.
                Get real-time data, AI insights, and professional analysis tools.
              </p>
            </div>

            <div className="grid gap-4">
              {FEATURES.map((feature, i) => (
                <div
                  key={i}
                  className="flex gap-4 p-4 rounded-2xl bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] hover:bg-white/[0.05] hover:border-white/[0.15] motion-safe:transition-all motion-safe:duration-150"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#ffa16c]/10 flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-5 h-5 text-[#ffa16c]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{feature.title}</h3>
                    <p className="text-sm text-[#868f97]">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Testimonials */}
            <div className="space-y-4 pt-4">
              {TESTIMONIALS.map((testimonial, i) => (
                <div
                  key={i}
                  className="p-5 rounded-2xl bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] hover:border-white/[0.15] motion-safe:transition-all motion-safe:duration-150"
                >
                  <div className="flex gap-0.5 mb-2">
                    {[...Array(testimonial.rating)].map((_, j) => (
                      <Star key={j} className="w-4 h-4 fill-[#ffa16c] text-[#ffa16c]" />
                    ))}
                  </div>
                  <p className="font-semibold text-white mb-1">&quot;{testimonial.quote}</p>
                  <p className="text-sm text-[#868f97]">{testimonial.detail}</p>
                  <p className="text-[#ffa16c] text-sm mt-2">{testimonial.author}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Payment */}
          <div className="lg:sticky lg:top-8 lg:self-start">
            <div className="rounded-2xl bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] p-6 space-y-6">
              <div className="text-center">
                <h3 className="font-bold text-xl text-white mb-1">Start Your Free Trial</h3>
                <p className="text-[#868f97] text-sm">
                  {isAnnual ? "3 days free, then billed yearly" : "Billed monthly, cancel anytime"}
                </p>
              </div>

              <RadioGroup
                value={selectedPlan}
                onValueChange={(value) => setSelectedPlan(value as "monthly" | "annual")}
                className="space-y-3"
              >
                {/* Annual Plan */}
                <div className={`relative flex items-center p-4 rounded-2xl cursor-pointer motion-safe:transition-all motion-safe:duration-150 ${
                  selectedPlan === "annual"
                    ? "bg-white/[0.05] border-2 border-[#ffa16c]"
                    : "bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.15]"
                }`}>
                  <RadioGroupItem value="annual" id="annual" className="mr-4" />
                  <Label htmlFor="annual" className="flex-1 cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-bold text-lg text-white">Annual</span>
                        <p className="text-sm text-[#868f97]">
                          ${PLANS.annual.monthlyEquivalent}/mo billed annually
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-lg text-white">${PLANS.annual.price}</span>
                        <span className="text-[#868f97]">/year</span>
                      </div>
                    </div>
                  </Label>
                  {PLANS.annual.badge && (
                    <span className="absolute -top-3 left-4 bg-[#ffa16c] text-black text-xs px-3 py-1 rounded-full font-medium">
                      {PLANS.annual.badge}
                    </span>
                  )}
                  {PLANS.annual.trial && (
                    <span className="absolute -top-3 right-4 bg-[#4ebe96] text-black text-xs px-3 py-1 rounded-full font-medium">
                      3 Days Free
                    </span>
                  )}
                </div>

                {/* Monthly Plan */}
                <div className={`relative flex items-center p-4 rounded-2xl cursor-pointer motion-safe:transition-all motion-safe:duration-150 ${
                  selectedPlan === "monthly"
                    ? "bg-white/[0.05] border-2 border-[#ffa16c]"
                    : "bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.15]"
                }`}>
                  <RadioGroupItem value="monthly" id="monthly" className="mr-4" />
                  <Label htmlFor="monthly" className="flex-1 cursor-pointer">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-lg text-white">Monthly</span>
                      <div className="text-right">
                        <span className="font-bold text-lg text-white">${PLANS.monthly.price}</span>
                        <span className="text-[#868f97]">/month</span>
                      </div>
                    </div>
                  </Label>
                </div>
              </RadioGroup>

              {/* Trial Timeline for Yearly */}
              {isAnnual && (
                <div className="bg-white/[0.03] backdrop-blur-[10px] rounded-2xl p-4 space-y-3 border border-white/[0.08]">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#4ebe96]/20 flex items-center justify-center">
                      <Check className="w-4 h-4 text-[#4ebe96]" />
                    </div>
                    <div>
                      <p className="font-medium text-sm text-white">Today</p>
                      <p className="text-xs text-[#868f97]">Unlock all features instantly</p>
                    </div>
                  </div>
                  <div className="w-0.5 h-4 bg-white/[0.08] ml-4" />
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#ffa16c]/20 flex items-center justify-center">
                      <CreditCard className="w-4 h-4 text-[#ffa16c]" />
                    </div>
                    <div>
                      <p className="font-medium text-sm text-white">In 3 Days</p>
                      <p className="text-xs text-[#868f97]">You&apos;ll be charged ${PLANS.annual.price}/year</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Info */}
              <div className="flex items-center gap-3 p-3 bg-white/[0.03] backdrop-blur-[10px] rounded-2xl border border-white/[0.08]">
                <Shield className="w-5 h-5 text-[#4ebe96]" />
                <div>
                  <p className="text-sm font-medium text-white">Secure Payment via Stripe</p>
                  <p className="text-xs text-[#868f97]">Cancel anytime, no questions asked</p>
                </div>
              </div>

              {/* Checkboxes */}
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="email-offers"
                    checked={emailOffers}
                    onCheckedChange={(checked) => setEmailOffers(checked as boolean)}
                    className="mt-0.5"
                  />
                  <Label htmlFor="email-offers" className="text-sm text-[#868f97] cursor-pointer leading-tight">
                    Send me occasional tips and exclusive offers via email.
                  </Label>
                </div>

                <div className="flex items-start gap-3">
                  <Checkbox
                    id="terms"
                    checked={agreedToTerms}
                    onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                    className="mt-0.5"
                  />
                  <Label htmlFor="terms" className="text-sm text-[#868f97] cursor-pointer leading-tight">
                    I agree to the{" "}
                    <a href="/terms" className="text-[#479ffa] hover:opacity-80 motion-safe:transition-opacity motion-safe:duration-150">Terms of Use</a> and{" "}
                    <a href="/privacy" className="text-[#479ffa] hover:opacity-80 motion-safe:transition-opacity motion-safe:duration-150">Privacy Policy</a>.
                    {isAnnual
                      ? ` My subscription will auto-renew at $${PLANS.annual.price}/year after the trial ends.`
                      : ` My subscription will auto-renew at $${PLANS.monthly.price}/month.`
                    }
                  </Label>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-[#ff5c5c]/10 border border-[#ff5c5c]/20 rounded-2xl text-[#ff5c5c] text-sm">
                  {error}
                </div>
              )}

              <button
                className="w-full bg-[#ffa16c] hover:opacity-90 text-black py-4 text-lg font-semibold rounded-full motion-safe:transition-opacity motion-safe:duration-150 disabled:opacity-50"
                onClick={handleSubscribe}
                disabled={loading}
              >
                {loading
                  ? "Processing..."
                  : isAnnual
                    ? "Start Free Trial"
                    : "Subscribe Now"
                }
              </button>

              <p className="text-xs text-center text-[#868f97]">
                {isAnnual
                  ? "No payment due today. Cancel anytime during the trial."
                  : "Cancel anytime. No hidden fees."
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
