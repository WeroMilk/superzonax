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
  return NextResponse.json({
    success: true,
    message: 'Login API está funcionando',
    methods: ['POST', 'OPTIONS', 'GET'],
    timestamp: new Date().toISOString(),
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

