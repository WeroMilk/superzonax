import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { getUserFromRequest } from '@/lib/auth'
import db from '@/lib/db-json'
import { getUploadDir } from '@/lib/vercel-utils'

const UPLOAD_DIR = getUploadDir('documentos')

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ success: false, error: 'No autenticado' }, { status: 401 })
    }

    const schoolId = user.role === 'admin' ? undefined : user.role
    const documentos = db.getAllDocumentos(schoolId).sort((a, b) => b.created_at.localeCompare(a.created_at))
    return NextResponse.json({ success: true, documentos })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 403 })
    }

    const formData = await request.formData()
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const file = formData.get('file') as File
    const allowedSchools = formData.get('allowed_schools') as string

    if (!file || !title) {
      return NextResponse.json({ success: false, error: 'Faltan datos requeridos' }, { status: 400 })
    }

    await mkdir(UPLOAD_DIR, { recursive: true })

    const fileName = `doc_${Date.now()}_${file.name}`
    const filePath = join(UPLOAD_DIR, fileName)

    await writeFile(filePath, Buffer.from(await file.arrayBuffer()))

    const allowedSchoolsArray = allowedSchools ? allowedSchools.split(',').map(s => s.trim()).filter(Boolean) : []

    db.createDocumento({
      title,
      description: description || null,
      file_path: fileName,
      file_type: file.type,
      uploaded_by: user.username,
      allowed_schools: allowedSchoolsArray,
    })

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 })
  }
}

