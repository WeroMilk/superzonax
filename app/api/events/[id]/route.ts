import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import db from '@/lib/supabase-db'
import { uploadToSupabase, deleteFromSupabase, LIMITS } from '@/lib/supabase-storage'

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

    const allEvents = await db.getAllEvents()
    const existingEvent = allEvents.find(e => e.id === parseInt(params.id))
    if (!existingEvent) {
      return NextResponse.json({ success: false, error: 'Evento no encontrado' }, { status: 404 })
    }

    let imagePath = existingEvent.image_path || null
    
    if (imageFile) {
      // Validar límites
      if (imageFile.size > LIMITS.events.maxFileSize) {
        return NextResponse.json({ 
          success: false, 
          error: `La imagen excede el tamaño máximo de ${LIMITS.events.maxFileSize / 1024 / 1024}MB` 
        }, { status: 400 })
      }

      // Eliminar imagen anterior de Supabase Storage si existe
      if (existingEvent.image_path && existingEvent.image_path.startsWith('http')) {
        await deleteFromSupabase(existingEvent.image_path)
      }

      const fileName = `event_${Date.now()}_${imageFile.name}`
      const { url } = await uploadToSupabase(imageFile, fileName, 'events')
      imagePath = url
    }

    const updated = await db.updateEvent(parseInt(params.id), {
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

    const events = await db.getAllEvents()
    const event = events.find(e => e.id === parseInt(params.id))
    
    if (!event) {
      return NextResponse.json({ success: false, error: 'Evento no encontrado' }, { status: 404 })
    }

    // Eliminar imagen de Supabase Storage si es una URL
    if (event.image_path && event.image_path.startsWith('http')) {
      await deleteFromSupabase(event.image_path)
    }

    const deleted = await db.deleteEvent(parseInt(params.id))
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Evento no encontrado' }, { status: 404 })
    }
    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 })
  }
}

