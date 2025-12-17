'use client'

import { createBrowserClient } from '@supabase/ssr'

/**
 * Create a Supabase client for use in client components
 * This uses the browser client from @supabase/ssr
 */
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase environment variables are not configured')
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
