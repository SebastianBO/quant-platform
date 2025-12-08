"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { formatCurrency, formatPercent } from "@/lib/utils"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from "recharts"

interface CompanyMetrics {
  ticker: string
  name: string
  marketCap: number
  pe: number
  roic: number
  revenueGrowth: number
  grossMargin: number
  operatingMargin: number
  netMargin: number
  debtToEquity: number
  currentRatio: number
  freeCashFlowYield: number
}

// Tech peers sample data
const TECH_PEERS: CompanyMetrics[] = [
  { ticker: "AAPL", name: "Apple", marketCap: 4.13e12, pe: 33.8, roic: 0.513, revenueGrowth: 0.064, grossMargin: 0.469, operatingMargin: 0.319, netMargin: 0.269, debtToEquity: 3.87, currentRatio: 0.89, freeCashFlowYield: 0.026 },
  { ticker: "MSFT", name: "Microsoft", marketCap: 3.31e12, pe: 36.2, roic: 0.35, revenueGrowth: 0.15, grossMargin: 0.70, operatingMargin: 0.45, netMargin: 0.36, debtToEquity: 0.32, currentRatio: 1.27, freeCashFlowYield: 0.028 },
  { ticker: "GOOG", name: "Alphabet", marketCap: 2.40e12, pe: 24.5, roic: 0.28, revenueGrowth: 0.14, grossMargin: 0.58, operatingMargin: 0.30, netMargin: 0.26, debtToEquity: 0.10, currentRatio: 2.10, freeCashFlowYield: 0.038 },
  { ticker: "META", name: "Meta", marketCap: 1.58e12, pe: 28.9, roic: 0.32, revenueGrowth: 0.22, grossMargin: 0.81, operatingMargin: 0.38, netMargin: 0.34, debtToEquity: 0.15, currentRatio: 2.68, freeCashFlowYield: 0.031 },
  { ticker: "AMZN", name: "Amazon", marketCap: 2.35e12, pe: 45.2, roic: 0.15, revenueGrowth: 0.12, grossMargin: 0.48, operatingMargin: 0.09, netMargin: 0.07, debtToEquity: 0.58, currentRatio: 1.05, freeCashFlowYield: 0.018 },
]

interface PeerComparisonProps {
  selectedTicker?: string
}

export default function PeerComparison({ selectedTicker = "AAPL" }: PeerComparisonProps) {
  const [peers, setPeers] = useState<CompanyMetrics[]>(TECH_PEERS)
  const [highlightTicker, setHighlightTicker] = useState(selectedTicker)

  // Normalize data for radar chart (0-100 scale)
  const normalizeValue = (value: number, max: number, min: number = 0) => {
    return ((value - min) / (max - min)) * 100
  }

  const radarData = peers.map(company => ({
    ticker: company.ticker,
    ROIC: normalizeValue(company.roic, 0.6),
    "Gross Margin": normalizeValue(company.grossMargin, 1),
    "Revenue Growth": normalizeValue(company.revenueGrowth, 0.3),
    "FCF Yield": normalizeValue(company.freeCashFlowYield, 0.05),
    "Operating Margin": normalizeValue(company.operatingMargin, 0.5),
  }))

  // Find selected company
  const selectedCompany = peers.find(p => p.ticker === highlightTicker) || peers[0]

  // Calculate rankings
  const rankings = {
    roic: [...peers].sort((a, b) => b.roic - a.roic),
    pe: [...peers].sort((a, b) => a.pe - b.pe),
    growth: [...peers].sort((a, b) => b.revenueGrowth - a.revenueGrowth),
    margin: [...peers].sort((a, b) => b.grossMargin - a.grossMargin),
    fcf: [...peers].sort((a, b) => b.freeCashFlowYield - a.freeCashFlowYield),
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">📊</span>
          Peer Comparison
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Company Selector */}
        <div className="flex items-center gap-4 mb-6">
          <span className="text-zinc-400">Compare:</span>
          <div className="flex gap-2">
            {peers.map(company => (
              <button
                key={company.ticker}
                onClick={() => setHighlightTicker(company.ticker)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  highlightTicker === company.ticker
                    ? 'bg-emerald-600 text-white'
                    : 'bg-zinc-800 hover:bg-zinc-700'
                }`}
              >
                {company.ticker}
              </button>
            ))}
          </div>
        </div>

        {/* Key Metrics Comparison */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <MetricRank
            title="ROIC"
            value={formatPercent(selectedCompany.roic)}
            rank={rankings.roic.findIndex(c => c.ticker === highlightTicker) + 1}
            total={peers.length}
            isGood={rankings.roic.findIndex(c => c.ticker === highlightTicker) < 2}
          />
          <MetricRank
            title="P/E Ratio"
            value={selectedCompany.pe.toFixed(1)}
            rank={rankings.pe.findIndex(c => c.ticker === highlightTicker) + 1}
            total={peers.length}
            isGood={rankings.pe.findIndex(c => c.ticker === highlightTicker) < 2}
          />
          <MetricRank
            title="Revenue Growth"
            value={formatPercent(selectedCompany.revenueGrowth)}
            rank={rankings.growth.findIndex(c => c.ticker === highlightTicker) + 1}
            total={peers.length}
            isGood={rankings.growth.findIndex(c => c.ticker === highlightTicker) < 2}
          />
          <MetricRank
            title="Gross Margin"
            value={formatPercent(selectedCompany.grossMargin)}
            rank={rankings.margin.findIndex(c => c.ticker === highlightTicker) + 1}
            total={peers.length}
            isGood={rankings.margin.findIndex(c => c.ticker === highlightTicker) < 2}
          />
          <MetricRank
            title="FCF Yield"
            value={formatPercent(selectedCompany.freeCashFlowYield)}
            rank={rankings.fcf.findIndex(c => c.ticker === highlightTicker) + 1}
            total={peers.length}
            isGood={rankings.fcf.findIndex(c => c.ticker === highlightTicker) < 2}
          />
        </div>

        {/* Radar Chart */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <p className="text-sm text-zinc-400 mb-2">Quality Metrics Radar</p>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={[radarData.find(d => d.ticker === highlightTicker)!]}>
                  <PolarGrid stroke="#3f3f46" />
                  <PolarAngleAxis dataKey="name" tick={false} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
                  <Radar
                    name={highlightTicker}
                    dataKey="ROIC"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.3}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ROIC Comparison Bar Chart */}
          <div>
            <p className="text-sm text-zinc-400 mb-2">ROIC Comparison</p>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={peers} layout="vertical">
                  <XAxis type="number" tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} stroke="#71717a" />
                  <YAxis type="category" dataKey="ticker" stroke="#71717a" width={50} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a' }}
                    formatter={(value: number) => [`${(value * 100).toFixed(1)}%`, 'ROIC']}
                  />
                  <Bar
                    dataKey="roic"
                    fill="#10b981"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Full Comparison Table */}
        <div className="overflow-x-auto">
          <p className="text-sm text-zinc-400 mb-2">Full Metrics Comparison</p>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-700">
                <th className="p-3 text-left">Company</th>
                <th className="p-3 text-right">Market Cap</th>
                <th className="p-3 text-right">P/E</th>
                <th className="p-3 text-right">ROIC</th>
                <th className="p-3 text-right">Rev Growth</th>
                <th className="p-3 text-right">Gross Margin</th>
                <th className="p-3 text-right">Op Margin</th>
                <th className="p-3 text-right">Net Margin</th>
                <th className="p-3 text-right">D/E</th>
                <th className="p-3 text-right">FCF Yield</th>
              </tr>
            </thead>
            <tbody>
              {peers.map((company) => (
                <tr
                  key={company.ticker}
                  className={`border-b border-zinc-800 ${company.ticker === highlightTicker ? 'bg-emerald-900/20' : 'hover:bg-zinc-800/30'}`}
                >
                  <td className="p-3">
                    <span className={`font-bold ${company.ticker === highlightTicker ? 'text-emerald-400' : ''}`}>
                      {company.ticker}
                    </span>
                    <span className="text-zinc-500 ml-2">{company.name}</span>
                  </td>
                  <td className="p-3 text-right">{formatCurrency(company.marketCap)}</td>
                  <td className="p-3 text-right">{company.pe.toFixed(1)}</td>
                  <td className="p-3 text-right">
                    <span className={company.roic >= 0.20 ? 'text-emerald-400' : company.roic >= 0.15 ? 'text-yellow-400' : ''}>
                      {formatPercent(company.roic)}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <span className={company.revenueGrowth >= 0.15 ? 'text-emerald-400' : ''}>
                      {formatPercent(company.revenueGrowth)}
                    </span>
                  </td>
                  <td className="p-3 text-right">{formatPercent(company.grossMargin)}</td>
                  <td className="p-3 text-right">{formatPercent(company.operatingMargin)}</td>
                  <td className="p-3 text-right">{formatPercent(company.netMargin)}</td>
                  <td className="p-3 text-right">
                    <span className={company.debtToEquity > 2 ? 'text-red-400' : ''}>
                      {company.debtToEquity.toFixed(2)}
                    </span>
                  </td>
                  <td className="p-3 text-right">{formatPercent(company.freeCashFlowYield)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Industry Averages */}
        <div className="mt-6 p-4 bg-zinc-800/30 rounded-lg">
          <p className="font-medium mb-2">Industry Averages (Tech Sector)</p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
            <div>
              <span className="text-zinc-400">Avg P/E:</span>
              <span className="ml-2 font-bold">{(peers.reduce((a, b) => a + b.pe, 0) / peers.length).toFixed(1)}</span>
            </div>
            <div>
              <span className="text-zinc-400">Avg ROIC:</span>
              <span className="ml-2 font-bold">{formatPercent(peers.reduce((a, b) => a + b.roic, 0) / peers.length)}</span>
            </div>
            <div>
              <span className="text-zinc-400">Avg Growth:</span>
              <span className="ml-2 font-bold">{formatPercent(peers.reduce((a, b) => a + b.revenueGrowth, 0) / peers.length)}</span>
            </div>
            <div>
              <span className="text-zinc-400">Avg Gross Margin:</span>
              <span className="ml-2 font-bold">{formatPercent(peers.reduce((a, b) => a + b.grossMargin, 0) / peers.length)}</span>
            </div>
            <div>
              <span className="text-zinc-400">Avg FCF Yield:</span>
              <span className="ml-2 font-bold">{formatPercent(peers.reduce((a, b) => a + b.freeCashFlowYield, 0) / peers.length)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function MetricRank({ title, value, rank, total, isGood }: { title: string, value: string, rank: number, total: number, isGood: boolean }) {
  return (
    <div className="bg-zinc-800/50 p-4 rounded-lg text-center">
      <p className="text-zinc-400 text-sm">{title}</p>
      <p className="text-xl font-bold">{value}</p>
      <p className={`text-sm ${isGood ? 'text-emerald-400' : 'text-zinc-500'}`}>
        #{rank} of {total}
      </p>
    </div>
  )
}
