import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { getUserFromRequest } from '@/lib/auth'
import db from '@/lib/db-json'
import { getUploadDir } from '@/lib/vercel-utils'

const UPLOAD_DIR = getUploadDir('consejo')

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
      records = db.getAllConsejoTecnico().sort((a, b) => {
        const yearCompare = b.year - a.year
        if (yearCompare !== 0) return yearCompare
        const monthCompare = parseInt(b.month) - parseInt(a.month)
        return monthCompare !== 0 ? monthCompare : a.school_id.localeCompare(b.school_id)
      })
    } else if (school) {
      records = db.getAllConsejoTecnico(school).sort((a, b) => {
        const yearCompare = b.year - a.year
        return yearCompare !== 0 ? yearCompare : parseInt(b.month) - parseInt(a.month)
      })
    } else {
      records = db.getAllConsejoTecnico(user.role).sort((a, b) => {
        const yearCompare = b.year - a.year
        return yearCompare !== 0 ? yearCompare : parseInt(b.month) - parseInt(a.month)
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
    const month = formData.get('month') as string
    const year = parseInt(formData.get('year') as string)
    const file = formData.get('file') as File

    if (!file || !month || !year) {
      return NextResponse.json({ success: false, error: 'Faltan datos requeridos' }, { status: 400 })
    }

    await mkdir(UPLOAD_DIR, { recursive: true })

    const fileName = `${user.role}_${year}_${month}_${Date.now()}.${file.name.split('.').pop()}`
    const filePath = join(UPLOAD_DIR, fileName)

    await writeFile(filePath, Buffer.from(await file.arrayBuffer()))

    db.createOrUpdateConsejoTecnico(user.role, month, year, fileName)

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 })
  }
}

