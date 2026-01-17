'use client'

import { forwardRef, useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

// =============================================================================
// INPUT VARIANTS
// =============================================================================

const variants = {
  // Default - Simple input
  default: cn(
    'bg-white/[0.05] border border-white/[0.08]',
    'focus:border-[#479ffa] focus:bg-white/[0.08]'
  ),

  // Filled - More prominent background
  filled: cn(
    'bg-white/[0.08] border border-transparent',
    'focus:border-[#479ffa] focus:bg-white/[0.1]'
  ),

  // Glass - Glassmorphism
  glass: cn(
    'bg-[rgba(26,27,32,0.6)] backdrop-blur-lg border border-white/[0.08]',
    'focus:border-white/[0.16]'
  ),

  // Outline - Just border
  outline: cn(
    'bg-transparent border border-white/[0.15]',
    'focus:border-[#479ffa]'
  ),

  // Chat - For chat input (like Fey's AI chat)
  chat: cn(
    'bg-white/[0.05] border-none',
    'focus:bg-white/[0.08]'
  ),
}

const sizes = {
  sm: 'px-3 py-2 text-[12px] rounded-md',
  md: 'px-4 py-2.5 text-[13px] rounded-lg',
  lg: 'px-5 py-3 text-[14px] rounded-xl',
}

// =============================================================================
// INPUT COMPONENT
// =============================================================================

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  variant?: keyof typeof variants
  size?: keyof typeof sizes
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  error?: string
  label?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  function Input(
    {
      className,
      variant = 'default',
      size = 'md',
      icon,
      iconPosition = 'left',
      error,
      label,
      id,
      ...props
    },
    ref
  ) {
    const inputId = id || props.name

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-[12px] font-medium text-[#868f97] mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && iconPosition === 'left' && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#868f97]">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full text-white placeholder:text-[#868f97]',
              'outline-none transition-all duration-100', // Fey: 0.1s
              'focus-visible:ring-2 focus-visible:ring-[#479ffa]/30',
              variants[variant],
              sizes[size],
              icon && iconPosition === 'left' && 'pl-10',
              icon && iconPosition === 'right' && 'pr-10',
              error && 'border-[#ff5c5c] focus:border-[#ff5c5c]',
              className
            )}
            {...props}
          />
          {icon && iconPosition === 'right' && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#868f97]">
              {icon}
            </div>
          )}
        </div>
        {error && (
          <p className="mt-1.5 text-[11px] text-[#ff5c5c]">{error}</p>
        )}
      </div>
    )
  }
)

// =============================================================================
// SEARCH INPUT - With search icon
// =============================================================================

const SearchIcon = () => (
  <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <circle cx="11" cy="11" r="8" />
    <path d="M21 21l-4.35-4.35" />
  </svg>
)

export interface SearchInputProps extends Omit<InputProps, 'icon' | 'iconPosition'> {
  onSearch?: (value: string) => void
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  function SearchInput({ onSearch, onKeyDown, ...props }, ref) {
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && onSearch) {
        onSearch(e.currentTarget.value)
      }
      onKeyDown?.(e)
    }

    return (
      <Input
        ref={ref}
        type="search"
        icon={<SearchIcon />}
        iconPosition="left"
        placeholder="Search..."
        onKeyDown={handleKeyDown}
        {...props}
      />
    )
  }
)

// =============================================================================
// CHAT INPUT - For AI chat interface
// =============================================================================

const SendIcon = () => (
  <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
  </svg>
)

export interface ChatInputProps extends Omit<InputProps, 'icon' | 'variant'> {
  onSend?: (value: string) => void
  sending?: boolean
}

export const ChatInput = forwardRef<HTMLInputElement, ChatInputProps>(
  function ChatInput({ onSend, sending, className, size: _size, ...props }, ref) {
    const [value, setValue] = useState('')

    const handleSend = () => {
      if (value.trim() && onSend) {
        onSend(value.trim())
        setValue('')
      }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSend()
      }
    }

    return (
      <div className={cn('relative', className)}>
        <input
          ref={ref}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className={cn(
            'w-full text-white placeholder:text-[#868f97]',
            'outline-none transition-all duration-100', // Fey: 0.1s
            'bg-white/[0.05] rounded-lg px-4 py-2.5 text-[13px]',
            'pr-12'
          )}
          disabled={sending}
          {...props}
        />
        <motion.button
          type="button"
          onClick={handleSend}
          disabled={!value.trim() || sending}
          className={cn(
            'absolute right-2 top-1/2 -translate-y-1/2',
            'size-8 rounded-md flex items-center justify-center',
            'transition-colors duration-100', // Fey: 0.1s
            value.trim()
              ? 'text-[#479ffa] hover:bg-white/[0.1]'
              : 'text-[#868f97]'
          )}
          whileTap={{ scale: 0.95 }}
        >
          {sending ? (
            <motion.div
              className="size-4 border-2 border-current border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
          ) : (
            <SendIcon />
          )}
        </motion.button>
      </div>
    )
  }
)

// =============================================================================
// TEXTAREA
// =============================================================================

export interface TextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> {
  variant?: keyof typeof variants
  size?: keyof typeof sizes
  error?: string
  label?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea(
    {
      className,
      variant = 'default',
      size = 'md',
      error,
      label,
      id,
      ...props
    },
    ref
  ) {
    const inputId = id || props.name

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-[12px] font-medium text-[#868f97] mb-1.5"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={cn(
            'w-full text-white placeholder:text-[#868f97]',
            'outline-none transition-all duration-100', // Fey: 0.1s
            'focus-visible:ring-2 focus-visible:ring-[#479ffa]/30',
            'resize-none min-h-[100px]',
            variants[variant],
            sizes[size],
            error && 'border-[#ff5c5c] focus:border-[#ff5c5c]',
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-[11px] text-[#ff5c5c]">{error}</p>
        )}
      </div>
    )
  }
)
