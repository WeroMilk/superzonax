import { NextRequest, NextResponse } from 'next/server'
import { unlink } from 'fs/promises'
import { join } from 'path'
import { getUserFromRequest } from '@/lib/auth'
import db from '@/lib/db-json'
import { getUploadDir } from '@/lib/vercel-utils'

const UPLOAD_DIR = getUploadDir('evidencias')

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

    if (user.role !== 'admin' && user.role !== evidencia.school_id) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 403 })
    }

    for (const filePath of evidencia.file_paths) {
      try {
        await unlink(join(UPLOAD_DIR, filePath))
      } catch {
        // Ignorar error si el archivo no existe
      }
    }

    const deleted = db.deleteEvidencia(parseInt(params.id))
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Evidencia no encontrada' }, { status: 404 })
    }
    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 })
  }
}

