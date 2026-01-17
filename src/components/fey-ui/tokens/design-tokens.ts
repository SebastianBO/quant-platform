/**
 * Fey Design System Tokens
 * Extracted from fey.com - January 2026
 */

// =============================================================================
// COLORS
// =============================================================================

export const colors = {
  // Backgrounds
  bg: {
    primary: '#000000',
    secondary: '#070707',
    tertiary: '#0b0b0b',
    elevated: '#131313',
    surface: '#1a1a1a',
  },

  // Text
  text: {
    primary: '#ffffff',
    secondary: 'rgba(255, 255, 255, 0.6)',
    tertiary: 'rgba(134, 143, 151, 0.6)',
    muted: '#868f97',
    subtle: '#828282',
  },

  // Accents
  accent: {
    blue: '#479ffa',      // Primary blue
    green: '#4ebe96',     // Success/positive
    orange: '#ffa16c',    // Highlights
    lime: '#d6fe51',      // Logo/brand
    pink: '#e75ece',      // Special
    red: '#ff5c5c',       // Error/negative
  },

  // Button
  button: {
    primary: '#e6e6e6',
    primaryHover: '#ffffff',
    ghost: 'rgba(255, 255, 255, 0.05)',
    ghostHover: 'rgba(255, 255, 255, 0.1)',
  },

  // Borders
  border: {
    subtle: 'rgba(255, 255, 255, 0.04)',
    default: 'rgba(255, 255, 255, 0.08)',
    medium: 'rgba(255, 255, 255, 0.1)',
    strong: 'rgba(255, 255, 255, 0.16)',
    highlight: 'rgba(255, 255, 255, 0.24)',
  },

  // Surface overlays
  overlay: {
    ultraSubtle: 'rgba(255, 255, 255, 0.02)',
    subtle: 'rgba(255, 255, 255, 0.04)',
    light: 'rgba(255, 255, 255, 0.05)',
    medium: 'rgba(255, 255, 255, 0.08)',
    strong: 'rgba(255, 255, 255, 0.16)',
    prominent: 'rgba(255, 255, 255, 0.2)',
  },
} as const

// =============================================================================
// TYPOGRAPHY
// =============================================================================

export const typography = {
  fontFamily: {
    // Fey uses Calibre, we'll use Inter as close alternative
    sans: "'Inter', system-ui, -apple-system, sans-serif",
    mono: "'JetBrains Mono', 'SF Mono', monospace",
  },

  fontSize: {
    xs: '11px',
    sm: '12px',
    base: '14px',
    md: '16px',
    lg: '18px',
    xl: '26px',
    '2xl': '36px',
    '3xl': '48px',
    '4xl': '54px',
    '5xl': '64px',
  },

  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },

  lineHeight: {
    tight: '1',
    snug: '1.1',
    normal: '1.36',
    relaxed: '1.5',
  },

  letterSpacing: {
    tight: '-0.02em',
    normal: '0',
  },
} as const

// =============================================================================
// SPACING
// =============================================================================

export const spacing = {
  px: '1px',
  0: '0',
  0.5: '2px',
  1: '4px',
  1.5: '6px',
  2: '8px',
  2.5: '10px',
  3: '12px',
  3.5: '14px',
  4: '16px',
  5: '20px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
  20: '80px',
  24: '96px',
} as const

// =============================================================================
// BORDER RADIUS
// =============================================================================

export const borderRadius = {
  none: '0',
  sm: '4px',
  md: '6px',
  lg: '8px',
  xl: '12px',
  '2xl': '16px',
  '3xl': '24px',
  full: '9999px',
} as const

// =============================================================================
// SHADOWS
// =============================================================================

export const shadows = {
  // Card shadows with progressive depth
  card: {
    sm: '0 4px 20px rgba(0, 0, 0, 0.5)',
    md: '0 8px 30px rgba(0, 0, 0, 0.6)',
    lg: '0 12px 40px rgba(0, 0, 0, 0.7)',
    xl: '0 20px 60px rgba(0, 0, 0, 0.8)',
  },

  // Button shadows
  button: {
    primary: 'rgba(255, 255, 255, 0.25) 0px 0px 14px 0px',
    inset: 'rgba(255, 255, 255, 0.5) 0px -2px 4px 0px inset, rgb(255, 255, 255) 0px 0px 2px 0px inset',
    subtle: 'rgba(0, 0, 0, 0.85) 0px 1px 0px 0px',
  },

  // Pill/badge shadows
  pill: `
    rgba(0, 0, 0, 0.12) 0px 30px 16px 0px,
    rgba(0, 0, 0, 0.07) 0px 16px 8px 0px,
    rgba(0, 0, 0, 0.05) 0px 8px 4px 0px
  `,

  // Glow effects
  glow: {
    blue: '0 0 20px rgba(71, 159, 250, 0.3)',
    green: '0 0 20px rgba(78, 190, 150, 0.3)',
    orange: '0 0 20px rgba(255, 161, 108, 0.3)',
  },
} as const

// =============================================================================
// EFFECTS / GLASSMORPHISM
// =============================================================================

export const effects = {
  blur: {
    sm: 'blur(4px)',
    md: 'blur(10px)',
    lg: 'blur(18px)',
    xl: 'blur(21px)',
    '2xl': 'blur(75px)',
    extreme: 'blur(217px)',
  },

  glass: {
    // Subtle glass card
    subtle: {
      background: 'rgba(26, 27, 32, 0.6)',
      backdropFilter: 'blur(10px)',
      border: 'rgba(255, 255, 255, 0.08)',
    },
    // Prominent glass card
    prominent: {
      background: 'rgba(51, 51, 57, 0.7)',
      backdropFilter: 'blur(18px)',
      border: 'rgba(255, 255, 255, 0.1)',
    },
    // Navigation glass
    nav: {
      background: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(10px)',
      border: 'rgba(255, 255, 255, 0.04)',
    },
  },

  // Common gradients
  gradients: {
    // Surface gradient (subtle depth)
    surface: 'linear-gradient(182.51deg, rgba(255, 255, 255, 0.04) 27.09%, rgba(90, 90, 90, 0.04) 58.59%, rgba(0, 0, 0, 0) 100%)',
    // Text fade gradient
    textFade: 'linear-gradient(87.11deg, rgb(255, 255, 255) 17.87%, rgba(255, 255, 255, 0.9) 45.18%, rgba(255, 255, 255, 0.6) 100%)',
    // Orange accent
    orange: 'linear-gradient(97.13deg, rgb(255, 161, 108) 8.47%, rgb(85, 27, 16) 108.41%)',
    // Blue accent
    blue: 'linear-gradient(96.44deg, rgb(182, 214, 255) 6.12%, rgb(57, 63, 86) 110.28%)',
    // Lime accent
    lime: 'linear-gradient(96.44deg, rgb(214, 254, 81) 6.12%, rgb(88, 81, 11) 110.28%)',
    // Bottom fade overlay
    bottomFade: 'linear-gradient(rgba(0, 0, 0, 0) 0%, rgb(0, 0, 0) 98%)',
  },
} as const

// =============================================================================
// ANIMATION
// =============================================================================

export const animation = {
  duration: {
    instant: '0.1s',
    fast: '0.15s',
    normal: '0.3s',
    slow: '0.5s',
    slower: '0.7s',
    slowest: '1s',
  },

  easing: {
    // Standard easings
    linear: 'linear',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    // Spring-like
    spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    // Smooth deceleration
    smooth: 'cubic-bezier(0.22, 1, 0.36, 1)',
  },

  // Pre-built transitions
  transition: {
    color: 'color 0.1s',
    opacity: 'opacity 0.1s',
    background: 'background 0.15s',
    transform: 'transform 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
    all: 'all 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
  },
} as const

// =============================================================================
// Z-INDEX SCALE
// =============================================================================

export const zIndex = {
  base: 0,
  dropdown: 10,
  sticky: 20,
  fixed: 30,
  modalBackdrop: 40,
  modal: 50,
  popover: 60,
  tooltip: 70,
  toast: 80,
} as const

// =============================================================================
// BREAKPOINTS
// =============================================================================

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1440px',
} as const

// Export everything as a single theme object
export const feyTheme = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  effects,
  animation,
  zIndex,
  breakpoints,
} as const

export type FeyTheme = typeof feyTheme
