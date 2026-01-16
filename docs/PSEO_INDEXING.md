# pSEO Indexing Status

> Last updated: January 16, 2026

## Current State

| Metric | Value |
|--------|-------|
| Total Pages Submitted | ~443K+ |
| Pages Indexed | 324,000 |
| Pages Not Indexed | 121,000 |
| Non-Index Reasons | 11 |
| Indexing Rate | ~73% of discovered |

## Sitemap Structure

| Sitemap | URLs | Status | Notes |
|---------|------|--------|-------|
| sitemap-metrics-index.xml | 360,000 | Lyckades | Main pSEO pages |
| sitemap-earnings-index.xml | 67,040 | Lyckades | Earnings pages |
| sitemap-insider-index.xml | 6,960 | Lyckades | Insider trading |
| sitemap-institutional-index.xml | 6,960 | Lyckades | Institutional holders |
| sitemap-sectors.xml | 1,872 | Lyckades | Sector pages |
| sitemap-seo.xml | 446 | Lyckades | Main SEO pages |
| sitemap-compare-index.xml | 0 | Lyckades | Empty/pending |
| sitemap-compare-quarters-index.xml | 0 | Lyckades | Empty/pending |
| sitemap-compare-years-index.xml | 0 | Lyckades | Empty/pending |
| sitemap-short-interest-index.xml | 0 | Lyckades | Empty/pending |

**Total in sitemaps: ~443,278 URLs**

*Note: User mentioned 500M potential pages - only ~443K currently in sitemaps*

## Traffic Analysis (Dec 2025 - Jan 2026)

### Top Queries
| Query | Impressions | Clicks | CTR | Position |
|-------|-------------|--------|-----|----------|
| lician (brand) | 576 | 11 | 1.9% | 3.1 |
| nxn2026 | 16 | 2 | 12.5% | 5.8 |
| lvmh stock forecast 2026 | 3 | 1 | 33% | 5 |

### Key Insight
- **~100% branded traffic** - pSEO pages not ranking for target keywords yet
- Need backlinks/authority before pSEO pages can compete

## Indexing Timeline

```
Oct 2025: ~0 indexed (site launch)
Nov 2025: Slow crawling begins
Dec 2025: Honeymoon period - spike to ~200K indexed
Jan 7-12: Peak at ~450K impressions
Jan 13-14: Drop as honeymoon ends
Jan 16: Stabilized at 324K indexed
```

## 11 Non-Indexing Reasons (to investigate)

Common pSEO issues:
1. "Discovered - currently not indexed" (crawl budget)
2. "Crawled - currently not indexed" (quality signals)
3. "Duplicate without canonical"
4. "Soft 404"
5. "Page with redirect"
6. "Not found (404)"
7. "Server error (5xx)"
8. "Blocked by robots.txt"
9. "Blocked by noindex"
10. "Alternative page with canonical"
11. "Duplicate, Google chose different canonical"

**TODO: Check GSC for actual reasons**

## Strategy

### Phase 1: Stabilize (Current)
- [x] Sitemaps submitted
- [ ] Check non-indexing reasons
- [ ] Fix any technical issues

### Phase 2: Build Authority
- [ ] Directory submissions (see DIRECTORY_SUBMISSIONS.md)
- [ ] 30+ backlinks target
- [ ] Drip-feed to indexing services

### Phase 3: Scale
- [ ] Once DA builds, Google will increase crawl budget
- [ ] More pSEO pages will get indexed
- [ ] Non-branded keywords will start ranking

## Crawl Budget Notes

At current authority level:
- Google limits crawl to ~5K-10K pages/day for new sites
- 443K pages ÷ 5K/day = ~90 days to fully crawl
- Need backlinks to increase crawl budget allocation

## Monitoring

Check weekly:
1. GSC → Coverage → Indexed pages trend
2. GSC → Sitemaps → Discovered vs Indexed
3. GSC → Performance → Non-branded queries growth
