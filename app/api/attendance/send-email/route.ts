import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'
import { sendEmail } from '@/lib/email'
import db from '@/lib/db-json'
import { join } from 'path'

const UPLOAD_DIR = join(process.cwd(), 'data', 'uploads', 'attendance')

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 403 })
    }

    const { date, recipients } = await request.json()

    const records = db.getAllAttendance().filter(r => r.date === date)

    if (records.length === 0) {
      return NextResponse.json({ success: false, error: 'No hay archivos para esta fecha' }, { status: 400 })
    }

    const files: Array<{ path: string; name: string }> = []

    for (const record of records) {
      const schoolName = record.school_id === 'sec6' ? 'Secundaria 6' : record.school_id === 'sec60' ? 'Secundaria 60' : 'Secundaria 72'
      
      if (record.students_file) {
        files.push({
          path: join(UPLOAD_DIR, record.students_file),
          name: `${schoolName}_Asistencia`,
        })
      }
    }

    const result = await sendEmail({
      reportType: 'attendance',
      recipients,
      files,
      subject: `Asistencia Diaria - ${date}`,
      body: `
        <h2>Asistencia Diaria Consolidada</h2>
        <p>Fecha: ${date}</p>
        <p>Se adjuntan los archivos consolidados de asistencia de las tres secundarias técnicas.</p>
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

