"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { getStockLogo, getSymbolColor } from "@/lib/logoService"

interface StockLogoProps {
  symbol: string
  exchange?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  showFallback?: boolean
}

const sizeClasses = {
  sm: 'w-6 h-6 text-xs',
  md: 'w-8 h-8 text-sm',
  lg: 'w-10 h-10 text-base',
  xl: 'w-14 h-14 text-xl'
}

const imageSizes = {
  sm: 24,
  md: 32,
  lg: 40,
  xl: 56
}

export default function StockLogo({
  symbol,
  exchange = 'US',
  size = 'md',
  className = '',
  showFallback = true
}: StockLogoProps) {
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    setError(false)

    getStockLogo(symbol, exchange)
      .then((url) => {
        setLogoUrl(url)
        setLoading(false)
      })
      .catch(() => {
        setError(true)
        setLoading(false)
      })
  }, [symbol, exchange])

  const symbolColor = getSymbolColor(symbol)
  const sizeClass = sizeClasses[size]
  const imageSize = imageSizes[size]

  // Show fallback with first letter
  if (loading || error || !logoUrl) {
    if (!showFallback) return null

    return (
      <div
        className={`${sizeClass} rounded-lg flex items-center justify-center font-bold ${className}`}
        style={{
          backgroundColor: symbolColor + '15',
          color: symbolColor
        }}
      >
        {symbol.charAt(0)}
      </div>
    )
  }

  return (
    <div
      className={`${sizeClass} rounded-lg flex items-center justify-center overflow-hidden bg-white ${className}`}
    >
      <Image
        src={logoUrl}
        alt={`${symbol} logo`}
        width={imageSize}
        height={imageSize}
        className="object-contain p-0.5"
        onError={() => setError(true)}
        loading="lazy"
      />
    </div>
  )
}
