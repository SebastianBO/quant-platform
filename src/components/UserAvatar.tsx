"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase-browser"
import { LogOut, Settings, User, Briefcase, CreditCard } from "lucide-react"
import { cn } from "@/lib/utils"
import type { User as SupabaseUser } from "@supabase/supabase-js"

// Cute default avatars (same as portfoliocare-expo)
const DEFAULT_AVATARS = [
  "https://fwwyhbnhazkzcbarefpw.supabase.co/storage/v1/object/sign/component-covers/COMMONS/avatars/avatar_0.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV81ZDBhNTNlMy1mNGQwLTRiNjgtYTY0NS1jMjM3YzhmNGQxZWYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJjb21wb25lbnQtY292ZXJzL0NPTU1PTlMvYXZhdGFycy9hdmF0YXJfMC5wbmciLCJpYXQiOjE3NTA4MDQ5MjEsImV4cCI6MTkwODQ4NDkyMX0.FZcCX6DusoAhUVU5saqUSB4JLet0IdGbXXfddR0N6DE",
  "https://fwwyhbnhazkzcbarefpw.supabase.co/storage/v1/object/sign/component-covers/COMMONS/avatars/avatar_1.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV81ZDBhNTNlMy1mNGQwLTRiNjgtYTY0NS1jMjM3YzhmNGQxZWYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJjb21wb25lbnQtY292ZXJzL0NPTU1PTlMvYXZhdGFycy9hdmF0YXJfMS5wbmciLCJpYXQiOjE3NTA4MDUzMTksImV4cCI6MTkwODQ4NTMxOX0.2ae0s7zzM0kfP0Dl_9BSbZJ_JRA3C5A5WAu8w340FoE",
  "https://fwwyhbnhazkzcbarefpw.supabase.co/storage/v1/object/sign/component-covers/COMMONS/avatars/avatar_2.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV81ZDBhNTNlMy1mNGQwLTRiNjgtYTY0NS1jMjM3YzhmNGQxZWYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJjb21wb25lbnQtY292ZXJzL0NPTU1PTlMvYXZhdGFycy9hdmF0YXJfMi5wbmciLCJpYXQiOjE3NTA4MDUzMzgsImV4cCI6MTkwODQ4NTMzOH0.FxeHxyPHV1tmTw_dxcKo2AdCrGFKvzzZz2bDeCj05LE",
  "https://fwwyhbnhazkzcbarefpw.supabase.co/storage/v1/object/sign/component-covers/COMMONS/avatars/avatar_3.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV81ZDBhNTNlMy1mNGQwLTRiNjgtYTY0NS1jMjM3YzhmNGQxZWYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJjb21wb25lbnQtY292ZXJzL0NPTU1PTlMvYXZhdGFycy9hdmF0YXJfMy5wbmciLCJpYXQiOjE3NTA4MDU0OTQsImV4cCI6MTg3Njk0OTQ5NH0.2fQJUYwHFjiR_Q-Xkg-2AvhUUyxWXB35cJgwemZfpFk",
  "https://fwwyhbnhazkzcbarefpw.supabase.co/storage/v1/object/sign/component-covers/COMMONS/avatars/avatar_4.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV81ZDBhNTNlMy1mNGQwLTRiNjgtYTY0NS1jMjM3YzhmNGQxZWYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJjb21wb25lbnQtY292ZXJzL0NPTU1PTlMvYXZhdGFycy9hdmF0YXJfNC5wbmciLCJpYXQiOjE3NTA4MDU1MTEsImV4cCI6MTg0NTQxMzUxMX0.f8IjTNZ6IIypb1J96h_krXOTJB4ILv9aSv9D-31pPaU",
  "https://fwwyhbnhazkzcbarefpw.supabase.co/storage/v1/object/sign/component-covers/COMMONS/avatars/avatar_6.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV81ZDBhNTNlMy1mNGQwLTRiNjgtYTY0NS1jMjM3YzhmNGQxZWYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJjb21wb25lbnQtY292ZXJzL0NPTU1PTlMvYXZhdGFycy9hdmF0YXJfNi5wbmciLCJpYXQiOjE3NTA4MDU2MjUsImV4cCI6MTg3Njk0OTYyNX0.UWDFtvSGSy8SUNI4OklT-iH_wjqPjsHoNZ819S0dBo8",
  "https://fwwyhbnhazkzcbarefpw.supabase.co/storage/v1/object/sign/component-covers/COMMONS/avatars/avatar_7.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV81ZDBhNTNlMy1mNGQwLTRiNjgtYTY0NS1jMjM3YzhmNGQxZWYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJjb21wb25lbnQtY292ZXJzL0NPTU1PTlMvYXZhdGFycy9hdmF0YXJfNy5wbmciLCJpYXQiOjE3NTA4MDU1MzcsImV4cCI6MTg3Njk0OTUzN30.R6OOXnXxK-szoWouhsOLg_hVTxANM334hmhJ9dzfiE4",
  "https://fwwyhbnhazkzcbarefpw.supabase.co/storage/v1/object/sign/component-covers/COMMONS/avatars/avatar_8.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV81ZDBhNTNlMy1mNGQwLTRiNjgtYTY0NS1jMjM3YzhmNGQxZWYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJjb21wb25lbnQtY292ZXJzL0NPTU1PTlMvYXZhdGFycy9hdmF0YXJfOC5wbmciLCJpYXQiOjE3NTA4MDU1NjksImV4cCI6MTg3Njk0OTU2OX0.HAZAww1uUBlys_1X09mGh2QcjWrqKT8jPrKhQUvReuU",
]

// Get a consistent avatar based on user ID
function getDefaultAvatar(userId: string): string {
  // Use a simple hash of the user ID to pick a consistent avatar
  let hash = 0
  for (let i = 0; i < userId.length; i++) {
    hash = ((hash << 5) - hash) + userId.charCodeAt(i)
    hash = hash & hash
  }
  const index = Math.abs(hash) % DEFAULT_AVATARS.length
  return DEFAULT_AVATARS[index]
}

interface UserProfile {
  id: string
  email?: string
  username?: string | null
  full_name?: string | null
  avatar_url?: string | null
}

export default function UserAvatar() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser()
        setUser(authUser)

        if (authUser) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authUser.id)
            .single()

          setProfile({
            id: authUser.id,
            email: authUser.email,
            username: profileData?.username || null,
            full_name: profileData?.full_name || null,
            avatar_url: profileData?.avatar_url || null,
          })
        }
      } catch (e) {
        console.error('Error fetching user:', e)
      }
      setLoading(false)
    }

    fetchUser()

    const { data: authListener } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      setUser(session?.user ?? null)
      if (!session?.user) {
        setProfile(null)
      }
    })

    return () => authListener?.subscription?.unsubscribe?.()
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setDropdownOpen(false)
    router.push("/")
    router.refresh()
  }

  if (loading) {
    return (
      <div className="w-10 h-10 rounded-full bg-secondary animate-pulse" />
    )
  }

  if (!user) {
    return (
      <Link href="/login">
        <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-600 hover:bg-green-500 text-white text-sm font-medium transition-colors">
          <User className="w-4 h-4" />
          Sign in
        </button>
      </Link>
    )
  }

  const avatarUrl = profile?.avatar_url || getDefaultAvatar(user.id)
  const displayName = profile?.full_name || profile?.username || user.email?.split('@')[0] || 'User'

  return (
    <div className="relative z-50" ref={dropdownRef}>
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="relative flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-green-500/50 transition-all cursor-pointer bg-secondary/50 hover:bg-secondary"
      >
        <img
          src={avatarUrl}
          alt={displayName}
          className="w-10 h-10 rounded-full object-cover bg-secondary border-2 border-green-500/30"
          onError={(e) => {
            // Fallback to default avatar on error
            (e.target as HTMLImageElement).src = getDefaultAvatar(user.id)
          }}
        />
        {/* Online indicator */}
        <span className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
      </button>

      {/* Dropdown Menu */}
      {dropdownOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-card border border-border rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* User info header */}
          <div className="p-4 bg-secondary/30 border-b border-border">
            <div className="flex items-center gap-3">
              <img
                src={avatarUrl}
                alt={displayName}
                className="w-12 h-12 rounded-full object-cover bg-secondary"
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{displayName}</p>
                <p className="text-sm text-muted-foreground truncate">{user.email}</p>
              </div>
            </div>
          </div>

          {/* Menu items */}
          <div className="p-2">
            <Link
              href="/dashboard"
              onClick={() => setDropdownOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-secondary/50 transition-colors group"
            >
              <Briefcase className="w-4 h-4 text-muted-foreground group-hover:text-green-500" />
              <span className="text-sm">My Portfolios</span>
            </Link>

            <Link
              href="/premium"
              onClick={() => setDropdownOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-secondary/50 transition-colors group"
            >
              <CreditCard className="w-4 h-4 text-muted-foreground group-hover:text-green-500" />
              <span className="text-sm">Subscription</span>
            </Link>

            <button
              onClick={() => {
                setDropdownOpen(false)
                // TODO: Implement settings page
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-secondary/50 transition-colors group"
            >
              <Settings className="w-4 h-4 text-muted-foreground group-hover:text-green-500" />
              <span className="text-sm">Settings</span>
            </button>

            <div className="my-2 border-t border-border" />

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-red-500/10 transition-colors group"
            >
              <LogOut className="w-4 h-4 text-muted-foreground group-hover:text-red-500" />
              <span className="text-sm group-hover:text-red-500">Sign out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
