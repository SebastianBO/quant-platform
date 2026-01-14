/**
 * UI Audit Script for Ralph Loop
 *
 * This script performs comprehensive UI testing and generates a report
 * that can be used to iteratively improve the UI.
 *
 * Usage: npx tsx scripts/ui-audit.ts
 */

import { chromium, Browser, Page } from 'playwright'
import * as fs from 'fs'
import * as path from 'path'

const BASE_URL = process.env.TEST_URL || 'https://lician.com'
const SCREENSHOT_DIR = 'tests/screenshots/audit'

interface AuditResult {
  timestamp: string
  url: string
  viewport: { width: number; height: number }
  metrics: {
    loadTime: number
    domContentLoaded: number
    firstPaint?: number
    largestContentfulPaint?: number
  }
  issues: AuditIssue[]
  screenshots: string[]
  consoleErrors: string[]
  accessibilityScore?: number
}

interface AuditIssue {
  type: 'error' | 'warning' | 'suggestion'
  category: 'performance' | 'accessibility' | 'seo' | 'mobile' | 'ux' | 'visual'
  message: string
  element?: string
  severity: 'critical' | 'high' | 'medium' | 'low'
}

const PAGES_TO_AUDIT = [
  { path: '/', name: 'Homepage' },
  { path: '/stock/AAPL', name: 'Stock Page (AAPL)' },
  { path: '/compare/aapl-vs-msft', name: 'Compare Page' },
  { path: '/screener', name: 'Stock Screener' },
  { path: '/markets', name: 'Markets' },
]

const VIEWPORTS = [
  { name: 'desktop', width: 1920, height: 1080 },
  { name: 'laptop', width: 1440, height: 900 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 375, height: 812 },
]

async function runAudit(): Promise<void> {
  console.log('🔍 Starting UI Audit...\n')

  // Create screenshot directory
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true })
  }

  const browser = await chromium.launch({ headless: true })
  const allResults: AuditResult[] = []

  try {
    for (const pageConfig of PAGES_TO_AUDIT) {
      console.log(`\n📄 Auditing: ${pageConfig.name} (${pageConfig.path})`)

      for (const viewport of VIEWPORTS) {
        const result = await auditPage(browser, pageConfig, viewport)
        allResults.push(result)

        // Print summary
        const issueCount = result.issues.length
        const errorCount = result.issues.filter(i => i.type === 'error').length
        console.log(`   ${viewport.name}: ${result.metrics.loadTime}ms load, ${issueCount} issues (${errorCount} errors)`)
      }
    }

    // Generate report
    const report = generateReport(allResults)
    const reportPath = path.join(SCREENSHOT_DIR, 'audit-report.json')
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))

    // Generate markdown summary
    const summary = generateMarkdownSummary(allResults)
    const summaryPath = path.join(SCREENSHOT_DIR, 'AUDIT_SUMMARY.md')
    fs.writeFileSync(summaryPath, summary)

    console.log('\n✅ Audit complete!')
    console.log(`📊 Report: ${reportPath}`)
    console.log(`📝 Summary: ${summaryPath}`)

    // Print critical issues
    const criticalIssues = allResults.flatMap(r => r.issues.filter(i => i.severity === 'critical'))
    if (criticalIssues.length > 0) {
      console.log('\n🚨 CRITICAL ISSUES:')
      criticalIssues.forEach(issue => {
        console.log(`   - [${issue.category}] ${issue.message}`)
      })
    }

  } finally {
    await browser.close()
  }
}

async function auditPage(
  browser: Browser,
  pageConfig: { path: string; name: string },
  viewport: { name: string; width: number; height: number }
): Promise<AuditResult> {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
  })
  const page = await context.newPage()
  const issues: AuditIssue[] = []
  const consoleErrors: string[] = []
  const screenshots: string[] = []

  // Capture console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text())
    }
  })

  // Capture page errors
  page.on('pageerror', error => {
    consoleErrors.push(error.message)
    issues.push({
      type: 'error',
      category: 'ux',
      message: `JavaScript error: ${error.message}`,
      severity: 'high',
    })
  })

  const startTime = Date.now()
  let domContentLoaded = 0
  let loadTime = 0

  try {
    // Navigate and measure timing
    const response = await page.goto(`${BASE_URL}${pageConfig.path}`, {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    })
    domContentLoaded = Date.now() - startTime

    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {})
    loadTime = Date.now() - startTime

    // Check response status
    if (response && response.status() >= 400) {
      issues.push({
        type: 'error',
        category: 'ux',
        message: `Page returned HTTP ${response.status()}`,
        severity: 'critical',
      })
    }

    // Performance checks
    if (loadTime > 5000) {
      issues.push({
        type: 'warning',
        category: 'performance',
        message: `Slow page load: ${loadTime}ms (target: <5000ms)`,
        severity: loadTime > 10000 ? 'high' : 'medium',
      })
    }

    // Check for missing title
    const title = await page.title()
    if (!title || title.length < 10) {
      issues.push({
        type: 'warning',
        category: 'seo',
        message: 'Page title is missing or too short',
        severity: 'medium',
      })
    }

    // Check for h1
    const h1Count = await page.locator('h1').count()
    if (h1Count === 0) {
      issues.push({
        type: 'warning',
        category: 'seo',
        message: 'No H1 heading found on page',
        severity: 'medium',
      })
    } else if (h1Count > 1) {
      issues.push({
        type: 'suggestion',
        category: 'seo',
        message: `Multiple H1 headings found (${h1Count})`,
        severity: 'low',
      })
    }

    // Check images for alt text
    const imagesWithoutAlt = await page.locator('img:not([alt]), img[alt=""]').count()
    if (imagesWithoutAlt > 0) {
      issues.push({
        type: 'warning',
        category: 'accessibility',
        message: `${imagesWithoutAlt} images missing alt text`,
        severity: 'medium',
      })
    }

    // Check for horizontal overflow (mobile)
    if (viewport.width <= 768) {
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth)
      if (bodyWidth > viewport.width + 10) {
        issues.push({
          type: 'error',
          category: 'mobile',
          message: `Horizontal overflow detected (${bodyWidth}px > ${viewport.width}px)`,
          severity: 'high',
        })
      }
    }

    // Check for tap targets on mobile
    if (viewport.width <= 768) {
      const smallButtons = await page.evaluate(() => {
        const buttons = document.querySelectorAll('button, a, [role="button"]')
        let smallCount = 0
        buttons.forEach(btn => {
          const rect = btn.getBoundingClientRect()
          if (rect.width > 0 && rect.height > 0 && (rect.width < 44 || rect.height < 44)) {
            smallCount++
          }
        })
        return smallCount
      })
      if (smallButtons > 5) {
        issues.push({
          type: 'warning',
          category: 'mobile',
          message: `${smallButtons} tap targets smaller than 44x44px`,
          severity: 'medium',
        })
      }
    }

    // Check for console errors
    const filteredErrors = consoleErrors.filter(e =>
      !e.includes('favicon') &&
      !e.includes('analytics') &&
      !e.includes('third-party')
    )
    if (filteredErrors.length > 0) {
      issues.push({
        type: 'error',
        category: 'ux',
        message: `${filteredErrors.length} console errors detected`,
        severity: filteredErrors.length > 5 ? 'high' : 'medium',
      })
    }

    // Check for broken links (sample)
    const links = await page.locator('a[href^="/"]').all()
    const sampleLinks = links.slice(0, 5)
    for (const link of sampleLinks) {
      const href = await link.getAttribute('href')
      if (href) {
        try {
          const linkResponse = await page.request.head(`${BASE_URL}${href}`)
          if (linkResponse.status() >= 400) {
            issues.push({
              type: 'warning',
              category: 'ux',
              message: `Broken link: ${href} (${linkResponse.status()})`,
              element: href,
              severity: 'medium',
            })
          }
        } catch {
          // Skip if request fails
        }
      }
    }

    // Take screenshot
    const screenshotName = `${pageConfig.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${viewport.name}.png`
    const screenshotPath = path.join(SCREENSHOT_DIR, screenshotName)
    await page.screenshot({ path: screenshotPath, fullPage: true })
    screenshots.push(screenshotPath)

  } catch (error) {
    issues.push({
      type: 'error',
      category: 'ux',
      message: `Page failed to load: ${error instanceof Error ? error.message : 'Unknown error'}`,
      severity: 'critical',
    })
    loadTime = Date.now() - startTime
  }

  await context.close()

  return {
    timestamp: new Date().toISOString(),
    url: `${BASE_URL}${pageConfig.path}`,
    viewport: { width: viewport.width, height: viewport.height },
    metrics: {
      loadTime,
      domContentLoaded,
    },
    issues,
    screenshots,
    consoleErrors,
  }
}

function generateReport(results: AuditResult[]): object {
  const totalIssues = results.flatMap(r => r.issues)
  const issuesByCategory: Record<string, number> = {}
  const issuesBySeverity: Record<string, number> = {}

  totalIssues.forEach(issue => {
    issuesByCategory[issue.category] = (issuesByCategory[issue.category] || 0) + 1
    issuesBySeverity[issue.severity] = (issuesBySeverity[issue.severity] || 0) + 1
  })

  return {
    summary: {
      timestamp: new Date().toISOString(),
      pagesAudited: PAGES_TO_AUDIT.length,
      viewportsTested: VIEWPORTS.length,
      totalTests: results.length,
      totalIssues: totalIssues.length,
      issuesByCategory,
      issuesBySeverity,
    },
    results,
  }
}

function generateMarkdownSummary(results: AuditResult[]): string {
  const totalIssues = results.flatMap(r => r.issues)
  const criticalCount = totalIssues.filter(i => i.severity === 'critical').length
  const highCount = totalIssues.filter(i => i.severity === 'high').length
  const mediumCount = totalIssues.filter(i => i.severity === 'medium').length
  const lowCount = totalIssues.filter(i => i.severity === 'low').length

  let md = `# UI Audit Report

**Generated:** ${new Date().toISOString()}
**Base URL:** ${BASE_URL}

## Summary

| Metric | Value |
|--------|-------|
| Pages Audited | ${PAGES_TO_AUDIT.length} |
| Viewports Tested | ${VIEWPORTS.length} |
| Total Issues | ${totalIssues.length} |
| Critical | ${criticalCount} |
| High | ${highCount} |
| Medium | ${mediumCount} |
| Low | ${lowCount} |

## Issues by Page

`

  for (const pageConfig of PAGES_TO_AUDIT) {
    const pageResults = results.filter(r => r.url.includes(pageConfig.path))
    const pageIssues = pageResults.flatMap(r => r.issues)

    md += `### ${pageConfig.name}\n\n`

    if (pageIssues.length === 0) {
      md += `✅ No issues found\n\n`
    } else {
      md += `| Severity | Category | Issue |\n|----------|----------|-------|\n`
      pageIssues.forEach(issue => {
        const emoji = issue.severity === 'critical' ? '🔴' :
                     issue.severity === 'high' ? '🟠' :
                     issue.severity === 'medium' ? '🟡' : '🟢'
        md += `| ${emoji} ${issue.severity} | ${issue.category} | ${issue.message} |\n`
      })
      md += '\n'
    }

    // Add performance metrics
    const avgLoadTime = pageResults.reduce((sum, r) => sum + r.metrics.loadTime, 0) / pageResults.length
    md += `**Avg Load Time:** ${Math.round(avgLoadTime)}ms\n\n`
  }

  md += `## Recommendations

Based on the audit, here are the top priorities:

`

  // Add prioritized recommendations
  const criticalIssues = totalIssues.filter(i => i.severity === 'critical')
  const highIssues = totalIssues.filter(i => i.severity === 'high')

  if (criticalIssues.length > 0) {
    md += `### 🔴 Critical (Fix Immediately)\n\n`
    criticalIssues.forEach(issue => {
      md += `- **[${issue.category}]** ${issue.message}\n`
    })
    md += '\n'
  }

  if (highIssues.length > 0) {
    md += `### 🟠 High Priority\n\n`
    highIssues.forEach(issue => {
      md += `- **[${issue.category}]** ${issue.message}\n`
    })
    md += '\n'
  }

  return md
}

// Run the audit
runAudit().catch(console.error)
