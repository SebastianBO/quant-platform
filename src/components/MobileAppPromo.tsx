"use client"

import { useState } from 'react'
import { X, Smartphone, Apple, Play } from 'lucide-react'
import Image from 'next/image'

// App Store links
const APP_LINKS = {
  ios: 'https://apps.apple.com/app/lician/id6748368400',
  android: 'https://play.google.com/store/apps/details?id=com.lician',
}

interface MobileAppPromoProps {
  variant?: 'banner' | 'card' | 'footer' | 'popup'
  onClose?: () => void
}

export default function MobileAppPromo({ variant = 'card', onClose }: MobileAppPromoProps) {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  const handleDismiss = () => {
    setDismissed(true)
    onClose?.()
    // Remember dismissal for 7 days
    if (typeof window !== 'undefined') {
      localStorage.setItem('app-promo-dismissed', Date.now().toString())
    }
  }

  // Check if dismissed recently
  if (typeof window !== 'undefined') {
    const dismissedAt = localStorage.getItem('app-promo-dismissed')
    if (dismissedAt) {
      const daysSinceDismissed = (Date.now() - parseInt(dismissedAt)) / (1000 * 60 * 60 * 24)
      if (daysSinceDismissed < 7) return null
    }
  }

  // Popup variant - modal style
  if (variant === 'popup') {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-[#1a1a1a] border border-white/[0.08] rounded-2xl max-w-sm w-full overflow-hidden shadow-2xl">
          {/* App Preview Image */}
          <div className="relative h-48 bg-gradient-to-br from-[#4ebe96]/20 via-[#4ebe96]/10 to-[#479ffa]/10">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 bg-[#4ebe96] rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-4xl font-bold text-black">L</span>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="absolute top-3 right-3 p-1.5 rounded-full bg-black/50 hover:bg-black/70 transition-colors duration-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-6">
            <h3 className="text-xl font-bold mb-2">Get Lician on Mobile</h3>
            <p className="text-sm text-[#868f97] mb-6">
              Track your portfolio, get real-time alerts, and access AI insights on the go.
            </p>

            <div className="flex gap-3">
              <a
                href={APP_LINKS.ios}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white text-black rounded-xl font-medium hover:bg-gray-100 transition-colors duration-100"
              >
                <Apple className="w-5 h-5" />
                <span>App Store</span>
              </a>
              <a
                href={APP_LINKS.android}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white/10 border border-white/20 rounded-xl font-medium hover:bg-white/20 transition-colors duration-100"
              >
                <Play className="w-5 h-5" />
                <span>Google Play</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Banner variant - thin horizontal bar
  if (variant === 'banner') {
    return (
      <div className="bg-gradient-to-r from-[#4ebe96]/20 to-[#4ebe96]/10 border-b border-[#4ebe96]/20">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Smartphone className="w-4 h-4 text-[#4ebe96]" />
            <span className="text-sm">
              <span className="font-medium">Lician is on mobile!</span>
              <span className="text-[#868f97] ml-2 hidden sm:inline">
                Track your portfolio anywhere.
              </span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={APP_LINKS.ios}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-medium transition-colors duration-100"
            >
              <Apple className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">iOS</span>
            </a>
            <a
              href={APP_LINKS.android}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-medium transition-colors duration-100"
            >
              <Play className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Android</span>
            </a>
            <button
              onClick={handleDismiss}
              className="p-1 hover:bg-white/10 rounded transition-colors duration-100 ml-1"
            >
              <X className="w-4 h-4 text-[#868f97]" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Footer variant - compact inline for footer
  if (variant === 'footer') {
    return (
      <div className="flex items-center gap-4">
        <span className="text-sm text-[#868f97]">Get the app:</span>
        <a
          href={APP_LINKS.ios}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-sm hover:text-[#4ebe96] transition-colors duration-100"
        >
          <Apple className="w-4 h-4" />
          <span>iOS</span>
        </a>
        <a
          href={APP_LINKS.android}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-sm hover:text-[#4ebe96] transition-colors duration-100"
        >
          <Play className="w-4 h-4" />
          <span>Android</span>
        </a>
      </div>
    )
  }

  // Card variant (default) - sidebar style
  return (
    <div className="bg-[#1a1a1a] border border-white/[0.08] rounded-xl p-4 relative">
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 p-1 hover:bg-white/[0.08] rounded transition-colors duration-100"
      >
        <X className="w-4 h-4 text-[#868f97]" />
      </button>

      <div className="flex items-start gap-3">
        <div className="w-12 h-12 bg-[#4ebe96] rounded-xl flex items-center justify-center flex-shrink-0">
          <span className="text-xl font-bold text-black">L</span>
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm">Lician Mobile</h4>
          <p className="text-xs text-[#868f97] mt-0.5">
            Portfolio tracking on the go
          </p>
        </div>
      </div>

      <div className="flex gap-2 mt-3">
        <a
          href={APP_LINKS.ios}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-white/[0.05] hover:bg-white/[0.08] rounded-lg text-xs font-medium transition-colors duration-100"
        >
          <Apple className="w-3.5 h-3.5" />
          <span>App Store</span>
        </a>
        <a
          href={APP_LINKS.android}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-white/[0.05] hover:bg-white/[0.08] rounded-lg text-xs font-medium transition-colors duration-100"
        >
          <Play className="w-3.5 h-3.5" />
          <span>Play Store</span>
        </a>
      </div>
    </div>
  )
}

// Hook to show popup after delay
export function useMobileAppPopup(delayMs = 30000) {
  const [showPopup, setShowPopup] = useState(false)

  if (typeof window !== 'undefined') {
    // Check if user is on mobile (don't show popup if already on mobile)
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
    if (isMobile) return { showPopup: false, setShowPopup: () => {} }

    // Check if already dismissed
    const dismissedAt = localStorage.getItem('app-promo-dismissed')
    if (dismissedAt) {
      const daysSinceDismissed = (Date.now() - parseInt(dismissedAt)) / (1000 * 60 * 60 * 24)
      if (daysSinceDismissed < 7) return { showPopup: false, setShowPopup: () => {} }
    }

    // Show popup after delay
    setTimeout(() => {
      setShowPopup(true)
    }, delayMs)
  }

  return { showPopup, setShowPopup }
}
