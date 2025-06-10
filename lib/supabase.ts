import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Article type definition
export interface Article {
  id: string
  title: string
  content: string
  author: string
  category: string | null
  tags: string[]
  created_at: string
  slug: string
} 