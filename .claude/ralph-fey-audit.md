# Ralph Fey Design Audit Loop

**Purpose:** Systematically audit and fix EVERY component to match Fey.com design exactly.
**Standard:** Apple-level precision. No deviations.

## Fey Design Quick Reference

### Colors (MUST USE EXACTLY)
```
Background:      #000000 (pure black)
Card/Surface:    bg-white/[0.03] with backdrop-blur
Text Primary:    #ffffff
Text Secondary:  #868f97
Links:           #479ffa
Success/Online:  #4ebe96
Error/Offline:   #ff5c5c
Warning:         #ffa16c
Accent Lime:     #d6fe51
```

### Borders
```
Default:         border-white/[0.08]
Hover:           border-white/[0.15]
```

### Typography
```
Font:            Inter (--font-inter)
H1:              48px, font-bold, tracking-[-0.02em]
H2:              40-54px, font-bold
Body:            18px
Small:           14px
Caption:         12px
Monospace:       JetBrains Mono
Financial nums:  tabular-nums, tracking-[-0.8px]
```

### Border Radius
```
Pills/Buttons:   rounded-full (99px)
Cards:           rounded-2xl (16px)
Buttons:         rounded-lg (8px)
Tags:            rounded-full
```

### Transitions
```
Duration:        100-250ms
Easing:          ease-out or cubic-bezier(0.22, 1, 0.36, 1)
Properties:      ONLY transform, opacity, color, border-color
NEVER:           transition-all
```

### Glassmorphism
```css
bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08]
```

## Audit Checklist for Each Component

### Pass 1: Colors
- [ ] Background is pure black (#000 or bg-black)
- [ ] NO #0a0a0a, #111, #1a1a1a - use bg-white/[0.03] instead
- [ ] Text uses white or #868f97
- [ ] Links use #479ffa
- [ ] Success uses #4ebe96
- [ ] Error uses #ff5c5c

### Pass 2: Typography
- [ ] Uses Inter font (inherited from root)
- [ ] Headings have tracking-[-0.02em]
- [ ] Financial numbers have tabular-nums
- [ ] text-balance on headings
- [ ] text-pretty on body paragraphs

### Pass 3: Borders
- [ ] Uses border-white/[0.08] not hex colors
- [ ] Hover states use border-white/[0.15]

### Pass 4: Border Radius
- [ ] Pills/buttons use rounded-full
- [ ] Cards use rounded-2xl
- [ ] Small elements use rounded-lg

### Pass 5: Transitions
- [ ] Uses motion-safe: prefix
- [ ] Duration is 100-300ms
- [ ] Uses specific properties, not transition-all
- [ ] Easing is ease-out

### Pass 6: Glassmorphism
- [ ] Cards use bg-white/[0.03]
- [ ] backdrop-blur is applied
- [ ] Border is rgba not hex

### Pass 7: Accessibility
- [ ] motion-safe: on all animations
- [ ] focus-visible:ring-2 on interactive elements
- [ ] aria-label on icon-only buttons
- [ ] min-h-[44px] touch targets

## Components to Audit (Priority Order)

### Critical (User-Facing Daily)
1. [ ] ManusStyleHome.tsx - Homepage hero
2. [ ] Header.tsx - Global nav
3. [ ] Footer.tsx - Global footer
4. [ ] GlobalChat.tsx - AI chat widget
5. [ ] AutonomousChat.tsx - Chat interface

### High Priority (Core Features)
6. [ ] StockSearchCommand.tsx
7. [ ] InteractiveStockChart.tsx
8. [ ] MarketOverview.tsx
9. [ ] EarningsCalendar.tsx
10. [ ] FinancialStatements.tsx

### Medium Priority (Feature Pages)
11. [ ] BiotechCatalysts.tsx
12. [ ] InsiderTrading.tsx
13. [ ] AnalystRatings.tsx
14. [ ] InstitutionalOwnership.tsx
15. [ ] DCFCalculator.tsx

### Pages
16. [ ] src/app/page.tsx
17. [ ] src/app/developers/page.tsx
18. [ ] src/app/premium/page.tsx
19. [ ] src/app/login/page.tsx
20. [ ] src/app/screener/page.tsx

## Violation Patterns to Search

```bash
# Find wrong background colors
grep -r "#0a0a0a\|#111\|#1a1a1a" src/

# Find wrong border patterns
grep -r "border-\[#\|border-gray" src/

# Find transition-all
grep -r "transition-all" src/

# Find missing motion-safe
grep -r "animate-\|transition-" src/ | grep -v "motion-safe"

# Find wrong font references
grep -r "Geist\|system-ui" src/
```

## Example Fixes

### Wrong: Hex background
```tsx
<div className="bg-[#111]">
```

### Right: Fey glassmorphism
```tsx
<div className="bg-white/[0.03] backdrop-blur-[10px]">
```

### Wrong: Hex border
```tsx
<div className="border border-[#333]">
```

### Right: Fey border
```tsx
<div className="border border-white/[0.08]">
```

### Wrong: transition-all
```tsx
<button className="transition-all duration-200">
```

### Right: Specific transitions
```tsx
<button className="motion-safe:transition-colors duration-150 ease-out">
```

## Ralph Loop Instructions

For each iteration:
1. Pick next component from checklist
2. Read the component file
3. Run through all 7 passes
4. Make fixes
5. Mark component as done
6. Commit changes
7. Move to next component

Never mark as done until ALL passes are complete for that component.
