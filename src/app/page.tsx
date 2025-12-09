import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { TrustedBy } from "@/components/trusted-by"
import { FeaturesSection } from "@/components/features-section"
import { AIFeatures } from "@/components/ai-features"
import { Testimonials } from "@/components/testimonials"
import { Stats } from "@/components/stats"
import { MobileApp } from "@/components/mobile-app"
import { APISection } from "@/components/api-section"
import { APITestimonials } from "@/components/api-testimonials"
import { AIChatCTA } from "@/components/ai-chat-cta"
import { Community } from "@/components/community"
import { Newsletter } from "@/components/newsletter"
import { CTASection } from "@/components/cta-section"
import { Footer } from "@/components/footer"
import { getOrganizationSchema, getWebSiteSchema, SITE_URL } from "@/lib/seo"

export default function Home() {
  const organizationSchema = getOrganizationSchema()
  const webSiteSchema = getWebSiteSchema()

  // SoftwareApplication schema for the platform
  const softwareSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Lician',
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '1250',
      bestRating: '5',
      worstRating: '1',
    },
    description: 'AI-powered stock research and analysis platform with real-time quotes, DCF valuations, and investment insights.',
    url: SITE_URL,
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([organizationSchema, webSiteSchema, softwareSchema]) }}
      />
      <main className="min-h-screen bg-background">
        <Header />
        <Hero />
        <TrustedBy />
        <FeaturesSection />
        <AIFeatures />
        <Testimonials />
        <Stats />
        <MobileApp />
        <APISection />
        <APITestimonials />
        <AIChatCTA />
        <Community />
        <Newsletter />
        <CTASection />
        <Footer />
      </main>
    </>
  )
}
