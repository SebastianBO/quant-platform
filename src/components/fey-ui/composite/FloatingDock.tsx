'use client'

import { useState, useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { cn } from '@/lib/utils'

// =============================================================================
// FLOATING DOCK - macOS-style dock with magnification
// =============================================================================

export interface DockItem {
  id: string
  icon: React.ReactNode
  label: string
  onClick?: () => void
  active?: boolean
}

export interface FloatingDockProps {
  items: DockItem[]
  className?: string
  magnification?: number // How much icons scale on hover (1.3 = 30% larger)
  distance?: number // Pixel distance for magnification effect
}

export function FloatingDock({
  items,
  className,
  magnification = 1.4,
  distance = 140,
}: FloatingDockProps) {
  const mouseX = useMotionValue(Infinity)

  return (
    <motion.div
      className={cn(
        'flex items-center gap-1 px-2 py-2',
        'bg-[#1a1a1a]/95 backdrop-blur-xl rounded-full',
        'border border-white/[0.08] shadow-2xl',
        className
      )}
      onMouseMove={(e) => mouseX.set(e.pageX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      {items.map((item, i) => (
        <DockIcon
          key={item.id}
          item={item}
          mouseX={mouseX}
          magnification={magnification}
          distance={distance}
        />
      ))}
    </motion.div>
  )
}

// =============================================================================
// DOCK ICON - Individual icon with magnification
// =============================================================================

interface DockIconProps {
  item: DockItem
  mouseX: ReturnType<typeof useMotionValue<number>>
  magnification: number
  distance: number
}

function DockIcon({ item, mouseX, magnification, distance }: DockIconProps) {
  const ref = useRef<HTMLButtonElement>(null)

  const distanceFromMouse = useTransform(mouseX, (val) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 }
    return val - bounds.x - bounds.width / 2
  })

  const widthSync = useTransform(
    distanceFromMouse,
    [-distance, 0, distance],
    [40, 40 * magnification, 40]
  )

  const width = useSpring(widthSync, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  })

  return (
    <motion.button
      ref={ref}
      onClick={item.onClick}
      className={cn(
        'aspect-square flex items-center justify-center rounded-full',
        'transition-colors duration-150',
        item.active
          ? 'bg-white/[0.15] text-white'
          : 'text-[#868f97] hover:text-white hover:bg-white/[0.08]'
      )}
      style={{ width }}
      whileTap={{ scale: 0.95 }}
      aria-label={item.label}
    >
      <motion.div
        className="flex items-center justify-center"
        style={{
          width: useTransform(width, (w) => w * 0.5),
          height: useTransform(width, (w) => w * 0.5),
        }}
      >
        {item.icon}
      </motion.div>
    </motion.button>
  )
}

// =============================================================================
// DOCK DIVIDER
// =============================================================================

export function DockDivider() {
  return <div className="w-px h-6 bg-white/10 mx-1" />
}

// =============================================================================
// PRESET ICONS
// =============================================================================

export const DockIcons = {
  Home: () => (
    <svg className="size-full" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 3l9 8v10h-6v-6h-6v6H3V11l9-8z" />
    </svg>
  ),

  Edit: () => (
    <svg className="size-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path d="M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  ),

  Calendar: () => (
    <svg className="size-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  ),

  Bookmark: () => (
    <svg className="size-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2v16z" />
    </svg>
  ),

  Mail: () => (
    <svg className="size-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="M22 6l-10 7L2 6" />
    </svg>
  ),

  Scissors: () => (
    <svg className="size-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <circle cx="6" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <path d="M20 4L8.12 15.88M14.47 14.48L20 20M8.12 8.12L12 12" />
    </svg>
  ),

  Settings: () => (
    <svg className="size-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
    </svg>
  ),

  Search: () => (
    <svg className="size-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <circle cx="11" cy="11" r="8" />
      <path d="M21 21l-4.35-4.35" />
    </svg>
  ),

  Chart: () => (
    <svg className="size-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path d="M3 3v18h18" />
      <path d="M7 16l4-4 4 4 6-6" />
    </svg>
  ),

  Bell: () => (
    <svg className="size-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
    </svg>
  ),

  User: () => (
    <svg className="size-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),

  Star: () => (
    <svg className="size-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  ),
}

// =============================================================================
// PRESET DOCK CONFIG - Fey-style dock
// =============================================================================

export const feyDockItems: DockItem[] = [
  { id: 'home', icon: <DockIcons.Home />, label: 'Home', active: true },
  { id: 'edit', icon: <DockIcons.Edit />, label: 'Edit' },
  { id: 'calendar', icon: <DockIcons.Calendar />, label: 'Calendar' },
  { id: 'bookmark', icon: <DockIcons.Bookmark />, label: 'Bookmarks' },
  { id: 'mail', icon: <DockIcons.Mail />, label: 'Mail' },
  { id: 'scissors', icon: <DockIcons.Scissors />, label: 'Tools' },
  { id: 'settings', icon: <DockIcons.Settings />, label: 'Settings' },
]
