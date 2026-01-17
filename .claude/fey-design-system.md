# Fey Design System - Pixel-Perfect Reference

**Source:** fey.com (extracted January 2026)
**Goal:** Apple-level precision. Every component must match exactly.

## Colors

### Core Palette
```
--fey-black: #000000          // Primary background
--fey-white: #ffffff          // Primary text
--fey-muted: #868F97          // Secondary text, descriptions
--fey-link: #479FFA           // Links, interactive blue
--fey-success: #4EBE96        // Positive, online, gains
--fey-warning: #FFA16C        // Alerts, orange
--fey-error: #FF5C5C          // Errors, losses, red
--fey-lime: #D6FE51           // Highlight accent
--fey-pink: #E75ECE           // Special accent
```

### Border & Overlay Opacities
```
--fey-border: rgba(255, 255, 255, 0.08)       // Default borders
--fey-border-hover: rgba(255, 255, 255, 0.15) // Hover state borders
--fey-overlay-subtle: rgba(255, 255, 255, 0.04)
--fey-overlay-light: rgba(255, 255, 255, 0.08)
--fey-overlay-medium: rgba(255, 255, 255, 0.12)
--fey-overlay-strong: rgba(255, 255, 255, 0.24)
```

### Gradients
```css
/* Orange gradient */
background: linear-gradient(97.13deg, #FFA16C 8.47%, #551B10 108.41%);

/* Blue gradient */
background: linear-gradient(96.44deg, #B6D6FF 6.12%, #393F56 110.28%);

/* Lime gradient */
background: linear-gradient(96.44deg, #D6FE51 6.12%, #58510B 110.28%);
```

## Typography

### Font Family
```css
/* Fey uses Calibre - we use Inter as closest match */
font-family: var(--font-inter), 'Inter', system-ui, -apple-system, sans-serif;

/* Monospace for code/numbers */
font-family: var(--font-mono), 'JetBrains Mono', 'SF Mono', monospace;
```

### Type Scale (Exact Values)
```
H1:        48px,  font-weight: 600, line-height: 1.1
H2:        54px,  font-weight: 600, line-height: 1.0
H3:        26px,  font-weight: 600, line-height: 1.2
H4:        18px,  font-weight: 700, line-height: 1.4
Body:      18px,  font-weight: 400, line-height: 1.32
Body-sm:   14px,  font-weight: 400, line-height: 1.25
Caption:   12px,  font-weight: 400, line-height: 1.3
Micro:     10px,  font-weight: 500, line-height: 1.2
```

### Letter Spacing
```
Headings:    -0.02em (tracking-[-0.02em])
Numbers:     -0.8px (tight tracking on financial figures)
Body:        normal
Uppercase:   0.05em to 0.1em
```

## Spacing (8px Base Grid)

```
--space-1:  8px
--space-2:  16px
--space-3:  24px
--space-4:  32px
--space-5:  40px
--space-6:  48px
--space-8:  64px
--space-10: 80px
--space-12: 96px
```

### Container
```css
max-width: 1220px;
padding-inline: 40px;  /* Desktop */
padding-inline: 20px;  /* Mobile */
```

## Border Radius

```
--radius-full: 99px    // Pills, fully rounded buttons
--radius-card: 16px    // Cards, modals
--radius-lg: 12px      // Large elements
--radius-md: 8px       // Buttons, inputs
--radius-sm: 6px       // Small elements, tags
--radius-xs: 4px       // Tiny elements
```

## Shadows

### Standard Card Shadow
```css
box-shadow:
  0px 30px 16px rgba(0, 0, 0, 0.12),
  0px 16px 8px rgba(0, 0, 0, 0.07),
  0px 6px 4px rgba(0, 0, 0, 0.04);
```

### Elevated Shadow
```css
box-shadow: 0px 118px 112px rgba(0, 0, 0, 0.5);
```

### Inner Light (Glassmorphism)
```css
box-shadow: inset 1.25px 1.25px 1.25px rgba(255, 255, 255, 0.32);
```

### Glow Effect
```css
box-shadow: 0 0 40px rgba(78, 190, 150, 0.3);  /* Success glow */
box-shadow: 0 0 40px rgba(71, 159, 250, 0.3);  /* Link glow */
```

## Glassmorphism

### Standard Glass Card
```css
background: rgba(255, 255, 255, 0.03);
backdrop-filter: blur(10px);
-webkit-backdrop-filter: blur(10px);
border: 1px solid rgba(255, 255, 255, 0.08);
border-radius: 16px;
```

### Heavy Glass (Modals)
```css
background: rgba(51, 51, 57, 0.7);
backdrop-filter: blur(21px);
border: 1px solid rgba(255, 255, 255, 0.12);
```

## Transitions & Animations

### Duration Tokens
```
--duration-instant: 100ms   // Micro interactions
--duration-fast: 150ms      // Hover states
--duration-normal: 250ms    // Standard transitions
--duration-slow: 400ms      // Complex animations
--duration-slower: 1000ms   // Page transitions
```

### Easing
```css
/* Standard ease */
transition-timing-function: cubic-bezier(0.22, 1, 0.36, 1);

/* Quick ease */
transition-timing-function: ease-out;
```

### Hover Transitions
```css
/* Color/opacity changes */
transition: color 150ms ease, opacity 150ms ease;

/* Transform changes */
transition: transform 200ms ease-out;
```

## Component Patterns

### Primary Button
```css
padding: 14px 46px 15px;
font-size: 18px;
font-weight: 600;
border-radius: 99px;
background: #ffffff;
color: #000000;
transition: opacity 150ms ease;

/* Hover */
opacity: 0.9;
```

### Secondary Button (Outline)
```css
padding: 12px 24px;
font-size: 14px;
font-weight: 500;
border-radius: 99px;
background: transparent;
border: 1px solid rgba(255, 255, 255, 0.15);
color: #ffffff;

/* Hover */
background: rgba(255, 255, 255, 0.05);
border-color: rgba(255, 255, 255, 0.25);
```

### Ghost Button
```css
padding: 8px 16px;
font-size: 14px;
background: transparent;
color: #868F97;

/* Hover */
color: #ffffff;
```

### Input Field
```css
padding: 14px 16px;
font-size: 16px;
background: rgba(255, 255, 255, 0.04);
border: 1px solid rgba(255, 255, 255, 0.08);
border-radius: 8px;
color: #ffffff;

/* Focus */
border-color: rgba(255, 255, 255, 0.24);
outline: none;
```

### Card
```css
background: rgba(255, 255, 255, 0.03);
border: 1px solid rgba(255, 255, 255, 0.08);
border-radius: 16px;
padding: 24px;

/* Hover */
border-color: rgba(255, 255, 255, 0.15);
background: rgba(255, 255, 255, 0.05);
```

### Badge/Tag
```css
padding: 4px 10px;
font-size: 12px;
font-weight: 500;
background: rgba(255, 255, 255, 0.08);
border-radius: 99px;
color: #868F97;
```

### Link
```css
color: #479FFA;
text-decoration: none;
transition: opacity 150ms ease;

/* Hover */
opacity: 0.8;
```

### Status Indicator (Online/Offline)
```css
/* Online */
.status-online {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #4EBE96;
  animation: pulse 2s ease-in-out infinite;
}

/* Offline */
.status-offline {
  background: #FF5C5C;
}

@keyframes pulse {
  0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(78, 190, 150, 0.4); }
  50% { opacity: 0.8; box-shadow: 0 0 0 8px rgba(78, 190, 150, 0); }
}
```

## Breakpoints

```
Mobile:    < 640px
Tablet:    640px - 1024px
Desktop:   1024px - 1280px
Wide:      > 1280px
```

## Dark Mode (Default)
All values above are for dark mode, which is Fey's primary theme.

## Light Mode
```css
.light {
  --fey-black: #ffffff;
  --fey-white: #000000;
  --fey-muted: #6b7280;
  --fey-border: rgba(0, 0, 0, 0.08);
  --fey-border-hover: rgba(0, 0, 0, 0.15);
  --fey-overlay-subtle: rgba(0, 0, 0, 0.02);
  --fey-overlay-light: rgba(0, 0, 0, 0.04);
}
```

## Tailwind Utility Mapping

| Fey Token | Tailwind Class |
|-----------|----------------|
| #000000 | `bg-black` or `bg-[#000]` |
| #ffffff | `text-white` |
| #868F97 | `text-[#868f97]` or `text-fey-muted` |
| #479FFA | `text-[#479ffa]` or `text-fey-blue` |
| #4EBE96 | `text-[#4ebe96]` or `text-fey-green` |
| #FFA16C | `text-[#ffa16c]` or `text-fey-orange` |
| #FF5C5C | `text-[#ff5c5c]` or `text-fey-red` |
| rgba(255,255,255,0.08) | `border-white/[0.08]` |
| rgba(255,255,255,0.03) | `bg-white/[0.03]` |
| blur(10px) | `backdrop-blur-[10px]` |
| 99px radius | `rounded-full` |
| 16px radius | `rounded-2xl` |
| 8px radius | `rounded-lg` |

## Checklist for Every Component

- [ ] Uses Inter font (not Geist, not system default)
- [ ] Background is #000 (pure black)
- [ ] Text colors: white for primary, #868F97 for secondary
- [ ] Links are #479FFA
- [ ] Success states are #4EBE96
- [ ] Error states are #FF5C5C
- [ ] Borders use rgba(255,255,255,0.08)
- [ ] Border radius matches (99px pills, 16px cards, 8px buttons)
- [ ] Hover states have color transitions (150ms ease)
- [ ] Glassmorphism uses backdrop-blur + white/[0.03] bg
- [ ] Buttons have proper padding (14px 46px for primary)
- [ ] Font sizes match (48px H1, 18px body, 14px small, 12px caption)
- [ ] Spacing uses 8px grid
- [ ] Motion respects prefers-reduced-motion
