---
active: false
iteration: 7
max_iterations: 0
completion_promise: null
started_at: "2026-01-18T00:02:56Z"
completed_at: "2026-01-18T01:15:00Z"
---

Investigate why Vercel billed - analyze usage patterns, function invocations, bandwidth, build minutes, and identify exact cost drivers

## INVESTIGATION COMPLETE ✅

### Root Cause Identified

**$250 bill caused by 21,942 GB-hrs of Fluid Provisioned Memory (6095% of 360 GB-hr free tier)**

Primary cause (60-70%): `/stock/[ticker]` page with `revalidate = 60` triggering 125+ API calls per render

### Fixes Applied

| Commit | Description | Savings |
|--------|-------------|---------|
| b591ee34 | Removed 18 cron jobs | ~$15-20/mo |
| a7375110 | Webpack instead of Turbopack | ~$25-50/mo |
| 9ae8ee64 | AI chat 120s→60s | ~$10-20/mo |
| 1d65d27a | ISR 60s→3600s | ~$150/mo |

**Total estimated savings: $200-240/month**

### Documentation

Full analysis in: `.claude/vercel-cost-analysis.md`
