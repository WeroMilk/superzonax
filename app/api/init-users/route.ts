import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/supabase-db'
import bcrypt from 'bcryptjs'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Endpoint para inicializar usuarios manualmente
 * Útil cuando los usuarios no se crearon automáticamente
 */
export async function POST(request: NextRequest) {
  try {
    // Verificar si ya existen usuarios
    const existingUser = await db.findUser('supzonax')
    
    if (existingUser) {
      return NextResponse.json({
        success: true,
        message: 'Los usuarios ya existen',
        users: [
          { username: 'supzonax', role: 'admin' },
          { username: 'sec06', role: 'sec6' },
          { username: 'sec60', role: 'sec60' },
          { username: 'sec72', role: 'sec72' },
        ],
      })
    }

    // Crear usuarios por defecto
    const defaultUsers = [
      {
        id: 1,
        username: 'supzonax',
        password: bcrypt.hashSync('admin', 10),
        role: 'admin' as const,
        school_name: 'Supervisión de Zona No. 10',
        created_at: new Date().toISOString(),
      },
      {
        id: 2,
        username: 'sec06',
        password: bcrypt.hashSync('sec06', 10),
        role: 'sec6' as const,
        school_name: 'Secundaria Técnica No. 6',
        created_at: new Date().toISOString(),
      },
      {
        id: 3,
        username: 'sec60',
        password: bcrypt.hashSync('sec60', 10),
        role: 'sec60' as const,
        school_name: 'Secundaria Técnica No. 60',
        created_at: new Date().toISOString(),
      },
      {
        id: 4,
        username: 'sec72',
        password: bcrypt.hashSync('sec72', 10),
        role: 'sec72' as const,
        school_name: 'Secundaria Técnica No. 72',
        created_at: new Date().toISOString(),
      },
    ]

    // Insertar usuarios usando Supabase
    const { supabaseAdmin } = await import('@/lib/supabase')
    
    const { data, error } = await supabaseAdmin
      .from('users')
      .insert(defaultUsers)
      .select()

    if (error) {
      console.error('Error al crear usuarios:', error)
      return NextResponse.json(
        {
          success: false,
          error: `Error al crear usuarios: ${error.message}`,
          details: error,
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Usuarios creados correctamente',
      usersCreated: data?.length || 0,
      users: defaultUsers.map(u => ({
        username: u.username,
        role: u.role,
        school_name: u.school_name,
      })),
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    console.error('Error en init-users:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    )
  }
}

/**
 * GET para verificar el estado de los usuarios
 */
export async function GET() {
  try {
    const users = [
      await db.findUser('supzonax'),
      await db.findUser('sec06'),
      await db.findUser('sec60'),
      await db.findUser('sec72'),
    ]

    const existingUsers = users.filter(u => u !== undefined)
    const missingUsers = users.filter(u => u === undefined)

    return NextResponse.json({
      success: true,
      totalUsers: 4,
      existingUsers: existingUsers.length,
      missingUsers: missingUsers.length,
      users: existingUsers.map(u => ({
        id: u?.id,
        username: u?.username,
        role: u?.role,
      })),
      message: missingUsers.length > 0 
        ? `Faltan ${missingUsers.length} usuarios. Ejecuta POST /api/init-users para crearlos.`
        : 'Todos los usuarios existen',
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    )
  }
}
