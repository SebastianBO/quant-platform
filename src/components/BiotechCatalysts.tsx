"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { DataSourceIndicator } from "@/components/DataSourceBadge"
import {
  Beaker,
  Calendar,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  Pill,
  Activity,
  Target,
  FileText
} from "lucide-react"

interface Catalyst {
  id: string
  ticker: string
  companyName: string
  catalystType: 'TRIAL_RESULT' | 'FDA_DECISION' | 'PDUFA_DATE' | 'PHASE_TRANSITION' | 'DATA_READOUT'
  title: string
  description: string
  expectedDate: string | null
  datePrecision: 'EXACT' | 'MONTH' | 'QUARTER' | 'YEAR' | 'ESTIMATED'
  drugName: string | null
  indication: string | null
  phase: string | null
  sourceType: 'CLINICAL_TRIAL' | 'FDA' | 'COMPANY'
  sourceId: string
  importance: 'HIGH' | 'MEDIUM' | 'LOW'
  status: 'UPCOMING' | 'IMMINENT' | 'PAST'
  daysUntil: number | null
}

interface BiotechCatalystsData {
  ticker: string
  companyName: string
  industry?: string
  focusAreas?: string[]
  catalysts: Catalyst[]
  totalCount: number
  summary: {
    upcoming: number
    imminent: number
    highImportance: number
    phase3Trials: number
  }
  _meta: {
    source: string
    fetchedAt: string
  }
}

interface BiotechCatalystsProps {
  ticker: string
  className?: string
}

const catalystTypeConfig: Record<string, { icon: typeof Beaker; label: string; color: string }> = {
  TRIAL_RESULT: { icon: Beaker, label: 'Trial Result', color: 'text-[#479ffa]' },
  DATA_READOUT: { icon: Activity, label: 'Data Readout', color: 'text-[#e75ece]' },
  FDA_DECISION: { icon: FileText, label: 'FDA Decision', color: 'text-[#4ebe96]' },
  PDUFA_DATE: { icon: Calendar, label: 'PDUFA Date', color: 'text-[#ffa16c]' },
  PHASE_TRANSITION: { icon: TrendingUp, label: 'Phase Transition', color: 'text-[#479ffa]' },
}

const importanceConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
  HIGH: { label: 'High', variant: 'default' },
  MEDIUM: { label: 'Medium', variant: 'secondary' },
  LOW: { label: 'Low', variant: 'outline' },
}

const phaseConfig: Record<string, { label: string; color: string }> = {
  PHASE1: { label: 'Phase 1', color: 'bg-[#868f97]' },
  EARLY_PHASE1: { label: 'Phase 1', color: 'bg-[#868f97]' },
  PHASE2: { label: 'Phase 2', color: 'bg-[#479ffa]' },
  'PHASE2/PHASE3': { label: 'Phase 2/3', color: 'bg-[#e75ece]' },
  PHASE3: { label: 'Phase 3', color: 'bg-[#ffa16c]' },
  PHASE4: { label: 'Phase 4', color: 'bg-[#4ebe96]' },
  NA: { label: 'N/A', color: 'bg-[#868f97]/50' },
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return 'TBD'
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

function formatDaysUntil(days: number | null): string {
  if (days === null) return 'Date TBD'
  if (days < 0) return `${Math.abs(days)} days ago`
  if (days === 0) return 'Today'
  if (days === 1) return 'Tomorrow'
  if (days <= 30) return `${days} days`
  if (days <= 90) return `${Math.round(days / 7)} weeks`
  return `${Math.round(days / 30)} months`
}

function CatalystCard({ catalyst }: { catalyst: Catalyst }) {
  const typeConfig = catalystTypeConfig[catalyst.catalystType] || catalystTypeConfig.TRIAL_RESULT
  const impConfig = importanceConfig[catalyst.importance] || importanceConfig.MEDIUM
  const phConfig = catalyst.phase ? phaseConfig[catalyst.phase] : null
  const TypeIcon = typeConfig.icon

  return (
    <div className={cn(
      "rounded-2xl p-4 transition-colors motion-safe:duration-150",
      "bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08]",
      "hover:bg-white/[0.05] hover:border-white/[0.15]",
      catalyst.status === 'IMMINENT' && "border-[#ffa16c]/50 bg-[#ffa16c]/5",
      catalyst.importance === 'HIGH' && "border-[#e75ece]/30"
    )}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className={cn("p-2 rounded-lg bg-white/[0.05]", typeConfig.color)}>
            <TypeIcon className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              {phConfig && (
                <span className={cn(
                  "text-xs px-2 py-0.5 rounded-full text-white",
                  phConfig.color
                )}>
                  {phConfig.label}
                </span>
              )}
              <Badge variant={impConfig.variant} className="text-xs">
                {impConfig.label}
              </Badge>
              {catalyst.status === 'IMMINENT' && (
                <Badge variant="destructive" className="text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  Imminent
                </Badge>
              )}
            </div>
            <h4 className="font-medium mt-2 line-clamp-2">
              {catalyst.title}
            </h4>
            <div className="flex items-center gap-3 mt-2 text-sm text-[#868f97]">
              {catalyst.drugName && (
                <span className="flex items-center gap-1">
                  <Pill className="h-3 w-3" />
                  {catalyst.drugName}
                </span>
              )}
              {catalyst.indication && (
                <span className="flex items-center gap-1">
                  <Target className="h-3 w-3" />
                  {catalyst.indication}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-sm font-medium tabular-nums">
            {formatDate(catalyst.expectedDate)}
          </div>
          <div className={cn(
            "text-xs mt-1 tabular-nums",
            catalyst.daysUntil !== null && catalyst.daysUntil <= 30 ? "text-[#ffa16c] font-medium" :
            catalyst.daysUntil !== null && catalyst.daysUntil <= 90 ? "text-[#ffa16c]/70" :
            "text-[#868f97]"
          )}>
            {formatDaysUntil(catalyst.daysUntil)}
          </div>
        </div>
      </div>
      {catalyst.sourceId && (
        <div className="mt-3 pt-3 border-t border-white/[0.08] flex items-center justify-between text-xs text-[#868f97]">
          <span>{catalyst.sourceType === 'CLINICAL_TRIAL' ? 'ClinicalTrials.gov' : 'FDA'}</span>
          <a
            href={catalyst.sourceType === 'CLINICAL_TRIAL'
              ? `https://clinicaltrials.gov/study/${catalyst.sourceId}`
              : `https://www.accessdata.fda.gov/scripts/cder/daf/index.cfm?event=overview.process&ApplNo=${catalyst.sourceId.replace(/\D/g, '')}`
            }
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-white transition-colors motion-safe:duration-150"
          >
            {catalyst.sourceId}
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      )}
    </div>
  )
}

export function BiotechCatalysts({ ticker, className }: BiotechCatalystsProps) {
  const [data, setData] = useState<BiotechCatalystsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    async function fetchCatalysts() {
      try {
        setLoading(true)
        const response = await fetch(`/api/biotech-catalysts?ticker=${ticker}&timeframe=upcoming`)

        if (!response.ok) {
          throw new Error('Failed to fetch biotech catalysts')
        }

        const result = await response.json()
        setData(result)
        setError(null)
      } catch (err) {
        console.error('Error fetching biotech catalysts:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    if (ticker) {
      fetchCatalysts()
    }
  }, [ticker])

  if (loading) {
    return (
      <Card className={cn("bg-white/[0.03] backdrop-blur-[10px] border-white/[0.08]", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Beaker className="h-5 w-5" />
            Clinical Trials & Catalysts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-white/[0.05] animate-pulse rounded-2xl" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !data || !data.summary) {
    return (
      <Card className={cn("bg-white/[0.03] backdrop-blur-[10px] border-white/[0.08]", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Beaker className="h-5 w-5" />
            Clinical Trials & Catalysts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-[#868f97]">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No clinical trial data available for {ticker}</p>
            <p className="text-sm mt-1">This company may not have active clinical trials</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const displayCatalysts = showAll ? data.catalysts : data.catalysts.slice(0, 5)

  return (
    <Card className={cn("bg-white/[0.03] backdrop-blur-[10px] border-white/[0.08]", className)}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Beaker className="h-5 w-5" />
              Clinical Trials & Catalysts
            </CardTitle>
            {data.focusAreas && data.focusAreas.length > 0 && (
              <div className="flex items-center gap-2 mt-2">
                {data.focusAreas.slice(0, 3).map((area) => (
                  <Badge key={area} variant="outline" className="text-xs">
                    {area}
                  </Badge>
                ))}
              </div>
            )}
          </div>
          <DataSourceIndicator source="clinicaltrials-gov" />
        </div>
      </CardHeader>
      <CardContent>
        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 bg-white/[0.03] backdrop-blur-[10px] border border-white/[0.08] rounded-2xl">
            <div className="text-2xl font-bold tabular-nums">{data.summary.upcoming}</div>
            <div className="text-xs text-[#868f97]">Upcoming</div>
          </div>
          <div className="text-center p-3 bg-[#ffa16c]/10 border border-[#ffa16c]/20 rounded-2xl">
            <div className="text-2xl font-bold text-[#ffa16c] tabular-nums">{data.summary.imminent}</div>
            <div className="text-xs text-[#868f97]">Within 90 Days</div>
          </div>
          <div className="text-center p-3 bg-[#e75ece]/10 border border-[#e75ece]/20 rounded-2xl">
            <div className="text-2xl font-bold text-[#e75ece] tabular-nums">{data.summary.highImportance}</div>
            <div className="text-xs text-[#868f97]">High Impact</div>
          </div>
          <div className="text-center p-3 bg-[#479ffa]/10 border border-[#479ffa]/20 rounded-2xl">
            <div className="text-2xl font-bold text-[#479ffa] tabular-nums">{data.summary.phase3Trials}</div>
            <div className="text-xs text-[#868f97]">Phase 3</div>
          </div>
        </div>

        {/* Catalysts List */}
        {data.catalysts.length === 0 ? (
          <div className="text-center py-8 text-[#868f97]">
            <CheckCircle2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No upcoming catalysts found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayCatalysts.map((catalyst) => (
              <CatalystCard key={catalyst.id} catalyst={catalyst} />
            ))}
          </div>
        )}

        {/* Show More Button */}
        {data.catalysts.length > 5 && (
          <Button
            variant="ghost"
            className="w-full mt-4 hover:bg-white/[0.05] transition-colors motion-safe:duration-150"
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? 'Show Less' : `Show All ${data.catalysts.length} Catalysts`}
            <ChevronRight className={cn(
              "h-4 w-4 ml-1 transition-transform motion-safe:duration-150",
              showAll && "rotate-90"
            )} />
          </Button>
        )}

        {/* Link to ClinicalTrials.gov */}
        <div className="mt-4 pt-4 border-t border-white/[0.08] text-center">
          <a
            href={`https://clinicaltrials.gov/search?spons=${encodeURIComponent(data.companyName)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-[#868f97] hover:text-white inline-flex items-center gap-1 transition-colors motion-safe:duration-150"
          >
            View all trials on ClinicalTrials.gov
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </CardContent>
    </Card>
  )
}
