import fs from 'fs'
import bcrypt from 'bcryptjs'
import { getDataDir, getDbPath } from './vercel-utils'

const dataDir = getDataDir()
const dbPath = getDbPath()

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

interface Database {
  users: Array<{
    id: number;
    username: string;
    password: string;
    role: 'admin' | 'sec6' | 'sec60' | 'sec72';
    school_name: string;
    created_at: string;
  }>;
  attendance: Array<{
    id: number;
    school_id: string;
    date: string;
    students_file: string | null;
    staff_file: string | null;
    created_at: string;
  }>;
  consejo_tecnico: Array<{
    id: number;
    school_id: string;
    month: string;
    year: number;
    file: string;
    created_at: string;
  }>;
  reporte_trimestral: Array<{
    id: number;
    school_id: string;
    quarter: number;
    year: number;
    file: string;
    created_at: string;
  }>;
  events: Array<{
    id: number;
    title: string;
    description: string | null;
    event_type: 'evento' | 'asuelto' | 'consejo_tecnico' | 'suspension' | 'conmemoracion';
    start_date: string;
    end_date: string | null;
    school_id: string | null;
    created_by: string;
    image_path: string | null;
    created_at: string;
  }>;
  evidencias: Array<{
    id: number;
    school_id: string;
    title: string;
    description: string | null;
    file_paths: string[];
    file_types: string[];
    created_at: string;
  }>;
  documentos: Array<{
    id: number;
    title: string;
    description: string | null;
    file_path: string;
    file_type: string;
    uploaded_by: string;
    allowed_schools: string[];
    created_at: string;
  }>;
  email_config: Array<{
    id: number;
    report_type: string;
    recipients: string;
    updated_at: string;
  }>;
}

function readDB(skipInit = false): Database {
  let db: Database
  if (!fs.existsSync(dbPath)) {
    db = {
      users: [],
      attendance: [],
      consejo_tecnico: [],
      reporte_trimestral: [],
      events: [],
      evidencias: [],
      documentos: [],
      email_config: [],
    }
  } else {
    try {
      const data = fs.readFileSync(dbPath, 'utf-8')
      db = JSON.parse(data)
    } catch {
      db = {
        users: [],
        attendance: [],
        consejo_tecnico: [],
        reporte_trimestral: [],
        events: [],
        evidencias: [],
        documentos: [],
        email_config: [],
      }
    }
  }
  
  if (!skipInit && db.users.length === 0) {
    initializeDBInternal(db)
    if (fs.existsSync(dbPath)) {
      try {
        const data = fs.readFileSync(dbPath, 'utf-8')
        db = JSON.parse(data)
      } catch {
        // Ignorar error de lectura
      }
    }
  }
  
  return db
}

function writeDB(db: Database): void {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf-8')
}

function initializeDBInternal(db: Database): void {
  if (db.users.length === 0) {
    db.users = [
      {
        id: 1,
        username: 'supzonax',
        password: bcrypt.hashSync('admin', 10),
        role: 'admin',
        school_name: 'Supervisión de Zona No. 10',
        created_at: new Date().toISOString(),
      },
      {
        id: 2,
        username: 'sec06',
        password: bcrypt.hashSync('sec06', 10),
        role: 'sec6',
        school_name: 'Secundaria Técnica No. 6',
        created_at: new Date().toISOString(),
      },
      {
        id: 3,
        username: 'sec60',
        password: bcrypt.hashSync('sec60', 10),
        role: 'sec60',
        school_name: 'Secundaria Técnica No. 60',
        created_at: new Date().toISOString(),
      },
      {
        id: 4,
        username: 'sec72',
        password: bcrypt.hashSync('sec72', 10),
        role: 'sec72',
        school_name: 'Secundaria Técnica No. 72',
        created_at: new Date().toISOString(),
      },
    ]
    writeDB(db)
  }
}

const initialDb = readDB(true)
if (initialDb.users.length === 0) {
  initializeDBInternal(initialDb)
}

class DB {
  private getNextId(collection: keyof Database): number {
    const db = readDB()
    const items = db[collection] as Array<{ id: number }>
    if (items.length === 0) return 1
    return Math.max(...items.map((item) => item.id)) + 1
  }

  findUser(username: string) {
    const db = readDB()
    return db.users.find(u => u.username === username)
  }

  getUserById(id: number) {
    const db = readDB()
    return db.users.find(u => u.id === id)
  }

  findAttendance(schoolId: string, date: string) {
    const db = readDB()
    return db.attendance.find(a => a.school_id === schoolId && a.date === date)
  }

  getAllAttendance(schoolId?: string) {
    const db = readDB()
    if (schoolId) {
      return db.attendance.filter(a => a.school_id === schoolId)
    }
    return db.attendance
  }

  createOrUpdateAttendance(schoolId: string, date: string, studentsFile: string | null, staffFile: string | null) {
    const db = readDB()
    const existingIndex = db.attendance.findIndex(a => a.school_id === schoolId && a.date === date)
    
    const attendanceData = {
      school_id: schoolId,
      date,
      students_file: studentsFile,
      staff_file: staffFile,
      created_at: new Date().toISOString(),
    }

    if (existingIndex >= 0) {
      // Mantener el ID original cuando se actualiza
      const existingId = db.attendance[existingIndex].id
      db.attendance[existingIndex] = { 
        id: existingId,
        ...attendanceData 
      }
    } else {
      db.attendance.push({
        id: this.getNextId('attendance'),
        ...attendanceData,
      })
    }
    writeDB(db)
  }

  deleteAttendance(id: number) {
    const db = readDB()
    const index = db.attendance.findIndex(a => a.id === id)
    if (index >= 0) {
      db.attendance.splice(index, 1)
      writeDB(db)
      return true
    }
    return false
  }

  findConsejoTecnico(schoolId: string, month: string, year: number) {
    const db = readDB()
    return db.consejo_tecnico.find(c => c.school_id === schoolId && c.month === month && c.year === year)
  }

  getAllConsejoTecnico(schoolId?: string) {
    const db = readDB()
    if (schoolId) {
      return db.consejo_tecnico.filter(c => c.school_id === schoolId)
    }
    return db.consejo_tecnico
  }

  createOrUpdateConsejoTecnico(schoolId: string, month: string, year: number, file: string) {
    const db = readDB()
    const existingIndex = db.consejo_tecnico.findIndex(c => c.school_id === schoolId && c.month === month && c.year === year)
    
    const consejoData = {
      school_id: schoolId,
      month,
      year,
      file,
      created_at: new Date().toISOString(),
    }

    if (existingIndex >= 0) {
      // Mantener el ID original cuando se actualiza
      const existingId = db.consejo_tecnico[existingIndex].id
      db.consejo_tecnico[existingIndex] = { 
        id: existingId,
        ...consejoData 
      }
    } else {
      db.consejo_tecnico.push({
        id: this.getNextId('consejo_tecnico'),
        ...consejoData,
      })
    }
    writeDB(db)
  }

  deleteConsejoTecnico(id: number) {
    const db = readDB()
    const index = db.consejo_tecnico.findIndex(c => c.id === id)
    if (index >= 0) {
      db.consejo_tecnico.splice(index, 1)
      writeDB(db)
      return true
    }
    return false
  }

  findReporteTrimestral(schoolId: string, quarter: number, year: number) {
    const db = readDB()
    return db.reporte_trimestral.find(r => r.school_id === schoolId && r.quarter === quarter && r.year === year)
  }

  getAllReporteTrimestral(schoolId?: string) {
    const db = readDB()
    if (schoolId) {
      return db.reporte_trimestral.filter(r => r.school_id === schoolId)
    }
    return db.reporte_trimestral
  }

  createOrUpdateReporteTrimestral(schoolId: string, quarter: number, year: number, file: string) {
    const db = readDB()
    const existingIndex = db.reporte_trimestral.findIndex(r => r.school_id === schoolId && r.quarter === quarter && r.year === year)
    
    const reporteData = {
      school_id: schoolId,
      quarter,
      year,
      file,
      created_at: new Date().toISOString(),
    }

    if (existingIndex >= 0) {
      // Mantener el ID original cuando se actualiza
      const existingId = db.reporte_trimestral[existingIndex].id
      db.reporte_trimestral[existingIndex] = { 
        id: existingId,
        ...reporteData 
      }
    } else {
      db.reporte_trimestral.push({
        id: this.getNextId('reporte_trimestral'),
        ...reporteData,
      })
    }
    writeDB(db)
  }

  deleteReporteTrimestral(id: number) {
    const db = readDB()
    const index = db.reporte_trimestral.findIndex(r => r.id === id)
    if (index >= 0) {
      db.reporte_trimestral.splice(index, 1)
      writeDB(db)
      return true
    }
    return false
  }

  getAllEvents() {
    const db = readDB()
    return db.events
  }

  createEvent(event: Omit<Database['events'][0], 'id' | 'created_at'>) {
    const db = readDB()
    const newEvent = {
      id: this.getNextId('events'),
      ...event,
      created_at: new Date().toISOString(),
    }
    db.events.push(newEvent)
    writeDB(db)
    return newEvent
  }

  updateEvent(id: number, event: Partial<Database['events'][0]>) {
    const db = readDB()
    const index = db.events.findIndex(e => e.id === id)
    if (index >= 0) {
      db.events[index] = { ...db.events[index], ...event }
      writeDB(db)
      return db.events[index]
    }
    return null
  }

  deleteEvent(id: number) {
    const db = readDB()
    const index = db.events.findIndex(e => e.id === id)
    if (index >= 0) {
      db.events.splice(index, 1)
      writeDB(db)
      return true
    }
    return false
  }

  getAllEvidencias(schoolId?: string) {
    const db = readDB()
    if (schoolId) {
      return db.evidencias.filter(e => e.school_id === schoolId)
    }
    return db.evidencias
  }

  createEvidencia(evidencia: Omit<Database['evidencias'][0], 'id' | 'created_at'>) {
    const db = readDB()
    const newEvidencia = {
      id: this.getNextId('evidencias'),
      ...evidencia,
      created_at: new Date().toISOString(),
    }
    db.evidencias.push(newEvidencia)
    writeDB(db)
    return newEvidencia
  }

  deleteEvidencia(id: number) {
    const db = readDB()
    const index = db.evidencias.findIndex(e => e.id === id)
    if (index >= 0) {
      db.evidencias.splice(index, 1)
      writeDB(db)
      return true
    }
    return false
  }

  getAllDocumentos(schoolId?: string) {
    const db = readDB()
    if (schoolId) {
      return db.documentos.filter(doc => 
        doc.allowed_schools.length === 0 || doc.allowed_schools.includes(schoolId)
      )
    }
    return db.documentos
  }

  createDocumento(documento: Omit<Database['documentos'][0], 'id' | 'created_at'>) {
    const db = readDB()
    const newDocumento = {
      id: this.getNextId('documentos'),
      ...documento,
      allowed_schools: documento.allowed_schools || [],
      created_at: new Date().toISOString(),
    }
    db.documentos.push(newDocumento)
    writeDB(db)
    return newDocumento
  }

  updateDocumento(id: number, documento: Partial<Database['documentos'][0]>) {
    const db = readDB()
    const index = db.documentos.findIndex(d => d.id === id)
    if (index >= 0) {
      db.documentos[index] = { ...db.documentos[index], ...documento }
      writeDB(db)
      return db.documentos[index]
    }
    return null
  }

  deleteDocumento(id: number) {
    const db = readDB()
    const index = db.documentos.findIndex(d => d.id === id)
    if (index >= 0) {
      db.documentos.splice(index, 1)
      writeDB(db)
      return true
    }
    return false
  }
}

export default new DB()
