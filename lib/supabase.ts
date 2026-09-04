import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Obtener las credenciales de las variables de entorno
// Soporta nombres de Vercel+Supabase integration: SUPABASE_URL, NEXT_PUBLIC_SUPABASE_URL, etc.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || 'https://fjndvijtcpmzbczodyqs.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_iv-aDqCRl6BlDAGUNMHJoA_D3y0--4N'
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || 'sb_publishable_iv-aDqCRl6BlDAGUNMHJoA_D3y0--4N'

// Verificar que las credenciales estén configuradas
const isConfigured = 
  (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL) && 
  (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY) &&
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
