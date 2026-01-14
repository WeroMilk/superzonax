import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import db from '@/lib/db-json'
import { deleteFromBlob } from '@/lib/blob-storage'

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

    // Eliminar archivos de Blob Storage
    const filePaths = evidencia.file_paths || (evidencia.file_path ? [evidencia.file_path] : [])
    for (const fileUrl of filePaths) {
      // Si es una URL de Blob, eliminarla
      if (fileUrl.startsWith('http')) {
        await deleteFromBlob(fileUrl)
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

