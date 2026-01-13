import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { getUserFromRequest } from '@/lib/auth'
import db from '@/lib/db-json'

const UPLOAD_DIR = join(process.cwd(), 'data', 'uploads', 'evidencias')

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ success: false, error: 'No autenticado' }, { status: 401 })
    }

    const url = new URL(request.url)
    const school = url.searchParams.get('school')

    let evidencias
    if (user.role === 'admin') {
      evidencias = db.getAllEvidencias().sort((a, b) => b.created_at.localeCompare(a.created_at))
    } else if (school) {
      evidencias = db.getAllEvidencias(school).sort((a, b) => b.created_at.localeCompare(a.created_at))
    } else {
      evidencias = db.getAllEvidencias(user.role).sort((a, b) => b.created_at.localeCompare(a.created_at))
    }

    return NextResponse.json({ success: true, evidencias })
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
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const files = formData.getAll('files') as File[]

    if (!files || files.length === 0 || !title) {
      return NextResponse.json({ success: false, error: 'Faltan datos requeridos' }, { status: 400 })
    }

    await mkdir(UPLOAD_DIR, { recursive: true })

    const fileNames: string[] = []
    const fileTypes: string[] = []
    const timestamp = Date.now()

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const fileName = `${user.role}_${timestamp}_${i}_${file.name}`
      const filePath = join(UPLOAD_DIR, fileName)
      await writeFile(filePath, Buffer.from(await file.arrayBuffer()))
      fileNames.push(fileName)
      fileTypes.push(file.type)
    }

    db.createEvidencia({
      school_id: user.role,
      title,
      description: description || null,
      file_paths: fileNames,
      file_types: fileTypes,
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

