# Mobile App - Lician (Jan 2026)

## Overview

Lician has a companion mobile app built with **Expo/React Native**. The app provides portfolio tracking, AI insights, and market data on mobile devices.

## App Store Links

| Platform | Bundle ID | Link |
|----------|-----------|------|
| **iOS** | `distinct.lician.com` | https://apps.apple.com/app/lician/id6748368400 |
| **Android** | `com.lician` | https://play.google.com/store/apps/details?id=com.lician |

## App Details

- **Name**: Lician
- **Version**: 611.0 (iOS build 713, Android versionCode 646)
- **Tech Stack**: Expo SDK, React Native, Expo Router
- **Features**:
  - Portfolio tracking with real-time prices
  - AI-powered financial assistant
  - Push notifications for price alerts
  - Apple Sign In / Google Sign In
  - Bloomberg Terminal-style interface
  - 381,000+ global financial instruments

## Source Code Location

```
/Users/sebastianbenzianolsson/Developer/portfoliocare-expo/
```

Key files:
- `app.json` - Expo configuration
- `CLAUDE.md` - Mobile app-specific Claude instructions
- `src/` - Application source code

## Web Platform Integration

The web platform (lician.com) promotes the mobile app in:

1. **Footer** - "Get Lician on Mobile" section with App Store links
2. **MobileAppPromo component** - Multiple variants (banner, card, popup, footer)

Component location: `src/components/MobileAppPromo.tsx`

### Promo Component Variants

```typescript
// Footer link style (used in website footer)
<MobileAppPromo variant="footer" />

// Card style (sidebar)
<MobileAppPromo variant="card" />

// Thin banner (top of page)
<MobileAppPromo variant="banner" />

// Modal popup (after 30s delay)
<MobileAppPromo variant="popup" />
```

### Popup Hook

```typescript
import { useMobileAppPopup } from '@/components/MobileAppPromo'

// Shows popup after 30s for desktop users
const { showPopup, setShowPopup } = useMobileAppPopup(30000)
```

## Cross-Promotion Strategy

- Web users see subtle footer link to download app
- Popup shows once per week (dismissed for 7 days)
- Mobile users not shown popup (auto-detected)
- App users can be deep-linked to web features

## App Store Keywords

- Stock portfolio tracker
- AI financial assistant
- Investment research
- Market analysis
- Bloomberg alternative
