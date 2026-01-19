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

    const allRecords = await db.getAllConsejoTecnico()
    const record = allRecords.find(r => r.id === parseInt(params.id))
    
    if (!record) {
      return NextResponse.json({ success: false, error: 'Registro no encontrado' }, { status: 404 })
    }

    if (user.role !== 'admin' && record.school_id !== user.role) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 403 })
    }

    // Eliminar archivo de Supabase Storage si es una URL
    if (record.file && record.file.startsWith('http')) {
      await deleteFromSupabase(record.file)
    }

    const deleted = await db.deleteConsejoTecnico(parseInt(params.id))
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Registro no encontrado' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 })
  }
}
