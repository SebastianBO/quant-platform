'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}

function useScrollAnimation(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [threshold])

  return { ref, isVisible }
}

export default function FeyStylePage() {
  const [isLoaded, setIsLoaded] = useState(false)
  const highlightsAnim = useScrollAnimation(0.1)
  const stoneAnim = useScrollAnimation(0.1)
  const earningsAnim = useScrollAnimation(0.1)
  const ctaAnim = useScrollAnimation(0.1)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  return (
    <div className="min-h-dvh bg-black text-white font-['Inter',system-ui,sans-serif]">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md">
        <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            {/* Yellow chevron logo like Fey */}
            <div className="size-8 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="size-6 text-[#d4ff00]" fill="currentColor">
                <path d="M15 4L7 12L15 20" strokeWidth="4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              </svg>
            </div>
            <div className="hidden md:flex items-center gap-1 text-[14px] text-[#868f97]">
              {['Features', 'Pricing', 'Updates', 'Students', 'App'].map(item => (
                <button key={item} className="px-3 py-2 hover:text-white transition-colors rounded-lg hover:bg-white/5">
                  {item}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden lg:block text-[13px] text-[#868f97]">Lician has joined Y Combinator</span>
            <button className="px-5 py-2.5 bg-[#e6e6e6] text-black text-[14px] font-medium rounded-full hover:bg-white transition-colors">
              Learn more
            </button>
          </div>
        </div>
      </nav>

      {/* Hero - Dashboard with stacked cards */}
      <section className="pt-20 pb-8">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className={cn(
            "relative mt-4 rounded-2xl overflow-hidden transition-all duration-1000",
            isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}>
            {/* Dashboard Image */}
            <div className="relative aspect-[16/9] bg-[#0a0a0a] rounded-2xl overflow-hidden border border-white/[0.1]">
              <Image
                src="/demo/fey/fey-ui.jpg"
                alt="Dashboard"
                fill
                className="object-cover object-left-top"
                priority
              />

              {/* Stacked notification cards - tight overlap like Fey */}
              <div className="absolute top-4 right-4 md:top-8 md:right-8 w-[300px] md:w-[340px]">
                <div className="relative">
                  {/* Card 3 - Back (Briefing) - only top visible */}
                  <div className={cn(
                    "relative bg-[#1a1a1a] rounded-xl border border-white/[0.1] p-3.5",
                    "shadow-[0_4px_20px_rgba(0,0,0,0.5)]",
                    "transition-all duration-700 delay-300",
                    isLoaded ? "opacity-100" : "opacity-0 translate-y-4"
                  )}>
                    <div className="flex items-center gap-2">
                      <div className="size-5 rounded-full bg-[#479ffa] flex items-center justify-center text-[10px] font-bold text-white">B</div>
                      <span className="text-[13px] font-medium">Briefing</span>
                      <span className="text-[11px] text-[#555] ml-auto">Just now</span>
                    </div>
                    <p className="text-[12px] text-[#777] leading-relaxed mt-2 line-clamp-2">
                      Trump&apos;s tariff push is shaking markets. 2% GDP growth 0.1% as firms rushed imports and pulled guidance. With R&D slowing...
                    </p>
                  </div>

                  {/* Card 2 - Middle (NVIDIA) */}
                  <div className={cn(
                    "relative -mt-12 ml-1 bg-[#1a1a1a] rounded-xl border border-white/[0.1] p-3.5",
                    "shadow-[0_8px_30px_rgba(0,0,0,0.6)]",
                    "transition-all duration-700 delay-150",
                    isLoaded ? "opacity-100" : "opacity-0 translate-y-4"
                  )}>
                    <div className="flex items-center gap-2">
                      <div className="size-5 rounded-full bg-[#76b900] flex items-center justify-center text-[10px] font-bold text-black">N</div>
                      <span className="text-[13px] font-medium">NVIDIA</span>
                      <span className="text-[11px] text-[#4ebe96] ml-auto">$135.00 +2.5%</span>
                    </div>
                    <p className="text-[12px] text-[#777] leading-relaxed mt-2 line-clamp-2">
                      Nvidia partners with Media to advance AI multimodal inferencing cloud infrastructure through foreign collaborations...
                    </p>
                  </div>

                  {/* Card 1 - Front (AI Chat) */}
                  <div className={cn(
                    "relative -mt-10 ml-2 bg-[#1a1a1a] rounded-xl border border-white/[0.12]",
                    "shadow-[0_12px_40px_rgba(0,0,0,0.7)]",
                    "transition-all duration-700",
                    isLoaded ? "opacity-100" : "opacity-0 translate-y-4"
                  )}>
                    <div className="flex items-center gap-2 px-3.5 py-2.5 border-b border-white/[0.08]">
                      <div className="size-2 rounded-full bg-[#4ebe96]" />
                      <span className="text-[12px] font-medium">AI</span>
                    </div>
                    <div className="p-3.5 space-y-2.5">
                      <div className="flex justify-end">
                        <div className="bg-white/[0.08] rounded-lg px-3 py-2">
                          <p className="text-[12px]">What&apos;s happening with NVIDIA stock?</p>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <p className="text-[12px] leading-relaxed">
                          NVIDIA (NVDA) is trading at <span className="text-[#4ebe96]">$892.47</span>, up 3.2% today.
                        </p>
                        <p className="text-[11px] text-[#666] leading-relaxed">
                          Key catalysts include strong datacenter demand and positive AI chip guidance. Analysts maintain bullish outlook with average PT of $950.
                        </p>
                      </div>
                    </div>
                    <div className="p-2.5 border-t border-white/[0.08]">
                      <div className="flex items-center gap-2 bg-white/[0.05] rounded-lg px-3 py-2">
                        <input
                          type="text"
                          placeholder="Ask anything..."
                          className="flex-1 bg-transparent text-[12px] placeholder:text-[#555] outline-none"
                          readOnly
                        />
                        <svg className="size-4 text-[#479ffa]" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Hero text - bottom left */}
          <div className={cn(
            "mt-8 transition-all duration-700 delay-300",
            isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}>
            <span className="text-[#868f97] text-[14px]">Lician</span>
            <h1 className="text-[54px] font-semibold leading-[1.1] tracking-[-0.02em] mt-1">
              Make better investments.
            </h1>
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section ref={highlightsAnim.ref} className="py-20">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className={cn(
            "mb-12 transition-all duration-700",
            highlightsAnim.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}>
            <span className="text-[#ff9966] text-[13px] font-medium tracking-wider uppercase">Highlights</span>
            <p className="text-[#a0a0a0] text-[18px] leading-[1.6] mt-4 max-w-[640px]">
              Lician turns complex data, gated tools, and noisy news into instant
              earnings alerts, clear summaries, and a beautiful interface—so
              anyone can stay informed, without feeling overwhelmed.
            </p>
          </div>

          {/* Cards row with nav arrows */}
          <div className="relative">
            <div className="absolute -top-16 right-0 flex gap-2">
              <button className="size-10 rounded-full border border-white/[0.15] flex items-center justify-center text-[#868f97] hover:text-white hover:border-white/30 transition-colors" aria-label="Previous">
                <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M15 18l-6-6 6-6"/></svg>
              </button>
              <button className="size-10 rounded-full border border-white/[0.15] flex items-center justify-center text-[#868f97] hover:text-white hover:border-white/30 transition-colors" aria-label="Next">
                <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M9 18l6-6-6-6"/></svg>
              </button>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              {/* Card 1 - Stock Pages */}
              <div className={cn(
                "bg-[#0a0a0a] rounded-2xl border border-white/[0.08] overflow-hidden hover:border-white/[0.15] transition-all",
                highlightsAnim.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
              )} style={{ transitionDelay: '100ms', transitionDuration: '700ms' }}>
                <div className="relative aspect-[4/3]">
                  <Image src="/demo/fey/canvas_4x.jpg" alt="Stock pages" fill className="object-cover" />
                </div>
                <div className="p-4 border-t border-white/[0.06]">
                  <h3 className="text-[14px] font-medium">Beautiful Stock and ETF pages</h3>
                </div>
              </div>

              {/* Card 2 - Insider Transactions */}
              <div className={cn(
                "bg-[#0a0a0a] rounded-2xl border border-white/[0.08] overflow-hidden hover:border-white/[0.15] transition-all",
                highlightsAnim.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
              )} style={{ transitionDelay: '200ms', transitionDuration: '700ms' }}>
                <div className="p-4 space-y-2.5">
                  {[
                    { name: 'Jensen Huang', company: 'Nvidia Corporation', action: 'Buy' },
                    { name: 'Timothy Cook', company: 'Apple Inc.', action: 'Sell' },
                    { name: 'Satya Nadella', company: 'Microsoft Corporation', action: 'Sell' },
                    { name: 'Elon Musk', company: 'Tesla Inc.', action: 'Buy' },
                    { name: 'Alex Karp', company: 'Palantir', action: 'Sell' },
                  ].map((insider, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="size-10 rounded-full bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center text-[11px] font-medium">
                        {insider.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium truncate">{insider.name}</p>
                        <p className="text-[11px] text-[#868f97] truncate">{insider.company}</p>
                      </div>
                      <span className={cn(
                        "px-2.5 py-1 text-[10px] font-medium rounded-full",
                        insider.action === 'Buy' ? "bg-emerald-500 text-black" : "bg-red-500/80 text-white"
                      )}>
                        {insider.action}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="p-4 border-t border-white/[0.06]">
                  <h3 className="text-[14px] font-medium">Insider transactions</h3>
                </div>
              </div>

              {/* Card 3 - Graph Comparison */}
              <div className={cn(
                "bg-[#0a0a0a] rounded-2xl border border-white/[0.08] overflow-hidden hover:border-white/[0.15] transition-all",
                highlightsAnim.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
              )} style={{ transitionDelay: '300ms', transitionDuration: '700ms' }}>
                <div className="relative aspect-[4/3]">
                  <Image src="/demo/fey/graph-comparison_4x.jpg" alt="Graph comparison" fill className="object-cover" />
                </div>
                <div className="p-4 border-t border-white/[0.06]">
                  <h3 className="text-[14px] font-medium">Graph comparison</h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* From overwhelming to effortless */}
      <section ref={stoneAnim.ref} className="py-20">
        <div className="max-w-[1400px] mx-auto px-6">
          <h2 className={cn(
            "text-[48px] md:text-[56px] font-semibold italic leading-[1.1] tracking-[-0.02em] mb-16",
            "transition-all duration-700",
            stoneAnim.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}>
            From overwhelming to effortless.
          </h2>

          {/* Stone with floating nav */}
          <div className={cn(
            "relative max-w-[700px] mx-auto",
            "transition-all duration-1000 delay-200",
            stoneAnim.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
          )}>
            <div className="relative aspect-[4/3]">
              <Image src="/demo/fey/fey-stone_4x.jpg" alt="Stone" fill className="object-contain" />

              {/* Floating nav bar */}
              <div className="absolute left-1/2 -translate-x-1/2 bottom-[15%]">
                <div className="flex items-center gap-1 bg-[#1a1a1a]/95 backdrop-blur-xl rounded-full p-1.5 border border-white/[0.08] shadow-2xl">
                  {['home', 'edit', 'calendar', 'bookmark', 'mail', 'scissors', 'settings'].map((icon, i) => (
                    <button
                      key={icon}
                      className={cn(
                        "size-10 flex items-center justify-center rounded-full transition-colors",
                        i === 0 ? "bg-white/10 text-white" : "text-[#868f97] hover:text-white"
                      )}
                      aria-label={icon}
                    >
                      {icon === 'home' && <svg className="size-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3l9 8v10h-6v-6h-6v6H3V11l9-8z"/></svg>}
                      {icon === 'edit' && <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><path d="M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>}
                      {icon === 'calendar' && <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/><text x="12" y="17" textAnchor="middle" fontSize="8" fill="currentColor" stroke="none" fontWeight="600">17</text></svg>}
                      {icon === 'bookmark' && <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2v16z"/></svg>}
                      {icon === 'mail' && <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 6l-10 7L2 6"/></svg>}
                      {icon === 'scissors' && <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M20 4L8.12 15.88M14.47 14.48L20 20M8.12 8.12L12 12"/></svg>}
                      {icon === 'settings' && <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><circle cx="12" cy="12" r="3"/><path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>}
                    </button>
                  ))}
                  <div className="w-px h-6 bg-white/10 mx-1" />
                  <button className="size-10 flex items-center justify-center rounded-full bg-[#2a2a2a] text-white hover:bg-[#333] transition-colors" aria-label="Search">
                    <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Earnings in real time */}
      <section ref={earningsAnim.ref} className="py-24 text-center">
        <div className="max-w-[1400px] mx-auto px-6">
          <button className={cn(
            "text-[#868f97] text-[14px] hover:text-white transition-colors inline-flex items-center gap-1 mb-4",
            earningsAnim.isVisible ? "opacity-100" : "opacity-0"
          )}>
            Learn more <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><path d="M9 5l7 7-7 7"/></svg>
          </button>

          <h2 className={cn(
            "text-[48px] md:text-[56px] font-semibold italic leading-[1.1] tracking-[-0.02em] mb-4",
            "transition-all duration-700",
            earningsAnim.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}>
            <span>Earnings </span>
            <span className="bg-gradient-to-r from-[#ff9966] to-[#cc6633] bg-clip-text text-transparent">in real time.</span>
          </h2>

          <p className={cn(
            "text-[#868f97] text-[16px] max-w-lg mx-auto mb-10",
            "transition-all duration-700 delay-100",
            earningsAnim.isVisible ? "opacity-100" : "opacity-0"
          )}>
            Lician alerts you the second earnings calls start and delivers clear summaries
            in real time. Listen live or catch up instantly, without missing key moments.
          </p>

          {/* Notification + Person */}
          <div className={cn(
            "relative max-w-[500px] mx-auto",
            "transition-all duration-700 delay-200",
            earningsAnim.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}>
            <div className="inline-flex items-center gap-3 px-4 py-3 bg-[#1a1a1a]/90 backdrop-blur-lg rounded-full border border-white/[0.08] mb-6">
              <div className="size-8 bg-[#f48120] rounded-lg flex items-center justify-center">
                <svg className="size-4" viewBox="0 0 24 24" fill="white"><path d="M12 2L4 7l8 5 8-5-8-5zM4 12l8 5 8-5M4 17l8 5 8-5"/></svg>
              </div>
              <span className="text-[13px]">
                <span className="font-medium">Cloudflare</span>
                <span className="text-[#868f97]"> earnings call just started.</span>
                <span className="ml-1">🔥</span>
              </span>
              <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.08] rounded-full text-[11px] text-[#868f97] hover:text-white transition-colors">
                <svg className="size-3" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16" fill="black"/></svg>
                Join live call
              </button>
            </div>

            <div className="relative w-full max-w-[350px] mx-auto aspect-square">
              <Image src="/demo/fey/earnings-model_4x.jpg" alt="Person with headphones" fill className="object-cover object-top rounded-2xl" />
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section ref={ctaAnim.ref} className="py-24 text-center">
        <div className="max-w-[1400px] mx-auto px-6">
          <p className={cn(
            "text-[#ff9966] text-[14px] font-medium mb-4",
            ctaAnim.isVisible ? "opacity-100" : "opacity-0"
          )}>
            7-day free trial. Cancel anytime.
          </p>

          <h2 className={cn(
            "text-[48px] md:text-[64px] font-semibold italic leading-[1.1] tracking-[-0.02em] mb-4",
            "transition-all duration-700",
            ctaAnim.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}>
            Finance made effortless.
          </h2>

          <p className={cn(
            "text-[#868f97] text-[16px] max-w-md mx-auto mb-8",
            "transition-all duration-700 delay-100",
            ctaAnim.isVisible ? "opacity-100" : "opacity-0"
          )}>
            Clear insights on markets, economic trends, and breaking news for everyone.
          </p>

          <button className={cn(
            "px-8 py-3.5 bg-transparent text-white text-[14px] font-medium rounded-full border border-white/[0.2] hover:border-white/[0.4] hover:bg-white/[0.05] transition-all",
            ctaAnim.isVisible ? "opacity-100" : "opacity-0"
          )}>
            Try it free
          </button>

          {/* MacBook */}
          <div className={cn(
            "mt-16 relative max-w-[800px] mx-auto",
            "transition-all duration-1000 delay-300",
            ctaAnim.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
          )}>
            <div className="relative aspect-[16/10]">
              <Image src="/demo/fey/macbook-footer_4x.jpg" alt="MacBook" fill className="object-contain" />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-white/[0.06]">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-[#868f97] text-[13px]">© 2026, Lician Labs Inc.</span>
          <div className="flex items-center gap-6 text-[#868f97] text-[13px]">
            {['Features', 'Earnings', 'Portfolio', 'Finder', 'Pricing', 'Updates', 'Download'].map(item => (
              <button key={item} className="hover:text-white transition-colors">{item}</button>
            ))}
          </div>
          <div className="flex items-center gap-4 text-[#868f97] text-[13px]">
            <span className="text-white/[0.2]">|</span>
            <button className="hover:text-white transition-colors">Privacy</button>
            <button className="hover:text-white transition-colors">Terms</button>
          </div>
        </div>
      </footer>
    </div>
  )
}
