"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  MessageSquare,
  TrendingUp,
  Briefcase,
  LayoutGrid,
  User,
} from "lucide-react"

const tabs = [
  { id: "chat", label: "Chat", icon: MessageSquare, href: "/" },
  { id: "markets", label: "Markets", icon: TrendingUp, href: "/markets" },
  { id: "portfolio", label: "Portfolio", icon: Briefcase, href: "/dashboard/portfolios" },
  { id: "more", label: "More", icon: LayoutGrid, href: "/screener" },
  { id: "account", label: "Account", icon: User, href: "/dashboard" },
]

interface MobileTabBarProps {
  className?: string
}

export function MobileTabBar({ className }: MobileTabBarProps) {
  const pathname = usePathname()

  const getActiveTab = () => {
    if (pathname === "/" || pathname.startsWith("/chat")) return "chat"
    if (pathname.startsWith("/markets") || pathname.startsWith("/stock")) return "markets"
    if (pathname.startsWith("/dashboard/portfolios") || pathname.startsWith("/portfolio")) return "portfolio"
    if (pathname.startsWith("/dashboard") || pathname.startsWith("/settings")) return "account"
    return "more"
  }

  const activeTab = getActiveTab()

  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 md:hidden",
        "bg-background/80 backdrop-blur-xl border-t border-border",
        "safe-area-bottom",
        className
      )}
    >
      <div className="flex items-center justify-around px-2 py-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          const Icon = tab.icon

          return (
            <Link
              key={tab.id}
              href={tab.href}
              className="relative flex flex-col items-center gap-1 py-1.5 px-4 min-w-[64px]"
            >
              {/* Active indicator */}
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-green-500/10 rounded-xl"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}

              <motion.div
                animate={{
                  scale: isActive ? 1 : 0.95,
                  y: isActive ? -2 : 0,
                }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              >
                <Icon
                  className={cn(
                    "w-5 h-5 transition-colors",
                    isActive ? "text-green-500" : "text-muted-foreground"
                  )}
                />
              </motion.div>

              <span
                className={cn(
                  "text-[10px] font-medium transition-colors",
                  isActive ? "text-green-500" : "text-muted-foreground"
                )}
              >
                {tab.label}
              </span>

              {/* Active dot */}
              {isActive && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-0.5 w-1 h-1 bg-green-500 rounded-full"
                />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

export default MobileTabBar
