'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

// Import entire Fey-UI library
import {
  // Design Tokens
  colors,
  typography,
  shadows,

  // Animations
  staggerContainerVariants,
  staggerItemVariants,
  useScrollReveal,
  useMouseFollowGradient,

  // Base Components
  Button,
  IconButton,
  LinkButton,
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  StackedCardGroup,
  StackedCard,
  Badge,
  PriceBadge,
  LiveBadge,
  AvatarBadge,
  TickerBadge,
  Input,
  SearchInput,
  ChatInput,
  Text,
  GradientText,
  AnimatedHeadline,
  TypewriterText,
  CounterText,
  HighlightText,
  LinkText,

  // Composite Components
  Section,
  SectionHeader,
  FeatureGrid,
  FeatureCard,
  CTASection,
  TwoColumnSection,
  Navigation,
  FeyLogo,
  Footer,
  MobileMenu,
  FloatingDock,
  DockDivider,
  DockIcons,
  feyDockItems,
  NotificationCard,
  NotificationStack,
  BriefingCard,
  StockCard,
  AIChatCard,
  EarningsNotification,
  InsiderTransaction,
  CommandSearch,
  LiveNotificationFeed,
  MarketMoversWidget,
  EarningsCalendarWidget,
  FeyAIChat,
  MiniChatWidget,

  // Generative UI Components
  FeyStockQuoteCard,
  FeyFinancialsCard,
  FeyMarketMoversCard,
  FeyComparisonCard,
  FeySectorInfo,
  FeyToolLoading,

  // Charts
  FeySparkline,
  FeyMiniChart,
  FeyLineChart,
  FeyAreaChart,
  FeyBarChart,
  FeyStockChart,

  // Portfolio Components
  FeyPortfolioSummary,
  FeyPortfolioHoldings,
  FeyWatchlist,
  FeyQuickTrade,

  // Data Tables
  FeyDataTable,
  FeyEarningsTable,
  FeyFilingsTable,
  FeyInsiderTradesTable,

  // Alerts
  FeyPriceAlert,
  FeyEarningsCard,
  FeyAlertList,

  // Skeletons
  Skeleton,
  SkeletonText,
  SkeletonCard,
  SkeletonStockRow,
  SkeletonChart,
  SkeletonTable,
  SkeletonPortfolioSummary,
  Shimmer,
} from '@/components/fey-ui'
import { useRouter } from 'next/navigation'

// =============================================================================
// DEMO PAGE
// =============================================================================

export default function FeyComponentsDemo() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { gradientStyle } = useMouseFollowGradient()
  const router = useRouter()

  const handleCommandSelect = (type: 'stock' | 'briefing' | 'action', value: string) => {
    if (type === 'stock') {
      router.push(`/stock/${value}`)
    } else if (type === 'action') {
      router.push(value)
    }
  }

  const navItems = [
    { label: 'Components', href: '#components', active: true },
    { label: 'Typography', href: '#typography' },
    { label: 'Cards', href: '#cards' },
    { label: 'Animations', href: '#animations' },
  ]

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <Navigation
        logo={<FeyLogo />}
        items={navItems}
        announcement={{
          text: 'Component Library v1.0',
          action: 'New',
        }}
        cta={{
          text: 'Get Started',
          href: '#',
        }}
      />

      {/* CMD+K Search - Global Component */}
      <CommandSearch onSelect={handleCommandSelect} />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Mouse-follow gradient background */}
        <div
          className="absolute inset-0 opacity-30 pointer-events-none"
          style={gradientStyle}
        />

        <div className="max-w-[1400px] mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge variant="info" className="mb-6">
              Fey-UI Component Library
            </Badge>
          </motion.div>

          <AnimatedHeadline
            text="Build beautiful interfaces"
            className="text-[64px] md:text-[80px] font-semibold leading-[1.05] tracking-[-0.02em] mb-6"
          />

          <Text variant="bodyLarge" className="max-w-xl mx-auto mb-8">
            A comprehensive design system inspired by Fey.com. Featuring dark mode aesthetics,
            smooth animations, and production-ready components.
          </Text>

          <div className="flex items-center justify-center gap-4">
            <Button variant="primary" size="lg">
              Explore Components
            </Button>
            <Button variant="secondary" size="lg">
              View Source
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <Section id="stats" padding="md" className="border-y border-white/[0.06]">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <StatItem value={50} suffix="+" label="Components" />
          <StatItem value={10} suffix="+" label="Animations" />
          <StatItem value={39} label="Colors" />
          <StatItem value={100} suffix="%" label="TypeScript" />
        </div>
      </Section>

      {/* Buttons Section */}
      <Section id="buttons" animate>
        <SectionHeader
          label="COMPONENTS"
          title="Buttons"
          titleHighlight="Buttons"
          subtitle="Various button styles with hover animations and tap feedback."
        />

        <div className="mt-12 space-y-8">
          {/* Primary & Secondary */}
          <div className="flex flex-wrap items-center gap-4">
            <Button variant="primary" size="lg">Primary Large</Button>
            <Button variant="primary" size="md">Primary Medium</Button>
            <Button variant="primary" size="sm">Primary Small</Button>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <Button variant="secondary" size="lg">Secondary Large</Button>
            <Button variant="secondary" size="md">Secondary Medium</Button>
            <Button variant="secondary" size="sm">Secondary Small</Button>
          </div>

          {/* Ghost & Accent */}
          <div className="flex flex-wrap items-center gap-4">
            <Button variant="ghost" size="md">Ghost Button</Button>
            <Button variant="accent" size="md">Accent Button</Button>
            <IconButton icon={<span className="size-4"><DockIcons.Settings /></span>} variant="ghost" size="icon" aria-label="Settings" />
            <IconButton icon={<span className="size-5"><DockIcons.Search /></span>} variant="secondary" size="iconLg" aria-label="Search" />
          </div>

          {/* Link Buttons */}
          <div className="flex flex-wrap items-center gap-6">
            <LinkButton href="#">Learn more</LinkButton>
            <LinkButton href="#" variant="accent">View details</LinkButton>
            <LinkButton href="#" variant="ghost">See all</LinkButton>
          </div>
        </div>
      </Section>

      {/* Badges Section */}
      <Section id="badges" animate className="bg-[#0a0a0a]">
        <SectionHeader
          label="COMPONENTS"
          title="Badges & Pills"
          subtitle="Status indicators, price badges, and avatar components."
        />

        <div className="mt-12 space-y-8">
          {/* Status Badges */}
          <div className="flex flex-wrap items-center gap-3">
            <Badge>Default</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="error">Error</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="info">Info</Badge>
          </div>

          {/* Solid Badges */}
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="solidSuccess">Buy</Badge>
            <Badge variant="solidError">Sell</Badge>
            <Badge variant="warning">Hold</Badge>
            <Badge variant="solidInfo">New</Badge>
          </div>

          {/* Price Badges */}
          <div className="flex flex-wrap items-center gap-3">
            <PriceBadge value={12.5} />
            <PriceBadge value={-8.3} />
            <PriceBadge value={0} />
            <PriceBadge value={156.78} size="lg" />
          </div>

          {/* Live & Avatar Badges */}
          <div className="flex flex-wrap items-center gap-4">
            <LiveBadge>Live</LiveBadge>
            <LiveBadge color="blue">AI Active</LiveBadge>
            <LiveBadge color="orange">Processing</LiveBadge>
            <AvatarBadge name="John Doe" size="lg" />
            <AvatarBadge name="NVDA" size="lg" color="bg-[#76b900]" />
            <TickerBadge ticker="AAPL" />
            <TickerBadge ticker="TSLA" color="bg-red-500" />
          </div>
        </div>
      </Section>

      {/* Typography Section */}
      <Section id="typography" animate>
        <SectionHeader
          label="TYPOGRAPHY"
          title="Text Styles"
          subtitle="A complete typography system with animated text components."
        />

        <div className="mt-12 space-y-8">
          <Text variant="display">Display Text</Text>
          <Text variant="headline">Headline Text</Text>
          <Text variant="title">Title Text</Text>
          <Text variant="subtitle">Subtitle Text</Text>
          <Text variant="body">Body text for regular content and paragraphs.</Text>
          <Text variant="bodyLarge">Body Large for emphasized paragraphs.</Text>
          <Text variant="caption">Caption text for small labels</Text>
          <Text variant="label">LABEL TEXT</Text>

          <div className="pt-4 border-t border-white/[0.06]">
            <Text variant="label" className="mb-4">SPECIAL TEXT COMPONENTS</Text>

            <GradientText variant="headline" className="mb-4">
              Gradient Headline
            </GradientText>

            <HighlightText highlight="important" className="mb-4">
              Highlight important keywords in your text
            </HighlightText>

            <div className="flex items-center gap-4 mb-4">
              <CounterText value={1234567} prefix="$" className="text-[32px] font-semibold" />
              <CounterText value={99.7} suffix="%" className="text-[32px] font-semibold text-emerald-400" />
            </div>

            <TypewriterText
              text="This text types itself character by character..."
              className="text-[#868f97]"
            />
          </div>
        </div>
      </Section>

      {/* Inputs Section */}
      <Section id="inputs" animate className="bg-[#0a0a0a]">
        <SectionHeader
          label="COMPONENTS"
          title="Form Inputs"
          subtitle="Input fields with various styles including chat and search variants."
        />

        <div className="mt-12 max-w-md space-y-6">
          <Input placeholder="Default input" />
          <Input variant="filled" placeholder="Filled input" />
          <Input variant="glass" placeholder="Glass input" />
          <SearchInput placeholder="Search stocks, news, filings..." />
          <ChatInput placeholder="Ask anything about the market..." />
        </div>
      </Section>

      {/* CMD+K Search Section */}
      <Section id="search" animate>
        <SectionHeader
          label="SPOTLIGHT"
          title="CMD+K Search"
          titleHighlight="CMD+K"
          subtitle="Fey-style global search with real-time stock data from Lician API. Press ⌘K anywhere to try it."
        />

        <div className="mt-12">
          <Card variant="glass" className="p-8 text-center">
            <div className="mb-6">
              <Text variant="headline" className="text-[32px] mb-2">Try it now</Text>
              <Text variant="body">
                Press <kbd className="px-2 py-1 bg-white/[0.1] rounded border border-white/[0.2] text-white font-mono text-sm">⌘K</kbd> or click the search button to open the command palette
              </Text>
            </div>

            <div className="flex justify-center">
              <button
                onClick={() => {
                  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))
                }}
                className="flex items-center gap-3 px-6 py-3 bg-white/[0.08] hover:bg-white/[0.12] rounded-xl border border-white/[0.1] hover:border-white/[0.15] transition-all"
              >
                <svg className="size-5 text-[#868f97]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
                <span className="text-[#868f97]">Search stocks, companies, tools...</span>
                <kbd className="flex items-center gap-1 px-2 py-1 text-[11px] bg-white/[0.05] rounded border border-white/[0.08]">
                  <span>⌘</span>K
                </kbd>
              </button>
            </div>

            <div className="mt-8 pt-8 border-t border-white/[0.06]">
              <Text variant="label" className="mb-4">FEATURES</Text>
              <div className="grid md:grid-cols-3 gap-4 text-left">
                <div className="p-4 bg-white/[0.03] rounded-lg">
                  <Text variant="subtitle" className="mb-1">Real-time Search</Text>
                  <Text variant="caption">150ms debounce with live Lician API results</Text>
                </div>
                <div className="p-4 bg-white/[0.03] rounded-lg">
                  <Text variant="subtitle" className="mb-1">Quick Actions</Text>
                  <Text variant="caption">Jump to screener, earnings, portfolios instantly</Text>
                </div>
                <div className="p-4 bg-white/[0.03] rounded-lg">
                  <Text variant="subtitle" className="mb-1">Keyboard Navigation</Text>
                  <Text variant="caption">Full arrow key + enter support</Text>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </Section>

      {/* Cards Section */}
      <Section id="cards" animate>
        <SectionHeader
          label="COMPONENTS"
          title="Card System"
          titleHighlight="Card"
          subtitle="Versatile card components with multiple variants and stacking support."
        />

        <div className="mt-12">
          {/* Card Variants */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card>
              <CardHeader>
                <Text variant="title">Default Card</Text>
              </CardHeader>
              <CardContent>
                <Text variant="body">Standard card with subtle border and dark background.</Text>
              </CardContent>
            </Card>

            <Card variant="elevated">
              <CardHeader>
                <Text variant="title">Elevated Card</Text>
              </CardHeader>
              <CardContent>
                <Text variant="body">Card with shadow for more visual prominence.</Text>
              </CardContent>
            </Card>

            <Card variant="glass">
              <CardHeader>
                <Text variant="title">Glass Card</Text>
              </CardHeader>
              <CardContent>
                <Text variant="body">Glassmorphism effect with backdrop blur.</Text>
              </CardContent>
            </Card>
          </div>

          {/* Interactive Card */}
          <Card variant="interactive" className="max-w-md mb-12">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Text variant="title">Interactive Card</Text>
                <LiveBadge color="green">Active</LiveBadge>
              </div>
            </CardHeader>
            <CardContent>
              <Text variant="body">Hover over this card to see the lift effect and border glow.</Text>
            </CardContent>
            <CardFooter>
              <LinkButton href="#">View details</LinkButton>
            </CardFooter>
          </Card>

          {/* Stacked Cards */}
          <Text variant="label" className="mb-4">STACKED NOTIFICATION CARDS</Text>
          <div className="relative h-[300px]">
            <StackedCardGroup className="absolute top-0 left-0">
              <StackedCard index={0} total={3}>
                <BriefingCard
                  index={0}
                  total={3}
                  content="Markets opened higher today as investors digested the latest Fed minutes..."
                  readMoreHref="#"
                />
              </StackedCard>
              <StackedCard index={1} total={3}>
                <StockCard
                  index={1}
                  total={3}
                  ticker="NVDA"
                  tickerColor="bg-[#76b900]"
                  price={892.45}
                  change={4.2}
                  content="NVIDIA surges on AI chip demand forecast exceeding expectations."
                />
              </StackedCard>
              <StackedCard index={2} total={3}>
                <AIChatCard
                  index={2}
                  total={3}
                  messages={[
                    { role: 'user', content: 'What are the top gainers today?' },
                    { role: 'assistant', content: 'The top gainers today are:\n1. NVDA +4.2%\n2. SMCI +3.8%\n3. AMD +2.9%' },
                  ]}
                />
              </StackedCard>
            </StackedCardGroup>
          </div>
        </div>
      </Section>

      {/* Notification Components */}
      <Section id="notifications" animate className="bg-[#0a0a0a]">
        <SectionHeader
          label="COMPONENTS"
          title="Notifications"
          subtitle="Real-time alerts, earnings calls, and insider transaction displays."
        />

        <div className="mt-12 space-y-8">
          {/* Earnings Notification */}
          <EarningsNotification
            company="Tesla"
            logo={<span className="text-white font-bold text-sm">T</span>}
            logoColor="bg-red-500"
            status="live"
            onJoin={() => {}}
            onPressRelease={() => {}}
          />

          <EarningsNotification
            company="Apple"
            logo={<span className="text-white font-bold text-sm">A</span>}
            logoColor="bg-gray-600"
            status="upcoming"
            onPressRelease={() => {}}
          />

          {/* Insider Transactions */}
          <Card className="max-w-md">
            <CardHeader>
              <Text variant="title">Recent Insider Activity</Text>
            </CardHeader>
            <CardContent className="space-y-4">
              <InsiderTransaction
                name="Jensen Huang"
                company="NVIDIA Corporation"
                action="Sell"
              />
              <InsiderTransaction
                name="Tim Cook"
                company="Apple Inc."
                action="Sell"
              />
              <InsiderTransaction
                name="Satya Nadella"
                company="Microsoft Corporation"
                action="Buy"
              />
            </CardContent>
          </Card>
        </div>
      </Section>

      {/* Live Market Data */}
      <Section id="live-data" animate>
        <SectionHeader
          label="LIVE DATA"
          title="Market Widgets"
          titleHighlight="Live"
          subtitle="Real-time market data from Lician API. Updates every 30 seconds."
        />

        <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Live Notification Feed */}
          <div className="md:col-span-2 lg:col-span-1">
            <LiveNotificationFeed />
          </div>

          {/* Top Gainers */}
          <MarketMoversWidget type="gainers" />

          {/* Top Losers */}
          <MarketMoversWidget type="losers" />
        </div>

        {/* Earnings Calendar */}
        <div className="mt-6">
          <EarningsCalendarWidget className="max-w-md" />
        </div>
      </Section>

      {/* AI Chat Section */}
      <Section id="ai-chat" animate>
        <SectionHeader
          label="AI ASSISTANT"
          title="Lician AI"
          titleHighlight="AI"
          subtitle="Intelligent financial analysis powered by real-time data. Ask about stocks, fundamentals, or market trends."
        />

        <div className="mt-12 grid lg:grid-cols-2 gap-6">
          {/* Full AI Chat */}
          <FeyAIChat className="h-[500px]" />

          {/* Mini Chat Widgets */}
          <div className="space-y-4">
            <Text variant="label" className="text-[10px]">MINI CHAT WIDGETS</Text>
            <MiniChatWidget
              messages={[
                { role: 'user', content: "What's NVDA's PE ratio?" },
                { role: 'assistant', content: "NVIDIA (NVDA) currently has a P/E ratio of 65.2x based on TTM earnings. This is elevated compared to the sector average of 28x, reflecting high growth expectations in AI/datacenter." },
              ]}
            />
            <MiniChatWidget
              messages={[
                { role: 'user', content: 'Top gainers today?' },
                { role: 'assistant', content: "Today's top gainers:\n1. SMCI +10.9%\n2. MU +7.8%\n3. AFRM +4.1%" },
              ]}
            />
          </div>
        </div>
      </Section>

      {/* Generative UI Section - Rich tool results for AI chat */}
      <Section id="generative-ui" animate className="bg-[#0a0a0a]">
        <SectionHeader
          label="GENERATIVE UI"
          title="Rich Tool Results"
          titleHighlight="Tool Results"
          subtitle="Beautiful AI-rendered components for stock quotes, financials, and market data. These appear in chat when tools complete."
        />

        <div className="mt-12 grid lg:grid-cols-2 gap-8">
          {/* Left Column: Stock Cards */}
          <div className="space-y-6">
            <Text variant="label" className="text-[10px]">STOCK QUOTE CARDS</Text>

            {/* Tool Loading State */}
            <div className="flex flex-wrap gap-2">
              <FeyToolLoading toolName="getStockQuote" />
              <FeyToolLoading toolName="getCompanyFundamentals" />
              <FeyToolLoading toolName="getMarketMovers" />
            </div>

            {/* Stock Quote Card */}
            <FeyStockQuoteCard
              symbol="NVDA"
              name="NVIDIA Corporation"
              price={892.45}
              change={37.82}
              changePercent={4.43}
              marketCap={2200000000000}
            />

            <FeyStockQuoteCard
              symbol="TSLA"
              name="Tesla Inc"
              price={182.63}
              change={-8.42}
              changePercent={-4.41}
              marketCap={580000000000}
            />

            {/* Sector Info */}
            <FeySectorInfo
              symbol="NVDA"
              sector="Technology"
              industry="Semiconductors"
              employees={29600}
            />
          </div>

          {/* Right Column: Financial Data */}
          <div className="space-y-6">
            <Text variant="label" className="text-[10px]">FINANCIAL DATA CARDS</Text>

            {/* Financials Card */}
            <FeyFinancialsCard
              symbol="AAPL"
              revenue={383285000000}
              netIncome={96995000000}
              eps={6.13}
              pe={31.2}
              debtToEquity={1.87}
              profitMargin={0.253}
            />

            {/* Market Movers Card */}
            <FeyMarketMoversCard
              type="gainers"
              stocks={[
                { symbol: 'SMCI', name: 'Super Micro Computer', price: 1024.50, changePercent: 10.94 },
                { symbol: 'MU', name: 'Micron Technology', price: 98.23, changePercent: 7.76 },
                { symbol: 'AFRM', name: 'Affirm Holdings', price: 52.34, changePercent: 4.11 },
                { symbol: 'AMD', name: 'Advanced Micro Devices', price: 178.23, changePercent: 2.96 },
                { symbol: 'ARM', name: 'Arm Holdings', price: 145.67, changePercent: 2.74 },
              ]}
            />
          </div>
        </div>

        {/* Comparison Table */}
        <div className="mt-8">
          <Text variant="label" className="text-[10px] mb-4">COMPARISON TABLE</Text>
          <FeyComparisonCard
            stocks={[
              { symbol: 'NVDA', name: 'NVIDIA', price: 892.45, changePercent: 4.43, pe: 65.2, marketCap: 2200000000000 },
              { symbol: 'AMD', name: 'AMD', price: 178.23, changePercent: 2.96, pe: 38.4, marketCap: 288000000000 },
              { symbol: 'INTC', name: 'Intel', price: 42.15, changePercent: -1.23, pe: 28.7, marketCap: 178000000000 },
              { symbol: 'QCOM', name: 'Qualcomm', price: 168.90, changePercent: 1.45, pe: 23.8, marketCap: 188000000000 },
            ]}
          />
        </div>
      </Section>

      {/* Charts Section */}
      <Section id="charts" animate>
        <SectionHeader
          label="DATA VISUALIZATION"
          title="Chart Components"
          titleHighlight="Charts"
          subtitle="Recharts-powered visualizations with Fey dark theme styling."
        />

        <div className="mt-12 space-y-8">
          {/* Sparklines */}
          <div>
            <Text variant="label" className="text-[10px] mb-4">SPARKLINES</Text>
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3">
                <Text variant="body">NVDA</Text>
                <FeySparkline data={[100, 105, 98, 112, 118, 115, 125, 130]} positive />
                <PriceBadge value={8.5} size="sm" />
              </div>
              <div className="flex items-center gap-3">
                <Text variant="body">TSLA</Text>
                <FeySparkline data={[200, 195, 188, 175, 180, 172, 165, 158]} positive={false} />
                <PriceBadge value={-6.2} size="sm" />
              </div>
            </div>
          </div>

          {/* Mini Chart */}
          <div>
            <Text variant="label" className="text-[10px] mb-4">MINI AREA CHART</Text>
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <Text variant="subtitle">Portfolio Value</Text>
                  <PriceBadge value={12.4} />
                </div>
                <FeyMiniChart
                  data={[
                    { date: 'Mon', value: 45000 },
                    { date: 'Tue', value: 46200 },
                    { date: 'Wed', value: 45800 },
                    { date: 'Thu', value: 48500 },
                    { date: 'Fri', value: 50600 },
                  ]}
                  positive
                />
              </Card>
              <Card className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <Text variant="subtitle">Market Index</Text>
                  <PriceBadge value={-2.1} />
                </div>
                <FeyMiniChart
                  data={[
                    { date: 'Mon', value: 5100 },
                    { date: 'Tue', value: 5050 },
                    { date: 'Wed', value: 4980 },
                    { date: 'Thu', value: 5020 },
                    { date: 'Fri', value: 4993 },
                  ]}
                  positive={false}
                />
              </Card>
            </div>
          </div>

          {/* Stock Chart */}
          <div>
            <Text variant="label" className="text-[10px] mb-4">FULL STOCK CHART</Text>
            <FeyStockChart
              symbol="AAPL"
              name="Apple Inc."
              price={182.52}
              change={3.45}
              changePercent={1.93}
              data={[
                { date: 'Jan 1', value: 175.20 },
                { date: 'Jan 8', value: 178.50 },
                { date: 'Jan 15', value: 176.80 },
                { date: 'Jan 22', value: 180.30 },
                { date: 'Jan 29', value: 182.52 },
              ]}
              timeRange="1M"
            />
          </div>

          {/* Bar Chart */}
          <div>
            <Text variant="label" className="text-[10px] mb-4">BAR CHART</Text>
            <Card className="p-4">
              <Text variant="subtitle" className="mb-4">Quarterly Revenue ($B)</Text>
              <FeyBarChart
                data={[
                  { label: 'Q1', value: 94.8 },
                  { label: 'Q2', value: 81.8 },
                  { label: 'Q3', value: 89.5 },
                  { label: 'Q4', value: 117.2 },
                ]}
                height={200}
                valuePrefix="$"
                valueSuffix="B"
              />
            </Card>
          </div>
        </div>
      </Section>

      {/* Portfolio Section */}
      <Section id="portfolio" animate className="bg-[#0a0a0a]">
        <SectionHeader
          label="TRADING"
          title="Portfolio Components"
          titleHighlight="Portfolio"
          subtitle="Track holdings, manage watchlists, and execute trades."
        />

        <div className="mt-12 grid lg:grid-cols-3 gap-6">
          {/* Portfolio Summary */}
          <FeyPortfolioSummary
            totalValue={125847.32}
            totalGainLoss={15234.56}
            totalGainLossPercent={13.78}
            dayGainLoss={892.45}
            dayGainLossPercent={0.71}
          />

          {/* Quick Trade */}
          <FeyQuickTrade
            symbol="NVDA"
            price={892.45}
            change={37.82}
            changePercent={4.43}
            onBuy={(shares) => console.log('Buy', shares)}
            onSell={(shares) => console.log('Sell', shares)}
          />

          {/* Watchlist */}
          <FeyWatchlist
            title="My Watchlist"
            items={[
              { symbol: 'NVDA', name: 'NVIDIA', price: 892.45, change: 37.82, changePercent: 4.43, sparkline: [85, 87, 86, 89, 91, 90, 89] },
              { symbol: 'TSLA', name: 'Tesla', price: 182.63, change: -3.94, changePercent: -2.11, sparkline: [195, 190, 188, 185, 183, 184, 183] },
              { symbol: 'AAPL', name: 'Apple', price: 182.52, change: 2.34, changePercent: 1.30, sparkline: [178, 179, 180, 181, 182, 181, 183] },
            ]}
            onRemove={(symbol: string) => console.log('Remove', symbol)}
            onAddAlert={(symbol: string) => console.log('Alert', symbol)}
          />
        </div>

        {/* Holdings Table */}
        <div className="mt-6">
          <FeyPortfolioHoldings
            holdings={[
              { symbol: 'NVDA', name: 'NVIDIA Corporation', shares: 50, avgCost: 450.00, currentPrice: 892.45, change: 37.82, changePercent: 4.43, value: 44622.50, gainLoss: 22122.50, gainLossPercent: 98.27, sparkline: [85, 87, 86, 89, 91, 90, 89] },
              { symbol: 'AAPL', name: 'Apple Inc.', shares: 100, avgCost: 150.00, currentPrice: 182.52, change: 2.34, changePercent: 1.30, value: 18252.00, gainLoss: 3252.00, gainLossPercent: 21.68, sparkline: [178, 179, 180, 181, 182, 181, 183] },
              { symbol: 'MSFT', name: 'Microsoft Corporation', shares: 25, avgCost: 280.00, currentPrice: 378.91, change: 5.67, changePercent: 1.52, value: 9472.75, gainLoss: 2472.75, gainLossPercent: 35.33, sparkline: [365, 368, 370, 375, 377, 379, 379] },
              { symbol: 'GOOGL', name: 'Alphabet Inc.', shares: 30, avgCost: 130.00, currentPrice: 141.80, change: 1.23, changePercent: 0.87, value: 4254.00, gainLoss: 354.00, gainLossPercent: 9.08, sparkline: [138, 139, 140, 141, 140, 141, 142] },
            ]}
          />
        </div>
      </Section>

      {/* Data Tables Section */}
      <Section id="data-tables" animate>
        <SectionHeader
          label="FINANCIAL DATA"
          title="Data Tables"
          titleHighlight="Tables"
          subtitle="Sortable tables for earnings, SEC filings, and insider transactions."
        />

        <div className="mt-12 grid lg:grid-cols-2 gap-6">
          {/* Earnings Table */}
          <FeyEarningsTable
            earnings={[
              { symbol: 'NVDA', name: 'NVIDIA Corporation', date: 'Feb 21', time: 'AMC', estimatedEPS: 5.40, actualEPS: 5.82, surprisePercent: 7.78 },
              { symbol: 'AAPL', name: 'Apple Inc.', date: 'Feb 1', time: 'AMC', estimatedEPS: 2.10, actualEPS: 2.18, surprisePercent: 3.81 },
              { symbol: 'TSLA', name: 'Tesla Inc.', date: 'Jan 29', time: 'AMC', estimatedEPS: 0.71, actualEPS: 0.73, surprisePercent: 2.82 },
              { symbol: 'META', name: 'Meta Platforms', date: 'Feb 5', time: 'AMC', estimatedEPS: 4.96 },
            ]}
          />

          {/* SEC Filings Table */}
          <FeyFilingsTable
            filings={[
              { symbol: 'NVDA', type: '10-K', title: 'Annual Report for fiscal year ended January 28, 2024', date: 'Feb 22, 2024' },
              { symbol: 'AAPL', type: '10-Q', title: 'Quarterly Report for period ended December 30, 2023', date: 'Feb 2, 2024' },
              { symbol: 'TSLA', type: '8-K', title: 'Current Report - Results of Operations and Financial Condition', date: 'Jan 24, 2024' },
              { symbol: 'MSFT', type: '10-Q', title: 'Quarterly Report for period ended December 31, 2023', date: 'Jan 30, 2024' },
            ]}
          />
        </div>

        {/* Insider Trades */}
        <div className="mt-6">
          <FeyInsiderTradesTable
            trades={[
              { name: 'Jensen Huang', title: 'CEO', symbol: 'NVDA', date: 'Jan 15', type: 'Sell', shares: 100000, price: 890.50, value: 89050000 },
              { name: 'Tim Cook', title: 'CEO', symbol: 'AAPL', date: 'Jan 12', type: 'Sell', shares: 50000, price: 180.25, value: 9012500 },
              { name: 'Satya Nadella', title: 'CEO', symbol: 'MSFT', date: 'Jan 10', type: 'Buy', shares: 10000, price: 375.00, value: 3750000 },
            ]}
          />
        </div>
      </Section>

      {/* Alerts Section */}
      <Section id="alerts" animate className="bg-[#0a0a0a]">
        <SectionHeader
          label="NOTIFICATIONS"
          title="Alert Components"
          titleHighlight="Alerts"
          subtitle="Price alerts, earnings notifications, and event cards."
        />

        <div className="mt-12 grid lg:grid-cols-3 gap-6">
          {/* Price Alerts */}
          <div className="space-y-4">
            <Text variant="label" className="text-[10px]">PRICE ALERTS</Text>
            <FeyPriceAlert
              symbol="NVDA"
              name="NVIDIA"
              type="above"
              targetPrice={900}
              currentPrice={892.45}
              onDismiss={() => console.log('Dismiss')}
            />
            <FeyPriceAlert
              symbol="TSLA"
              name="Tesla"
              type="below"
              targetPrice={175}
              currentPrice={182.63}
              onDismiss={() => console.log('Dismiss')}
            />
          </div>

          {/* Earnings Cards */}
          <div className="space-y-4">
            <Text variant="label" className="text-[10px]">EARNINGS CARDS</Text>
            <FeyEarningsCard
              symbol="NVDA"
              name="NVIDIA Corporation"
              quarter="Q4 FY24"
              date="Feb 21, 2024"
              estimatedEPS={5.40}
              actualEPS={5.82}
              estimatedRevenue={20500000000}
              actualRevenue={22103000000}
              onViewDetails={() => console.log('View details')}
            />
          </div>

          {/* Alert List */}
          <FeyAlertList
            alerts={[
              { id: '1', symbol: 'NVDA', name: 'NVIDIA', type: 'above', currentPrice: 892.45, targetPrice: 900, triggered: false },
              { id: '2', symbol: 'AAPL', name: 'Apple', type: 'below', currentPrice: 182.52, targetPrice: 175, triggered: false },
              { id: '3', symbol: 'TSLA', name: 'Tesla', type: 'above', currentPrice: 265.00, targetPrice: 250, triggered: true, triggeredAt: '2 hours ago' },
            ]}
            onDismiss={(id: string) => console.log('Dismiss', id)}
            onViewStock={(symbol: string) => console.log('View', symbol)}
          />
        </div>
      </Section>

      {/* Skeletons Section */}
      <Section id="skeletons" animate>
        <SectionHeader
          label="LOADING STATES"
          title="Skeleton Components"
          titleHighlight="Skeletons"
          subtitle="Structured loading states for all UI patterns."
        />

        <div className="mt-12 grid lg:grid-cols-3 gap-6">
          {/* Basic Skeletons */}
          <Card className="p-4 space-y-4">
            <Text variant="label" className="text-[10px]">BASIC SKELETONS</Text>
            <div className="space-y-3">
              <Skeleton height={16} width="80%" />
              <Skeleton height={12} width="60%" />
              <Skeleton height={40} rounded="lg" />
            </div>
            <SkeletonText lines={3} />
          </Card>

          {/* Stock Row Skeleton */}
          <Card className="p-4">
            <Text variant="label" className="text-[10px] mb-4">STOCK ROW SKELETON</Text>
            <div className="space-y-2">
              <SkeletonStockRow />
              <SkeletonStockRow />
              <SkeletonStockRow />
            </div>
          </Card>

          {/* Shimmer Effect */}
          <Card className="p-4 space-y-4">
            <Text variant="label" className="text-[10px]">SHIMMER EFFECT</Text>
            <Shimmer height={120} />
            <div className="flex gap-3">
              <Shimmer width={60} height={60} />
              <div className="flex-1 space-y-2">
                <Shimmer height={14} />
                <Shimmer height={14} width="60%" />
              </div>
            </div>
          </Card>

          {/* Chart Skeleton */}
          <SkeletonChart height={180} />

          {/* Table Skeleton */}
          <SkeletonTable rows={4} columns={4} />

          {/* Portfolio Skeleton */}
          <SkeletonPortfolioSummary />
        </div>
      </Section>

      {/* Floating Dock */}
      <Section id="dock" animate>
        <SectionHeader
          label="COMPONENTS"
          title="Floating Dock"
          titleHighlight="Dock"
          subtitle="macOS-style dock with magnification effect on hover."
          align="center"
        />

        <div className="mt-12 flex justify-center">
          <FloatingDock items={feyDockItems} />
        </div>
      </Section>

      {/* Feature Grid Section */}
      <Section id="features" animate className="bg-[#0a0a0a]">
        <SectionHeader
          label="LAYOUTS"
          title="Feature Grid"
          subtitle="Showcase features with animated cards in a responsive grid."
        />

        <FeatureGrid columns={3} className="mt-12">
          <FeatureCard
            index={0}
            title="Real-time Data"
            description="Live market data with sub-second updates"
          >
            <div className="aspect-[4/3] bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
              <DockIcons.Chart />
            </div>
          </FeatureCard>
          <FeatureCard
            index={1}
            title="AI Analysis"
            description="Smart insights powered by machine learning"
          >
            <div className="aspect-[4/3] bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 flex items-center justify-center">
              <DockIcons.Star />
            </div>
          </FeatureCard>
          <FeatureCard
            index={2}
            title="Notifications"
            description="Stay informed with instant alerts"
          >
            <div className="aspect-[4/3] bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center">
              <DockIcons.Bell />
            </div>
          </FeatureCard>
        </FeatureGrid>
      </Section>

      {/* CTA Section */}
      <CTASection
        eyebrow="READY TO START?"
        title="Build something amazing"
        subtitle="Start using Fey-UI components in your project today."
        primaryAction={<Button variant="primary" size="lg">Get Started</Button>}
        secondaryAction={<Button variant="secondary" size="lg">Documentation</Button>}
      />

      {/* Footer */}
      <Footer
        links={[
          { label: 'Components', href: '#components' },
          { label: 'Documentation', href: '#' },
          { label: 'GitHub', href: '#' },
        ]}
        legalLinks={[
          { label: 'Privacy', href: '#' },
          { label: 'Terms', href: '#' },
        ]}
      />

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        items={navItems}
        cta={{ text: 'Get Started', href: '#' }}
      />
    </div>
  )
}

// =============================================================================
// STAT ITEM
// =============================================================================

interface StatItemProps {
  value: number
  label: string
  prefix?: string
  suffix?: string
}

function StatItem({ value, label, prefix, suffix }: StatItemProps) {
  const { ref, isInView } = useScrollReveal()

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5 }}
    >
      <CounterText
        value={value}
        prefix={prefix}
        suffix={suffix}
        className="text-[36px] md:text-[48px] font-semibold"
      />
      <Text variant="caption" className="mt-1">{label}</Text>
    </motion.div>
  )
}
