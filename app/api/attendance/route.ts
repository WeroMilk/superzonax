import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import db from '@/lib/db-json'
import { uploadToBlob, LIMITS } from '@/lib/blob-storage'

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ success: false, error: 'No autenticado' }, { status: 401 })
    }

    const url = new URL(request.url)
    const school = url.searchParams.get('school')

    let records
    if (user.role === 'admin') {
      records = db.getAllAttendance().sort((a, b) => {
        const dateCompare = b.date.localeCompare(a.date)
        return dateCompare !== 0 ? dateCompare : a.school_id.localeCompare(b.school_id)
      })
    } else if (school) {
      records = db.getAllAttendance(school).sort((a, b) => b.date.localeCompare(a.date))
    } else {
      records = db.getAllAttendance(user.role).sort((a, b) => b.date.localeCompare(a.date))
    }

    return NextResponse.json({ success: true, records })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user || user.role === 'admin') {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 403 })
    }

    const formData = await request.formData()
    const date = formData.get('date') as string
    const attendanceFile = formData.get('attendanceFile') as File

    if (!attendanceFile || !date) {
      return NextResponse.json({ success: false, error: 'Faltan datos requeridos' }, { status: 400 })
    }

    // Validar límites
    if (attendanceFile.size > LIMITS.attendance.maxFileSize) {
      return NextResponse.json({ 
        success: false, 
        error: `El archivo excede el tamaño máximo de ${LIMITS.attendance.maxFileSize / 1024 / 1024}MB` 
      }, { status: 400 })
    }

    // Contar total de archivos de asistencia existentes
    const existingRecords = db.getAllAttendance()
    if (existingRecords.length >= LIMITS.attendance.maxFiles) {
      return NextResponse.json({ 
        success: false, 
        error: `Has alcanzado el límite de ${LIMITS.attendance.maxFiles} archivos de asistencia` 
      }, { status: 400 })
    }

    const fileExtension = attendanceFile.name.split('.').pop() || 'xlsx'
    const fileName = `${user.role}_${date}_attendance_${Date.now()}.${fileExtension}`
    const { url } = await uploadToBlob(attendanceFile, fileName, 'attendance')

    db.createOrUpdateAttendance(user.role, date, url, null)

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 })
  }
}

