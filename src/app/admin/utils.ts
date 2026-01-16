import {
  Database, FileText, TrendingUp, BarChart3, Briefcase, Bot,
  Wallet, Activity, Search, Bell, Building, Settings, Link2, Eye,
  Users, Shield, Server
} from "lucide-react"
import React from "react"

// Category icons mapping
export const categoryIcons: Record<string, React.ReactNode> = {
  'Data Ingestion': React.createElement(Database, { className: "w-4 h-4" }),
  'Symbol Management': React.createElement(FileText, { className: "w-4 h-4" }),
  'Options & Derivatives': React.createElement(TrendingUp, { className: "w-4 h-4" }),
  'Short Interest': React.createElement(BarChart3, { className: "w-4 h-4" }),
  'Fundamentals': React.createElement(Briefcase, { className: "w-4 h-4" }),
  'AI & Analysis': React.createElement(Bot, { className: "w-4 h-4" }),
  'Portfolio': React.createElement(Wallet, { className: "w-4 h-4" }),
  'Real-time & WebSocket': React.createElement(Activity, { className: "w-4 h-4" }),
  'SEO & Content': React.createElement(Search, { className: "w-4 h-4" }),
  'Notifications': React.createElement(Bell, { className: "w-4 h-4" }),
  'Banking Integration': React.createElement(Building, { className: "w-4 h-4" }),
  'Infrastructure': React.createElement(Settings, { className: "w-4 h-4" }),
  'External Integrations': React.createElement(Link2, { className: "w-4 h-4" }),
  'Core Financial': React.createElement(Database, { className: "w-4 h-4" }),
  'Earnings': React.createElement(TrendingUp, { className: "w-4 h-4" }),
  'Financial Statements': React.createElement(FileText, { className: "w-4 h-4" }),
  'Options': React.createElement(BarChart3, { className: "w-4 h-4" }),
  'SEC & Insider': React.createElement(Eye, { className: "w-4 h-4" }),
  'Social & Chat': React.createElement(Users, { className: "w-4 h-4" }),
  'Users & Auth': React.createElement(Shield, { className: "w-4 h-4" }),
  'Banking': React.createElement(Building, { className: "w-4 h-4" }),
  'SEO': React.createElement(Search, { className: "w-4 h-4" }),
  'Email': React.createElement(Bell, { className: "w-4 h-4" }),
  'System & Logs': React.createElement(Server, { className: "w-4 h-4" })
}

// Utility functions
export function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toLocaleString()
}

export function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  return `${diffDays}d ago`
}

export function getDataFreshness(tableName: string, count: number): 'fresh' | 'stale' | 'critical' | 'empty' {
  if (count === 0) return 'empty'

  // Check based on table type
  if (tableName.includes('price') || tableName.includes('realtime')) {
    return 'fresh' // Would need lastUpdated timestamp for accurate check
  }
  if (tableName.includes('earnings')) {
    return count > 100 ? 'fresh' : 'stale'
  }
  if (tableName.includes('short')) {
    return count > 1000 ? 'fresh' : 'stale'
  }
  return 'fresh'
}
