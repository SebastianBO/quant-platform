/**
 * Fey-style Motion Variants
 * Pre-built animation configurations for framer-motion
 */

import type { Variants, Transition } from 'framer-motion'

// =============================================================================
// TRANSITIONS
// =============================================================================

export const transitions = {
  // Spring-like bounce
  spring: {
    type: 'spring',
    stiffness: 400,
    damping: 30,
  } as Transition,

  // Smooth deceleration (Fey: 0.25s)
  smooth: {
    type: 'tween',
    duration: 0.25,
    ease: [0.22, 1, 0.36, 1],
  } as Transition,

  // Quick micro-interaction (Fey: 0.1s)
  quick: {
    type: 'tween',
    duration: 0.1,
    ease: 'easeOut',
  } as Transition,

  // Slow entrance
  slow: {
    type: 'tween',
    duration: 0.7,
    ease: [0.22, 1, 0.36, 1],
  } as Transition,

  // Very slow (hero animations)
  hero: {
    type: 'tween',
    duration: 1,
    ease: [0.22, 1, 0.36, 1],
  } as Transition,
}

// =============================================================================
// FADE VARIANTS
// =============================================================================

export const fadeVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: transitions.smooth,
  },
  exit: {
    opacity: 0,
    transition: transitions.quick,
  },
}

// =============================================================================
// SLIDE VARIANTS
// =============================================================================

export const slideUpVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: transitions.smooth,
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: transitions.quick,
  },
}

export const slideDownVariants: Variants = {
  hidden: {
    opacity: 0,
    y: -20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: transitions.smooth,
  },
}

export const slideLeftVariants: Variants = {
  hidden: {
    opacity: 0,
    x: 20,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: transitions.smooth,
  },
}

export const slideRightVariants: Variants = {
  hidden: {
    opacity: 0,
    x: -20,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: transitions.smooth,
  },
}

// =============================================================================
// SCALE VARIANTS
// =============================================================================

export const scaleVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: transitions.smooth,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: transitions.quick,
  },
}

export const popVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: transitions.spring,
  },
}

// =============================================================================
// STAGGER CONTAINER
// =============================================================================

export const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
}

export const staggerItemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: transitions.smooth,
  },
}

// Faster stagger for cards
export const cardStaggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.2,
    },
  },
}

// =============================================================================
// CARD STACK VARIANTS (Fey-style notification stack)
// =============================================================================

export const cardStackVariants = {
  container: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        staggerDirection: -1, // Reverse order (back cards first)
      },
    },
  } as Variants,

  card: (index: number): Variants => ({
    hidden: {
      opacity: 0,
      y: 30,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        ...transitions.slow,
        delay: index * 0.1,
      },
    },
  }),
}

// =============================================================================
// HOVER VARIANTS
// =============================================================================

export const hoverLiftVariants: Variants = {
  initial: { y: 0, scale: 1 },
  hover: {
    y: -4,
    scale: 1.02,
    transition: transitions.quick,
  },
  tap: {
    scale: 0.98,
    transition: { duration: 0.1 },
  },
}

export const hoverGlowVariants: Variants = {
  initial: {
    boxShadow: '0 0 0 rgba(71, 159, 250, 0)',
  },
  hover: {
    boxShadow: '0 0 30px rgba(71, 159, 250, 0.2)',
    transition: transitions.smooth,
  },
}

export const hoverScaleVariants: Variants = {
  initial: { scale: 1 },
  hover: {
    scale: 1.05,
    transition: transitions.quick,
  },
  tap: {
    scale: 0.95,
    transition: { duration: 0.1 },
  },
}

// =============================================================================
// BUTTON VARIANTS
// =============================================================================

export const buttonVariants: Variants = {
  initial: { scale: 1 },
  hover: {
    scale: 1.02,
    transition: transitions.quick,
  },
  tap: {
    scale: 0.98,
    transition: { duration: 0.08 },
  },
}

// =============================================================================
// TEXT REVEAL VARIANTS
// =============================================================================

export const textRevealVariants: Variants = {
  hidden: {
    opacity: 0,
    y: '100%',
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
  },
}

export const wordRevealContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
}

export const wordRevealVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
    rotateX: -40,
  },
  visible: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
    },
  },
}

// =============================================================================
// PARALLAX SCROLL VARIANTS
// =============================================================================

export const parallaxVariants = {
  // Subtle parallax for backgrounds
  subtle: {
    initial: { y: 0 },
    scroll: (progress: number) => ({
      y: progress * -30,
    }),
  },
  // Medium parallax for elements
  medium: {
    initial: { y: 0 },
    scroll: (progress: number) => ({
      y: progress * -60,
    }),
  },
  // Strong parallax for hero elements
  strong: {
    initial: { y: 0 },
    scroll: (progress: number) => ({
      y: progress * -100,
    }),
  },
}

// =============================================================================
// DOCK ICON VARIANTS (macOS-style)
// =============================================================================

export const dockIconVariants: Variants = {
  initial: {
    scale: 1,
    y: 0,
  },
  hover: {
    scale: 1.3,
    y: -10,
    transition: transitions.spring,
  },
}

// Adjacent icons in dock
export const dockNeighborVariants = (distance: number): Variants => ({
  initial: { scale: 1 },
  hover: {
    scale: 1 + (0.2 / (distance + 1)),
    transition: transitions.spring,
  },
})

// =============================================================================
// NOTIFICATION SLIDE VARIANTS
// =============================================================================

export const notificationVariants: Variants = {
  hidden: {
    opacity: 0,
    x: 100,
    scale: 0.9,
  },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 25,
    },
  },
  exit: {
    opacity: 0,
    x: 100,
    scale: 0.9,
    transition: {
      duration: 0.2,
      ease: 'easeIn',
    },
  },
}

// =============================================================================
// SHIMMER/SHINE EFFECT
// =============================================================================

export const shimmerVariants: Variants = {
  initial: {
    x: '-100%',
  },
  animate: {
    x: '100%',
    transition: {
      duration: 1.5,
      ease: 'easeInOut',
      repeat: Infinity,
      repeatDelay: 2,
    },
  },
}

// =============================================================================
// PULSE VARIANTS
// =============================================================================

export const pulseVariants: Variants = {
  initial: { scale: 1, opacity: 1 },
  animate: {
    scale: [1, 1.05, 1],
    opacity: [1, 0.8, 1],
    transition: {
      duration: 2,
      ease: 'easeInOut',
      repeat: Infinity,
    },
  },
}

// Live indicator pulse
export const livePulseVariants: Variants = {
  initial: { scale: 1, opacity: 1 },
  animate: {
    scale: [1, 1.5, 1],
    opacity: [1, 0, 1],
    transition: {
      duration: 1.5,
      ease: 'easeOut',
      repeat: Infinity,
    },
  },
}

// =============================================================================
// MODAL/DRAWER VARIANTS
// =============================================================================

export const modalOverlayVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.2 },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.15, delay: 0.1 },
  },
}

export const modalContentVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: 20,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 30,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 10,
    transition: { duration: 0.15 },
  },
}

export const drawerVariants = {
  right: {
    hidden: { x: '100%', opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: transitions.smooth,
    },
    exit: {
      x: '100%',
      opacity: 0,
      transition: transitions.quick,
    },
  } as Variants,
  left: {
    hidden: { x: '-100%', opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: transitions.smooth,
    },
    exit: {
      x: '-100%',
      opacity: 0,
      transition: transitions.quick,
    },
  } as Variants,
  bottom: {
    hidden: { y: '100%', opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: transitions.smooth,
    },
    exit: {
      y: '100%',
      opacity: 0,
      transition: transitions.quick,
    },
  } as Variants,
}

// =============================================================================
// TOOLTIP/POPOVER VARIANTS
// =============================================================================

export const tooltipVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: 4,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.12,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.08 },
  },
}

export const popoverVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.96,
    y: 8,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: transitions.quick,
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: 4,
    transition: { duration: 0.1 },
  },
}

// =============================================================================
// TAB/SWITCH VARIANTS
// =============================================================================

export const tabIndicatorVariants: Variants = {
  initial: { scaleX: 0 },
  animate: {
    scaleX: 1,
    transition: transitions.spring,
  },
}

export const tabContentVariants: Variants = {
  hidden: {
    opacity: 0,
    x: 10,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: transitions.quick,
  },
  exit: {
    opacity: 0,
    x: -10,
    transition: { duration: 0.1 },
  },
}

// =============================================================================
// FORM INPUT VARIANTS
// =============================================================================

export const inputFocusVariants: Variants = {
  idle: {
    borderColor: 'rgba(255, 255, 255, 0.08)',
    boxShadow: '0 0 0 0 rgba(71, 159, 250, 0)',
  },
  focused: {
    borderColor: 'rgba(71, 159, 250, 0.5)',
    boxShadow: '0 0 0 3px rgba(71, 159, 250, 0.1)',
    transition: { duration: 0.15 },
  },
  error: {
    borderColor: 'rgba(225, 82, 65, 0.5)',
    boxShadow: '0 0 0 3px rgba(225, 82, 65, 0.1)',
    transition: { duration: 0.15 },
  },
}

// =============================================================================
// PROGRESS/LOADING VARIANTS
// =============================================================================

export const progressBarVariants: Variants = {
  initial: { scaleX: 0 },
  animate: (progress: number) => ({
    scaleX: progress,
    transition: {
      type: 'spring',
      stiffness: 50,
      damping: 15,
    },
  }),
}

export const skeletonWaveVariants: Variants = {
  initial: {
    backgroundPosition: '-200% 0',
  },
  animate: {
    backgroundPosition: '200% 0',
    transition: {
      duration: 1.5,
      ease: 'linear',
      repeat: Infinity,
    },
  },
}

// =============================================================================
// CARD FLIP VARIANTS
// =============================================================================

export const cardFlipVariants: Variants = {
  initial: {
    rotateY: 0,
  },
  flipped: {
    rotateY: 180,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
  },
}

// =============================================================================
// BADGE/CHIP VARIANTS
// =============================================================================

export const badgePopVariants: Variants = {
  initial: { scale: 0, opacity: 0 },
  animate: {
    scale: 1,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 500,
      damping: 25,
    },
  },
  exit: {
    scale: 0,
    opacity: 0,
    transition: { duration: 0.1 },
  },
}
