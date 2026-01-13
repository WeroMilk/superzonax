import { NextRequest, NextResponse } from 'next/server'
import { login } from '@/lib/auth'
import type { LoginRequest, LoginResponse } from '@/lib/types'

// Manejar método OPTIONS para CORS (necesario en Vercel)
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}

export async function POST(request: NextRequest): Promise<NextResponse<LoginResponse>> {
  try {
    // Verificar que el método sea POST
    if (request.method !== 'POST') {
      return NextResponse.json(
        { success: false, error: 'Método no permitido' },
        { status: 405 }
      )
    }

    let body: LoginRequest
    try {
      body = await request.json()
    } catch (error) {
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

    // Establecer cookie
    response.cookies.set('auth-token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 días
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Error en login API:', error)
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Error interno del servidor'
    
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    )
  }
}

