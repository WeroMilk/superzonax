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

    const events = db.getAllEvents().sort((a, b) => a.start_date.localeCompare(b.start_date))
    return NextResponse.json({ success: true, events })
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
    const event_type = formData.get('event_type') as 'evento' | 'asuelto' | 'consejo_tecnico' | 'suspension' | 'conmemoracion'
    const start_date = formData.get('start_date') as string
    const end_date = formData.get('end_date') as string | null
    const school_id = formData.get('school_id') as string | null
    const imageFile = formData.get('image') as File | null

    if (!title || !event_type || !start_date) {
      return NextResponse.json({ success: false, error: 'Faltan datos requeridos' }, { status: 400 })
    }

    let imagePath = null
    if (imageFile) {
      // Validar límites
      if (imageFile.size > LIMITS.events.maxFileSize) {
        return NextResponse.json({ 
          success: false, 
          error: `La imagen excede el tamaño máximo de ${LIMITS.events.maxFileSize / 1024 / 1024}MB` 
        }, { status: 400 })
      }

      // Contar total de eventos con imágenes existentes
      const existingEvents = db.getAllEvents()
      const eventsWithImages = existingEvents.filter(e => e.image_path).length
      if (eventsWithImages >= LIMITS.events.maxFiles) {
        return NextResponse.json({ 
          success: false, 
          error: `Has alcanzado el límite de ${LIMITS.events.maxFiles} imágenes de eventos` 
        }, { status: 400 })
      }

      const fileName = `event_${Date.now()}_${imageFile.name}`
      const { url } = await uploadToBlob(imageFile, fileName, 'events')
      imagePath = url
    }

    db.createEvent({
      title,
      description: description || null,
      event_type,
      start_date,
      end_date: end_date || null,
      school_id: school_id || null,
      created_by: user.username,
      image_path: imagePath,
    })

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 })
  }
}

