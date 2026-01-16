# n8n Workflows for Lician.com Backlink Acquisition

Production-ready n8n workflow JSON files for automating backlink acquisition.

## Workflows

### 1. HARO Email Monitor (`haro-monitor.json`)

Monitors HARO (Help A Reporter Out) emails for finance-related journalist queries.

**Architecture:**
```
IMAP/Webhook → Filter Finance Keywords → Extract Details → Save to DB → Slack + Email Alert
```

**Features:**
- Dual trigger: IMAP email polling or webhook
- Filters for 15+ finance keywords (investing, stock, ETF, etc.)
- Extracts journalist name, outlet, query, deadline
- Relevance scoring (1-15 based on keyword matches)
- Stores all opportunities in Supabase
- Sends Slack and email alerts

**Webhook Endpoint:** `POST /webhook/haro-webhook`

### 2. Social Media Auto Poster (`social-auto-post.json`)

Automatically posts new content to Twitter/X and LinkedIn.

**Architecture:**
```
Webhook → Generate Copy → Save to DB → Twitter (immediate) + LinkedIn (30 min delay)
```

**Features:**
- Webhook trigger when content is published
- AI-generated platform-specific copy
- Twitter: Engaging, hashtag-optimized
- LinkedIn: Professional, longer format
- 30-minute staggered posting
- Tracks post status in database
- Slack notification on completion

**Webhook Endpoint:** `POST /webhook/new-content-published`

**Payload:**
```json
{
  "url": "https://lician.com/article/...",
  "title": "Article Title",
  "description": "Brief description",
  "type": "article|tool|analysis|news",
  "tags": ["investing", "stocks"]
}
```

### 3. Reddit Opportunity Finder (`reddit-opportunity-finder.json`)

Finds Reddit posts where Lician.com tools can provide value (questions about stock analysis, calculators, etc.).

**Architecture:**
```
Schedule (6h) → Search 6 Subreddits → Filter & Score → Save to DB → Slack Alert
```

**Features:**
- Monitors r/stocks, r/investing, r/personalfinance, r/wallstreetbets, r/financialindependence, r/StockMarket
- Searches for finance questions (compound interest, P/E ratio, stock comparison, etc.)
- Filters posts from last 24 hours with 5+ upvotes
- Scores relevance (0-100) based on topic match and engagement
- Generates suggested response templates for each opportunity type
- Stores all opportunities in Supabase with status tracking
- Sends Slack alerts with top opportunities (score >= 70)
- Rate limiting to respect Reddit API (2s between requests)

**Opportunity Types:**
- `compound_interest` - Calculator questions
- `stock_comparison` - Compare multiple stocks
- `pe_ratio` - P/E and valuation questions
- `dividend_yield` - Dividend screening/analysis
- `stock_screener` - Looking for screener tools
- `financial_analysis` - Fundamental analysis questions
- `valuation` - DCF, intrinsic value questions
- `general` - Other finance questions

**Response Templates Included:**
Each opportunity type has a suggested response template that naturally mentions Lician.com's relevant tool.

**Database Table:** `reddit_opportunities` (see `migrations/reddit_opportunities.sql`)

### 4. Quora Opportunity Finder (`quora-opportunity-finder.json`)

Finds Quora questions where Lician.com tools can provide value (questions about stock analysis, calculators, financial concepts, etc.).

**Architecture:**
```
Daily Schedule (8 AM) → Search Google (site:quora.com) → Extract URLs → Scrape Pages (Firecrawl) →
Filter & Score → Save to DB → Slack Alert (Top 10)
                                                         ↓
                                         Track Answered Questions → Update Metrics
```

**Features:**
- Searches 20 finance-related queries via Google Custom Search API
- Uses Firecrawl to scrape Quora pages for detailed metrics
- Filters by: view count (1000+), recency (30 days), answer quality
- Scores relevance (0-100) based on topic match, views, and engagement
- Generates suggested response templates for each opportunity type
- Stores all opportunities in Supabase with status tracking
- Sends daily Slack alerts with top 10 opportunities (score >= 65)
- Tracks performance of answered questions (upvotes, visibility)
- Rate limiting: 3s between Google searches, 2s between page scrapes

**Search Keywords:**
- Stock market basics, how to invest
- P/E ratio explained, what is a good P/E ratio
- Dividend stocks for beginners
- Compound interest calculator, how compound interest works
- ETF vs mutual fund, best ETF for beginners
- Retirement investing strategy
- Stock screener recommendation
- How to analyze stocks, fundamental analysis
- Stock valuation methods, intrinsic value calculation
- Compare two stocks, best stock analysis website

**Opportunity Types:**
- `stock_basics` - Beginner stock market questions
- `pe_ratio` - P/E and valuation ratio questions
- `dividend_investing` - Dividend yield and income investing
- `compound_interest` - Compound interest calculators/concepts
- `etf_investing` - ETF and index fund questions
- `retirement` - 401k, IRA, retirement planning
- `stock_screener` - Looking for stock screening tools
- `stock_analysis` - Fundamental analysis questions
- `valuation` - DCF, intrinsic value, fair value
- `comparison` - Comparing multiple stocks
- `general` - Other finance questions

**Response Templates Included:**
Each opportunity type has a suggested response template that naturally mentions Lician.com's relevant tool while providing genuine value.

**Answer Tracking:**
- Records when questions are answered with answer URL
- Periodically re-scrapes to check upvote counts
- Tracks answer visibility (not collapsed/hidden)
- Generates performance reports for ROI analysis

**Required Credentials:**
| Credential | Purpose | n8n Type |
|------------|---------|----------|
| Google API Key | Custom Search API | HTTP Query Auth |
| Firecrawl API | Web scraping | HTTP Header Auth |
| Supabase Postgres | Data storage | Postgres |
| Slack API | Notifications | Slack API |

**Environment Variables:**
- `GOOGLE_CSE_ID` - Google Custom Search Engine ID (configured for site:quora.com)

**Database Tables:** `quora_opportunities`, `workflow_runs` (see `migrations/quora_opportunities.sql`)

### 5. Guest Post Outreach (`guest-post-outreach.json`)

Automated guest post outreach system with follow-up sequences.

**Architecture:**
```
Webhook/Schedule → Fetch Targets → Generate Email → Send SMTP → Track Response → Slack Notify
```

**Features:**
- Dual trigger: Webhook to add targets OR schedule to process queue (every 4 hours)
- Stores targets in Supabase with DA, status, and contact info
- 3-stage email sequence: Day 0 (initial), Day 3 (follow-up 1), Day 7 (follow-up 2)
- Personalized email templates specific to lician.com (finance platform)
- Email tracking via 1x1 pixel
- Response handling (reply, open, bounce, unsubscribe)
- Auto status updates on response
- Slack notifications on replies and interested responses
- Weekly performance report (Monday 9 AM)

**Webhook Endpoints:**
- `POST /webhook/guest-post-target` - Add new outreach target
- `POST /webhook/guest-post-response` - Track email responses

**Add Target Payload:**
```json
{
  "site": "https://finance-blog.com",
  "site_name": "Finance Blog",
  "contact_email": "editor@finance-blog.com",
  "contact_name": "John Doe",
  "da": 45,
  "notes": "Personal finance focus",
  "tags": ["finance", "investing"]
}
```

**Response Tracking Payload:**
```json
{
  "type": "reply",
  "target_id": "uuid",
  "tracking_id": "base64-id",
  "content": "Reply content...",
  "from_email": "editor@site.com"
}
```

**Email Sequence:**
1. **Initial (Day 0):** Introduction, value proposition, topic suggestions
2. **Follow-up 1 (Day 3):** Gentle reminder with recent content examples
3. **Follow-up 2 (Day 7):** Final check-in, leaves door open

**Database Tables:** `outreach_targets`, `outreach_email_log` (see `migrations/003_guest_post_outreach.sql`)

### 5. Directory Submission Reminder (`directory-reminder.json`)

Weekly reminder system for directory submissions.

**Architecture:**
```
Weekly Schedule → Fetch Pending → Categorize → Slack Report + Email → Auto-mark Follow-ups
```

**Features:**
- Runs every Monday at 9 AM
- Categorizes by urgency (overdue, needs follow-up, pending)
- Generates rich Slack blocks and HTML email
- Auto-marks submissions older than 14 days for follow-up
- Additional webhooks for manual updates

**Webhook Endpoints:**
- `POST /webhook/directory-status-update` - Update submission status
- `POST /webhook/add-directory` - Add new directory

### 6. Content Syndication (`content-syndication.json`)

Cross-platform content syndication with canonical URLs back to lician.com.

**Architecture:**
```
Webhook → Validate → Init Tracking → [Dev.to | Medium | Hashnode | LinkedIn] → Aggregate → Update DB → Slack Report
                                                                                                          ↓
                                                                                             (If failures) → Queue Retry → Wait 5min → Retry
```

**Features:**
- Webhook trigger when content is published
- Syndicates to Dev.to, Medium, Hashnode, LinkedIn Articles
- Canonical URL pointing back to lician.com (SEO best practice)
- Per-platform status tracking in Supabase
- Automatic retry with exponential backoff (up to 3 attempts)
- Slack notifications for success/partial failure
- Separate retry webhook for failed platforms

**Webhook Endpoints:**
- `POST /webhook/syndicate-content` - Main syndication trigger
- `POST /webhook/syndication-retry` - Retry failed platforms

**Payload:**
```json
{
  "title": "Article Title",
  "description": "Brief description for social sharing",
  "content": "Full article content in markdown",
  "url": "https://lician.com/articles/my-article",
  "tags": ["investing", "stocks", "analysis"]
}
```

**Platform APIs Used:**
| Platform | API Endpoint | Auth Method |
|----------|--------------|-------------|
| Dev.to | `POST /api/articles` | API Key header |
| Medium | `POST /v1/users/{userId}/posts` | Bearer token |
| Hashnode | GraphQL `publishPost` mutation | API Key header |
| LinkedIn | `POST /v2/ugcPosts` | Bearer token |

**Database Table:** `content_syndication` (see `migrations/content_syndication_table.sql`)

### 7. Broken Link Finder (`broken-link-finder.json`)

Automated broken link building outreach system that finds broken links on high-authority finance sites and suggests lician.com content as replacements.

**Architecture:**
```
Weekly Schedule --> Define Target Sites --> Batch & Rate Limit --> Fetch Resource Pages --> Extract Outbound Links
                                                                                                    |
                                        +-----------------------------------------------------------+
                                        v
              Batch Links --> Check HTTP Status (HEAD) --> Analyze Status --> Filter Broken (404/4xx/5xx)
                                                                                        |
              +-----------------------------------------------------------------+-------+
              v
    Match Lician Content --> Generate Outreach Email --> Store in Supabase --> Generate Slack Report --> Notify
```

**Features:**
- Weekly scheduled scan (Sunday 3 AM) + manual webhook trigger
- Targets 27+ high-authority finance sites:
  - Government: investor.gov, usa.gov, consumerfinance.gov
  - Universities: NYU Stern, Stanford GSB, Harvard Business School, Wharton, Columbia, Chicago Booth, Yale SOM, MIT Sloan
  - Finance blogs: Investopedia, NerdWallet, The Motley Fool, Bankrate, Seeking Alpha, Kiplinger
  - Personal finance: Mr. Money Mustache, Financial Samurai, Bogleheads
  - Research: CFA Institute, SSRN, NASDAQ, NYSE
  - FinTech: Finextra, PYMNTS
- Extracts all outbound links from resource/links pages
- Checks each link for 404, 403, 410, and other errors
- Smart content matching - suggests best lician.com page to replace each broken link
- Priority scoring (0-100) based on Domain Authority and content match
- Category-specific email templates (government, education, finance_blog, personal_finance)
- Stores all opportunities in Supabase with outreach tracking
- Weekly Slack report with top opportunities
- Error alerting when scan encounters many failures

**Priority Scoring:**
- Domain Authority: 50% weight (higher DA = higher priority)
- Content Match: 30% weight (better keyword match = higher priority)
- DoFollow Bonus: 20% (NoFollow links score lower)
- Tiers: High (70+), Medium (50-69), Low (<50)

**Lician.com Content Library (for matching):**
| URL | Best For |
|-----|----------|
| `/` (Homepage) | General finance tools, investing |
| `/stocks` | Stock screener, stock finder tools |
| `/financials` | Financial statements, SEC filings, 10-K/10-Q |
| `/chat` | AI assistant, stock chatbot |
| `/api` | Stock API, financial data API |
| `/market-cap-ranking` | Market cap, largest companies |
| `/pe-ratio-ranking` | P/E ratio, valuation, value stocks |
| `/dividend-yield-ranking` | Dividend stocks, income investing |
| `/revenue-growth-ranking` | Growth stocks, fastest growing |
| `/net-income-ranking` | Profitable companies, earnings |
| `/eu-stocks` | European stocks, EU markets |

**Webhook Endpoint:** `POST /webhook/broken-link-manual`

**Email Templates by Category:**

1. **Government** - Formal, emphasizes reliability and educational value
2. **Education** - Academic tone, highlights research utility
3. **Finance Blog** - Casual, focuses on reader value
4. **Personal Finance** - Friendly, community-oriented

**Database Table:** `broken_link_opportunities` (see `migrations/004_broken_link_opportunities.sql`)

**Outreach Status Tracking:**
| Status | Description |
|--------|-------------|
| `pending` | New opportunity, not yet contacted |
| `contacted` | Outreach email sent |
| `responded` | Received response |
| `success` | Link acquired |
| `rejected` | Declined replacement |
| `no_response` | No reply after follow-ups |
| `invalid` | Link no longer broken or site down |

**Required Credentials:**
| Credential | Purpose | n8n Type |
|------------|---------|----------|
| Supabase API | Data storage | Supabase API |
| Slack API | Notifications | Slack API |

**Helper Functions (SQL):**
- `broken_link_weekly_stats()` - Get weekly statistics JSON
- `get_top_broken_link_opportunities(limit, category)` - Fetch top opportunities for outreach
- `mark_broken_link_contacted(opp_id, notes)` - Update status to contacted
- `record_broken_link_acquisition(opp_id, url, anchor)` - Record successful link acquisition

### 8. Finance Influencer Outreach (`influencer-outreach.json`)

Automated influencer partnership outreach for finance content creators across Twitter, YouTube, TikTok, Instagram, and LinkedIn.

**Architecture:**
```
Webhook/Schedule -> Fetch Pending -> Generate Platform Message -> Route (Email/DM Queue) -> Track -> Notify
```

**Features:**
- Multi-trigger: Add single influencer, bulk import, or scheduled follow-up processing (every 6 hours)
- Platform-specific message templates (Twitter, YouTube, TikTok, Instagram, LinkedIn)
- 3-stage outreach sequence: Day 0 (initial), Day 5 (follow-up 1), Day 10 (follow-up 2)
- Influencer tier classification: nano (<10K), micro (10K-100K), macro (100K-1M), mega (1M+)
- Priority scoring based on followers, email availability, and niche relevance
- Three offer types: Premium access, affiliate partnership, content collaboration
- Email sends directly for YouTube/LinkedIn with email; Slack queue for DM-based platforms
- Response and conversion tracking
- Slack notifications on responses and conversions
- Weekly pipeline report (Monday 9 AM)

**Webhook Endpoints:**
- `POST /webhook/influencer-add` - Add single influencer
- `POST /webhook/influencer-bulk-import` - Bulk import influencers
- `POST /webhook/influencer-response` - Track influencer responses

**Add Influencer Payload:**
```json
{
  "name": "Finance Creator Name",
  "platform": "youtube",
  "handle": "FinanceCreator",
  "followers": 150000,
  "niche": "investing",
  "email": "creator@email.com",
  "offer_type": "affiliate"
}
```

**Bulk Import Payload:**
```json
{
  "influencers": [
    { "name": "Creator 1", "platform": "twitter", "handle": "creator1", "followers": 50000 },
    { "name": "Creator 2", "platform": "tiktok", "handle": "creator2", "followers": 200000 }
  ]
}
```

**Response Tracking Payload:**
```json
{
  "type": "interested",
  "contact_id": "uuid",
  "content": "I would love to try the platform!",
  "conversion_type": "affiliate_joined"
}
```

**Response Types:**
- `replied` - General response
- `interested` - Expressed interest
- `not_interested` - Declined
- `converted` - Signed up (premium_signup, affiliate_joined, collaboration_agreed)
- `bounced` - Email bounced
- `no_response` - No response after all follow-ups

**Outreach Sequence:**
1. **Initial (Day 0):** Platform-appropriate intro with value proposition and offer
2. **Follow-up 1 (Day 5):** Gentle reminder highlighting platform benefits
3. **Follow-up 2 (Day 10):** Final check-in, leaves door open

**Offer Types:**
| Offer | Description |
|-------|-------------|
| `premium_access` | 3 months free Premium access |
| `affiliate` | 25% revenue share affiliate partnership |
| `collaboration` | Sponsored content collaboration |

**Database Tables:** `influencer_contacts`, `influencer_outreach_log` (see `migrations/004_influencer_outreach.sql`)


## Database Setup

Run the migration to create required tables:

```sql
-- Run this in your Supabase SQL editor
-- Or save as a migration file

-- HARO Opportunities Table
CREATE TABLE IF NOT EXISTS haro_opportunities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  journalist_name TEXT,
  outlet TEXT,
  query TEXT,
  deadline TEXT,
  requirements TEXT,
  relevance_score INTEGER DEFAULT 0,
  email_subject TEXT,
  email_from TEXT,
  received_at TIMESTAMPTZ,
  raw_content TEXT,
  status TEXT DEFAULT 'new',
  platform TEXT DEFAULT 'haro',
  response_sent BOOLEAN DEFAULT FALSE,
  response_sent_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Social Posts Table
CREATE TABLE IF NOT EXISTS social_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content_url TEXT NOT NULL,
  content_title TEXT,
  content_type TEXT DEFAULT 'article',
  twitter_copy TEXT,
  linkedin_copy TEXT,
  twitter_status TEXT DEFAULT 'pending',
  twitter_post_id TEXT,
  twitter_posted_at TIMESTAMPTZ,
  linkedin_status TEXT DEFAULT 'pending',
  linkedin_post_id TEXT,
  linkedin_posted_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Directory Submissions Table
CREATE TABLE IF NOT EXISTS directory_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  directory_name TEXT NOT NULL,
  url TEXT,
  category TEXT DEFAULT 'finance',
  priority TEXT DEFAULT 'normal',
  status TEXT DEFAULT 'pending',
  notes TEXT,
  submitted_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  backlink_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_haro_status ON haro_opportunities(status);
CREATE INDEX IF NOT EXISTS idx_haro_relevance ON haro_opportunities(relevance_score DESC);
CREATE INDEX IF NOT EXISTS idx_social_posts_status ON social_posts(twitter_status, linkedin_status);
CREATE INDEX IF NOT EXISTS idx_directory_status ON directory_submissions(status);

-- Enable RLS (Row Level Security)
ALTER TABLE haro_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE directory_submissions ENABLE ROW LEVEL SECURITY;

-- Create policies (adjust based on your auth setup)
CREATE POLICY "Service role full access" ON haro_opportunities FOR ALL USING (true);
CREATE POLICY "Service role full access" ON social_posts FOR ALL USING (true);
CREATE POLICY "Service role full access" ON directory_submissions FOR ALL USING (true);
```

## Credentials Setup

Each workflow requires the following credentials to be configured in n8n:

### Required Credentials

| Credential | Used By | n8n Credential Type |
|------------|---------|---------------------|
| `Lician Supabase` | All workflows | Supabase API |
| `Lician Slack` | All workflows | Slack API |
| `Lician SMTP` | HARO, Directory | SMTP |
| `HARO Email Account` | HARO Monitor | IMAP |
| `Lician Twitter` | Social Poster | Twitter OAuth2 |
| `Lician LinkedIn` | Social Poster, Content Syndication | LinkedIn OAuth2 |
| `Dev.to API Key` | Content Syndication | HTTP Header Auth |
| `Medium API Token` | Content Syndication | HTTP Header Auth |
| `Hashnode API Key` | Content Syndication | HTTP Header Auth |

### Setting Up Credentials

1. **Supabase API:**
   - Go to Supabase Dashboard > Settings > API
   - Copy the URL and service_role key
   - In n8n: Settings > Credentials > Supabase API

2. **Slack API:**
   - Create a Slack app at api.slack.com
   - Add Bot Token Scopes: `chat:write`, `channels:read`
   - Install to workspace and copy Bot Token
   - In n8n: Settings > Credentials > Slack API

3. **SMTP (Email):**
   - Use Elastic Email or similar service
   - Get SMTP credentials from provider
   - In n8n: Settings > Credentials > SMTP

4. **Twitter OAuth2:**
   - Apply for Twitter Developer account
   - Create app with OAuth 2.0 enabled
   - Get Client ID and Secret
   - In n8n: Settings > Credentials > Twitter OAuth2

5. **LinkedIn OAuth2:**
   - Create app at LinkedIn Developers
   - Get Client ID and Secret
   - Add redirect URI from n8n
   - In n8n: Settings > Credentials > LinkedIn OAuth2

6. **Dev.to API Key:**
   - Go to dev.to/settings/extensions
   - Generate DEV Community API Key
   - In n8n: Settings > Credentials > HTTP Header Auth
   - Header Name: `api-key`, Header Value: your key

7. **Medium API Token:**
   - Go to medium.com/me/settings/security
   - Get Integration tokens
   - Note: Medium API is limited - consider using their RSS import
   - In n8n: Settings > Credentials > HTTP Header Auth

8. **Hashnode API Key:**
   - Go to hashnode.com/settings/developer
   - Generate Personal Access Token
   - Get your Publication ID from blog settings
   - In n8n: Settings > Credentials > HTTP Header Auth

## Importing Workflows

1. Open n8n dashboard
2. Click "Import from File" or "Import from URL"
3. Select the JSON file
4. Configure credentials (replace placeholder IDs)
5. Activate the workflow

## Testing

### HARO Monitor
```bash
# Test webhook endpoint
curl -X POST https://your-n8n.com/webhook/haro-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Looking for finance experts to comment on stock market trends...",
    "subject": "HARO Query: Finance Expert Needed",
    "from": "journalist@outlet.com"
  }'
```

### Social Auto Poster
```bash
# Test content posting
curl -X POST https://your-n8n.com/webhook/new-content-published \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://lician.com/test-article",
    "title": "Test Article Title",
    "description": "This is a test description for the article.",
    "type": "article",
    "tags": ["investing", "stocks"]
  }'
```

### Directory Reminder
```bash
# Add a new directory
curl -X POST https://your-n8n.com/webhook/add-directory \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Product Hunt",
    "url": "https://www.producthunt.com",
    "category": "startup",
    "priority": "high",
    "notes": "Submit on Tuesday for best visibility"
  }'

# Update submission status
curl -X POST https://your-n8n.com/webhook/directory-status-update \
  -H "Content-Type: application/json" \
  -d '{
    "id": "uuid-of-submission",
    "status": "submitted",
    "notes": "Submitted via their form"
  }'
```

### Guest Post Outreach
```bash
# Add a new outreach target
curl -X POST https://your-n8n.com/webhook/guest-post-target \
  -H "Content-Type: application/json" \
  -d '{
    "site": "https://investopedia.com",
    "site_name": "Investopedia",
    "contact_email": "contributors@investopedia.com",
    "contact_name": "Editorial Team",
    "da": 92,
    "notes": "High DA finance authority site",
    "tags": ["finance", "investing", "education"]
  }'

# Track a response (for testing)
curl -X POST https://your-n8n.com/webhook/guest-post-response \
  -H "Content-Type: application/json" \
  -d '{
    "type": "reply",
    "target_id": "uuid-of-target",
    "content": "Thanks for reaching out! We would be interested in your content.",
    "from_email": "editor@site.com"
  }'

# Check pending targets in Supabase
curl -X GET "https://your-supabase-url/rest/v1/outreach_targets?status=in.(pending,following_up)&order=domain_authority.desc" \
  -H "apikey: your-service-key" \
  -H "Content-Type: application/json"
```

### Reddit Opportunity Finder
```bash
# Manual test - search Reddit directly (no auth required for public JSON)
curl -s "https://www.reddit.com/r/stocks/search.json?q=(self:yes)+help+stock&restrict_sr=true&sort=new&t=day&limit=5" | jq '.data.children | length'

# Check stored opportunities in Supabase
curl -X POST https://your-supabase-url/rest/v1/rpc/get_top_opportunities \
  -H "apikey: your-service-key" \
  -H "Content-Type: application/json"

# Mark opportunity as responded
curl -X PATCH https://your-supabase-url/rest/v1/reddit_opportunities?id=eq.uuid-here \
  -H "apikey: your-service-key" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "responded",
    "responded_at": "2026-01-16T12:00:00Z",
    "response_text": "Your actual response here"
  }'
```

### Quora Opportunity Finder
```bash
# Test Google Custom Search for Quora questions
curl -s "https://www.googleapis.com/customsearch/v1?key=YOUR_API_KEY&cx=YOUR_CSE_ID&q=site:quora.com%20stock%20screener&num=5" | jq '.items | length'

# Check stored Quora opportunities in Supabase
curl -X GET "https://your-supabase-url/rest/v1/quora_opportunities?status=eq.new&order=relevance_score.desc&limit=10" \
  -H "apikey: your-service-key" \
  -H "Content-Type: application/json"

# Mark question as answered
curl -X PATCH "https://your-supabase-url/rest/v1/quora_opportunities?id=eq.uuid-here" \
  -H "apikey: your-service-key" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "answered",
    "answered_at": "2026-01-16T12:00:00Z",
    "answer_url": "https://quora.com/What-is-the-best-stock-screener/answer/Your-Name",
    "answer_text": "Summary of your answer"
  }'

# Get answer performance metrics
curl -X POST "https://your-supabase-url/rest/v1/rpc/get_quora_answer_performance" \
  -H "apikey: your-service-key" \
  -H "Content-Type: application/json"

# Check high-value opportunities (high views, few answers)
curl -X GET "https://your-supabase-url/rest/v1/quora_opportunities?status=eq.new&view_count=gte.1000&answer_count=lte.3&relevance_score=gte.75&order=view_count.desc" \
  -H "apikey: your-service-key" \
  -H "Content-Type: application/json"
```

### Content Syndication
```bash
# Test content syndication webhook
curl -X POST https://your-n8n.com/webhook/syndicate-content \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Understanding P/E Ratios: A Comprehensive Guide",
    "description": "Learn how to use P/E ratios to evaluate stocks and make better investment decisions.",
    "content": "The price-to-earnings ratio (P/E) is one of the most widely used metrics...",
    "url": "https://lician.com/guides/pe-ratio",
    "tags": ["investing", "stocks", "valuation", "fundamentals"]
  }'

# Check syndication status
curl -X GET "https://your-supabase-url/rest/v1/content_syndication?order=created_at.desc&limit=5" \
  -H "apikey: your-service-key" \
  -H "Content-Type: application/json"

# Manually retry a failed platform
curl -X POST https://your-n8n.com/webhook/syndication-retry \
  -H "Content-Type: application/json" \
  -d '{
    "syndicationId": "synd-xxxxx",
    "platform": "medium",
    "retryCount": 1,
    "maxRetries": 3
  }'

# Check syndication for specific article
curl -X GET "https://your-supabase-url/rest/v1/content_syndication?original_url=eq.https://lician.com/guides/pe-ratio" \
  -H "apikey: your-service-key" \
  -H "Content-Type: application/json"
```

### Broken Link Finder
```bash
# Manual trigger via webhook
curl -X POST https://your-n8n.com/webhook/broken-link-manual \
  -H "Content-Type: application/json"

# Get top pending opportunities (high priority, not contacted)
curl -X GET "https://your-supabase-url/rest/v1/broken_link_opportunities?outreach_status=eq.pending&priority_tier=eq.high&order=priority_score.desc&limit=10" \
  -H "apikey: your-service-key" \
  -H "Content-Type: application/json"

# Get weekly stats
curl -X POST "https://your-supabase-url/rest/v1/rpc/broken_link_weekly_stats" \
  -H "apikey: your-service-key" \
  -H "Content-Type: application/json"

# Mark opportunity as contacted
curl -X POST "https://your-supabase-url/rest/v1/rpc/mark_broken_link_contacted" \
  -H "apikey: your-service-key" \
  -H "Content-Type: application/json" \
  -d '{
    "opp_id": "uuid-here",
    "notes": "Sent initial outreach email"
  }'

# Record successful link acquisition
curl -X POST "https://your-supabase-url/rest/v1/rpc/record_broken_link_acquisition" \
  -H "apikey: your-service-key" \
  -H "Content-Type: application/json" \
  -d '{
    "opp_id": "uuid-here",
    "new_url": "https://investopedia.com/article-with-our-link",
    "new_anchor": "free stock screener"
  }'

# Filter by source category
curl -X GET "https://your-supabase-url/rest/v1/broken_link_opportunities?source_category=eq.education&outreach_status=eq.pending&order=source_domain_authority.desc" \
  -H "apikey: your-service-key" \
  -H "Content-Type: application/json"

# Get opportunities with DoFollow links only
curl -X GET "https://your-supabase-url/rest/v1/broken_link_opportunities?is_nofollow=eq.false&outreach_status=eq.pending&order=priority_score.desc" \
  -H "apikey: your-service-key" \
  -H "Content-Type: application/json"
```

## Workflow Diagrams

### HARO Monitor
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  IMAP Trigger   │───>│ Filter Finance  │───>│ Extract Details │
│  (5 min poll)   │    │   Keywords      │    │   (Code Node)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
        │                                              │
        │    ┌─────────────────┐                      ▼
        │    │ Webhook Trigger │──────────>┌─────────────────┐
        │    │  (Alternative)  │           │ Filter Relevant │
        │    └─────────────────┘           │  (Score >= 1)   │
        │                                  └─────────────────┘
        │                                          │
        │    ┌─────────────────────────────────────┼──────────────┐
        │    │                                     ▼              │
        │    │  ┌─────────────────┐    ┌─────────────────┐       │
        │    │  │ Save to Supabase│───>│  Slack Alert    │       │
        │    │  └─────────────────┘    └─────────────────┘       │
        │    │           │                      │                 │
        │    │           │             ┌─────────────────┐       │
        │    │           └────────────>│  Email Alert    │       │
        │    │                         └─────────────────┘       │
        │    └────────────────────────────────────────────────────┘
```

### Social Auto Poster
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Webhook: New    │───>│ Generate Copy   │───>│ Save to DB      │
│ Content Posted  │    │ (Twitter/LI)    │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                      │
                              ┌────────────────────────┼──────────┐
                              ▼                        ▼          │
                    ┌─────────────────┐    ┌─────────────────┐   │
                    │ Post to Twitter │    │ Wait 30 mins    │   │
                    │   (Immediate)   │    │                 │   │
                    └─────────────────┘    └─────────────────┘   │
                              │                        │          │
                              ▼                        ▼          │
                    ┌─────────────────┐    ┌─────────────────┐   │
                    │ Update Status   │    │ Post to LinkedIn│   │
                    │ (Twitter)       │    │                 │   │
                    └─────────────────┘    └─────────────────┘   │
                              │                        │          │
                              ▼                        ▼          │
                    ┌─────────────────┐    ┌─────────────────┐   │
                    │ Slack Notify    │    │ Update Status   │   │
                    │                 │    │ (LinkedIn)      │   │
                    └─────────────────┘    └─────────────────┘   │
                              │                        │          │
                              └────────────┬───────────┘          │
                                           ▼                      │
                                 ┌─────────────────┐              │
                                 │ Respond Success │              │
                                 └─────────────────┘              │
```

### Reddit Opportunity Finder
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Schedule        │───>│ Split           │───>│ Rate Limit      │
│ (Every 6 Hours) │    │ Subreddits      │    │ (2s delay)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                      │
        ┌─────────────────────────────────────────────┘
        ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Search Reddit   │───>│ Filter & Score  │───>│ Filter Empty    │
│ (Per Subreddit) │    │ Opportunities   │    │ Results         │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                      │
        ┌─────────────────────────────────────────────┘
        ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Store in        │───>│ Get Top Opps    │───>│ Format Slack    │
│ Supabase        │    │ (Score >= 70)   │    │ Message         │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                      │
                                                      ▼
                                             ┌─────────────────┐
                                             │ Send to Slack   │
                                             │                 │
                                             └─────────────────┘
```

### Quora Opportunity Finder
```
                                          MAIN DISCOVERY FLOW
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Daily Schedule  │───>│ Configuration   │───>│ Split Search    │───>│ Process Each    │
│ (8 AM)          │    │ (20 queries)    │    │ Queries         │    │ Query (Batch)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘
        │                                                                    │
        │                                            ┌───────────────────────┘
        │                                            ▼
        │              ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
        │              │ Extract Quora   │<───│ Search Google   │<───│ Rate Limit      │
        │              │ URLs            │    │ (site:quora.com)│    │ (3s delay)      │
        │              └─────────────────┘    └─────────────────┘    └─────────────────┘
        │                      │
        │                      ▼
        │              ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
        │              │ Filter Skipped  │───>│ Process Each    │───>│ Scrape Rate     │
        │              │ Results         │    │ URL (Batch)     │    │ Limit (2s)      │
        │              └─────────────────┘    └─────────────────┘    └─────────────────┘
        │                                                                    │
        │                                            ┌───────────────────────┘
        │                                            ▼
        │              ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
        │              │ Process Scraped │<───│ Scrape Quora    │    │ Extract:        │
        │              │ Data            │    │ (Firecrawl)     │    │ - Views         │
        │              └─────────────────┘    └─────────────────┘    │ - Answers       │
        │                      │                                     │ - Age           │
        │                      ▼                                     │ - Topic         │
        │              ┌─────────────────┐    ┌─────────────────┐    └─────────────────┘
        │              │ Filter Valid    │───>│ Store in        │
        │              │ Opportunities   │    │ Supabase        │
        │              └─────────────────┘    └─────────────────┘
        │                                            │
        │                                            │ (Loop back to next URL/query)
        │                                            │
        │              ┌─────────────────────────────┘
        │              │        NOTIFICATION FLOW (after all queries processed)
        │              ▼
        │      ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
        │      │ Get Top 10      │───>│ Has             │───>│ Format Slack    │
        │      │ Opportunities   │    │ Opportunities?  │    │ Message         │
        │      └─────────────────┘    └─────────────────┘    └─────────────────┘
        │                                                            │
        │                                                            ▼
        │                                                    ┌─────────────────┐
        │                                                    │ Send to Slack   │
        │                                                    │ (Top 10 + Tips) │
        │                                                    └─────────────────┘
        │                                                            │
        │                                                            ▼
        │                                                    ┌─────────────────┐
        │                                                    │ Log Workflow    │───> Complete
        │                                                    │ Run Stats       │
        │                                                    └─────────────────┘
        │
        │                         ANSWER TRACKING FLOW (parallel)
        │
        └───>┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
             │ Get Answered    │───>│ Filter          │───>│ Has Trackable?  │
             │ Questions       │    │ Trackable       │    │                 │
             └─────────────────┘    └─────────────────┘    └─────────────────┘
                                                                   │
                                           ┌───────────────────────┘
                                           ▼
                                   ┌─────────────────┐    ┌─────────────────┐
                                   │ Check Answer    │───>│ Extract Metrics │
                                   │ (Firecrawl)     │    │ (Upvotes, etc.) │
                                   └─────────────────┘    └─────────────────┘
                                                                   │
                                                                   ▼
                                                          ┌─────────────────┐
                                                          │ Update Tracking │
                                                          │ in Supabase     │
                                                          └─────────────────┘
```

### Guest Post Outreach
```
                    ┌─────────────────┐
                    │ Webhook: Add    │
                    │ Target          │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐    ┌─────────────────┐
                    │ Insert to       │───>│ Respond Success │
                    │ Supabase        │    │                 │
                    └─────────────────┘    └─────────────────┘

┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Schedule        │───>│ Fetch Pending   │───>│ Split Targets   │
│ (Every 4 Hours) │    │ Targets         │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                      │
                                                      ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Wait (Rate      │<───│ Update Status   │<───│ Send SMTP Email │
│ Limit 5s)       │    │ & Log Email     │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                      ▲
                                              ┌───────┴───────┐
                                              │ Generate      │
                                              │ Personalized  │
                                              │ Email         │
                                              └───────────────┘

┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Webhook: Track  │───>│ Parse Response  │───>│ Update Target   │
│ Response        │    │ Type            │    │ Status          │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                      │
                                              ┌───────┴───────┐
                                              ▼               ▼
                                    ┌─────────────────┐ ┌─────────────────┐
                                    │ Slack Notify    │ │ Respond Webhook │
                                    │ (If Reply)      │ │                 │
                                    └─────────────────┘ └─────────────────┘

┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Weekly Schedule │───>│ Get Stats (RPC) │───>│ Slack Weekly    │
│ (Mon 9 AM)      │    │                 │    │ Report          │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Directory Reminder
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Weekly Schedule │───>│ Fetch Pending   │───>│ Categorize &    │
│ (Mon 9 AM)      │    │ Directories     │    │ Generate Report │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                      │
                                              ┌───────┴───────┐
                                              ▼               ▼
                                      Has Items?        No Items
                                              │           (Skip)
                              ┌────────────────┼──────────┐
                              ▼                ▼          │
                    ┌─────────────────┐ ┌─────────────────┐
                    │ Slack Report    │ │ Email Report    │
                    └─────────────────┘ └─────────────────┘
                              │                │
                              ▼                ▼
                    ┌─────────────────┐ ┌─────────────────┐
                    │ Urgent Alert?   │ │ Auto-mark       │
                    │ (If overdue)    │ │ Follow-ups      │
                    └─────────────────┘ └─────────────────┘
```

### Content Syndication
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Webhook: New    │───>│ Validate &      │───>│ Init Tracking   │
│ Content Posted  │    │ Prepare Content │    │ in Supabase     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                      │
                       ┌──────────────────────────────┼────────────────────────┐
                       │                              │                        │
                       ▼                              ▼                        ▼
             ┌─────────────────┐            ┌─────────────────┐      ┌─────────────────┐
             │ Post to Dev.to  │            │ Post to Medium  │      │ Post to Hashnode│
             │ (REST API)      │            │ (REST API)      │      │ (GraphQL)       │
             └─────────────────┘            └─────────────────┘      └─────────────────┘
                       │                              │                        │
                       │                              │                        │
                       │                              │      ┌─────────────────┐
                       │                              │      │ Post to LinkedIn│
                       │                              │      │ (REST API)      │
                       │                              │      └─────────────────┘
                       │                              │              │
                       └──────────────────────────────┼──────────────┘
                                                      ▼
                                            ┌─────────────────┐
                                            │ Merge & Aggregate│
                                            │ All Results      │
                                            └─────────────────┘
                                                      │
                                                      ▼
                                            ┌─────────────────┐
                                            │ Update Supabase │
                                            │ Tracking Status │
                                            └─────────────────┘
                                                      │
                                      ┌───────────────┴───────────────┐
                                      ▼                               ▼
                            ┌─────────────────┐             ┌─────────────────┐
                            │ All Success?    │             │ Has Failures?   │
                            │ Slack: Success  │             │ Slack: Warning  │
                            └─────────────────┘             └─────────────────┘
                                                                      │
                                                                      ▼
                                                            ┌─────────────────┐
                                                            │ Queue for Retry │
                                                            │ (5 min wait)    │
                                                            └─────────────────┘
                                                                      │
                                                                      ▼
                                                            ┌─────────────────┐
                                                            │ Retry Webhook   │
                                                            │ (Exp. Backoff)  │
                                                            └─────────────────┘
```

### Broken Link Finder
```
                                  MAIN SCAN FLOW
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Weekly Schedule │───>│ Merge Triggers  │<───│ Manual Webhook  │
│ (Sunday 3 AM)   │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                               │
                               ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Define Target   │───>│ Batch Sites     │───>│ Rate Limit      │
│ Sites (27+)     │    │ (5 at a time)   │    │ (3s delay)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                      │
        ┌─────────────────────────────────────────────┘
        ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Fetch Resource  │───>│ Extract All     │───>│ Has Outbound    │
│ Page (HTTP GET) │    │ Outbound Links  │    │ Links?          │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                      │
        ┌─────────────────────────────────────────────┘ (Yes)
        ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Flatten Links   │───>│ Batch Links     │───>│ Rate Limit      │
│ for Checking    │    │ (20 at a time)  │    │ (1.5s delay)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                      │
        ┌─────────────────────────────────────────────┘
        ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Check Link      │───>│ Analyze Link    │───>│ Is Broken?      │
│ Status (HEAD)   │    │ Status          │    │ (404/4xx/5xx)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                      │
        ┌─────────────────────────────────────────────┘ (Yes)
        ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Match Lician    │───>│ Generate        │───>│ Store in        │
│ Content         │    │ Outreach Email  │    │ Supabase        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                      │
                                                      │ (Loop back to next batch)

                              REPORT FLOW (after all sites processed)
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Fetch Week's    │───>│ Generate Slack  │───>│ Send Slack      │
│ Opportunities   │    │ Report          │    │ Report          │
└─────────────────┘    └─────────────────┘    └─────────────────┘

                              ERROR HANDLING FLOW
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Error Handler   │───>│ Many Errors?    │───>│ Send Error      │
│ (Aggregate)     │    │ (>5 failures)   │    │ Alert to Slack  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Cost Estimation

| Workflow | API Calls/Month | Est. Cost |
|----------|-----------------|-----------|
| HARO Monitor | ~90 (3x daily) | Free (IMAP) |
| Social Poster | ~60 (Twitter) + ~60 (LinkedIn) | Free tier |
| Reddit Finder | ~720 (4x daily x 6 subreddits) | Free (Reddit API) |
| Quora Finder | ~600 Google CSE + ~3000 Firecrawl | ~$5 (Firecrawl) |
| Guest Post Outreach | ~180 (6x daily queue) | SMTP varies |
| Directory Reminder | ~4 (weekly) | Free |
| Content Syndication | ~120 (4 platforms x 30 articles) | Free (API limits apply) |
| Broken Link Finder | ~500-1000 (weekly scan of 27+ sites) | Free |

**Quora Finder Breakdown:**
- Google Custom Search: 100 free queries/day (workflow uses ~20/day = within free tier)
- Firecrawl: ~100 scrapes/day x 30 days = 3000/month
- Firecrawl pricing: 500 free/month, then $0.002/page = ~$5/month for overages
- Alternative: Use Puppeteer node (self-hosted, free but slower)

**Total n8n executions:** ~1300-1800/month (well within free tier limits)

## Troubleshooting

### HARO emails not detected
- Check IMAP credentials and folder settings
- Verify email forwarding if using Gmail
- Test with webhook trigger first

### Twitter posting fails
- Verify OAuth2 tokens are fresh
- Check Twitter API rate limits
- Ensure app has write permissions

### LinkedIn posting fails
- LinkedIn requires company page for some operations
- Check if Person URN is correctly configured
- Verify OAuth scopes include `w_member_social`

### Database connection issues
- Verify Supabase service_role key
- Check RLS policies allow service role access
- Ensure tables exist with correct schema

### Reddit search returns empty
- Reddit's JSON API doesn't require auth but has rate limits
- Wait 2+ seconds between requests (workflow does this)
- Check if subreddit name is correct (case-sensitive)
- Some subreddits block certain search patterns

### Reddit opportunities not filtering correctly
- Verify upvote threshold (default 5+)
- Check time filter (24 hours from created_utc)
- Finance keywords are case-insensitive
- Add/remove keywords in the Code node

### Quora workflow not finding questions
- Verify Google Custom Search API key is valid
- Check CSE ID is configured for Quora (site:quora.com)
- Google CSE free tier: 100 queries/day (workflow uses ~20/run)
- Check Firecrawl API key and rate limits
- Quora may block aggressive scraping - adjust rate limits

### Quora view counts/metrics missing
- Quora uses dynamic rendering - Firecrawl may not capture all data
- View counts may be displayed in different formats (1K, 1,000, etc.)
- Some questions don't display view counts publicly
- Check the regex patterns in "Process Scraped Data" node

### Quora answer tracking not updating
- Ensure `answer_url` is set when marking as answered
- Tracking only runs for answers older than 7 days
- Firecrawl may fail on some Quora pages (rate limiting)
- Check if your answer is still visible (not collapsed)

### Content syndication fails for Dev.to
- Verify API key at dev.to/settings/extensions
- Check rate limits (30 articles per day)
- Ensure tags are lowercase with no spaces
- Maximum 4 tags per article

### Content syndication fails for Medium
- Medium API is in maintenance mode (may be deprecated)
- Consider using RSS import as alternative
- Verify user ID in the API URL
- Access token must have write permissions

### Content syndication fails for Hashnode
- Verify Publication ID is correct
- API key needs write permissions
- GraphQL mutation must match schema version
- Tags must have valid slug format

### Content syndication fails for LinkedIn
- Verify Person URN format: `urn:li:person:XXXXXXXX`
- OAuth token must have `w_member_social` scope
- Content length limits: 3000 chars for posts
- Article sharing requires valid URL

### Broken link scan returns no results
- Target sites may have changed their resource page URLs
- Check if sites are blocking requests (User-Agent issues)
- Increase timeout values if sites are slow to respond
- Some sites may use JavaScript rendering (not supported by basic HTTP requests)

### Broken links detected but not actually broken
- Some sites return 403 to HEAD requests but work with GET
- Sites may block non-browser User-Agents
- CDN protection (Cloudflare, etc.) may cause false positives
- Try manually verifying flagged URLs before outreach

### Low content match scores
- Update the Lician content library in the Code node with new pages
- Adjust keyword matching weights in the matching algorithm
- Consider anchor text patterns for better matching

### Slack report not sending
- Verify Slack channel ID is configured correctly
- Check Slack bot has permissions to post in the channel
- Ensure there are actually pending opportunities in the database

### Many errors in scan
- Check rate limiting (increase delays between requests)
- Verify network connectivity
- Some sites may be temporarily down during scan
- Consider adding specific error handling for frequently problematic sites

## Support

For issues specific to lician.com, check:
- `/docs/SEO_AUTOMATION.md` - SEO workflow context
- `/docs/DATA_PIPELINE.md` - Database schema reference
