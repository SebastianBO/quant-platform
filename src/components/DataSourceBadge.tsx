"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { DATA_SOURCES, type DataSourceId, type DataSource } from "@/lib/data-sources"
import { Database, ExternalLink, Info } from "lucide-react"

interface DataSourceBadgeProps {
  source: DataSourceId | DataSourceId[]
  className?: string
  showTooltip?: boolean
  size?: 'sm' | 'md'
}

const colorMap: Record<string, string> = {
  blue: 'bg-blue-500/10 text-blue-500 border-blue-500/30',
  purple: 'bg-purple-500/10 text-purple-500 border-purple-500/30',
  green: 'bg-green-500/10 text-green-500 border-green-500/30',
  orange: 'bg-orange-500/10 text-orange-500 border-orange-500/30',
  red: 'bg-red-500/10 text-red-500 border-red-500/30',
  gray: 'bg-gray-500/10 text-gray-400 border-gray-500/30',
  yellow: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30',
  emerald: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30',
  slate: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
}

export default function DataSourceBadge({
  source,
  className,
  showTooltip = true,
  size = 'sm'
}: DataSourceBadgeProps) {
  const [showInfo, setShowInfo] = useState(false)

  const sources: DataSource[] = Array.isArray(source)
    ? source.map(s => DATA_SOURCES[s])
    : [DATA_SOURCES[source]]

  const primarySource = sources[0]

  if (!primarySource) return null

  const sizeClasses = size === 'sm'
    ? 'text-[10px] px-1.5 py-0.5'
    : 'text-xs px-2 py-1'

  return (
    <div className={cn("relative inline-flex items-center gap-1", className)}>
      <button
        onClick={() => setShowInfo(!showInfo)}
        onMouseEnter={() => showTooltip && setShowInfo(true)}
        onMouseLeave={() => showTooltip && setShowInfo(false)}
        className={cn(
          "inline-flex items-center gap-1 rounded border font-medium transition-colors cursor-help",
          sizeClasses,
          colorMap[primarySource.color] || colorMap.gray
        )}
      >
        <Database className={size === 'sm' ? 'w-2.5 h-2.5' : 'w-3 h-3'} />
        <span>{primarySource.shortName}</span>
        {sources.length > 1 && (
          <span className="opacity-60">+{sources.length - 1}</span>
        )}
      </button>

      {/* Tooltip */}
      {showInfo && showTooltip && (
        <div className="absolute bottom-full left-0 mb-2 z-50 w-64 p-3 bg-card border border-border rounded-lg shadow-lg">
          <div className="space-y-2">
            {sources.map((src) => (
              <div key={src.id} className="flex items-start gap-2">
                <div className={cn(
                  "w-2 h-2 rounded-full mt-1.5 flex-shrink-0",
                  src.color === 'blue' && 'bg-blue-500',
                  src.color === 'purple' && 'bg-purple-500',
                  src.color === 'green' && 'bg-green-500',
                  src.color === 'orange' && 'bg-orange-500',
                  src.color === 'red' && 'bg-red-500',
                  src.color === 'gray' && 'bg-gray-500',
                  src.color === 'yellow' && 'bg-yellow-500',
                  src.color === 'emerald' && 'bg-emerald-500',
                  src.color === 'slate' && 'bg-slate-500',
                )} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{src.name}</span>
                    {src.isPaid && (
                      <span className="text-[10px] px-1 py-0.5 bg-yellow-500/20 text-yellow-500 rounded">
                        Paid
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{src.description}</p>
                  {src.url && (
                    <a
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Visit
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Inline version for card headers
 */
export function DataSourceIndicator({
  source,
  className
}: {
  source: DataSourceId | DataSourceId[]
  className?: string
}) {
  const sources: DataSource[] = Array.isArray(source)
    ? source.map(s => DATA_SOURCES[s])
    : [DATA_SOURCES[source]]

  const primarySource = sources[0]
  if (!primarySource) return null

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-[10px] text-muted-foreground",
        className
      )}
      title={`Data from: ${sources.map(s => s.name).join(', ')}`}
    >
      <Database className="w-3 h-3" />
      {sources.map(s => s.shortName).join(' + ')}
    </span>
  )
}
