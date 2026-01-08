"use client"

import { cn } from "@/lib/utils"
import { Database, Globe, FileText, Building2, BarChart3, Brain, Sparkles } from "lucide-react"

export type SourceType = "lician" | "web" | "sec" | "company" | "market" | "deep-thinking" | "firecrawl"

interface SourceBadgeProps {
  type: SourceType
  label?: string
  className?: string
}

const SOURCE_CONFIG = {
  lician: {
    icon: Database,
    label: "Lician Data",
    color: "bg-green-500/10 text-green-600 border-green-500/20",
  },
  web: {
    icon: Globe,
    label: "Web Research",
    color: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  },
  sec: {
    icon: FileText,
    label: "SEC Filing",
    color: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  },
  company: {
    icon: Building2,
    label: "Company Data",
    color: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  },
  market: {
    icon: BarChart3,
    label: "Market Data",
    color: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20",
  },
  "deep-thinking": {
    icon: Brain,
    label: "Deep Thinking",
    color: "bg-violet-500/10 text-violet-600 border-violet-500/20",
  },
  firecrawl: {
    icon: Sparkles,
    label: "Firecrawl",
    color: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  },
}

export function SourceBadge({ type, label, className }: SourceBadgeProps) {
  const config = SOURCE_CONFIG[type]
  const Icon = config.icon

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full border",
        config.color,
        className
      )}
    >
      <Icon className="w-3 h-3" />
      {label || config.label}
    </span>
  )
}

interface SourceCitationProps {
  sources: Array<{
    type: SourceType
    name: string
    url?: string
  }>
  className?: string
}

export function SourceCitation({ sources, className }: SourceCitationProps) {
  if (!sources.length) return null

  return (
    <div className={cn("flex flex-wrap gap-2 mt-3 pt-3 border-t border-border/50", className)}>
      <span className="text-xs text-muted-foreground">Sources:</span>
      {sources.map((source, i) => (
        source.url ? (
          <a
            key={i}
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:opacity-80 transition-opacity"
          >
            <SourceBadge type={source.type} label={source.name} />
          </a>
        ) : (
          <SourceBadge key={i} type={source.type} label={source.name} />
        )
      ))}
    </div>
  )
}
