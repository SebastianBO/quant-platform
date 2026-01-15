# Analytics & Tracking (Jan 2026)

## Overview

Lician has comprehensive analytics tracking across 4 platforms for understanding user behavior, conversions, and product performance.

## Active Analytics Tools

| Tool | Purpose | Dashboard | Status |
|------|---------|-----------|--------|
| **Google Analytics 4** | Traffic, events, conversions | [analytics.google.com](https://analytics.google.com) | ✅ Live |
| **PostHog** | Product analytics, session recordings, funnels | [us.posthog.com](https://us.posthog.com) | ✅ Live |
| **Microsoft Clarity** | Heatmaps, session recordings (FREE) | [clarity.microsoft.com](https://clarity.microsoft.com) | 🔧 Needs key |
| **Vercel Analytics** | Web vitals, performance | Vercel dashboard | ✅ Live |

## Environment Variables

```bash
# Google Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-K6Q0QJYRET

# PostHog
NEXT_PUBLIC_POSTHOG_KEY=phc_Lh6vWcv4IAs0GR9wRdRndaibta2Wbgcn3ls1wHUb7Lt
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com

# Microsoft Clarity (add when available)
NEXT_PUBLIC_CLARITY_PROJECT_ID=<get from clarity.microsoft.com>
```

## Key Files

### Analytics Library
- `src/lib/analytics.ts` - 25+ tracking functions for GA4
- `src/hooks/useAnalytics.ts` - React hook for components
- `src/instrumentation-client.ts` - PostHog initialization (Next.js 15.3+)
- `src/components/PostHogProvider.tsx` - PostHog React context

### Integration Points
- `src/app/layout.tsx` - GA4 + Clarity scripts, PostHog provider
- `src/components/ManusStyleHome.tsx` - AI query tracking, CTA tracking
- `src/app/premium/success/page.tsx` - Purchase conversion tracking

## What's Tracked

### Google Analytics 4 Events

| Event | When | Properties |
|-------|------|------------|
| `ai_query_start` | User submits AI query | query, model, model_tier |
| `ai_query_complete` | AI responds | response_time_ms, success, tools_used |
| `begin_checkout` | User clicks upgrade | plan, value |
| `purchase` | Subscription complete | transaction_id, plan, value |
| `upgrade_prompt_shown` | Auth/payment modal shown | trigger |
| `cta_click` | Button clicked | cta_name, location |
| `scroll` | Scroll milestones | percent_scrolled (25/50/75/100) |

### PostHog Auto-Capture

PostHog automatically captures:
- All page views (SPA-aware)
- All clicks with element data
- Form submissions
- Session recordings (video replay)
- User identification when logged in

### Custom Dimensions (GA4)

| Dimension | Values |
|-----------|--------|
| `user_type` | anonymous, authenticated, premium |
| `subscription_tier` | free, monthly, annual |
| `model_used` | gemini-flash, gpt-4o-mini, claude-sonnet-4, etc. |

### Content Groups (GA4)

Pages are auto-grouped:
- `Stock Pages` - /stock/*
- `Compare Pages` - /compare/*
- `Sector Pages` - /sectors/*
- `Learn Pages` - /learn/*
- `Homepage` - /
- `Other` - everything else

## Usage in Components

### Track AI Query
```typescript
import { useAnalytics } from '@/hooks/useAnalytics'

function MyComponent() {
  const { trackAIQueryStart, trackAIQueryComplete } = useAnalytics()

  const handleQuery = async () => {
    trackAIQueryStart({ query, model, model_tier: 'standard' })
    const start = Date.now()
    // ... execute query
    trackAIQueryComplete({
      query, model, model_tier: 'standard',
      response_time_ms: Date.now() - start,
      success: true
    })
  }
}
```

### Track CTA Click
```typescript
const { trackCTAClick, trackBeginCheckout } = useAnalytics()

<button onClick={() => {
  trackCTAClick('upgrade_button', 'header')
  trackBeginCheckout('annual', 58)
}}>
  Upgrade
</button>
```

### Identify User (PostHog)
```typescript
import { identifyUser } from '@/components/PostHogProvider'

// When user logs in
identifyUser(user.id, {
  email: user.email,
  is_premium: true,
  plan: 'annual'
})
```

### Track Custom PostHog Event
```typescript
import { trackPostHogEvent } from '@/components/PostHogProvider'

trackPostHogEvent('feature_used', {
  feature: 'dcf_calculator',
  ticker: 'AAPL'
})
```

## Dashboards & What to Look For

### Google Analytics
- **Acquisition** → Where users come from
- **Engagement** → Which pages, how long
- **Monetization** → Revenue, conversion funnels
- **Events** → Custom event counts and trends

### PostHog
- **Session Recordings** → Watch users interact with AI chat
- **Funnels** → homepage → signup → premium conversion
- **Trends** → Event counts over time
- **Feature Flags** → A/B test new features

### Microsoft Clarity (when enabled)
- **Heatmaps** → Where users click/scroll
- **Rage Clicks** → Frustration indicators
- **Dead Clicks** → Broken elements
- **Session Recordings** → Free unlimited replays

## Troubleshooting

### Events not appearing in GA4
1. Check `NEXT_PUBLIC_GA_MEASUREMENT_ID` is set
2. GA4 has 24-48h delay for some reports
3. Use Realtime report for immediate verification

### PostHog not recording
1. Check `NEXT_PUBLIC_POSTHOG_KEY` is set
2. Visit site in browser (not curl)
3. Check PostHog dashboard → Activity

### Add new tracking
1. Add function to `src/lib/analytics.ts`
2. Export from `src/hooks/useAnalytics.ts`
3. Import and call in component
