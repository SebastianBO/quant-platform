"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import PlaidLink from './PlaidLink'
import TinkLink from './TinkLink'

interface ConnectBrokerageProps {
  userId: string
  onConnectionSuccess?: () => void
}

export default function ConnectBrokerage({ userId, onConnectionSuccess }: ConnectBrokerageProps) {
  const [activeTab, setActiveTab] = useState<'us' | 'europe'>('us')

  return (
    <Card className="bg-[#1a1a1a] border-white/[0.08]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Connect Your Brokerage
        </CardTitle>
        <p className="text-sm text-[#868f97]">
          Link your investment accounts to automatically sync your portfolio
        </p>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'us' | 'europe')}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="us" className="flex items-center gap-2">
              <span>🇺🇸</span>
              United States
            </TabsTrigger>
            <TabsTrigger value="europe" className="flex items-center gap-2">
              <span>🇪🇺</span>
              Europe
            </TabsTrigger>
          </TabsList>

          <TabsContent value="us">
            <PlaidLink
              userId={userId}
              onSuccess={() => onConnectionSuccess?.()}
              onError={(error) => console.error('Plaid error:', error)}
            />
          </TabsContent>

          <TabsContent value="europe">
            <TinkLink
              userId={userId}
              onSuccess={() => onConnectionSuccess?.()}
              onError={(error) => console.error('Tink error:', error)}
            />
          </TabsContent>
        </Tabs>

        <div className="mt-6 pt-6 border-t border-white/[0.08]">
          <h4 className="text-sm font-medium mb-3">Supported Platforms</h4>
          <div className="grid grid-cols-2 gap-4 text-sm text-[#868f97]">
            <div>
              <p className="font-medium text-white mb-1">US Brokerages</p>
              <ul className="space-y-1">
                <li>Robinhood</li>
                <li>Fidelity</li>
                <li>Charles Schwab</li>
                <li>TD Ameritrade</li>
                <li>E*TRADE</li>
                <li>Interactive Brokers</li>
                <li>Vanguard</li>
                <li>+ 10,000 more</li>
              </ul>
            </div>
            <div>
              <p className="font-medium text-white mb-1">European Banks</p>
              <ul className="space-y-1">
                <li>Avanza (Sweden)</li>
                <li>Nordnet</li>
                <li>Degiro</li>
                <li>Trade Republic</li>
                <li>Revolut</li>
                <li>Interactive Brokers EU</li>
                <li>Saxo Bank</li>
                <li>+ thousands more</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
