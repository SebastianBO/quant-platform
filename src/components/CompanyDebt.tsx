"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { cn, formatCurrency as formatCurrencyUtil } from "@/lib/utils"
import { AlertTriangle, TrendingDown, Calendar, DollarSign, Clock, ChevronRight } from "lucide-react"
import { DataSourceIndicator } from "@/components/DataSourceBadge"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts"

interface DebtMaturity {
  year: string
  label: string
  amount: number
  percentOfTotal: number
}

interface CompanyDebtData {
  ticker: string
  companyName: string
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
  _meta: {
    source: string
    fiscalYear: number | null
  }
}

interface CompanyDebtProps {
  ticker: string
}

function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) return '-'
  return formatCurrencyUtil(value)
}

function MaturityBar({ maturity, maxAmount }: { maturity: DebtMaturity; maxAmount: number }) {
  const percentage = maxAmount > 0 ? (maturity.amount / maxAmount) * 100 : 0

  return (
    <div className="flex items-center gap-3">
      <div className="w-20 text-xs text-[#868f97] font-medium">
        {maturity.label}
      </div>
      <div className="flex-1 flex items-center gap-2">
        <div className="flex-1 h-6 bg-white/[0.05] rounded overflow-hidden">
          <div
            className={cn(
              "h-full rounded motion-safe:transition-all motion-safe:duration-100 ease-out",
              maturity.year === 'Year 1' ? 'bg-[#ff5c5c]/80' :
              maturity.year === 'Year 2' ? 'bg-[#ffa16c]/80' :
              maturity.year === 'Year 3' ? 'bg-[#f4a623]/80' :
              maturity.year === 'Year 4' ? 'bg-[#4ebe96]/80' :
              maturity.year === 'Year 5' ? 'bg-emerald-500/80' :
              'bg-[#479ffa]/80'
            )}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
        <div className="w-20 text-right">
          <span className="text-sm font-medium tabular-nums">{formatCurrency(maturity.amount)}</span>
        </div>
        <div className="w-12 text-right">
          <span className="text-xs text-[#868f97] tabular-nums">{maturity.percentOfTotal.toFixed(1)}%</span>
        </div>
      </div>
    </div>
  )
}

export default function CompanyDebt({ ticker }: CompanyDebtProps) {
  const [data, setData] = useState<CompanyDebtData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!ticker) return

    const fetchData = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/company-debt?ticker=${ticker}`)
        if (!response.ok) throw new Error('Failed to fetch company debt data')
        const result = await response.json()
        setData(result)
      } catch (err) {
        console.error('Error fetching company debt:', err)
        setError('Unable to load company debt data')
      }

      setLoading(false)
    }

    fetchData()
  }, [ticker])

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Company Debt
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-8 bg-white/[0.05] rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !data || !data.debt) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Company Debt
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-[#868f97]">
            <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>{error || 'No debt data available'}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const debt = data.debt
  const maxMaturity = Math.max(...debt.maturitySchedule.map(m => m.amount), 1)

  // Calculate debt health indicators
  const shortTermPercent = debt.totalDebt && debt.totalDebt > 0
    ? ((debt.shortTermDebt || 0) / debt.totalDebt) * 100
    : 0

  const nearTermMaturityPercent = debt.totalScheduledMaturities > 0
    ? ((debt.maturitySchedule.find(m => m.year === 'Year 1')?.amount || 0) / debt.totalScheduledMaturities) * 100
    : 0

  // Prepare chart data
  const chartData = debt.maturitySchedule.map(m => ({
    name: m.label,
    amount: m.amount / 1e9, // Convert to billions for display
    percent: m.percentOfTotal,
    year: m.year
  }))

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            <span>Company Debt</span>
            <DataSourceIndicator source="sec-edgar" />
          </div>
          {data.asOfDate && (
            <span className="text-xs text-[#868f97] font-normal">
              As of {new Date(data.asOfDate).toLocaleDateString()}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Debt Summary Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl">
            <div className="flex items-center gap-2 text-[#868f97] mb-1">
              <DollarSign className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">Total Debt</span>
            </div>
            <p className="text-xl font-bold tabular-nums">{formatCurrency(debt.totalDebt)}</p>
          </div>
          <div className="p-4 bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl">
            <div className="flex items-center gap-2 text-[#868f97] mb-1">
              <TrendingDown className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">Interest Expense</span>
            </div>
            <p className="text-xl font-bold tabular-nums">{formatCurrency(debt.interestExpense)}</p>
            <p className="text-xs text-[#868f97]">Annual</p>
          </div>
        </div>

        {/* Debt Breakdown */}
        <div className="space-y-2">
          <p className="text-sm font-medium mb-3">Debt Structure</p>
          <div className="space-y-2">
            <div className="flex justify-between items-center p-2 bg-white/[0.05] rounded">
              <span className="text-sm">Long-term Debt</span>
              <span className="font-medium tabular-nums">{formatCurrency(debt.longTermDebt)}</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-white/[0.05] rounded">
              <div className="flex items-center gap-2">
                <span className="text-sm">Short-term Debt</span>
                {shortTermPercent > 30 && (
                  <span className="text-[10px] px-1.5 py-0.5 bg-[#ffa16c]/20 text-[#ffa16c] rounded-full tabular-nums">
                    {shortTermPercent.toFixed(0)}% of total
                  </span>
                )}
              </div>
              <span className="font-medium tabular-nums">{formatCurrency(debt.shortTermDebt)}</span>
            </div>
            {debt.currentPortionOfLongTermDebt && debt.currentPortionOfLongTermDebt > 0 && (
              <div className="flex justify-between items-center p-2 pl-6 text-[#868f97] text-sm">
                <span className="flex items-center gap-1">
                  <ChevronRight className="w-3 h-3" />
                  Current portion of LT debt
                </span>
                <span className="tabular-nums">{formatCurrency(debt.currentPortionOfLongTermDebt)}</span>
              </div>
            )}
            {debt.commercialPaper && debt.commercialPaper > 0 && (
              <div className="flex justify-between items-center p-2 pl-6 text-[#868f97] text-sm">
                <span className="flex items-center gap-1">
                  <ChevronRight className="w-3 h-3" />
                  Commercial Paper
                </span>
                <span className="tabular-nums">{formatCurrency(debt.commercialPaper)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Maturity Schedule */}
        {debt.maturitySchedule.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Debt Maturity Schedule</p>
              <div className="flex items-center gap-1 text-xs text-[#868f97]">
                <Clock className="w-3 h-3" />
                <span className="tabular-nums">Total: {formatCurrency(debt.totalScheduledMaturities)}</span>
              </div>
            </div>

            {/* Chart View */}
            <div className="h-40 -mx-2">
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
                    width={45}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.03)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '16px',
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
                          entry.year === 'Year 1' ? '#ff5c5c' :
                          entry.year === 'Year 2' ? '#ffa16c' :
                          entry.year === 'Year 3' ? '#f4a623' :
                          entry.year === 'Year 4' ? '#4ebe96' :
                          entry.year === 'Year 5' ? '#10b981' :
                          '#479ffa'
                        }
                        opacity={0.8}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Bar breakdown */}
            <div className="space-y-2 pt-2">
              {debt.maturitySchedule.map((maturity) => (
                <MaturityBar
                  key={maturity.year}
                  maturity={maturity}
                  maxAmount={maxMaturity}
                />
              ))}
            </div>
          </div>
        )}

        {/* Risk Indicators */}
        {(nearTermMaturityPercent > 20 || shortTermPercent > 30) && (
          <div className={cn(
            "p-3 rounded-2xl border",
            nearTermMaturityPercent > 30 || shortTermPercent > 40
              ? "bg-[#ff5c5c]/5 border-[#ff5c5c]/30"
              : "bg-[#ffa16c]/5 border-[#ffa16c]/30"
          )}>
            <div className="flex items-start gap-2">
              <AlertTriangle className={cn(
                "w-4 h-4 mt-0.5 flex-shrink-0",
                nearTermMaturityPercent > 30 || shortTermPercent > 40
                  ? "text-[#ff5c5c]"
                  : "text-[#ffa16c]"
              )} />
              <div className="text-xs">
                <p className="font-medium mb-1">Refinancing Risk</p>
                <p className="text-[#868f97]">
                  {nearTermMaturityPercent > 20 && (
                    <span className="tabular-nums">{nearTermMaturityPercent.toFixed(0)}% of scheduled debt matures within 1 year. </span>
                  )}
                  {shortTermPercent > 30 && (
                    <span className="tabular-nums">{shortTermPercent.toFixed(0)}% of total debt is short-term. </span>
                  )}
                  This may require refinancing in rising rate environments.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-xs text-[#868f97] border-t border-white/[0.08] pt-4">
          <p className="font-medium mb-1">Data Source</p>
          <p>SEC EDGAR XBRL filings - Updated with each 10-K/10-Q filing</p>
        </div>
      </CardContent>
    </Card>
  )
}
