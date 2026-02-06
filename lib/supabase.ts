
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ucojjyitjovttbhdpuys.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjb2pqeWl0am92dHRiaGRwdXlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwOTIyMDcsImV4cCI6MjA4NTY2ODIwN30.utT4rgjU9js68eumoXcjdkNxH_7zo-_qckcYDjK3vfk'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
