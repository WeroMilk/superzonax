import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import db from '@/lib/supabase-db'
import { uploadMultipleToSupabase, LIMITS } from '@/lib/supabase-storage'

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
      evidencias = (await db.getAllEvidencias()).sort((a, b) => b.created_at.localeCompare(a.created_at))
    } else if (school) {
      evidencias = (await db.getAllEvidencias(school)).sort((a, b) => b.created_at.localeCompare(a.created_at))
    } else {
      evidencias = (await db.getAllEvidencias(user.role)).sort((a, b) => b.created_at.localeCompare(a.created_at))
    }

    return NextResponse.json({ success: true, evidencias })
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
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const files = formData.getAll('files') as File[]

    if (!files || files.length === 0 || !title) {
      return NextResponse.json({ success: false, error: 'Faltan datos requeridos' }, { status: 400 })
    }

    // Validar límites
    if (files.length > LIMITS.evidencias.maxPhotosPerUpload) {
      return NextResponse.json({ 
        success: false, 
        error: `No se pueden subir más de ${LIMITS.evidencias.maxPhotosPerUpload} fotos por evidencia` 
      }, { status: 400 })
    }

    // Verificar tamaño de cada archivo
    for (const file of files) {
      if (file.size > LIMITS.evidencias.maxPhotoSize) {
        return NextResponse.json({ 
          success: false, 
          error: `La foto "${file.name}" excede el tamaño máximo de ${LIMITS.evidencias.maxPhotoSize / 1024 / 1024}MB` 
        }, { status: 400 })
      }
    }

    // Contar total de fotos existentes para este usuario
    const existingEvidencias = await db.getAllEvidencias(user.role)
    const totalPhotos = existingEvidencias.reduce((total, ev) => {
      return total + (ev.file_paths?.length || (ev.file_path ? 1 : 0))
    }, 0)

    if (totalPhotos + files.length > LIMITS.evidencias.maxPhotos) {
      return NextResponse.json({ 
        success: false, 
        error: `Has alcanzado el límite de ${LIMITS.evidencias.maxPhotos} fotos. Actualmente tienes ${totalPhotos} fotos.` 
      }, { status: 400 })
    }

    const timestamp = Date.now()
    const uploads = await uploadMultipleToSupabase(
      files,
      'evidencias',
      (file, index) => `${user.role}_${timestamp}_${index}_${file.name}`
    )

    const fileUrls = uploads.map(u => u.url)
    const fileTypes = files.map(f => f.type)

    await db.createEvidencia({
      school_id: user.role,
      title,
      description: description || null,
      file_paths: fileUrls,
      file_types: fileTypes,
    })

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 })
  }
}

