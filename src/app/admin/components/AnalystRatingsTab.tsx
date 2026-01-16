"use client"

import { memo } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  TrendingUp, RefreshCw, Globe, Clock, BarChart3,
  FileText, Users, Eye, Play, Loader2
} from "lucide-react"
import { AnalystStats } from "../types"
import { formatNumber } from "../utils"

interface AnalystRatingsTabProps {
  analystStats: AnalystStats | null
  analystLoading: boolean
  syncActionLoading: string | null
  fetchAnalystStats: () => void
  triggerAnalystScraper: () => void
}

function AnalystRatingsTabComponent({
  analystStats,
  analystLoading,
  syncActionLoading,
  fetchAnalystStats,
  triggerAnalystScraper
}: AnalystRatingsTabProps) {
  return (
    <div className="space-y-6">
      {/* Scraper Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Analyst Ratings Scraper
            </div>
            <Button
              onClick={fetchAnalystStats}
              disabled={analystLoading}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${analystLoading ? 'animate-spin' : ''}`} />
              Refresh Stats
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-secondary/30 rounded-lg text-center">
              <p className="text-3xl font-bold text-primary">{formatNumber(analystStats?.totalRatings || 0)}</p>
              <p className="text-sm text-muted-foreground">Total Ratings</p>
            </div>
            <div className="p-4 bg-secondary/30 rounded-lg text-center">
              <p className="text-3xl font-bold text-blue-500">{formatNumber(analystStats?.totalAnalysts || 0)}</p>
              <p className="text-sm text-muted-foreground">Analysts Tracked</p>
            </div>
            <div className="p-4 bg-secondary/30 rounded-lg text-center">
              <p className="text-3xl font-bold text-green-500">{analystStats?.totalFirms || 37}</p>
              <p className="text-sm text-muted-foreground">Firms Covered</p>
            </div>
            <div className="p-4 bg-secondary/30 rounded-lg text-center">
              <p className="text-3xl font-bold text-orange-500">26</p>
              <p className="text-sm text-muted-foreground">News Sources</p>
            </div>
          </div>

          <div className="flex gap-4">
            <Button
              onClick={triggerAnalystScraper}
              disabled={syncActionLoading !== null}
              className="flex-1"
            >
              {syncActionLoading === 'analyst-scraper' ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Play className="w-4 h-4 mr-2" />
              )}
              Run Scraper Now
            </Button>
            <Button
              variant="outline"
              onClick={() => window.open('/api/v1/analyst-ratings?limit=100', '_blank')}
            >
              <Eye className="w-4 h-4 mr-2" />
              View API
            </Button>
            <Button
              variant="outline"
              onClick={() => window.open('/api/v1/analysts?limit=50', '_blank')}
            >
              <Users className="w-4 h-4 mr-2" />
              Analyst Leaderboard
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Ratings */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="w-5 h-5" />
              Recent Analyst Ratings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {analystStats?.recentRatings?.length ? (
                analystStats.recentRatings.map((rating, i) => (
                  <div
                    key={i}
                    className={`flex items-center justify-between py-2 px-3 rounded-lg ${
                      rating.rating?.toLowerCase().includes('buy') ? 'bg-green-500/10' :
                      rating.rating?.toLowerCase().includes('sell') ? 'bg-red-500/10' :
                      'bg-secondary/30'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold">{rating.ticker}</span>
                      <span className="text-sm text-muted-foreground">{rating.firm}</span>
                    </div>
                    <div className="text-right">
                      <span className={`text-sm font-medium ${
                        rating.rating?.toLowerCase().includes('buy') ? 'text-green-500' :
                        rating.rating?.toLowerCase().includes('sell') ? 'text-red-500' :
                        'text-yellow-500'
                      }`}>
                        {rating.rating}
                      </span>
                      {rating.priceTarget && (
                        <p className="text-xs text-muted-foreground">${rating.priceTarget}</p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No ratings yet. Run the scraper to collect data.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* News Sources */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Globe className="w-5 h-5" />
              News Sources (26 Active)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 max-h-[300px] overflow-y-auto text-xs">
              {[
                'PR Newswire - Business', 'PR Newswire - All News',
                'GlobeNewswire - Analyst', 'GlobeNewswire - All',
                'Business Wire', 'AccessWire',
                'MarketWatch - Market Pulse', 'MarketWatch - Top Stories', 'MarketWatch - Stocks',
                'Seeking Alpha - Market Currents', 'Seeking Alpha - Stock Ideas',
                'Yahoo Finance', 'Benzinga - General', 'Benzinga - Analyst Ratings',
                'TheStreet', 'Investor Place', 'Motley Fool',
                'Reuters - Business', 'CNBC - Top News', 'CNBC - Stock Blog',
                'Zacks - Commentary', 'Barrons', 'Financial Times', 'WSJ Markets',
                'TechCrunch', 'BioPharma Dive'
              ].map((source) => (
                <div key={source} className="flex items-center gap-2 py-1.5 px-2 bg-secondary/30 rounded">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  <span className="font-mono">{source}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cron Schedule */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="w-5 h-5" />
            Automated Sync Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-secondary/30 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <RefreshCw className="w-4 h-4 text-primary" />
                <span className="font-medium">scrape-analyst-ratings</span>
              </div>
              <p className="text-sm text-muted-foreground">Every 2 hours on weekdays</p>
              <p className="text-xs text-muted-foreground mt-1 font-mono">0 */2 * * 1-5</p>
            </div>
            <div className="p-4 bg-secondary/30 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-4 h-4 text-blue-500" />
                <span className="font-medium">update-analyst-performance</span>
              </div>
              <p className="text-sm text-muted-foreground">Daily at 6 AM UTC</p>
              <p className="text-xs text-muted-foreground mt-1 font-mono">0 6 * * *</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export const AnalystRatingsTab = memo(AnalystRatingsTabComponent)
