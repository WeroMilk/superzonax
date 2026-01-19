import { storage } from './firebase'

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
 * Sube un archivo a Firebase Storage
 */
export async function uploadToFirebase(
  file: File | Buffer,
  filename: string,
  type: StorageType
): Promise<{ url: string; pathname: string }> {
  const bucket = storage.bucket()
  const pathname = `${type}/${filename}`
  const fileRef = bucket.file(pathname)

  const buffer = file instanceof File ? Buffer.from(await file.arrayBuffer()) : file
  
  // Validar tamaño según el tipo
  const limit = LIMITS[type].maxFileSize
  if (buffer.length > limit) {
    throw new Error(`El archivo excede el tamaño máximo de ${limit / 1024 / 1024}MB`)
  }

  const metadata: { contentType?: string } = {}
  if (file instanceof File) {
    metadata.contentType = file.type
  }

  await fileRef.save(buffer, {
    metadata,
  })

  // Configurar como público para acceso directo
  await fileRef.makePublic().catch(() => {
    // Si falla hacer público, no es crítico, usaremos signed URL
  })

  // URL pública directa
  const publicUrl = `https://storage.googleapis.com/${bucket.name}/${pathname}`

  return {
    url: publicUrl,
    pathname,
  }
}

/**
 * Sube múltiples archivos a Firebase Storage
 */
export async function uploadMultipleToFirebase(
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
      return uploadToFirebase(file, filename, type)
    })
  )

  return uploads
}

/**
 * Elimina un archivo de Firebase Storage
 */
export async function deleteFromFirebase(url: string): Promise<void> {
  try {
    const bucket = storage.bucket()
    
    // Extraer el pathname de la URL
    let pathname = url
    if (url.includes('storage.googleapis.com/')) {
      const parts = url.split('storage.googleapis.com/')
      if (parts.length > 1) {
        pathname = parts[1].split('/').slice(1).join('/') // Remover el bucket name
      }
    } else if (url.startsWith('http')) {
      // Si es una URL completa, intentar extraer el path
      const urlObj = new URL(url)
      pathname = urlObj.pathname.substring(1) // Remover el primer /
    }

    const fileRef = bucket.file(pathname)
    const [exists] = await fileRef.exists()
    
    if (exists) {
      await fileRef.delete()
    }
  } catch (error) {
    // Si el archivo no existe, no es un error crítico
    console.warn(`Error al eliminar archivo de Firebase: ${url}`, error)
  }
}

/**
 * Verifica si un archivo existe en Firebase Storage
 */
export async function firebaseFileExists(url: string): Promise<boolean> {
  try {
    const bucket = storage.bucket()
    
    // Extraer el pathname de la URL
    let pathname = url
    if (url.includes('storage.googleapis.com/')) {
      const parts = url.split('storage.googleapis.com/')
      if (parts.length > 1) {
        pathname = parts[1].split('/').slice(1).join('/')
      }
    } else if (url.startsWith('http')) {
      const urlObj = new URL(url)
      pathname = urlObj.pathname.substring(1)
    }

    const fileRef = bucket.file(pathname)
    const [exists] = await fileRef.exists()
    return exists
  } catch {
    return false
  }
}
