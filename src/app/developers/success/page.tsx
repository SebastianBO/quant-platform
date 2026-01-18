import { Suspense } from 'react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { SubscriptionSuccessContent, LoadingFallback } from './SuccessContent'

export default function SubscriptionSuccessPage() {
  return (
    <>
      <Header />
      <main className="min-h-dvh bg-black text-white pt-20">
        <div className="max-w-xl mx-auto px-6 py-16">
          <Suspense fallback={<LoadingFallback />}>
            <SubscriptionSuccessContent />
          </Suspense>
        </div>
      </main>
      <Footer />
    </>
  )
}
