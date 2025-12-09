"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
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
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Close button */}
        <div className="flex justify-end mb-4">
          <Button variant="ghost" size="icon" onClick={() => window.history.back()}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left Column - Features */}
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Lician</span>
                <span className="text-orange-500 align-super text-xl ml-1">Pro</span>
              </h1>
            </div>

            <div>
              <h2 className="text-3xl font-bold mb-4">
                Get <span className="text-orange-500">unlimited access</span> to professional trading tools
              </h2>
              <p className="text-muted-foreground text-lg">
                Join thousands of traders using Lician Pro to make smarter investment decisions.
                Get real-time data, AI insights, and professional analysis tools.
              </p>
            </div>

            <div className="grid gap-4">
              {FEATURES.map((feature, i) => (
                <div key={i} className="flex gap-4 p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-5 h-5 text-orange-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Testimonials */}
            <div className="space-y-4 pt-4">
              {TESTIMONIALS.map((testimonial, i) => (
                <Card key={i} className="bg-gradient-to-r from-orange-500/10 to-transparent border-orange-500/20">
                  <CardContent className="p-5">
                    <div className="flex gap-0.5 mb-2">
                      {[...Array(testimonial.rating)].map((_, j) => (
                        <Star key={j} className="w-4 h-4 fill-orange-500 text-orange-500" />
                      ))}
                    </div>
                    <p className="font-semibold mb-1">"{testimonial.quote}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.detail}</p>
                    <p className="text-orange-500 text-sm mt-2">{testimonial.author}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Right Column - Payment */}
          <div className="lg:sticky lg:top-8 lg:self-start">
            <Card className="border-2 shadow-lg">
              <CardContent className="p-6 space-y-6">
                <div className="text-center">
                  <h3 className="font-bold text-xl mb-1">Start Your Free Trial</h3>
                  <p className="text-muted-foreground text-sm">
                    {isAnnual ? "3 days free, then billed yearly" : "Billed monthly, cancel anytime"}
                  </p>
                </div>

                <RadioGroup
                  value={selectedPlan}
                  onValueChange={(value) => setSelectedPlan(value as "monthly" | "annual")}
                  className="space-y-3"
                >
                  {/* Annual Plan */}
                  <div className={`relative flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedPlan === "annual"
                      ? "border-orange-500 bg-orange-500/5 shadow-md"
                      : "border-border hover:border-orange-500/50"
                  }`}>
                    <RadioGroupItem value="annual" id="annual" className="mr-4" />
                    <Label htmlFor="annual" className="flex-1 cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-bold text-lg">Annual</span>
                          <p className="text-sm text-muted-foreground">
                            ${PLANS.annual.monthlyEquivalent}/mo billed annually
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-lg">${PLANS.annual.price}</span>
                          <span className="text-muted-foreground">/year</span>
                        </div>
                      </div>
                    </Label>
                    {PLANS.annual.badge && (
                      <span className="absolute -top-3 left-4 bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                        {PLANS.annual.badge}
                      </span>
                    )}
                    {PLANS.annual.trial && (
                      <span className="absolute -top-3 right-4 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                        3 Days Free
                      </span>
                    )}
                  </div>

                  {/* Monthly Plan */}
                  <div className={`relative flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedPlan === "monthly"
                      ? "border-orange-500 bg-orange-500/5 shadow-md"
                      : "border-border hover:border-orange-500/50"
                  }`}>
                    <RadioGroupItem value="monthly" id="monthly" className="mr-4" />
                    <Label htmlFor="monthly" className="flex-1 cursor-pointer">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-lg">Monthly</span>
                        <div className="text-right">
                          <span className="font-bold text-lg">${PLANS.monthly.price}</span>
                          <span className="text-muted-foreground">/month</span>
                        </div>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>

                {/* Trial Timeline for Yearly */}
                {isAnnual && (
                  <div className="bg-secondary/50 rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                        <Check className="w-4 h-4 text-green-500" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Today</p>
                        <p className="text-xs text-muted-foreground">Unlock all features instantly</p>
                      </div>
                    </div>
                    <div className="w-0.5 h-4 bg-border ml-4" />
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center">
                        <CreditCard className="w-4 h-4 text-orange-500" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">In 3 Days</p>
                        <p className="text-xs text-muted-foreground">You'll be charged ${PLANS.annual.price}/year</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Payment Info */}
                <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg">
                  <Shield className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="text-sm font-medium">Secure Payment via Stripe</p>
                    <p className="text-xs text-muted-foreground">Cancel anytime, no questions asked</p>
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
                    <Label htmlFor="email-offers" className="text-sm cursor-pointer leading-tight">
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
                    <Label htmlFor="terms" className="text-sm cursor-pointer leading-tight">
                      I agree to the{" "}
                      <a href="/terms" className="text-orange-500 hover:underline">Terms of Use</a> and{" "}
                      <a href="/privacy" className="text-orange-500 hover:underline">Privacy Policy</a>.
                      {isAnnual
                        ? ` My subscription will auto-renew at $${PLANS.annual.price}/year after the trial ends.`
                        : ` My subscription will auto-renew at $${PLANS.monthly.price}/month.`
                      }
                    </Label>
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
                    {error}
                  </div>
                )}

                <Button
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white py-6 text-lg font-semibold rounded-xl"
                  onClick={handleSubscribe}
                  disabled={loading}
                >
                  {loading
                    ? "Processing..."
                    : isAnnual
                      ? "Start Free Trial"
                      : "Subscribe Now"
                  }
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  {isAnnual
                    ? "No payment due today. Cancel anytime during the trial."
                    : "Cancel anytime. No hidden fees."
                  }
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
