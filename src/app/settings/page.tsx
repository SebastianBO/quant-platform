"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase-browser"
import { ArrowLeft, User, Bell, Shield, CreditCard, Moon, LogOut } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

export default function SettingsPage() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [fullName, setFullName] = useState("")
  const [username, setUsername] = useState("")

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      setUser(authUser)

      if (authUser) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single()

        if (profileData) {
          setProfile(profileData)
          setFullName(profileData.full_name || "")
          setUsername(profileData.username || "")
        }
      }
      setLoading(false)
    }

    fetchUser()
  }, [])

  const handleSaveProfile = async () => {
    if (!user) return
    setSaving(true)

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: fullName,
          username: username,
          updated_at: new Date().toISOString()
        })

      if (error) throw error
      alert("Profile saved successfully!")
    } catch (error) {
      console.error('Error saving profile:', error)
      alert("Failed to save profile")
    }
    setSaving(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  if (loading) {
    return (
      <div className="min-h-dvh bg-black flex items-center justify-center">
        <div className="motion-safe:animate-spin rounded-full h-8 w-8 border-t-2 border-[#4ebe96]" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-dvh bg-black flex items-center justify-center">
        <div className="w-full max-w-md bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl p-12 text-center">
          <p className="text-[#868f97] mb-4">Please sign in to access settings</p>
          <Link
            href="/login"
            className="inline-block px-6 py-3 bg-[#4ebe96] text-white rounded-full font-medium hover:bg-[#4ebe96]/90 motion-safe:transition-all motion-safe:duration-150 ease-out focus-visible:ring-2 focus-visible:ring-[#4ebe96] focus-visible:outline-none"
          >
            Sign in
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-black">
      <header className="sticky top-0 z-50 bg-black/95 backdrop-blur-[10px] border-b border-white/[0.08]">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-white/[0.05] rounded-full motion-safe:transition-all motion-safe:duration-150 ease-out focus-visible:ring-2 focus-visible:ring-[#4ebe96] focus-visible:outline-none"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-semibold">Settings</h1>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        {/* Profile Section */}
        <div className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl p-6 hover:bg-white/[0.05] hover:border-white/[0.15] motion-safe:transition-all motion-safe:duration-150 ease-out">
          <div className="flex items-center gap-2 mb-6">
            <User className="w-5 h-5" />
            <h2 className="text-lg font-semibold">Profile</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-[#868f97] mb-1 block">Email</label>
              <input
                type="email"
                value={user.email || ""}
                disabled
                className="w-full px-4 py-2 bg-white/[0.02] border border-white/[0.08] rounded-2xl text-white placeholder-[#868f97] focus-visible:ring-2 focus-visible:ring-[#4ebe96] focus-visible:outline-none motion-safe:transition-all motion-safe:duration-150 ease-out disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
            <div>
              <label className="text-sm text-[#868f97] mb-1 block">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your full name"
                className="w-full px-4 py-2 bg-white/[0.02] border border-white/[0.08] rounded-2xl text-white placeholder-[#868f97] hover:border-white/[0.15] focus-visible:ring-2 focus-visible:ring-[#4ebe96] focus-visible:outline-none motion-safe:transition-all motion-safe:duration-150 ease-out"
              />
            </div>
            <div>
              <label className="text-sm text-[#868f97] mb-1 block">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="@username"
                className="w-full px-4 py-2 bg-white/[0.02] border border-white/[0.08] rounded-2xl text-white placeholder-[#868f97] hover:border-white/[0.15] focus-visible:ring-2 focus-visible:ring-[#4ebe96] focus-visible:outline-none motion-safe:transition-all motion-safe:duration-150 ease-out"
              />
            </div>
            <button
              onClick={handleSaveProfile}
              disabled={saving}
              className="px-6 py-3 bg-[#4ebe96] text-white rounded-full font-medium hover:bg-[#4ebe96]/90 motion-safe:transition-all motion-safe:duration-150 ease-out focus-visible:ring-2 focus-visible:ring-[#4ebe96] focus-visible:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>

        {/* Appearance */}
        <div className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl p-6 hover:bg-white/[0.05] hover:border-white/[0.15] motion-safe:transition-all motion-safe:duration-150 ease-out">
          <div className="flex items-center gap-2 mb-6">
            <Moon className="w-5 h-5" />
            <h2 className="text-lg font-semibold">Appearance</h2>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Theme</p>
              <p className="text-sm text-[#868f97]">Switch between light and dark mode</p>
            </div>
            <ThemeToggle />
          </div>
        </div>

        {/* Subscription */}
        <div className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl p-6 hover:bg-white/[0.05] hover:border-white/[0.15] motion-safe:transition-all motion-safe:duration-150 ease-out">
          <div className="flex items-center gap-2 mb-6">
            <CreditCard className="w-5 h-5" />
            <h2 className="text-lg font-semibold">Subscription</h2>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Current Plan</p>
              <p className="text-sm text-[#868f97]">Free tier</p>
            </div>
            <Link
              href="/premium"
              className="px-6 py-2 bg-white/[0.03] border border-white/[0.08] rounded-full font-medium hover:bg-white/[0.05] hover:border-white/[0.15] motion-safe:transition-all motion-safe:duration-150 ease-out focus-visible:ring-2 focus-visible:ring-[#4ebe96] focus-visible:outline-none"
            >
              Upgrade
            </Link>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl p-6 hover:bg-white/[0.05] hover:border-white/[0.15] motion-safe:transition-all motion-safe:duration-150 ease-out">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="w-5 h-5" />
            <h2 className="text-lg font-semibold">Notifications</h2>
          </div>
          <p className="text-sm text-[#868f97]">Notification settings coming soon...</p>
        </div>

        {/* Security */}
        <div className="bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl p-6 hover:bg-white/[0.05] hover:border-white/[0.15] motion-safe:transition-all motion-safe:duration-150 ease-out">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5" />
            <h2 className="text-lg font-semibold">Security</h2>
          </div>
          <p className="text-sm text-[#868f97]">Security settings coming soon...</p>
        </div>

        {/* Sign Out */}
        <div className="bg-white/[0.03] backdrop-blur-[10px] border border-[#ff5c5c]/20 rounded-2xl p-4 hover:bg-white/[0.05] hover:border-[#ff5c5c]/30 motion-safe:transition-all motion-safe:duration-150 ease-out">
          <button
            onClick={handleLogout}
            className="w-full px-6 py-3 bg-transparent border border-[#ff5c5c]/50 text-[#ff5c5c] rounded-full font-medium hover:bg-[#ff5c5c]/10 hover:border-[#ff5c5c] motion-safe:transition-all motion-safe:duration-150 ease-out focus-visible:ring-2 focus-visible:ring-[#ff5c5c] focus-visible:outline-none flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </main>
    </div>
  )
}
