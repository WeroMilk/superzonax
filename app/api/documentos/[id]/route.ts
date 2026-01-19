import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import db from '@/lib/supabase-db'
import { deleteFromSupabase } from '@/lib/supabase-storage'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const user = getUserFromRequest(request)
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 403 })
    }

    const resolvedParams = 'then' in params ? await params : params
    const id = parseInt(resolvedParams.id)
    
    if (isNaN(id)) {
      return NextResponse.json({ success: false, error: 'ID inválido' }, { status: 400 })
    }

    const documentos = await db.getAllDocumentos()
    const documento = documentos.find(d => d.id === id)
    
    if (!documento) {
      return NextResponse.json({ success: false, error: 'Documento no encontrado' }, { status: 404 })
    }

    // Eliminar archivo de Supabase Storage si es una URL
    if (documento.file_path && documento.file_path.startsWith('http')) {
      await deleteFromSupabase(documento.file_path)
    }

    const deleted = await db.deleteDocumento(id)
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Documento no encontrado en la base de datos' }, { status: 404 })
    }
    return NextResponse.json({ success: true, message: 'Documento eliminado correctamente' })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 })
  }
}

