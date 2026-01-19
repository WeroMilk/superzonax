import { supabaseAdmin } from './supabase'

// Límites de la aplicación (mantenemos los mismos que antes)
export const LIMITS = {
  evidencias: {
    maxPhotos: 100,
    maxPhotosPerUpload: 10,
    maxPhotoSize: 10 * 1024 * 1024, // 10MB por foto
  },
  documentos: {
    maxFiles: 20,
    maxFileSize: 5 * 1024 * 1024, // 5MB por archivo
  },
  attendance: {
    maxFiles: 20,
    maxFileSize: 2 * 1024 * 1024, // 2MB por archivo
  },
  consejo: {
    maxFiles: 20,
    maxFileSize: 5 * 1024 * 1024, // 5MB por archivo
  },
  trimestral: {
    maxFiles: 20,
    maxFileSize: 5 * 1024 * 1024, // 5MB por archivo
  },
  events: {
    maxFiles: 50,
    maxFileSize: 5 * 1024 * 1024, // 5MB por archivo
  },
}

export type StorageType = 'evidencias' | 'documentos' | 'attendance' | 'consejo' | 'trimestral' | 'events'

/**
 * Sube un archivo a Supabase Storage
 */
export async function uploadToSupabase(
  file: File | Buffer,
  filename: string,
  type: StorageType
): Promise<{ url: string; pathname: string }> {
  const pathname = `${type}/${filename}`
  
  const buffer = file instanceof File ? Buffer.from(await file.arrayBuffer()) : file
  
  // Validar tamaño según el tipo
  const limit = LIMITS[type].maxFileSize
  if (buffer.length > limit) {
    throw new Error(`El archivo excede el tamaño máximo de ${limit / 1024 / 1024}MB`)
  }

  const contentType = file instanceof File ? file.type : undefined

  const { data, error } = await supabaseAdmin.storage
    .from('files')
    .upload(pathname, buffer, {
      contentType,
      upsert: true, // Reemplazar si existe
    })

  if (error) {
    throw new Error(`Error al subir archivo: ${error.message}`)
  }

  // Obtener URL pública
  const { data: urlData } = supabaseAdmin.storage
    .from('files')
    .getPublicUrl(pathname)

  return {
    url: urlData.publicUrl,
    pathname,
  }
}

/**
 * Sube múltiples archivos a Supabase Storage
 */
export async function uploadMultipleToSupabase(
  files: File[],
  type: StorageType,
  generateFilename: (file: File, index: number) => string
): Promise<Array<{ url: string; pathname: string }>> {
  const limit = LIMITS[type].maxFiles || LIMITS[type].maxPhotos
  
  if (files.length > limit) {
    throw new Error(`No se pueden subir más de ${limit} archivos`)
  }

  const uploads = await Promise.all(
    files.map((file, index) => {
      const filename = generateFilename(file, index)
      return uploadToSupabase(file, filename, type)
    })
  )

  return uploads
}

/**
 * Elimina un archivo de Supabase Storage
 */
export async function deleteFromSupabase(url: string): Promise<void> {
  try {
    // Extraer el pathname de la URL
    let pathname = url
    if (url.includes('/storage/v1/object/public/files/')) {
      const parts = url.split('/storage/v1/object/public/files/')
      if (parts.length > 1) {
        pathname = parts[1]
      }
    } else if (url.includes('/files/')) {
      const parts = url.split('/files/')
      if (parts.length > 1) {
        pathname = parts[1]
      }
    }

    const { error } = await supabaseAdmin.storage
      .from('files')
      .remove([pathname])

    if (error) {
      console.warn(`Error al eliminar archivo de Supabase: ${url}`, error)
    }
  } catch (error) {
    console.warn(`Error al eliminar archivo de Supabase: ${url}`, error)
  }
}

/**
 * Verifica si un archivo existe en Supabase Storage
 */
export async function supabaseFileExists(url: string): Promise<boolean> {
  try {
    // Extraer el pathname de la URL
    let pathname = url
    if (url.includes('/storage/v1/object/public/files/')) {
      const parts = url.split('/storage/v1/object/public/files/')
      if (parts.length > 1) {
        pathname = parts[1]
      }
    } else if (url.includes('/files/')) {
      const parts = url.split('/files/')
      if (parts.length > 1) {
        pathname = parts[1]
      }
    }

    const { data, error } = await supabaseAdmin.storage
      .from('files')
      .list(pathname.split('/')[0], {
        search: pathname.split('/').pop(),
      })

    return !error && data && data.length > 0
  } catch {
    return false
  }
}
