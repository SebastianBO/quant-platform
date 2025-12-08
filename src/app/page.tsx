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

export default function Home() {
  return (
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
  )
}
