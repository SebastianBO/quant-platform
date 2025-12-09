"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-green-500" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">Please sign in to access settings</p>
            <Link href="/login">
              <Button>Sign in</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="p-2 hover:bg-secondary rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-semibold">Settings</h1>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        {/* Profile Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Email</label>
              <Input value={user.email || ""} disabled className="bg-secondary/50" />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Full Name</label>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your full name"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Username</label>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="@username"
              />
            </div>
            <Button onClick={handleSaveProfile} disabled={saving} className="bg-green-600 hover:bg-green-500">
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Moon className="w-5 h-5" />
              Appearance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Theme</p>
                <p className="text-sm text-muted-foreground">Switch between light and dark mode</p>
              </div>
              <ThemeToggle />
            </div>
          </CardContent>
        </Card>

        {/* Subscription */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Subscription
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Current Plan</p>
                <p className="text-sm text-muted-foreground">Free tier</p>
              </div>
              <Link href="/premium">
                <Button variant="outline">Upgrade</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Notification settings coming soon...</p>
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Security
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Security settings coming soon...</p>
          </CardContent>
        </Card>

        {/* Sign Out */}
        <Card className="border-red-500/20">
          <CardContent className="py-4">
            <Button
              variant="outline"
              className="w-full border-red-500/50 text-red-500 hover:bg-red-500/10"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign out
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
