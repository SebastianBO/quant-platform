"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn, formatCurrency as formatCurrencyBase } from "@/lib/utils"
import { DataSourceIndicator } from "@/components/DataSourceBadge"
import {
  ArrowLeft,
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
  ArrowUpRight
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
  _meta: {
    source: string
    fetched_at: string
  }
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

function formatPercent(value: number | null | undefined, decimals: number = 1): string {
  if (value === null || value === undefined) return '-'
  return (value * 100).toFixed(decimals) + '%'
}

export default function DebtPage() {
  const params = useParams()
  const ticker = (params.ticker as string)?.toUpperCase()

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
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <Link href={`/stock/${ticker}`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to {ticker}
              </Button>
            </Link>
          </div>
          <div className="space-y-6">
            <div className="h-32 bg-secondary/30 rounded-lg animate-pulse" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-secondary/30 rounded-lg animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !data || !data.debt) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <Link href={`/stock/${ticker}`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to {ticker}
              </Button>
            </Link>
          </div>
          <Card>
            <CardContent className="py-12">
              <div className="text-center text-muted-foreground">
                <AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No Debt Data Available</p>
                <p className="text-sm mt-2">{error || 'Unable to retrieve debt information for this company'}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
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
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Link href={`/stock/${ticker}`}>
              <Button variant="ghost" size="sm" className="mb-2">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to {ticker}
              </Button>
            </Link>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Building2 className="w-8 h-8" />
              {data.companyName} Debt Analysis
            </h1>
            <p className="text-muted-foreground mt-1 flex items-center gap-2">
              <DataSourceIndicator source="sec-edgar" />
              {data.asOfDate && (
                <span>As of {new Date(data.asOfDate).toLocaleDateString()}</span>
              )}
              {data._meta.fiscalYear && (
                <span>| FY{data._meta.fiscalYear}</span>
              )}
            </p>
          </div>

          {/* Health Rating Badge */}
          <div className={cn(
            "px-6 py-3 rounded-lg border-2",
            ratingConfig.bg,
            ratingConfig.border
          )}>
            <p className="text-xs text-muted-foreground mb-1">Debt Health</p>
            <p className={cn("text-2xl font-bold", ratingConfig.color)}>
              {ratingConfig.label}
            </p>
          </div>
        </div>

        {/* Key Metrics Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <DollarSign className="w-4 h-4" />
                <span className="text-xs font-medium">Total Debt</span>
              </div>
              <p className="text-2xl font-bold">{formatCurrency(debt.totalDebt)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <PiggyBank className="w-4 h-4" />
                <span className="text-xs font-medium">Net Debt</span>
              </div>
              <p className="text-2xl font-bold">{formatCurrency(ratios?.netDebt)}</p>
              <p className="text-xs text-muted-foreground">After cash</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Percent className="w-4 h-4" />
                <span className="text-xs font-medium">Interest Coverage</span>
              </div>
              <p className="text-2xl font-bold">{formatRatio(ratios?.interestCoverage)}</p>
              <p className="text-xs text-muted-foreground">Op. Income / Interest</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Activity className="w-4 h-4" />
                <span className="text-xs font-medium">Debt to Equity</span>
              </div>
              <p className="text-2xl font-bold">{formatRatio(ratios?.debtToEquity)}</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Debt Structure */}
          <div className="lg:col-span-2 space-y-6">
            {/* Maturity Schedule Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Debt Maturity Schedule
                </CardTitle>
              </CardHeader>
              <CardContent>
                {chartData.length > 0 ? (
                  <>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} barSize={40}>
                          <XAxis
                            dataKey="name"
                            stroke="hsl(var(--muted-foreground))"
                            tick={{ fontSize: 12 }}
                            tickLine={false}
                            axisLine={false}
                          />
                          <YAxis
                            stroke="hsl(var(--muted-foreground))"
                            tick={{ fontSize: 12 }}
                            tickFormatter={(v) => `$${v}B`}
                            width={50}
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
                            labelFormatter={(label) => `Maturing in ${label}`}
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
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-2">
                      {debt.maturitySchedule.map((m) => (
                        <div key={m.year} className="p-3 bg-secondary/30 rounded-lg">
                          <p className="text-xs text-muted-foreground">{m.label}</p>
                          <p className="font-semibold">{formatCurrency(m.amount)}</p>
                          <p className="text-xs text-muted-foreground">{m.percentOfTotal.toFixed(1)}% of total</p>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    No maturity schedule data available
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Debt Structure Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Debt Structure
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-secondary/30 rounded-lg">
                    <div>
                      <span className="font-medium">Long-term Debt</span>
                      <p className="text-xs text-muted-foreground">Due after 1 year</p>
                    </div>
                    <span className="text-lg font-bold">{formatCurrency(debt.longTermDebt)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-secondary/30 rounded-lg">
                    <div>
                      <span className="font-medium">Short-term Debt</span>
                      <p className="text-xs text-muted-foreground">Due within 1 year</p>
                    </div>
                    <span className="text-lg font-bold">{formatCurrency(debt.shortTermDebt)}</span>
                  </div>
                  {debt.currentPortionOfLongTermDebt && debt.currentPortionOfLongTermDebt > 0 && (
                    <div className="flex justify-between items-center p-3 pl-6 text-muted-foreground">
                      <span className="text-sm">Current portion of LT debt</span>
                      <span>{formatCurrency(debt.currentPortionOfLongTermDebt)}</span>
                    </div>
                  )}
                  {debt.commercialPaper && debt.commercialPaper > 0 && (
                    <div className="flex justify-between items-center p-3 pl-6 text-muted-foreground">
                      <span className="text-sm">Commercial Paper</span>
                      <span>{formatCurrency(debt.commercialPaper)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg border border-primary/30">
                    <span className="font-bold">Annual Interest Expense</span>
                    <span className="text-lg font-bold">{formatCurrency(debt.interestExpense)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Individual Bonds */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Corporate Bonds
                    <DataSourceIndicator source="openfigi" />
                  </div>
                  {bondsData && (
                    <div className="flex items-center gap-4 text-sm font-normal">
                      <span className="text-muted-foreground">
                        {bondsData.summary.totalBonds} active bonds
                      </span>
                      {bondsData.summary.avgCouponRate && (
                        <span className="text-muted-foreground">
                          Avg coupon: {bondsData.summary.avgCouponRate.toFixed(2)}%
                        </span>
                      )}
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {bondsLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} className="h-12 bg-secondary/30 rounded animate-pulse" />
                    ))}
                  </div>
                ) : bondsData && bondsData.bonds.length > 0 ? (
                  <>
                    {/* Maturing Soon Alert */}
                    {bondsData.maturingSoon.length > 0 && (
                      <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle className="w-4 h-4 text-yellow-500" />
                          <span className="font-medium text-sm">
                            {bondsData.maturingSoon.length} bonds maturing within 2 years
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {bondsData.maturingSoon.slice(0, 3).map((bond, i) => (
                            <span key={bond.figi}>
                              {bond.couponRate?.toFixed(2)}% due {bond.maturityDate}
                              {i < Math.min(2, bondsData.maturingSoon.length - 1) ? ' • ' : ''}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Bonds Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left py-2 px-2 font-medium text-muted-foreground">Bond</th>
                            <th className="text-right py-2 px-2 font-medium text-muted-foreground">Coupon</th>
                            <th className="text-right py-2 px-2 font-medium text-muted-foreground">Maturity</th>
                            <th className="text-right py-2 px-2 font-medium text-muted-foreground">Years Left</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(showAllBonds ? bondsData.bonds : bondsData.bonds.slice(0, 10)).map((bond) => (
                            <tr key={bond.figi} className="border-b border-border/50 hover:bg-secondary/20">
                              <td className="py-2.5 px-2">
                                <span className="font-mono text-xs">{bond.ticker}</span>
                              </td>
                              <td className="py-2.5 px-2 text-right">
                                <span className={cn(
                                  "font-medium",
                                  bond.couponRate && bond.couponRate >= 5 ? "text-green-500" :
                                  bond.couponRate && bond.couponRate >= 3 ? "text-foreground" :
                                  "text-muted-foreground"
                                )}>
                                  {bond.couponRate ? `${bond.couponRate.toFixed(2)}%` : 'Float'}
                                </span>
                              </td>
                              <td className="py-2.5 px-2 text-right text-muted-foreground">
                                {bond.maturityDate ? new Date(bond.maturityDate).toLocaleDateString() : '-'}
                              </td>
                              <td className="py-2.5 px-2 text-right">
                                <span className={cn(
                                  bond.yearsToMaturity && bond.yearsToMaturity <= 2 ? "text-yellow-500" :
                                  bond.yearsToMaturity && bond.yearsToMaturity <= 5 ? "text-orange-400" :
                                  "text-muted-foreground"
                                )}>
                                  {bond.yearsToMaturity ? `${bond.yearsToMaturity.toFixed(1)}y` : '-'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {bondsData.bonds.length > 10 && (
                      <Button
                        variant="ghost"
                        className="w-full mt-4"
                        onClick={() => setShowAllBonds(!showAllBonds)}
                      >
                        {showAllBonds ? 'Show Less' : `Show All ${bondsData.bonds.length} Bonds`}
                      </Button>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <DollarSign className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No bond data available for this company</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Ratios & Cash Flow */}
          <div className="space-y-6">
            {/* Debt Ratios */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Percent className="w-5 h-5" />
                  Debt Ratios
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">Debt to Equity</p>
                    <p className="text-xs text-muted-foreground">Total debt / Equity</p>
                  </div>
                  <span className={cn(
                    "text-lg font-bold",
                    ratios?.debtToEquity && ratios.debtToEquity > 2 ? "text-red-500" :
                    ratios?.debtToEquity && ratios.debtToEquity > 1 ? "text-yellow-500" :
                    "text-green-500"
                  )}>
                    {formatRatio(ratios?.debtToEquity)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">Debt to Assets</p>
                    <p className="text-xs text-muted-foreground">Total debt / Assets</p>
                  </div>
                  <span className="text-lg font-bold">
                    {formatPercent(ratios?.debtToAssets)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">Interest Coverage</p>
                    <p className="text-xs text-muted-foreground">Op. Income / Interest</p>
                  </div>
                  <span className={cn(
                    "text-lg font-bold",
                    ratios?.interestCoverage && ratios.interestCoverage < 2 ? "text-red-500" :
                    ratios?.interestCoverage && ratios.interestCoverage < 5 ? "text-yellow-500" :
                    "text-green-500"
                  )}>
                    {formatRatio(ratios?.interestCoverage)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">Debt Service Coverage</p>
                    <p className="text-xs text-muted-foreground">Cash Flow / Interest</p>
                  </div>
                  <span className="text-lg font-bold">
                    {formatRatio(ratios?.debtServiceCoverage)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Cash Flow Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Debt Activity (Annual)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <ArrowUpRight className="w-4 h-4 text-red-500" />
                    <span>New Debt Issued</span>
                  </div>
                  <span className="font-medium">{formatCurrency(cashFlow?.debtIssuances)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <ArrowDownRight className="w-4 h-4 text-green-500" />
                    <span>Debt Repaid</span>
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
                        <TrendingDown className="w-5 h-5 text-green-500" />
                      ) : (
                        <TrendingUp className="w-5 h-5 text-red-500" />
                      )}
                      <span className="font-medium">Net Change</span>
                    </div>
                    <span className={cn(
                      "text-lg font-bold",
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

            {/* Balance Sheet Context */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Balance Sheet Context
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Cash & Equivalents</span>
                  <span className="font-medium">{formatCurrency(balanceSheet?.cash)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total Assets</span>
                  <span className="font-medium">{formatCurrency(balanceSheet?.totalAssets)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Stockholders Equity</span>
                  <span className="font-medium">{formatCurrency(balanceSheet?.stockholdersEquity)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Operating Income</span>
                  <span className="font-medium">{formatCurrency(balanceSheet?.operatingIncome)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Operating Cash Flow</span>
                  <span className="font-medium">{formatCurrency(balanceSheet?.operatingCashFlow)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Risk Indicators */}
        {debt.maturitySchedule.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Risk Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Near-term refinancing risk */}
                {debt.maturitySchedule[0]?.percentOfTotal > 15 && (
                  <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
                      <div>
                        <p className="font-medium">Near-term Refinancing</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {debt.maturitySchedule[0].percentOfTotal.toFixed(0)}% of scheduled debt
                          ({formatCurrency(debt.maturitySchedule[0].amount)}) matures next year.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* High debt to equity */}
                {ratios?.debtToEquity && ratios.debtToEquity > 1.5 && (
                  <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-orange-500 mt-0.5" />
                      <div>
                        <p className="font-medium">High Leverage</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Debt-to-equity ratio of {formatRatio(ratios.debtToEquity)} is above typical thresholds.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Low interest coverage */}
                {ratios?.interestCoverage && ratios.interestCoverage < 3 && (
                  <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
                      <div>
                        <p className="font-medium">Low Interest Coverage</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Interest coverage of {formatRatio(ratios.interestCoverage)} suggests limited
                          buffer for interest payments.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Positive indicator - paying down debt */}
                {cashFlow?.isPayingDownDebt && (
                  <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                      <div>
                        <p className="font-medium">Deleveraging</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Company is actively reducing debt with {formatCurrency(Math.abs(cashFlow.netDebtChange || 0))} net repayment.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Strong interest coverage */}
                {ratios?.interestCoverage && ratios.interestCoverage >= 10 && (
                  <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                      <div>
                        <p className="font-medium">Strong Coverage</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Excellent interest coverage of {formatRatio(ratios.interestCoverage)} indicates
                          very comfortable debt servicing capacity.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Data Source Footer */}
        <div className="mt-6 text-xs text-muted-foreground border-t border-border pt-4">
          <p className="font-medium mb-1">Data Source</p>
          <p>SEC EDGAR XBRL filings (CIK: {data.cik}) - Updated with each 10-K/10-Q filing</p>
        </div>
      </div>
    </div>
  )
}
