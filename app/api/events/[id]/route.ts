import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import db from '@/lib/db-json'
import { writeFile, mkdir, unlink } from 'fs/promises'
import { join } from 'path'
import { getUploadDir } from '@/lib/vercel-utils'

const UPLOAD_DIR = getUploadDir('events')

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getUserFromRequest(request)
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 403 })
    }

    const formData = await request.formData()
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const event_type = formData.get('event_type') as 'evento' | 'asuelto' | 'consejo_tecnico' | 'suspension' | 'conmemoracion'
    const start_date = formData.get('start_date') as string
    const end_date = formData.get('end_date') as string | null
    const school_id = formData.get('school_id') as string | null
    const imageFile = formData.get('image') as File | null

    const existingEvent = db.getAllEvents().find(e => e.id === parseInt(params.id))
    if (!existingEvent) {
      return NextResponse.json({ success: false, error: 'Evento no encontrado' }, { status: 404 })
    }

    let imagePath = existingEvent.image_path || null
    
    if (imageFile) {
      await mkdir(UPLOAD_DIR, { recursive: true })
      if (existingEvent.image_path) {
        try {
          await unlink(join(UPLOAD_DIR, existingEvent.image_path))
        } catch {
          // Ignorar error si el archivo no existe
        }
      }
      const fileName = `event_${Date.now()}_${imageFile.name}`
      const filePath = join(UPLOAD_DIR, fileName)
      await writeFile(filePath, Buffer.from(await imageFile.arrayBuffer()))
      imagePath = fileName
    }

    const updated = db.updateEvent(parseInt(params.id), {
      title,
      description: description || null,
      event_type,
      start_date,
      end_date: end_date || null,
      school_id: school_id || null,
      image_path: imagePath,
    })
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Evento no encontrado' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getUserFromRequest(request)
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 403 })
    }

    const events = db.getAllEvents()
    const event = events.find(e => e.id === parseInt(params.id))
    
    if (!event) {
      return NextResponse.json({ success: false, error: 'Evento no encontrado' }, { status: 404 })
    }

    if (event.image_path) {
      try {
        await unlink(join(UPLOAD_DIR, event.image_path))
      } catch {
        // Ignorar error si el archivo no existe
      }
    }

    const deleted = db.deleteEvent(parseInt(params.id))
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Evento no encontrado' }, { status: 404 })
    }
    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 })
  }
}

