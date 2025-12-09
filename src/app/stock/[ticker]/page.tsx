"use client"

import { Suspense } from "react"
import { useParams } from "next/navigation"
import DashboardContent from "@/components/DashboardContent"

function LoadingState() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-green-500"></div>
    </div>
  )
}

function StockPageContent() {
  const params = useParams()
  const ticker = (params.ticker as string)?.toUpperCase()

  return <DashboardContent initialTicker={ticker} initialTab="overview" />
}

export default function StockPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <StockPageContent />
    </Suspense>
  )
}
