"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import SEOSidebar from "@/components/SEOSidebar"

interface PageLayoutProps {
  children: React.ReactNode
  showFooter?: boolean
  showSidebar?: boolean
  maxWidth?: "4xl" | "5xl" | "6xl" | "7xl"
}

export function PageLayout({
  children,
  showFooter = true,
  showSidebar = true,
  maxWidth = "7xl"
}: PageLayoutProps) {
  const maxWidthClass = {
    "4xl": "max-w-4xl",
    "5xl": "max-w-5xl",
    "6xl": "max-w-6xl",
    "7xl": "max-w-7xl",
  }[maxWidth]

  return (
    <div className="min-h-screen bg-background text-white">
      <Header />
      <div className="pt-20">
        <div className={`${maxWidthClass} mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8`}>
          <div className="flex flex-col lg:flex-row gap-0 lg:gap-8">
            {showSidebar && <SEOSidebar />}
            <main className="flex-1 min-w-0 w-full">
              {children}
            </main>
          </div>
        </div>
      </div>
      {showFooter && <Footer />}
    </div>
  )
}
