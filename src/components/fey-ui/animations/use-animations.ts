'use client'

/**
 * Custom Animation Hooks
 * Reusable animation logic for Fey-style components
 */

import { useEffect, useRef, useState, useCallback } from 'react'
import { useInView, useScroll, useTransform, useSpring, MotionValue } from 'framer-motion'

// =============================================================================
// useScrollReveal - Trigger animation when element enters viewport
// =============================================================================

interface UseScrollRevealOptions {
  threshold?: number
  once?: boolean
  rootMargin?: string
}

export function useScrollReveal(options: UseScrollRevealOptions = {}) {
  const { threshold = 0.1, once = true, rootMargin = '0px' } = options
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, {
    amount: threshold,
    once,
    margin: rootMargin as `${number}px ${number}px ${number}px ${number}px`,
  })

  return { ref, isInView }
}

// =============================================================================
// useStaggeredReveal - For staggered children animations
// =============================================================================

export function useStaggeredReveal(itemCount: number, baseDelay = 0.1) {
  const { ref, isInView } = useScrollReveal()

  const getDelay = useCallback((index: number) => {
    return isInView ? index * baseDelay : 0
  }, [isInView, baseDelay])

  return { ref, isInView, getDelay }
}

// =============================================================================
// useParallax - Smooth parallax scrolling
// =============================================================================

interface UseParallaxOptions {
  speed?: number // 0.5 = half speed, 2 = double speed
  direction?: 'up' | 'down'
}

export function useParallax(options: UseParallaxOptions = {}) {
  const { speed = 0.5, direction = 'up' } = options
  const ref = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })

  const multiplier = direction === 'up' ? -1 : 1
  const y = useTransform(scrollYProgress, [0, 1], [0, 100 * speed * multiplier])
  const smoothY = useSpring(y, { stiffness: 100, damping: 30 })

  return { ref, y: smoothY }
}

// =============================================================================
// useMousePosition - Track mouse for interactive effects
// =============================================================================

interface MousePosition {
  x: number
  y: number
  normalizedX: number // -1 to 1
  normalizedY: number // -1 to 1
}

export function useMousePosition() {
  const [position, setPosition] = useState<MousePosition>({
    x: 0,
    y: 0,
    normalizedX: 0,
    normalizedY: 0,
  })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const normalizedX = (e.clientX / window.innerWidth) * 2 - 1
      const normalizedY = (e.clientY / window.innerHeight) * 2 - 1

      setPosition({
        x: e.clientX,
        y: e.clientY,
        normalizedX,
        normalizedY,
      })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return position
}

// =============================================================================
// useMouseFollowGradient - Gradient that follows mouse
// =============================================================================

interface UseMouseFollowGradientOptions {
  color?: string
  size?: number
  opacity?: number
}

export function useMouseFollowGradient(options: UseMouseFollowGradientOptions = {}) {
  const {
    color = '71, 159, 250', // RGB values
    size = 600,
    opacity = 0.06,
  } = options

  const { x, y } = useMousePosition()

  const gradientStyle = {
    background: `radial-gradient(${size}px circle at ${x}px ${y}px, rgba(${color}, ${opacity}), transparent 40%)`,
  }

  return { gradientStyle, x, y }
}

// =============================================================================
// useHoverTilt - 3D tilt effect on hover
// =============================================================================

interface TiltState {
  rotateX: number
  rotateY: number
}

export function useHoverTilt(intensity = 10) {
  const ref = useRef<HTMLDivElement>(null)
  const [tilt, setTilt] = useState<TiltState>({ rotateX: 0, rotateY: 0 })

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return

    const rect = ref.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    const rotateX = ((e.clientY - centerY) / (rect.height / 2)) * -intensity
    const rotateY = ((e.clientX - centerX) / (rect.width / 2)) * intensity

    setTilt({ rotateX, rotateY })
  }, [intensity])

  const handleMouseLeave = useCallback(() => {
    setTilt({ rotateX: 0, rotateY: 0 })
  }, [])

  const tiltStyle = {
    transform: `perspective(1000px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg)`,
    transition: 'transform 0.1s ease-out',
  }

  return {
    ref,
    tiltStyle,
    handlers: {
      onMouseMove: handleMouseMove,
      onMouseLeave: handleMouseLeave,
    },
  }
}

// =============================================================================
// useScrollProgress - Track scroll progress within element
// =============================================================================

export function useScrollProgress() {
  const ref = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })

  return { ref, progress: scrollYProgress }
}

// =============================================================================
// useSmoothCounter - Animated number counter
// =============================================================================

interface UseSmoothCounterOptions {
  start?: number
  end: number
  duration?: number
  delay?: number
}

export function useSmoothCounter(options: UseSmoothCounterOptions) {
  const { start = 0, end, duration = 2000, delay = 0 } = options
  const [count, setCount] = useState(start)
  const { ref, isInView } = useScrollReveal({ once: true })

  useEffect(() => {
    if (!isInView) return

    const timeout = setTimeout(() => {
      const startTime = Date.now()
      const endTime = startTime + duration

      const updateCount = () => {
        const now = Date.now()
        const progress = Math.min((now - startTime) / duration, 1)

        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3)
        const currentCount = Math.round(start + (end - start) * eased)

        setCount(currentCount)

        if (now < endTime) {
          requestAnimationFrame(updateCount)
        }
      }

      requestAnimationFrame(updateCount)
    }, delay)

    return () => clearTimeout(timeout)
  }, [isInView, start, end, duration, delay])

  return { ref, count }
}

// =============================================================================
// useReducedMotion - Respect user's motion preferences
// =============================================================================

export function useReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mediaQuery.matches)

    const handleChange = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return reducedMotion
}

// =============================================================================
// useScrollVelocity - Track scroll speed for dynamic effects
// =============================================================================

export function useScrollVelocity() {
  const [velocity, setVelocity] = useState(0)
  const lastScrollY = useRef(0)
  const lastTime = useRef(Date.now())

  useEffect(() => {
    const handleScroll = () => {
      const now = Date.now()
      const dt = now - lastTime.current
      const dy = window.scrollY - lastScrollY.current

      if (dt > 0) {
        setVelocity(dy / dt)
      }

      lastScrollY.current = window.scrollY
      lastTime.current = now
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return velocity
}

// =============================================================================
// Export all
// =============================================================================

export {
  useInView,
  useScroll,
  useTransform,
  useSpring,
  type MotionValue,
}
