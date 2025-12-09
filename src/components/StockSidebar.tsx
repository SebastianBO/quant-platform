"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  TrendingUp,
  Snowflake,
  Calculator,
  Brain,
  Activity,
  BarChart3,
  Percent,
  Newspaper,
  FileText,
  Users,
  Search,
  Briefcase,
  ChevronRight,
  AlertTriangle,
  Building2,
  ScrollText,
  Banknote,
  Target,
  UserCheck,
  PieChart
} from "lucide-react"

interface StockSidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
  className?: string
}

const sidebarItems = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'quant', label: 'Quant', icon: TrendingUp },
  { id: 'snowflake', label: 'Snowflake', icon: Snowflake },
  { id: 'ip', label: 'IP Valuation', icon: Calculator },
  { id: 'dcf', label: 'DCF', icon: Calculator },
  { id: 'ai', label: 'AI Analysis', icon: Brain },
  { id: 'analysts', label: 'Analysts', icon: Target },
  { id: 'technical', label: 'Technical', icon: Activity },
  { id: 'short', label: 'Short Volume', icon: AlertTriangle },
  { id: 'borrow', label: 'Borrow Cost', icon: Banknote },
  { id: 'options', label: 'Options', icon: BarChart3 },
  { id: 'insiders', label: 'Insiders', icon: UserCheck },
  { id: 'institutional', label: 'Institutional', icon: Building2 },
  { id: 'ownership', label: 'Ownership', icon: PieChart },
  { id: 'sec', label: 'SEC Filings', icon: ScrollText },
  { id: 'treasury', label: 'Yields', icon: Percent },
  { id: 'news', label: 'News', icon: Newspaper },
  { id: 'financials', label: 'Financials', icon: FileText },
  { id: 'peers', label: 'Peers', icon: Users },
]

export default function StockSidebar({
  activeTab,
  onTabChange,
  className
}: StockSidebarProps) {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)

  return (
    <aside className={cn("w-44 flex-shrink-0", className)}>
      <nav className="sticky top-24 space-y-0.5">
        {sidebarItems.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id
          const isHovered = hoveredItem === item.id

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              onMouseEnter={() => setHoveredItem(item.id)}
              onMouseLeave={() => setHoveredItem(null)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-green-500/10 text-green-500"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              )}
            >
              <Icon className={cn(
                "w-4 h-4 transition-transform duration-200",
                (isActive || isHovered) && "scale-110"
              )} />
              <span>{item.label}</span>
              {isActive && (
                <ChevronRight className="w-3 h-3 ml-auto opacity-50" />
              )}
            </button>
          )
        })}
      </nav>
    </aside>
  )
}
