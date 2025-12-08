import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for the Lician database tables
export interface Profile {
  id: string
  username: string | null
  full_name: string | null
  avatar_url: string | null
  email: string | null
  created_at: string
  updated_at: string
}

export interface Portfolio {
  id: string
  user_id: string
  name: string
  description: string | null
  is_public: boolean
  created_at: string
  updated_at: string
}

export interface Investment {
  id: string
  portfolio_id: string
  ticker: string
  shares: number
  avg_cost: number | null
  current_price: number | null
  market_value: number | null
  created_at: string
  updated_at: string
}

export interface CompanyFundamentals {
  ticker: string
  company_name: string | null
  sector: string | null
  industry: string | null
  market_cap: number | null
  pe_ratio: number | null
  revenue: number | null
  net_income: number | null
  updated_at: string
}

export interface CompanyPrice {
  id: string
  ticker: string
  date: string
  open: number
  high: number
  low: number
  close: number
  volume: number
  adjusted_close: number | null
}

// Helper functions
export async function getPortfolios(userId: string) {
  const { data, error } = await supabase
    .from('portfolios')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as Portfolio[]
}

export async function getPortfolioHoldings(portfolioId: string) {
  const { data, error } = await supabase
    .from('investments')
    .select('*')
    .eq('portfolio_id', portfolioId)

  if (error) throw error
  return data as Investment[]
}

export async function getCompanyFundamentals(ticker: string) {
  const { data, error } = await supabase
    .from('company_fundamentals')
    .select('*')
    .eq('ticker', ticker.toUpperCase())
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data as CompanyFundamentals | null
}

export async function getCompanyPrices(ticker: string, limit = 365) {
  const { data, error } = await supabase
    .from('company_prices')
    .select('*')
    .eq('ticker', ticker.toUpperCase())
    .order('date', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data as CompanyPrice[]
}

export async function searchCompanies(query: string, limit = 10) {
  const { data, error } = await supabase
    .from('company_fundamentals')
    .select('ticker, company_name, sector, market_cap')
    .or(`ticker.ilike.%${query}%,company_name.ilike.%${query}%`)
    .order('market_cap', { ascending: false, nullsFirst: false })
    .limit(limit)

  if (error) throw error
  return data
}

export async function getProfiles() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')

  if (error) throw error
  return data as Profile[]
}
