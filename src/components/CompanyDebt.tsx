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
      <div className="w-20 text-xs text-muted-foreground font-medium">
        {maturity.label}
      </div>
      <div className="flex-1 flex items-center gap-2">
        <div className="flex-1 h-6 bg-secondary/30 rounded overflow-hidden">
          <div
            className={cn(
              "h-full rounded transition-all",
              maturity.year === 'Year 1' ? 'bg-red-500/80' :
              maturity.year === 'Year 2' ? 'bg-orange-500/80' :
              maturity.year === 'Year 3' ? 'bg-yellow-500/80' :
              maturity.year === 'Year 4' ? 'bg-green-500/80' :
              maturity.year === 'Year 5' ? 'bg-emerald-500/80' :
              'bg-blue-500/80'
            )}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
        <div className="w-20 text-right">
          <span className="text-sm font-medium">{formatCurrency(maturity.amount)}</span>
        </div>
        <div className="w-12 text-right">
          <span className="text-xs text-muted-foreground">{maturity.percentOfTotal.toFixed(1)}%</span>
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
              <div key={i} className="h-8 bg-secondary/30 rounded animate-pulse" />
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
          <div className="text-center py-8 text-muted-foreground">
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
            <span className="text-xs text-muted-foreground font-normal">
              As of {new Date(data.asOfDate).toLocaleDateString()}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Debt Summary Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 bg-secondary/30 rounded-lg">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <DollarSign className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">Total Debt</span>
            </div>
            <p className="text-xl font-bold">{formatCurrency(debt.totalDebt)}</p>
          </div>
          <div className="p-4 bg-secondary/30 rounded-lg">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <TrendingDown className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">Interest Expense</span>
            </div>
            <p className="text-xl font-bold">{formatCurrency(debt.interestExpense)}</p>
            <p className="text-xs text-muted-foreground">Annual</p>
          </div>
        </div>

        {/* Debt Breakdown */}
        <div className="space-y-2">
          <p className="text-sm font-medium mb-3">Debt Structure</p>
          <div className="space-y-2">
            <div className="flex justify-between items-center p-2 bg-secondary/20 rounded">
              <span className="text-sm">Long-term Debt</span>
              <span className="font-medium">{formatCurrency(debt.longTermDebt)}</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-secondary/20 rounded">
              <div className="flex items-center gap-2">
                <span className="text-sm">Short-term Debt</span>
                {shortTermPercent > 30 && (
                  <span className="text-[10px] px-1.5 py-0.5 bg-yellow-500/20 text-yellow-500 rounded">
                    {shortTermPercent.toFixed(0)}% of total
                  </span>
                )}
              </div>
              <span className="font-medium">{formatCurrency(debt.shortTermDebt)}</span>
            </div>
            {debt.currentPortionOfLongTermDebt && debt.currentPortionOfLongTermDebt > 0 && (
              <div className="flex justify-between items-center p-2 pl-6 text-muted-foreground text-sm">
                <span className="flex items-center gap-1">
                  <ChevronRight className="w-3 h-3" />
                  Current portion of LT debt
                </span>
                <span>{formatCurrency(debt.currentPortionOfLongTermDebt)}</span>
              </div>
            )}
            {debt.commercialPaper && debt.commercialPaper > 0 && (
              <div className="flex justify-between items-center p-2 pl-6 text-muted-foreground text-sm">
                <span className="flex items-center gap-1">
                  <ChevronRight className="w-3 h-3" />
                  Commercial Paper
                </span>
                <span>{formatCurrency(debt.commercialPaper)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Maturity Schedule */}
        {debt.maturitySchedule.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Debt Maturity Schedule</p>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span>Total: {formatCurrency(debt.totalScheduledMaturities)}</span>
              </div>
            </div>

            {/* Chart View */}
            <div className="h-40 -mx-2">
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
                    width={45}
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
            "p-3 rounded-lg border",
            nearTermMaturityPercent > 30 || shortTermPercent > 40
              ? "bg-red-500/5 border-red-500/30"
              : "bg-yellow-500/5 border-yellow-500/30"
          )}>
            <div className="flex items-start gap-2">
              <AlertTriangle className={cn(
                "w-4 h-4 mt-0.5 flex-shrink-0",
                nearTermMaturityPercent > 30 || shortTermPercent > 40
                  ? "text-red-500"
                  : "text-yellow-500"
              )} />
              <div className="text-xs">
                <p className="font-medium mb-1">Refinancing Risk</p>
                <p className="text-muted-foreground">
                  {nearTermMaturityPercent > 20 && (
                    <span>{nearTermMaturityPercent.toFixed(0)}% of scheduled debt matures within 1 year. </span>
                  )}
                  {shortTermPercent > 30 && (
                    <span>{shortTermPercent.toFixed(0)}% of total debt is short-term. </span>
                  )}
                  This may require refinancing in rising rate environments.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-xs text-muted-foreground border-t border-border pt-4">
          <p className="font-medium mb-1">Data Source</p>
          <p>SEC EDGAR XBRL filings - Updated with each 10-K/10-Q filing</p>
        </div>
      </CardContent>
    </Card>
  )
}
