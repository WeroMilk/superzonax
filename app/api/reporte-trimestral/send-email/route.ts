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

    const { quarter, year, recipients } = await request.json()

    const records = db.getAllReporteTrimestral().filter(r => r.quarter === quarter && r.year === year)

    if (records.length === 0) {
      return NextResponse.json({ success: false, error: 'No hay archivos para este trimestre' }, { status: 400 })
    }

    const files: Array<{ path: string; name: string }> = []

    for (const record of records) {
      const schoolName = record.school_id === 'sec6' ? 'Secundaria 6' : record.school_id === 'sec60' ? 'Secundaria 60' : 'Secundaria 72'
      
      if (record.file) {
        // Usar la URL directamente si es una URL de Blob, o construir la ruta si es un nombre de archivo antiguo
        const filePath = record.file.startsWith('http') 
          ? record.file 
          : `/api/files/${encodeURIComponent(record.file)}`
        
        files.push({
          path: filePath,
          name: `${schoolName}_Trimestre_${quarter}`,
        })
      }
    }

    const result = await sendEmail({
      reportType: 'reporte_trimestral',
      recipients,
      files,
      subject: `Reporte Trimestral - Trimestre ${quarter} ${year}`,
      body: `
        <h2>Reporte Trimestral Consolidado</h2>
        <p>Trimestre: ${quarter} - Año: ${year}</p>
        <p>Se adjuntan los reportes trimestrales consolidados de las tres secundarias técnicas.</p>
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

