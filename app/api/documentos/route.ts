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

    // Validar límites
    if (file.size > LIMITS.documentos.maxFileSize) {
      return NextResponse.json({ 
        success: false, 
        error: `El archivo excede el tamaño máximo de ${LIMITS.documentos.maxFileSize / 1024 / 1024}MB` 
      }, { status: 400 })
    }

    // Contar total de documentos existentes
    const existingDocs = db.getAllDocumentos()
    if (existingDocs.length >= LIMITS.documentos.maxFiles) {
      return NextResponse.json({ 
        success: false, 
        error: `Has alcanzado el límite de ${LIMITS.documentos.maxFiles} documentos` 
      }, { status: 400 })
    }

    const fileName = `doc_${Date.now()}_${file.name}`
    const { url } = await uploadToBlob(file, fileName, 'documentos')

    const allowedSchoolsArray = allowedSchools ? allowedSchools.split(',').map(s => s.trim()).filter(Boolean) : []

    db.createDocumento({
      title,
      description: description || null,
      file_path: url,
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

