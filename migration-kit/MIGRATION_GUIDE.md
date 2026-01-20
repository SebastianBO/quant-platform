# Vercel → Hetzner + Coolify Migration Guide

Complete guide to migrate quant-platform from Vercel to self-hosted infrastructure.

## Cost Comparison

| Item | Vercel | Self-Hosted |
|------|--------|-------------|
| Hosting | $20/mo + usage ($250 spike) | €5.39/mo fixed |
| CDN | Included | Cloudflare Free |
| Database | Supabase Free | Supabase Free |
| Total | $20-250+/mo | **~€6/mo** |

## Prerequisites

- Hetzner Cloud account ([sign up](https://hetzner.cloud))
- Cloudflare account ([sign up](https://cloudflare.com))
- GitHub repository access
- 30 minutes of time

---

## Phase 1: Create Hetzner Server (10 minutes)

### Step 1.1: Create Server

1. Go to [Hetzner Cloud Console](https://console.hetzner.cloud)
2. Click **"Create Server"**
3. Configure:
   - **Location**: Nuremberg (or Ashburn for US)
   - **Image**: Ubuntu 24.04
   - **Type**: CX32 (€5.39/mo) - 4 vCPU, 8GB RAM
   - **Networking**: Public IPv4 + IPv6
   - **SSH Key**: Add your public key
   - **Backups**: Enable (€1.08/mo extra)
   - **Name**: `quant-platform`
4. Click **"Create & Buy Now"**

### Step 1.2: Note Your Server IP

```
Server IP: ___.___.___.___ (save this!)
```

---

## Phase 2: Install Coolify (5 minutes)

### Step 2.1: SSH into Server

```bash
ssh root@YOUR_SERVER_IP
```

### Step 2.2: Run Setup Script

Option A - One-liner:
```bash
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
```

Option B - Use our script (includes security setup):
```bash
curl -fsSL https://raw.githubusercontent.com/YOUR_REPO/main/migration-kit/scripts/setup-hetzner.sh | bash
```

### Step 2.3: Access Coolify Dashboard

1. Open: `http://YOUR_SERVER_IP:8000`
2. Create admin account
3. Save your credentials!

---

## Phase 3: Configure Cloudflare (10 minutes)

### Step 3.1: Add Domain to Cloudflare

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Click **"Add Site"** → Enter `lician.com`
3. Select **Free Plan**
4. Update nameservers at your registrar

### Step 3.2: Configure DNS Records

| Type | Name | Content | Proxy |
|------|------|---------|-------|
| A | @ | YOUR_SERVER_IP | ✅ Proxied |
| A | www | YOUR_SERVER_IP | ✅ Proxied |
| CNAME | api | @ | ✅ Proxied |

### Step 3.3: SSL Settings

1. Go to **SSL/TLS** → **Overview**
2. Set mode to **"Full (strict)"**
3. Go to **Edge Certificates**
4. Enable **"Always Use HTTPS"**

### Step 3.4: Configure Caching

1. Go to **Caching** → **Configuration**
2. Set **Browser Cache TTL**: 1 year
3. Go to **Rules** → **Page Rules** (or Cache Rules)
4. Add rule:
   - URL: `lician.com/_next/static/*`
   - Setting: Cache Level = Cache Everything, Edge TTL = 1 month

---

## Phase 4: Apply Code Changes (5 minutes)

### Step 4.1: Run on Your Local Machine

```bash
cd /path/to/quant-platform

# Make script executable
chmod +x migration-kit/scripts/apply-code-changes.sh

# Run the script
./migration-kit/scripts/apply-code-changes.sh
```

### Step 4.2: Manual Changes (if script doesn't work)

**1. Add standalone output to `next.config.ts`:**

```typescript
const nextConfig: NextConfig = {
  output: 'standalone',  // ADD THIS LINE
  // ... rest of config
}
```

**2. Remove Vercel Analytics from `src/app/layout.tsx`:**

```typescript
// DELETE this line:
import { Analytics } from "@vercel/analytics/next"

// DELETE this component (usually near the end):
<Analytics />
```

**3. Get OpenRouter API Key:**

1. Go to [OpenRouter.ai](https://openrouter.ai)
2. Sign up / Log in
3. Go to **Keys** → **Create Key**
4. Copy the key (starts with `sk-or-`)

### Step 4.3: Commit Changes

```bash
git add .
git commit -m "Migrate from Vercel to self-hosted Coolify"
git push origin main
```

---

## Phase 5: Deploy in Coolify (10 minutes)

### Step 5.1: Add Application

1. In Coolify, click **"New Resource"**
2. Select **"Public Repository"** (or connect GitHub for private)
3. Enter: `https://github.com/YOUR_USERNAME/quant-platform`
4. Select branch: `main`

### Step 5.2: Configure Build

1. **Build Pack**: Dockerfile
2. **Dockerfile Path**: `migration-kit/Dockerfile`
3. **Port**: 3000

### Step 5.3: Add Environment Variables

Go to **Environment Variables** and add all from `migration-kit/configs/coolify-env-example.txt`:

**Build Variables (click "Build Variable"):**
```
NEXT_PUBLIC_APP_URL=https://lician.com
NEXT_PUBLIC_API_URL=https://lician.com/api
NEXT_PUBLIC_SUPABASE_URL=https://wcckhqxkmhyzfpynthte.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_POSTHOG_KEY=phc_xxxxxxxxxxxx
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

**Runtime Variables:**
```
NODE_ENV=production
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxx
STRIPE_SECRET_KEY=sk_live_xxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxx
EODHD_API_KEY=your-key
FINANCIAL_DATASETS_API_KEY=your-key
FIRECRAWL_API_KEY=fc-xxxxxxxx
ELASTIC_EMAIL_API_KEY=your-key
CRON_SECRET=generate-random-string
```

### Step 5.4: Configure Domain

1. Go to **Domains** tab
2. Add: `lician.com`
3. Add: `www.lician.com` (optional)
4. SSL: Let Cloudflare handle it (or use Coolify's Let's Encrypt)

### Step 5.5: Deploy!

Click **"Deploy"** and wait for build to complete (~5-10 minutes first time).

---

## Phase 6: Verify Deployment

### Step 6.1: Check the Site

1. Visit `https://lician.com`
2. Test a few pages:
   - Homepage
   - `/stock/AAPL`
   - `/api/health` (if exists)

### Step 6.2: Test AI Chat

1. Open the AI chat
2. Ask: "What is Apple's current stock price?"
3. Verify response works

### Step 6.3: Check Logs

In Coolify:
1. Go to your app
2. Click **"Logs"** tab
3. Look for any errors

---

## Phase 7: Setup Auto-Deploy (Optional)

### Step 7.1: Get Coolify Webhook URL

1. In Coolify, go to your app → **Webhooks**
2. Copy the webhook URL

### Step 7.2: Add GitHub Secret

1. Go to GitHub repo → **Settings** → **Secrets** → **Actions**
2. Add new secret:
   - Name: `COOLIFY_WEBHOOK_URL`
   - Value: (paste the webhook URL)

### Step 7.3: Copy Workflow File

```bash
mkdir -p .github/workflows
cp migration-kit/.github/workflows/deploy-coolify.yml .github/workflows/
git add .github/workflows/deploy-coolify.yml
git commit -m "Add Coolify auto-deploy workflow"
git push
```

Now every push to `main` triggers a new deployment!

---

## Phase 8: Update Stripe Webhook (Important!)

### Step 8.1: Update Webhook URL

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Find your webhook
3. Update URL from `https://lician.com/api/stripe/webhook` to same (should still work)
4. Or create new webhook pointing to your Coolify domain

### Step 8.2: Update Webhook Secret

1. If you created a new webhook, copy the signing secret
2. Update `STRIPE_WEBHOOK_SECRET` in Coolify

---

## Phase 9: Cancel Vercel (After 1 Week)

Wait at least 1 week to ensure everything works, then:

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. **Settings** → **Billing**
3. Downgrade to Hobby or delete projects

---

## Troubleshooting

### Build Fails

1. Check Coolify build logs
2. Common issues:
   - Missing environment variable → Add it in Coolify
   - npm install fails → Check Node version (needs 20+)
   - OOM during build → Upgrade server temporarily

### Site Not Loading

1. Check Cloudflare DNS is proxied (orange cloud)
2. Check Coolify shows "Running"
3. Check nginx logs: `docker logs coolify-proxy`

### API Errors

1. Check environment variables are set correctly
2. Check Supabase connection is working
3. Check OpenRouter API key is valid

### WebSocket Issues

1. Ensure Cloudflare WebSocket is enabled (default: yes)
2. Check Coolify proxy allows WebSocket upgrades

---

## File Structure Reference

```
migration-kit/
├── Dockerfile                  # Production container
├── docker-compose.yml          # Local testing
├── MIGRATION_GUIDE.md          # This file
├── scripts/
│   ├── setup-hetzner.sh       # Server setup
│   └── apply-code-changes.sh   # Code modifications
├── configs/
│   └── coolify-env-example.txt # Environment variables
└── .github/workflows/
    └── deploy-coolify.yml      # Auto-deploy workflow
```

---

## Support

- Coolify Docs: https://coolify.io/docs
- Hetzner Docs: https://docs.hetzner.com
- Cloudflare Docs: https://developers.cloudflare.com

---

## Summary

| Step | Time | Status |
|------|------|--------|
| Create Hetzner Server | 10 min | ⬜ |
| Install Coolify | 5 min | ⬜ |
| Configure Cloudflare | 10 min | ⬜ |
| Apply Code Changes | 5 min | ⬜ |
| Deploy in Coolify | 10 min | ⬜ |
| Verify Deployment | 5 min | ⬜ |
| Setup Auto-Deploy | 5 min | ⬜ |
| Update Stripe Webhook | 5 min | ⬜ |
| **Total** | **~55 min** | |

**Monthly cost after migration: €6.47 (~$7) vs $20-250+ on Vercel**
