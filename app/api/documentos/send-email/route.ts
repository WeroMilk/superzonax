import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { sendEmail } from '@/lib/email'
import db from '@/lib/db-json'

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 403 })
    }

    const { documentoIds, recipients } = await request.json()

    if (!documentoIds || !Array.isArray(documentoIds) || documentoIds.length === 0) {
      return NextResponse.json({ success: false, error: 'Debes seleccionar al menos un documento' }, { status: 400 })
    }

    if (!recipients || recipients.trim() === '') {
      return NextResponse.json({ success: false, error: 'Debes seleccionar al menos un destinatario' }, { status: 400 })
    }

    const allDocumentos = db.getAllDocumentos()
    const selectedDocumentos = allDocumentos.filter(doc => documentoIds.includes(doc.id))

    if (selectedDocumentos.length === 0) {
      return NextResponse.json({ success: false, error: 'No se encontraron los documentos seleccionados' }, { status: 400 })
    }

    const files: Array<{ path: string; name: string }> = []

    for (const documento of selectedDocumentos) {
      if (documento.file_path) {
        // Usar la URL directamente si es una URL de Blob, o construir la ruta si es un nombre de archivo antiguo
        const filePath = documento.file_path.startsWith('http') 
          ? documento.file_path 
          : `/api/files/${encodeURIComponent(documento.file_path)}`
        
        files.push({
          path: filePath,
          name: documento.title,
        })
      }
    }

    if (files.length === 0) {
      return NextResponse.json({ success: false, error: 'No hay archivos válidos para enviar' }, { status: 400 })
    }

    const recipientsArray = recipients.split(',').map((r: string) => r.trim()).filter(Boolean)

    const result = await sendEmail({
      reportType: 'documentos',
      recipients: recipientsArray,
      files,
      subject: `Documentos del Repositorio - ${new Date().toLocaleDateString('es-MX')}`,
      body: `
        <h2>Documentos del Repositorio</h2>
        <p>Se adjuntan ${files.length} documento(s) del repositorio:</p>
        <ul>
          ${selectedDocumentos.map(doc => `<li>${doc.title}${doc.description ? ` - ${doc.description}` : ''}</li>`).join('')}
        </ul>
        <p>Fecha de envío: ${new Date().toLocaleDateString('es-MX', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}</p>
      `,
    })

    if (result.success) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 })
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 })
  }
}
