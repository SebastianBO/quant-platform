"use client"

import * as React from "react"
import { Command as CommandPrimitive } from "cmdk"
import { SearchIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

function Command({
  className,
  shouldFilter,
  ...props
}: React.ComponentProps<typeof CommandPrimitive> & { shouldFilter?: boolean }) {
  return (
    <CommandPrimitive
      data-slot="command"
      shouldFilter={shouldFilter}
      className={cn(
        "flex h-full w-full flex-col overflow-hidden rounded-2xl bg-black text-white",
        className
      )}
      {...props}
    />
  )
}

function CommandDialog({
  title = "Command Palette",
  description = "Search for a command to run...",
  children,
  className,
  shouldFilter = false,
  ...props
}: React.ComponentProps<typeof Dialog> & {
  title?: string
  description?: string
  className?: string
  shouldFilter?: boolean
}) {
  return (
    <Dialog {...props}>
      <DialogHeader className="sr-only">
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <DialogContent
        className={cn(
          "overflow-hidden p-0",
          // Fey glassmorphism - heavy glass for modals
          "bg-[rgba(51,51,57,0.7)] backdrop-blur-[21px]",
          "border border-white/[0.12] rounded-2xl",
          "shadow-[0px_118px_112px_rgba(0,0,0,0.5)]",
          className
        )}
      >
        <Command
          shouldFilter={shouldFilter}
          className={cn(
            "bg-transparent",
            "[&_[cmdk-group-heading]]:text-[#868f97]",
            "[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2",
            "[&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium",
            "[&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.05em]",
            "[&_[cmdk-group]]:px-2",
            "[&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0",
            "[&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5",
            "[&_[cmdk-input]]:h-12",
            "[&_[cmdk-item]]:px-3 [&_[cmdk-item]]:py-3",
            "[&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5"
          )}
        >
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  )
}

function CommandInput({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Input>) {
  return (
    <div
      data-slot="command-input-wrapper"
      className={cn(
        "flex h-14 items-center gap-3 px-4",
        // Fey input field styling
        "bg-white/[0.04] border-b border-white/[0.08]",
        "motion-safe:transition-colors motion-safe:duration-150"
      )}
    >
      <SearchIcon className="size-5 shrink-0 text-[#868f97]" />
      <CommandPrimitive.Input
        data-slot="command-input"
        className={cn(
          "flex h-12 w-full bg-transparent py-3 text-base text-white outline-none",
          "placeholder:text-[#868f97]",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
    </div>
  )
}

function CommandList({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.List>) {
  return (
    <CommandPrimitive.List
      data-slot="command-list"
      className={cn(
        "max-h-[400px] scroll-py-1 overflow-x-hidden overflow-y-auto",
        "py-2",
        className
      )}
      {...props}
    />
  )
}

function CommandEmpty({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Empty>) {
  return (
    <CommandPrimitive.Empty
      data-slot="command-empty"
      className={cn(
        "py-8 text-center text-sm text-[#868f97]",
        className
      )}
      {...props}
    />
  )
}

function CommandGroup({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Group>) {
  return (
    <CommandPrimitive.Group
      data-slot="command-group"
      className={cn(
        "text-white overflow-hidden p-1",
        "[&_[cmdk-group-heading]]:text-[#868f97]",
        "[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2",
        "[&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium",
        "[&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.05em]",
        className
      )}
      {...props}
    />
  )
}

function CommandSeparator({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Separator>) {
  return (
    <CommandPrimitive.Separator
      data-slot="command-separator"
      className={cn(
        "-mx-1 my-2 h-px bg-white/[0.08]",
        className
      )}
      {...props}
    />
  )
}

function CommandItem({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Item>) {
  return (
    <CommandPrimitive.Item
      data-slot="command-item"
      className={cn(
        "relative flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm outline-none select-none",
        // Fey hover states
        "data-[selected=true]:bg-white/[0.05]",
        "motion-safe:transition-colors motion-safe:duration-150",
        // Icon styling
        "[&_svg:not([class*='text-'])]:text-[#868f97]",
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-5",
        // Disabled state
        "data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50",
        className
      )}
      {...props}
    />
  )
}

function CommandShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="command-shortcut"
      className={cn(
        "ml-auto text-xs tracking-widest text-[#868f97]",
        className
      )}
      {...props}
    />
  )
}

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
}
