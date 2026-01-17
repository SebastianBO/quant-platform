'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Button, LinkButton } from '../base/Button'

// =============================================================================
// NAVIGATION - Fixed navigation bar
// =============================================================================

export interface NavItem {
  label: string
  href: string
  active?: boolean
}

export interface NavigationProps {
  logo?: React.ReactNode
  items?: NavItem[]
  announcement?: {
    text: string
    action?: string
    href?: string
  }
  cta?: {
    text: string
    href: string
  }
  className?: string
}

export function Navigation({
  logo,
  items = [],
  announcement,
  cta,
  className,
}: NavigationProps) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <motion.nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50',
        'transition-colors duration-300',
        scrolled ? 'bg-black/80 backdrop-blur-md' : 'bg-transparent',
        className
      )}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo & Nav Items */}
        <div className="flex items-center gap-8">
          {logo || <FeyLogo />}

          <div className="hidden md:flex items-center gap-1">
            {items.map((item) => (
              <NavLink key={item.href} item={item} />
            ))}
          </div>
        </div>

        {/* Announcement & CTA */}
        <div className="flex items-center gap-4">
          {announcement && (
            <AnnouncementPill
              text={announcement.text}
              action={announcement.action}
              href={announcement.href}
            />
          )}

          {cta && (
            <LinkButton href={cta.href} variant="primary" size="md">
              {cta.text}
            </LinkButton>
          )}
        </div>
      </div>
    </motion.nav>
  )
}

// =============================================================================
// NAV LINK
// =============================================================================

interface NavLinkProps {
  item: NavItem
}

function NavLink({ item }: NavLinkProps) {
  return (
    <a
      href={item.href}
      className={cn(
        'px-3 py-2 text-[14px] rounded-lg transition-colors duration-150',
        item.active
          ? 'text-white'
          : 'text-[#868f97] hover:text-white hover:bg-white/[0.05]'
      )}
    >
      {item.label}
    </a>
  )
}

// =============================================================================
// ANNOUNCEMENT PILL
// =============================================================================

interface AnnouncementPillProps {
  text: string
  action?: string
  href?: string
}

function AnnouncementPill({ text, action, href }: AnnouncementPillProps) {
  const Wrapper = href ? 'a' : 'div'

  return (
    <Wrapper
      href={href}
      className={cn(
        'hidden lg:flex items-center gap-3 px-4 py-2',
        'bg-gradient-to-r from-white/[0.04] via-white/[0.02] to-transparent',
        'rounded-full border border-white/[0.08]',
        'backdrop-blur-lg',
        'shadow-[0_30px_16px_rgba(0,0,0,0.12),0_16px_8px_rgba(0,0,0,0.07)]',
        href && 'cursor-pointer hover:border-white/[0.12] transition-colors'
      )}
    >
      <span className="text-[13px] text-[#868f97]">{text}</span>
      {action && (
        <span className="px-3 py-1 bg-[#e6e6e6] text-black text-[12px] font-medium rounded-full">
          {action}
        </span>
      )}
    </Wrapper>
  )
}

// =============================================================================
// FEY LOGO (Yellow chevron)
// =============================================================================

export function FeyLogo({ className }: { className?: string }) {
  return (
    <div className={cn('size-8 flex items-center justify-center', className)}>
      <svg viewBox="0 0 24 24" className="size-6 text-[#d4ff00]" fill="none">
        <path
          d="M15 4L7 12L15 20"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  )
}

// =============================================================================
// FOOTER
// =============================================================================

export interface FooterLink {
  label: string
  href: string
}

export interface FooterProps {
  copyright?: string
  links?: FooterLink[]
  legalLinks?: FooterLink[]
  className?: string
}

export function Footer({
  copyright = `© ${new Date().getFullYear()}, Lician Labs Inc.`,
  links = [],
  legalLinks = [],
  className,
}: FooterProps) {
  return (
    <footer className={cn(
      'py-8 px-6 border-t border-white/[0.06]',
      className
    )}>
      <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <span className="text-[#868f97] text-[13px]">{copyright}</span>

        {links.length > 0 && (
          <div className="flex items-center gap-6 text-[#868f97] text-[13px]">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="hover:text-white transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>
        )}

        {legalLinks.length > 0 && (
          <div className="flex items-center gap-4 text-[#868f97] text-[13px]">
            <span className="text-white/[0.2]">|</span>
            {legalLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="hover:text-white transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>
        )}
      </div>
    </footer>
  )
}

// =============================================================================
// MOBILE MENU
// =============================================================================

export interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
  items: NavItem[]
  cta?: {
    text: string
    href: string
  }
}

export function MobileMenu({ isOpen, onClose, items, cta }: MobileMenuProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Menu */}
          <motion.div
            className="fixed top-0 right-0 bottom-0 w-[300px] bg-[#0a0a0a] border-l border-white/[0.08] z-50 p-6"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-[#868f97] hover:text-white transition-colors"
              aria-label="Close menu"
            >
              <svg className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>

            <div className="mt-12 space-y-2">
              {items.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'block px-4 py-3 text-[16px] rounded-lg transition-colors',
                    item.active
                      ? 'text-white bg-white/[0.05]'
                      : 'text-[#868f97] hover:text-white hover:bg-white/[0.05]'
                  )}
                >
                  {item.label}
                </a>
              ))}
            </div>

            {cta && (
              <div className="absolute bottom-8 left-6 right-6">
                <LinkButton href={cta.href} variant="primary" size="lg" className="w-full">
                  {cta.text}
                </LinkButton>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
