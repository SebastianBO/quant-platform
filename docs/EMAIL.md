# Email Infrastructure (Jan 2026)

## Overview

Lician uses a multi-provider email system with automatic fallback. **Elastic Email** is the primary provider due to cost ($0.09/1,000 emails).

## Email Providers (Priority Order)

| Provider | Cost | Env Variable | Status |
|----------|------|--------------|--------|
| **Elastic Email** | $0.09/1k | `ELASTIC_EMAIL_API_KEY` | ✅ Primary |
| Brevo | 9k free/month | `BREVO_API_KEY` | Fallback |
| Resend | $0.10/email | `RESEND_API_KEY` | Fallback |

The system auto-detects which provider is configured and uses the first available.

## DNS Records for lician.com (Loopia)

**Configured Jan 14, 2026** - All records verified and saved:

| Record Type | Name | Value | Status |
|-------------|------|-------|--------|
| **SPF** | @ (root) | `v=spf1 a mx include:_spf.google.com -all` | ✅ SAVED |
| **DKIM** | `api._domainkey` | `k=rsa;t=s;p=MIGfMA0GCSqGSIb3DQEBAQUAA4G...` | ✅ SAVED |
| **CNAME** | `tracking` | `api.elasticemail.com` | ✅ SAVED |
| **DMARC** | `_dmarc` | `v=DMARC1;p=none;` | ✅ SAVED |

**DNS Propagation**: 15min-48h for full global propagation.

## Key Files

### Email Service Library
- `src/lib/email.ts` - Multi-provider email service with templates
- `src/types/elasticemail.d.ts` - TypeScript declarations for Elastic Email SDK

### API Endpoints
- `POST /api/email/subscribe` - Newsletter subscription
- `GET /api/email/confirm?token=xxx` - Email confirmation
- `GET /api/cron/send-weekly-digest` - Weekly newsletter (cron)

### Components
- `src/components/NewsletterSignup.tsx` - 3 variants: inline, card, hero

## Database Tables

```sql
-- email_subscribers table (Supabase)
email_subscribers (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'pending',  -- pending, confirmed, unsubscribed
  source TEXT,                     -- homepage, footer, popup, etc.
  confirmation_token UUID,
  confirmed_at TIMESTAMPTZ,
  unsubscribed_at TIMESTAMPTZ,
  subscribed_weekly_digest BOOLEAN DEFAULT true,
  subscribed_alerts BOOLEAN DEFAULT true,
  emails_sent INT DEFAULT 0,
  last_email_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
)
```

## Email Templates

Three templates available in `src/lib/email.ts`:

1. **Welcome Email** - Sent on subscription with confirmation link
2. **Weekly Digest** - Market movers, insider trades, AI insights
3. **Market Alert** - Price alerts, insider activity, earnings

## Testing Email

```bash
# Trigger welcome email
curl -X POST https://lician.com/api/email/subscribe \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "source": "test"}'

# Test weekly digest (add ?test=true for local testing)
curl "https://lician.com/api/cron/send-weekly-digest?test=true"
```

## Cron Setup (Vercel)

Add to `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/cron/send-weekly-digest",
    "schedule": "0 8 * * 1"
  }]
}
```

Required env var: `CRON_SECRET` for authentication.

## Troubleshooting

### Emails not sending
1. Check DNS propagation: https://mxtoolbox.com/spf.aspx (search `lician.com`)
2. Verify domain in Elastic Email dashboard → Settings → Domains
3. Check Vercel logs for errors

### DNS Verification Tools
- MXToolbox: https://mxtoolbox.com/spf.aspx
- Google Admin Toolbox: toolbox.googleapps.com/apps/checkmx/
- DNSChecker: https://dnschecker.org/

### Provider Fallback
If Elastic Email fails, add `BREVO_API_KEY` or `RESEND_API_KEY` to Vercel env vars as backup.
