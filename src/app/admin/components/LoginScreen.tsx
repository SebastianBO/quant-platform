"use client"

import { memo } from "react"
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
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl p-8 motion-safe:transition-all motion-safe:duration-150 ease-out">
        <div className="text-center mb-6">
          <div className="mx-auto w-12 h-12 bg-[#4ebe96]/10 rounded-full flex items-center justify-center mb-4">
            <Shield className="w-6 h-6 text-[#4ebe96]" />
          </div>
          <h2 className="text-2xl font-semibold text-white mb-2">Lician Admin Dashboard</h2>
          <p className="text-sm text-[#868f97]">
            System monitoring for 150+ edge functions and 90+ database tables
          </p>
        </div>
        <div className="space-y-4">
          <input
            type="password"
            placeholder="Admin password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onLogin()}
            className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-2xl text-white placeholder:text-[#868f97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4ebe96] motion-safe:transition-all motion-safe:duration-150 ease-out"
          />
          {error && (
            <p className="text-sm text-[#ff5c5c]">{error}</p>
          )}
          <button
            onClick={onLogin}
            disabled={loading || !password}
            className="w-full px-4 py-3 bg-[#4ebe96] text-black font-medium rounded-full disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4ebe96] focus-visible:ring-offset-2 focus-visible:ring-offset-black motion-safe:transition-all motion-safe:duration-150 ease-out hover:bg-[#4ebe96]/90"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Access Dashboard
              </span>
            ) : (
              'Access Dashboard'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export const LoginScreen = memo(LoginScreenComponent)
