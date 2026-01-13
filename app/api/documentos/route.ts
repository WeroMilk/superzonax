import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { getUserFromRequest } from '@/lib/auth'
import db from '@/lib/db-json'

const UPLOAD_DIR = join(process.cwd(), 'data', 'uploads', 'documentos')

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ success: false, error: 'No autenticado' }, { status: 401 })
    }

    const documentos = db.getAllDocumentos().sort((a, b) => b.created_at.localeCompare(a.created_at))
    return NextResponse.json({ success: true, documentos })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
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

    if (!file || !title) {
      return NextResponse.json({ success: false, error: 'Faltan datos requeridos' }, { status: 400 })
    }

    await mkdir(UPLOAD_DIR, { recursive: true })

    const fileName = `doc_${Date.now()}_${file.name}`
    const filePath = join(UPLOAD_DIR, fileName)

    await writeFile(filePath, Buffer.from(await file.arrayBuffer()))

    db.createDocumento({
      title,
      description: description || null,
      file_path: fileName,
      file_type: file.type,
      uploaded_by: user.username,
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

