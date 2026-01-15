export function capitalizeFirst(str: string): string {
  if (!str) return str
  const trimmed = str.trim()
  if (!trimmed) return str
  
  const firstLetterIndex = trimmed.search(/[a-zA-ZáéíóúÁÉÍÓÚñÑ]/)
  if (firstLetterIndex === -1) return str
  
  return trimmed.slice(0, firstLetterIndex) + 
         trimmed.charAt(firstLetterIndex).toUpperCase() + 
         trimmed.slice(firstLetterIndex + 1)
}

export function formatDate(date: string | Date): string {
  let d: Date
  
  if (typeof date === 'string') {
    // Si es formato YYYY-MM-DD, parsearlo manualmente para evitar problemas de zona horaria
    const dateMatch = date.match(/^(\d{4})-(\d{2})-(\d{2})$/)
    if (dateMatch) {
      const [, year, month, day] = dateMatch
      d = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
    } else {
      d = new Date(date)
    }
  } else {
    d = date
  }
  
  const formatted = d.toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  return capitalizeFirst(formatted)
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const formatted = d.toLocaleString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
  return capitalizeFirst(formatted)
}

export function formatDateTimeCompact(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const day = d.getDate()
  const month = d.toLocaleDateString('es-MX', { month: 'short' })
  const year = d.getFullYear()
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  return `${day} ${capitalizeFirst(month)} ${year}, ${hours}:${minutes}`
}

export function getTodayDate(): string {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function getCurrentMonth(): string {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

export function getCurrentYear(): number {
  return new Date().getFullYear()
}

/**
 * Obtiene la URL correcta para un archivo (Blob URL o ruta local)
 */
export function getFileUrl(filePath: string | null | undefined): string {
  if (!filePath) return ''
  // Si es una URL completa de Blob, usarla directamente
  if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
    return filePath
  }
  // Si no, usar la ruta de API (para archivos antiguos)
  return `/api/files/${encodeURIComponent(filePath)}`
}
