"use client"

import { motion } from "framer-motion"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface ScrollIndicatorProps {
  targetId?: string
  label?: string
  className?: string
  onClick?: () => void
}

export function ScrollIndicator({
  targetId = "features",
  label = "Explore features",
  className,
  onClick,
}: ScrollIndicatorProps) {
  const handleClick = () => {
    if (onClick) {
      onClick()
      return
    }

    const target = document.getElementById(targetId)
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  return (
    <motion.button
      onClick={handleClick}
      className={cn(
        "flex flex-col items-center gap-2 py-4 px-6 group cursor-pointer",
        className
      )}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.5 }}
    >
      {/* Label */}
      <motion.span
        className="text-sm text-[#868f97] group-hover:text-white transition-colors duration-100"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        {label}
      </motion.span>

      {/* Animated chevrons */}
      <div className="relative h-8 w-8 flex items-center justify-center">
        {/* First chevron */}
        <motion.div
          className="absolute"
          animate={{
            y: [0, 6, 0],
            opacity: [0.3, 1, 0.3],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <ChevronDown className="w-6 h-6 text-[#4ebe96]" />
        </motion.div>

        {/* Second chevron (delayed) */}
        <motion.div
          className="absolute"
          animate={{
            y: [0, 6, 0],
            opacity: [0.1, 0.5, 0.1],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.2,
          }}
        >
          <ChevronDown className="w-6 h-6 text-[#4ebe96]/50" />
        </motion.div>
      </div>

      {/* Glowing line */}
      <motion.div
        className="w-px h-8 bg-gradient-to-b from-[#4ebe96]/50 to-transparent"
        animate={{
          scaleY: [0.5, 1, 0.5],
          opacity: [0.3, 0.7, 0.3],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </motion.button>
  )
}

// Alternative: Minimal dot-based scroll indicator
export function ScrollDots({
  targetId = "features",
  className,
}: {
  targetId?: string
  className?: string
}) {
  const handleClick = () => {
    const target = document.getElementById(targetId)
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  return (
    <motion.button
      onClick={handleClick}
      className={cn("flex flex-col items-center gap-1.5 py-4 cursor-pointer", className)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.8 }}
    >
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-[#4ebe96]"
          animate={{
            opacity: [0.2, 1, 0.2],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            delay: i * 0.15,
            ease: "easeInOut",
          }}
        />
      ))}
    </motion.button>
  )
}

export default ScrollIndicator
