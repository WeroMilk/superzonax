export function capitalizeFirst(str: string): string {
  if (!str) return str;
  // Capitalizar la primera letra de la primera palabra que sea una letra
  // Si el string comienza con números, buscar la primera letra y capitalizarla
  const trimmed = str.trim();
  if (!trimmed) return str;
  
  // Buscar la primera letra en el string
  const firstLetterIndex = trimmed.search(/[a-zA-ZáéíóúÁÉÍÓÚñÑ]/);
  if (firstLetterIndex === -1) return str; // No hay letras
  
  // Capitalizar la primera letra encontrada
  return trimmed.slice(0, firstLetterIndex) + 
         trimmed.charAt(firstLetterIndex).toUpperCase() + 
         trimmed.slice(firstLetterIndex + 1);
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const formatted = d.toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  return capitalizeFirst(formatted);
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const formatted = d.toLocaleString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  return capitalizeFirst(formatted);
}

export function formatDateTimeCompact(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const day = d.getDate();
  const month = d.toLocaleDateString('es-MX', { month: 'short' });
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${day} ${capitalizeFirst(month)} ${year}, ${hours}:${minutes}`;
}

export function getTodayDate(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getCurrentMonth(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export function getCurrentYear(): number {
  return new Date().getFullYear();
}
