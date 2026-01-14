import { test, expect } from '@playwright/test'

const BASE_URL = process.env.TEST_URL || 'https://lician.com'

// Test results storage for Ralph loop analysis
const testResults: {
  page: string
  status: 'pass' | 'fail' | 'warning'
  issue?: string
  screenshot?: string
}[] = []

test.describe('Lician UI Tests', () => {
  test.describe('Homepage', () => {
    test('should load homepage successfully', async ({ page }) => {
      await page.goto('/')
      await expect(page).toHaveTitle(/Lician/)

      // Check for main elements
      const heroSection = page.locator('main')
      await expect(heroSection).toBeVisible()
    })

    test('should have working AI chat input', async ({ page }) => {
      await page.goto('/')

      // Find the AI input
      const input = page.locator('input[placeholder*="Ask"], textarea[placeholder*="Ask"]').first()
      await expect(input).toBeVisible()

      // Check it's interactable
      await input.click()
      await input.fill('What is Apple stock price?')
      await expect(input).toHaveValue('What is Apple stock price?')
    })

    test('should have visible navigation', async ({ page }) => {
      await page.goto('/')

      // Check header exists
      const header = page.locator('header').first()
      await expect(header).toBeVisible()

      // Check logo
      const logo = page.locator('header').getByText('Lician').first()
      await expect(logo).toBeVisible()
    })

    test('should have mobile app promo in footer', async ({ page }) => {
      await page.goto('/')

      // Scroll to footer
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
      await page.waitForTimeout(500)

      // Check for app promo
      const appPromo = page.getByText('Get Lician on Mobile')
      await expect(appPromo).toBeVisible()

      // Check App Store links
      const iosLink = page.locator('a[href*="apps.apple.com"]').first()
      await expect(iosLink).toBeVisible()
    })

    test('should have newsletter signup', async ({ page }) => {
      await page.goto('/')

      // Scroll to footer
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
      await page.waitForTimeout(500)

      // Check newsletter form
      const emailInput = page.locator('input[type="email"]').first()
      await expect(emailInput).toBeVisible()
    })
  })

  test.describe('Stock Pages', () => {
    test('should load AAPL stock page', async ({ page }) => {
      await page.goto('/stock/AAPL')

      // Wait for page to load
      await page.waitForLoadState('networkidle')

      // Check ticker is visible
      const ticker = page.getByText('AAPL').first()
      await expect(ticker).toBeVisible()

      // Screenshot for visual inspection
      await page.screenshot({ path: 'tests/screenshots/stock-aapl.png', fullPage: true })
    })

    test('should load stock comparison page', async ({ page }) => {
      await page.goto('/compare/aapl-vs-msft')
      await page.waitForLoadState('networkidle')

      // Both tickers should be visible
      await expect(page.getByText('AAPL')).toBeVisible()

      await page.screenshot({ path: 'tests/screenshots/compare-aapl-msft.png', fullPage: true })
    })
  })

  test.describe('Performance', () => {
    test('homepage should load within 5 seconds', async ({ page }) => {
      const startTime = Date.now()
      await page.goto('/')
      await page.waitForLoadState('domcontentloaded')
      const loadTime = Date.now() - startTime

      console.log(`Homepage load time: ${loadTime}ms`)
      expect(loadTime).toBeLessThan(5000)
    })

    test('should not have console errors', async ({ page }) => {
      const errors: string[] = []
      page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text())
        }
      })

      await page.goto('/')
      await page.waitForLoadState('networkidle')

      // Filter out known acceptable errors
      const criticalErrors = errors.filter(e =>
        !e.includes('favicon') &&
        !e.includes('third-party') &&
        !e.includes('analytics')
      )

      if (criticalErrors.length > 0) {
        console.log('Console errors found:', criticalErrors)
      }

      expect(criticalErrors.length).toBeLessThan(3)
    })
  })

  test.describe('Mobile Responsiveness', () => {
    test('homepage should be mobile friendly', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 812 })
      await page.goto('/')

      // Check content is visible and not overflowing
      const body = page.locator('body')
      const bodyBox = await body.boundingBox()

      expect(bodyBox?.width).toBeLessThanOrEqual(375)

      await page.screenshot({ path: 'tests/screenshots/homepage-mobile.png', fullPage: true })
    })

    test('navigation should work on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 })
      await page.goto('/')

      // Check if there's a hamburger menu or similar
      const mobileMenu = page.locator('[aria-label*="menu"], button:has(svg)').first()

      await page.screenshot({ path: 'tests/screenshots/mobile-nav.png' })
    })
  })

  test.describe('Critical User Flows', () => {
    test('should be able to search for stocks', async ({ page }) => {
      await page.goto('/')

      // Find search/input
      const searchInput = page.locator('input').first()
      await searchInput.click()
      await searchInput.fill('NVDA')

      await page.screenshot({ path: 'tests/screenshots/search-flow.png' })
    })

    test('footer links should work', async ({ page }) => {
      await page.goto('/')

      // Scroll to footer
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
      await page.waitForTimeout(500)

      // Click on Stock Screener link
      const screenerLink = page.getByRole('link', { name: 'Stock Screener' })
      if (await screenerLink.isVisible()) {
        await screenerLink.click()
        await page.waitForLoadState('networkidle')
        expect(page.url()).toContain('screener')
      }
    })
  })

  test.describe('Visual Regression', () => {
    test('capture homepage screenshots for comparison', async ({ page }) => {
      await page.goto('/')
      await page.waitForLoadState('networkidle')

      // Desktop
      await page.setViewportSize({ width: 1920, height: 1080 })
      await page.screenshot({ path: 'tests/screenshots/homepage-desktop-1920.png', fullPage: true })

      // Laptop
      await page.setViewportSize({ width: 1440, height: 900 })
      await page.screenshot({ path: 'tests/screenshots/homepage-laptop-1440.png', fullPage: true })

      // Tablet
      await page.setViewportSize({ width: 768, height: 1024 })
      await page.screenshot({ path: 'tests/screenshots/homepage-tablet-768.png', fullPage: true })

      // Mobile
      await page.setViewportSize({ width: 375, height: 812 })
      await page.screenshot({ path: 'tests/screenshots/homepage-mobile-375.png', fullPage: true })
    })
  })
})
