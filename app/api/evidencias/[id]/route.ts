import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import db from '@/lib/supabase-db'
import { deleteFromSupabase } from '@/lib/supabase-storage'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ success: false, error: 'No autenticado' }, { status: 401 })
    }

    const evidencias = await db.getAllEvidencias()
    const evidencia = evidencias.find(e => e.id === parseInt(params.id))
    
    if (!evidencia) {
      return NextResponse.json({ success: false, error: 'Evidencia no encontrada' }, { status: 404 })
    }

    if (user.role !== 'admin' && user.role !== evidencia.school_id) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 403 })
    }

    // Eliminar archivos de Supabase Storage
    const filePaths = evidencia.file_paths || (evidencia.file_path ? [evidencia.file_path] : [])
    for (const fileUrl of filePaths) {
      // Si es una URL de Supabase, eliminarla
      if (fileUrl.startsWith('http')) {
        await deleteFromSupabase(fileUrl)
      }
    }

    const deleted = await db.deleteEvidencia(parseInt(params.id))
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Evidencia no encontrada' }, { status: 404 })
    }
    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 })
  }
}

