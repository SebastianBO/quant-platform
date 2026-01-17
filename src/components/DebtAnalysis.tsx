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
  EXCELLENT: { label: 'Excellent', color: 'text-[#4ebe96]', bg: 'bg-[#4ebe96]/10', border: 'border-[#4ebe96]/30' },
  GOOD: { label: 'Good', color: 'text-[#4ebe96]', bg: 'bg-[#4ebe96]/10', border: 'border-[#4ebe96]/30' },
  MODERATE: { label: 'Moderate', color: 'text-[#ffa16c]', bg: 'bg-[#ffa16c]/10', border: 'border-[#ffa16c]/30' },
  CONCERN: { label: 'Concern', color: 'text-[#ffa16c]', bg: 'bg-[#ffa16c]/10', border: 'border-[#ffa16c]/30' },
  HIGH_RISK: { label: 'High Risk', color: 'text-[#ff5c5c]', bg: 'bg-[#ff5c5c]/10', border: 'border-[#ff5c5c]/30' },
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
        <div className="h-32 bg-white/[0.015] rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-24 bg-white/[0.015] rounded-lg animate-pulse" />
          ))}
        </div>
        <div className="h-64 bg-white/[0.015] rounded-lg animate-pulse" />
      </div>
    )
  }

  if (error || !data || !data.debt) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center text-[#868f97]">
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
          <p className="text-[#868f97] text-sm flex items-center gap-2 mt-1">
            <DataSourceIndicator source="sec-edgar" />
            {data.asOfDate && <span>As of {new Date(data.asOfDate).toLocaleDateString()}</span>}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className={cn(
            "px-4 py-2 rounded-2xl border motion-safe:transition-all motion-safe:duration-150 ease-out",
            ratingConfig.bg,
            ratingConfig.border
          )}>
            <p className="text-xs text-[#868f97]">Debt Health</p>
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
            <div className="flex items-center gap-2 text-[#868f97] mb-1">
              <DollarSign className="w-4 h-4" />
              <span className="text-xs font-medium">Total Debt</span>
            </div>
            <p className="text-xl font-bold tabular-nums">{formatCurrency(debt.totalDebt)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-[#868f97] mb-1">
              <PiggyBank className="w-4 h-4" />
              <span className="text-xs font-medium">Net Debt</span>
            </div>
            <p className="text-xl font-bold tabular-nums">{formatCurrency(ratios?.netDebt)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-[#868f97] mb-1">
              <Percent className="w-4 h-4" />
              <span className="text-xs font-medium">Interest Coverage</span>
            </div>
            <p className="text-xl font-bold tabular-nums">{formatRatio(ratios?.interestCoverage)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-[#868f97] mb-1">
              <Activity className="w-4 h-4" />
              <span className="text-xs font-medium">Debt to Equity</span>
            </div>
            <p className="text-xl font-bold tabular-nums">{formatRatio(ratios?.debtToEquity)}</p>
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
                      stroke="#868f97"
                      tick={{ fontSize: 10 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#868f97"
                      tick={{ fontSize: 10 }}
                      tickFormatter={(v) => `$${v}B`}
                      width={40}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(0, 0, 0, 0.95)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '16px',
                        fontSize: '12px'
                      }}
                      formatter={(value: number) => [`$${value.toFixed(1)}B`, 'Amount']}
                    />
                    <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            entry.year === 'Year 1' ? '#ff5c5c' :
                            entry.year === 'Year 2' ? '#ffa16c' :
                            entry.year === 'Year 3' ? '#ffa16c' :
                            entry.year === 'Year 4' ? '#4ebe96' :
                            entry.year === 'Year 5' ? '#4ebe96' :
                            '#479ffa'
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-[#868f97]">
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
                <ArrowUpRight className="w-4 h-4 text-[#ff5c5c]" />
                <span className="text-sm">New Debt Issued</span>
              </div>
              <span className="font-medium tabular-nums">{formatCurrency(cashFlow?.debtIssuances)}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <ArrowDownRight className="w-4 h-4 text-[#4ebe96]" />
                <span className="text-sm">Debt Repaid</span>
              </div>
              <span className="font-medium tabular-nums">{formatCurrency(cashFlow?.debtRepayments)}</span>
            </div>
            <div className={cn(
              "p-3 rounded-2xl border motion-safe:transition-all motion-safe:duration-150 ease-out",
              cashFlow?.isPayingDownDebt
                ? "bg-[#4ebe96]/10 border-[#4ebe96]/30"
                : "bg-[#ff5c5c]/10 border-[#ff5c5c]/30"
            )}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {cashFlow?.isPayingDownDebt ? (
                    <TrendingDown className="w-4 h-4 text-[#4ebe96]" />
                  ) : (
                    <TrendingUp className="w-4 h-4 text-[#ff5c5c]" />
                  )}
                  <span className="font-medium text-sm">Net Change</span>
                </div>
                <span className={cn(
                  "font-bold tabular-nums",
                  cashFlow?.isPayingDownDebt ? "text-[#4ebe96]" : "text-[#ff5c5c]"
                )}>
                  {formatCurrency(cashFlow?.netDebtChange)}
                </span>
              </div>
              <p className="text-xs text-[#868f97] mt-1">
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
              <span className="text-sm font-normal text-[#868f97] tabular-nums">
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
                <div key={i} className="h-10 bg-white/[0.015] rounded animate-pulse" />
              ))}
            </div>
          ) : bondsData && bondsData.bonds.length > 0 ? (
            <>
              {bondsData.maturingSoon.length > 0 && (
                <div className="mb-4 p-3 bg-[#ffa16c]/10 border border-[#ffa16c]/30 rounded-2xl motion-safe:transition-all motion-safe:duration-150 ease-out">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-[#ffa16c]" />
                    <span className="font-medium text-sm">
                      {bondsData.maturingSoon.length} bonds maturing within 2 years
                    </span>
                  </div>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/[0.08]">
                      <th className="text-left py-2 px-2 font-medium text-[#868f97]">Bond</th>
                      <th className="text-right py-2 px-2 font-medium text-[#868f97]">Coupon</th>
                      <th className="text-right py-2 px-2 font-medium text-[#868f97]">Maturity</th>
                      <th className="text-right py-2 px-2 font-medium text-[#868f97]">Years</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(showAllBonds ? bondsData.bonds : bondsData.bonds.slice(0, 5)).map((bond) => (
                      <tr key={bond.figi} className="border-b border-white/[0.04] hover:bg-white/[0.08] motion-safe:transition-all motion-safe:duration-150 ease-out">
                        <td className="py-2 px-2">
                          <span className="font-mono text-xs">{bond.ticker}</span>
                        </td>
                        <td className="py-2 px-2 text-right tabular-nums">
                          {bond.couponRate ? `${bond.couponRate.toFixed(2)}%` : 'Float'}
                        </td>
                        <td className="py-2 px-2 text-right text-[#868f97] tabular-nums">
                          {bond.maturityDate ? new Date(bond.maturityDate).toLocaleDateString() : '-'}
                        </td>
                        <td className="py-2 px-2 text-right">
                          <span className={cn(
                            "tabular-nums",
                            bond.yearsToMaturity && bond.yearsToMaturity <= 2 ? "text-[#ffa16c]" : "text-[#868f97]"
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
            <div className="text-center py-6 text-[#868f97]">
              <DollarSign className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No bond data available for this company</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
