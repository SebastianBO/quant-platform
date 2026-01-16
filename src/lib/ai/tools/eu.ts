/**
 * European company tools
 * Search, details, financial statements, comparison
 */

import { tool } from 'ai'
import { z } from 'zod'
import { getSupabase } from './utils'

/**
 * Tool: Search European Companies
 */
export const searchEUCompaniesTool = tool({
  description: 'Search for European companies by name or country. Supports Sweden (SE), Norway (NO), UK (GB), and more.',
  inputSchema: z.object({
    query: z.string().optional().describe('Company name to search for'),
    country: z.enum(['SE', 'NO', 'GB', 'DE', 'FR', 'DK', 'FI', 'NL']).optional()
      .describe('ISO country code'),
    limit: z.number().optional().default(10).describe('Max results to return'),
  }),
  execute: async ({ query, country, limit = 10 }) => {
    try {
      let queryBuilder = getSupabase()
        .from('eu_companies')
        .select('org_number, name, country_code, legal_form, industry_description, employees, revenue_latest, exchange, ticker')
        .order('revenue_latest', { ascending: false, nullsFirst: false })
        .limit(limit)

      if (country) {
        queryBuilder = queryBuilder.eq('country_code', country)
      }

      if (query) {
        queryBuilder = queryBuilder.ilike('name', `%${query}%`)
      }

      const { data, error } = await queryBuilder

      if (error) {
        return { success: false, error: 'Search failed' }
      }

      return {
        success: true,
        source: 'supabase-eu',
        results: data || [],
        count: data?.length || 0,
      }
    } catch (error) {
      return { success: false, error: 'EU company search failed' }
    }
  },
})

/**
 * Tool: Get European Company Details
 */
export const getEUCompanyDetailsTool = tool({
  description: 'Get detailed information about a European company including financials, employees, and industry',
  inputSchema: z.object({
    name: z.string().optional().describe('Company name'),
    orgNumber: z.string().optional().describe('Organization number'),
    country: z.enum(['SE', 'NO', 'GB', 'DE', 'FR', 'DK', 'FI', 'NL']).optional().describe('Country code'),
  }),
  execute: async ({ name, orgNumber, country }) => {
    try {
      let queryBuilder = getSupabase()
        .from('eu_companies')
        .select('*')

      if (orgNumber && country) {
        queryBuilder = queryBuilder
          .eq('org_number', orgNumber)
          .eq('country_code', country)
      } else if (name) {
        queryBuilder = queryBuilder.ilike('name', `%${name}%`)
      } else {
        return { success: false, error: 'Provide either name or orgNumber+country' }
      }

      const { data, error } = await queryBuilder.limit(1).single()

      if (error || !data) {
        return { success: false, error: 'Company not found' }
      }

      return {
        success: true,
        source: 'supabase-eu',
        company: data,
      }
    } catch (error) {
      return { success: false, error: 'Failed to fetch company details' }
    }
  },
})

/**
 * Tool: Get European Company Financial Statements
 */
export const getEUFinancialStatementsTool = tool({
  description: 'Get financial statements (income, balance sheet) for a European company',
  inputSchema: z.object({
    name: z.string().optional().describe('Company name'),
    orgNumber: z.string().optional().describe('Organization number'),
    country: z.enum(['SE', 'NO', 'GB', 'DE', 'FR', 'DK', 'FI', 'NL']).optional().describe('Country code'),
    statementType: z.enum(['income', 'balance', 'both']).default('both').describe('Type of statement'),
    years: z.number().optional().default(3).describe('Number of years of data'),
  }),
  execute: async ({ name, orgNumber, country, statementType, years = 3 }) => {
    try {
      // First find the company
      let queryBuilder = getSupabase()
        .from('eu_companies')
        .select('org_number, country_code, name')

      if (orgNumber && country) {
        queryBuilder = queryBuilder
          .eq('org_number', orgNumber)
          .eq('country_code', country)
      } else if (name) {
        queryBuilder = queryBuilder.ilike('name', `%${name}%`)
      } else {
        return { success: false, error: 'Provide either name or orgNumber+country' }
      }

      const { data: companyData, error: companyError } = await queryBuilder.limit(1).single()

      if (companyError || !companyData) {
        return { success: false, error: 'Company not found' }
      }

      const companyInfo = companyData as { org_number: string; country_code: string; name: string }

      const result: {
        success: boolean
        company: { name: string; orgNumber: string; country: string }
        income?: unknown[]
        balance?: unknown[]
      } = {
        success: true,
        company: {
          name: companyInfo.name,
          orgNumber: companyInfo.org_number,
          country: companyInfo.country_code,
        }
      }

      // Get income statements
      if (statementType === 'income' || statementType === 'both') {
        const { data: income } = await getSupabase()
          .from('eu_income_statements')
          .select('*')
          .eq('org_number', companyInfo.org_number)
          .eq('country_code', companyInfo.country_code)
          .order('fiscal_year', { ascending: false })
          .limit(years)

        result.income = income || []
      }

      // Get balance sheets
      if (statementType === 'balance' || statementType === 'both') {
        const { data: balance } = await getSupabase()
          .from('eu_balance_sheets')
          .select('*')
          .eq('org_number', companyInfo.org_number)
          .eq('country_code', companyInfo.country_code)
          .order('fiscal_year', { ascending: false })
          .limit(years)

        result.balance = balance || []
      }

      return result
    } catch (error) {
      return { success: false, error: 'Failed to fetch EU financial statements' }
    }
  },
})

/**
 * Tool: Compare European Companies
 */
export const compareEUCompaniesTool = tool({
  description: 'Compare financial metrics of multiple European companies',
  inputSchema: z.object({
    companies: z.array(z.string()).min(2).max(5).describe('List of company names to compare'),
  }),
  execute: async ({ companies }) => {
    try {
      interface CompanyRecord {
        org_number: string
        country_code: string
        name: string
        employees?: number
        revenue_latest?: number
        profit_latest?: number
        industry_description?: string
      }

      interface IncomeRecord {
        revenue?: number
        operating_profit?: number
        profit_for_the_year?: number
        fiscal_year?: number
      }

      const comparisons: Array<{
        name: string
        country: string
        employees?: number
        revenue?: number
        operatingProfit?: number
        netIncome?: number
        fiscalYear?: number
        industry?: string
      }> = []

      for (const companyName of companies) {
        const { data: companyData, error } = await getSupabase()
          .from('eu_companies')
          .select('org_number, country_code, name, employees, revenue_latest, profit_latest, industry_description')
          .ilike('name', `%${companyName}%`)
          .limit(1)
          .single()

        if (!error && companyData) {
          const company = companyData as CompanyRecord

          const { data: incomeData } = await getSupabase()
            .from('eu_income_statements')
            .select('revenue, operating_profit, profit_for_the_year, fiscal_year')
            .eq('org_number', company.org_number)
            .eq('country_code', company.country_code)
            .order('fiscal_year', { ascending: false })
            .limit(1)
            .single()

          const income = incomeData as IncomeRecord | null

          comparisons.push({
            name: company.name,
            country: company.country_code,
            employees: company.employees,
            revenue: income?.revenue || company.revenue_latest,
            operatingProfit: income?.operating_profit,
            netIncome: income?.profit_for_the_year || company.profit_latest,
            fiscalYear: income?.fiscal_year,
            industry: company.industry_description,
          })
        }
      }

      if (comparisons.length === 0) {
        return { success: false, error: 'No companies found' }
      }

      return {
        success: true,
        source: 'supabase-eu',
        comparisons,
        count: comparisons.length,
      }
    } catch (error) {
      return { success: false, error: 'Comparison failed' }
    }
  },
})
