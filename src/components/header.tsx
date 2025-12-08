"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Menu, X, ChevronDown, LogOut, User } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { createClient } from "@/lib/supabase-browser"
import type { User as SupabaseUser } from "@supabase/supabase-js"

export function Header() {
  const router = useRouter()
  const supabase = createClient()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    const getUser = async () => {
      try {
        const response = await supabase.auth.getUser()
        setUser(response?.data?.user ?? null)
      } catch (e) {
        setUser(null)
      }
      setLoading(false)
    }
    getUser()

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      setUser(session?.user ?? null)
    })

    return () => authListener?.subscription?.unsubscribe?.()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-foreground rounded-lg flex items-center justify-center">
              <span className="text-background font-bold text-lg">L</span>
            </div>
            <span className="font-semibold text-lg text-foreground">Lician</span>
          </Link>

          <div className="hidden lg:flex items-center gap-6">
            <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Features
            </Link>
            <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
              Use cases <ChevronDown className="w-4 h-4" />
            </button>
            <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
              Platforms <ChevronDown className="w-4 h-4" />
            </button>
            <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
              Discover <ChevronDown className="w-4 h-4" />
            </button>
            <Link href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </Link>
            <Link href="#contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Contact sales
            </Link>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-3">
          <ThemeToggle />
          {loading ? (
            <div className="w-20 h-9 bg-secondary animate-pulse rounded-lg" />
          ) : user ? (
            <>
              <Link href="/dashboard">
                <Button variant="outline" className="border-border text-foreground hover:bg-secondary bg-transparent gap-2">
                  <User className="w-4 h-4" />
                  Dashboard
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="text-muted-foreground hover:text-foreground"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="outline" className="border-border text-foreground hover:bg-secondary bg-transparent">
                  Sign in
                </Button>
              </Link>
              <Link href="/login">
                <Button className="bg-foreground text-background hover:bg-foreground/90">Get started</Button>
              </Link>
            </>
          )}
        </div>

        <button className="lg:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X className="w-6 h-6 text-foreground" /> : <Menu className="w-6 h-6 text-foreground" />}
        </button>
      </nav>

      {mobileMenuOpen && (
        <div className="lg:hidden bg-background border-t border-border">
          <div className="px-6 py-4 space-y-4">
            <Link href="#features" className="block text-sm text-muted-foreground hover:text-foreground">
              Features
            </Link>
            <Link href="#" className="block text-sm text-muted-foreground hover:text-foreground">
              Use cases
            </Link>
            <Link href="#" className="block text-sm text-muted-foreground hover:text-foreground">
              Platforms
            </Link>
            <Link href="#pricing" className="block text-sm text-muted-foreground hover:text-foreground">
              Pricing
            </Link>
            <Link href="#contact" className="block text-sm text-muted-foreground hover:text-foreground">
              Contact sales
            </Link>
            <div className="flex flex-col gap-2 pt-4">
              {user ? (
                <>
                  <Link href="/dashboard" className="w-full">
                    <Button variant="outline" className="w-full border-border text-foreground bg-transparent">
                      Dashboard
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    className="w-full border-border text-foreground bg-transparent"
                    onClick={handleLogout}
                  >
                    Sign out
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login" className="w-full">
                    <Button variant="outline" className="w-full border-border text-foreground bg-transparent">
                      Sign in
                    </Button>
                  </Link>
                  <Link href="/login" className="w-full">
                    <Button className="w-full bg-foreground text-background">Get started</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
