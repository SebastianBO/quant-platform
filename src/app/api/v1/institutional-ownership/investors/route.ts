import { NextRequest, NextResponse } from 'next/server'
import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Financial Datasets API Compatible Endpoint
// Matches: https://api.financialdatasets.ai/institutional-ownership/investors/

let supabase: SupabaseClient | null = null

function getSupabase() {
  if (!supabase) {
    supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
  }
  return supabase
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const search = searchParams.get('search')
  const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 1000)
  const type = searchParams.get('type') // Filter by investor type

  try {
    let query = getSupabase()
      .from('institutional_investors')
      .select('normalized_name, investor_type, latest_aum')
      .order('latest_aum', { ascending: false, nullsFirst: false })
      .limit(limit)

    if (search) {
      query = query.ilike('normalized_name', `%${search.toUpperCase().replace(/ /g, '_')}%`)
    }

    if (type) {
      query = query.eq('investor_type', type)
    }

    const { data, error } = await query

    if (error) {
      // Fallback to hardcoded list
      return NextResponse.json({
        investors: getDefaultInvestors(search, limit)
      })
    }

    // Return just the investor names (Financial Datasets format)
    return NextResponse.json({
      investors: data?.map(d => d.normalized_name) || []
    })
  } catch (error) {
    console.error('Investors list API error:', error)
    return NextResponse.json({
      investors: getDefaultInvestors(search, limit)
    })
  }
}

// Default investors list (fallback)
function getDefaultInvestors(search: string | null, limit: number): string[] {
  const allInvestors = [
    'VANGUARD_GROUP_INC',
    'BLACKROCK_INC',
    'STATE_STREET_CORP',
    'FMR_LLC',
    'BERKSHIRE_HATHAWAY_INC',
    'JPMORGAN_CHASE',
    'MORGAN_STANLEY',
    'GOLDMAN_SACHS',
    'BANK_OF_AMERICA_CORP',
    'WELLS_FARGO',
    'CITADEL_ADVISORS_LLC',
    'BRIDGEWATER_ASSOCIATES_LP',
    'RENAISSANCE_TECHNOLOGIES_LLC',
    'TWO_SIGMA_INVESTMENTS_LP',
    'DE_SHAW_LP',
    'MILLENNIUM_MANAGEMENT_LLC',
    'TIGER_GLOBAL_MANAGEMENT_LLC',
    'PERSHING_SQUARE_CAPITAL_MANAGEMENT_LP',
    'THIRD_POINT_LLC',
    'ELLIOTT_INVESTMENT_MANAGEMENT_LP',
    'APPALOOSA_LP',
    'SOROS_FUND_MANAGEMENT_LLC',
    'PAULSON_CO_INC',
    'ICAHN_CARL_C',
    'AQR_CAPITAL_MANAGEMENT_LLC',
    'POINT72_ASSET_MANAGEMENT_LP',
    'VIKING_GLOBAL_INVESTORS_LP',
    'LONE_PINE_CAPITAL_LLC',
    'COATUE_MANAGEMENT_LLC',
    'DRAGONEER_INVESTMENT_GROUP_LLC',
    'NORGES_BANK',
    'CAPITAL_WORLD_INVESTORS',
    'CAPITAL_RESEARCH_GLOBAL_INVESTORS',
    'T_ROWE_PRICE_ASSOCIATES_INC',
    'GEODE_CAPITAL_MANAGEMENT_LLC',
    'NORTHERN_TRUST_CORP',
    'CHARLES_SCHWAB_INVESTMENT_MANAGEMENT_INC',
    'INVESCO_LTD',
    'FRANKLIN_RESOURCES_INC',
    'PIMCO',
  ]

  if (search) {
    const searchUpper = search.toUpperCase().replace(/ /g, '_')
    return allInvestors
      .filter(i => i.includes(searchUpper))
      .slice(0, limit)
  }

  return allInvestors.slice(0, limit)
}
