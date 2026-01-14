import { put, del, head } from '@vercel/blob'

// Límites de la aplicación
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

export type BlobType = 'evidencias' | 'documentos' | 'attendance' | 'consejo' | 'trimestral' | 'events'

/**
 * Sube un archivo a Vercel Blob Storage
 */
export async function uploadToBlob(
  file: File | Buffer,
  filename: string,
  type: BlobType
): Promise<{ url: string; pathname: string }> {
  const buffer = file instanceof File ? Buffer.from(await file.arrayBuffer()) : file
  
  // Validar tamaño según el tipo
  const limit = LIMITS[type].maxFileSize
  if (buffer.length > limit) {
    throw new Error(`El archivo excede el tamaño máximo de ${limit / 1024 / 1024}MB`)
  }

  const pathname = `${type}/${filename}`
  
  const blob = await put(pathname, buffer, {
    access: 'public',
    contentType: file instanceof File ? file.type : undefined,
  })

  return {
    url: blob.url,
    pathname: blob.pathname,
  }
}

/**
 * Sube múltiples archivos a Vercel Blob Storage
 */
export async function uploadMultipleToBlob(
  files: File[],
  type: BlobType,
  generateFilename: (file: File, index: number) => string
): Promise<Array<{ url: string; pathname: string }>> {
  const limit = LIMITS[type].maxFiles || LIMITS[type].maxPhotos
  
  if (files.length > limit) {
    throw new Error(`No se pueden subir más de ${limit} archivos`)
  }

  const uploads = await Promise.all(
    files.map((file, index) => {
      const filename = generateFilename(file, index)
      return uploadToBlob(file, filename, type)
    })
  )

  return uploads
}

/**
 * Elimina un archivo de Vercel Blob Storage
 */
export async function deleteFromBlob(url: string): Promise<void> {
  try {
    await del(url)
  } catch (error) {
    // Si el archivo no existe, no es un error crítico
    console.warn(`Error al eliminar blob: ${url}`, error)
  }
}

/**
 * Verifica si un archivo existe en Blob Storage
 */
export async function blobExists(url: string): Promise<boolean> {
  try {
    await head(url)
    return true
  } catch {
    return false
  }
}
