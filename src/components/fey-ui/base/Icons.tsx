'use client'

import { memo } from 'react'
import { cn } from '@/lib/utils'

// =============================================================================
// ICON WRAPPER
// =============================================================================

interface IconProps {
  className?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
}

const sizeMap = {
  xs: 'size-3',
  sm: 'size-4',
  md: 'size-5',
  lg: 'size-6',
  xl: 'size-8',
}

// =============================================================================
// FINANCIAL ICONS
// =============================================================================

export const TrendUpIcon = memo(function TrendUpIcon({ className, size = 'md' }: IconProps) {
  return (
    <svg className={cn(sizeMap[size], className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 6l-9.5 9.5-5-5L1 18" />
      <path d="M17 6h6v6" />
    </svg>
  )
})

export const TrendDownIcon = memo(function TrendDownIcon({ className, size = 'md' }: IconProps) {
  return (
    <svg className={cn(sizeMap[size], className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 18l-9.5-9.5-5 5L1 6" />
      <path d="M17 18h6v-6" />
    </svg>
  )
})

export const ChartLineIcon = memo(function ChartLineIcon({ className, size = 'md' }: IconProps) {
  return (
    <svg className={cn(sizeMap[size], className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v18h18" />
      <path d="M7 16l4-4 4 4 6-6" />
    </svg>
  )
})

export const ChartBarIcon = memo(function ChartBarIcon({ className, size = 'md' }: IconProps) {
  return (
    <svg className={cn(sizeMap[size], className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="12" width="4" height="9" rx="1" />
      <rect x="10" y="8" width="4" height="13" rx="1" />
      <rect x="17" y="3" width="4" height="18" rx="1" />
    </svg>
  )
})

export const CandlestickIcon = memo(function CandlestickIcon({ className, size = 'md' }: IconProps) {
  return (
    <svg className={cn(sizeMap[size], className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 4v4m0 8v4M6 8a2 2 0 012 2v4a2 2 0 01-4 0v-4a2 2 0 012-2z" />
      <path d="M18 4v2m0 12v2M18 6a2 2 0 012 2v8a2 2 0 01-4 0V8a2 2 0 012-2z" />
    </svg>
  )
})

export const DollarIcon = memo(function DollarIcon({ className, size = 'md' }: IconProps) {
  return (
    <svg className={cn(sizeMap[size], className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
    </svg>
  )
})

export const WalletIcon = memo(function WalletIcon({ className, size = 'md' }: IconProps) {
  return (
    <svg className={cn(sizeMap[size], className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M16 14a2 2 0 100-4 2 2 0 000 4z" />
    </svg>
  )
})

// =============================================================================
// NOTIFICATION & ALERT ICONS
// =============================================================================

export const BellIcon = memo(function BellIcon({ className, size = 'md' }: IconProps) {
  return (
    <svg className={cn(sizeMap[size], className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 01-3.46 0" />
    </svg>
  )
})

export const BellAlertIcon = memo(function BellAlertIcon({ className, size = 'md' }: IconProps) {
  return (
    <svg className={cn(sizeMap[size], className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 01-3.46 0" />
      <circle cx="18" cy="5" r="3" fill="currentColor" stroke="none" />
    </svg>
  )
})

export const AlertTriangleIcon = memo(function AlertTriangleIcon({ className, size = 'md' }: IconProps) {
  return (
    <svg className={cn(sizeMap[size], className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      <path d="M12 9v4M12 17h.01" />
    </svg>
  )
})

export const AlertCircleIcon = memo(function AlertCircleIcon({ className, size = 'md' }: IconProps) {
  return (
    <svg className={cn(sizeMap[size], className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v4M12 16h.01" />
    </svg>
  )
})

// =============================================================================
// ACTION ICONS
// =============================================================================

export const CheckIcon = memo(function CheckIcon({ className, size = 'md' }: IconProps) {
  return (
    <svg className={cn(sizeMap[size], className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  )
})

export const CheckCircleIcon = memo(function CheckCircleIcon({ className, size = 'md' }: IconProps) {
  return (
    <svg className={cn(sizeMap[size], className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  )
})

export const XIcon = memo(function XIcon({ className, size = 'md' }: IconProps) {
  return (
    <svg className={cn(sizeMap[size], className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  )
})

export const XCircleIcon = memo(function XCircleIcon({ className, size = 'md' }: IconProps) {
  return (
    <svg className={cn(sizeMap[size], className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M15 9l-6 6M9 9l6 6" />
    </svg>
  )
})

export const PlusIcon = memo(function PlusIcon({ className, size = 'md' }: IconProps) {
  return (
    <svg className={cn(sizeMap[size], className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
})

export const MinusIcon = memo(function MinusIcon({ className, size = 'md' }: IconProps) {
  return (
    <svg className={cn(sizeMap[size], className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" />
    </svg>
  )
})

export const TrashIcon = memo(function TrashIcon({ className, size = 'md' }: IconProps) {
  return (
    <svg className={cn(sizeMap[size], className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" />
    </svg>
  )
})

export const EditIcon = memo(function EditIcon({ className, size = 'md' }: IconProps) {
  return (
    <svg className={cn(sizeMap[size], className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  )
})

// =============================================================================
// NAVIGATION ICONS
// =============================================================================

export const SearchIcon = memo(function SearchIcon({ className, size = 'md' }: IconProps) {
  return (
    <svg className={cn(sizeMap[size], className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="M21 21l-4.35-4.35" />
    </svg>
  )
})

export const ArrowRightIcon = memo(function ArrowRightIcon({ className, size = 'md' }: IconProps) {
  return (
    <svg className={cn(sizeMap[size], className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  )
})

export const ArrowUpRightIcon = memo(function ArrowUpRightIcon({ className, size = 'md' }: IconProps) {
  return (
    <svg className={cn(sizeMap[size], className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 17L17 7M7 7h10v10" />
    </svg>
  )
})

export const ChevronDownIcon = memo(function ChevronDownIcon({ className, size = 'md' }: IconProps) {
  return (
    <svg className={cn(sizeMap[size], className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9l6 6 6-6" />
    </svg>
  )
})

export const ChevronUpIcon = memo(function ChevronUpIcon({ className, size = 'md' }: IconProps) {
  return (
    <svg className={cn(sizeMap[size], className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 15l-6-6-6 6" />
    </svg>
  )
})

export const ExternalLinkIcon = memo(function ExternalLinkIcon({ className, size = 'md' }: IconProps) {
  return (
    <svg className={cn(sizeMap[size], className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
    </svg>
  )
})

// =============================================================================
// DATA & DOCUMENT ICONS
// =============================================================================

export const FileTextIcon = memo(function FileTextIcon({ className, size = 'md' }: IconProps) {
  return (
    <svg className={cn(sizeMap[size], className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
    </svg>
  )
})

export const CalendarIcon = memo(function CalendarIcon({ className, size = 'md' }: IconProps) {
  return (
    <svg className={cn(sizeMap[size], className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  )
})

export const ClockIcon = memo(function ClockIcon({ className, size = 'md' }: IconProps) {
  return (
    <svg className={cn(sizeMap[size], className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  )
})

export const FilterIcon = memo(function FilterIcon({ className, size = 'md' }: IconProps) {
  return (
    <svg className={cn(sizeMap[size], className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
  )
})

// =============================================================================
// USER & BUSINESS ICONS
// =============================================================================

export const UserIcon = memo(function UserIcon({ className, size = 'md' }: IconProps) {
  return (
    <svg className={cn(sizeMap[size], className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
})

export const UsersIcon = memo(function UsersIcon({ className, size = 'md' }: IconProps) {
  return (
    <svg className={cn(sizeMap[size], className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
    </svg>
  )
})

export const BuildingIcon = memo(function BuildingIcon({ className, size = 'md' }: IconProps) {
  return (
    <svg className={cn(sizeMap[size], className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <path d="M9 22v-4h6v4M8 6h.01M16 6h.01M12 6h.01M12 10h.01M8 10h.01M16 10h.01M12 14h.01M8 14h.01M16 14h.01" />
    </svg>
  )
})

export const GlobeIcon = memo(function GlobeIcon({ className, size = 'md' }: IconProps) {
  return (
    <svg className={cn(sizeMap[size], className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
    </svg>
  )
})

// =============================================================================
// AI & TECH ICONS
// =============================================================================

export const SparklesIcon = memo(function SparklesIcon({ className, size = 'md' }: IconProps) {
  return (
    <svg className={cn(sizeMap[size], className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
      <path d="M5 18l.75 2.25L8 21l-2.25.75L5 24l-.75-2.25L2 21l2.25-.75L5 18z" />
      <path d="M19 14l.5 1.5 1.5.5-1.5.5-.5 1.5-.5-1.5L17 16l1.5-.5.5-1.5z" />
    </svg>
  )
})

export const BrainIcon = memo(function BrainIcon({ className, size = 'md' }: IconProps) {
  return (
    <svg className={cn(sizeMap[size], className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5a3 3 0 100-6 3 3 0 000 6zM19 9a3 3 0 11-2.83 2M5 9a3 3 0 102.83 2M12 14a3 3 0 100-6" />
      <path d="M19 19a3 3 0 11-3-3M5 19a3 3 0 103-3" />
      <path d="M12 20v4" />
    </svg>
  )
})

export const CpuIcon = memo(function CpuIcon({ className, size = 'md' }: IconProps) {
  return (
    <svg className={cn(sizeMap[size], className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <rect x="9" y="9" width="6" height="6" />
      <path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3" />
    </svg>
  )
})

export const SendIcon = memo(function SendIcon({ className, size = 'md' }: IconProps) {
  return (
    <svg className={cn(sizeMap[size], className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
    </svg>
  )
})

// =============================================================================
// MISC ICONS
// =============================================================================

export const SettingsIcon = memo(function SettingsIcon({ className, size = 'md' }: IconProps) {
  return (
    <svg className={cn(sizeMap[size], className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
    </svg>
  )
})

export const RefreshIcon = memo(function RefreshIcon({ className, size = 'md' }: IconProps) {
  return (
    <svg className={cn(sizeMap[size], className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 4v6h-6M1 20v-6h6" />
      <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
    </svg>
  )
})

export const StarIcon = memo(function StarIcon({ className, size = 'md' }: IconProps) {
  return (
    <svg className={cn(sizeMap[size], className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  )
})

export const EyeIcon = memo(function EyeIcon({ className, size = 'md' }: IconProps) {
  return (
    <svg className={cn(sizeMap[size], className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
})

export const MoreHorizontalIcon = memo(function MoreHorizontalIcon({ className, size = 'md' }: IconProps) {
  return (
    <svg className={cn(sizeMap[size], className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="1" />
      <circle cx="19" cy="12" r="1" />
      <circle cx="5" cy="12" r="1" />
    </svg>
  )
})

export const LoaderIcon = memo(function LoaderIcon({ className, size = 'md' }: IconProps) {
  return (
    <svg className={cn(sizeMap[size], 'animate-spin', className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12a9 9 0 11-6.219-8.56" />
    </svg>
  )
})

export const BoltIcon = memo(function BoltIcon({ className, size = 'md' }: IconProps) {
  return (
    <svg className={cn(sizeMap[size], className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  )
})

export const RocketIcon = memo(function RocketIcon({ className, size = 'md' }: IconProps) {
  return (
    <svg className={cn(sizeMap[size], className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09z" />
      <path d="M12 15l-3-3a22 22 0 012-3.95A12.88 12.88 0 0122 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 01-4 2z" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </svg>
  )
})

export const ClipboardIcon = memo(function ClipboardIcon({ className, size = 'md' }: IconProps) {
  return (
    <svg className={cn(sizeMap[size], className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" />
    </svg>
  )
})

export const BriefcaseIcon = memo(function BriefcaseIcon({ className, size = 'md' }: IconProps) {
  return (
    <svg className={cn(sizeMap[size], className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" />
    </svg>
  )
})

export const FireIcon = memo(function FireIcon({ className, size = 'md' }: IconProps) {
  return (
    <svg className={cn(sizeMap[size], className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 2.5z" />
    </svg>
  )
})

export const BalanceIcon = memo(function BalanceIcon({ className, size = 'md' }: IconProps) {
  return (
    <svg className={cn(sizeMap[size], className)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v18M3 9l3 6h6l3-6M15 9l3 6h3M6 9L3 3M18 9l3-6" />
      <path d="M3 15h6M15 15h6" />
    </svg>
  )
})

// =============================================================================
// EXPORTS
// =============================================================================

export type { IconProps }
