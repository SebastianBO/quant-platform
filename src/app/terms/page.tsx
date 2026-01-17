import Link from 'next/link'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

export const metadata = {
  title: 'Terms of Service | Lician',
  description: 'Terms of Service for Lician financial data API',
}

export default function TermsPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-background text-foreground pt-20">
        <div className="max-w-3xl mx-auto px-6 py-16">
          <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
          <p className="text-muted-foreground mb-8">Last updated: January 17, 2026</p>

          <div className="prose prose-invert prose-sm max-w-none space-y-8">
            <section>
              <h2 className="text-xl font-semibold mb-4">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                By accessing or using Lician&apos;s API services (&quot;Services&quot;), you agree to be bound by these Terms of Service.
                If you do not agree to these terms, you may not use our Services.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">2. Description of Services</h2>
              <p className="text-muted-foreground leading-relaxed">
                Lician provides financial data APIs that allow developers to access stock prices, financial statements,
                company information, and other market data. Our Services include both free and paid tiers with varying
                rate limits and features.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">3. API Key and Account Security</h2>
              <p className="text-muted-foreground leading-relaxed">
                You are responsible for maintaining the confidentiality of your API key. You agree to:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-2">
                <li>Keep your API key secure and not share it with unauthorized parties</li>
                <li>Notify us immediately of any unauthorized use of your API key</li>
                <li>Be responsible for all activity that occurs under your API key</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">4. Acceptable Use</h2>
              <p className="text-muted-foreground leading-relaxed">You agree not to:</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-2">
                <li>Use the Services for any illegal purpose</li>
                <li>Attempt to circumvent rate limits or other technical restrictions</li>
                <li>Resell or redistribute raw API data without permission</li>
                <li>Use the Services to build a competing product</li>
                <li>Interfere with or disrupt the integrity of the Services</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">5. Rate Limits and Usage</h2>
              <p className="text-muted-foreground leading-relaxed">
                Each pricing tier has specific rate limits. Exceeding these limits may result in temporary throttling
                or suspension of service. We reserve the right to modify rate limits with reasonable notice.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">6. Data Accuracy</h2>
              <p className="text-muted-foreground leading-relaxed">
                While we strive to provide accurate financial data, we do not guarantee the accuracy, completeness,
                or timeliness of any information provided through our Services. Financial data should not be used
                as the sole basis for investment decisions.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">7. Payment Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                Paid subscriptions are billed monthly or annually. All fees are non-refundable except as required by law.
                We may change our pricing with 30 days notice.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">8. Termination</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may suspend or terminate your access to the Services at any time for violation of these Terms
                or for any other reason at our sole discretion. Upon termination, your API key will be deactivated.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">9. Limitation of Liability</h2>
              <p className="text-muted-foreground leading-relaxed">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, LICIAN SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL,
                SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED
                DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">10. Changes to Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may modify these Terms at any time. We will notify users of material changes via email or
                through the Services. Continued use of the Services after changes constitutes acceptance of
                the modified Terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">11. Contact</h2>
              <p className="text-muted-foreground leading-relaxed">
                For questions about these Terms, please contact us at{' '}
                <a href="mailto:legal@lician.com" className="text-primary hover:underline">legal@lician.com</a>
              </p>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-border">
            <Link href="/developers" className="text-primary hover:underline">
              &larr; Back to Developers
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
