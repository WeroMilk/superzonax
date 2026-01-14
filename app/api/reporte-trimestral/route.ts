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
      records = db.getAllReporteTrimestral().sort((a, b) => {
        const yearCompare = b.year - a.year
        if (yearCompare !== 0) return yearCompare
        const quarterCompare = b.quarter - a.quarter
        return quarterCompare !== 0 ? quarterCompare : a.school_id.localeCompare(b.school_id)
      })
    } else if (school) {
      records = db.getAllReporteTrimestral(school).sort((a, b) => {
        const yearCompare = b.year - a.year
        return yearCompare !== 0 ? yearCompare : b.quarter - a.quarter
      })
    } else {
      records = db.getAllReporteTrimestral(user.role).sort((a, b) => {
        const yearCompare = b.year - a.year
        return yearCompare !== 0 ? yearCompare : b.quarter - a.quarter
      })
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
    const quarter = parseInt(formData.get('quarter') as string)
    const year = parseInt(formData.get('year') as string)
    const file = formData.get('file') as File

    if (!file || !quarter || !year) {
      return NextResponse.json({ success: false, error: 'Faltan datos requeridos' }, { status: 400 })
    }

    // Validar límites
    if (file.size > LIMITS.trimestral.maxFileSize) {
      return NextResponse.json({ 
        success: false, 
        error: `El archivo excede el tamaño máximo de ${LIMITS.trimestral.maxFileSize / 1024 / 1024}MB` 
      }, { status: 400 })
    }

    // Contar total de archivos existentes
    const existingRecords = db.getAllReporteTrimestral()
    if (existingRecords.length >= LIMITS.trimestral.maxFiles) {
      return NextResponse.json({ 
        success: false, 
        error: `Has alcanzado el límite de ${LIMITS.trimestral.maxFiles} archivos de reporte trimestral` 
      }, { status: 400 })
    }

    const fileName = `${user.role}_${year}_Q${quarter}_${Date.now()}.${file.name.split('.').pop()}`
    const { url } = await uploadToBlob(file, fileName, 'trimestral')

    db.createOrUpdateReporteTrimestral(user.role, quarter, year, url)

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 })
  }
}

