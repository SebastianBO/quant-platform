"use client"

import { Suspense } from "react"
import DashboardContent from "@/components/DashboardContent"

function LoadingState() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#4ebe96]"></div>
    </div>
  )
}

export default function Dashboard() {
  return (
    <Suspense fallback={<LoadingState />}>
      <DashboardContent />
    </Suspense>
  )
}
