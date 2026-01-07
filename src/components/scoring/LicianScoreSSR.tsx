/**
 * Lician Score Server Component
 *
 * A lightweight SSR-compatible score display for stock pages.
 * Displays the composite 1-10 Lician Score with color coding.
 */

import { cn } from "@/lib/utils"
import Link from "next/link"

interface LicianScoreSSRProps {
  /** Overall score from 1-10 */
  score: number
  /** Confidence percentage (0-100) */
  confidence?: number
  /** Brief summary text */
  summary?: string
  /** Dimension breakdown for display */
  dimensions?: {
    value: number
    growth: number
    quality: number
    momentum: number
    safety: number
  }
  /** Stock ticker for context */
  ticker?: string
  /** Size variant */
  size?: "small" | "medium" | "large"
  /** Show full breakdown or compact view */
  showBreakdown?: boolean
  /** Additional class names */
  className?: string
}

// Color configurations based on score level
function getScoreColor(score: number) {
  if (score >= 8) return {
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    text: "text-emerald-400",
    label: "Excellent"
  }
  if (score >= 6) return {
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
    text: "text-blue-400",
    label: "Good"
  }
  if (score >= 4) return {
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/30",
    text: "text-yellow-400",
    label: "Neutral"
  }
  return {
    bg: "bg-red-500/10",
    border: "border-red-500/30",
    text: "text-red-400",
    label: "Poor"
  }
}

/**
 * Compact badge for header display
 */
export function LicianScoreBadge({
  score,
  ticker,
  size = "medium",
  className
}: Pick<LicianScoreSSRProps, "score" | "ticker" | "size" | "className">) {
  const clampedScore = Math.max(1, Math.min(10, score))
  const colors = getScoreColor(clampedScore)

  const sizeClasses = {
    small: "px-2 py-0.5 text-sm",
    medium: "px-3 py-1 text-base",
    large: "px-4 py-1.5 text-lg"
  }

  return (
    <Link
      href={ticker ? `/stock/${ticker.toLowerCase()}#lician-score` : "#lician-score"}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border transition-all",
        "hover:ring-2 hover:ring-offset-2 hover:ring-offset-background",
        colors.bg,
        colors.border,
        "hover:ring-current/20",
        sizeClasses[size],
        className
      )}
      title={`Lician Score: ${clampedScore.toFixed(1)}/10 - ${colors.label}`}
    >
      <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-medium">
        Lician
      </span>
      <span className={cn("font-bold", colors.text)}>
        {clampedScore.toFixed(1)}
      </span>
      <span className="text-zinc-400 text-sm">/10</span>
    </Link>
  )
}

/**
 * Full score section with breakdown
 */
export default function LicianScoreSSR({
  score,
  confidence,
  summary,
  dimensions,
  ticker,
  showBreakdown = true,
  className
}: LicianScoreSSRProps) {
  const clampedScore = Math.max(1, Math.min(10, score))
  const colors = getScoreColor(clampedScore)
  const symbol = ticker?.toUpperCase() || ""

  return (
    <section
      id="lician-score"
      className={cn("mb-8", className)}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">
          {symbol} Lician Score
        </h2>
        {confidence !== undefined && (
          <span className="text-xs text-muted-foreground">
            {confidence}% confidence
          </span>
        )}
      </div>

      <div className={cn(
        "rounded-xl border p-6",
        colors.bg,
        colors.border
      )}>
        {/* Main Score Display */}
        <div className="flex items-center gap-6 mb-4">
          <div className="flex flex-col items-center">
            <span className={cn("text-5xl font-bold", colors.text)}>
              {clampedScore.toFixed(1)}
            </span>
            <span className="text-sm text-zinc-400">/10</span>
          </div>
          <div className="flex-1">
            <span className={cn("text-lg font-semibold", colors.text)}>
              {colors.label}
            </span>
            {summary && (
              <p className="text-sm text-muted-foreground mt-1">
                {summary}
              </p>
            )}
          </div>
        </div>

        {/* Dimension Breakdown */}
        {showBreakdown && dimensions && (
          <div className="grid grid-cols-5 gap-4 pt-4 border-t border-zinc-700/50">
            {Object.entries(dimensions).map(([key, value]) => {
              const dimColors = getScoreColor(value)
              return (
                <div key={key} className="text-center">
                  <p className="text-xs text-muted-foreground capitalize mb-1">
                    {key}
                  </p>
                  <p className={cn("text-lg font-bold", dimColors.text)}>
                    {value.toFixed(1)}
                  </p>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* SEO-friendly explanation */}
      <div className="mt-4 text-sm text-muted-foreground">
        <p>
          The Lician Score is a comprehensive 1-10 rating that evaluates {symbol}
          across five key dimensions: <strong>Value</strong> (valuation relative to sector),
          <strong>Growth</strong> (revenue and earnings trajectory),
          <strong>Quality</strong> (profitability and balance sheet strength),
          <strong>Momentum</strong> (price trends and analyst sentiment), and
          <strong>Safety</strong> (volatility and risk metrics).
        </p>
      </div>
    </section>
  )
}
