import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { sendEmail } from '@/lib/email'
import db from '@/lib/db-json'
import { join } from 'path'

const UPLOAD_DIR = join(process.cwd(), 'data', 'uploads', 'consejo')

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 403 })
    }

    const { month, year, recipients } = await request.json()

    const records = db.getAllConsejoTecnico().filter(r => r.month === month && r.year === year)

    if (records.length === 0) {
      return NextResponse.json({ success: false, error: 'No hay archivos para este mes' }, { status: 400 })
    }

    const files: Array<{ path: string; name: string }> = []

    for (const record of records) {
      const schoolName = record.school_id === 'sec6' ? 'Secundaria 6' : record.school_id === 'sec60' ? 'Secundaria 60' : 'Secundaria 72'
      files.push({
        path: join(UPLOAD_DIR, record.file),
        name: `${schoolName}_Consejo_Tecnico`,
      })
    }

    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
    const monthName = monthNames[parseInt(month) - 1]

    const result = await sendEmail({
      reportType: 'consejo_tecnico',
      recipients,
      files,
      subject: `Consejo Técnico - ${monthName} ${year}`,
      body: `
        <h2>Consejo Técnico Mensual Consolidado</h2>
        <p>Mes: ${monthName} ${year}</p>
        <p>Se adjuntan los reportes consolidados de consejo técnico de las tres secundarias técnicas.</p>
      `,
    })

    if (result.success) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 })
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

