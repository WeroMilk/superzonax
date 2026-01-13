import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { getDataDir } from '@/lib/vercel-utils'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> | { filename: string } }
) {
  try {
    const resolvedParams = 'then' in params ? await params : params
    const filename = resolvedParams.filename
    
    if (!filename || filename.trim() === '') {
      return NextResponse.json({ error: 'Nombre de archivo no válido' }, { status: 400 })
    }
    const dataDir = getDataDir()
    const filePath = join(dataDir, 'uploads', filename)

    const possiblePaths = [
      join(dataDir, 'uploads', 'attendance', filename),
      join(dataDir, 'uploads', 'consejo', filename),
      join(dataDir, 'uploads', 'trimestral', filename),
      join(dataDir, 'uploads', 'evidencias', filename),
      join(dataDir, 'uploads', 'documentos', filename),
      join(dataDir, 'uploads', 'events', filename),
      join(process.cwd(), 'data', 'uploads', 'attendance', filename),
      join(process.cwd(), 'data', 'uploads', 'consejo', filename),
      join(process.cwd(), 'data', 'uploads', 'trimestral', filename),
      join(process.cwd(), 'data', 'uploads', 'evidencias', filename),
      join(process.cwd(), 'data', 'uploads', 'documentos', filename),
      join(process.cwd(), 'data', 'uploads', 'events', filename),
      filePath,
    ]

    let foundPath: string | null = null
    for (const path of possiblePaths) {
      if (existsSync(path)) {
        foundPath = path
        break
      }
    }

    if (!foundPath) {
      return NextResponse.json({ 
        error: 'Archivo no encontrado',
        searchedPaths: possiblePaths.slice(0, 3)
      }, { status: 404 })
    }

    let fileBuffer: Buffer
    try {
      fileBuffer = await readFile(foundPath)
    } catch (readError) {
      const errorMessage = readError instanceof Error ? readError.message : 'Error desconocido al leer archivo'
      return NextResponse.json({ 
        error: 'Error al leer archivo',
        details: errorMessage
      }, { status: 500 })
    }
    
    if (!fileBuffer || fileBuffer.length === 0) {
      return NextResponse.json({ error: 'Archivo vacío o corrupto' }, { status: 500 })
    }
    
    const ext = filename.split('.').pop()?.toLowerCase()

    const contentType: Record<string, string> = {
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      xls: 'application/vnd.ms-excel',
      pdf: 'application/pdf',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      webp: 'image/webp',
      doc: 'application/msword',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    }

    const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType[ext || ''] || 'application/octet-stream',
        'Content-Disposition': isImage ? `inline; filename="${filename}"` : `attachment; filename="${filename}"`,
        'Content-Length': fileBuffer.length.toString(),
        'Cache-Control': 'no-cache',
      },
    })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

