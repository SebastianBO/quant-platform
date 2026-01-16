"use client"

import { memo } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Database, Filter, ChevronDown, ChevronRight, AlertCircle
} from "lucide-react"
import { SystemStatus } from "../types"
import { formatNumber, getDataFreshness, categoryIcons } from "../utils"

interface TablesTabProps {
  status: SystemStatus | null
  searchTerm: string
  setSearchTerm: (value: string) => void
  expandedCategories: Set<string>
  toggleCategory: (category: string) => void
  expandAll: () => void
  collapseAll: () => void
}

function TablesTabComponent({
  status,
  searchTerm,
  setSearchTerm,
  expandedCategories,
  toggleCategory,
  expandAll,
  collapseAll
}: TablesTabProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search tables..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
          <Filter className="w-4 h-4 text-muted-foreground" />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={expandAll}>Expand All</Button>
          <Button variant="outline" size="sm" onClick={collapseAll}>Collapse All</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {status?.database?.tablesByCategory && Object.entries(status.database.tablesByCategory)
          .filter(([category, tables]) =>
            !searchTerm ||
            category.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tables.some(t => t.name.toLowerCase().includes(searchTerm.toLowerCase()))
          )
          .map(([category, tables]) => {
            const filteredTables = searchTerm
              ? tables.filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase()))
              : tables

            if (searchTerm && filteredTables.length === 0 && !category.toLowerCase().includes(searchTerm.toLowerCase())) {
              return null
            }

            const isExpanded = expandedCategories.has(`db-${category}`) || searchTerm.length > 0
            const categoryTotal = tables.reduce((sum, t) => sum + (t.count || 0), 0)
            const emptyCount = tables.filter(t => t.count === 0).length

            return (
              <Card key={category} className={emptyCount > tables.length / 2 ? 'border-yellow-500/20' : ''}>
                <CardHeader
                  className="pb-2 cursor-pointer hover:bg-secondary/50 rounded-t-lg transition-colors"
                  onClick={() => toggleCategory(`db-${category}`)}
                >
                  <CardTitle className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      {categoryIcons[category] || <Database className="w-4 h-4" />}
                      {category}
                      {emptyCount > 0 && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-500">
                          {emptyCount} empty
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-normal text-muted-foreground">
                        {tables.length} tables
                      </span>
                      <span className="text-xs font-bold text-primary">
                        {formatNumber(categoryTotal)}
                      </span>
                    </div>
                  </CardTitle>
                </CardHeader>
                {isExpanded && (
                  <CardContent className="pt-0">
                    <div className="space-y-1">
                      {(searchTerm ? filteredTables : tables).map((table) => {
                        const freshness = getDataFreshness(table.name, table.count)

                        return (
                          <div
                            key={table.name}
                            className={`flex items-center justify-between py-1.5 px-2 rounded text-xs ${
                              table.error ? 'bg-red-500/10' :
                              freshness === 'empty' ? 'bg-yellow-500/10' :
                              freshness === 'critical' ? 'bg-orange-500/10' :
                              'bg-secondary/30'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              {freshness === 'empty' && (
                                <AlertCircle className="w-3 h-3 text-yellow-500" />
                              )}
                              <span className="font-mono truncate" title={table.name}>{table.name}</span>
                            </div>
                            <span className={`font-bold ${
                              table.error ? 'text-red-500' :
                              freshness === 'empty' ? 'text-yellow-500' :
                              ''
                            }`}>
                              {table.error ? 'Error' : formatNumber(table.count)}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                )}
              </Card>
            )
          })}
      </div>
    </div>
  )
}

export const TablesTab = memo(TablesTabComponent)
