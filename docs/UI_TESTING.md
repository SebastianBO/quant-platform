# UI Testing Infrastructure (Jan 2026)

## Overview

Lician uses **Playwright** for automated UI testing and a custom **UI Audit Script** for continuous quality monitoring. The system supports Ralph loop iterative improvements.

## Quick Commands

```bash
# Run comprehensive UI audit
npx tsx scripts/ui-audit.ts

# Run Playwright tests
npx playwright test

# Run specific test file
npx playwright test tests/ui.spec.ts

# Run with UI (headed mode)
npx playwright test --headed

# View HTML report
npx playwright show-report
```

## UI Audit Script

Located at: `scripts/ui-audit.ts`

The audit script performs automated testing across 5 pages and 4 viewports (20 test combinations):

### Pages Audited
| Page | Path | Key Checks |
|------|------|------------|
| Homepage | `/` | Load time, console errors, mobile tap targets |
| Stock Page | `/stock/AAPL` | Data rendering, responsive tables |
| Compare Page | `/compare/aapl-vs-msft` | Chart loading, data fetching |
| Stock Screener | `/screener` | Query performance, filter responsiveness |
| Markets | `/markets` | Real-time data refresh |

### Viewports Tested
| Name | Width | Height | Use Case |
|------|-------|--------|----------|
| Desktop | 1920 | 1080 | Full experience |
| Laptop | 1440 | 900 | Common laptop |
| Tablet | 768 | 1024 | iPad portrait |
| Mobile | 375 | 812 | iPhone X |

### Issue Categories & Severity

| Severity | Color | Example Issues |
|----------|-------|----------------|
| Critical | Red | Page fails to load, HTTP 4xx/5xx |
| High | Orange | JavaScript errors, horizontal overflow |
| Medium | Yellow | Slow load (>5s), console errors, small tap targets |
| Low | Green | Multiple H1s, missing alt text |

### Output Files

```
tests/screenshots/audit/
├── AUDIT_SUMMARY.md      # Human-readable summary
├── audit-report.json     # Full JSON report for automation
├── homepage-desktop.png  # Full-page screenshots
├── homepage-mobile.png
├── stock-page-aapl-*.png
└── ... (20 screenshots total)
```

## Playwright Configuration

Located at: `playwright.config.ts`

```typescript
export default defineConfig({
  testDir: './tests',
  timeout: 60000,
  use: {
    baseURL: 'https://lician.com',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'Desktop Chrome', use: { ...devices['Desktop Chrome'] } },
    { name: 'Mobile Safari', use: { ...devices['iPhone 12'] } },
  ],
})
```

## Test Files

### `tests/ui.spec.ts` - Core UI Tests
- Homepage rendering and hero section
- Navigation and routing
- Stock page data display
- Mobile responsiveness
- Form interactions

### `tests/ai-chat.spec.ts` - AI Agent Tests
- Autonomous chat API endpoints
- Model selection and availability
- Tool execution (with rate limit handling)
- Streaming responses

## Issues Fixed (Jan 14, 2026)

### 1. Horizontal Overflow on Mobile
**Problem**: Stock pages had horizontal scroll on mobile devices.
**Fix**: Added `overflow-x: hidden` to body in `globals.css` and stock page wrapper.

### 2. Stripe CORS Console Errors
**Problem**: Next.js was prefetching `/api/stripe/quick-checkout` links causing CORS errors.
**Fix**: Added `prefetch={false}` to all Stripe checkout Link components.

### 3. Screener Slow Load Times
**Problem**: Screener page taking 15+ seconds to load.
**Fix**: Reduced query from 500 to 100 rows, select specific columns only instead of `SELECT *`.

### 4. False Positive Overflow Detection
**Problem**: Audit script flagged overflow even with `overflow-x: hidden` CSS.
**Fix**: Updated audit to check `getComputedStyle(body).overflowX` property.

## Ralph Loop Integration

The UI audit system integrates with the Ralph loop for iterative improvement:

```bash
# Start Ralph loop with UI audit completion promise
/ralph-loop "Fix UI issues on lician.com. Run npx tsx scripts/ui-audit.ts after fixes. Target page loads under 5 seconds, fix console errors, improve mobile tap targets." --completion-promise "UI_AUDIT_CLEAN"
```

**Completion Criteria**:
- 0 Critical issues
- 0 High issues
- All pages load under 5 seconds
- No JavaScript errors in console

## Performance Targets

| Metric | Target | Current (Jan 14) |
|--------|--------|------------------|
| Homepage Load | <3s | 3.8s |
| Stock Page Load | <3s | 2.9s |
| Screener Load | <5s | 6.5s |
| Compare Page Load | <5s | 2.5s |
| Markets Load | <4s | 3.3s |
| Console Errors | 0 | 1-5 per page |
| Mobile Tap Targets | All >44px | ~100 under |

## Troubleshooting

### Audit script fails to start
```bash
# Ensure Playwright browsers are installed
npx playwright install chromium
```

### Screenshots not capturing
```bash
# Check screenshot directory exists
mkdir -p tests/screenshots/audit
```

### False positives for overflow
The audit now checks `getComputedStyle(body).overflowX` - if set to 'hidden', overflow is not flagged even if `scrollWidth > clientWidth`.

## Environment Variables

```bash
# Override test URL (default: https://lician.com)
TEST_URL=http://localhost:3000 npx tsx scripts/ui-audit.ts
```
