# Revenue Monetization (Jan 14, 2026)

## Overview

Three revenue streams implemented to monetize the platform while keeping core features free.

## 1. Broker Affiliate Program

**Location**: `src/components/BrokerAffiliate.tsx`

Displays on stock pages after watchlist buttons. Tracks clicks via GA4.

| Broker | Potential Commission | Affiliate URL |
|--------|---------------------|---------------|
| Interactive Brokers | $200/funded account | Replace in component |
| Robinhood | $75/signup | Replace in component |
| Webull | $50-150/account | Replace in component |

**Variants**: `inline` (default), `card`, `minimal`

```tsx
<BrokerAffiliate ticker="AAPL" variant="inline" />
```

**Analytics Event**: `affiliate_click` with broker name, ticker, placement

## 2. Premium Newsletter ($9.99/month)

**Page**: `/newsletter` - Shows free vs premium comparison

**Checkout**: `/api/stripe/newsletter-checkout?plan=monthly|annual`

| Tier | Price | Features |
|------|-------|----------|
| Free | $0 | Weekly digest, AI picks, catalyst previews |
| Premium | $9.99/mo or $79.99/yr | Real-time insider alerts, institutional flow, 8-K alerts |

**Environment Variables Required** (LIVE in Vercel Production):
```bash
STRIPE_NEWSLETTER_MONTHLY_PRICE_ID=price_1SpclhDF7IaViaQF7v5pjaY4
STRIPE_NEWSLETTER_ANNUAL_PRICE_ID=price_1SpclpDF7IaViaQFBXCMFtHd
```

## 3. Developer API Access

**Page**: `/developers` - API documentation and pricing

**Signup**: `/developers/signup` - Free API key generation

**Checkout**: `/api/stripe/api-checkout?plan=basic|pro`

| Tier | Price | Requests/Day | Features |
|------|-------|--------------|----------|
| Free | $0 | 100 | US data, EOD prices |
| Basic | $29/mo | 10,000 | US + EU, real-time, insider trades |
| Pro | $99/mo | 100,000 | All data, 13F, SEC filings |
| Enterprise | Custom | Unlimited | SLA, webhooks, custom feeds |

**Database Table**: `api_keys` (migration: `20260114000001_api_keys.sql`)

**Environment Variables Required** (LIVE in Vercel Production):
```bash
STRIPE_API_BASIC_PRICE_ID=price_1SpclxDF7IaViaQFN0M839UB
STRIPE_API_PRO_PRICE_ID=price_1Spcm4DF7IaViaQFXTSkAgT0
```

## Files Created

```
src/components/BrokerAffiliate.tsx           # Affiliate link component
src/app/api/stripe/newsletter-checkout/      # Newsletter Stripe checkout
src/app/api/stripe/api-checkout/             # API access Stripe checkout
src/app/api/developers/create-key/           # API key generation
src/app/developers/page.tsx                  # Developer portal
src/app/developers/signup/page.tsx           # API key signup form
supabase/migrations/20260114000001_api_keys.sql  # API keys table
```

## Stripe Setup Status ✅ COMPLETE (Jan 14, 2026)

All products created and environment variables configured:

| Product | Price ID | Status |
|---------|----------|--------|
| Newsletter Monthly | `price_1SpclhDF7IaViaQF7v5pjaY4` | ✅ Live |
| Newsletter Annual | `price_1SpclpDF7IaViaQFBXCMFtHd` | ✅ Live |
| API Basic | `price_1SpclxDF7IaViaQFN0M839UB` | ✅ Live |
| API Pro | `price_1Spcm4DF7IaViaQFXTSkAgT0` | ✅ Live |

**Checkout Endpoints**:
- Newsletter: `https://quant-platform.vercel.app/api/stripe/newsletter-checkout?plan=monthly|annual`
- API Access: `https://quant-platform.vercel.app/api/stripe/api-checkout?plan=basic|pro`
- Premium: POST to `/api/stripe/create-checkout` with `{ planId: "monthly"|"annual" }`
