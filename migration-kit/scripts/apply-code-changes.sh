#!/bin/bash
#
# Apply Code Changes for Self-Hosting
# Run this in the quant-platform directory
#
# Usage: ./migration-kit/scripts/apply-code-changes.sh

set -e

echo "=========================================="
echo "  Applying Self-Hosting Code Changes"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}Error: Run this from the quant-platform root directory${NC}"
    exit 1
fi

echo -e "${GREEN}[1/5] Adding standalone output to next.config.ts...${NC}"
# Add output: 'standalone' if not present
if ! grep -q "output:" next.config.ts; then
    sed -i.bak "s/const nextConfig: NextConfig = {/const nextConfig: NextConfig = {\n  \/\/ Enable standalone output for Docker deployment\n  output: 'standalone',\n/" next.config.ts
    echo "  Added output: 'standalone'"
else
    echo "  Already has output config"
fi

echo -e "${GREEN}[2/5] Removing @vercel/analytics from layout.tsx...${NC}"
# Remove Vercel analytics import and usage
if grep -q "@vercel/analytics" src/app/layout.tsx; then
    sed -i.bak '/@vercel\/analytics/d' src/app/layout.tsx
    sed -i.bak '/<Analytics/d' src/app/layout.tsx
    echo "  Removed @vercel/analytics"
else
    echo "  @vercel/analytics already removed"
fi

echo -e "${GREEN}[3/5] Removing edge runtime from OG image routes...${NC}"
# Remove runtime = 'edge' from OG routes
for file in src/app/api/og/*/route.tsx src/app/api/og/*/*/route.tsx; do
    if [ -f "$file" ]; then
        if grep -q "runtime = 'edge'" "$file"; then
            sed -i.bak "/export const runtime = 'edge'/d" "$file"
            echo "  Removed edge runtime from $file"
        fi
    fi
done

echo -e "${GREEN}[4/5] Creating OpenRouter provider file...${NC}"
# Create OpenRouter provider for AI
mkdir -p src/lib/ai/providers
cat > src/lib/ai/providers/openrouter.ts << 'EOF'
/**
 * OpenRouter Provider for AI Models
 * Replaces Vercel AI Gateway for self-hosted deployments
 *
 * Models available via OpenRouter:
 * - openai/gpt-4o
 * - openai/gpt-4o-mini
 * - anthropic/claude-3.5-sonnet
 * - anthropic/claude-sonnet-4
 * - meta-llama/llama-3.3-70b
 * - google/gemini-2.0-flash
 */

import { createOpenAI } from '@ai-sdk/openai'

// Create OpenRouter client (OpenAI-compatible API)
export const openrouter = createOpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY ?? '',
  headers: {
    'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL ?? 'https://lician.com',
    'X-Title': 'Lician - AI Stock Research',
  },
})

// Model mapping (same IDs work on OpenRouter)
export const OPENROUTER_MODELS = {
  // Premium tier
  'gpt-4o': 'openai/gpt-4o',
  'claude-sonnet-4': 'anthropic/claude-sonnet-4',

  // Standard tier
  'gpt-4o-mini': 'openai/gpt-4o-mini',
  'claude-3-5-sonnet': 'anthropic/claude-3.5-sonnet',
  'llama-3.3-70b': 'meta-llama/llama-3.3-70b-instruct',

  // Fast tier
  'gemini-flash': 'google/gemini-2.0-flash-exp',
} as const

export type ModelKey = keyof typeof OPENROUTER_MODELS

export function getModel(key: ModelKey) {
  return openrouter(OPENROUTER_MODELS[key])
}
EOF
echo "  Created src/lib/ai/providers/openrouter.ts"

echo -e "${GREEN}[5/5] Creating environment template...${NC}"
cat > .env.production.template << 'EOF'
# =============================================================================
# Quant Platform - Production Environment Variables
# Copy this to .env.production and fill in your values
# =============================================================================

# -----------------------------------------------------------------------------
# Public Variables (embedded in client bundle)
# -----------------------------------------------------------------------------
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_API_URL=https://your-domain.com/api

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_POSTHOG_KEY=phc_xxxxxxxxxxxx
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com

# -----------------------------------------------------------------------------
# Server Variables (not exposed to client)
# -----------------------------------------------------------------------------

# Supabase Admin
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# AI Provider (OpenRouter replaces Vercel AI Gateway)
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxx

# Payment
STRIPE_SECRET_KEY=sk_live_xxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxx

# Market Data
EODHD_API_KEY=your-eodhd-key
FINANCIAL_DATASETS_API_KEY=your-fd-key

# Web Research
FIRECRAWL_API_KEY=fc-xxxxxxxx

# Email
ELASTIC_EMAIL_API_KEY=your-elastic-email-key

# Cron Jobs (for pg_cron authentication)
CRON_SECRET=generate-a-random-secret

# Redis (optional - if self-hosting instead of Upstash)
# REDIS_URL=redis://localhost:6379

# -----------------------------------------------------------------------------
# Coolify will inject these automatically:
# - PORT (default 3000)
# - NODE_ENV (production)
# -----------------------------------------------------------------------------
EOF
echo "  Created .env.production.template"

echo ""
echo -e "${GREEN}=========================================="
echo "  Code Changes Complete!"
echo "==========================================${NC}"
echo ""
echo "Next steps:"
echo "1. Review the changes: git diff"
echo "2. Install OpenRouter SDK: npm install @ai-sdk/openai"
echo "3. Update chat routes to use OpenRouter provider"
echo "4. Copy .env.production.template to .env.production"
echo "5. Commit and push to trigger deployment"
echo ""

# Clean up backup files
find . -name "*.bak" -delete 2>/dev/null || true
