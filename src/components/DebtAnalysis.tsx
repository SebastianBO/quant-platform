"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn, formatCurrency as formatCurrencyBase } from "@/lib/utils"
import { DataSourceIndicator } from "@/components/DataSourceBadge"
import {
  DollarSign,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Building2,
  PiggyBank,
  Percent,
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  ExternalLink
} from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts"

interface DebtMaturity {
  year: string
  label: string
  amount: number
  percentOfTotal: number
}

interface ParsedBond {
  figi: string
  issuer: string
  ticker: string
  couponRate: number | null
  maturityDate: string | null
  maturityYear: number | null
  description: string
  exchange: string
  isMatured: boolean
  yearsToMaturity: number | null
}

interface CompanyDebtData {
  ticker: string
  companyName: string
  cik: string
  asOfDate: string | null
  debt: {
    totalDebt: number | null
    longTermDebt: number | null
    shortTermDebt: number | null
    currentPortionOfLongTermDebt: number | null
    commercialPaper: number | null
    interestExpense: number | null
    maturitySchedule: DebtMaturity[]
    totalScheduledMaturities: number
  } | null
  ratios: {
    netDebt: number | null
    debtToEquity: number | null
    debtToAssets: number | null
    interestCoverage: number | null
    debtServiceCoverage: number | null
    debtHealthRating: 'EXCELLENT' | 'GOOD' | 'MODERATE' | 'CONCERN' | 'HIGH_RISK'
  } | null
  cashFlow: {
    debtIssuances: number | null
    debtRepayments: number | null
    netDebtChange: number | null
    isPayingDownDebt: boolean
  } | null
  balanceSheet: {
    cash: number | null
    totalAssets: number | null
    stockholdersEquity: number | null
    operatingIncome: number | null
    operatingCashFlow: number | null
  } | null
  _meta: {
    source: string
    fiscalYear: number | null
  }
}

interface CompanyBondsData {
  ticker: string
  issuer: string
  summary: {
    totalBonds: number
    totalMatured: number
    avgCouponRate: number | null
    maturingSoonCount: number
    maturityYears: number[]
  }
  bonds: ParsedBond[]
  maturingSoon: ParsedBond[]
}

interface DebtAnalysisProps {
  ticker: string
}

function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) return '-'
  return formatCurrencyBase(value)
}

const healthRatingConfig = {
  EXCELLENT: { label: 'Excellent', color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/30' },
  GOOD: { label: 'Good', color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
  MODERATE: { label: 'Moderate', color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' },
  CONCERN: { label: 'Concern', color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/30' },
  HIGH_RISK: { label: 'High Risk', color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/30' },
}

function formatRatio(value: number | null | undefined, decimals: number = 2): string {
  if (value === null || value === undefined) return '-'
  return value.toFixed(decimals) + 'x'
}

export default function DebtAnalysis({ ticker }: DebtAnalysisProps) {
  const [data, setData] = useState<CompanyDebtData | null>(null)
  const [bondsData, setBondsData] = useState<CompanyBondsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [bondsLoading, setBondsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAllBonds, setShowAllBonds] = useState(false)

  useEffect(() => {
    if (!ticker) return

    const fetchData = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/company-debt?ticker=${ticker}`)
        if (!response.ok) throw new Error('Failed to fetch debt data')
        const result = await response.json()
        setData(result)
      } catch (err) {
        console.error('Error fetching debt data:', err)
        setError('Unable to load company debt data')
      }

      setLoading(false)
    }

    const fetchBonds = async () => {
      setBondsLoading(true)
      try {
        const response = await fetch(`/api/company-bonds?ticker=${ticker}`)
        if (response.ok) {
          const result = await response.json()
          setBondsData(result)
        }
      } catch (err) {
        console.error('Error fetching bonds:', err)
      }
      setBondsLoading(false)
    }

    fetchData()
    fetchBonds()
  }, [ticker])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-32 bg-secondary/30 rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-24 bg-secondary/30 rounded-lg animate-pulse" />
          ))}
        </div>
        <div className="h-64 bg-secondary/30 rounded-lg animate-pulse" />
      </div>
    )
  }

  if (error || !data || !data.debt) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center text-muted-foreground">
            <AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No Debt Data Available</p>
            <p className="text-sm mt-2">{error || 'Unable to retrieve debt information for this company'}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const { debt, ratios, cashFlow, balanceSheet } = data
  const rating = ratios?.debtHealthRating || 'MODERATE'
  const ratingConfig = healthRatingConfig[rating]

  const chartData = debt.maturitySchedule.map(m => ({
    name: m.label,
    amount: m.amount / 1e9,
    percent: m.percentOfTotal,
    year: m.year
  }))

  return (
    <div className="space-y-6">
      {/* Header with Health Rating */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Building2 className="w-6 h-6" />
            {data.companyName} Debt Analysis
          </h2>
          <p className="text-muted-foreground text-sm flex items-center gap-2 mt-1">
            <DataSourceIndicator source="sec-edgar" />
            {data.asOfDate && <span>As of {new Date(data.asOfDate).toLocaleDateString()}</span>}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className={cn(
            "px-4 py-2 rounded-lg border",
            ratingConfig.bg,
            ratingConfig.border
          )}>
            <p className="text-xs text-muted-foreground">Debt Health</p>
            <p className={cn("text-lg font-bold", ratingConfig.color)}>
              {ratingConfig.label}
            </p>
          </div>
          <Link href={`/debt/${ticker}`}>
            <Button variant="outline" size="sm">
              Full Analysis <ExternalLink className="w-3 h-3 ml-2" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Key Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <DollarSign className="w-4 h-4" />
              <span className="text-xs font-medium">Total Debt</span>
            </div>
            <p className="text-xl font-bold">{formatCurrency(debt.totalDebt)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <PiggyBank className="w-4 h-4" />
              <span className="text-xs font-medium">Net Debt</span>
            </div>
            <p className="text-xl font-bold">{formatCurrency(ratios?.netDebt)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Percent className="w-4 h-4" />
              <span className="text-xs font-medium">Interest Coverage</span>
            </div>
            <p className="text-xl font-bold">{formatRatio(ratios?.interestCoverage)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Activity className="w-4 h-4" />
              <span className="text-xs font-medium">Debt to Equity</span>
            </div>
            <p className="text-xl font-bold">{formatRatio(ratios?.debtToEquity)}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Maturity Schedule Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="w-4 h-4" />
              Debt Maturity Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} barSize={32}>
                    <XAxis
                      dataKey="name"
                      stroke="hsl(var(--muted-foreground))"
                      tick={{ fontSize: 10 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="hsl(var(--muted-foreground))"
                      tick={{ fontSize: 10 }}
                      tickFormatter={(v) => `$${v}B`}
                      width={40}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: '12px'
                      }}
                      formatter={(value: number) => [`$${value.toFixed(1)}B`, 'Amount']}
                    />
                    <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            entry.year === 'Year 1' ? '#ef4444' :
                            entry.year === 'Year 2' ? '#f97316' :
                            entry.year === 'Year 3' ? '#eab308' :
                            entry.year === 'Year 4' ? '#22c55e' :
                            entry.year === 'Year 5' ? '#10b981' :
                            '#3b82f6'
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-muted-foreground">
                No maturity schedule data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Debt Activity */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="w-4 h-4" />
              Debt Activity (Annual)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <ArrowUpRight className="w-4 h-4 text-red-500" />
                <span className="text-sm">New Debt Issued</span>
              </div>
              <span className="font-medium">{formatCurrency(cashFlow?.debtIssuances)}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <ArrowDownRight className="w-4 h-4 text-green-500" />
                <span className="text-sm">Debt Repaid</span>
              </div>
              <span className="font-medium">{formatCurrency(cashFlow?.debtRepayments)}</span>
            </div>
            <div className={cn(
              "p-3 rounded-lg border",
              cashFlow?.isPayingDownDebt
                ? "bg-green-500/10 border-green-500/30"
                : "bg-red-500/10 border-red-500/30"
            )}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {cashFlow?.isPayingDownDebt ? (
                    <TrendingDown className="w-4 h-4 text-green-500" />
                  ) : (
                    <TrendingUp className="w-4 h-4 text-red-500" />
                  )}
                  <span className="font-medium text-sm">Net Change</span>
                </div>
                <span className={cn(
                  "font-bold",
                  cashFlow?.isPayingDownDebt ? "text-green-500" : "text-red-500"
                )}>
                  {formatCurrency(cashFlow?.netDebtChange)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {cashFlow?.isPayingDownDebt
                  ? "Company is reducing debt"
                  : "Company is adding debt"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Corporate Bonds */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-base">
              <DollarSign className="w-4 h-4" />
              Corporate Bonds
              <DataSourceIndicator source="openfigi" />
            </div>
            {bondsData && (
              <span className="text-sm font-normal text-muted-foreground">
                {bondsData.summary.totalBonds} active bonds
                {bondsData.summary.avgCouponRate && ` • Avg coupon: ${bondsData.summary.avgCouponRate.toFixed(2)}%`}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {bondsLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-10 bg-secondary/30 rounded animate-pulse" />
              ))}
            </div>
          ) : bondsData && bondsData.bonds.length > 0 ? (
            <>
              {bondsData.maturingSoon.length > 0 && (
                <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-500" />
                    <span className="font-medium text-sm">
                      {bondsData.maturingSoon.length} bonds maturing within 2 years
                    </span>
                  </div>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 px-2 font-medium text-muted-foreground">Bond</th>
                      <th className="text-right py-2 px-2 font-medium text-muted-foreground">Coupon</th>
                      <th className="text-right py-2 px-2 font-medium text-muted-foreground">Maturity</th>
                      <th className="text-right py-2 px-2 font-medium text-muted-foreground">Years</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(showAllBonds ? bondsData.bonds : bondsData.bonds.slice(0, 5)).map((bond) => (
                      <tr key={bond.figi} className="border-b border-border/50 hover:bg-secondary/20">
                        <td className="py-2 px-2">
                          <span className="font-mono text-xs">{bond.ticker}</span>
                        </td>
                        <td className="py-2 px-2 text-right">
                          {bond.couponRate ? `${bond.couponRate.toFixed(2)}%` : 'Float'}
                        </td>
                        <td className="py-2 px-2 text-right text-muted-foreground">
                          {bond.maturityDate ? new Date(bond.maturityDate).toLocaleDateString() : '-'}
                        </td>
                        <td className="py-2 px-2 text-right">
                          <span className={cn(
                            bond.yearsToMaturity && bond.yearsToMaturity <= 2 ? "text-yellow-500" : "text-muted-foreground"
                          )}>
                            {bond.yearsToMaturity ? `${bond.yearsToMaturity.toFixed(1)}y` : '-'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {bondsData.bonds.length > 5 && (
                <Button
                  variant="ghost"
                  className="w-full mt-3"
                  size="sm"
                  onClick={() => setShowAllBonds(!showAllBonds)}
                >
                  {showAllBonds ? 'Show Less' : `Show All ${bondsData.bonds.length} Bonds`}
                </Button>
              )}
            </>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <DollarSign className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No bond data available for this company</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
