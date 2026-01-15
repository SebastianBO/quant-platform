# SEO Automation & Content Generation

This document covers the automated SEO audit system and content generation pipeline.

## Weekly SEO Audit Orchestrator

This project uses an automated SEO audit system. When starting a session, consider running the weekly SEO audit if it hasn't been run recently.

```typescript
// Weekly SEO audit orchestrator
async function runWeeklySEOAudit() {
  // Phase 1: Data Collection (parallel)
  const [searchConsole, analytics, siteStructure, competitors] = await Promise.all([
    Task.spawn('data-analyst', {
      prompt: `Fetch Search Console data for past 90 days:
        - Query performance (clicks, impressions, CTR, position)
        - Page performance
        - Index coverage issues
        - Core Web Vitals`,
      tools: ['google-search-console-mcp']
    }),
    Task.spawn('data-analyst', {
      prompt: `Pull GA4 organic traffic metrics:
        - Sessions by landing page
        - Engagement rate
        - Conversions from organic
        - User behavior flow`,
      tools: ['google-analytics-mcp']
    }),
    Task.spawn('Explore', {
      prompt: `Crawl site structure comprehensively:
        - All pages and their metadata (titles, descriptions, h1s)
        - Internal link structure
        - Orphaned pages (no incoming links)
        - Broken links`,
      thoroughness: 'very thorough'
    }),
    Task.spawn('seo-specialist', {
      prompt: `Analyze top 3 competitors for our target keywords:
        - Their ranking pages
        - Content structure and length
        - Backlink profiles
        - Content gaps they're filling`,
      tools: ['mcp__playwright__browser_navigate', 'mcp__playwright__browser_snapshot']
    })
  ]);

  // Phase 2: Analysis
  const analysis = await Task.spawn('seo-specialist', {
    prompt: `Synthesize all data and identify:
      1. Quick wins (can fix automatically)
      2. Content gaps (need new articles)
      3. Technical issues (need review)
      4. Link opportunities (internal linking)

      Data: ${JSON.stringify({ searchConsole, analytics, siteStructure, competitors })}`
  });

  return analysis;
}
```

## Content Generation Pipeline

When the audit identifies a content gap, Claude Code doesn't just flag it — it writes the content:

```typescript
async function generateContent(gap: ContentGap) {
  // Research phase
  const research = await Task.spawn('research-analyst', {
    prompt: `Deep research on "${gap.keyword}":
      - Current top-ranking content (structure, length, angle)
      - Statistics and data points to cite
      - Questions people ask (People Also Ask, forums)
      - Unique angles not covered by competitors`
  });

  // Outline with SEO structure
  const outline = await Task.spawn('seo-specialist', {
    prompt: `Create SEO-optimized outline:
      Target keyword: ${gap.keyword}
      Search intent: ${gap.intent}
      Competitor analysis: ${research.competitors}

      Include: H2/H3 structure, target word count, internal link opportunities`
  });

  // Write in brand voice
  const draft = await Task.spawn('josh-writer', {
    prompt: `Write article following this outline:
      ${outline}

      Style: Conversational, direct, conclusion-first
      Include: Specific examples, real numbers, actionable advice
      Avoid: Fluff, generic statements, AI-sounding phrases`
  });

  // Final SEO pass
  const optimized = await Task.spawn('seo-specialist', {
    prompt: `Optimize for SEO without killing the voice:
      - Ensure keyword in title, H1, first paragraph
      - Add schema markup recommendations
      - Suggest meta description
      - Identify internal link targets

      Content: ${draft}`
  });

  // Write to file system
  await Write({
    file_path: `src/content/articles/${gap.slug}.mdx`,
    content: optimized.content
  });

  return optimized;
}
```

## Automatic Fixes

Some issues don't need human review. Claude Code just fixes them:

```typescript
async function executeQuickWins(issues: QuickWin[]) {
  for (const issue of issues) {
    switch (issue.type) {
      case 'missing_meta_description':
        await Edit({
          file_path: issue.file,
          old_string: issue.current,
          new_string: issue.suggested
        });
        break;

      case 'broken_internal_link':
        await Edit({
          file_path: issue.file,
          old_string: issue.brokenLink,
          new_string: issue.correctLink
        });
        break;

      case 'missing_alt_text':
        // Use Playwright to check what the image shows
        const imageContext = await Task.spawn('Explore', {
          prompt: `Describe this image for alt text: ${issue.imageUrl}`
        });
        await Edit({
          file_path: issue.file,
          old_string: `alt=""`,
          new_string: `alt="${imageContext.description}"`
        });
        break;
    }
  }

  // Commit all fixes
  await Bash({ command: 'git add -A && git commit -m "fix(seo): auto-fixes from weekly audit"' });
}
```

## Weekly Audit Report Format

Every Monday, generate a structured report:

```json
{
  "audit_date": "2024-12-24T06:47:00Z",
  "duration_minutes": 12,
  "data_sources": ["search_console", "ga4", "ahrefs", "site_crawl", "competitor_analysis"],
  "pages_analyzed": 127,
  "findings": {
    "quick_wins": [
      {
        "type": "title_optimization",
        "page": "/blog/inventory-management",
        "current_title": "Inventory Tips",
        "suggested_title": "Inventory Management: 7 Strategies That Cut Costs 23%",
        "rationale": "Current title missing primary keyword, no value proposition",
        "projected_impact": "+340 monthly impressions",
        "status": "auto_fixed"
      },
      {
        "type": "missing_meta_description",
        "pages_affected": 8,
        "status": "auto_fixed"
      },
      {
        "type": "broken_internal_links",
        "count": 3,
        "status": "auto_fixed"
      }
    ],
    "content_gaps": [
      {
        "keyword": "warehouse automation ROI calculator",
        "monthly_volume": 2400,
        "difficulty": 34,
        "competitor_avg_ranking": 3,
        "our_ranking": null,
        "content_brief": {
          "angle": "Interactive calculator with real-world benchmarks",
          "word_count_target": 2500,
          "sections": ["ROI factors", "Calculator tool", "Case studies", "Implementation costs"]
        },
        "article_drafted": true,
        "draft_path": "src/content/articles/warehouse-automation-roi-calculator.mdx"
      }
    ],
    "technical_issues": [
      {
        "type": "slow_lcp",
        "pages_affected": 12,
        "cause": "Unoptimized hero images",
        "recommendation": "Convert to WebP, add explicit dimensions",
        "auto_fixable": false,
        "priority": "high"
      }
    ],
    "internal_linking": [
      {
        "source": "/blog/inventory-optimization",
        "target": "/blog/abc-xyz-analysis",
        "anchor_text": "ABC-XYZ matrix",
        "rationale": "High-traffic page linking to underperforming page with relevant content"
      }
    ]
  },
  "actions_taken": {
    "auto_fixed": 11,
    "articles_drafted": 1,
    "link_suggestions": 8,
    "pr_created": "https://github.com/org/site/pull/847"
  },
  "week_over_week": {
    "impressions": "+12%",
    "clicks": "+8%",
    "avg_position": "-0.3 (improved)"
  }
}
```

## Generated Content Sample

Here's what an auto-generated article brief looks like:

```markdown
# Article: Warehouse Automation ROI Calculator

## Target Keyword
warehouse automation ROI (2,400/mo, KD 34)

## Search Intent
Transactional/Informational hybrid - users want to calculate
their specific ROI before making a decision

## Content Structure
1. **The Real Cost of Warehouse Automation** (400 words)
   - Beyond equipment: implementation, training, integration
   - Hidden costs most calculators miss

2. **Interactive ROI Calculator** (embed component)
   - Inputs: current labor cost, throughput, error rate
   - Outputs: payback period, 5-year savings, efficiency gains

3. **Benchmarks by Industry** (600 words)
   - E-commerce: 18-24 month payback typical
   - Manufacturing: 12-18 months
   - 3PL: 24-36 months

4. **Case Study: Mid-Size E-commerce** (500 words)
   - $2.3M investment, 14-month payback
   - 47% reduction in labor costs
   - 99.7% pick accuracy

5. **When Automation Doesn't Make Sense** (400 words)
   - Low volume thresholds
   - High SKU variability
   - Short-term lease situations

## Internal Links
- Link to /inventory-optimization (primary)
- Link to /warehouse-layout-guide (secondary)
- Link to /case-studies/acme-fulfillment (case study)

## Schema Markup
- FAQPage (for common questions)
- HowTo (for ROI calculation steps)
```
