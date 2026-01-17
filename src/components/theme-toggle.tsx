"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <button className="w-9 h-9 rounded-md bg-white/[0.05] border border-white/[0.08] flex items-center justify-center transition-colors duration-100">
        <Sun className="h-4 w-4 text-[#868f97]" />
      </button>
    )
  }

  return (
    <button
      className="w-9 h-9 rounded-md bg-white/[0.05] border border-white/[0.08] text-white hover:bg-white/[0.08] transition-colors duration-100 flex items-center justify-center"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      {theme === "dark" ? (
        <Sun className="h-4 w-4 text-white" />
      ) : (
        <Moon className="h-4 w-4 text-[#868f97]" />
      )}
      <span className="sr-only">Toggle theme</span>
    </button>
  )
}
