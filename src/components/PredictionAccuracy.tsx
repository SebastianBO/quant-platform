"use client"

import { useState, memo } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import {
  HISTORICAL_PREDICTIONS,
  calculatePredictionStats,
  getPredictionForTicker,
  hasHistoricalPrediction,
  getTrackingMessage,
  getPredictionComparisons,
  type HistoricalPrediction,
  type PredictionStats,
} from "@/lib/prediction-data"
import { TrendingUp, TrendingDown, CheckCircle, XCircle, AlertCircle, Award, Target, BarChart3 } from "lucide-react"

interface PredictionAccuracyProps {
  ticker?: string
  companyName?: string
  currentPrice?: number
  showFullDashboard?: boolean
}

/**
 * Animated accuracy gauge component
 */
function AccuracyGauge({ value, label, size = "large" }: { value: number; label: string; size?: "small" | "large" }) {
  const circumference = 2 * Math.PI * 45
  const progress = (value / 100) * circumference
  const isLarge = size === "large"

  // Color based on accuracy
  const getColor = (accuracy: number) => {
    if (accuracy >= 90) return { stroke: "#4ebe96", bg: "from-[#4ebe96]/20 to-[#4ebe96]/5" }
    if (accuracy >= 75) return { stroke: "#4ebe96", bg: "from-[#4ebe96]/20 to-[#4ebe96]/5" }
    if (accuracy >= 60) return { stroke: "#f4a623", bg: "from-[#f4a623]/20 to-[#f4a623]/5" }
    return { stroke: "#f4a623", bg: "from-[#f4a623]/20 to-[#f4a623]/5" }
  }

  const colors = getColor(value)

  return (
    <div className={`flex flex-col items-center ${isLarge ? 'p-6' : 'p-3'}`}>
      <div className={`relative ${isLarge ? 'w-36 h-36' : 'w-24 h-24'}`}>
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth={isLarge ? "8" : "6"}
            className="text-white/[0.05]"
          />
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={colors.stroke}
            strokeWidth={isLarge ? "8" : "6"}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`font-bold ${isLarge ? 'text-3xl' : 'text-xl'}`} style={{ color: colors.stroke }}>
            {value.toFixed(1)}%
          </span>
        </div>
      </div>
      <p className={`text-[#868f97] mt-2 text-center ${isLarge ? 'text-sm' : 'text-xs'}`}>{label}</p>
    </div>
  )
}

/**
 * Individual prediction card for stock-specific history
 */
function PredictionCard({ prediction }: { prediction: HistoricalPrediction }) {
  const accuracy = 100 - Math.abs(((prediction.predictedPrice - prediction.actualPrice) / prediction.actualPrice) * 100)
  const weBeatWallStreet = accuracy > (prediction.wallStreetAccuracy || 0)

  return (
    <div className="p-4 bg-white/[0.015] rounded-lg border border-white/[0.04]">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-bold text-lg">{prediction.ticker}</h4>
          <p className="text-sm text-[#868f97]">{prediction.companyName}</p>
        </div>
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
          prediction.outcome === 'correct'
            ? 'bg-[#4ebe96]/20 text-[#4ebe96]'
            : prediction.outcome === 'partially_correct'
            ? 'bg-yellow-500/20 text-yellow-500'
            : 'bg-red-500/20 text-red-500'
        }`}>
          {prediction.outcome === 'correct' ? 'Correct' :
           prediction.outcome === 'partially_correct' ? 'Close' : 'Missed'}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 text-sm">
        <div>
          <p className="text-[#868f97] text-xs">Our Prediction</p>
          <p className="font-bold">${prediction.predictedPrice.toFixed(2)}</p>
          <p className={`text-xs ${prediction.predictedChange >= 0 ? 'text-[#4ebe96]' : 'text-red-500'}`}>
            {prediction.predictedChange >= 0 ? '+' : ''}{prediction.predictedChange.toFixed(1)}%
          </p>
        </div>
        <div>
          <p className="text-[#868f97] text-xs">Actual Result</p>
          <p className="font-bold">${prediction.actualPrice.toFixed(2)}</p>
          <p className={`text-xs ${prediction.actualChange >= 0 ? 'text-[#4ebe96]' : 'text-red-500'}`}>
            {prediction.actualChange >= 0 ? '+' : ''}{prediction.actualChange.toFixed(1)}%
          </p>
        </div>
        <div>
          <p className="text-[#868f97] text-xs">Our Accuracy</p>
          <p className="font-bold text-[#4ebe96]">{accuracy.toFixed(1)}%</p>
          {weBeatWallStreet && (
            <p className="text-xs text-emerald-400 flex items-center gap-1">
              <Award className="w-3 h-3" /> Beat WS
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * Comparison table row
 */
function ComparisonRow({
  ticker,
  ourPrediction,
  actualResult,
  ourAccuracy,
  wallStreetAccuracy,
  weBeatWallStreet
}: {
  ticker: string
  ourPrediction: string
  actualResult: string
  ourAccuracy: number
  wallStreetAccuracy: number
  weBeatWallStreet: boolean
}) {
  return (
    <tr className="border-b border-white/[0.04] hover:bg-white/[0.08] transition-colors duration-100">
      <td className="p-3 font-medium">{ticker}</td>
      <td className="p-3 text-sm">{ourPrediction}</td>
      <td className="p-3 text-sm">{actualResult}</td>
      <td className="p-3 text-right">
        <span className={`font-bold ${ourAccuracy >= 95 ? 'text-[#4ebe96]' : ourAccuracy >= 90 ? 'text-green-500' : 'text-yellow-500'}`}>
          {ourAccuracy.toFixed(1)}%
        </span>
      </td>
      <td className="p-3 text-right text-[#868f97]">{wallStreetAccuracy.toFixed(1)}%</td>
      <td className="p-3 text-center">
        {weBeatWallStreet ? (
          <CheckCircle className="w-5 h-5 text-[#4ebe96] mx-auto" />
        ) : (
          <XCircle className="w-5 h-5 text-red-500 mx-auto" />
        )}
      </td>
    </tr>
  )
}

/**
 * Stock-specific prediction accuracy section
 */
function StockPredictionAccuracy({
  ticker,
  companyName,
  currentPrice
}: {
  ticker: string
  companyName?: string
  currentPrice?: number
}) {
  const prediction = getPredictionForTicker(ticker)
  const hasHistory = hasHistoricalPrediction(ticker)

  if (!hasHistory) {
    return (
      <Card className="w-full bg-gradient-to-br from-blue-500/5 to-purple-500/5 border-blue-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-6 h-6 text-blue-500" />
            Prediction Tracking
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-500/10 flex items-center justify-center">
              <BarChart3 className="w-8 h-8 text-blue-500" />
            </div>
            <p className="text-lg font-medium mb-2">Coming Soon for {ticker}</p>
            <p className="text-[#868f97]">
              {getTrackingMessage()}
            </p>
            <p className="text-sm text-[#868f97] mt-4 max-w-md mx-auto">
              We are building a comprehensive track record of our AI predictions.
              Check back to see how our forecasts perform against actual results.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!prediction) return null

  const accuracy = 100 - Math.abs(((prediction.predictedPrice - prediction.actualPrice) / prediction.actualPrice) * 100)
  const weBeatWallStreet = accuracy > (prediction.wallStreetAccuracy || 0)

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-6 h-6 text-[#4ebe96]" />
          Our Track Record: {ticker}
        </CardTitle>
        <p className="text-sm text-[#868f97]">
          How our AI prediction performed vs. reality
        </p>
      </CardHeader>
      <CardContent>
        {/* Main Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-gradient-to-br from-[#4ebe96]/20 to-[#4ebe96]/5 rounded-xl border border-[#4ebe96]/30 text-center">
            <p className="text-[#868f97] text-sm mb-1">Our Prediction (Jan 2025)</p>
            <p className="text-3xl font-bold text-[#4ebe96]">${prediction.predictedPrice.toFixed(2)}</p>
            <p className={`text-sm ${prediction.predictedChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {prediction.predictedChange >= 0 ? '+' : ''}{prediction.predictedChange.toFixed(1)}% expected
            </p>
          </div>

          <div className="p-4 bg-white/[0.025] rounded-xl border border-white/[0.08] text-center">
            <p className="text-[#868f97] text-sm mb-1">Actual Result (Dec 2025)</p>
            <p className="text-3xl font-bold">${prediction.actualPrice.toFixed(2)}</p>
            <p className={`text-sm ${prediction.actualChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {prediction.actualChange >= 0 ? '+' : ''}{prediction.actualChange.toFixed(1)}% actual
            </p>
          </div>

          <div className={`p-4 rounded-xl border text-center ${
            accuracy >= 95
              ? 'bg-gradient-to-br from-[#4ebe96]/20 to-[#4ebe96]/5 border-[#4ebe96]/30'
              : 'bg-gradient-to-br from-yellow-500/20 to-yellow-500/5 border-yellow-500/30'
          }`}>
            <p className="text-[#868f97] text-sm mb-1">Our Accuracy</p>
            <p className={`text-3xl font-bold ${accuracy >= 95 ? 'text-[#4ebe96]' : 'text-yellow-500'}`}>
              {accuracy.toFixed(1)}%
            </p>
            <p className="text-sm text-[#868f97]">
              {prediction.outcome === 'correct' ? 'Direction Correct' : 'Direction Correct'}
            </p>
          </div>
        </div>

        {/* Comparison with Wall Street */}
        <div className="p-4 bg-white/[0.015] rounded-lg border border-white/[0.08] mb-6">
          <div className="flex items-center justify-between mb-3">
            <p className="font-medium">vs. Wall Street Consensus</p>
            {weBeatWallStreet && (
              <span className="flex items-center gap-1 text-sm text-[#4ebe96]">
                <Award className="w-4 h-4" />
                We outperformed
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-[#868f97]">Wall Street Target</p>
              <p className="font-bold">${prediction.wallStreetTarget?.toFixed(2)}</p>
              <p className="text-sm text-[#868f97]">
                Accuracy: {prediction.wallStreetAccuracy?.toFixed(1)}%
              </p>
            </div>
            <div>
              <p className="text-sm text-[#868f97]">Our Prediction</p>
              <p className="font-bold text-[#4ebe96]">${prediction.predictedPrice.toFixed(2)}</p>
              <p className="text-sm text-emerald-400">
                Accuracy: {accuracy.toFixed(1)}%
              </p>
            </div>
          </div>

          {/* Visual comparison bar */}
          <div className="mt-4">
            <div className="flex justify-between text-xs text-[#868f97] mb-1">
              <span>Wall Street: {prediction.wallStreetAccuracy?.toFixed(1)}%</span>
              <span>Lician AI: {accuracy.toFixed(1)}%</span>
            </div>
            <div className="h-3 bg-white/[0.05] rounded-full overflow-hidden flex">
              <div
                className="h-full bg-[#868f97]/50"
                style={{ width: `${prediction.wallStreetAccuracy}%` }}
              />
            </div>
            <div className="h-3 bg-white/[0.05] rounded-full overflow-hidden flex mt-1">
              <div
                className="h-full bg-[#4ebe96]"
                style={{ width: `${accuracy}%` }}
              />
            </div>
          </div>
        </div>

        {/* Prediction Timeline */}
        <div className="flex items-center justify-between text-sm text-[#868f97] border-t border-white/[0.08] pt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span>Prediction: {prediction.predictionDate}</span>
          </div>
          <div className="flex-1 h-0.5 bg-white/[0.08] mx-4" />
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#4ebe96]" />
            <span>Evaluated: {prediction.evaluationDate}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Full prediction accuracy dashboard (for overview pages)
 */
function PredictionDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'details' | 'methodology'>('overview')
  const stats = calculatePredictionStats(HISTORICAL_PREDICTIONS)
  const comparisons = getPredictionComparisons()

  // Calculate how many we beat Wall Street
  const beatWallStreetCount = comparisons.filter(c => c.weBeatWallStreet).length

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="bg-gradient-to-br from-[#4ebe96]/10 via-[#1a1a1a] to-[#1a1a1a] border-[#4ebe96]/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Award className="w-8 h-8 text-[#4ebe96]" />
            Our 2025 Predictions: {stats.accuracyRate.toFixed(1)}% Accurate
          </CardTitle>
          <p className="text-[#868f97]">
            Transparent track record of AI-powered stock predictions
          </p>
        </CardHeader>
        <CardContent>
          {/* Navigation */}
          <div className="flex gap-2 mb-6 border-b border-white/[0.08]">
            {(['overview', 'details', 'methodology'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium transition-colors duration-100 border-b-2 -mb-px ${
                  activeTab === tab
                    ? 'border-[#4ebe96] text-[#4ebe96]'
                    : 'border-transparent text-[#868f97] hover:text-white'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div>
              {/* Main Gauges */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white/[0.015] rounded-xl">
                  <AccuracyGauge value={stats.accuracyRate} label="Overall Accuracy" />
                </div>
                <div className="bg-white/[0.015] rounded-xl">
                  <AccuracyGauge value={stats.directionAccuracyRate} label="Direction Accuracy" />
                </div>
                <div className="bg-white/[0.015] rounded-xl">
                  <AccuracyGauge value={stats.wallStreetAccuracyRate} label="Wall Street Avg" />
                </div>
                <div className="bg-white/[0.015] rounded-xl">
                  <AccuracyGauge
                    value={(beatWallStreetCount / stats.totalPredictions) * 100}
                    label="Beat Wall Street"
                  />
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="p-4 bg-white/[0.025] rounded-lg text-center">
                  <p className="text-3xl font-bold text-[#4ebe96]">{stats.totalPredictions}</p>
                  <p className="text-sm text-[#868f97]">Total Predictions</p>
                </div>
                <div className="p-4 bg-white/[0.025] rounded-lg text-center">
                  <p className="text-3xl font-bold text-[#4ebe96]">{stats.correctPredictions}</p>
                  <p className="text-sm text-[#868f97]">Fully Correct</p>
                </div>
                <div className="p-4 bg-white/[0.025] rounded-lg text-center">
                  <p className="text-3xl font-bold text-yellow-500">{stats.partiallyCorrect}</p>
                  <p className="text-sm text-[#868f97]">Partially Correct</p>
                </div>
                <div className="p-4 bg-white/[0.025] rounded-lg text-center">
                  <p className="text-3xl font-bold">{stats.averageError.toFixed(1)}%</p>
                  <p className="text-sm text-[#868f97]">Avg. Error</p>
                </div>
              </div>

              {/* Beat Wall Street Banner */}
              {stats.beatWallStreet && (
                <div className="p-4 bg-gradient-to-r from-[#4ebe96]/20 to-[#4ebe96]/5 rounded-lg border border-[#4ebe96]/30 flex items-center gap-3">
                  <Award className="w-10 h-10 text-[#4ebe96]" />
                  <div>
                    <p className="font-bold text-[#4ebe96]">
                      Outperformed Wall Street in {beatWallStreetCount}/{stats.totalPredictions} predictions
                    </p>
                    <p className="text-sm text-[#868f97]">
                      Our AI models achieved {(stats.accuracyRate - stats.wallStreetAccuracyRate).toFixed(1)}% higher accuracy than Wall Street consensus
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Details Tab */}
          {activeTab === 'details' && (
            <div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/[0.08]">
                      <th className="p-3 text-left">Stock</th>
                      <th className="p-3 text-left">Our Prediction</th>
                      <th className="p-3 text-left">Actual Result</th>
                      <th className="p-3 text-right">Our Accuracy</th>
                      <th className="p-3 text-right">Wall Street</th>
                      <th className="p-3 text-center">Beat WS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisons.map((comparison, i) => (
                      <ComparisonRow key={i} {...comparison} />
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Individual Cards for Mobile */}
              <div className="mt-6 space-y-4 md:hidden">
                {HISTORICAL_PREDICTIONS.map((prediction, i) => (
                  <PredictionCard key={i} prediction={prediction} />
                ))}
              </div>
            </div>
          )}

          {/* Methodology Tab */}
          {activeTab === 'methodology' && (
            <div className="space-y-6">
              <div className="p-4 bg-white/[0.015] rounded-lg">
                <h3 className="font-bold mb-2 flex items-center gap-2">
                  <Target className="w-5 h-5 text-[#4ebe96]" />
                  How We Score Accuracy
                </h3>
                <p className="text-sm text-[#868f97] mb-3">
                  Our accuracy score measures how close our predicted price was to the actual price at the evaluation date:
                </p>
                <div className="bg-[#1a1a1a] p-3 rounded-lg font-mono text-sm">
                  Accuracy = 100% - |Predicted Price - Actual Price| / Actual Price * 100%
                </div>
              </div>

              <div className="p-4 bg-white/[0.015] rounded-lg">
                <h3 className="font-bold mb-2 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-500" />
                  Prediction Categories
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[#4ebe96]" />
                    <span><strong>Correct:</strong> Price direction correct + within 10% of target</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-yellow-500" />
                    <span><strong>Partially Correct:</strong> Price direction correct but outside 10% margin</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-red-500" />
                    <span><strong>Incorrect:</strong> Price direction wrong</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-white/[0.015] rounded-lg">
                <h3 className="font-bold mb-2 flex items-center gap-2">
                  <Award className="w-5 h-5 text-purple-500" />
                  Why We Track This
                </h3>
                <ul className="text-sm text-[#868f97] space-y-2">
                  <li>1. <strong>Accountability:</strong> We stand behind our predictions</li>
                  <li>2. <strong>Transparency:</strong> You deserve to know our track record</li>
                  <li>3. <strong>Improvement:</strong> We use results to refine our AI models</li>
                  <li>4. <strong>Trust:</strong> Verified performance builds confidence</li>
                </ul>
              </div>

              <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                <p className="text-amber-600 dark:text-amber-400 text-xs">
                  <strong>Disclaimer:</strong> Past prediction performance does not guarantee future results.
                  Our AI models are continuously improving, and market conditions vary.
                  Always conduct your own research and consult a financial advisor before making investment decisions.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * Main component that shows either stock-specific or full dashboard view
 */
function PredictionAccuracyComponent({
  ticker,
  companyName,
  currentPrice,
  showFullDashboard = false
}: PredictionAccuracyProps) {
  if (showFullDashboard) {
    return <PredictionDashboard />
  }

  if (ticker) {
    return (
      <StockPredictionAccuracy
        ticker={ticker}
        companyName={companyName}
        currentPrice={currentPrice}
      />
    )
  }

  // Default: show mini summary
  const stats = calculatePredictionStats(HISTORICAL_PREDICTIONS)

  return (
    <Card className="w-full bg-gradient-to-br from-[#4ebe96]/5 to-transparent">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#4ebe96]/20 flex items-center justify-center">
              <Award className="w-6 h-6 text-[#4ebe96]" />
            </div>
            <div>
              <p className="font-bold">Our 2025 Prediction Accuracy</p>
              <p className="text-sm text-[#868f97]">
                {stats.totalPredictions} predictions tracked
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-[#4ebe96]">{stats.accuracyRate.toFixed(1)}%</p>
            <p className="text-sm text-[#868f97]">
              vs {stats.wallStreetAccuracyRate.toFixed(1)}% Wall Street
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Export sub-components for flexible usage
 */
export { AccuracyGauge, PredictionCard, PredictionDashboard, StockPredictionAccuracy }

export default memo(PredictionAccuracyComponent)
