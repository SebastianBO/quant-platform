# Vercel Billing Dispute Email

**Sent:** January 18, 2026

**To:** support@vercel.com
**Subject:** Billing Dispute - Charged $250 Despite Having Spend Limit Set

---

Hi Vercel Support,

I'm writing regarding an unexpected charge of approximately $250 on my account (team: **finance-liciancoms-projects**, project: **quant-platform**).

**The Issue:**
I had a spend limit configured on my account, but was still charged $250 for 19,966 GB-Hrs of Fluid Provisioned Memory usage that occurred primarily on January 17, 2026.

**What Happened:**
On January 17th, I made approximately 26 deployments while applying a design system update across my application. Several builds failed due to Turbopack OOM errors, which I later fixed by switching to Webpack. This deployment activity, combined with ISR pages that had aggressive revalidation settings (60 seconds), caused a cascade of function executions.

**My Concerns:**
1. The spend limit I configured should have prevented charges beyond my set threshold
2. The majority of the usage (19,966 GB-Hrs) occurred in a single day due to deployment activity, not sustained production traffic
3. My account was paused after the fact, but the charges had already accumulated

**What I'm Requesting:**
Given that I had a spend limit configured and this was a one-time spike from deployment activity (not normal usage), I'm requesting:
- A credit or refund for the overage charges
- Clarification on why the spend limit did not prevent these charges

I have since fixed the underlying issues (increased ISR revalidation times, removed cron jobs, fixed build configuration) and expect normal usage going forward.

Thank you for your assistance.

Best regards,
[Your Name]
[Your Email]
