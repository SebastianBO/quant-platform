"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase-browser"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mode, setMode] = useState<"login" | "signup" | "magic">("login")
  const [message, setMessage] = useState<string | null>(null)

  // Check for signup query param
  useEffect(() => {
    if (searchParams.get('signup') === 'true') {
      setMode('signup')
    }
  }, [searchParams])

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (mode === "magic") {
      // Magic link login
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        setError(error.message)
      } else {
        setMessage("Check your email for the login link!")
      }
    } else if (mode === "signup") {
      // Sign up
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        setError(error.message)
      } else {
        setMessage("Check your email to confirm your account!")
      }
    } else {
      // Login
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(error.message)
      } else {
        router.push("/dashboard")
        router.refresh()
      }
    }

    setLoading(false)
  }

  const handleOAuthLogin = async (provider: "google" | "apple") => {
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md bg-[#1a1a1a] border-white/[0.08]">
      <CardHeader className="text-center">
        <Link href="/" className="flex items-center justify-center gap-2 mb-4">
          <div className="w-10 h-10 bg-foreground rounded-xl flex items-center justify-center">
            <span className="text-background font-bold text-xl">L</span>
          </div>
        </Link>
        <CardTitle className="text-2xl">
          {mode === "signup" ? "Create your account" : "Welcome back"}
        </CardTitle>
        <p className="text-[#868f97] text-sm mt-2">
          {mode === "signup"
            ? "Start your investment journey with Lician"
            : "Sign in to access your portfolio"}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* OAuth Buttons */}
        <div className="space-y-3">
          <Button
            variant="outline"
            className="w-full h-12 bg-white hover:bg-gray-50 text-black border-gray-300 transition-colors duration-100"
            onClick={() => handleOAuthLogin("google")}
            disabled={loading}
          >
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </Button>

          <Button
            variant="outline"
            className="w-full h-12 bg-black hover:bg-gray-900 text-white border-black transition-colors duration-100"
            onClick={() => handleOAuthLogin("apple")}
            disabled={loading}
          >
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
            </svg>
            Continue with Apple
          </Button>
        </div>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-white/[0.08]" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-[#1a1a1a] px-2 text-[#868f97]">Or continue with email</span>
          </div>
        </div>

        {/* Email Form */}
        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div>
            <Input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 bg-white/[0.05] border-white/[0.08]"
              required
            />
          </div>

          {mode !== "magic" && (
            <div>
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 bg-white/[0.05] border-white/[0.08]"
                required
                minLength={6}
              />
            </div>
          )}

          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}

          {message && (
            <p className="text-[#4ebe96] text-sm text-center">{message}</p>
          )}

          <Button
            type="submit"
            className="w-full h-12 bg-foreground text-background hover:bg-foreground/90 transition-colors duration-100"
            disabled={loading}
          >
            {loading ? "Loading..." : mode === "signup" ? "Create account" : mode === "magic" ? "Send magic link" : "Sign in"}
          </Button>
        </form>

        {/* Mode Switchers */}
        <div className="text-center space-y-2 text-sm">
          {mode === "login" && (
            <>
              <button
                type="button"
                onClick={() => setMode("magic")}
                className="text-[#868f97] hover:text-white block w-full transition-colors duration-100"
              >
                Sign in with magic link instead
              </button>
              <p className="text-[#868f97]">
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => setMode("signup")}
                  className="text-white font-medium hover:underline"
                >
                  Sign up
                </button>
              </p>
            </>
          )}

          {mode === "signup" && (
            <p className="text-[#868f97]">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => setMode("login")}
                className="text-white font-medium hover:underline"
              >
                Sign in
              </button>
            </p>
          )}

          {mode === "magic" && (
            <button
              type="button"
              onClick={() => setMode("login")}
              className="text-[#868f97] hover:text-white transition-colors duration-100"
            >
              Back to password login
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-6">
      <Suspense fallback={
        <Card className="w-full max-w-md bg-[#1a1a1a] border-white/[0.08]">
          <CardContent className="p-8 text-center">
            <div className="animate-pulse">Loading...</div>
          </CardContent>
        </Card>
      }>
        <LoginForm />
      </Suspense>
    </main>
  )
}
