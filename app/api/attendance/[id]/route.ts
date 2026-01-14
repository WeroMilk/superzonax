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

    const allRecords = db.getAllAttendance()
    const record = allRecords.find(r => r.id === parseInt(params.id))
    
    if (!record) {
      return NextResponse.json({ success: false, error: 'Registro no encontrado' }, { status: 404 })
    }

    if (user.role !== 'admin' && record.school_id !== user.role) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 403 })
    }

    // Eliminar archivos de Blob Storage si son URLs
    if (record.students_file && record.students_file.startsWith('http')) {
      await deleteFromBlob(record.students_file)
    }
    if (record.staff_file && record.staff_file.startsWith('http')) {
      await deleteFromBlob(record.staff_file)
    }

    const deleted = db.deleteAttendance(parseInt(params.id))
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Registro no encontrado' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 })
  }
}
