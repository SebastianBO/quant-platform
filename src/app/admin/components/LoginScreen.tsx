"use client"

import { memo } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Shield, Loader2 } from "lucide-react"

interface LoginScreenProps {
  password: string
  setPassword: (value: string) => void
  loading: boolean
  error: string | null
  onLogin: () => void
}

function LoginScreenComponent({
  password,
  setPassword,
  loading,
  error,
  onLogin
}: LoginScreenProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <CardTitle>Lician Admin Dashboard</CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            System monitoring for 150+ edge functions and 90+ database tables
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Input
              type="password"
              placeholder="Admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onLogin()}
            />
            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}
            <Button
              onClick={onLogin}
              disabled={loading || !password}
              className="w-full"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Access Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export const LoginScreen = memo(LoginScreenComponent)
