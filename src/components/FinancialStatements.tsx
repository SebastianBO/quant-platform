"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { formatCurrency, formatPercent } from "@/lib/utils"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from "recharts"
import { DynamicSourceBadge } from "@/components/DataSourceBadge"

interface DataSources {
  incomeStatements?: string
  balanceSheets?: string
  cashFlows?: string
  segmentedRevenues?: string
  quarterlyIncome?: string
  quarterlyBalance?: string
  quarterlyCashFlow?: string
}

type SourceOverride = 'auto' | 'eodhd' | 'financialdatasets'

interface FinancialStatementsProps {
  ticker: string
  companyFacts: any
  incomeStatements: any[]
  balanceSheets: any[]
  cashFlows: any[]
  quarterlyIncome: any[]
  quarterlyBalance: any[]
  quarterlyCashFlow: any[]
  metricsHistory: any[]
  productSegments: { name: string; revenue: number }[]
  geoSegments: { name: string; revenue: number }[]
  dataSources?: DataSources
  sourceOverride?: SourceOverride
  onSourceChange?: (source: SourceOverride) => void
}

type StatementType = 'income' | 'balance' | 'cashflow' | 'metrics' | 'segments'
type PeriodType = 'annual' | 'quarterly'

const COLORS = ['#10b981', '#6366f1', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16']

export default function FinancialStatements({
  ticker,
  companyFacts,
  incomeStatements,
  balanceSheets,
  cashFlows,
  quarterlyIncome,
  quarterlyBalance,
  quarterlyCashFlow,
  metricsHistory,
  productSegments,
  geoSegments,
  dataSources,
  sourceOverride = 'auto',
  onSourceChange
}: FinancialStatementsProps) {
  const [activeStatement, setActiveStatement] = useState<StatementType>('income')
  const [period, setPeriod] = useState<PeriodType>('annual')

  // ALL Income Statement fields
  const incomeRows = [
    { key: 'revenue', label: 'Revenue', highlight: true },
    { key: 'cost_of_revenue', label: 'Cost of Revenue' },
    { key: 'gross_profit', label: 'Gross Profit', highlight: true },
    { key: 'operating_expense', label: 'Operating Expenses' },
    { key: 'selling_general_and_administrative_expenses', label: 'SG&A' },
    { key: 'research_and_development', label: 'R&D' },
    { key: 'operating_income', label: 'Operating Income', highlight: true },
    { key: 'interest_expense', label: 'Interest Expense' },
    { key: 'ebit', label: 'EBIT' },
    { key: 'income_tax_expense', label: 'Income Tax' },
    { key: 'net_income_discontinued_operations', label: 'Discontinued Operations' },
    { key: 'net_income', label: 'Net Income', highlight: true },
    { key: 'net_income_common_stock', label: 'Net Income (Common)' },
    { key: 'preferred_dividends_impact', label: 'Preferred Dividends' },
    { key: 'consolidated_income', label: 'Consolidated Income' },
    { key: 'earnings_per_share', label: 'EPS (Basic)', isPerShare: true },
    { key: 'earnings_per_share_diluted', label: 'EPS (Diluted)', isPerShare: true },
    { key: 'dividends_per_common_share', label: 'Dividends/Share', isPerShare: true },
    { key: 'weighted_average_shares', label: 'Shares Outstanding' },
    { key: 'weighted_average_shares_diluted', label: 'Shares (Diluted)' },
  ]

  // ALL Balance Sheet fields
  const balanceRows = [
    { key: 'total_assets', label: 'Total Assets', highlight: true },
    { key: 'current_assets', label: 'Current Assets' },
    { key: 'cash_and_equivalents', label: 'Cash & Equivalents' },
    { key: 'current_investments', label: 'Short-term Investments' },
    { key: 'trade_and_non_trade_receivables', label: 'Receivables' },
    { key: 'inventory', label: 'Inventory' },
    { key: 'non_current_assets', label: 'Non-Current Assets' },
    { key: 'property_plant_and_equipment', label: 'PP&E' },
    { key: 'goodwill_and_intangible_assets', label: 'Goodwill & Intangibles' },
    { key: 'investments', label: 'Total Investments' },
    { key: 'non_current_investments', label: 'Long-term Investments' },
    { key: 'tax_assets', label: 'Deferred Tax Assets' },
    { key: 'total_liabilities', label: 'Total Liabilities', highlight: true },
    { key: 'current_liabilities', label: 'Current Liabilities' },
    { key: 'current_debt', label: 'Short-term Debt' },
    { key: 'trade_and_non_trade_payables', label: 'Payables' },
    { key: 'deferred_revenue', label: 'Deferred Revenue' },
    { key: 'non_current_liabilities', label: 'Non-Current Liabilities' },
    { key: 'non_current_debt', label: 'Long-term Debt' },
    { key: 'total_debt', label: 'Total Debt', highlight: true },
    { key: 'tax_liabilities', label: 'Deferred Tax Liabilities' },
    { key: 'shareholders_equity', label: 'Shareholders Equity', highlight: true },
    { key: 'retained_earnings', label: 'Retained Earnings' },
    { key: 'accumulated_other_comprehensive_income', label: 'Other Comprehensive Income' },
    { key: 'outstanding_shares', label: 'Outstanding Shares' },
  ]

  // ALL Cash Flow fields
  const cashFlowRows = [
    { key: 'net_income', label: 'Net Income' },
    { key: 'depreciation_and_amortization', label: 'D&A' },
    { key: 'share_based_compensation', label: 'Stock-Based Comp' },
    { key: 'net_cash_flow_from_operations', label: 'Operating Cash Flow', highlight: true },
    { key: 'capital_expenditure', label: 'CapEx' },
    { key: 'property_plant_and_equipment', label: 'PP&E Purchases' },
    { key: 'business_acquisitions_and_disposals', label: 'Acquisitions' },
    { key: 'investment_acquisitions_and_disposals', label: 'Investment Activity' },
    { key: 'net_cash_flow_from_investing', label: 'Investing Cash Flow', highlight: true },
    { key: 'issuance_or_repayment_of_debt_securities', label: 'Debt Issuance/Repayment' },
    { key: 'issuance_or_purchase_of_equity_shares', label: 'Share Buybacks' },
    { key: 'dividends_and_other_cash_distributions', label: 'Dividends Paid' },
    { key: 'net_cash_flow_from_financing', label: 'Financing Cash Flow', highlight: true },
    { key: 'change_in_cash_and_equivalents', label: 'Net Change in Cash' },
    { key: 'effect_of_exchange_rate_changes', label: 'FX Effect' },
    { key: 'ending_cash_balance', label: 'Ending Cash' },
    { key: 'free_cash_flow', label: 'Free Cash Flow', highlight: true },
  ]

  // ALL Metrics fields
  const metricsRows = [
    { key: 'market_cap', label: 'Market Cap', isCurrency: true },
    { key: 'enterprise_value', label: 'Enterprise Value', isCurrency: true },
    { key: 'price_to_earnings_ratio', label: 'P/E Ratio', isRatio: true },
    { key: 'price_to_book_ratio', label: 'P/B Ratio', isRatio: true },
    { key: 'price_to_sales_ratio', label: 'P/S Ratio', isRatio: true },
    { key: 'enterprise_value_to_ebitda_ratio', label: 'EV/EBITDA', isRatio: true },
    { key: 'enterprise_value_to_revenue_ratio', label: 'EV/Revenue', isRatio: true },
    { key: 'peg_ratio', label: 'PEG Ratio', isRatio: true },
    { key: 'free_cash_flow_yield', label: 'FCF Yield', isPercent: true },
    { key: 'gross_margin', label: 'Gross Margin', isPercent: true },
    { key: 'operating_margin', label: 'Operating Margin', isPercent: true },
    { key: 'net_margin', label: 'Net Margin', isPercent: true },
    { key: 'return_on_equity', label: 'ROE', isPercent: true },
    { key: 'return_on_assets', label: 'ROA', isPercent: true },
    { key: 'return_on_invested_capital', label: 'ROIC', isPercent: true },
    { key: 'asset_turnover', label: 'Asset Turnover', isRatio: true },
    { key: 'inventory_turnover', label: 'Inventory Turnover', isRatio: true },
    { key: 'receivables_turnover', label: 'Receivables Turnover', isRatio: true },
    { key: 'current_ratio', label: 'Current Ratio', isRatio: true },
    { key: 'quick_ratio', label: 'Quick Ratio', isRatio: true },
    { key: 'cash_ratio', label: 'Cash Ratio', isRatio: true },
    { key: 'debt_to_equity', label: 'Debt/Equity', isRatio: true },
    { key: 'debt_to_assets', label: 'Debt/Assets', isRatio: true },
    { key: 'interest_coverage', label: 'Interest Coverage', isRatio: true },
    { key: 'revenue_growth', label: 'Revenue Growth', isPercent: true },
    { key: 'earnings_growth', label: 'Earnings Growth', isPercent: true },
    { key: 'book_value_growth', label: 'Book Value Growth', isPercent: true },
    { key: 'free_cash_flow_growth', label: 'FCF Growth', isPercent: true },
    { key: 'payout_ratio', label: 'Payout Ratio', isPercent: true },
    { key: 'earnings_per_share', label: 'EPS', isPerShare: true },
    { key: 'book_value_per_share', label: 'Book Value/Share', isPerShare: true },
    { key: 'free_cash_flow_per_share', label: 'FCF/Share', isPerShare: true },
  ]

  const getStatementData = () => {
    switch (activeStatement) {
      case 'income':
        return {
          data: period === 'annual' ? incomeStatements : quarterlyIncome,
          rows: incomeRows,
          title: 'Income Statement',
          source: period === 'annual' ? dataSources?.incomeStatements : dataSources?.quarterlyIncome
        }
      case 'balance':
        return {
          data: period === 'annual' ? balanceSheets : quarterlyBalance,
          rows: balanceRows,
          title: 'Balance Sheet',
          source: period === 'annual' ? dataSources?.balanceSheets : dataSources?.quarterlyBalance
        }
      case 'cashflow':
        return {
          data: period === 'annual' ? cashFlows : quarterlyCashFlow,
          rows: cashFlowRows,
          title: 'Cash Flow Statement',
          source: period === 'annual' ? dataSources?.cashFlows : dataSources?.quarterlyCashFlow
        }
      case 'metrics':
        return {
          data: metricsHistory,
          rows: metricsRows,
          title: 'Financial Metrics',
          source: 'financialdatasets.ai' // Metrics always come from API currently
        }
      case 'segments':
        return {
          data: [],
          rows: [],
          title: 'Revenue Segments',
          source: dataSources?.segmentedRevenues
        }
    }
  }

  const { data, rows, title, source } = getStatementData()

  // Export to CSV
  const exportToCSV = () => {
    if (!data || data.length === 0) return

    const headers = ['Metric', ...data.map((d: any) => d.fiscal_period || d.report_period || 'Period')]
    const csvRows = [headers.join(',')]

    rows.forEach((row: any) => {
      const values = [
        row.label,
        ...data.map((d: any) => {
          const val = d[row.key]
          return typeof val === 'number' ? val : ''
        })
      ]
      csvRows.push(values.join(','))
    })

    const csv = csvRows.join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${ticker}_${activeStatement}_${period}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const formatValue = (value: any, row: any): string => {
    if (value === null || value === undefined) return '-'
    if (row.isPerShare) return `$${value.toFixed(2)}`
    if (row.isPercent) return `${(value * 100).toFixed(1)}%`
    if (row.isRatio) return value.toFixed(2)
    if (row.isCurrency) return formatCurrency(value)
    if (typeof value === 'number') {
      if (Math.abs(value) >= 1e9) return formatCurrency(value)
      if (Math.abs(value) >= 1e6) return `${(value / 1e6).toFixed(1)}M`
      return value.toLocaleString()
    }
    return String(value)
  }

  // Calculate YoY change
  const getYoYChange = (current: number, previous: number): string | null => {
    if (!current || !previous || previous === 0) return null
    const change = ((current - previous) / Math.abs(previous)) * 100
    return change >= 0 ? `+${change.toFixed(1)}%` : `${change.toFixed(1)}%`
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <CardTitle className="flex flex-col sm:flex-row sm:items-center gap-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">📊</span>
              <span className="text-lg sm:text-xl">Complete Financials - {ticker}</span>
            </div>
            {companyFacts && (
              <span className="text-xs sm:text-sm font-normal text-muted-foreground">
                {companyFacts.sector} | {companyFacts.industry}
              </span>
            )}
            <DynamicSourceBadge source={source} />
          </CardTitle>
          <button
            onClick={exportToCSV}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            <span>📥</span> Export CSV
          </button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Company Info Bar */}
        {companyFacts && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mb-6 p-3 sm:p-4 bg-secondary/30 rounded-lg">
            <div className="text-center">
              <p className="text-muted-foreground text-xs">Exchange</p>
              <p className="font-bold text-sm">{companyFacts.exchange}</p>
            </div>
            <div className="text-center">
              <p className="text-muted-foreground text-xs">Employees</p>
              <p className="font-bold text-sm">{companyFacts.number_of_employees?.toLocaleString()}</p>
            </div>
            <div className="text-center">
              <p className="text-muted-foreground text-xs">Listed</p>
              <p className="font-bold text-sm">{companyFacts.listing_date}</p>
            </div>
            <div className="text-center">
              <p className="text-muted-foreground text-xs">Location</p>
              <p className="font-bold text-xs">{companyFacts.location}</p>
            </div>
            <div className="text-center">
              <p className="text-muted-foreground text-xs">SIC Industry</p>
              <p className="font-bold text-xs">{companyFacts.sic_industry}</p>
            </div>
            <div className="text-center">
              <p className="text-muted-foreground text-xs">Website</p>
              <a href={companyFacts.website_url} target="_blank" rel="noopener noreferrer" className="font-bold text-emerald-500 text-xs hover:underline">
                {companyFacts.website_url?.replace('https://', '').replace('www.', '')}
              </a>
            </div>
          </div>
        )}

        {/* Statement Type Tabs */}
        <div className="flex flex-wrap gap-2 mb-4">
          {[
            { key: 'income', label: 'Income Statement' },
            { key: 'balance', label: 'Balance Sheet' },
            { key: 'cashflow', label: 'Cash Flow' },
            { key: 'metrics', label: 'All Metrics' },
            { key: 'segments', label: 'Segments' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveStatement(tab.key as StatementType)}
              className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                activeStatement === tab.key
                  ? 'bg-emerald-600 text-white'
                  : 'bg-secondary hover:bg-secondary/80'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Period Toggle & Source Selector */}
        {activeStatement !== 'segments' && activeStatement !== 'metrics' && (
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex gap-2">
              <button
                onClick={() => setPeriod('annual')}
                className={`px-3 py-1 rounded text-xs sm:text-sm ${period === 'annual' ? 'bg-secondary' : 'bg-secondary/50'}`}
              >
                Annual
              </button>
              <button
                onClick={() => setPeriod('quarterly')}
                className={`px-3 py-1 rounded text-xs sm:text-sm ${period === 'quarterly' ? 'bg-secondary' : 'bg-secondary/50'}`}
              >
                Quarterly
              </button>
            </div>

            {/* Data Source Selector */}
            {onSourceChange && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Source:</span>
                <select
                  value={sourceOverride}
                  onChange={(e) => onSourceChange(e.target.value as SourceOverride)}
                  className="px-2 py-1 rounded text-xs sm:text-sm bg-secondary border border-border focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="auto">Auto (Cascade)</option>
                  <option value="financialdatasets">Financial Datasets</option>
                  <option value="eodhd">EODHD</option>
                </select>
              </div>
            )}
          </div>
        )}

        {/* Segments View */}
        {activeStatement === 'segments' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Product Segments */}
            {productSegments.length > 0 && (
              <div>
                <p className="text-sm text-muted-foreground mb-3">Revenue by Product/Service</p>
                <div className="h-64 sm:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={productSegments}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="revenue"
                        nameKey="name"
                        label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                      >
                        {productSegments.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                        formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2 mt-4">
                  {productSegments.map((seg, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-secondary/30 rounded">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                        <span className="text-xs sm:text-sm">{seg.name}</span>
                      </div>
                      <span className="font-bold text-xs sm:text-sm">{formatCurrency(seg.revenue)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Geographic Segments */}
            {geoSegments.length > 0 && (
              <div>
                <p className="text-sm text-muted-foreground mb-3">Revenue by Geography</p>
                <div className="h-64 sm:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={geoSegments} layout="vertical">
                      <XAxis type="number" tickFormatter={(v) => formatCurrency(v)} stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 10 }} />
                      <YAxis type="category" dataKey="name" stroke="hsl(var(--muted-foreground))" width={80} tick={{ fontSize: 10 }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                        formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                      />
                      <Bar dataKey="revenue" fill="#6366f1" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2 mt-4">
                  {geoSegments.map((seg, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-secondary/30 rounded">
                      <span className="text-xs sm:text-sm">{seg.name}</span>
                      <span className="font-bold text-xs sm:text-sm">{formatCurrency(seg.revenue)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {productSegments.length === 0 && geoSegments.length === 0 && (
              <div className="col-span-2 text-center py-12 text-muted-foreground">
                No segment data available for {ticker}
              </div>
            )}
          </div>
        ) : (
          /* Statement Table */
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="min-w-full inline-block align-middle">
              <table className="w-full text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="p-2 sm:p-3 text-left sticky left-0 bg-card min-w-36 sm:min-w-56 z-10">{title}</th>
                    {data?.map((period: any, i: number) => (
                      <th key={i} className="p-2 sm:p-3 text-right min-w-24 sm:min-w-28 whitespace-nowrap">
                        {period.fiscal_period || period.report_period || `Period ${i + 1}`}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row: any, i: number) => {
                    return (
                      <tr key={i} className={`border-b border-border/50 ${row.highlight ? 'bg-secondary/30' : ''}`}>
                        <td className={`p-2 sm:p-3 sticky left-0 bg-card z-10 ${row.highlight ? 'font-bold text-emerald-500' : ''}`}>
                          {row.label}
                        </td>
                        {data?.map((period: any, j: number) => {
                          const value = period[row.key]
                          const prevValue = data[j + 1]?.[row.key]
                          const yoy = j < data.length - 1 && !row.isRatio && !row.isPercent ? getYoYChange(value, prevValue) : null

                          return (
                            <td key={j} className={`p-2 sm:p-3 text-right ${row.highlight ? 'font-bold' : ''}`}>
                              <div>{formatValue(value, row)}</div>
                              {yoy && (
                                <div className={`text-xs ${yoy.startsWith('+') ? 'text-emerald-500' : 'text-red-500'}`}>
                                  {yoy}
                                </div>
                              )}
                            </td>
                          )
                        })}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {(!data || data.length === 0) && activeStatement !== 'segments' && (
          <div className="text-center py-12 text-muted-foreground">
            No {title.toLowerCase()} data available.
          </div>
        )}

        {/* Data Source Note */}
        <div className="mt-6 p-3 bg-secondary/20 rounded text-xs flex flex-col sm:flex-row items-start sm:items-center gap-2 text-muted-foreground">
          <span>Data source:</span>
          <DynamicSourceBadge source={source} />
          <span>
            {period === 'annual' ? 'Annual' : 'Quarterly'} periods shown.
            {data?.length > 0 && ` Showing ${data.length} periods.`}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
