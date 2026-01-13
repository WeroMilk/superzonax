import { NextRequest, NextResponse } from 'next/server'
import { unlink } from 'fs/promises'
import { join } from 'path'
import { getUserFromRequest } from '@/lib/auth'
import db from '@/lib/db-json'

const UPLOAD_DIR = join(process.cwd(), 'data', 'uploads', 'documentos')

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getUserFromRequest(request)
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 403 })
    }

    const documentos = db.getAllDocumentos()
    const documento = documentos.find(d => d.id === parseInt(params.id))
    
    if (!documento) {
      return NextResponse.json({ success: false, error: 'Documento no encontrado' }, { status: 404 })
    }

    // Eliminar archivo
    try {
      await unlink(join(UPLOAD_DIR, documento.file_path))
    } catch (error) {
      console.error('Error deleting file:', error)
    }

    const deleted = db.deleteDocumento(parseInt(params.id))
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Documento no encontrado' }, { status: 404 })
    }
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

