import { NextRequest, NextResponse } from 'next/server'
import { unlink } from 'fs/promises'
import { join } from 'path'
import { getUserFromRequest } from '@/lib/auth'
import db from '@/lib/db-json'

const UPLOAD_DIR = join(process.cwd(), 'data', 'uploads', 'evidencias')

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ success: false, error: 'No autenticado' }, { status: 401 })
    }

    const evidencias = db.getAllEvidencias()
    const evidencia = evidencias.find(e => e.id === parseInt(params.id))
    
    if (!evidencia) {
      return NextResponse.json({ success: false, error: 'Evidencia no encontrada' }, { status: 404 })
    }

    // Solo el admin o la escuela que subió la evidencia puede eliminarla
    if (user.role !== 'admin' && user.role !== evidencia.school_id) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 403 })
    }

    try {
      for (const filePath of evidencia.file_paths) {
        try {
          await unlink(join(UPLOAD_DIR, filePath))
        } catch (error) {
          console.error('Error deleting file:', error)
        }
      }
    } catch (error) {
      console.error('Error deleting files:', error)
    }

    const deleted = db.deleteEvidencia(parseInt(params.id))
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Evidencia no encontrada' }, { status: 404 })
    }
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

