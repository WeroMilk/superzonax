import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const filename = params.filename
    const filePath = join(process.cwd(), 'data', 'uploads', filename)

    // Buscar en diferentes subdirectorios
    const possiblePaths = [
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
      return NextResponse.json({ error: 'Archivo no encontrado' }, { status: 404 })
    }

    const fileBuffer = await readFile(foundPath)
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
      },
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

