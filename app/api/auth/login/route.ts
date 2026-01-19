import { NextRequest, NextResponse } from 'next/server'
import { login } from '@/lib/auth'
import type { LoginRequest, LoginResponse } from '@/lib/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  })
}

export async function GET() {
  // Verificar configuración de Supabase
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const hasAnonKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const hasServiceKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY
  
  const isConfigured = 
    supabaseUrl && 
    hasAnonKey && 
    hasServiceKey &&
    !supabaseUrl?.includes('placeholder') &&
    !process.env.SUPABASE_SERVICE_ROLE_KEY?.includes('placeholder')
  
  // Probar conexión si está configurado
  let connectionTest = null
  if (isConfigured) {
    try {
      const { supabaseAdmin } = await import('@/lib/supabase')
      const { data, error } = await supabaseAdmin
        .from('users')
        .select('id, username, role')
        .limit(1)
      
      connectionTest = {
        status: error ? 'error' : 'success',
        message: error ? `Error: ${error.message}` : '✅ Conectado correctamente',
        usersFound: data?.length || 0
      }
    } catch (err: any) {
      connectionTest = {
        status: 'exception',
        message: `Excepción: ${err.message}`
      }
    }
  }
  
  return NextResponse.json({
    success: true,
    message: 'Login API está funcionando',
    methods: ['POST', 'OPTIONS', 'GET'],
    timestamp: new Date().toISOString(),
    supabaseConfig: {
      configured: isConfigured,
      url: supabaseUrl || 'NO CONFIGURADA',
      hasAnonKey,
      hasServiceKey,
      connectionTest
    }
  })
}

export async function POST(request: NextRequest): Promise<NextResponse<LoginResponse>> {
  try {
    let body: LoginRequest
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { success: false, error: 'Cuerpo de la petición inválido' },
        { status: 400 }
      )
    }

    const { username, password } = body

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Usuario y contraseña son requeridos' },
        { status: 400 }
      )
    }

    const result = await login(username, password)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Credenciales inválidas' },
        { status: 401 }
      )
    }

    if (!result.token || !result.user) {
      return NextResponse.json(
        { success: false, error: 'Error al generar token de autenticación' },
        { status: 500 }
      )
    }

    const response = NextResponse.json<LoginResponse>({
      success: true,
      token: result.token,
      user: result.user,
    })

    response.cookies.set('auth-token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    })

    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type')

    return response
  } catch (error) {
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Error interno del servidor'
    
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    )
  }
}

