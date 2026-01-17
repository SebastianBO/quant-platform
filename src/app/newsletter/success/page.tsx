import { Suspense } from 'react'
import { NewsletterSuccessContent, LoadingFallback } from './SuccessContent'

export default function NewsletterSuccessPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <NewsletterSuccessContent />
    </Suspense>
  )
}
