import { put, del, head } from '@vercel/blob'

// Verificar que el token esté configurado
if (!process.env.BLOB_READ_WRITE_TOKEN && process.env.NODE_ENV === 'production') {
  console.error('⚠️  BLOB_READ_WRITE_TOKEN no está configurado. Por favor crea un Blob Store en Vercel Dashboard.')
}

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
  // Verificar que el token esté configurado
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error(
      'BLOB_READ_WRITE_TOKEN no está configurado. ' +
      'Por favor crea un Blob Store en Vercel Dashboard (Storage → Create Database → Blob) ' +
      'y asegúrate de que la variable de entorno esté configurada.'
    )
  }

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
    token: process.env.BLOB_READ_WRITE_TOKEN,
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
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.warn('BLOB_READ_WRITE_TOKEN no está configurado. No se puede eliminar el archivo.')
    return
  }

  try {
    await del(url, { token: process.env.BLOB_READ_WRITE_TOKEN })
  } catch (error) {
    // Si el archivo no existe, no es un error crítico
    console.warn(`Error al eliminar blob: ${url}`, error)
  }
}

/**
 * Verifica si un archivo existe en Blob Storage
 */
export async function blobExists(url: string): Promise<boolean> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return false
  }

  try {
    await head(url, { token: process.env.BLOB_READ_WRITE_TOKEN })
    return true
  } catch {
    return false
  }
}
