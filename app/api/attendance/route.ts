import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { getUserFromRequest } from '@/lib/auth'
import db from '@/lib/db-json'

const UPLOAD_DIR = join(process.cwd(), 'data', 'uploads', 'attendance')

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ success: false, error: 'No autenticado' }, { status: 401 })
    }

    const url = new URL(request.url)
    const school = url.searchParams.get('school')

    let records
    if (user.role === 'admin') {
      records = db.getAllAttendance().sort((a, b) => {
        const dateCompare = b.date.localeCompare(a.date)
        return dateCompare !== 0 ? dateCompare : a.school_id.localeCompare(b.school_id)
      })
    } else if (school) {
      records = db.getAllAttendance(school).sort((a, b) => b.date.localeCompare(a.date))
    } else {
      records = db.getAllAttendance(user.role).sort((a, b) => b.date.localeCompare(a.date))
    }

    return NextResponse.json({ success: true, records })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user || user.role === 'admin') {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 403 })
    }

    const formData = await request.formData()
    const date = formData.get('date') as string
    const attendanceFile = formData.get('attendanceFile') as File

    if (!attendanceFile || !date) {
      return NextResponse.json({ success: false, error: 'Faltan datos requeridos' }, { status: 400 })
    }

    await mkdir(UPLOAD_DIR, { recursive: true })

    const fileName = `${user.role}_${date}_attendance_${Date.now()}.${attendanceFile.name.split('.').pop()}`
    const filePath = join(UPLOAD_DIR, fileName)

    await writeFile(filePath, Buffer.from(await attendanceFile.arrayBuffer()))

    db.createOrUpdateAttendance(user.role, date, fileName, null)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

