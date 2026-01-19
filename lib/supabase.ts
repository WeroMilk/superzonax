import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Obtener las credenciales de las variables de entorno
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDUxOTIwMDAsImV4cCI6MTk2MDc2ODAwMH0.placeholder'
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY0NTE5MjAwMCwiZXhwIjoyOTYwNzY4MDAwfQ.placeholder'

// Verificar que las credenciales estén configuradas
const isConfigured = 
  process.env.NEXT_PUBLIC_SUPABASE_URL && 
  process.env.SUPABASE_SERVICE_ROLE_KEY &&
  !supabaseUrl.includes('placeholder') &&
  !supabaseServiceRoleKey.includes('placeholder')

// Cliente para uso en servidor (con service role key para acceso completo)
export const supabaseAdmin: SupabaseClient = createClient(
  supabaseUrl,
  supabaseServiceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)

// Cliente para uso en cliente (opcional, si necesitas acceso desde el frontend)
export const supabase: SupabaseClient = createClient(
  supabaseUrl,
  supabaseAnonKey
)

export default supabaseAdmin
