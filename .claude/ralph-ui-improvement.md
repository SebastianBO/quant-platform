# Ralph Loop: UI Improvement Cycle

## Objective
Iteratively improve lician.com UI/UX using Playwright testing and automated fixes.

## Current Audit Results
Read the latest audit at: `tests/screenshots/audit/AUDIT_SUMMARY.md`

## Priority Issues (from latest audit)

### 🔴 Critical
- None

### 🟠 High Priority
1. **Console Errors** - 9 errors on homepage, need to investigate and fix
2. **Horizontal Overflow** - Mobile view (375px) has 432px content causing scroll
3. **Slow Page Loads** - Compare page: 10.9s, Screener: 7.9s (target: <5s)

### 🟡 Medium Priority
1. **Small Tap Targets** - 34-168 elements smaller than 44x44px on mobile
2. **Multiple H1 Tags** - SEO issue, pages have 2 H1 headings
3. **Additional Console Errors** - Various pages have 1-5 errors

## Iteration Process

For each iteration:

1. **Read Current State**
   - Read `tests/screenshots/audit/AUDIT_SUMMARY.md`
   - Identify the highest priority unfixed issue

2. **Investigate**
   - Use Playwright to capture console errors
   - Take screenshots of the problem
   - Read relevant source files

3. **Fix**
   - Make the minimal change to fix the issue
   - Prefer CSS/Tailwind fixes for visual issues
   - Prefer code optimization for performance

4. **Verify**
   - Run: `npx tsx scripts/ui-audit.ts`
   - Check if the issue is resolved
   - Document what was fixed

5. **Commit**
   - Commit the fix with clear message
   - Push to deploy

## Commands

```bash
# Run UI audit
npx tsx scripts/ui-audit.ts

# Run specific Playwright tests
npx playwright test tests/ui.spec.ts

# View screenshots
open tests/screenshots/audit/
```

## Completion Criteria

Output `<promise>UI_AUDIT_CLEAN</promise>` when:
- No critical issues
- No high priority issues
- All pages load under 5 seconds
- No horizontal overflow on mobile
- Console errors reduced to acceptable level (<3 per page)

## Files to Monitor

- `tests/screenshots/audit/AUDIT_SUMMARY.md` - Latest audit results
- `tests/screenshots/audit/*.png` - Visual screenshots
- `src/components/` - Component files
- `src/app/` - Page files
