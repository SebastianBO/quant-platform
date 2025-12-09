"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart3, LineChart } from "lucide-react"
import InteractiveStockChart from "./InteractiveStockChart"
import TradingViewChart from "./TradingViewChart"

interface StockChartSwitcherProps {
  ticker: string
  theme?: "light" | "dark"
}

export default function StockChartSwitcher({ ticker, theme = "dark" }: StockChartSwitcherProps) {
  const [chartType, setChartType] = useState<"custom" | "tradingview">("custom")
  const [mounted, setMounted] = useState(false)

  // Detect system theme
  useEffect(() => {
    setMounted(true)
  }, [])

  // Get actual theme
  const actualTheme = mounted
    ? document.documentElement.classList.contains("dark")
      ? "dark"
      : "light"
    : theme

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Price Chart</CardTitle>
          <div className="flex items-center gap-1">
            <Button
              variant={chartType === "custom" ? "default" : "ghost"}
              size="sm"
              onClick={() => setChartType("custom")}
              className="h-8"
            >
              <LineChart className="w-4 h-4 mr-1" />
              Simple
            </Button>
            <Button
              variant={chartType === "tradingview" ? "default" : "ghost"}
              size="sm"
              onClick={() => setChartType("tradingview")}
              className="h-8"
            >
              <BarChart3 className="w-4 h-4 mr-1" />
              Advanced
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {chartType === "custom" ? (
          <div className="p-4">
            <InteractiveStockChart ticker={ticker} />
          </div>
        ) : (
          <TradingViewChart
            ticker={ticker}
            theme={actualTheme}
            height={500}
            showToolbar={true}
          />
        )}
      </CardContent>
    </Card>
  )
}
