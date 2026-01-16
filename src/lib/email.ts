import { Resend } from 'resend'
import * as brevo from '@getbrevo/brevo'
import * as ElasticEmail from '@elasticemail/elasticemail-client'
import { logger } from '@/lib/logger'

// Email provider type
type EmailProvider = 'elastic' | 'brevo' | 'resend'

// Get configured email provider (Elastic Email is cheapest at scale)
function getEmailProvider(): EmailProvider {
  if (process.env.ELASTIC_EMAIL_API_KEY) return 'elastic'
  if (process.env.BREVO_API_KEY) return 'brevo'
  if (process.env.RESEND_API_KEY) return 'resend'
  throw new Error('No email provider configured. Set ELASTIC_EMAIL_API_KEY, BREVO_API_KEY, or RESEND_API_KEY')
}

// Initialize Elastic Email client
function getElasticEmail() {
  const apiKey = process.env.ELASTIC_EMAIL_API_KEY
  if (!apiKey) {
    throw new Error('ELASTIC_EMAIL_API_KEY environment variable is not set')
  }
  const client = ElasticEmail.ApiClient.instance
  client.authentications['apikey'].apiKey = apiKey
  return new ElasticEmail.EmailsApi()
}

// Initialize Brevo client
function getBrevo() {
  const apiKey = process.env.BREVO_API_KEY
  if (!apiKey) {
    throw new Error('BREVO_API_KEY environment variable is not set')
  }
  const apiInstance = new brevo.TransactionalEmailsApi()
  apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, apiKey)
  return apiInstance
}

// Initialize Resend client
function getResend() {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    throw new Error('RESEND_API_KEY environment variable is not set')
  }
  return new Resend(apiKey)
}

// Unified email send function
async function sendEmail(options: {
  to: string
  from: string
  subject: string
  html: string
}) {
  const provider = getEmailProvider()

  if (provider === 'elastic') {
    const elasticApi = getElasticEmail()

    // Parse from address
    const fromMatch = options.from.match(/^(.+?)\s*<(.+)>$/)
    const fromName = fromMatch ? fromMatch[1].trim() : 'Lician'
    const fromEmail = fromMatch ? fromMatch[2] : options.from

    const emailData = ElasticEmail.EmailMessageData.constructFromObject({
      Recipients: [
        ElasticEmail.EmailRecipient.constructFromObject({ Email: options.to })
      ],
      Content: {
        Body: [
          ElasticEmail.BodyPart.constructFromObject({
            ContentType: 'HTML',
            Content: options.html
          })
        ],
        Subject: options.subject,
        From: fromEmail,
        FromName: fromName
      }
    })

    return new Promise((resolve, reject) => {
      elasticApi.emailsPost(emailData, (error: Error | null, data: unknown) => {
        if (error) {
          reject(error)
        } else {
          resolve({ id: data })
        }
      })
    })
  }

  if (provider === 'brevo') {
    const brevoApi = getBrevo()
    const sendSmtpEmail = new brevo.SendSmtpEmail()

    // Parse from address
    const fromMatch = options.from.match(/^(.+?)\s*<(.+)>$/)
    const fromName = fromMatch ? fromMatch[1] : 'Lician'
    const fromEmail = fromMatch ? fromMatch[2] : options.from

    sendSmtpEmail.sender = { name: fromName, email: fromEmail }
    sendSmtpEmail.to = [{ email: options.to }]
    sendSmtpEmail.subject = options.subject
    sendSmtpEmail.htmlContent = options.html

    const result = await brevoApi.sendTransacEmail(sendSmtpEmail)
    return { id: result.body.messageId }
  } else {
    const resend = getResend()
    const { data, error } = await resend.emails.send(options)
    if (error) throw error
    return data
  }
}

// Batch send emails
async function sendBatchEmails(
  emails: Array<{ to: string; from: string; subject: string; html: string }>
) {
  const provider = getEmailProvider()

  if (provider === 'elastic' || provider === 'brevo') {
    // Send individually (these don't have batch API)
    const results: Array<{ success: boolean; id?: unknown; error?: unknown }> = []
    for (const email of emails) {
      try {
        const result = await sendEmail(email)
        results.push({ success: true, id: (result as { id?: unknown })?.id })
      } catch (error) {
        results.push({ success: false, error })
      }
      // Small delay to avoid rate limits
      await new Promise(r => setTimeout(r, 100))
    }
    return results
  } else {
    const resend = getResend()
    // Resend batch API (up to 100 per request)
    const results = []
    for (let i = 0; i < emails.length; i += 100) {
      const batch = emails.slice(i, i + 100)
      const { data, error } = await resend.batch.send(batch)
      if (error) {
        logger.error('Batch send error', { error })
      }
      results.push(data)
    }
    return results
  }
}

// Email templates
export const emailTemplates = {
  welcome: (email: string, confirmUrl: string) => ({
    from: 'Lician <hello@lician.com>',
    to: email,
    subject: 'Welcome to Lician - Confirm Your Subscription',
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0a0a0a; color: #fafafa; margin: 0; padding: 40px 20px;">
  <div style="max-width: 600px; margin: 0 auto;">
    <!-- Logo -->
    <div style="text-align: center; margin-bottom: 32px;">
      <div style="display: inline-block; width: 48px; height: 48px; background: #22c55e; border-radius: 12px; line-height: 48px; font-size: 24px; font-weight: bold; color: #0a0a0a;">L</div>
    </div>

    <!-- Content -->
    <div style="background: #171717; border: 1px solid #262626; border-radius: 16px; padding: 32px;">
      <h1 style="font-size: 24px; font-weight: 600; margin: 0 0 16px; color: #fafafa;">Welcome to Lician!</h1>

      <p style="color: #a1a1aa; line-height: 1.6; margin: 0 0 24px;">
        Thanks for subscribing to our newsletter. You'll receive:
      </p>

      <ul style="color: #a1a1aa; line-height: 1.8; margin: 0 0 24px; padding-left: 20px;">
        <li><strong style="color: #fafafa;">Weekly Market Digest</strong> - Top movers, insider trades, earnings</li>
        <li><strong style="color: #fafafa;">AI Research Insights</strong> - What our AI is discovering</li>
        <li><strong style="color: #fafafa;">Premium Features</strong> - Early access to new tools</li>
      </ul>

      <p style="color: #a1a1aa; line-height: 1.6; margin: 0 0 24px;">
        Please confirm your email to start receiving updates:
      </p>

      <a href="${confirmUrl}" style="display: inline-block; background: #22c55e; color: #0a0a0a; font-weight: 600; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-size: 16px;">
        Confirm Subscription
      </a>
    </div>

    <!-- Footer -->
    <div style="text-align: center; margin-top: 32px; color: #71717a; font-size: 12px;">
      <p style="margin: 0 0 8px;">Lician - AI-Powered Stock Research</p>
      <p style="margin: 0;">
        <a href="https://lician.com" style="color: #22c55e; text-decoration: none;">lician.com</a>
      </p>
    </div>
  </div>
</body>
</html>
    `,
  }),

  weeklyDigest: (email: string, data: WeeklyDigestData) => ({
    from: 'Lician <digest@lician.com>',
    to: email,
    subject: `Weekly Market Digest - ${data.dateRange}`,
    html: generateWeeklyDigestHtml(data),
  }),

  marketAlert: (email: string, alert: MarketAlertData) => ({
    from: 'Lician <alerts@lician.com>',
    to: email,
    subject: `${alert.type === 'insider' ? '🔔' : '📈'} ${alert.ticker}: ${alert.headline}`,
    html: generateMarketAlertHtml(alert),
  }),
}

interface WeeklyDigestData {
  dateRange: string
  topGainers: Array<{ ticker: string; name: string; change: number }>
  topLosers: Array<{ ticker: string; name: string; change: number }>
  insiderTrades: Array<{ ticker: string; name: string; type: string; value: string }>
  upcomingEarnings: Array<{ ticker: string; name: string; date: string }>
  aiInsight: string
}

interface MarketAlertData {
  ticker: string
  companyName: string
  type: 'price' | 'insider' | 'earnings'
  headline: string
  details: string
  link: string
}

function generateWeeklyDigestHtml(data: WeeklyDigestData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0a0a0a; color: #fafafa; margin: 0; padding: 40px 20px;">
  <div style="max-width: 600px; margin: 0 auto;">
    <div style="text-align: center; margin-bottom: 32px;">
      <div style="display: inline-block; width: 48px; height: 48px; background: #22c55e; border-radius: 12px; line-height: 48px; font-size: 24px; font-weight: bold; color: #0a0a0a;">L</div>
    </div>

    <div style="background: #171717; border: 1px solid #262626; border-radius: 16px; padding: 32px; margin-bottom: 24px;">
      <h1 style="font-size: 24px; margin: 0 0 8px;">Weekly Market Digest</h1>
      <p style="color: #71717a; margin: 0 0 24px;">${data.dateRange}</p>

      <!-- Top Gainers -->
      <h2 style="font-size: 16px; color: #22c55e; margin: 0 0 12px;">📈 Top Gainers</h2>
      <div style="margin-bottom: 24px;">
        ${data.topGainers.map(s => `
          <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #262626;">
            <span><strong>${s.ticker}</strong> - ${s.name}</span>
            <span style="color: #22c55e;">+${s.change.toFixed(1)}%</span>
          </div>
        `).join('')}
      </div>

      <!-- Top Losers -->
      <h2 style="font-size: 16px; color: #ef4444; margin: 0 0 12px;">📉 Top Losers</h2>
      <div style="margin-bottom: 24px;">
        ${data.topLosers.map(s => `
          <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #262626;">
            <span><strong>${s.ticker}</strong> - ${s.name}</span>
            <span style="color: #ef4444;">${s.change.toFixed(1)}%</span>
          </div>
        `).join('')}
      </div>

      <!-- Insider Trades -->
      <h2 style="font-size: 16px; color: #f59e0b; margin: 0 0 12px;">🔔 Notable Insider Trades</h2>
      <div style="margin-bottom: 24px;">
        ${data.insiderTrades.map(t => `
          <div style="padding: 8px 0; border-bottom: 1px solid #262626;">
            <strong>${t.ticker}</strong> - ${t.name}<br>
            <span style="color: #71717a;">${t.type} - ${t.value}</span>
          </div>
        `).join('')}
      </div>

      <!-- AI Insight -->
      <div style="background: #22c55e10; border: 1px solid #22c55e30; border-radius: 8px; padding: 16px;">
        <h3 style="font-size: 14px; color: #22c55e; margin: 0 0 8px;">🤖 AI Insight of the Week</h3>
        <p style="color: #a1a1aa; margin: 0; line-height: 1.6;">${data.aiInsight}</p>
      </div>
    </div>

    <div style="text-align: center;">
      <a href="https://lician.com" style="display: inline-block; background: #22c55e; color: #0a0a0a; font-weight: 600; text-decoration: none; padding: 14px 28px; border-radius: 8px;">
        Explore More on Lician
      </a>
    </div>

    <div style="text-align: center; margin-top: 32px; color: #71717a; font-size: 12px;">
      <a href="https://lician.com/unsubscribe" style="color: #71717a;">Unsubscribe</a>
    </div>
  </div>
</body>
</html>
  `
}

function generateMarketAlertHtml(alert: MarketAlertData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0a0a0a; color: #fafafa; margin: 0; padding: 40px 20px;">
  <div style="max-width: 600px; margin: 0 auto;">
    <div style="background: #171717; border: 1px solid #262626; border-radius: 16px; padding: 32px;">
      <div style="font-size: 14px; color: #22c55e; margin-bottom: 8px;">${alert.ticker}</div>
      <h1 style="font-size: 24px; margin: 0 0 8px;">${alert.headline}</h1>
      <p style="color: #71717a; margin: 0 0 24px;">${alert.companyName}</p>
      <p style="color: #a1a1aa; line-height: 1.6; margin: 0 0 24px;">${alert.details}</p>
      <a href="${alert.link}" style="display: inline-block; background: #22c55e; color: #0a0a0a; font-weight: 600; text-decoration: none; padding: 14px 28px; border-radius: 8px;">
        View Details
      </a>
    </div>
  </div>
</body>
</html>
  `
}

// Send email functions
export async function sendWelcomeEmail(email: string, confirmationToken: string) {
  const confirmUrl = `https://lician.com/api/email/confirm?token=${confirmationToken}`
  const template = emailTemplates.welcome(email, confirmUrl)

  try {
    const result = await sendEmail(template)
    return result
  } catch (error) {
    logger.error('Failed to send welcome email', { error: error instanceof Error ? error.message : 'Unknown' })
    throw error
  }
}

export async function sendWeeklyDigest(email: string, data: WeeklyDigestData) {
  const template = emailTemplates.weeklyDigest(email, data)

  try {
    const result = await sendEmail(template)
    return result
  } catch (error) {
    logger.error('Failed to send weekly digest', { error: error instanceof Error ? error.message : 'Unknown' })
    throw error
  }
}

export async function sendMarketAlert(email: string, alert: MarketAlertData) {
  const template = emailTemplates.marketAlert(email, alert)

  try {
    const result = await sendEmail(template)
    return result
  } catch (error) {
    logger.error('Failed to send market alert', { error: error instanceof Error ? error.message : 'Unknown' })
    throw error
  }
}

// Batch send for weekly digest
export async function sendBatchWeeklyDigest(
  subscribers: Array<{ email: string }>,
  data: WeeklyDigestData
) {
  const emails = subscribers.map(sub => ({
    ...emailTemplates.weeklyDigest(sub.email, data),
  }))

  const results = await sendBatchEmails(emails)

  return results
}
