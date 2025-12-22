# SEO Structured Data Components

This directory contains reusable components for adding structured data (Schema.org JSON-LD) to your pages for better SEO and rich snippets in Google search results.

## Components

### FAQSchema

Generates FAQPage structured data for rich FAQ snippets in search results.

**Usage:**
```tsx
import { FAQSchema } from '@/components/seo/StructuredData'

const faqs = [
  {
    question: 'How much money do I need to start investing?',
    answer: 'You can start with as little as $1 thanks to fractional shares...'
  },
  // ... more FAQs
]

export default function Page() {
  return (
    <>
      <FAQSchema faqs={faqs} />
      {/* Your page content */}
    </>
  )
}
```

### BreadcrumbSchema

Generates BreadcrumbList structured data for breadcrumb navigation in search results.

**Usage:**
```tsx
import { BreadcrumbSchema } from '@/components/seo/StructuredData'

<BreadcrumbSchema
  items={[
    { name: 'Home', url: 'https://lician.com' },
    { name: 'Learn', url: 'https://lician.com/learn' },
    { name: 'How to Invest', url: 'https://lician.com/learn/how-to-invest' }
  ]}
/>
```

### ArticleSchema

Generates Article structured data for blog posts and educational content.

**Usage:**
```tsx
import { ArticleSchema } from '@/components/seo/StructuredData'

<ArticleSchema
  headline="How to Invest in Stocks"
  description="Complete guide to stock investing"
  url="https://lician.com/learn/how-to-invest"
  keywords={['investing', 'stocks', 'beginner guide']}
  datePublished="2025-01-15T00:00:00Z"  // optional
  dateModified="2025-01-20T00:00:00Z"   // optional
/>
```

### HowToSchema

Generates HowTo structured data for step-by-step guides.

**Usage:**
```tsx
import { HowToSchema } from '@/components/seo/StructuredData'

const steps = [
  {
    name: 'Open a brokerage account',
    text: 'Choose a reputable broker like Fidelity or Charles Schwab...'
  },
  // ... more steps
]

<HowToSchema
  name="How to Start Investing in Stocks"
  description="Step-by-step guide for beginners"
  steps={steps}
  totalTime="PT30M"  // optional: ISO 8601 duration
/>
```

### CombinedSchema

For combining multiple schemas in a single script tag (more efficient).

**Usage:**
```tsx
import { CombinedSchema } from '@/components/seo/StructuredData'
import { getBreadcrumbSchema, getArticleSchema } from '@/lib/seo'

<CombinedSchema
  schemas={[
    breadcrumbSchema,
    articleSchema,
    faqSchema
  ]}
/>
```

## Complete Example

See `/src/app/learn/how-to-invest/page.tsx` for a complete implementation example:

```tsx
import { FAQSchema, BreadcrumbSchema, ArticleSchema } from '@/components/seo/StructuredData'

export default function HowToInvestPage() {
  const pageUrl = `${SITE_URL}/learn/how-to-invest`

  return (
    <>
      <Header />

      {/* Structured Data for SEO */}
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: SITE_URL },
          { name: 'Learn', url: `${SITE_URL}/learn` },
          { name: 'How to Invest in Stocks', url: pageUrl },
        ]}
      />
      <ArticleSchema
        headline="How to Invest in Stocks - Complete Beginner's Guide"
        description="Comprehensive guide to stock investing"
        url={pageUrl}
        keywords={['how to invest', 'stock investing guide']}
      />
      <FAQSchema faqs={faqs} />

      <main>
        {/* Your page content */}
      </main>
    </>
  )
}
```

## Benefits

1. **Rich Snippets**: FAQ and HowTo schemas can appear as rich snippets in Google search results
2. **Breadcrumbs**: Breadcrumb schema shows navigation path in search results
3. **Better CTR**: Rich snippets typically improve click-through rates from search
4. **SEO Signals**: Structured data helps Google understand your content better

## Testing

Test your structured data using:
- [Google Rich Results Test](https://search.google.com/test/rich-results)
- [Schema.org Validator](https://validator.schema.org/)

## Pages with Structured Data

Currently implemented on:
- `/learn/how-to-invest` - FAQ, Breadcrumb, Article
- `/learn/technical-analysis` - FAQ, Breadcrumb, Article, HowTo
- `/learn/value-investing` - FAQ, Breadcrumb, Article, HowTo

## Adding to New Pages

1. Import the components you need
2. Add them at the top of your component (after `<Header />`)
3. Ensure FAQs have good, comprehensive answers (aim for 10+ questions)
4. Test with Google Rich Results Test before deploying

## Best Practices

### FAQ Content
- Aim for 10-20 questions per page
- Questions should match what users actually search for
- Answers should be 2-4 sentences, comprehensive but concise
- Cover common beginner questions and advanced topics

### Breadcrumbs
- Always include Home as first item
- Include all parent pages in the hierarchy
- Use full URLs, not relative paths

### Keywords
- Include 5-10 relevant keywords
- Focus on search terms users actually use
- Mix broad terms ("investing") with long-tail ("how to start investing with $100")

## Related

- `/src/lib/seo.ts` - Schema generation helper functions
- `/src/components/seo/RelatedLinks.tsx` - Internal linking component
