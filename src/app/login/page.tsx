"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase-browser"

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
    <div className="w-full max-w-md bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl">
      <div className="p-6 text-center">
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 mb-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 rounded-xl"
        >
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
            <span className="text-black font-bold text-xl">L</span>
          </div>
        </Link>
        <h1 className="text-2xl font-semibold text-white tracking-[-0.02em]">
          {mode === "signup" ? "Create your account" : "Welcome back"}
        </h1>
        <p className="text-[#868f97] text-sm mt-2">
          {mode === "signup"
            ? "Start your investment journey with Lician"
            : "Sign in to access your portfolio"}
        </p>
      </div>
      <div className="px-6 pb-6 space-y-4">
        {/* OAuth Buttons */}
        <div className="space-y-3">
          <button
            type="button"
            className="w-full h-12 flex items-center justify-center bg-white hover:opacity-90 text-black font-medium rounded-full motion-safe:transition-opacity motion-safe:duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:opacity-50"
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
          </button>

          <button
            type="button"
            className="w-full h-12 flex items-center justify-center bg-transparent border border-white/[0.15] hover:bg-white/[0.05] hover:border-white/[0.25] text-white font-medium rounded-full motion-safe:transition-all motion-safe:duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 disabled:opacity-50"
            onClick={() => handleOAuthLogin("apple")}
            disabled={loading}
          >
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
            </svg>
            Continue with Apple
          </button>
        </div>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-white/[0.08]" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-black px-2 text-[#868f97]">Or continue with email</span>
          </div>
        </div>

        {/* Email Form */}
        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div>
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-12 px-4 text-base bg-white/[0.04] border border-white/[0.08] rounded-lg text-white placeholder:text-[#868f97] focus:border-white/[0.24] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 motion-safe:transition-colors motion-safe:duration-150"
              required
            />
          </div>

          {mode !== "magic" && (
            <div>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-12 px-4 text-base bg-white/[0.04] border border-white/[0.08] rounded-lg text-white placeholder:text-[#868f97] focus:border-white/[0.24] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 motion-safe:transition-colors motion-safe:duration-150"
                required
                minLength={6}
              />
            </div>
          )}

          {error && (
            <p className="text-[#ff5c5c] text-sm text-center">{error}</p>
          )}

          {message && (
            <p className="text-[#4ebe96] text-sm text-center">{message}</p>
          )}

          <button
            type="submit"
            className="w-full h-12 bg-white text-black font-semibold rounded-full hover:opacity-90 motion-safe:transition-opacity motion-safe:duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Loading..." : mode === "signup" ? "Create account" : mode === "magic" ? "Send magic link" : "Sign in"}
          </button>
        </form>

        {/* Mode Switchers */}
        <div className="text-center space-y-2 text-sm">
          {mode === "login" && (
            <>
              <button
                type="button"
                onClick={() => setMode("magic")}
                className="text-[#868f97] hover:text-white block w-full motion-safe:transition-colors motion-safe:duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 rounded"
              >
                Sign in with magic link instead
              </button>
              <p className="text-[#868f97]">
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  onClick={() => setMode("signup")}
                  className="text-[#479ffa] font-medium hover:opacity-80 motion-safe:transition-opacity motion-safe:duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 rounded"
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
                className="text-[#479ffa] font-medium hover:opacity-80 motion-safe:transition-opacity motion-safe:duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 rounded"
              >
                Sign in
              </button>
            </p>
          )}

          {mode === "magic" && (
            <button
              type="button"
              onClick={() => setMode("login")}
              className="text-[#868f97] hover:text-white motion-safe:transition-colors motion-safe:duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 rounded"
            >
              Back to password login
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-black flex items-center justify-center p-6">
      <Suspense fallback={
        <div className="w-full max-w-md bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl">
          <div className="p-8 text-center">
            <div className="animate-pulse text-white">Loading...</div>
          </div>
        </div>
      }>
        <LoginForm />
      </Suspense>
    </main>
  )
}
