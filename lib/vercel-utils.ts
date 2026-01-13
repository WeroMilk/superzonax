import { join } from 'path'

export function getDataDir(): string {
  const isVercel = process.env.VERCEL === '1'
  return isVercel ? '/tmp/data' : join(process.cwd(), 'data')
}

export function getUploadDir(type: 'attendance' | 'consejo' | 'trimestral' | 'evidencias' | 'documentos' | 'events'): string {
  return join(getDataDir(), 'uploads', type)
}

export function getDbPath(): string {
  return join(getDataDir(), 'db.json')
}
