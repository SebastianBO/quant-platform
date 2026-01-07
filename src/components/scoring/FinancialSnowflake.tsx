/**
 * Financial Snowflake - 5-Axis Radar Visualization
 *
 * Inspired by Simply Wall St's iconic visualization.
 * Shows Value, Growth, Quality, Momentum, and Safety dimensions.
 * SSR-compatible for SEO.
 */

import { cn } from "@/lib/utils"

export interface SnowflakeDimensions {
  value: number
  growth: number
  quality: number
  momentum: number
  safety: number
}

interface FinancialSnowflakeProps {
  dimensions: SnowflakeDimensions
  size?: "small" | "medium" | "large" | "hero"
  ticker?: string
  showLabels?: boolean
  showScores?: boolean
  showLegend?: boolean
  animated?: boolean
  className?: string
}

// Dimension configuration
const DIMENSIONS: Array<{
  key: keyof SnowflakeDimensions
  label: string
  color: string
  description: string
}> = [
  { key: "value", label: "Value", color: "#06b6d4", description: "Valuation vs. sector peers" },
  { key: "growth", label: "Growth", color: "#8b5cf6", description: "Revenue & earnings trajectory" },
  { key: "quality", label: "Quality", color: "#f59e0b", description: "Profitability & moat strength" },
  { key: "momentum", label: "Momentum", color: "#ef4444", description: "Price trends & analyst sentiment" },
  { key: "safety", label: "Safety", color: "#10b981", description: "Financial stability & risk" },
]

const SIZE_CONFIG = {
  small: { viewBox: 120, radius: 40, labelOffset: 16, fontSize: 8, dotSize: 3, strokeWidth: 1.5 },
  medium: { viewBox: 200, radius: 70, labelOffset: 24, fontSize: 10, dotSize: 4, strokeWidth: 2 },
  large: { viewBox: 280, radius: 100, labelOffset: 32, fontSize: 12, dotSize: 5, strokeWidth: 2.5 },
  hero: { viewBox: 400, radius: 150, labelOffset: 45, fontSize: 14, dotSize: 6, strokeWidth: 3 },
}

function getScoreColor(score: number): string {
  if (score >= 8) return "#10b981" // emerald
  if (score >= 6) return "#3b82f6" // blue
  if (score >= 4) return "#eab308" // yellow
  return "#ef4444" // red
}

function getScoreLabel(score: number): string {
  if (score >= 8) return "Excellent"
  if (score >= 6) return "Good"
  if (score >= 4) return "Neutral"
  return "Poor"
}

export function FinancialSnowflake({
  dimensions,
  size = "medium",
  ticker,
  showLabels = true,
  showScores = true,
  showLegend = false,
  animated = true,
  className,
}: FinancialSnowflakeProps) {
  const config = SIZE_CONFIG[size]
  const center = config.viewBox / 2
  const angleStep = (2 * Math.PI) / 5

  // Calculate average score
  const avgScore = Object.values(dimensions).reduce((a, b) => a + b, 0) / 5
  const avgColor = getScoreColor(avgScore)

  // Calculate polygon points
  const points = DIMENSIONS.map((dim, i) => {
    const score = Math.max(1, Math.min(10, dimensions[dim.key]))
    const normalizedScore = score / 10
    const angle = i * angleStep - Math.PI / 2 // Start from top
    const x = center + normalizedScore * config.radius * Math.cos(angle)
    const y = center + normalizedScore * config.radius * Math.sin(angle)
    return { x, y, score, angle, ...dim }
  })

  const polygonPath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z"

  // Grid circles at 25%, 50%, 75%, 100%
  const gridLevels = [0.25, 0.5, 0.75, 1]

  return (
    <div className={cn("relative", className)}>
      <svg
        viewBox={`0 0 ${config.viewBox} ${config.viewBox}`}
        className="w-full h-full"
        style={{ maxWidth: config.viewBox }}
      >
        {/* Gradient definitions */}
        <defs>
          <radialGradient id={`snowflake-gradient-${ticker || "default"}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={avgColor} stopOpacity="0.4" />
            <stop offset="100%" stopColor={avgColor} stopOpacity="0.1" />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background circle */}
        <circle
          cx={center}
          cy={center}
          r={config.radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="0.5"
          className="text-zinc-700/30"
        />

        {/* Grid circles */}
        {gridLevels.map((level, i) => (
          <circle
            key={i}
            cx={center}
            cy={center}
            r={config.radius * level}
            fill="none"
            stroke="currentColor"
            strokeWidth="0.5"
            strokeDasharray={i < 3 ? "2 2" : "0"}
            className="text-zinc-700/50"
          />
        ))}

        {/* Grid level labels */}
        {gridLevels.map((level, i) => (
          <text
            key={i}
            x={center + 4}
            y={center - config.radius * level + 3}
            className="fill-zinc-600 font-mono"
            style={{ fontSize: config.fontSize * 0.7 }}
          >
            {Math.round(level * 10)}
          </text>
        ))}

        {/* Axis lines */}
        {DIMENSIONS.map((_, i) => {
          const angle = i * angleStep - Math.PI / 2
          const x2 = center + config.radius * Math.cos(angle)
          const y2 = center + config.radius * Math.sin(angle)
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={x2}
              y2={y2}
              stroke="currentColor"
              strokeWidth="0.5"
              className="text-zinc-700/50"
            />
          )
        })}

        {/* Data polygon - filled area */}
        <path
          d={polygonPath}
          fill={`url(#snowflake-gradient-${ticker || "default"})`}
          stroke={avgColor}
          strokeWidth={config.strokeWidth}
          strokeLinejoin="round"
          filter="url(#glow)"
          className={cn(animated && "animate-in fade-in-0 zoom-in-95 duration-500")}
        />

        {/* Data points */}
        {points.map((point, i) => (
          <g key={i}>
            {/* Outer ring */}
            <circle
              cx={point.x}
              cy={point.y}
              r={config.dotSize + 2}
              fill="none"
              stroke={point.color}
              strokeWidth="1"
              opacity="0.5"
            />
            {/* Inner dot */}
            <circle
              cx={point.x}
              cy={point.y}
              r={config.dotSize}
              fill={getScoreColor(point.score)}
              stroke="#fff"
              strokeWidth="1"
            />
          </g>
        ))}

        {/* Dimension labels */}
        {showLabels &&
          points.map((point, i) => {
            const labelX = center + (config.radius + config.labelOffset) * Math.cos(point.angle)
            const labelY = center + (config.radius + config.labelOffset) * Math.sin(point.angle)
            const textAnchor = labelX < center - 5 ? "end" : labelX > center + 5 ? "start" : "middle"

            return (
              <g key={i}>
                <text
                  x={labelX}
                  y={labelY - (showScores ? 4 : 0)}
                  textAnchor={textAnchor}
                  dominantBaseline="middle"
                  className="fill-zinc-300 font-medium"
                  style={{ fontSize: config.fontSize }}
                >
                  {point.label}
                </text>
                {showScores && (
                  <text
                    x={labelX}
                    y={labelY + config.fontSize}
                    textAnchor={textAnchor}
                    dominantBaseline="middle"
                    className="font-bold"
                    style={{ fontSize: config.fontSize, fill: getScoreColor(point.score) }}
                  >
                    {point.score.toFixed(1)}
                  </text>
                )}
              </g>
            )
          })}

        {/* Center score */}
        <text
          x={center}
          y={center - config.fontSize / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          className="font-bold fill-current"
          style={{ fontSize: config.fontSize * 2, fill: avgColor }}
        >
          {avgScore.toFixed(1)}
        </text>
        <text
          x={center}
          y={center + config.fontSize}
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-zinc-500"
          style={{ fontSize: config.fontSize * 0.8 }}
        >
          /10
        </text>
      </svg>

      {/* Legend */}
      {showLegend && (
        <div className="mt-4 grid grid-cols-5 gap-2">
          {DIMENSIONS.map((dim) => {
            const score = dimensions[dim.key]
            return (
              <div key={dim.key} className="text-center">
                <div
                  className="w-3 h-3 rounded-full mx-auto mb-1"
                  style={{ backgroundColor: dim.color }}
                />
                <p className="text-xs text-zinc-400">{dim.label}</p>
                <p className="text-sm font-bold" style={{ color: getScoreColor(score) }}>
                  {score.toFixed(1)}
                </p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

/**
 * Snowflake with explanatory card
 */
export function SnowflakeCard({
  dimensions,
  ticker,
  className,
}: {
  dimensions: SnowflakeDimensions
  ticker?: string
  className?: string
}) {
  const avgScore = Object.values(dimensions).reduce((a, b) => a + b, 0) / 5
  const avgColor = getScoreColor(avgScore)
  const avgLabel = getScoreLabel(avgScore)

  return (
    <section className={cn("bg-zinc-900/50 rounded-2xl border border-zinc-800 p-6", className)}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-zinc-100">
            {ticker ? `${ticker} Financial Snowflake` : "Financial Snowflake"}
          </h3>
          <p className="text-sm text-zinc-500 mt-1">
            5-axis analysis across key investment dimensions
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold" style={{ color: avgColor }}>
            {avgScore.toFixed(1)}/10
          </p>
          <p className="text-xs text-zinc-500">{avgLabel}</p>
        </div>
      </div>

      <div className="flex items-center justify-center py-4">
        <FinancialSnowflake
          dimensions={dimensions}
          size="large"
          ticker={ticker}
          showLabels={true}
          showScores={true}
        />
      </div>

      {/* Dimension details */}
      <div className="mt-6 grid grid-cols-5 gap-3 pt-4 border-t border-zinc-800">
        {DIMENSIONS.map((dim) => {
          const score = dimensions[dim.key]
          const color = getScoreColor(score)
          return (
            <div key={dim.key} className="text-center">
              <div
                className="w-10 h-10 rounded-lg mx-auto flex items-center justify-center font-bold text-sm"
                style={{ backgroundColor: `${color}20`, color }}
              >
                {score.toFixed(1)}
              </div>
              <p className="text-xs text-zinc-400 mt-2">{dim.label}</p>
              <p className="text-[10px] text-zinc-600 mt-0.5 hidden sm:block">{dim.description}</p>
            </div>
          )
        })}
      </div>
    </section>
  )
}

/**
 * Compact badge version for headers/lists
 */
export function SnowflakeBadge({
  dimensions,
  size = "small",
  className,
}: {
  dimensions: SnowflakeDimensions
  size?: "small" | "medium"
  className?: string
}) {
  return (
    <div className={cn("inline-block", className)}>
      <FinancialSnowflake
        dimensions={dimensions}
        size={size}
        showLabels={false}
        showScores={false}
      />
    </div>
  )
}

export default FinancialSnowflake
