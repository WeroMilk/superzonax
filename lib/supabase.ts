import { createClient } from '@supabase/supabase-js'

// Verificar que las credenciales estén configuradas
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  if (process.env.NODE_ENV === 'production') {
    console.error('⚠️  Supabase no está configurado. Por favor configura las variables de entorno:')
    console.error('   - NEXT_PUBLIC_SUPABASE_URL')
    console.error('   - SUPABASE_SERVICE_ROLE_KEY')
  }
}

// Cliente para uso en servidor (con service role key para acceso completo)
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)

// Cliente para uso en cliente (opcional, si necesitas acceso desde el frontend)
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

export default supabaseAdmin
