"use client"

import { cn } from "@/lib/utils"
import { getScoreLevel, type ScoreLevel } from "./ScoreBadge"

export interface ScoreDimensions {
  /** Value score (1-10) - P/E, P/B, P/S ratios */
  value: number
  /** Growth score (1-10) - Revenue, earnings, FCF growth */
  growth: number
  /** Quality score (1-10) - ROIC, margins, moat */
  quality: number
  /** Momentum score (1-10) - Price momentum, relative strength */
  momentum: number
  /** Safety score (1-10) - Debt levels, liquidity, volatility */
  safety: number
}

export type BreakdownSize = "small" | "medium" | "large"
export type BreakdownLayout = "vertical" | "horizontal" | "grid"

export interface ScoreBreakdownProps {
  /** Score dimensions */
  dimensions: ScoreDimensions
  /** Size variant */
  size?: BreakdownSize
  /** Layout variant */
  layout?: BreakdownLayout
  /** Show dimension labels */
  showLabels?: boolean
  /** Show numeric scores */
  showScores?: boolean
  /** Additional CSS classes */
  className?: string
  /** Animate bars on mount */
  animated?: boolean
}

/**
 * Dimension configuration with icons and descriptions
 */
const dimensionConfig: Record<keyof ScoreDimensions, {
  label: string
  shortLabel: string
  description: string
  icon: string
}> = {
  value: {
    label: "Value",
    shortLabel: "VAL",
    description: "Valuation metrics like P/E, P/B, P/S ratios",
    icon: "V"
  },
  growth: {
    label: "Growth",
    shortLabel: "GRW",
    description: "Revenue, earnings, and cash flow growth rates",
    icon: "G"
  },
  quality: {
    label: "Quality",
    shortLabel: "QTY",
    description: "Profitability, ROIC, margins, and competitive moat",
    icon: "Q"
  },
  momentum: {
    label: "Momentum",
    shortLabel: "MOM",
    description: "Price momentum and relative strength indicators",
    icon: "M"
  },
  safety: {
    label: "Safety",
    shortLabel: "SAF",
    description: "Financial health, debt levels, and volatility",
    icon: "S"
  }
}

/**
 * Color configurations for each score level
 */
const levelColors: Record<ScoreLevel, {
  bar: string
  text: string
  bg: string
}> = {
  excellent: {
    bar: "bg-emerald-500",
    text: "text-emerald-400",
    bg: "bg-emerald-500/10"
  },
  good: {
    bar: "bg-blue-500",
    text: "text-blue-400",
    bg: "bg-blue-500/10"
  },
  neutral: {
    bar: "bg-yellow-500",
    text: "text-yellow-400",
    bg: "bg-yellow-500/10"
  },
  poor: {
    bar: "bg-red-500",
    text: "text-red-400",
    bg: "bg-red-500/10"
  }
}

/**
 * Size configurations
 */
const sizeStyles: Record<BreakdownSize, {
  barHeight: string
  labelSize: string
  scoreSize: string
  gap: string
  iconSize: string
}> = {
  small: {
    barHeight: "h-1.5",
    labelSize: "text-[10px]",
    scoreSize: "text-[10px]",
    gap: "gap-1.5",
    iconSize: "w-4 h-4 text-[8px]"
  },
  medium: {
    barHeight: "h-2",
    labelSize: "text-xs",
    scoreSize: "text-xs",
    gap: "gap-2",
    iconSize: "w-5 h-5 text-[10px]"
  },
  large: {
    barHeight: "h-3",
    labelSize: "text-sm",
    scoreSize: "text-sm",
    gap: "gap-3",
    iconSize: "w-6 h-6 text-xs"
  }
}

/**
 * Single dimension progress bar
 */
function DimensionBar({
  dimension,
  score,
  size,
  showLabel,
  showScore,
  animated
}: {
  dimension: keyof ScoreDimensions
  score: number
  size: BreakdownSize
  showLabel: boolean
  showScore: boolean
  animated: boolean
}) {
  const clampedScore = Math.max(1, Math.min(10, score))
  const level = getScoreLevel(clampedScore)
  const colors = levelColors[level]
  const styles = sizeStyles[size]
  const config = dimensionConfig[dimension]
  const percentage = (clampedScore / 10) * 100

  return (
    <div className={cn("flex flex-col", styles.gap)}>
      <div className="flex items-center justify-between">
        {showLabel && (
          <div className="flex items-center gap-1.5">
            <div
              className={cn(
                "flex items-center justify-center rounded font-bold",
                colors.bg,
                colors.text,
                styles.iconSize
              )}
            >
              {config.icon}
            </div>
            <span className={cn(styles.labelSize, "text-zinc-300 font-medium")}>
              {config.label}
            </span>
          </div>
        )}
        {showScore && (
          <span className={cn(styles.scoreSize, "font-bold", colors.text)}>
            {clampedScore.toFixed(1)}
          </span>
        )}
      </div>

      {/* Progress bar */}
      <div className={cn("w-full bg-zinc-700/50 rounded-full overflow-hidden", styles.barHeight)}>
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500 ease-out",
            colors.bar,
            animated && "animate-grow-width"
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

/**
 * Mini radar chart for compact visualization
 */
function MiniRadar({
  dimensions,
  size
}: {
  dimensions: ScoreDimensions
  size: BreakdownSize
}) {
  const viewSize = size === "small" ? 60 : size === "medium" ? 80 : 100
  const center = viewSize / 2
  const maxRadius = (viewSize / 2) - 8

  const dimensionKeys: (keyof ScoreDimensions)[] = ["value", "growth", "quality", "momentum", "safety"]
  const angleStep = (2 * Math.PI) / 5

  // Calculate points for the radar polygon
  const points = dimensionKeys.map((key, i) => {
    const score = Math.max(1, Math.min(10, dimensions[key]))
    const radius = (score / 10) * maxRadius
    const angle = i * angleStep - Math.PI / 2 // Start from top
    const x = center + radius * Math.cos(angle)
    const y = center + radius * Math.sin(angle)
    return { x, y, score, key }
  })

  const polygonPoints = points.map(p => `${p.x},${p.y}`).join(" ")

  // Grid circles
  const gridCircles = [0.25, 0.5, 0.75, 1].map(scale => maxRadius * scale)

  return (
    <svg width={viewSize} height={viewSize} className="overflow-visible">
      {/* Grid circles */}
      {gridCircles.map((r, i) => (
        <circle
          key={i}
          cx={center}
          cy={center}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth="0.5"
          className="text-zinc-700"
        />
      ))}

      {/* Axis lines */}
      {dimensionKeys.map((_, i) => {
        const angle = i * angleStep - Math.PI / 2
        const x2 = center + maxRadius * Math.cos(angle)
        const y2 = center + maxRadius * Math.sin(angle)
        return (
          <line
            key={i}
            x1={center}
            y1={center}
            x2={x2}
            y2={y2}
            stroke="currentColor"
            strokeWidth="0.5"
            className="text-zinc-700"
          />
        )
      })}

      {/* Data polygon */}
      <polygon
        points={polygonPoints}
        fill="currentColor"
        fillOpacity={0.2}
        stroke="currentColor"
        strokeWidth="1.5"
        className="text-emerald-500"
      />

      {/* Data points */}
      {points.map((p, i) => {
        const level = getScoreLevel(p.score)
        const color = level === "excellent" ? "#10b981" :
                     level === "good" ? "#3b82f6" :
                     level === "neutral" ? "#eab308" : "#ef4444"
        return (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={size === "small" ? 2 : size === "medium" ? 3 : 4}
            fill={color}
          />
        )
      })}

      {/* Labels */}
      {size !== "small" && dimensionKeys.map((key, i) => {
        const angle = i * angleStep - Math.PI / 2
        const labelRadius = maxRadius + 12
        const x = center + labelRadius * Math.cos(angle)
        const y = center + labelRadius * Math.sin(angle)
        return (
          <text
            key={key}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-zinc-400 text-[8px] font-medium"
          >
            {dimensionConfig[key].shortLabel}
          </text>
        )
      })}
    </svg>
  )
}

/**
 * Score Breakdown Component
 *
 * Shows 5 dimensions (Value, Growth, Quality, Momentum, Safety)
 * with progress bars or mini charts for each dimension.
 */
export function ScoreBreakdown({
  dimensions,
  size = "medium",
  layout = "vertical",
  showLabels = true,
  showScores = true,
  className,
  animated = true
}: ScoreBreakdownProps) {
  const dimensionKeys: (keyof ScoreDimensions)[] = ["value", "growth", "quality", "momentum", "safety"]
  const styles = sizeStyles[size]

  // Calculate overall score
  const overallScore = dimensionKeys.reduce((sum, key) => sum + dimensions[key], 0) / 5
  const overallLevel = getScoreLevel(overallScore)
  const overallColors = levelColors[overallLevel]

  if (layout === "horizontal") {
    return (
      <div className={cn("flex items-end gap-4", className)}>
        {dimensionKeys.map((key) => {
          const score = Math.max(1, Math.min(10, dimensions[key]))
          const level = getScoreLevel(score)
          const colors = levelColors[level]
          const percentage = (score / 10) * 100

          return (
            <div key={key} className="flex flex-col items-center gap-1 flex-1">
              {showScores && (
                <span className={cn("font-bold", styles.scoreSize, colors.text)}>
                  {score.toFixed(1)}
                </span>
              )}
              <div className="w-full bg-zinc-700/50 rounded-full overflow-hidden h-24 flex flex-col-reverse">
                <div
                  className={cn(
                    "w-full rounded-full transition-all duration-500 ease-out",
                    colors.bar,
                    animated && "animate-grow-height"
                  )}
                  style={{ height: `${percentage}%` }}
                />
              </div>
              {showLabels && (
                <span className={cn(styles.labelSize, "text-zinc-400 font-medium")}>
                  {dimensionConfig[key].shortLabel}
                </span>
              )}
            </div>
          )
        })}
      </div>
    )
  }

  if (layout === "grid") {
    return (
      <div className={cn("space-y-4", className)}>
        {/* Mini radar chart */}
        <div className="flex justify-center">
          <MiniRadar dimensions={dimensions} size={size} />
        </div>

        {/* Score grid */}
        <div className="grid grid-cols-5 gap-2">
          {dimensionKeys.map((key) => {
            const score = Math.max(1, Math.min(10, dimensions[key]))
            const level = getScoreLevel(score)
            const colors = levelColors[level]

            return (
              <div
                key={key}
                className={cn(
                  "flex flex-col items-center p-2 rounded-lg",
                  colors.bg
                )}
              >
                <span className={cn("font-bold", styles.scoreSize, colors.text)}>
                  {score.toFixed(1)}
                </span>
                <span className={cn(styles.labelSize, "text-zinc-400 mt-0.5")}>
                  {dimensionConfig[key].shortLabel}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // Default vertical layout
  return (
    <div className={cn("space-y-3", className)}>
      {dimensionKeys.map((key) => (
        <DimensionBar
          key={key}
          dimension={key}
          score={dimensions[key]}
          size={size}
          showLabel={showLabels}
          showScore={showScores}
          animated={animated}
        />
      ))}

      {/* Overall score summary */}
      <div className={cn(
        "flex items-center justify-between pt-2 mt-2 border-t border-zinc-700/50"
      )}>
        <span className={cn(styles.labelSize, "text-zinc-300 font-semibold")}>
          Overall
        </span>
        <span className={cn("font-bold", styles.scoreSize, overallColors.text)}>
          {overallScore.toFixed(1)} / 10
        </span>
      </div>
    </div>
  )
}

/**
 * Compact inline breakdown for tables
 */
export function InlineBreakdown({
  dimensions,
  className
}: {
  dimensions: ScoreDimensions
  className?: string
}) {
  const dimensionKeys: (keyof ScoreDimensions)[] = ["value", "growth", "quality", "momentum", "safety"]

  return (
    <div className={cn("inline-flex items-center gap-1", className)}>
      {dimensionKeys.map((key) => {
        const score = Math.max(1, Math.min(10, dimensions[key]))
        const level = getScoreLevel(score)
        const colors = levelColors[level]

        return (
          <div
            key={key}
            className={cn(
              "w-5 h-5 rounded text-[8px] font-bold flex items-center justify-center",
              colors.bg,
              colors.text
            )}
            title={`${dimensionConfig[key].label}: ${score.toFixed(1)}`}
          >
            {dimensionConfig[key].icon}
          </div>
        )
      })}
    </div>
  )
}

/**
 * Score breakdown card with detailed information
 */
export function ScoreBreakdownCard({
  dimensions,
  ticker,
  className
}: {
  dimensions: ScoreDimensions
  ticker?: string
  className?: string
}) {
  const dimensionKeys: (keyof ScoreDimensions)[] = ["value", "growth", "quality", "momentum", "safety"]
  const overallScore = dimensionKeys.reduce((sum, key) => sum + dimensions[key], 0) / 5
  const overallLevel = getScoreLevel(overallScore)
  const overallColors = levelColors[overallLevel]

  return (
    <div className={cn(
      "rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 backdrop-blur-sm",
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-zinc-200">
            {ticker ? `${ticker} Lician Score` : "Lician Score"}
          </h3>
          <p className="text-[10px] text-zinc-500 mt-0.5">
            Quantitative analysis across 5 dimensions
          </p>
        </div>
        <div className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-lg",
          overallColors.bg
        )}>
          <span className={cn("text-xl font-bold", overallColors.text)}>
            {overallScore.toFixed(1)}
          </span>
          <span className="text-zinc-400 text-sm">/10</span>
        </div>
      </div>

      {/* Grid layout with radar */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center justify-center">
          <MiniRadar dimensions={dimensions} size="medium" />
        </div>

        <div className="space-y-2">
          {dimensionKeys.map((key) => {
            const score = Math.max(1, Math.min(10, dimensions[key]))
            const level = getScoreLevel(score)
            const colors = levelColors[level]
            const percentage = (score / 10) * 100

            return (
              <div key={key} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-zinc-400">
                    {dimensionConfig[key].label}
                  </span>
                  <span className={cn("text-[10px] font-bold", colors.text)}>
                    {score.toFixed(1)}
                  </span>
                </div>
                <div className="w-full bg-zinc-700/50 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={cn("h-full rounded-full", colors.bar)}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Dimension descriptions */}
      <div className="mt-4 pt-3 border-t border-zinc-800">
        <div className="grid grid-cols-5 gap-2">
          {dimensionKeys.map((key) => {
            const score = Math.max(1, Math.min(10, dimensions[key]))
            const level = getScoreLevel(score)
            const colors = levelColors[level]

            return (
              <div
                key={key}
                className="text-center"
                title={dimensionConfig[key].description}
              >
                <div className={cn(
                  "w-8 h-8 mx-auto rounded-lg flex items-center justify-center font-bold text-xs",
                  colors.bg,
                  colors.text
                )}>
                  {score.toFixed(1)}
                </div>
                <span className="text-[9px] text-zinc-500 mt-1 block">
                  {dimensionConfig[key].shortLabel}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default ScoreBreakdown
