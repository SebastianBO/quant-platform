"use client"

import { useEffect, useRef, memo } from "react"

interface TradingViewChartProps {
  ticker: string
  theme?: "light" | "dark"
  height?: number
  showToolbar?: boolean
  interval?: string // "D" = daily, "W" = weekly, "M" = monthly, "1" = 1min, "5" = 5min, etc.
}

function TradingViewChart({
  ticker,
  theme = "dark",
  height = 400,
  showToolbar = true,
  interval = "D"
}: TradingViewChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Clear previous widget
    containerRef.current.innerHTML = ""

    // Create script element for TradingView widget
    const script = document.createElement("script")
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js"
    script.type = "text/javascript"
    script.async = true
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: `${ticker}`,
      interval: interval,
      timezone: "America/New_York",
      theme: theme,
      style: "1", // Candles
      locale: "en",
      enable_publishing: false,
      backgroundColor: theme === "dark" ? "rgba(0, 0, 0, 0)" : "rgba(255, 255, 255, 0)",
      gridColor: theme === "dark" ? "rgba(255, 255, 255, 0.06)" : "rgba(0, 0, 0, 0.06)",
      hide_top_toolbar: !showToolbar,
      hide_legend: false,
      save_image: false,
      calendar: false,
      hide_volume: false,
      support_host: "https://www.tradingview.com",
      container_id: `tradingview_${ticker}`,
      studies: [
        "Volume@tv-basicstudies",
        "MASimple@tv-basicstudies"
      ],
      show_popup_button: true,
      popup_width: "1000",
      popup_height: "650",
      withdateranges: true,
      allow_symbol_change: false,
      details: true,
      hotlist: false
    })

    // Create container div
    const widgetContainer = document.createElement("div")
    widgetContainer.className = "tradingview-widget-container"
    widgetContainer.style.height = "100%"
    widgetContainer.style.width = "100%"

    const widgetDiv = document.createElement("div")
    widgetDiv.id = `tradingview_${ticker}`
    widgetDiv.style.height = "100%"
    widgetDiv.style.width = "100%"

    widgetContainer.appendChild(widgetDiv)
    widgetContainer.appendChild(script)
    containerRef.current.appendChild(widgetContainer)

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = ""
      }
    }
  }, [ticker, theme, interval, showToolbar])

  return (
    <div
      ref={containerRef}
      style={{ height: `${height}px`, width: "100%" }}
      className="rounded-lg overflow-hidden"
    />
  )
}

export default memo(TradingViewChart)
