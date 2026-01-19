import { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import db from './supabase-db'

const JWT_SECRET = process.env.JWT_SECRET || 'supzonax-secret-key-change-in-production'

export interface User {
  id: number;
  username: string;
  role: 'admin' | 'sec6' | 'sec60' | 'sec72';
  school_name: string;
}

export function verifyPassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash)
}

export function generateToken(user: User): string {
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  )
}

export function verifyToken(token: string): User | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as User
    return decoded
  } catch {
    return null
  }
}

export async function login(username: string, password: string): Promise<{ success: boolean; token?: string; user?: User; error?: string }> {
  try {
    const user = await db.findUser(username)
    
    if (!user) {
      return { success: false, error: 'Usuario no encontrado' }
    }

    if (!verifyPassword(password, user.password)) {
      return { success: false, error: 'Contraseña incorrecta' }
    }

    const userData: User = {
      id: user.id,
      username: user.username,
      role: user.role,
      school_name: user.school_name,
    }

    const token = generateToken(userData)
    return { success: true, token, user: userData }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Error al procesar el login'
    return { success: false, error: errorMessage }
  }
}

export function getUserFromRequest(request: NextRequest): User | null {
  const token = request.cookies.get('auth-token')?.value
  if (!token) return null
  return verifyToken(token)
}
