/**
 * Google Analytics 4 Enhanced Tracking Library
 *
 * Tracks user behavior, conversions, and custom events for lician.com
 */

// Extend window type for gtag
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
    dataLayer?: unknown[]
  }
}

// Event categories for organization
export const EventCategory = {
  ENGAGEMENT: 'engagement',
  CONVERSION: 'conversion',
  ECOMMERCE: 'ecommerce',
  AI: 'ai_research',
  TOOLS: 'tools',
  AUTH: 'authentication',
  NAVIGATION: 'navigation',
} as const

// User properties for segmentation
export interface UserProperties {
  user_id?: string
  is_premium?: boolean
  is_authenticated?: boolean
  subscription_tier?: 'free' | 'monthly' | 'annual'
  signup_date?: string
  total_queries?: number
}

// Stock event parameters
export interface StockEventParams {
  ticker: string
  company_name?: string
  sector?: string
  market_cap?: number
  price?: number
}

// AI query parameters
export interface AIQueryParams {
  query: string
  model: string
  model_tier: 'fast' | 'standard' | 'premium'
  response_time_ms?: number
  tools_used?: string[]
  success: boolean
}

// Tool usage parameters
export interface ToolUsageParams {
  tool_name: string
  ticker?: string
  parameters?: Record<string, unknown>
}

/**
 * Check if analytics is available
 */
function isAnalyticsAvailable(): boolean {
  return typeof window !== 'undefined' && typeof window.gtag === 'function'
}

/**
 * Track a custom event
 */
export function trackEvent(
  eventName: string,
  params?: Record<string, unknown>
): void {
  if (!isAnalyticsAvailable()) return

  window.gtag!('event', eventName, {
    ...params,
    send_to: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
  })
}

/**
 * Set user properties for segmentation
 */
export function setUserProperties(properties: UserProperties): void {
  if (!isAnalyticsAvailable()) return

  window.gtag!('set', 'user_properties', properties)

  // Also set user_id if available
  if (properties.user_id) {
    window.gtag!('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID!, {
      user_id: properties.user_id,
    })
  }
}

/**
 * Track page view with enhanced data
 */
export function trackPageView(
  path: string,
  title?: string,
  params?: Record<string, unknown>
): void {
  if (!isAnalyticsAvailable()) return

  window.gtag!('event', 'page_view', {
    page_path: path,
    page_title: title,
    page_location: window.location.href,
    ...params,
  })
}

// ============================================
// STOCK & RESEARCH EVENTS
// ============================================

/**
 * Track stock page view
 */
export function trackStockView(params: StockEventParams): void {
  trackEvent('view_stock', {
    event_category: EventCategory.ENGAGEMENT,
    ticker: params.ticker.toUpperCase(),
    company_name: params.company_name,
    sector: params.sector,
    market_cap: params.market_cap,
    stock_price: params.price,
  })
}

/**
 * Track stock search
 */
export function trackStockSearch(query: string, resultsCount: number): void {
  trackEvent('search', {
    event_category: EventCategory.ENGAGEMENT,
    search_term: query,
    results_count: resultsCount,
  })
}

/**
 * Track stock comparison
 */
export function trackStockCompare(tickers: string[]): void {
  trackEvent('compare_stocks', {
    event_category: EventCategory.TOOLS,
    tickers: tickers.join(','),
    comparison_count: tickers.length,
  })
}

// ============================================
// AI RESEARCH EVENTS
// ============================================

/**
 * Track AI query submitted
 */
export function trackAIQueryStart(params: Omit<AIQueryParams, 'success' | 'response_time_ms'>): void {
  trackEvent('ai_query_start', {
    event_category: EventCategory.AI,
    query_length: params.query.length,
    model: params.model,
    model_tier: params.model_tier,
  })
}

/**
 * Track AI query completed
 */
export function trackAIQueryComplete(params: AIQueryParams): void {
  trackEvent('ai_query_complete', {
    event_category: EventCategory.AI,
    model: params.model,
    model_tier: params.model_tier,
    response_time_ms: params.response_time_ms,
    tools_used: params.tools_used?.join(','),
    success: params.success,
  })
}

/**
 * Track AI tool usage during research
 */
export function trackAIToolUsage(toolName: string, ticker?: string): void {
  trackEvent('ai_tool_used', {
    event_category: EventCategory.AI,
    tool_name: toolName,
    ticker: ticker?.toUpperCase(),
  })
}

// ============================================
// TOOL USAGE EVENTS
// ============================================

/**
 * Track DCF calculator usage
 */
export function trackDCFCalculation(ticker: string, intrinsicValue?: number): void {
  trackEvent('dcf_calculation', {
    event_category: EventCategory.TOOLS,
    ticker: ticker.toUpperCase(),
    intrinsic_value: intrinsicValue,
  })
}

/**
 * Track screener usage
 */
export function trackScreenerUsage(filters: Record<string, unknown>, resultsCount: number): void {
  trackEvent('screener_used', {
    event_category: EventCategory.TOOLS,
    filter_count: Object.keys(filters).length,
    results_count: resultsCount,
  })
}

/**
 * Track portfolio connection
 */
export function trackPortfolioConnect(broker?: string): void {
  trackEvent('portfolio_connect', {
    event_category: EventCategory.TOOLS,
    broker: broker,
  })
}

/**
 * Track widget embed (for backlink tracking)
 */
export function trackWidgetEmbed(ticker: string, domain: string): void {
  trackEvent('widget_embed', {
    event_category: EventCategory.ENGAGEMENT,
    ticker: ticker.toUpperCase(),
    embed_domain: domain,
  })
}

// ============================================
// AUTHENTICATION EVENTS
// ============================================

/**
 * Track signup
 */
export function trackSignup(method: 'email' | 'google' | 'github'): void {
  trackEvent('sign_up', {
    event_category: EventCategory.AUTH,
    method: method,
  })
}

/**
 * Track login
 */
export function trackLogin(method: 'email' | 'google' | 'github'): void {
  trackEvent('login', {
    event_category: EventCategory.AUTH,
    method: method,
  })
}

/**
 * Track logout
 */
export function trackLogout(): void {
  trackEvent('logout', {
    event_category: EventCategory.AUTH,
  })
}

// ============================================
// CONVERSION & ECOMMERCE EVENTS
// ============================================

/**
 * Track checkout initiation
 */
export function trackBeginCheckout(plan: 'monthly' | 'annual', value: number): void {
  trackEvent('begin_checkout', {
    event_category: EventCategory.ECOMMERCE,
    currency: 'USD',
    value: value,
    items: [{
      item_id: `premium_${plan}`,
      item_name: `Lician Premium ${plan.charAt(0).toUpperCase() + plan.slice(1)}`,
      item_category: 'subscription',
      price: value,
      quantity: 1,
    }],
  })
}

/**
 * Track successful purchase
 */
export function trackPurchase(
  transactionId: string,
  plan: 'monthly' | 'annual',
  value: number
): void {
  trackEvent('purchase', {
    event_category: EventCategory.ECOMMERCE,
    transaction_id: transactionId,
    currency: 'USD',
    value: value,
    items: [{
      item_id: `premium_${plan}`,
      item_name: `Lician Premium ${plan.charAt(0).toUpperCase() + plan.slice(1)}`,
      item_category: 'subscription',
      price: value,
      quantity: 1,
    }],
  })
}

/**
 * Track subscription upgrade prompt shown
 */
export function trackUpgradePrompt(trigger: string): void {
  trackEvent('upgrade_prompt_shown', {
    event_category: EventCategory.CONVERSION,
    trigger: trigger,
  })
}

/**
 * Track CTA click
 */
export function trackCTAClick(ctaName: string, location: string): void {
  trackEvent('cta_click', {
    event_category: EventCategory.CONVERSION,
    cta_name: ctaName,
    cta_location: location,
  })
}

// ============================================
// ENGAGEMENT EVENTS
// ============================================

/**
 * Track scroll depth
 */
export function trackScrollDepth(depth: 25 | 50 | 75 | 100): void {
  trackEvent('scroll', {
    event_category: EventCategory.ENGAGEMENT,
    percent_scrolled: depth,
  })
}

/**
 * Track time on page
 */
export function trackTimeOnPage(seconds: number): void {
  trackEvent('engaged_time', {
    event_category: EventCategory.ENGAGEMENT,
    engagement_time_sec: seconds,
  })
}

/**
 * Track share action
 */
export function trackShare(method: string, contentType: string, itemId: string): void {
  trackEvent('share', {
    event_category: EventCategory.ENGAGEMENT,
    method: method,
    content_type: contentType,
    item_id: itemId,
  })
}

/**
 * Track external link click
 */
export function trackOutboundLink(url: string, linkText?: string): void {
  trackEvent('click', {
    event_category: EventCategory.NAVIGATION,
    link_url: url,
    link_text: linkText,
    outbound: true,
  })
}

// ============================================
// ERROR TRACKING
// ============================================

/**
 * Track errors for debugging
 */
export function trackError(
  errorType: string,
  errorMessage: string,
  fatal: boolean = false
): void {
  trackEvent('exception', {
    description: `${errorType}: ${errorMessage}`,
    fatal: fatal,
  })
}

// ============================================
// UTILITY: Initialize user on auth
// ============================================

/**
 * Initialize analytics for authenticated user
 */
export function initializeUserAnalytics(
  userId: string,
  isPremium: boolean,
  subscriptionTier?: 'free' | 'monthly' | 'annual'
): void {
  setUserProperties({
    user_id: userId,
    is_premium: isPremium,
    is_authenticated: true,
    subscription_tier: subscriptionTier || 'free',
  })
}

/**
 * Clear user analytics on logout
 */
export function clearUserAnalytics(): void {
  setUserProperties({
    user_id: undefined,
    is_premium: false,
    is_authenticated: false,
    subscription_tier: 'free',
  })
}
