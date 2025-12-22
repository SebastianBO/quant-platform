/**
 * Reusable Structured Data Components for SEO
 *
 * These components render JSON-LD structured data for Google rich snippets.
 * Use them to add FAQ, Breadcrumb, Article, HowTo, and other schema.org markup to pages.
 */

import Script from 'next/script'

interface StructuredDataProps {
  data: object | object[]
}

/**
 * Base component that renders JSON-LD structured data
 * Can accept single schema or array of schemas
 */
export function StructuredData({ data }: StructuredDataProps) {
  const schemaData = Array.isArray(data) ? data : [data]

  return (
    <Script
      id="structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schemaData),
      }}
      strategy="beforeInteractive"
    />
  )
}

interface FAQ {
  question: string
  answer: string
}

interface FAQSchemaProps {
  faqs: FAQ[]
}

/**
 * FAQ Schema Component
 * Generates FAQPage structured data for rich snippets in search results
 *
 * @example
 * <FAQSchema faqs={[
 *   { question: "How much money do I need?", answer: "You can start with as little as $1..." }
 * ]} />
 */
export function FAQSchema({ faqs }: FAQSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }

  return (
    <Script
      id="faq-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema),
      }}
      strategy="beforeInteractive"
    />
  )
}

interface BreadcrumbItem {
  name: string
  url: string
}

interface BreadcrumbSchemaProps {
  items: BreadcrumbItem[]
}

/**
 * Breadcrumb Schema Component
 * Generates BreadcrumbList structured data for breadcrumb navigation in search results
 *
 * @example
 * <BreadcrumbSchema items={[
 *   { name: "Home", url: "https://example.com" },
 *   { name: "Learn", url: "https://example.com/learn" },
 *   { name: "How to Invest", url: "https://example.com/learn/how-to-invest" }
 * ]} />
 */
export function BreadcrumbSchema({ items }: BreadcrumbSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }

  return (
    <Script
      id="breadcrumb-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema),
      }}
      strategy="beforeInteractive"
    />
  )
}

interface ArticleSchemaProps {
  headline: string
  description: string
  url: string
  datePublished?: string
  dateModified?: string
  image?: string
  keywords?: string[]
  authorName?: string
}

/**
 * Article Schema Component
 * Generates Article structured data for blog posts and educational content
 *
 * @example
 * <ArticleSchema
 *   headline="How to Invest in Stocks"
 *   description="Complete guide to stock investing"
 *   url="https://example.com/learn/how-to-invest"
 *   keywords={["investing", "stocks", "beginner guide"]}
 * />
 */
export function ArticleSchema({
  headline,
  description,
  url,
  datePublished,
  dateModified,
  image,
  keywords,
  authorName = 'Lician',
}: ArticleSchemaProps) {
  const now = new Date().toISOString()

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline,
    description,
    url,
    image: image || 'https://lician.com/og-image.png',
    datePublished: datePublished || now,
    dateModified: dateModified || now,
    author: {
      '@type': 'Organization',
      name: authorName,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Lician',
      logo: {
        '@type': 'ImageObject',
        url: 'https://lician.com/logo.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    ...(keywords && { keywords: keywords.join(', ') }),
  }

  return (
    <Script
      id="article-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema),
      }}
      strategy="beforeInteractive"
    />
  )
}

interface HowToStep {
  name: string
  text: string
}

interface HowToSchemaProps {
  name: string
  description: string
  steps: HowToStep[]
  totalTime?: string
  estimatedCost?: {
    value: number
    currency: string
  }
}

/**
 * HowTo Schema Component
 * Generates HowTo structured data for step-by-step guides
 *
 * @example
 * <HowToSchema
 *   name="How to Analyze Stocks"
 *   description="Step-by-step guide to stock analysis"
 *   steps={[
 *     { name: "Check P/E Ratio", text: "Compare the P/E ratio to industry average..." },
 *     { name: "Analyze Revenue Growth", text: "Look for consistent revenue growth..." }
 *   ]}
 * />
 */
export function HowToSchema({
  name,
  description,
  steps,
  totalTime,
  estimatedCost,
}: HowToSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name,
    description,
    ...(totalTime && { totalTime }),
    ...(estimatedCost && {
      estimatedCost: {
        '@type': 'MonetaryAmount',
        currency: estimatedCost.currency,
        value: estimatedCost.value,
      },
    }),
    step: steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.name,
      text: step.text,
    })),
  }

  return (
    <Script
      id="howto-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema),
      }}
      strategy="beforeInteractive"
    />
  )
}

/**
 * Combined Schema Component
 * Allows multiple schemas to be combined in a single script tag
 * This is often more efficient than multiple separate script tags
 *
 * @example
 * <CombinedSchema schemas={[
 *   breadcrumbSchema,
 *   articleSchema,
 *   faqSchema
 * ]} />
 */
interface CombinedSchemaProps {
  schemas: object[]
}

export function CombinedSchema({ schemas }: CombinedSchemaProps) {
  return (
    <Script
      id="combined-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schemas),
      }}
      strategy="beforeInteractive"
    />
  )
}
