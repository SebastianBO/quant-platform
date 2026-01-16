"use client"

import { memo } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Zap, Filter, ChevronDown, ChevronRight,
  Play, Loader2
} from "lucide-react"
import { SystemStatus, FunctionTestResult } from "../types"
import { categoryIcons } from "../utils"

interface FunctionsTabProps {
  status: SystemStatus | null
  searchTerm: string
  setSearchTerm: (value: string) => void
  expandedCategories: Set<string>
  toggleCategory: (category: string) => void
  expandAll: () => void
  collapseAll: () => void
  testFunction: (functionName: string) => void
  testingFunction: string | null
  functionTestResults: Record<string, FunctionTestResult>
}

function FunctionsTabComponent({
  status,
  searchTerm,
  setSearchTerm,
  expandedCategories,
  toggleCategory,
  expandAll,
  collapseAll,
  testFunction,
  testingFunction,
  functionTestResults
}: FunctionsTabProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search functions..."
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
        {status?.edgeFunctions?.byCategory && Object.entries(status.edgeFunctions.byCategory)
          .filter(([category, functions]) =>
            !searchTerm ||
            category.toLowerCase().includes(searchTerm.toLowerCase()) ||
            functions.some(f => f.name.toLowerCase().includes(searchTerm.toLowerCase()))
          )
          .map(([category, functions]) => {
            const filteredFunctions = searchTerm
              ? functions.filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase()))
              : functions

            if (searchTerm && filteredFunctions.length === 0 && !category.toLowerCase().includes(searchTerm.toLowerCase())) {
              return null
            }

            const isExpanded = expandedCategories.has(`fn-${category}`) || searchTerm.length > 0

            return (
              <Card key={category}>
                <CardHeader
                  className="pb-2 cursor-pointer hover:bg-secondary/50 rounded-t-lg transition-colors"
                  onClick={() => toggleCategory(`fn-${category}`)}
                >
                  <CardTitle className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      {categoryIcons[category] || <Zap className="w-4 h-4" />}
                      {category}
                    </div>
                    <span className="text-xs font-normal text-muted-foreground">
                      {filteredFunctions.length} functions
                    </span>
                  </CardTitle>
                </CardHeader>
                {isExpanded && (
                  <CardContent className="pt-0">
                    <div className="space-y-1">
                      {(searchTerm ? filteredFunctions : functions).map((fn) => {
                        const testResult = functionTestResults[fn.name]
                        const isTestingThis = testingFunction === fn.name

                        return (
                          <div
                            key={fn.name}
                            className={`flex items-center justify-between py-1.5 px-2 rounded text-xs group ${
                              testResult?.success === false ? 'bg-red-500/10' :
                              testResult?.success === true ? 'bg-green-500/10' :
                              fn.status === 'active' ? 'bg-green-500/5' :
                              fn.status === 'error' ? 'bg-red-500/10' : 'bg-secondary/30'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <div className={`w-1.5 h-1.5 rounded-full ${
                                testResult?.success === false ? 'bg-red-500' :
                                testResult?.success === true ? 'bg-green-500' :
                                fn.status === 'active' ? 'bg-green-500' :
                                fn.status === 'error' ? 'bg-red-500' : 'bg-gray-500'
                              }`} />
                              <span className="font-mono truncate" title={fn.name}>{fn.name}</span>
                              {testResult?.duration && (
                                <span className="text-[10px] text-muted-foreground">{testResult.duration}ms</span>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => {
                                e.stopPropagation()
                                testFunction(fn.name)
                              }}
                              disabled={isTestingThis}
                            >
                              {isTestingThis ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <>
                                  <Play className="w-3 h-3 mr-1" />
                                  Test
                                </>
                              )}
                            </Button>
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

export const FunctionsTab = memo(FunctionsTabComponent)
