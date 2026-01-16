"use client"

import { useState, memo } from "react"
import { cn } from "@/lib/utils"
import { ScoreBreakdown, type ScoreDimensions } from "./ScoreBreakdown"

export type ScoreLevel = "excellent" | "good" | "neutral" | "poor"
export type BadgeSize = "small" | "medium" | "large"
export type BadgeMode = "compact" | "full"

export interface ScoreBadgeProps {
  /** Overall score from 1-10 */
  score: number
  /** Score breakdown by dimension (optional) */
  breakdown?: ScoreDimensions
  /** Size variant */
  size?: BadgeSize
  /** Display mode */
  mode?: BadgeMode
  /** Show tooltip on hover with breakdown */
  showTooltip?: boolean
  /** Additional CSS classes */
  className?: string
  /** Stock ticker for context */
  ticker?: string
}

/**
 * Get the score level based on the numeric score
 */
export function getScoreLevel(score: number): ScoreLevel {
  if (score >= 8) return "excellent"
  if (score >= 6) return "good"
  if (score >= 4) return "neutral"
  return "poor"
}

/**
 * Get label for score level
 */
export function getScoreLabel(level: ScoreLevel): string {
  switch (level) {
    case "excellent":
      return "Excellent"
    case "good":
      return "Good"
    case "neutral":
      return "Neutral"
    case "poor":
      return "Poor"
  }
}

/**
 * Color configurations for each score level
 */
const scoreColors: Record<ScoreLevel, {
  bg: string
  border: string
  text: string
  ring: string
  glow: string
  gradient: string
}> = {
  excellent: {
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    text: "text-emerald-400",
    ring: "ring-emerald-500/20",
    glow: "shadow-emerald-500/20",
    gradient: "from-emerald-500 to-emerald-400"
  },
  good: {
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
    text: "text-blue-400",
    ring: "ring-blue-500/20",
    glow: "shadow-blue-500/20",
    gradient: "from-blue-500 to-blue-400"
  },
  neutral: {
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/30",
    text: "text-yellow-400",
    ring: "ring-yellow-500/20",
    glow: "shadow-yellow-500/20",
    gradient: "from-yellow-500 to-yellow-400"
  },
  poor: {
    bg: "bg-red-500/10",
    border: "border-red-500/30",
    text: "text-red-400",
    ring: "ring-red-500/20",
    glow: "shadow-red-500/20",
    gradient: "from-red-500 to-red-400"
  }
}

/**
 * Size configurations
 */
const sizeConfig: Record<BadgeSize, {
  wrapper: string
  score: string
  label: string
  icon: string
  padding: string
}> = {
  small: {
    wrapper: "min-w-[48px] h-6",
    score: "text-sm font-bold",
    label: "text-[10px]",
    icon: "w-3 h-3",
    padding: "px-2 py-0.5"
  },
  medium: {
    wrapper: "min-w-[64px] h-8",
    score: "text-lg font-bold",
    label: "text-xs",
    icon: "w-4 h-4",
    padding: "px-3 py-1"
  },
  large: {
    wrapper: "min-w-[80px] h-10",
    score: "text-xl font-bold",
    label: "text-sm",
    icon: "w-5 h-5",
    padding: "px-4 py-1.5"
  }
}

/**
 * Circular progress indicator for score visualization
 */
function ScoreRing({
  score,
  size,
  level
}: {
  score: number
  size: BadgeSize
  level: ScoreLevel
}) {
  const ringSize = size === "small" ? 28 : size === "medium" ? 40 : 52
  const strokeWidth = size === "small" ? 2.5 : size === "medium" ? 3 : 4
  const radius = (ringSize - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const progress = (score / 10) * circumference
  const fontSize = size === "small" ? "8px" : size === "medium" ? "11px" : "14px"

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        width={ringSize}
        height={ringSize}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={ringSize / 2}
          cy={ringSize / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-zinc-700/50"
        />
        {/* Progress circle */}
        <circle
          cx={ringSize / 2}
          cy={ringSize / 2}
          r={radius}
          fill="none"
          stroke="url(#scoreGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          className="transition-all duration-500 ease-out"
        />
        <defs>
          <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" className={cn(
              level === "excellent" && "stop-emerald-500",
              level === "good" && "stop-blue-500",
              level === "neutral" && "stop-yellow-500",
              level === "poor" && "stop-red-500"
            )} stopColor={
              level === "excellent" ? "#10b981" :
              level === "good" ? "#3b82f6" :
              level === "neutral" ? "#eab308" :
              "#ef4444"
            } />
            <stop offset="100%" className={cn(
              level === "excellent" && "stop-emerald-400",
              level === "good" && "stop-blue-400",
              level === "neutral" && "stop-yellow-400",
              level === "poor" && "stop-red-400"
            )} stopColor={
              level === "excellent" ? "#34d399" :
              level === "good" ? "#60a5fa" :
              level === "neutral" ? "#facc15" :
              "#f87171"
            } />
          </linearGradient>
        </defs>
      </svg>
      {/* Score text in center */}
      <span
        className={cn(
          "absolute font-bold",
          scoreColors[level].text
        )}
        style={{ fontSize }}
      >
        {score.toFixed(1)}
      </span>
    </div>
  )
}

/**
 * Lician Score Badge Component
 *
 * Displays a visual score indicator from 1-10 with color coding:
 * - 8-10: Green (excellent)
 * - 6-7.9: Blue (good)
 * - 4-5.9: Yellow (neutral)
 * - 1-3.9: Red (poor)
 */
export default function ScoreBadge({
  score,
  breakdown,
  size = "medium",
  mode = "compact",
  showTooltip = true,
  className,
  ticker
}: ScoreBadgeProps) {
  const [showBreakdown, setShowBreakdown] = useState(false)

  // Clamp score between 1-10
  const clampedScore = Math.max(1, Math.min(10, score))
  const level = getScoreLevel(clampedScore)
  const colors = scoreColors[level]
  const sizes = sizeConfig[size]
  const label = getScoreLabel(level)

  if (mode === "compact") {
    return (
      <div
        className={cn("relative inline-flex", className)}
        onMouseEnter={() => showTooltip && breakdown && setShowBreakdown(true)}
        onMouseLeave={() => setShowBreakdown(false)}
      >
        <div
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border transition-all duration-200",
            colors.bg,
            colors.border,
            sizes.padding,
            showTooltip && breakdown && "cursor-help hover:ring-2",
            colors.ring
          )}
        >
          <span className={cn(sizes.score, colors.text)}>
            {clampedScore.toFixed(1)}
          </span>
          <span className={cn(sizes.label, "text-zinc-400")}>
            / 10
          </span>
        </div>

        {/* Tooltip with breakdown */}
        {showBreakdown && breakdown && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl p-4 min-w-[280px]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-zinc-200">
                  {ticker ? `${ticker} Score` : "Lician Score"}
                </span>
                <span className={cn("text-lg font-bold", colors.text)}>
                  {clampedScore.toFixed(1)}/10
                </span>
              </div>
              <ScoreBreakdown dimensions={breakdown} size="small" />
            </div>
            {/* Tooltip arrow */}
            <div className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-3 h-3 bg-zinc-900 border-r border-b border-zinc-700 transform rotate-45" />
          </div>
        )}
      </div>
    )
  }

  // Full mode with ring visualization
  return (
    <div
      className={cn(
        "relative inline-flex flex-col items-center",
        className
      )}
      onMouseEnter={() => showTooltip && breakdown && setShowBreakdown(true)}
      onMouseLeave={() => setShowBreakdown(false)}
    >
      <div
        className={cn(
          "flex flex-col items-center gap-2 p-3 rounded-xl border transition-all duration-200",
          colors.bg,
          colors.border,
          showTooltip && breakdown && "cursor-help hover:ring-2",
          colors.ring,
          "shadow-lg",
          colors.glow
        )}
      >
        <div className="text-[10px] uppercase tracking-wider text-zinc-400 font-medium">
          Lician Score
        </div>
        <ScoreRing score={clampedScore} size={size} level={level} />
        <div className={cn(
          "font-semibold",
          sizes.label,
          colors.text
        )}>
          {label}
        </div>
      </div>

      {/* Tooltip with breakdown */}
      {showBreakdown && breakdown && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl p-4 min-w-[280px]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-zinc-200">
                {ticker ? `${ticker} Breakdown` : "Score Breakdown"}
              </span>
            </div>
            <ScoreBreakdown dimensions={breakdown} size="small" />
          </div>
          {/* Tooltip arrow */}
          <div className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-3 h-3 bg-zinc-900 border-r border-b border-zinc-700 transform rotate-45" />
        </div>
      )}
    </div>
  )
}

/**
 * Inline score display for tables and lists
 */
export const InlineScore = memo(function InlineScore({
  score,
  className
}: {
  score: number
  className?: string
}) {
  const clampedScore = Math.max(1, Math.min(10, score))
  const level = getScoreLevel(clampedScore)
  const colors = scoreColors[level]

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 font-medium",
        colors.text,
        className
      )}
    >
      <span className="font-bold">{clampedScore.toFixed(1)}</span>
      <span className="text-zinc-500 text-sm">/10</span>
    </span>
  )
})

/**
 * Score change indicator
 */
export const ScoreChange = memo(function ScoreChange({
  current,
  previous,
  className
}: {
  current: number
  previous: number
  className?: string
}) {
  const change = current - previous
  const isPositive = change > 0
  const isNeutral = change === 0

  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 text-xs font-medium",
        isNeutral && "text-zinc-400",
        isPositive && "text-emerald-400",
        !isPositive && !isNeutral && "text-red-400",
        className
      )}
    >
      {isPositive && "+"}
      {change.toFixed(1)}
      {!isNeutral && (
        <svg
          className={cn(
            "w-3 h-3",
            !isPositive && "rotate-180"
          )}
          viewBox="0 0 12 12"
          fill="none"
        >
          <path
            d="M6 2L10 8H2L6 2Z"
            fill="currentColor"
          />
        </svg>
      )}
    </span>
  )
})
