# Lician - AI-Powered Stock Research Platform

An institutional-grade quantitative finance platform combining real-time market data, AI-driven analysis, and portfolio management.

## Quick Links

- **Live Site:** https://lician.com
- **Admin Dashboard:** https://lician.com/admin
- **API Docs:** See [PLATFORM_DOCUMENTATION.md](./PLATFORM_DOCUMENTATION.md)
- **Operations Guide:** See [OPERATIONS_RUNBOOK.md](./OPERATIONS_RUNBOOK.md)

## Features

- Real-time stock quotes and charts
- AI-powered investment analysis (Claude/GPT)
- Financial statements (10-K, 10-Q)
- Institutional ownership (13F filings)
- Insider trading (Form 4)
- Biotech catalyst tracking
- Portfolio management (Plaid/Tink)
- Programmatic SEO (100K+ pages)

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16, React 19, Tailwind CSS |
| Backend | Supabase (PostgreSQL), Vercel |
| AI | Anthropic Claude, OpenAI GPT-4 |
| Payments | Stripe, RevenueCat |
| Data | SEC EDGAR, EODHD, Financial Datasets |

## Getting Started

### Prerequisites

- Node.js 20+
- Supabase account
- Required API keys (see `.env.example`)

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your keys

# Run development server
npm run dev
```

### Database Setup

```bash
# Link to Supabase project
supabase link --project-ref YOUR_PROJECT_REF

# Push migrations
supabase db push --linked

# Generate types
supabase gen types typescript --linked > types/supabase.ts
```

## Project Structure

```
src/
├── app/           # Next.js App Router pages
│   ├── api/       # API routes (83 endpoints)
│   ├── stock/     # Stock analysis pages
│   ├── admin/     # Admin dashboard
│   └── premium/   # Subscription pages
├── components/    # React components (71)
└── lib/           # Utilities and helpers

supabase/
└── migrations/    # Database migrations (22)

scripts/
├── check-cron-status.js    # Cron diagnostics
└── generate-favicons.js    # Favicon generator
```

## Documentation

| Document | Description |
|----------|-------------|
| [PLATFORM_DOCUMENTATION.md](./PLATFORM_DOCUMENTATION.md) | Complete platform documentation |
| [OPERATIONS_RUNBOOK.md](./OPERATIONS_RUNBOOK.md) | Operations and troubleshooting guide |

## Key Commands

```bash
# Development
npm run dev          # Start dev server
npm run build        # Production build

# Database
supabase db push --linked              # Deploy migrations
supabase migration new NAME            # Create migration
supabase migration list --linked       # Check status

# Diagnostics
node scripts/check-cron-status.js      # Check cron jobs
```

## Environment Variables

See `.env.example` for required variables. Key ones:

- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase admin key
- `STRIPE_SECRET_KEY` - Stripe API key
- `EODHD_API_KEY` - Market data API
- `ADMIN_PASSWORD` - Admin dashboard access

## Deployment

Deployed on Vercel with automatic deployments from `main` branch.

```bash
# Manual deploy
vercel --prod

# Database migrations
supabase db push --linked
```

## Monitoring

- **Vercel:** https://vercel.com/finance-liciancoms-projects/quant-platform
- **Supabase:** https://supabase.com/dashboard/project/wcckhqxkmhyzfpynthte
- **Admin:** https://lician.com/admin

## License

Proprietary - All rights reserved

---

*Built with Next.js, Supabase, and AI*
