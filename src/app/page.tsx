"use client"

import { Suspense } from "react"
import DashboardContent from "@/components/DashboardContent"
import { Footer } from "@/components/footer"

function LoadingState() {
  return (
    <div className="flex items-center justify-center h-screen bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading Lician...</p>
      </div>
    </div>
  )
}

export default function Home() {
  return (
    <>
      <Suspense fallback={<LoadingState />}>
        <DashboardContent />
      </Suspense>
      <Footer />
    </>
  )
}
