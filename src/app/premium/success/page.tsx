"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle2, Loader2, ArrowRight, Sparkles } from "lucide-react"

function SuccessContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get("session_id")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (sessionId) {
      // Verify the session (optional - webhook handles the actual subscription)
      verifySession()
    } else {
      setLoading(false)
    }
  }, [sessionId])

  const verifySession = async () => {
    try {
      const response = await fetch(`/api/stripe/verify-session?session_id=${sessionId}`)
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to verify session")
      }
      setLoading(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to verify subscription")
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-orange-500" />
          <p className="text-muted-foreground">Activating your premium subscription...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
              <span className="text-3xl">!</span>
            </div>
            <h1 className="text-2xl font-bold">Something went wrong</h1>
            <p className="text-muted-foreground">{error}</p>
            <Button asChild>
              <Link href="/premium">Try again</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-lg w-full border-2 border-orange-500/20">
        <CardContent className="p-8 space-y-6">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl font-bold">Welcome to Premium!</h1>
              <p className="text-muted-foreground">
                Your subscription is now active. You have full access to all premium features.
              </p>
            </div>
          </div>

          <div className="bg-secondary/50 rounded-lg p-4 space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-orange-500" />
              What's included in Premium:
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                AI-powered Virtual Analyst Reports
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                Stock ratings comparisons
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                Factor and dividend grades
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                10 years of earnings call transcripts
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                SEC filings and press releases
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              asChild
              className="w-full bg-orange-500 hover:bg-orange-600"
            >
              <Link href="/dashboard">
                Go to Dashboard
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link href="/settings/subscription">
                Manage Subscription
              </Link>
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            A confirmation email has been sent to your email address.
            If you have any questions, please contact{" "}
            <a href="mailto:support@quantview.com" className="text-orange-500 hover:underline">
              support@quantview.com
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default function PremiumSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-orange-500" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
}
