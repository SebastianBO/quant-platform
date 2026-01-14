import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { supabase, CompanyFundamentals } from '@/lib/supabase'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import {
  getBreadcrumbSchema,
  getArticleSchema,
  getItemListSchema,
  getFAQSchema,
  SITE_URL,
} from '@/lib/seo'

interface Props {
  params: Promise<{ sector: string }>
}

// Sector mapping: slug -> database sector values
const SECTOR_MAPPINGS: Record<string, string[]> = {
  'technology': ['Technology'],
  'healthcare': ['Healthcare'],
  'financials': ['Financial Services', 'Financials'],
  'energy': ['Energy'],
  'consumer-discretionary': ['Consumer Cyclical', 'Consumer Discretionary'],
  'consumer-staples': ['Consumer Defensive', 'Consumer Staples'],
  'industrials': ['Industrials'],
  'materials': ['Basic Materials', 'Materials'],
  'utilities': ['Utilities'],
  'real-estate': ['Real Estate'],
}

// Sector prediction data with unique, in-depth content for each sector
const SECTOR_PREDICTIONS: Record<string, {
  title: string
  seoTitle: string
  metaDescription: string
  heroIntro: string
  outlook: 'Bullish' | 'Neutral' | 'Bearish' | 'Selective'
  expectedReturn: { low: number; mid: number; high: number }
  catalysts: { title: string; description: string }[]
  risks: string[]
  bullCase: string
  bearCase: string
  topPicksReasoning: string
  keywords: string[]
  faqs: { question: string; answer: string }[]
  relatedSectors: string[]
}> = {
  'technology': {
    title: 'Technology Sector',
    seoTitle: 'Technology Stock Predictions 2026 - Top Tech Stocks to Buy',
    metaDescription: 'Expert technology stock predictions for 2026. AI-powered analysis of top tech stocks including semiconductors, software, and cloud computing. See our price targets and best tech stock picks.',
    heroIntro: `The technology sector enters 2026 at a pivotal moment, positioned at the intersection of artificial intelligence revolution and enterprise digital transformation. After the initial AI euphoria, the market is now pricing in real enterprise adoption metrics and sustainable revenue growth. Semiconductor companies continue to benefit from insatiable AI infrastructure demand, while software companies race to embed AI capabilities into their products.

Cloud computing remains a secular growth driver as businesses migrate mission-critical workloads, with the hyperscalers reporting accelerating AI-related revenue. Cybersecurity spending shows no signs of slowing as threat landscapes evolve and regulatory requirements tighten globally. For investors, the technology sector offers compelling opportunities across the market cap spectrum, from mega-cap leaders with fortress balance sheets to nimble mid-caps capturing emerging niches.`,
    outlook: 'Bullish',
    expectedReturn: { low: 15, mid: 25, high: 40 },
    catalysts: [
      { title: 'Enterprise AI Adoption Acceleration', description: 'Companies are moving from AI pilot programs to production deployments, driving demand for infrastructure and software.' },
      { title: 'GPU Demand Outstripping Supply', description: 'Data center GPU demand continues to exceed manufacturing capacity, benefiting semiconductor leaders.' },
      { title: 'Cloud Migration Wave 2.0', description: 'Legacy enterprise workloads moving to cloud with AI-enabled modernization.' },
      { title: 'Cybersecurity Spending Surge', description: 'Increasing cyber threats and regulations drive security software adoption.' },
      { title: 'Edge Computing Expansion', description: 'AI inference moving to the edge creates new hardware and software opportunities.' },
    ],
    risks: [
      'Regulatory scrutiny on AI and big tech intensifying globally',
      'Semiconductor cycle peak concerns as capex normalizes',
      'Interest rate sensitivity for growth stocks',
      'Concentration risk in AI infrastructure plays',
      'Talent costs and competition for AI engineers',
    ],
    bullCase: 'The bull case for technology sees AI enterprise adoption exceeding expectations, driving a multi-year upgrade cycle for compute infrastructure. Software companies successfully monetize AI features with pricing power, while cloud providers report accelerating growth. Semiconductor shortage extends, benefiting pricing. Tech earnings growth of 25-30% supports valuations, with mega-caps leveraging their AI investments to widen competitive moats.',
    bearCase: 'The bear case envisions AI spending disappointments as ROI proves elusive for enterprises. Regulatory crackdowns on AI and big tech create uncertainty. Interest rates remaining higher for longer compresses growth multiples. Competition intensifies in cloud and AI, pressuring margins. A broader economic slowdown reduces IT spending budgets.',
    topPicksReasoning: 'Our top tech picks balance AI exposure with fundamental quality. We favor companies with dominant market positions, strong free cash flow generation, and proven ability to execute on AI strategy. Semiconductor leaders with data center exposure rank highly, along with enterprise software companies demonstrating AI-driven revenue uplift.',
    keywords: ['technology stock predictions', 'tech stocks 2026', 'best tech stocks to buy', 'AI stocks forecast', 'semiconductor stocks prediction', 'software stocks outlook', 'NVDA stock prediction', 'MSFT stock forecast'],
    faqs: [
      { question: 'What are the best technology stocks to buy in 2026?', answer: 'Top technology stocks for 2026 include AI infrastructure leaders like NVIDIA (NVDA) and AMD, cloud giants Microsoft (MSFT) and Google (GOOGL), and enterprise software companies like Salesforce (CRM) and ServiceNow (NOW). Focus on companies with strong AI positioning and sustainable competitive advantages.' },
      { question: 'Will tech stocks go up in 2026?', answer: 'Tech stocks are expected to deliver 15-25% returns in 2026, driven by AI enterprise adoption, cloud computing growth, and digital transformation spending. However, selectivity is key as not all tech stocks will benefit equally from these trends.' },
      { question: 'What is the outlook for AI stocks in 2026?', answer: 'AI stocks have a bullish outlook for 2026 as enterprise AI adoption moves from experimentation to production. Infrastructure providers (semiconductors, cloud), AI software platforms, and companies successfully monetizing AI features are best positioned.' },
      { question: 'Are semiconductor stocks a good investment in 2026?', answer: 'Semiconductor stocks remain attractive in 2026, particularly those serving AI data center demand. NVIDIA, AMD, and Broadcom lead the pack. However, monitor for inventory digestion in consumer electronics segments.' },
      { question: 'How will interest rates affect tech stocks in 2026?', answer: 'Gradual rate cuts expected in 2026 should support tech stock valuations, particularly high-growth names. Lower rates reduce discount rates used in valuation models, benefiting companies with earnings further in the future.' },
      { question: 'What are the biggest risks for technology stocks?', answer: 'Key risks include regulatory action on AI and big tech, semiconductor cycle peak, geopolitical tensions affecting supply chains, AI spending disappointments, and valuation compression if growth decelerates.' },
    ],
    relatedSectors: ['communication-services', 'consumer-discretionary', 'industrials'],
  },
  'healthcare': {
    title: 'Healthcare Sector',
    seoTitle: 'Healthcare Stock Predictions 2026 - Top Pharma & Biotech Stocks',
    metaDescription: 'Healthcare stock predictions for 2026 with analysis of pharmaceuticals, biotechnology, and medical devices. Expert forecasts for LLY, UNH, JNJ and top healthcare picks.',
    heroIntro: `The healthcare sector in 2026 presents a compelling investment thesis built on demographic tailwinds, therapeutic innovation, and defensive characteristics that provide portfolio ballast. The GLP-1 drug revolution has reshaped the obesity and diabetes landscape, creating massive addressable markets and transforming companies like Eli Lilly and Novo Nordisk into mega-cap growth stories.

Beyond weight loss drugs, oncology innovation continues with next-generation CAR-T therapies, bispecific antibodies, and targeted treatments showing breakthrough results. The healthcare services segment benefits from an aging population requiring increased medical care, while managed care organizations navigate the balance between membership growth and medical cost management. Medical device companies see recovery in procedure volumes and innovation in areas like robotic surgery, continuous glucose monitoring, and cardiac devices.`,
    outlook: 'Bullish',
    expectedReturn: { low: 10, mid: 18, high: 28 },
    catalysts: [
      { title: 'GLP-1 Market Expansion', description: 'Obesity and diabetes drug market expanding to $100B+ with new indications and formulations.' },
      { title: 'Oncology Pipeline Maturation', description: 'Multiple late-stage cancer drug candidates approaching FDA decisions.' },
      { title: 'Medicare Advantage Growth', description: 'Continued shift from traditional Medicare driving managed care enrollment.' },
      { title: 'AI Drug Discovery', description: 'AI-assisted drug development accelerating pipelines and reducing costs.' },
      { title: 'Medical Device Recovery', description: 'Post-pandemic procedure volumes normalizing with surgical robot adoption growing.' },
    ],
    risks: [
      'Drug pricing legislation and IRA negotiations impact',
      'GLP-1 competition intensifying with new market entrants',
      'Medicare Advantage rate cuts affecting managed care margins',
      'Clinical trial failures in late-stage programs',
      'Generic competition for blockbuster drugs',
    ],
    bullCase: 'The bull case for healthcare sees GLP-1 adoption exceeding supply capacity, driving premium pricing and margin expansion for innovators. Oncology breakthroughs create new blockbuster drugs, biotech M&A accelerates as big pharma refills pipelines. Managed care companies successfully manage medical costs while growing membership. Medical device innovation drives procedure adoption.',
    bearCase: 'The bear case involves aggressive drug pricing reforms reducing industry profitability. GLP-1 market becomes commoditized faster than expected with biosimilar competition. Clinical trial failures disappoint in key pipeline programs. Healthcare utilization spikes pressure managed care margins.',
    topPicksReasoning: 'Our healthcare picks emphasize companies with durable competitive advantages, strong pipelines, and reasonable valuations. We favor GLP-1 leaders, diversified pharma with robust pipelines, managed care organizations with scale advantages, and medical device innovators in high-growth segments.',
    keywords: ['healthcare stock predictions', 'pharma stocks 2026', 'biotech stocks forecast', 'medical device stocks', 'LLY stock prediction', 'UNH stock forecast', 'healthcare sector outlook', 'GLP-1 stocks'],
    faqs: [
      { question: 'What are the best healthcare stocks to buy in 2026?', answer: 'Top healthcare stocks for 2026 include Eli Lilly (LLY) leading in GLP-1 drugs, UnitedHealth (UNH) for managed care exposure, Johnson & Johnson (JNJ) for diversified pharma, and Abbott (ABT) for medical devices. Focus on companies with strong pipelines and defensive characteristics.' },
      { question: 'Will healthcare stocks outperform in 2026?', answer: 'Healthcare stocks are expected to outperform with 15-20% sector returns, driven by GLP-1 drug growth, aging demographics, and defensive appeal during market volatility. The sector combines growth characteristics in biotech with stability in managed care.' },
      { question: 'Are GLP-1 drug stocks still a good investment?', answer: 'GLP-1 stocks remain compelling despite elevated valuations due to the massive addressable market in obesity and diabetes, expanding into cardiovascular and liver disease indications. Supply constraints support pricing power through 2026.' },
      { question: 'What is the outlook for biotech stocks in 2026?', answer: 'Biotech stocks have a favorable outlook with potential for M&A activity, FDA approvals in oncology and rare diseases, and improved funding environment as interest rates decline. Selectivity is crucial given clinical trial binary risk.' },
      { question: 'How do drug pricing reforms affect pharma stocks?', answer: 'The Inflation Reduction Act impacts specific drugs facing Medicare negotiation, but diversified pharma companies with strong pipelines can offset this through new product launches. Companies with recent patent cliffs face more pressure than innovators.' },
      { question: 'Are hospital stocks a good investment in 2026?', answer: 'Hospital stocks offer upside from improving procedure volumes and surgical recovery, but face headwinds from labor costs and potential policy changes. Focus on systems with scale advantages and strong payer mix.' },
    ],
    relatedSectors: ['consumer-staples', 'technology', 'industrials'],
  },
  'financials': {
    title: 'Financial Sector',
    seoTitle: 'Financial Stock Predictions 2026 - Best Bank & Fintech Stocks',
    metaDescription: 'Financial sector stock predictions for 2026. Expert analysis of bank stocks, payment processors, insurance companies, and fintech. See JPM, V, MA price targets.',
    heroIntro: `The financial sector enters 2026 navigating a normalized rate environment after years of monetary policy volatility. Banks are positioned to benefit from stable net interest margins while loan growth gradually recovers from post-pandemic caution. Credit quality remains solid, with commercial real estate the primary area of investor scrutiny as office properties face structural challenges.

Payment networks Visa and Mastercard continue compounding earnings through cross-border travel recovery and the secular shift from cash to digital payments. Insurance companies benefit from favorable underwriting conditions and investment income normalization. Asset managers see opportunities in both active and passive strategies as investors reallocate portfolios. The fintech revolution continues reshaping the industry, with established players and disruptors competing for share of the expanding digital financial services pie.`,
    outlook: 'Bullish',
    expectedReturn: { low: 8, mid: 15, high: 22 },
    catalysts: [
      { title: 'Net Interest Margin Stability', description: 'Normalized rate environment supports predictable bank earnings.' },
      { title: 'Cross-Border Payment Recovery', description: 'International travel fully recovered, boosting premium payment volumes.' },
      { title: 'Capital Return Programs', description: 'Strong capital positions support aggressive buyback and dividend programs.' },
      { title: 'Credit Card Spend Growth', description: 'Consumer spending resilience drives transaction volume growth.' },
      { title: 'Insurance Pricing Power', description: 'Hard market conditions persist in property & casualty lines.' },
    ],
    risks: [
      'Commercial real estate loan losses, particularly office',
      'Consumer credit deterioration if economy weakens',
      'Regulatory capital requirements increasing',
      'Fintech competition pressuring traditional business models',
      'Litigation and regulatory settlements',
    ],
    bullCase: 'The bull case envisions loan growth accelerating as economic confidence improves, with credit quality remaining benign. Payment volumes exceed expectations on consumer resilience and digital adoption. Banks return significant capital through buybacks, driving EPS growth. Insurance pricing remains favorable while claims normalize.',
    bearCase: 'The bear case involves commercial real estate losses materializing beyond provisions, particularly in office. Consumer credit weakens as excess savings deplete. Payment growth slows on consumer spending pullback. Regulatory scrutiny intensifies following regional bank stress.',
    topPicksReasoning: 'Our financial picks favor diversified business models, strong capital positions, and proven execution. We overweight payment networks for their durable growth and capital-light models, mega-cap banks with fortress balance sheets, and insurance companies benefiting from pricing cycles.',
    keywords: ['financial stocks predictions', 'bank stocks 2026', 'payment stocks forecast', 'JPM stock prediction', 'Visa stock forecast', 'insurance stocks outlook', 'fintech stocks 2026'],
    faqs: [
      { question: 'What are the best financial stocks to buy in 2026?', answer: 'Top financial stocks for 2026 include JPMorgan Chase (JPM) for diversified banking, Visa (V) and Mastercard (MA) for payment growth, Berkshire Hathaway (BRK.B) for diversification, and Progressive (PGR) for insurance. Focus on quality franchises with capital return potential.' },
      { question: 'Will bank stocks go up in 2026?', answer: 'Bank stocks should deliver 10-15% returns in 2026 as net interest margins stabilize, loan growth improves, and capital return programs continue. Monitor commercial real estate exposure and credit trends for risk assessment.' },
      { question: 'Are payment stocks better than bank stocks?', answer: 'Payment stocks like Visa and Mastercard offer higher growth rates and returns on capital than traditional banks, with less credit risk. However, they trade at premium valuations. Banks offer higher dividend yields and more cyclical upside.' },
      { question: 'What is the outlook for interest rates in 2026?', answer: 'Interest rates are expected to decline gradually in 2026, with the Fed funds rate potentially reaching 3.5-4.0%. This creates a favorable but normalized environment for bank net interest margins.' },
      { question: 'Are regional bank stocks safe to invest in?', answer: 'Regional bank stocks offer upside but require careful due diligence on deposit stability, commercial real estate exposure, and capital levels. Quality regionals with diversified deposit bases and limited CRE concentration are preferred.' },
      { question: 'How do fintech stocks compare to traditional banks?', answer: 'Fintech stocks offer higher growth potential but face profitability challenges and regulatory uncertainty. Traditional banks have durable franchises and capital return potential. A barbell approach owning both can capture fintech growth and bank stability.' },
    ],
    relatedSectors: ['real-estate', 'technology', 'industrials'],
  },
  'energy': {
    title: 'Energy Sector',
    seoTitle: 'Energy Stock Predictions 2026 - Oil, Gas & Clean Energy Forecast',
    metaDescription: 'Energy stock predictions for 2026 covering oil & gas, renewables, and utilities. Expert analysis of XOM, CVX, NEE with price targets and sector outlook.',
    heroIntro: `The energy sector in 2026 navigates the complex intersection of traditional hydrocarbon demand, energy transition investments, and geopolitical supply dynamics. Oil prices have found equilibrium around levels that support producer profitability while not destroying demand, with OPEC+ managing supply discipline. Natural gas demand continues growing as a bridge fuel, particularly in Asia and emerging markets.

The energy transition creates opportunities across the value chain, from renewable developers to grid infrastructure providers. Integrated oil majors balance capital discipline in upstream with strategic investments in low-carbon businesses. Midstream companies offer attractive yields supported by long-term contracted cash flows. For investors, the energy sector provides inflation hedging, income generation, and exposure to both traditional and emerging energy sources.`,
    outlook: 'Neutral',
    expectedReturn: { low: 5, mid: 12, high: 20 },
    catalysts: [
      { title: 'OPEC+ Supply Discipline', description: 'Continued production management supports oil prices in $70-85 range.' },
      { title: 'LNG Export Growth', description: 'New LNG export terminals coming online serve growing global demand.' },
      { title: 'Data Center Power Demand', description: 'AI infrastructure driving unprecedented electricity demand growth.' },
      { title: 'Grid Infrastructure Spending', description: 'Transmission and distribution upgrades accelerating globally.' },
      { title: 'Dividend Growth and Buybacks', description: 'Strong cash flows support shareholder returns.' },
    ],
    risks: [
      'Oil demand destruction from EV adoption and efficiency',
      'OPEC+ discipline breakdown flooding market',
      'Geopolitical supply disruptions',
      'Renewable cost deflation pressuring traditional energy',
      'ESG-related investment restrictions',
    ],
    bullCase: 'The bull case sees oil demand resilient as emerging market growth offsets developed market declines. OPEC+ maintains discipline, supporting prices. Energy companies maintain capital discipline, prioritizing returns over growth. Natural gas demand exceeds supply additions. Infrastructure investment accelerates.',
    bearCase: 'The bear case involves demand destruction from EV adoption exceeding expectations. OPEC+ loses cohesion, flooding the market. Global recession reduces energy consumption. Renewable cost curves accelerate, pressuring fossil fuel economics.',
    topPicksReasoning: 'Our energy picks balance yield, growth, and transition positioning. We favor integrated majors with strong balance sheets and disciplined capital allocation, midstream operators with contracted cash flows, and renewable/utility plays benefiting from electrification.',
    keywords: ['energy stock predictions', 'oil stocks 2026', 'natural gas stocks forecast', 'XOM stock prediction', 'renewable energy stocks', 'clean energy forecast', 'energy sector outlook'],
    faqs: [
      { question: 'What are the best energy stocks to buy in 2026?', answer: 'Top energy stocks for 2026 include ExxonMobil (XOM) and Chevron (CVX) for integrated exposure, NextEra Energy (NEE) for renewables, Kinder Morgan (KMI) for midstream income, and ConocoPhillips (COP) for upstream leverage. Balance traditional and transition exposure.' },
      { question: 'Will oil stocks go up in 2026?', answer: 'Oil stocks should deliver 8-15% total returns in 2026 including dividends, supported by stable commodity prices and shareholder return programs. Returns depend heavily on oil price outcomes and capital discipline.' },
      { question: 'Should I invest in renewable energy stocks?', answer: 'Renewable energy stocks offer long-term growth exposure to energy transition but face near-term headwinds from higher rates and supply chain costs. Focus on profitable operators with contracted cash flows rather than speculative developers.' },
      { question: 'What is the outlook for oil prices in 2026?', answer: 'Oil prices are expected to trade in a $70-85/barrel range in 2026, supported by OPEC+ supply management and resilient demand. Upside risks from geopolitical disruption; downside from demand destruction or supply discipline breakdown.' },
      { question: 'Are energy dividend stocks safe?', answer: 'Energy dividend stocks have become more sustainable as companies prioritize balance sheet strength and variable dividends. Midstream MLPs and integrated majors offer attractive yields. Avoid pure-play E&P companies with high dividend payout ratios.' },
      { question: 'How does the energy transition affect oil stocks?', answer: 'The energy transition creates long-term headwinds for oil demand but the pace is gradual. Well-positioned integrated majors are investing in low-carbon while maintaining upstream discipline. Short-term cash flows remain strong.' },
    ],
    relatedSectors: ['utilities', 'materials', 'industrials'],
  },
  'consumer-discretionary': {
    title: 'Consumer Discretionary Sector',
    seoTitle: 'Consumer Discretionary Stock Predictions 2026 - Retail & Auto Stocks',
    metaDescription: 'Consumer discretionary stock predictions for 2026. Analysis of retail, automotive, restaurants, and travel stocks. AMZN, TSLA, HD price targets and outlook.',
    heroIntro: `Consumer discretionary stocks in 2026 reflect the evolving American consumer, who continues spending despite economic uncertainties but with increasingly selective preferences. E-commerce penetration stabilizes at higher post-pandemic levels, with omnichannel leaders capturing share from pure-play retailers. The housing market influences home improvement spending, while automotive demand navigates the EV transition with varied success across manufacturers.

Restaurant and travel spending remains resilient as consumers prioritize experiences over goods. Premium and value segments outperform the squeezed middle, with strong brands commanding pricing power. The retail landscape continues consolidating around winners with scale advantages, digital capabilities, and compelling value propositions. For investors, consumer discretionary offers growth exposure tied to economic strength and consumer confidence.`,
    outlook: 'Selective',
    expectedReturn: { low: 8, mid: 15, high: 25 },
    catalysts: [
      { title: 'E-commerce Growth Acceleration', description: 'Digital penetration gains continuing with AI-enhanced shopping experiences.' },
      { title: 'Housing Market Recovery', description: 'Rate cuts supporting home sales and renovation spending.' },
      { title: 'Travel Spending Momentum', description: 'Experience economy driving hotel, cruise, and leisure spending.' },
      { title: 'EV Market Evolution', description: 'Electric vehicle adoption growing with improving infrastructure.' },
      { title: 'Restaurant Resilience', description: 'Dining out spending remains strong with value innovation.' },
    ],
    risks: [
      'Consumer spending slowdown if employment weakens',
      'Excess inventory and promotional pressure',
      'EV demand uncertainty affecting automakers',
      'Rising credit delinquencies impacting spending',
      'Wage pressure on restaurant and retail margins',
    ],
    bullCase: 'The bull case sees consumer confidence supported by stable employment and declining inflation. E-commerce leaders extend market share with AI personalization. Housing market recovery boosts home improvement. Travel and leisure spending exceeds expectations. Strong brands maintain pricing power.',
    bearCase: 'The bear case involves consumer spending cracking as excess savings deplete. Promotional intensity compresses retail margins. EV demand disappoints, pressuring automakers with inventory. Housing remains sluggish, impacting home improvement. Restaurant traffic declines on discretionary pullback.',
    topPicksReasoning: 'Our consumer discretionary picks emphasize dominant market positions, strong brands, and e-commerce leadership. We favor companies with scale advantages, compelling value propositions, and proven ability to navigate economic cycles.',
    keywords: ['consumer discretionary predictions', 'retail stocks 2026', 'AMZN stock forecast', 'TSLA stock prediction', 'restaurant stocks outlook', 'travel stocks 2026', 'automotive stocks forecast'],
    faqs: [
      { question: 'What are the best consumer discretionary stocks for 2026?', answer: 'Top picks include Amazon (AMZN) for e-commerce dominance, Home Depot (HD) for home improvement leadership, Chipotle (CMG) for restaurant growth, and Booking Holdings (BKNG) for travel exposure. Focus on companies with strong competitive positions and pricing power.' },
      { question: 'Will retail stocks go up in 2026?', answer: 'Retail stocks should deliver 10-18% returns in 2026, with significant dispersion between winners and losers. E-commerce leaders and off-price retailers likely outperform traditional department stores.' },
      { question: 'Is Tesla stock a good investment in 2026?', answer: 'Tesla offers AI and robotics optionality beyond EVs but faces intensifying EV competition and margin pressure. The stock remains volatile and suitable for investors with higher risk tolerance and conviction in Tesla vision beyond automotive.' },
      { question: 'What is the outlook for restaurant stocks?', answer: 'Restaurant stocks have mixed outlook in 2026 with fast casual outperforming QSR. Labor costs remain a headwind but demand stays resilient. Focus on brands with strong unit economics and digital ordering capabilities.' },
      { question: 'How do interest rates affect consumer discretionary stocks?', answer: 'Lower rates in 2026 should benefit rate-sensitive segments like housing and automotive while supporting consumer confidence. Home improvement and big-ticket purchases benefit most from declining financing costs.' },
      { question: 'Are luxury stocks a good investment?', answer: 'Luxury stocks face near-term headwinds from China demand uncertainty but long-term secular growth from expanding global wealth. Quality brands with heritage and pricing power offer attractive entry points on weakness.' },
    ],
    relatedSectors: ['consumer-staples', 'technology', 'communication-services'],
  },
  'consumer-staples': {
    title: 'Consumer Staples Sector',
    seoTitle: 'Consumer Staples Stock Predictions 2026 - Best Defensive Stocks',
    metaDescription: 'Consumer staples stock predictions for 2026. Defensive stocks analysis including food, beverage, and household products. PG, KO, COST price targets.',
    heroIntro: `Consumer staples represent the bedrock of defensive investing, offering stable earnings and dividends through economic cycles. These companies produce essential products that consumers purchase regardless of economic conditions, from food and beverages to household cleaning supplies and personal care items. In 2026, the sector balances volume recovery with pricing normalization after years of inflation-driven price increases.

Leading staples companies leverage brand strength and global distribution to maintain market share against private label competition. Cost pressures from commodities and labor have largely stabilized, supporting margin recovery. Dividend growth remains a priority for management teams, with many staples companies boasting decades of consecutive increases. For investors seeking portfolio stability, income generation, and inflation protection, consumer staples offer compelling risk-adjusted returns.`,
    outlook: 'Neutral',
    expectedReturn: { low: 6, mid: 10, high: 15 },
    catalysts: [
      { title: 'Volume Recovery', description: 'Stabilizing prices enabling volume growth recovery.' },
      { title: 'Margin Expansion', description: 'Input cost moderation supporting profit margins.' },
      { title: 'Emerging Market Growth', description: 'Rising middle class driving consumption in developing markets.' },
      { title: 'Dividend Growth', description: 'Continued commitment to shareholder returns.' },
      { title: 'Innovation Pipeline', description: 'New products addressing health and sustainability trends.' },
    ],
    risks: [
      'Private label share gains in inflationary environment',
      'GLP-1 drug impact on snacking and beverage consumption',
      'Commodity cost volatility',
      'Currency headwinds from strong dollar',
      'Retailer consolidation pressuring supplier terms',
    ],
    bullCase: 'The bull case sees volume growth resuming as pricing stabilizes, with consumers returning to trusted brands. Cost pressures moderate, expanding margins. Emerging markets deliver growth. Dividend aristocrat status attracts yield-seeking investors. Innovation drives premiumization.',
    bearCase: 'The bear case involves persistent consumer trade-down to private label. GLP-1 drugs materially impact food and beverage consumption. Commodity costs reaccelerate. Currency headwinds persist. Volume growth remains elusive.',
    topPicksReasoning: 'Our consumer staples picks emphasize brand strength, pricing power, and dividend reliability. We favor companies with diversified product portfolios, global distribution, and track records of navigating challenging environments.',
    keywords: ['consumer staples predictions', 'defensive stocks 2026', 'dividend stocks forecast', 'PG stock prediction', 'KO stock forecast', 'food stocks outlook', 'COST stock prediction'],
    faqs: [
      { question: 'What are the best consumer staples stocks for 2026?', answer: 'Top consumer staples include Procter & Gamble (PG) for brand diversification, Coca-Cola (KO) for beverage leadership, Costco (COST) for retail dominance, and Colgate-Palmolive (CL) for oral care strength. Focus on dividend aristocrats with pricing power.' },
      { question: 'Are consumer staples good defensive investments?', answer: 'Yes, consumer staples offer defensive characteristics with stable earnings, consistent dividends, and low beta. They typically outperform during market downturns and recessions when investors seek safety and income.' },
      { question: 'What is the outlook for dividend growth in staples?', answer: 'Consumer staples dividend growth should continue at 3-5% annually in 2026, supported by stable earnings and manageable payout ratios. Many sector leaders are dividend aristocrats with decades of consecutive increases.' },
      { question: 'How do GLP-1 drugs affect food and beverage stocks?', answer: 'GLP-1 drugs pose a medium-term risk to snacking and caloric beverage consumption as users reduce food intake. Impact is gradual and partially offset by population growth and innovation in healthier products.' },
      { question: 'Are consumer staples undervalued in 2026?', answer: 'Consumer staples trade near historical average valuations after underperforming growth stocks. They offer reasonable value for income-focused investors but limited upside for those seeking capital appreciation.' },
      { question: 'Should I own consumer staples in a rising rate environment?', answer: 'Consumer staples typically underperform in rising rate environments as their bond-like characteristics become less attractive. With rates potentially declining in 2026, staples should see relative improvement.' },
    ],
    relatedSectors: ['healthcare', 'consumer-discretionary', 'utilities'],
  },
  'industrials': {
    title: 'Industrials Sector',
    seoTitle: 'Industrial Stock Predictions 2026 - Aerospace, Defense & Manufacturing',
    metaDescription: 'Industrial stock predictions for 2026. Analysis of aerospace, defense, machinery, and transportation stocks. CAT, BA, UNP price targets and outlook.',
    heroIntro: `The industrial sector in 2026 reflects the ongoing reshoring of manufacturing, infrastructure investment, and aerospace recovery. Capital expenditure cycles are extending as companies invest in automation, sustainability, and supply chain resilience. Aerospace backlogs stretch for years, with Boeing and Airbus working through historic order books while addressing production challenges.

Defense spending remains elevated globally amid geopolitical tensions, benefiting prime contractors with multi-year programs. The transportation sector navigates normalizing freight demand while investing in efficiency improvements. Infrastructure spending from government programs flows through to construction equipment and materials. For investors, industrials offer economic leverage, dividend income, and exposure to secular trends in automation and electrification.`,
    outlook: 'Bullish',
    expectedReturn: { low: 10, mid: 16, high: 24 },
    catalysts: [
      { title: 'Aerospace Backlog Execution', description: 'Record aircraft backlogs converting to revenue as production ramps.' },
      { title: 'Defense Budget Growth', description: 'Sustained defense spending amid global security concerns.' },
      { title: 'Infrastructure Bill Spending', description: 'Federal infrastructure funds flowing to construction and materials.' },
      { title: 'Reshoring Investments', description: 'Manufacturing returning to North America driving equipment demand.' },
      { title: 'Automation and Electrification', description: 'Industrial companies investing in next-generation technologies.' },
    ],
    risks: [
      'Economic slowdown reducing capital expenditure',
      'Aerospace production challenges persisting',
      'Freight recession extending in transportation',
      'Labor availability and cost pressures',
      'Supply chain disruptions affecting delivery',
    ],
    bullCase: 'The bull case sees aerospace production ramping successfully, converting backlog to cash. Defense spending increases with global tensions. Infrastructure spending accelerates in back half of decade. Reshoring drives equipment investment. Industrial earnings grow 15%+ annually.',
    bearCase: 'The bear case involves economic slowdown reducing capital investment. Aerospace faces continued production challenges. Freight demand remains depressed. Labor and supply chain issues persist. Infrastructure spending delays disappoint.',
    topPicksReasoning: 'Our industrial picks balance cycle exposure with quality. We favor aerospace beneficiaries with multi-year backlogs, defense contractors with prime positions, and diversified industrials with automation exposure.',
    keywords: ['industrial stocks predictions', 'aerospace stocks 2026', 'defense stocks forecast', 'CAT stock prediction', 'BA stock forecast', 'manufacturing stocks outlook', 'transportation stocks 2026'],
    faqs: [
      { question: 'What are the best industrial stocks for 2026?', answer: 'Top industrial stocks include Caterpillar (CAT) for construction equipment, Boeing (BA) for aerospace leverage, Lockheed Martin (LMT) for defense, Union Pacific (UNP) for rail transport, and Honeywell (HON) for diversified exposure.' },
      { question: 'Will aerospace stocks recover in 2026?', answer: 'Aerospace stocks should continue recovering in 2026 as production ramps to address record backlogs. Boeing execution on production rates is key. Commercial aerospace spending growth of 10-15% expected.' },
      { question: 'What is the outlook for defense stocks?', answer: 'Defense stocks have favorable outlook with global defense budgets increasing amid geopolitical tensions. Multi-year programs provide visibility. Focus on prime contractors with backlog and international exposure.' },
      { question: 'How does infrastructure spending affect industrial stocks?', answer: 'Infrastructure spending from federal programs benefits construction equipment makers, engineering firms, and materials companies. The full impact materializes over several years as projects move from funding to execution.' },
      { question: 'Are transportation stocks a good investment?', answer: 'Transportation stocks face mixed outlook as freight demand normalizes. Railroads offer efficiency improvements and pricing power. Trucking faces capacity adjustments. Airlines benefit from strong travel demand.' },
      { question: 'What industrial stocks benefit from reshoring?', answer: 'Reshoring benefits automation providers, construction equipment manufacturers, electrical infrastructure companies, and industrial HVAC businesses. Look for companies with U.S. manufacturing exposure and automation products.' },
    ],
    relatedSectors: ['materials', 'technology', 'energy'],
  },
  'materials': {
    title: 'Materials Sector',
    seoTitle: 'Materials Stock Predictions 2026 - Mining, Chemicals & Commodities',
    metaDescription: 'Materials sector stock predictions for 2026. Analysis of mining, chemicals, metals, and packaging stocks. NEM, LIN, FCX price targets and forecast.',
    heroIntro: `The materials sector in 2026 operates at the nexus of global economic growth, infrastructure investment, and energy transition demand. Copper stands out as the critical metal for electrification, with structural supply deficits projected as EV and grid infrastructure buildout accelerates. Gold maintains its safe-haven appeal amid monetary policy uncertainty and geopolitical risks.

Chemical companies navigate cyclical recovery in volumes after destocking phases, while specialty materials benefit from semiconductor and EV battery production. Steel and construction materials see support from infrastructure programs. Industrial gas companies compound earnings through long-term take-or-pay contracts and operational efficiency. For investors, materials offer commodity exposure, inflation hedging, and leverage to global industrial activity.`,
    outlook: 'Neutral',
    expectedReturn: { low: 6, mid: 12, high: 20 },
    catalysts: [
      { title: 'Copper Supply Deficit', description: 'Electrification demand outpacing mine supply growth.' },
      { title: 'Infrastructure Materials Demand', description: 'Government programs driving construction materials consumption.' },
      { title: 'Chemical Volume Recovery', description: 'Destocking complete, volumes recovering to normalized levels.' },
      { title: 'Gold Safe Haven', description: 'Monetary uncertainty supporting precious metals.' },
      { title: 'Battery Materials Growth', description: 'EV production growth driving lithium, nickel demand.' },
    ],
    risks: [
      'Global economic slowdown reducing commodity demand',
      'China construction weakness persisting',
      'Commodity price volatility',
      'Environmental regulations increasing costs',
      'New supply coming online pressuring prices',
    ],
    bullCase: 'The bull case sees copper prices rising on structural deficit, benefiting miners. Infrastructure spending drives construction materials demand. Chemical volumes recover with margin improvement. Gold rallies on monetary policy uncertainty. Battery materials see sustained demand.',
    bearCase: 'The bear case involves China property weakness continuing to pressure commodity demand. New copper supply additions exceed expectations. Chemical overcapacity persists. Dollar strength pressures commodity prices. Recession reduces industrial demand.',
    topPicksReasoning: 'Our materials picks balance commodity exposure with quality. We favor copper-exposed miners benefiting from electrification, industrial gas leaders with contracted cash flows, and diversified chemical companies with specialty exposure.',
    keywords: ['materials stocks predictions', 'mining stocks 2026', 'copper stocks forecast', 'chemical stocks outlook', 'gold stocks prediction', 'commodity stocks 2026'],
    faqs: [
      { question: 'What are the best materials stocks for 2026?', answer: 'Top materials stocks include Freeport-McMoRan (FCX) for copper exposure, Linde (LIN) for industrial gases, Newmont (NEM) for gold, Nucor (NUE) for steel, and Air Products (APD) for hydrogen. Focus on companies benefiting from structural trends.' },
      { question: 'Will copper stocks go up in 2026?', answer: 'Copper stocks have bullish outlook due to structural supply deficit from electrification demand. EV and grid buildout require massive copper investment. Quality copper miners should outperform broader materials sector.' },
      { question: 'What is the outlook for gold stocks?', answer: 'Gold stocks benefit from monetary policy uncertainty and safe-haven demand. Real interest rates and dollar strength are key drivers. Quality miners with low costs and growing production are preferred.' },
      { question: 'Are chemical stocks a good investment?', answer: 'Chemical stocks face mixed outlook with commodity chemicals cyclically recovering while specialties offer stability. Focus on companies with differentiated products, pricing power, and cost advantages.' },
      { question: 'How does China affect materials stocks?', answer: 'China is the largest commodity consumer, significantly impacting materials demand and prices. Property weakness creates headwinds while infrastructure stimulus provides support. Monitor China PMI and construction data.' },
      { question: 'What materials benefit from energy transition?', answer: 'Copper, lithium, nickel, cobalt, and rare earths are critical for EVs and renewable energy. Copper for wiring and grid infrastructure. Lithium for batteries. These commodities have structural demand growth.' },
    ],
    relatedSectors: ['industrials', 'energy', 'utilities'],
  },
  'utilities': {
    title: 'Utilities Sector',
    seoTitle: 'Utility Stock Predictions 2026 - Best Dividend & Renewable Stocks',
    metaDescription: 'Utility stock predictions for 2026. Analysis of electric, gas utilities and renewable energy stocks. NEE, DUK, SO price targets and dividend outlook.',
    heroIntro: `The utilities sector in 2026 stands at an inflection point, driven by unprecedented electricity demand growth from data centers, EVs, and electrification. After decades of flat to declining power demand, utilities face the challenge of rapidly expanding generation and transmission capacity. This creates both growth opportunities through rate base investment and execution risks from construction and regulatory challenges.

Regulated utilities offer stable, inflation-adjusted returns through rate cases, while renewables-focused players capture clean energy growth. The AI revolution has transformed the sector outlook, with data center power demand potentially adding percentage points to annual load growth. Nuclear power sees renewed interest for carbon-free baseload. For investors, utilities provide income, defensive characteristics, and now genuine growth opportunities from electrification.`,
    outlook: 'Bullish',
    expectedReturn: { low: 8, mid: 14, high: 20 },
    catalysts: [
      { title: 'Data Center Demand Surge', description: 'AI infrastructure driving unprecedented electricity demand growth.' },
      { title: 'Rate Base Growth', description: 'Grid investments supporting regulated earnings growth.' },
      { title: 'Clean Energy Transition', description: 'Renewable buildout accelerating with IRA incentives.' },
      { title: 'Nuclear Renaissance', description: 'Carbon-free baseload power gaining policy support.' },
      { title: 'EV Infrastructure', description: 'Charging network buildout driving distribution investment.' },
    ],
    risks: [
      'Rising interest rates increasing funding costs',
      'Regulatory pushback on rate increases',
      'Construction cost overruns and delays',
      'Severe weather events affecting reliability',
      'Political changes affecting clean energy incentives',
    ],
    bullCase: 'The bull case sees data center demand exceeding projections, driving load growth acceleration. Regulators support infrastructure investment with constructive rate outcomes. Clean energy projects execute on budget. Falling rates improve relative attractiveness of utility dividends.',
    bearCase: 'The bear case involves regulatory resistance to rate increases needed for infrastructure investment. Construction costs exceed budgets. Higher interest rates compress utility valuations. Clean energy incentives face political risk.',
    topPicksReasoning: 'Our utility picks balance yield with growth. We favor utilities with data center exposure, clean energy portfolios, and constructive regulatory environments. Quality execution and conservative financial policies are paramount.',
    keywords: ['utility stocks predictions', 'electric utility stocks 2026', 'dividend stocks forecast', 'NEE stock prediction', 'renewable utility stocks', 'data center power stocks'],
    faqs: [
      { question: 'What are the best utility stocks for 2026?', answer: 'Top utility stocks include NextEra Energy (NEE) for renewables leadership, Duke Energy (DUK) for regulated reliability, Southern Company (SO) for nuclear exposure, and American Electric Power (AEP) for grid investment. Focus on utilities with data center exposure.' },
      { question: 'Will utility stocks go up in 2026?', answer: 'Utility stocks should deliver 10-15% total returns in 2026, supported by data center demand growth and falling interest rates. The sector transforms from pure income play to growth opportunity with electrification.' },
      { question: 'How does AI affect utility stocks?', answer: 'AI data centers are driving unprecedented electricity demand growth, potentially adding 2-4% annually to load growth vs historical flat demand. Utilities with data center customers and clean energy portfolios benefit most.' },
      { question: 'Are utility dividends safe?', answer: 'Utility dividends are generally safe, supported by regulated earnings and conservative payout ratios. Focus on utilities with investment-grade credit ratings and constructive regulatory relationships. Avoid over-levered or speculative names.' },
      { question: 'What is the outlook for renewable utilities?', answer: 'Renewable utilities have strong outlook with IRA incentives supporting project economics. Execution and permitting remain challenges. NextEra Energy and other clean energy leaders should outperform traditional regulated utilities.' },
      { question: 'How do interest rates affect utility stocks?', answer: 'Utility stocks are sensitive to interest rates due to high debt levels and bond-like characteristics. Falling rates in 2026 should support valuations. Rising rates would pressure the sector despite improved growth outlook.' },
    ],
    relatedSectors: ['energy', 'real-estate', 'consumer-staples'],
  },
  'real-estate': {
    title: 'Real Estate Sector',
    seoTitle: 'Real Estate Stock Predictions 2026 - Best REITs to Buy',
    metaDescription: 'Real estate stock predictions for 2026. REIT analysis covering data centers, industrial, residential, and healthcare properties. PLD, AMT, EQIX forecasts.',
    heroIntro: `The real estate sector in 2026 presents a tale of two markets: fundamentally challenged office properties contrasting sharply with thriving data centers, industrial logistics, and residential rentals. Data center REITs emerge as the clear winners, struggling to build capacity fast enough to meet AI-driven demand. Industrial warehouses maintain high occupancy despite e-commerce growth normalization, while residential benefits from housing unaffordability keeping renters in place.

Office properties face secular headwinds from hybrid work, with suburban offices outperforming urban cores. Retail selectively recovers as quality locations attract experiential tenants. Healthcare real estate benefits from aging demographics. For REIT investors, the mandate to distribute 90% of taxable income as dividends provides attractive yields, while selective growth opportunities exist in technology-adjacent property types.`,
    outlook: 'Selective',
    expectedReturn: { low: 6, mid: 12, high: 18 },
    catalysts: [
      { title: 'Data Center Demand Explosion', description: 'AI infrastructure driving unprecedented demand for digital real estate.' },
      { title: 'Falling Interest Rates', description: 'Lower rates supporting property valuations and refinancing.' },
      { title: 'Industrial Resilience', description: 'Supply chain investment maintaining warehouse demand.' },
      { title: 'Residential Rent Growth', description: 'Housing unaffordability supporting apartment demand.' },
      { title: 'Healthcare Demographics', description: 'Aging population driving senior housing and medical office demand.' },
    ],
    risks: [
      'Office property valuations declining further',
      'Commercial mortgage stress affecting regional banks',
      'Interest rates remaining higher for longer',
      'Retail tenant bankruptcies',
      'Supply additions in hot property types',
    ],
    bullCase: 'The bull case sees rate cuts supporting property valuations across the board. Data centers achieve premium valuations on scarcity. Industrial maintains pricing power. Residential benefits from housing shortage. Healthcare demographic tailwinds accelerate.',
    bearCase: 'The bear case involves rates remaining elevated, pressuring REIT valuations and refinancing. Office distress spreads to other property types. New supply catches up with demand in industrial and data centers. Recession pressures retail tenants.',
    topPicksReasoning: 'Our REIT picks emphasize property types with structural demand growth and supply constraints. We favor data centers for AI exposure, industrial for e-commerce and nearshoring, and residential for housing fundamentals.',
    keywords: ['REIT predictions', 'real estate stocks 2026', 'data center REITs', 'industrial REITs forecast', 'residential REIT outlook', 'PLD stock prediction', 'AMT stock forecast'],
    faqs: [
      { question: 'What are the best REITs to buy in 2026?', answer: 'Top REITs for 2026 include Equinix (EQIX) and Digital Realty (DLR) for data centers, Prologis (PLD) for industrial, AvalonBay (AVB) for residential, and American Tower (AMT) for cell towers. Avoid office-heavy REITs.' },
      { question: 'Will REIT stocks go up in 2026?', answer: 'REITs should deliver 10-15% total returns in 2026 as interest rates decline, supporting property valuations. Data centers may outperform significantly on AI demand. Office remains challenged.' },
      { question: 'Are data center REITs a good investment?', answer: 'Data center REITs have exceptional outlook driven by AI infrastructure demand. Supply constrained by power availability and construction timelines. Premium valuations justified by growth visibility and strategic importance.' },
      { question: 'What is the outlook for office REITs?', answer: 'Office REITs face continued headwinds from hybrid work reducing space demand. Urban class B/C properties most challenged. Select high-quality assets in strong markets may stabilize but sector-wide recovery unlikely.' },
      { question: 'How do interest rates affect REITs?', answer: 'REITs are sensitive to interest rates as they carry significant debt and compete with bonds for income investors. Falling rates in 2026 should support REIT valuations while higher rates would pressure returns.' },
      { question: 'Should I invest in residential REITs?', answer: 'Residential REITs benefit from housing unaffordability keeping renters in place. Sun Belt markets show strongest fundamentals. Focus on REITs with quality portfolios and limited exposure to rent control markets.' },
    ],
    relatedSectors: ['financials', 'utilities', 'technology'],
  },
}

// Helper functions for formatting
function formatMarketCap(marketCap: number): string {
  if (marketCap >= 1e12) return `$${(marketCap / 1e12).toFixed(2)}T`
  if (marketCap >= 1e9) return `$${(marketCap / 1e9).toFixed(2)}B`
  if (marketCap >= 1e6) return `$${(marketCap / 1e6).toFixed(2)}M`
  return `$${marketCap.toLocaleString()}`
}

// Fetch stocks from Supabase based on sector
async function fetchSectorStocks(sectorSlug: string): Promise<CompanyFundamentals[]> {
  const sectorNames = SECTOR_MAPPINGS[sectorSlug]
  if (!sectorNames || !supabase) {
    return []
  }

  // Build OR condition for multiple sector names
  const sectorConditions = sectorNames.map(name => `sector.ilike.%${name}%`).join(',')

  const { data, error } = await supabase
    .from('company_fundamentals')
    .select('*')
    .or(sectorConditions)
    .order('market_cap', { ascending: false, nullsFirst: false })
    .limit(50)

  if (error) {
    console.error('Error fetching sector stocks:', error)
    return []
  }

  return (data || []) as CompanyFundamentals[]
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { sector } = await params
  const sectorData = SECTOR_PREDICTIONS[sector.toLowerCase()]

  if (!sectorData) {
    return { title: 'Predictions | Lician' }
  }

  return {
    title: sectorData.seoTitle,
    description: sectorData.metaDescription,
    keywords: sectorData.keywords,
    openGraph: {
      title: sectorData.seoTitle,
      description: sectorData.metaDescription,
      type: 'article',
    },
    alternates: {
      canonical: `https://lician.com/predictions/${sector.toLowerCase()}`,
    },
  }
}

// Dynamic rendering - Supabase needs env vars at runtime
export const revalidate = 3600
// Increase timeout to prevent 5xx errors during initial generation
export const maxDuration = 60

export default async function SectorPredictionPage({ params }: Props) {
  const { sector } = await params
  const sectorData = SECTOR_PREDICTIONS[sector.toLowerCase()]

  if (!sectorData) {
    notFound()
  }

  // Fetch real stocks from Supabase
  const allStocks = await fetchSectorStocks(sector.toLowerCase())
  const topStocks = allStocks.slice(0, 20)
  const topPicks = allStocks.slice(0, 5)

  const currentYear = new Date().getFullYear()
  const pageUrl = `${SITE_URL}/predictions/${sector.toLowerCase()}`

  // Calculate average predicted return (simulated based on sector)
  const avgReturn = sectorData.expectedReturn.mid

  // Breadcrumb Schema
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Predictions', url: `${SITE_URL}/insights/2026-stock-predictions` },
    { name: `${sectorData.title} Predictions`, url: pageUrl },
  ])

  // Article Schema
  const articleSchema = getArticleSchema({
    headline: sectorData.seoTitle,
    description: sectorData.metaDescription,
    url: pageUrl,
    keywords: sectorData.keywords,
  })

  // ItemList Schema for the stock list
  const itemListSchema = getItemListSchema({
    name: `Top ${sectorData.title} Stocks ${currentYear}`,
    description: `Best ${sectorData.title.toLowerCase()} stocks with AI-powered predictions`,
    url: pageUrl,
    items: topStocks.map((stock, index) => ({
      name: stock.ticker,
      url: `${SITE_URL}/prediction/${stock.ticker.toLowerCase()}`,
      position: index + 1,
    })),
  })

  // FAQ Schema
  const faqSchema = getFAQSchema(sectorData.faqs)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([breadcrumbSchema, articleSchema, itemListSchema, faqSchema])
        }}
      />
      <Header />
      <main className="min-h-screen bg-background text-foreground pt-20">
        <div className="max-w-5xl mx-auto px-6 py-12">
          {/* Breadcrumbs */}
          <nav className="text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-foreground">Home</Link>
            {' / '}
            <Link href="/insights/2026-stock-predictions" className="hover:text-foreground">Predictions</Link>
            {' / '}
            <span>{sectorData.title}</span>
          </nav>

          {/* Header */}
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {sectorData.seoTitle}
          </h1>

          {/* Sector Outlook Badge */}
          <div className="flex items-center gap-4 mb-6">
            <span className={`px-4 py-2 rounded-lg text-sm font-bold ${
              sectorData.outlook === 'Bullish' ? 'bg-green-500/20 text-green-500' :
              sectorData.outlook === 'Bearish' ? 'bg-red-500/20 text-red-500' :
              sectorData.outlook === 'Selective' ? 'bg-purple-500/20 text-purple-500' :
              'bg-yellow-500/20 text-yellow-500'
            }`}>
              {currentYear} Outlook: {sectorData.outlook}
            </span>
            <span className="text-muted-foreground">
              Expected Return: <span className="text-green-500 font-bold">+{sectorData.expectedReturn.low}% to +{sectorData.expectedReturn.high}%</span>
            </span>
          </div>

          {/* Hero Intro - Unique per sector */}
          <div className="prose prose-lg prose-invert max-w-none mb-12">
            {sectorData.heroIntro.split('\n\n').map((paragraph, i) => (
              <p key={i} className="text-muted-foreground leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>

          {/* Sector Average Metrics Card */}
          <section className="mb-12">
            <div className="bg-gradient-to-br from-green-600/20 to-green-600/5 p-8 rounded-xl border border-green-500/20">
              <h2 className="text-2xl font-bold mb-6">{sectorData.title} Price Targets {currentYear}</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">Bear Case</p>
                  <p className="text-3xl font-bold text-red-500">+{sectorData.expectedReturn.low}%</p>
                  <p className="text-xs text-muted-foreground mt-1">Conservative scenario</p>
                </div>
                <div className="text-center bg-green-500/10 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">Base Case</p>
                  <p className="text-4xl font-bold text-green-500">+{sectorData.expectedReturn.mid}%</p>
                  <p className="text-xs text-muted-foreground mt-1">Most likely outcome</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">Bull Case</p>
                  <p className="text-3xl font-bold text-purple-500">+{sectorData.expectedReturn.high}%</p>
                  <p className="text-xs text-muted-foreground mt-1">Optimistic scenario</p>
                </div>
              </div>
            </div>
          </section>

          {/* Key Catalysts */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Key Catalysts for {currentYear}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sectorData.catalysts.map((catalyst, i) => (
                <div key={i} className="bg-card p-5 rounded-lg border border-border">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-green-500 font-bold text-sm">{i + 1}</span>
                    </div>
                    <div>
                      <h3 className="font-bold mb-1">{catalyst.title}</h3>
                      <p className="text-sm text-muted-foreground">{catalyst.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Bull vs Bear Case */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Bull Case vs Bear Case</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-green-500/10 p-6 rounded-xl border border-green-500/30">
                <h3 className="text-xl font-bold text-green-500 mb-4">Bull Case (+{sectorData.expectedReturn.high}%)</h3>
                <p className="text-muted-foreground">{sectorData.bullCase}</p>
              </div>
              <div className="bg-red-500/10 p-6 rounded-xl border border-red-500/30">
                <h3 className="text-xl font-bold text-red-500 mb-4">Bear Case (+{sectorData.expectedReturn.low}%)</h3>
                <p className="text-muted-foreground">{sectorData.bearCase}</p>
              </div>
            </div>
          </section>

          {/* Risk Factors */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Risk Factors to Monitor</h2>
            <div className="bg-card p-6 rounded-xl border border-border">
              <ul className="space-y-3">
                {sectorData.risks.map((risk, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="text-red-500 mt-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </span>
                    <span className="text-muted-foreground">{risk}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Top Picks Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Our Top {sectorData.title} Picks</h2>
            <p className="text-muted-foreground mb-6">{sectorData.topPicksReasoning}</p>

            {topPicks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {topPicks.map((stock, i) => (
                  <Link
                    key={stock.ticker}
                    href={`/prediction/${stock.ticker.toLowerCase()}`}
                    className="bg-gradient-to-br from-green-600/10 to-transparent p-5 rounded-xl border border-green-500/30 hover:border-green-500/50 transition-colors group"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                          {i + 1}
                        </span>
                        <span className="text-xl font-bold group-hover:text-green-500 transition-colors">{stock.ticker}</span>
                      </div>
                      <span className="text-xs text-green-500">Top Pick</span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1 mb-3">{stock.company_name}</p>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Market Cap</span>
                      <span className="font-medium">{stock.market_cap ? formatMarketCap(stock.market_cap) : '-'}</span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="bg-card p-8 rounded-xl border border-border text-center">
                <p className="text-muted-foreground">Loading top picks...</p>
              </div>
            )}
          </section>

          {/* Top 20 Stocks Grid */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">
              Top 20 {sectorData.title} Stocks with Predictions
            </h2>
            {topStocks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {topStocks.map((stock, i) => (
                  <div
                    key={stock.ticker}
                    className="bg-card p-5 rounded-lg border border-border hover:border-green-500/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-muted-foreground">#{i + 1}</span>
                          <span className="text-xl font-bold">{stock.ticker}</span>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {stock.company_name || stock.ticker}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                      <div>
                        <p className="text-muted-foreground text-xs mb-1">Market Cap</p>
                        <p className="font-semibold">
                          {stock.market_cap ? formatMarketCap(stock.market_cap) : '-'}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs mb-1">P/E Ratio</p>
                        <p className={`font-semibold ${
                          stock.pe_ratio && stock.pe_ratio < 15
                            ? 'text-green-500'
                            : stock.pe_ratio && stock.pe_ratio > 30
                            ? 'text-red-500'
                            : ''
                        }`}>
                          {stock.pe_ratio ? stock.pe_ratio.toFixed(2) : '-'}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        href={`/prediction/${stock.ticker.toLowerCase()}`}
                        className="flex-1 text-center text-sm py-2 px-3 bg-green-600/20 text-green-500 rounded-lg hover:bg-green-600/30 transition-colors"
                      >
                        View Prediction
                      </Link>
                      <Link
                        href={`/dashboard?ticker=${stock.ticker}`}
                        className="text-sm py-2 px-3 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors"
                      >
                        Analysis
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-card p-8 rounded-lg border border-border text-center">
                <p className="text-muted-foreground">No stocks found in this sector.</p>
              </div>
            )}
          </section>

          {/* Internal Links to Stock Predictions */}
          {topStocks.length > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-6">Quick Links to Stock Predictions</h2>
              <div className="flex flex-wrap gap-2">
                {topStocks.map((stock) => (
                  <Link
                    key={stock.ticker}
                    href={`/prediction/${stock.ticker.toLowerCase()}`}
                    className="px-4 py-2 bg-secondary rounded-lg hover:bg-green-600/20 hover:text-green-500 transition-colors text-sm"
                  >
                    {stock.ticker} Prediction
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* FAQ Section */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {sectorData.faqs.map((faq, i) => (
                <details key={i} className="bg-card p-6 rounded-xl border border-border group">
                  <summary className="font-bold cursor-pointer list-none flex items-center justify-between">
                    <span>{faq.question}</span>
                    <span className="text-green-500 group-open:rotate-180 transition-transform">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </span>
                  </summary>
                  <p className="text-muted-foreground mt-4 leading-relaxed">
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          </section>

          {/* Related Sectors */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Related Sector Predictions</h2>
            <div className="flex flex-wrap gap-3">
              {sectorData.relatedSectors.map((relatedSector) => {
                const related = SECTOR_PREDICTIONS[relatedSector]
                if (!related) return null
                return (
                  <Link
                    key={relatedSector}
                    href={`/predictions/${relatedSector}`}
                    className="px-5 py-3 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors"
                  >
                    {related.title} Predictions
                  </Link>
                )
              })}
              <Link
                href="/insights/2026-stock-predictions"
                className="px-5 py-3 bg-green-600/20 text-green-500 rounded-lg hover:bg-green-600/30 transition-colors"
              >
                All Market Predictions
              </Link>
            </div>
          </section>

          {/* More Resources */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">More {sectorData.title} Resources</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                href={`/sectors/${sector.toLowerCase()}`}
                className="bg-card p-5 rounded-lg border border-border hover:border-green-500/50 transition-colors"
              >
                <h3 className="font-bold mb-2">{sectorData.title} Overview</h3>
                <p className="text-sm text-muted-foreground">Comprehensive sector analysis and top stocks</p>
              </Link>
              <Link
                href="/screener"
                className="bg-card p-5 rounded-lg border border-border hover:border-green-500/50 transition-colors"
              >
                <h3 className="font-bold mb-2">Stock Screener</h3>
                <p className="text-sm text-muted-foreground">Filter {sectorData.title.toLowerCase()} stocks by metrics</p>
              </Link>
              <Link
                href="/insights/2026-stock-predictions"
                className="bg-card p-5 rounded-lg border border-border hover:border-green-500/50 transition-colors"
              >
                <h3 className="font-bold mb-2">{currentYear} Market Outlook</h3>
                <p className="text-sm text-muted-foreground">Full market predictions and analysis</p>
              </Link>
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gradient-to-br from-green-600/20 to-green-600/5 p-8 rounded-xl border border-green-500/20 text-center">
            <h2 className="text-2xl font-bold mb-4">Get AI-Powered Stock Analysis</h2>
            <p className="text-muted-foreground mb-6">
              Research any {sectorData.title.toLowerCase()} stock with our AI-powered platform. DCF valuations, quant models, and real-time insights.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/dashboard"
                className="inline-block bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-medium"
              >
                Start Research
              </Link>
              <Link
                href="/premium"
                className="inline-block bg-secondary hover:bg-secondary/80 px-8 py-3 rounded-lg font-medium"
              >
                View Premium Features
              </Link>
            </div>
          </section>

          {/* Disclaimer */}
          <div className="mt-8 text-xs text-muted-foreground bg-secondary/30 p-4 rounded-lg">
            <p><strong>Disclaimer:</strong> Stock predictions are based on publicly available data and AI models. This is not financial advice. Past performance does not guarantee future results. Always conduct your own research and consider consulting a financial advisor before making investment decisions. Predicted returns are estimates and actual results may vary significantly.</p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
