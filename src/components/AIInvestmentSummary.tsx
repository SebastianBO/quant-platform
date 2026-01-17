"use client"

import { useState, ReactNode } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { formatCurrency, formatPercent } from "@/lib/utils"
import type {
  IncomeStatement,
  BalanceSheet,
  CashFlow,
  InsiderTrade,
  AnalystEstimate,
  BusinessSegment,
  StockInfo,
} from "@/types/financial"

interface AIInvestmentSummaryProps {
  ticker: string
  stockData: {
    snapshot: {
      price: number
      market_cap: number
      day_change_percent: number
    }
    metrics: {
      price_to_earnings_ratio?: number
      return_on_invested_capital?: number
      revenue_growth?: number
      gross_margin?: number
      operating_margin?: number
      net_margin?: number
      debt_to_equity?: number
      free_cash_flow_yield?: number
    }
    incomeStatements: IncomeStatement[]
    balanceSheets: BalanceSheet[]
    cashFlows: CashFlow[]
    insiderTrades: InsiderTrade[]
    analystEstimates: AnalystEstimate[]
    segments: BusinessSegment[]
    companyFacts?: StockInfo | null
  }
}

type AnalysisType = 'comprehensive' | 'red_flags' | 'questions' | 'competitive' | 'management' | 'valuation'

const ANALYSIS_OPTIONS: { type: AnalysisType; label: string; icon: string; description: string; color: string }[] = [
  { type: 'comprehensive', label: 'Full Thesis', icon: '📊', description: 'Complete investment analysis with bull/bear cases', color: 'from-emerald-600 to-cyan-600' },
  { type: 'red_flags', label: 'Red Flags', icon: '🚩', description: 'Forensic accounting & fraud detection', color: 'from-[#e15241] to-orange-600' },
  { type: 'questions', label: 'Due Diligence', icon: '❓', description: 'What questions should you ask?', color: 'from-purple-600 to-pink-600' },
  { type: 'competitive', label: 'Moat Analysis', icon: '🏰', description: 'Competitive position & Porter\'s Five Forces', color: 'from-[#479ffa] to-indigo-600' },
  { type: 'management', label: 'Management', icon: '👔', description: 'Leadership quality & capital allocation', color: 'from-amber-600 to-yellow-600' },
  { type: 'valuation', label: 'Valuation', icon: '💰', description: 'Is it cheap or expensive?', color: 'from-[#4ebe96] to-lime-600' },
]

export default function AIInvestmentSummary({ ticker, stockData }: AIInvestmentSummaryProps) {
  const [analyses, setAnalyses] = useState<Record<AnalysisType, string>>({
    comprehensive: '',
    red_flags: '',
    questions: '',
    competitive: '',
    management: '',
    valuation: '',
  })
  const [loading, setLoading] = useState<AnalysisType | null>(null)
  const [activeTab, setActiveTab] = useState<AnalysisType>('comprehensive')

  const generateAnalysis = async (type: AnalysisType) => {
    setLoading(type)
    setActiveTab(type)

    try {
      const response = await fetch('/api/ai-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticker,
          analysisType: type,
          data: {
            price: stockData.snapshot?.price,
            marketCap: stockData.snapshot?.market_cap,
            pe: stockData.metrics?.price_to_earnings_ratio,
            roic: stockData.metrics?.return_on_invested_capital,
            revenueGrowth: stockData.metrics?.revenue_growth,
            grossMargin: stockData.metrics?.gross_margin,
            operatingMargin: stockData.metrics?.operating_margin,
            netMargin: stockData.metrics?.net_margin,
            debtToEquity: stockData.metrics?.debt_to_equity,
            fcfYield: stockData.metrics?.free_cash_flow_yield,
            revenue: stockData.incomeStatements?.[0]?.revenue,
            netIncome: stockData.incomeStatements?.[0]?.net_income,
            freeCashFlow: stockData.cashFlows?.[0]?.free_cash_flow || stockData.cashFlows?.[0]?.operating_cash_flow,
            totalDebt: stockData.balanceSheets?.[0]?.total_debt,
            cash: stockData.balanceSheets?.[0]?.cash_and_equivalents,
            incomeStatements: stockData.incomeStatements,
            balanceSheets: stockData.balanceSheets,
            cashFlows: stockData.cashFlows,
            insiderTrades: stockData.insiderTrades,
            analystEstimates: stockData.analystEstimates,
            segments: stockData.segments,
            companyFacts: stockData.companyFacts,
          }
        })
      })

      const data = await response.json()
      setAnalyses(prev => ({
        ...prev,
        [type]: data.summary || 'Unable to generate analysis.'
      }))
    } catch (error) {
      console.error('Error generating AI analysis:', error)
      setAnalyses(prev => ({
        ...prev,
        [type]: 'Error generating analysis. Please try again.'
      }))
    }
    setLoading(null)
  }

  // Parse markdown-style headers and format
  const formatAnalysis = (text: string) => {
    if (!text) return null

    const lines = text.split('\n')
    const elements: ReactNode[] = []
    let currentSection: string | null = null

    lines.forEach((line, i) => {
      const trimmed = line.trim()

      if (trimmed.startsWith('## ')) {
        currentSection = trimmed.replace('## ', '')
        elements.push(
          <h3 key={`h-${i}`} className="text-lg font-bold text-[#4ebe96] mt-6 mb-2 flex items-center gap-2">
            <span className="w-2 h-2 bg-[#4ebe96] rounded-full"></span>
            {currentSection}
          </h3>
        )
      } else if (trimmed.startsWith('### ')) {
        elements.push(
          <h4 key={`h4-${i}`} className="text-md font-semibold text-white mt-4 mb-1">
            {trimmed.replace('### ', '')}
          </h4>
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
      } else if (trimmed.includes('**') && trimmed.includes('**')) {
        // Bold text handling
        const parts = trimmed.split(/\*\*(.*?)\*\*/g)
        elements.push(
          <p key={`p-${i}`} className="text-[#868f97] mb-2">
            {parts.map((part, j) =>
              j % 2 === 1 ? <strong key={j} className="text-white">{part}</strong> : part
            )}
          </p>
        )
      } else if (trimmed) {
        elements.push(
          <p key={`p-${i}`} className="text-[#868f97] mb-2 leading-relaxed">
            {trimmed}
          </p>
        )
      }
    })

    return elements
  }

  // Metrics grid for context
  const metricsGrid = [
    { label: 'P/E Ratio', value: stockData.metrics?.price_to_earnings_ratio?.toFixed(1) || 'N/A' },
    { label: 'ROIC', value: formatPercent(stockData.metrics?.return_on_invested_capital || 0) },
    { label: 'Revenue Growth', value: formatPercent(stockData.metrics?.revenue_growth || 0) },
    { label: 'Gross Margin', value: formatPercent(stockData.metrics?.gross_margin || 0) },
    { label: 'Operating Margin', value: formatPercent(stockData.metrics?.operating_margin || 0) },
    { label: 'FCF Yield', value: formatPercent(stockData.metrics?.free_cash_flow_yield || 0) },
  ]

  return (
    <Card className="w-full bg-[#1a1a1a] border-white/[0.08]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">🤖</span>
          AI Deep Due Diligence - {ticker}
        </CardTitle>
        <p className="text-sm text-[#868f97]">Powered by Claude 3.5 Sonnet | Institutional-Grade Analysis</p>
      </CardHeader>
      <CardContent>
        {/* Quick Metrics Reference */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-6">
          {metricsGrid.map((metric, i) => (
            <div key={i} className="text-center p-2 bg-white/[0.015] rounded">
              <p className="text-[#868f97] text-xs">{metric.label}</p>
              <p className="font-bold">{metric.value}</p>
            </div>
          ))}
        </div>

        {/* Analysis Type Selection */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          {ANALYSIS_OPTIONS.map((option) => {
            const hasAnalysis = !!analyses[option.type]
            const isLoading = loading === option.type
            const isActive = activeTab === option.type

            return (
              <button
                key={option.type}
                onClick={() => hasAnalysis ? setActiveTab(option.type) : generateAnalysis(option.type)}
                disabled={isLoading}
                className={`p-3 rounded-lg border transition-all duration-100 text-left ${
                  isActive
                    ? `bg-gradient-to-br ${option.color} border-transparent text-white`
                    : hasAnalysis
                    ? 'bg-white/[0.025] border-white/[0.08] hover:border-[#868f97]'
                    : 'bg-white/[0.01] border-white/[0.08] hover:border-[#868f97]'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{option.icon}</span>
                  <span className={`font-medium text-sm ${isActive ? 'text-white' : ''}`}>
                    {option.label}
                  </span>
                </div>
                <p className={`text-xs ${isActive ? 'text-white/80' : 'text-[#868f97]'}`}>
                  {isLoading ? 'Analyzing...' : hasAnalysis ? 'Click to view' : option.description}
                </p>
                {hasAnalysis && !isActive && (
                  <div className="mt-1 w-full h-1 bg-[#4ebe96]/30 rounded-full">
                    <div className="h-full w-full bg-[#4ebe96] rounded-full"></div>
                  </div>
                )}
              </button>
            )
          })}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-12 bg-white/[0.015] rounded-lg border border-white/[0.08]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-purple-500 mb-4"></div>
            <p className="text-[#868f97]">Claude 3.5 Sonnet is analyzing {ticker}...</p>
            <p className="text-[#868f97]/70 text-sm mt-1">
              {loading === 'comprehensive' && 'Building complete investment thesis...'}
              {loading === 'red_flags' && 'Scanning for accounting irregularities...'}
              {loading === 'questions' && 'Identifying information gaps...'}
              {loading === 'competitive' && 'Analyzing competitive moat...'}
              {loading === 'management' && 'Evaluating management quality...'}
              {loading === 'valuation' && 'Calculating fair value...'}
            </p>
          </div>
        )}

        {/* Analysis Content */}
        {!loading && analyses[activeTab] && (
          <div className="space-y-4">
            {/* Analysis Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">
                  {ANALYSIS_OPTIONS.find(o => o.type === activeTab)?.icon}
                </span>
                <h3 className="text-lg font-bold">
                  {ANALYSIS_OPTIONS.find(o => o.type === activeTab)?.label} Analysis
                </h3>
              </div>
              <button
                onClick={() => generateAnalysis(activeTab)}
                className="px-3 py-1 text-sm bg-white/[0.05] hover:bg-white/[0.08] rounded-lg transition-colors duration-100"
              >
                Regenerate
              </button>
            </div>

            {/* Analysis Body */}
            <div className="p-6 bg-gradient-to-br from-white/[0.025] to-white/[0.015] rounded-lg border border-white/[0.08]/50 max-h-[600px] overflow-y-auto">
              {formatAnalysis(analyses[activeTab])}
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2">
              {ANALYSIS_OPTIONS.filter(o => o.type !== activeTab && !analyses[o.type]).map(option => (
                <button
                  key={option.type}
                  onClick={() => generateAnalysis(option.type)}
                  className={`px-3 py-1.5 text-sm bg-gradient-to-r ${option.color} text-white rounded-lg hover:opacity-90 transition-opacity duration-100 flex items-center gap-1`}
                >
                  <span>{option.icon}</span>
                  Run {option.label}
                </button>
              ))}
            </div>

            {/* Disclaimer */}
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
              <p className="text-amber-600 dark:text-amber-400 text-xs">
                AI-generated analysis is for informational purposes only. Claude uses its training knowledge and the provided financial data.
                Always verify information independently and consult a qualified financial advisor before making investment decisions.
              </p>
            </div>
          </div>
        )}

        {/* Initial State */}
        {!loading && !analyses[activeTab] && (
          <div className="text-center py-12 bg-gradient-to-br from-purple-900/10 to-indigo-900/10 rounded-lg border border-purple-500/20">
            <div className="text-4xl mb-4">🔬</div>
            <p className="text-white text-lg mb-2">AI Deep Due Diligence</p>
            <p className="text-[#868f97] text-sm mb-6 max-w-md mx-auto">
              Select an analysis type above to generate institutional-grade research.
              Each analysis uses Claude 3.5 Sonnet with your company's actual financial data.
            </p>
            <button
              onClick={() => generateAnalysis('comprehensive')}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-lg font-medium transition-all duration-100"
            >
              Start with Full Investment Thesis
            </button>
          </div>
        )}

        {/* Analysis Summary (when multiple completed) */}
        {Object.values(analyses).filter(Boolean).length > 1 && (
          <div className="mt-6 p-4 bg-white/[0.015] rounded-lg border border-white/[0.08]">
            <p className="text-sm text-[#868f97] mb-2">Completed Analyses</p>
            <div className="flex flex-wrap gap-2">
              {ANALYSIS_OPTIONS.filter(o => analyses[o.type]).map(option => (
                <button
                  key={option.type}
                  onClick={() => setActiveTab(option.type)}
                  className={`px-3 py-1 text-sm rounded-full transition-all duration-100 ${
                    activeTab === option.type
                      ? 'bg-[#4ebe96] text-white'
                      : 'bg-white/[0.05] text-[#868f97] hover:bg-white/[0.08]'
                  }`}
                >
                  {option.icon} {option.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
