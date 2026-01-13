import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { getUserFromRequest } from '@/lib/auth'
import db from '@/lib/db-json'

const UPLOAD_DIR = join(process.cwd(), 'data', 'uploads', 'trimestral')

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
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
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

    await mkdir(UPLOAD_DIR, { recursive: true })

    const fileName = `${user.role}_${year}_Q${quarter}_${Date.now()}.${file.name.split('.').pop()}`
    const filePath = join(UPLOAD_DIR, fileName)

    await writeFile(filePath, Buffer.from(await file.arrayBuffer()))

    db.createOrUpdateReporteTrimestral(user.role, quarter, year, fileName)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

