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

    // Crear usuarios por defecto (sin especificar ID para que Supabase lo maneje)
    const defaultUsers = [
      {
        username: 'supzonax',
        password: bcrypt.hashSync('admin', 10),
        role: 'admin' as const,
        school_name: 'Supervisión de Zona No. 10',
      },
      {
        username: 'sec06',
        password: bcrypt.hashSync('sec06', 10),
        role: 'sec6' as const,
        school_name: 'Secundaria Técnica No. 6',
      },
      {
        username: 'sec60',
        password: bcrypt.hashSync('sec60', 10),
        role: 'sec60' as const,
        school_name: 'Secundaria Técnica No. 60',
      },
      {
        username: 'sec72',
        password: bcrypt.hashSync('sec72', 10),
        role: 'sec72' as const,
        school_name: 'Secundaria Técnica No. 72',
      },
    ]

    // Insertar usuarios usando Supabase
    const { supabaseAdmin } = await import('@/lib/supabase')
    
    // Insertar uno por uno para manejar errores mejor
    const insertedUsers = []
    const errors = []
    
    for (const user of defaultUsers) {
      const { data, error } = await supabaseAdmin
        .from('users')
        .insert(user)
        .select()
        .single()
      
      if (error) {
        // Si el error es de duplicado (usuario ya existe), continuar
        if (error.code === '23505') {
          console.log(`Usuario ${user.username} ya existe, omitiendo...`)
          continue
        }
        console.error(`Error al crear usuario ${user.username}:`, error)
        errors.push({ username: user.username, error: error.message })
      }
      
      if (data) {
        insertedUsers.push(data)
      }
    }
    
    if (insertedUsers.length === 0 && errors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'No se pudieron crear usuarios',
          details: errors,
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Usuarios creados correctamente (${insertedUsers.length} de ${defaultUsers.length})`,
      usersCreated: insertedUsers.length,
      users: insertedUsers.map(u => ({
        id: u.id,
        username: u.username,
        role: u.role,
        school_name: u.school_name,
      })),
      errors: errors.length > 0 ? errors : undefined,
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
