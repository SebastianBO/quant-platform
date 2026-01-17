'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

// Utility for conditional classes (UI Skills: must use cn utility)
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}

// Giga.ai inspired design with glassmorphism, gradients, and smooth animations
// Fixed per Web Interface Guidelines, UI Skills, and RAMS review
export default function GigaStyleDemo() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const insights = [
    {
      title: 'AI-Powered Stock Analysis',
      description: 'Neural networks analyzing 50,000+ securities in real-time',
      metric: '99.2%',
      metricLabel: 'Accuracy',
      gradient: 'from-cyan-500/20 to-blue-600/20',
    },
    {
      title: 'Market Predictions',
      description: 'Advanced algorithms forecasting price movements',
      metric: '847K',
      metricLabel: 'Daily Predictions',
      gradient: 'from-cyan-400/20 to-blue-500/20',
    },
    {
      title: 'Portfolio Optimization',
      description: 'Machine learning for risk-adjusted returns',
      metric: '+23.4%',
      metricLabel: 'Avg. Alpha',
      gradient: 'from-cyan-500/20 to-teal-600/20',
    },
  ]

  const features = [
    { icon: '⚡', label: 'Real-time Data' },
    { icon: '🧠', label: 'AI Analysis' },
    { icon: '📊', label: 'Deep Insights' },
    { icon: '🔒', label: 'Bank-level Security' },
  ]

  return (
    // Fixed: min-h-dvh instead of min-h-screen (RAMS, Web Guidelines)
    <div className="min-h-dvh bg-[#070b0a] text-white overflow-hidden relative">
      {/* Animated gradient background */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(6, 182, 212, 0.06), transparent 40%)`,
        }}
      />

      {/* Grid pattern overlay */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        }}
      />

      {/* Gradient orbs - Fixed: motion-safe for reduced motion (RAMS, Web Guidelines) */}
      {/* Fixed: Reduced blur from 120px to 80px for performance (UI Skills) */}
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[80px] motion-safe:animate-pulse" />
      <div
        className="fixed bottom-0 right-1/4 w-[400px] h-[400px] bg-cyan-400/10 rounded-full blur-[60px] motion-safe:animate-pulse"
        style={{ animationDelay: '1s' }}
      />

      {/* Navigation */}
      {/* Fixed: Specific transition properties instead of transition-all (Web Guidelines) */}
      <nav className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-transform transition-opacity duration-700",
        isLoaded ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
      )}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          {/* Fixed: Reduced backdrop-blur for performance (UI Skills) */}
          <div className="flex items-center justify-between backdrop-blur-lg bg-white/[0.03] border border-white/[0.08] rounded-2xl px-6 py-3">
            <Link href="/" className="text-xl font-semibold tracking-tight">
              <span className="bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">lician</span>
              <span className="text-cyan-400">.</span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              {/* Fixed: Using buttons instead of href="#" links (RAMS, Web Guidelines) */}
              {['Products', 'Insights', 'Pricing', 'About'].map((item) => (
                <button
                  key={item}
                  className="text-sm text-white/60 hover:text-white transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#070b0a] rounded-sm"
                >
                  {item}
                </button>
              ))}
            </div>
            {/* Fixed: Added focus-visible ring (RAMS, Web Guidelines) */}
            <button className="px-4 py-2 bg-white text-black text-sm font-medium rounded-full hover:bg-white/90 transition-colors duration-200 hover:scale-105 motion-safe:transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#070b0a]">
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Fixed: Using cn() utility (UI Skills) */}
          <div className={cn(
            "transition-transform transition-opacity duration-1000 delay-200",
            isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          )}>
            {/* Badge - Fixed: motion-safe (Web Guidelines) */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.05] border border-white/[0.1] mb-8">
              <span className="size-2 rounded-full bg-emerald-400 motion-safe:animate-pulse" aria-hidden="true" />
              <span className="text-sm text-white/70">Now with Gemini 2.5 Pro</span>
            </div>

            {/* Main headline - Fixed: text-balance (UI Skills, RAMS) */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-semibold tracking-tight leading-[0.95] mb-6 text-balance">
              <span className="block bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent">
                Financial Intelligence
              </span>
              <span className="block bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Reimagined
              </span>
            </h1>

            {/* Subtitle - Fixed: text-pretty (UI Skills, RAMS) */}
            <p className="text-lg md:text-xl text-white/50 max-w-2xl mb-12 leading-relaxed text-pretty">
              Experience the future of investment analysis. AI-powered insights,
              real-time data, and institutional-grade tools—all in one platform.
            </p>

            {/* CTA buttons - Fixed: focus-visible, specific transitions (Web Guidelines, RAMS) */}
            <div className="flex flex-wrap gap-4 mb-16">
              <button className="group px-8 py-4 bg-white text-black font-medium rounded-full hover:bg-white/90 transition-colors duration-200 motion-safe:hover:scale-105 motion-safe:transition-transform flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#070b0a]">
                Start Free Trial
                {/* Fixed: aria-hidden on decorative icon (RAMS) */}
                <svg className="size-4 motion-safe:group-hover:translate-x-1 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
              <button className="px-8 py-4 border border-white/20 text-white font-medium rounded-full hover:bg-white/5 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#070b0a]">
                Watch Demo
              </button>
            </div>

            {/* Feature pills - Fixed: size-* for square elements (UI Skills) */}
            <div className="flex flex-wrap gap-3">
              {features.map((feature, i) => (
                <div
                  key={feature.label}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.08] transition-colors duration-200 hover:bg-white/[0.06] hover:border-white/[0.15]"
                  style={{ transitionDelay: `${i * 100}ms` }}
                >
                  <span aria-hidden="true">{feature.icon}</span>
                  <span className="text-sm text-white/70">{feature.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Insights Cards Section */}
      <section className="relative py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className={cn(
            "mb-12 transition-transform transition-opacity duration-1000 delay-500",
            isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          )}>
            {/* Fixed: text-balance on heading (UI Skills, RAMS) */}
            <h2 className="text-3xl md:text-4xl font-semibold mb-4 text-balance">
              <span className="bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                Powered by Intelligence
              </span>
            </h2>
            {/* Fixed: text-pretty on body (UI Skills) */}
            <p className="text-white/50 max-w-xl text-pretty">
              Our AI analyzes millions of data points to deliver actionable insights.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {insights.map((insight, i) => (
              <div
                key={insight.title}
                className={cn(
                  "group relative overflow-hidden rounded-3xl transition-transform duration-500 motion-safe:hover:scale-[1.02]",
                  isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
                )}
                style={{ transitionDelay: `${600 + i * 150}ms` }}
              >
                {/* Card background with glassmorphism - Fixed: reduced blur (UI Skills) */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-lg" />
                <div className={cn(
                  "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500",
                  insight.gradient
                )} />
                <div className="absolute inset-0 border border-white/[0.1] rounded-3xl group-hover:border-white/[0.2] transition-colors duration-500" />

                {/* Shine effect on hover - Fixed: motion-safe (Web Guidelines) */}
                <div className="absolute inset-0 opacity-0 motion-safe:group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.05] to-transparent -translate-x-full motion-safe:group-hover:translate-x-full transition-transform duration-1000" />
                </div>

                {/* Card content */}
                <div className="relative p-8">
                  <div className="mb-8">
                    {/* Fixed: tabular-nums for metrics (Web Guidelines, RAMS) */}
                    <span className="text-5xl font-semibold bg-gradient-to-br from-white to-white/60 bg-clip-text text-transparent tabular-nums">
                      {insight.metric}
                    </span>
                    <p className="text-sm text-white/40 mt-1">{insight.metricLabel}</p>
                  </div>
                  <h3 className="text-xl font-medium mb-2 text-white/90">{insight.title}</h3>
                  <p className="text-white/50 text-sm leading-relaxed text-pretty">{insight.description}</p>

                  {/* Arrow indicator - Fixed: aria-hidden (RAMS) */}
                  <div className="mt-6 flex items-center gap-2 text-cyan-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <span>Learn more</span>
                    <svg className="size-4 motion-safe:group-hover:translate-x-1 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className={cn(
            "relative overflow-hidden rounded-3xl transition-transform transition-opacity duration-1000 delay-700",
            isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          )}>
            {/* Background - Fixed: reduced blur (UI Skills) */}
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-cyan-400/10" />
            <div className="absolute inset-0 backdrop-blur-2xl bg-white/[0.02]" />
            <div className="absolute inset-0 border border-white/[0.1] rounded-3xl" />

            {/* Content */}
            <div className="relative grid md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-white/[0.1]">
              {[
                { value: '50K+', label: 'Securities Tracked' },
                { value: '$2.4B', label: 'Assets Analyzed' },
                { value: '150+', label: 'Countries' },
                { value: '99.9%', label: 'Uptime' },
              ].map((stat) => (
                <div key={stat.label} className="p-8 md:p-12 text-center">
                  {/* Fixed: tabular-nums for stat values (Web Guidelines, RAMS) */}
                  <div className="text-4xl md:text-5xl font-semibold bg-gradient-to-br from-white to-white/60 bg-clip-text text-transparent mb-2 tabular-nums">
                    {stat.value}
                  </div>
                  <div className="text-white/50 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className={cn(
            "transition-transform transition-opacity duration-1000 delay-900",
            isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          )}>
            {/* Fixed: text-balance on heading (UI Skills, RAMS) */}
            <h2 className="text-4xl md:text-5xl font-semibold mb-6 text-balance">
              <span className="bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent">
                Ready to transform your
              </span>
              <br />
              <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                investment strategy?
              </span>
            </h2>
            {/* Fixed: text-pretty (UI Skills) */}
            <p className="text-white/50 mb-10 max-w-xl mx-auto text-pretty">
              Join thousands of investors using AI to make smarter decisions.
            </p>
            {/* Fixed: focus-visible, standard shadow instead of glow (UI Skills, Web Guidelines) */}
            <button className="px-10 py-5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium rounded-full hover:from-cyan-400 hover:to-blue-500 transition-colors duration-200 motion-safe:hover:scale-105 motion-safe:transition-transform shadow-lg hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#070b0a]">
              Get Started for Free
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-12 px-6 border-t border-white/[0.05]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-white/40 text-sm">
            © 2026 Lician. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            {/* Fixed: Using buttons instead of href="#" links (RAMS, Web Guidelines) */}
            {['Privacy', 'Terms', 'Contact'].map((item) => (
              <button
                key={item}
                className="text-white/40 hover:text-white/70 text-sm transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-sm"
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}
