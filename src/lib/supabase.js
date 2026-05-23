import { createClient } from '@supabase/supabase-js'

// Membersihkan URL jika ada akhiran /rest/v1/ agar Supabase client tidak error
const rawUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseUrl = rawUrl ? rawUrl.replace(/\/rest\/v1\/?$/, '') : ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase credentials missing. Create a .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey || '')
