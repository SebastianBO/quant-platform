"use client"

import { useState, useCallback, ReactNode } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis } from "recharts"
import { useTheme } from "next-themes"

interface Position {
  ticker: string
  shares: number
  avgCost?: number
  currentPrice?: number
  marketValue?: number
  gainLoss?: number
  gainLossPercent?: number
  weight?: number
}

interface PortfolioAnalysis {
  positions: Position[]
  totalValue: number
  sectors: { name: string; weight: number; value: number }[]
  metrics: {
    diversificationScore: number
    concentrationRisk: string
    topHolding: string
    topHoldingWeight: number
    numberOfPositions: number
    avgPositionSize: number
  }
  recommendations: string[]
}

const COLORS = ['#10b981', '#6366f1', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#84cc16', '#06b6d4']

function formatCurrency(num: number): string {
  if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`
  if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`
  if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`
  return `$${num.toFixed(2)}`
}

export default function PortfolioAnalyzer() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [positions, setPositions] = useState<Position[]>([])
  const [analysis, setAnalysis] = useState<PortfolioAnalysis | null>(null)
  const [aiRecommendations, setAiRecommendations] = useState<string>('')
  const [loading, setLoading] = useState<'extract' | 'analyze' | 'recommend' | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [manualEntry, setManualEntry] = useState(false)
  const [newPosition, setNewPosition] = useState({ ticker: '', shares: '', avgCost: '' })

  // Handle file drop/upload
  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file')
      return
    }

    // Convert to base64
    const reader = new FileReader()
    reader.onload = async (e) => {
      const base64 = e.target?.result as string
      setImagePreview(base64)

      // Extract positions using GPT-4o Vision
      setLoading('extract')
      try {
        const response = await fetch('/api/portfolio', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'extract',
            imageData: base64
          })
        })

        const data = await response.json()
        if (data.positions && data.positions.length > 0) {
          setPositions(data.positions)
          // Auto-analyze after extraction
          analyzePortfolio(data.positions)
        } else {
          alert('Could not extract positions from image. Try a clearer screenshot or add positions manually.')
        }
      } catch (error) {
        console.error('Error extracting positions:', error)
        alert('Error processing image. Please try again.')
      }
      setLoading(null)
    }
    reader.readAsDataURL(file)
  }, [])

  // Drag and drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  // Analyze portfolio
  const analyzePortfolio = async (positionsToAnalyze: Position[] = positions) => {
    if (positionsToAnalyze.length === 0) {
      alert('Add positions first')
      return
    }

    setLoading('analyze')
    try {
      const response = await fetch('/api/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'analyze',
          positions: positionsToAnalyze
        })
      })

      const data = await response.json()
      setAnalysis(data)
      setPositions(data.positions || positionsToAnalyze)
    } catch (error) {
      console.error('Error analyzing portfolio:', error)
    }
    setLoading(null)
  }

  // Get AI recommendations
  const getAIRecommendations = async () => {
    if (positions.length === 0) return

    setLoading('recommend')
    try {
      const response = await fetch('/api/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'recommend',
          positions
        })
      })

      const data = await response.json()
      setAiRecommendations(data.recommendations || '')
    } catch (error) {
      console.error('Error getting recommendations:', error)
    }
    setLoading(null)
  }

  // Add manual position
  const addPosition = () => {
    if (!newPosition.ticker || !newPosition.shares) return

    const position: Position = {
      ticker: newPosition.ticker.toUpperCase(),
      shares: parseFloat(newPosition.shares),
      avgCost: newPosition.avgCost ? parseFloat(newPosition.avgCost) : undefined
    }

    setPositions([...positions, position])
    setNewPosition({ ticker: '', shares: '', avgCost: '' })
  }

  // Remove position
  const removePosition = (index: number) => {
    setPositions(positions.filter((_, i) => i !== index))
    setAnalysis(null)
  }

  // Clear all
  const clearAll = () => {
    setPositions([])
    setAnalysis(null)
    setAiRecommendations('')
    setImagePreview(null)
  }

  // Format AI recommendations with markdown
  const formatRecommendations = (text: string): ReactNode[] => {
    if (!text) return []

    const lines = text.split('\n')
    const elements: ReactNode[] = []

    lines.forEach((line, i) => {
      const trimmed = line.trim()

      if (trimmed.startsWith('## ')) {
        elements.push(
          <h3 key={`h-${i}`} className="text-lg font-bold text-[#4ebe96] mt-4 mb-2">
            {trimmed.replace('## ', '')}
          </h3>
        )
      } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        elements.push(
          <li key={`li-${i}`} className="text-[#868f97] ml-4 mb-1">
            {trimmed.replace(/^[-*] /, '')}
          </li>
        )
      } else if (trimmed.match(/^\d+\. /)) {
        elements.push(
          <li key={`li-${i}`} className="text-[#868f97] ml-4 mb-1 list-decimal">
            {trimmed.replace(/^\d+\. /, '')}
          </li>
        )
      } else if (trimmed) {
        elements.push(
          <p key={`p-${i}`} className="text-[#868f97] mb-2">
            {trimmed}
          </p>
        )
      }
    })

    return elements
  }

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card className="bg-white/[0.03] backdrop-blur-[10px] border-white/[0.08]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">📸</span>
            Portfolio Analyzer
          </CardTitle>
          <p className="text-sm text-[#868f97]">
            Upload a screenshot of your brokerage positions or add them manually
          </p>
        </CardHeader>
        <CardContent>
          {/* Drop Zone */}
          <div
            className={`relative border-2 border-dashed rounded-2xl p-8 text-center motion-safe:transition-all motion-safe:duration-150 ease-out ${
              dragActive
                ? 'border-[#4ebe96] bg-[#4ebe96]/10'
                : 'border-white/[0.08] hover:border-[#868f97]'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {loading === 'extract' ? (
              <div className="py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#4ebe96] mx-auto mb-4"></div>
                <p className="text-[#868f97]">Claude 3.5 Sonnet is extracting your positions...</p>
              </div>
            ) : imagePreview ? (
              <div className="space-y-4">
                <img
                  src={imagePreview}
                  alt="Portfolio screenshot"
                  className="max-h-48 mx-auto rounded-2xl border border-white/[0.08]"
                />
                <button
                  onClick={() => {
                    setImagePreview(null)
                    setPositions([])
                    setAnalysis(null)
                  }}
                  className="px-4 py-2 bg-white/[0.05] hover:bg-white/[0.08] rounded-2xl text-sm motion-safe:transition-colors motion-safe:duration-150 ease-out"
                >
                  Upload Different Image
                </button>
              </div>
            ) : (
              <>
                <div className="text-4xl mb-4">📤</div>
                <p className="text-white mb-2">
                  Drag and drop a screenshot of your portfolio
                </p>
                <p className="text-[#868f97] text-sm mb-4">
                  or click to select a file
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileInput}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </>
            )}
          </div>

          {/* Manual Entry Toggle */}
          <div className="mt-4">
            <button
              onClick={() => setManualEntry(!manualEntry)}
              className="text-sm text-[#4ebe96] hover:text-[#4ebe96]/80 motion-safe:transition-colors motion-safe:duration-150 ease-out"
            >
              {manualEntry ? 'Hide manual entry' : 'Or add positions manually'}
            </button>
          </div>

          {/* Manual Entry Form */}
          {manualEntry && (
            <div className="mt-4 p-4 bg-white/[0.025] rounded-2xl">
              <div className="grid grid-cols-4 gap-3">
                <input
                  type="text"
                  placeholder="Ticker (e.g., AAPL)"
                  value={newPosition.ticker}
                  onChange={(e) => setNewPosition({ ...newPosition, ticker: e.target.value.toUpperCase() })}
                  className="bg-background border border-white/[0.08] rounded px-3 py-2 text-sm"
                />
                <input
                  type="number"
                  placeholder="Shares"
                  value={newPosition.shares}
                  onChange={(e) => setNewPosition({ ...newPosition, shares: e.target.value })}
                  className="bg-background border border-white/[0.08] rounded px-3 py-2 text-sm"
                />
                <input
                  type="number"
                  placeholder="Avg Cost (optional)"
                  value={newPosition.avgCost}
                  onChange={(e) => setNewPosition({ ...newPosition, avgCost: e.target.value })}
                  className="bg-background border border-white/[0.08] rounded px-3 py-2 text-sm"
                />
                <button
                  onClick={addPosition}
                  className="bg-[#4ebe96] hover:bg-[#4ebe96]/80 text-white rounded-2xl px-3 py-2 text-sm font-medium motion-safe:transition-colors motion-safe:duration-150 ease-out"
                >
                  Add
                </button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Positions List */}
      {positions.length > 0 && (
        <Card className="bg-white/[0.03] backdrop-blur-[10px] border-white/[0.08]">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">📋</span>
                Positions ({positions.length})
              </CardTitle>
              <div className="flex gap-2">
                <button
                  onClick={() => analyzePortfolio()}
                  disabled={loading === 'analyze'}
                  className="px-4 py-2 bg-[#4ebe96] hover:bg-[#4ebe96]/80 disabled:bg-white/[0.05] text-white rounded-2xl text-sm font-medium motion-safe:transition-colors motion-safe:duration-150 ease-out"
                >
                  {loading === 'analyze' ? 'Analyzing...' : 'Analyze Portfolio'}
                </button>
                <button
                  onClick={clearAll}
                  className="px-4 py-2 bg-white/[0.05] hover:bg-white/[0.08] rounded-2xl text-sm motion-safe:transition-colors motion-safe:duration-150 ease-out"
                >
                  Clear All
                </button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.08]">
                    <th className="text-left p-2">Ticker</th>
                    <th className="text-right p-2">Shares</th>
                    <th className="text-right p-2">Avg Cost</th>
                    <th className="text-right p-2">Current</th>
                    <th className="text-right p-2">Value</th>
                    <th className="text-right p-2">Gain/Loss</th>
                    <th className="text-right p-2">Weight</th>
                    <th className="text-right p-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {positions.map((pos, i) => (
                    <tr key={i} className="border-b border-white/[0.04] hover:bg-white/[0.025] motion-safe:transition-colors motion-safe:duration-150 ease-out">
                      <td className="p-2 font-bold">{pos.ticker || '-'}</td>
                      <td className="p-2 text-right tabular-nums">{pos.shares?.toLocaleString() || '-'}</td>
                      <td className="p-2 text-right tabular-nums">{pos.avgCost ? `$${pos.avgCost.toFixed(2)}` : '-'}</td>
                      <td className="p-2 text-right tabular-nums">{pos.currentPrice ? `$${pos.currentPrice.toFixed(2)}` : '-'}</td>
                      <td className="p-2 text-right tabular-nums">{pos.marketValue ? formatCurrency(pos.marketValue) : '-'}</td>
                      <td className={`p-2 text-right tabular-nums ${(pos.gainLossPercent || 0) >= 0 ? 'text-[#4ebe96]' : 'text-[#ff5c5c]'}`}>
                        {pos.gainLossPercent !== undefined ? `${pos.gainLossPercent >= 0 ? '+' : ''}${pos.gainLossPercent.toFixed(1)}%` : '-'}
                      </td>
                      <td className="p-2 text-right tabular-nums">{pos.weight ? `${pos.weight.toFixed(1)}%` : '-'}</td>
                      <td className="p-2 text-right">
                        <button
                          onClick={() => removePosition(i)}
                          className="text-[#ff5c5c] hover:text-[#ff5c5c]/80 text-xs motion-safe:transition-colors motion-safe:duration-150 ease-out"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analysis Results */}
      {analysis && (
        <>
          {/* Metrics Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-white/[0.03] backdrop-blur-[10px] border-white/[0.08]">
              <CardContent className="pt-6 text-center">
                <p className="text-[#868f97] text-sm">Total Value</p>
                <p className="text-2xl font-bold text-[#4ebe96] tabular-nums">{formatCurrency(analysis.totalValue)}</p>
              </CardContent>
            </Card>
            <Card className="bg-white/[0.03] backdrop-blur-[10px] border-white/[0.08]">
              <CardContent className="pt-6 text-center">
                <p className="text-[#868f97] text-sm">Diversification Score</p>
                <p className={`text-2xl font-bold tabular-nums ${analysis.metrics.diversificationScore >= 70 ? 'text-[#4ebe96]' : analysis.metrics.diversificationScore >= 50 ? 'text-[#f4a623]' : 'text-[#ff5c5c]'}`}>
                  {analysis.metrics.diversificationScore}/100
                </p>
              </CardContent>
            </Card>
            <Card className="bg-white/[0.03] backdrop-blur-[10px] border-white/[0.08]">
              <CardContent className="pt-6 text-center">
                <p className="text-[#868f97] text-sm">Concentration Risk</p>
                <p className={`text-2xl font-bold ${analysis.metrics.concentrationRisk === 'Low' ? 'text-[#4ebe96]' : analysis.metrics.concentrationRisk === 'Medium' ? 'text-[#f4a623]' : 'text-[#ff5c5c]'}`}>
                  {analysis.metrics.concentrationRisk}
                </p>
              </CardContent>
            </Card>
            <Card className="bg-white/[0.03] backdrop-blur-[10px] border-white/[0.08]">
              <CardContent className="pt-6 text-center">
                <p className="text-[#868f97] text-sm">Top Holding</p>
                <p className="text-2xl font-bold">{analysis.metrics.topHolding}</p>
                <p className="text-sm text-[#868f97] tabular-nums">{analysis.metrics.topHoldingWeight.toFixed(1)}%</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sector Allocation */}
            <Card className="bg-white/[0.03] backdrop-blur-[10px] border-white/[0.08]">
              <CardHeader>
                <CardTitle>Sector Allocation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analysis.sectors}
                        dataKey="weight"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={({ name, value }) => `${name}: ${(value as number).toFixed(1)}%`}
                      >
                        {analysis.sectors.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => `${value.toFixed(1)}%`}
                        contentStyle={{
                          backgroundColor: isDark ? 'hsl(0 0% 10%)' : 'hsl(0 0% 100%)',
                          border: isDark ? '1px solid hsl(0 0% 20%)' : '1px solid hsl(0 0% 85%)',
                          borderRadius: '8px'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Position Weights */}
            <Card className="bg-white/[0.03] backdrop-blur-[10px] border-white/[0.08]">
              <CardHeader>
                <CardTitle>Position Weights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={positions.slice(0, 10)} layout="vertical">
                      <XAxis
                        type="number"
                        tickFormatter={(v) => `${v}%`}
                        stroke={isDark ? 'hsl(0 0% 50%)' : 'hsl(0 0% 40%)'}
                      />
                      <YAxis
                        type="category"
                        dataKey="ticker"
                        width={60}
                        stroke={isDark ? 'hsl(0 0% 50%)' : 'hsl(0 0% 40%)'}
                      />
                      <Tooltip
                        formatter={(value: number) => `${value.toFixed(1)}%`}
                        contentStyle={{
                          backgroundColor: isDark ? 'hsl(0 0% 10%)' : 'hsl(0 0% 100%)',
                          border: isDark ? '1px solid hsl(0 0% 20%)' : '1px solid hsl(0 0% 85%)',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar dataKey="weight" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recommendations */}
          <Card className="bg-white/[0.03] backdrop-blur-[10px] border-white/[0.08]">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">💡</span>
                  Recommendations
                </CardTitle>
                <button
                  onClick={getAIRecommendations}
                  disabled={loading === 'recommend'}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:from-white/[0.05] disabled:to-white/[0.05] text-white rounded-2xl text-sm font-medium motion-safe:transition-colors motion-safe:duration-150 ease-out"
                >
                  {loading === 'recommend' ? 'Generating...' : 'Get AI Deep Analysis'}
                </button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Quick Recommendations */}
              <div className="space-y-2 mb-6">
                {analysis.recommendations.map((rec, i) => (
                  <div key={i} className="flex items-start gap-2 p-3 bg-white/[0.025] rounded-2xl">
                    <span className="text-[#f4a623]">⚡</span>
                    <p className="text-[#868f97] text-sm">{rec}</p>
                  </div>
                ))}
              </div>

              {/* AI Deep Analysis */}
              {aiRecommendations && (
                <div className="p-6 bg-gradient-to-br from-purple-900/20 to-indigo-900/20 rounded-2xl border border-purple-500/30">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-2xl">🤖</span>
                    <h4 className="font-bold">AI Portfolio Analysis</h4>
                  </div>
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    {formatRecommendations(aiRecommendations)}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Empty State */}
      {positions.length === 0 && !loading && (
        <div className="text-center py-12 bg-white/[0.015] rounded-2xl border border-white/[0.08]">
          <div className="text-4xl mb-4">📊</div>
          <p className="text-white text-lg mb-2">Upload your portfolio to get started</p>
          <p className="text-[#868f97] text-sm">
            Take a screenshot of your brokerage positions and drop it above
          </p>
        </div>
      )}
    </div>
  )
}
