import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const hasAnonKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const hasServiceKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY
  
  // Verificar si las variables están configuradas
  const isConfigured = 
    supabaseUrl && 
    hasAnonKey && 
    hasServiceKey &&
    !supabaseUrl.includes('placeholder')
  
  // Probar conexión a Supabase
  let connectionTest = {
    status: 'unknown',
    message: '',
    error: null as any,
    data: null as any
  }
  
  if (!isConfigured) {
    connectionTest = {
      status: 'not_configured',
      message: 'Variables de entorno no configuradas',
      error: null,
      data: null
    }
  } else {
    try {
      const { data, error } = await supabaseAdmin
        .from('users')
        .select('id, username, role')
        .limit(5)
      
      if (error) {
        connectionTest = {
          status: 'error',
          message: `Error al consultar usuarios: ${error.message}`,
          error: {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint
          },
          data: null
        }
      } else {
        connectionTest = {
          status: 'success',
          message: `✅ Conectado correctamente. Encontrados ${data?.length || 0} usuarios`,
          error: null,
          data: data
        }
      }
    } catch (err: any) {
      connectionTest = {
        status: 'exception',
        message: `Excepción: ${err.message}`,
        error: {
          name: err.name,
          message: err.message,
          stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        },
        data: null
      }
    }
  }
  
  return NextResponse.json({
    configured: isConfigured,
    variables: {
      supabaseUrl: supabaseUrl || 'NO CONFIGURADA',
      hasAnonKey,
      hasServiceKey,
      // Mostrar solo los primeros caracteres para seguridad
      anonKeyPreview: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY 
        ? `${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 20)}...` 
        : 'NO CONFIGURADA',
      serviceKeyPreview: process.env.SUPABASE_SERVICE_ROLE_KEY 
        ? `${process.env.SUPABASE_SERVICE_ROLE_KEY.substring(0, 20)}...` 
        : 'NO CONFIGURADA'
    },
    connection: connectionTest,
    timestamp: new Date().toISOString()
  })
}
