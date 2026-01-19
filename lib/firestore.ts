import { db } from './firebase'
import bcrypt from 'bcryptjs'
import { FieldValue } from 'firebase-admin/firestore'

interface User {
  id: number;
  username: string;
  password: string;
  role: 'admin' | 'sec6' | 'sec60' | 'sec72';
  school_name: string;
  created_at: string;
}

interface Attendance {
  id: number;
  school_id: string;
  date: string;
  students_file: string | null;
  staff_file: string | null;
  created_at: string;
}

interface ConsejoTecnico {
  id: number;
  school_id: string;
  month: string;
  year: number;
  file: string;
  created_at: string;
}

interface ReporteTrimestral {
  id: number;
  school_id: string;
  quarter: number;
  year: number;
  file: string;
  created_at: string;
}

interface Event {
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
}

interface Evidencia {
  id: number;
  school_id: string;
  title: string;
  description: string | null;
  file_paths: string[];
  file_types: string[];
  created_at: string;
}

interface Documento {
  id: number;
  title: string;
  description: string | null;
  file_path: string;
  file_type: string;
  uploaded_by: string;
  allowed_schools: string[];
  created_at: string;
}

interface EmailConfig {
  id: number;
  report_type: string;
  recipients: string;
  updated_at: string;
}

// Inicializar usuarios por defecto si no existen
async function initializeUsers() {
  const usersRef = db.collection('users')
  const snapshot = await usersRef.limit(1).get()
  
  if (snapshot.empty) {
    const defaultUsers = [
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

    const batch = db.batch()
    defaultUsers.forEach(user => {
      const docRef = usersRef.doc(user.id.toString())
      batch.set(docRef, user)
    })
    await batch.commit()
  }
}

// Inicializar usuarios al importar
initializeUsers().catch(console.error)

class FirestoreDB {
  private async getNextId(collection: string): Promise<number> {
    const snapshot = await db.collection(collection).orderBy('id', 'desc').limit(1).get()
    if (snapshot.empty) return 1
    const lastDoc = snapshot.docs[0].data()
    return (lastDoc.id as number) + 1
  }

  async findUser(username: string): Promise<User | undefined> {
    const snapshot = await db.collection('users').where('username', '==', username).limit(1).get()
    if (snapshot.empty) return undefined
    return snapshot.docs[0].data() as User
  }

  async getUserById(id: number): Promise<User | undefined> {
    const doc = await db.collection('users').doc(id.toString()).get()
    if (!doc.exists) return undefined
    return doc.data() as User
  }

  async findAttendance(schoolId: string, date: string): Promise<Attendance | undefined> {
    const snapshot = await db.collection('attendance')
      .where('school_id', '==', schoolId)
      .where('date', '==', date)
      .limit(1)
      .get()
    if (snapshot.empty) return undefined
    return snapshot.docs[0].data() as Attendance
  }

  async getAllAttendance(schoolId?: string): Promise<Attendance[]> {
    let query: FirebaseFirestore.Query = db.collection('attendance')
    if (schoolId) {
      query = query.where('school_id', '==', schoolId)
    }
    const snapshot = await query.get()
    return snapshot.docs.map(doc => doc.data() as Attendance)
  }

  async createOrUpdateAttendance(schoolId: string, date: string, studentsFile: string | null, staffFile: string | null) {
    const existing = await this.findAttendance(schoolId, date)
    
    const attendanceData = {
      school_id: schoolId,
      date,
      students_file: studentsFile,
      staff_file: staffFile,
      created_at: new Date().toISOString(),
    }

    if (existing) {
      await db.collection('attendance').doc(existing.id.toString()).update(attendanceData)
    } else {
      const id = await this.getNextId('attendance')
      await db.collection('attendance').doc(id.toString()).set({
        id,
        ...attendanceData,
      })
    }
  }

  async deleteAttendance(id: number): Promise<boolean> {
    try {
      await db.collection('attendance').doc(id.toString()).delete()
      return true
    } catch {
      return false
    }
  }

  async findConsejoTecnico(schoolId: string, month: string, year: number): Promise<ConsejoTecnico | undefined> {
    const snapshot = await db.collection('consejo_tecnico')
      .where('school_id', '==', schoolId)
      .where('month', '==', month)
      .where('year', '==', year)
      .limit(1)
      .get()
    if (snapshot.empty) return undefined
    return snapshot.docs[0].data() as ConsejoTecnico
  }

  async getAllConsejoTecnico(schoolId?: string): Promise<ConsejoTecnico[]> {
    let query: FirebaseFirestore.Query = db.collection('consejo_tecnico')
    if (schoolId) {
      query = query.where('school_id', '==', schoolId)
    }
    const snapshot = await query.get()
    return snapshot.docs.map(doc => doc.data() as ConsejoTecnico)
  }

  async createOrUpdateConsejoTecnico(schoolId: string, month: string, year: number, file: string) {
    const existing = await this.findConsejoTecnico(schoolId, month, year)
    
    const consejoData = {
      school_id: schoolId,
      month,
      year,
      file,
      created_at: new Date().toISOString(),
    }

    if (existing) {
      await db.collection('consejo_tecnico').doc(existing.id.toString()).update(consejoData)
    } else {
      const id = await this.getNextId('consejo_tecnico')
      await db.collection('consejo_tecnico').doc(id.toString()).set({
        id,
        ...consejoData,
      })
    }
  }

  async deleteConsejoTecnico(id: number): Promise<boolean> {
    try {
      await db.collection('consejo_tecnico').doc(id.toString()).delete()
      return true
    } catch {
      return false
    }
  }

  async findReporteTrimestral(schoolId: string, quarter: number, year: number): Promise<ReporteTrimestral | undefined> {
    const snapshot = await db.collection('reporte_trimestral')
      .where('school_id', '==', schoolId)
      .where('quarter', '==', quarter)
      .where('year', '==', year)
      .limit(1)
      .get()
    if (snapshot.empty) return undefined
    return snapshot.docs[0].data() as ReporteTrimestral
  }

  async getAllReporteTrimestral(schoolId?: string): Promise<ReporteTrimestral[]> {
    let query: FirebaseFirestore.Query = db.collection('reporte_trimestral')
    if (schoolId) {
      query = query.where('school_id', '==', schoolId)
    }
    const snapshot = await query.get()
    return snapshot.docs.map(doc => doc.data() as ReporteTrimestral)
  }

  async createOrUpdateReporteTrimestral(schoolId: string, quarter: number, year: number, file: string) {
    const existing = await this.findReporteTrimestral(schoolId, quarter, year)
    
    const reporteData = {
      school_id: schoolId,
      quarter,
      year,
      file,
      created_at: new Date().toISOString(),
    }

    if (existing) {
      await db.collection('reporte_trimestral').doc(existing.id.toString()).update(reporteData)
    } else {
      const id = await this.getNextId('reporte_trimestral')
      await db.collection('reporte_trimestral').doc(id.toString()).set({
        id,
        ...reporteData,
      })
    }
  }

  async deleteReporteTrimestral(id: number): Promise<boolean> {
    try {
      await db.collection('reporte_trimestral').doc(id.toString()).delete()
      return true
    } catch {
      return false
    }
  }

  async getAllEvents(): Promise<Event[]> {
    const snapshot = await db.collection('events').get()
    return snapshot.docs.map(doc => doc.data() as Event)
  }

  async createEvent(event: Omit<Event, 'id' | 'created_at'>): Promise<Event> {
    const id = await this.getNextId('events')
    const newEvent: Event = {
      id,
      ...event,
      created_at: new Date().toISOString(),
    }
    await db.collection('events').doc(id.toString()).set(newEvent)
    return newEvent
  }

  async updateEvent(id: number, event: Partial<Event>): Promise<Event | null> {
    try {
      await db.collection('events').doc(id.toString()).update(event)
      const doc = await db.collection('events').doc(id.toString()).get()
      return doc.data() as Event
    } catch {
      return null
    }
  }

  async deleteEvent(id: number): Promise<boolean> {
    try {
      await db.collection('events').doc(id.toString()).delete()
      return true
    } catch {
      return false
    }
  }

  async getAllEvidencias(schoolId?: string): Promise<Evidencia[]> {
    let query: FirebaseFirestore.Query = db.collection('evidencias')
    if (schoolId) {
      query = query.where('school_id', '==', schoolId)
    }
    const snapshot = await query.get()
    return snapshot.docs.map(doc => doc.data() as Evidencia)
  }

  async createEvidencia(evidencia: Omit<Evidencia, 'id' | 'created_at'>): Promise<Evidencia> {
    const id = await this.getNextId('evidencias')
    const newEvidencia: Evidencia = {
      id,
      ...evidencia,
      created_at: new Date().toISOString(),
    }
    await db.collection('evidencias').doc(id.toString()).set(newEvidencia)
    return newEvidencia
  }

  async deleteEvidencia(id: number): Promise<boolean> {
    try {
      await db.collection('evidencias').doc(id.toString()).delete()
      return true
    } catch {
      return false
    }
  }

  async getAllDocumentos(schoolId?: string): Promise<Documento[]> {
    let query: FirebaseFirestore.Query = db.collection('documentos')
    const snapshot = await query.get()
    const allDocs = snapshot.docs.map(doc => doc.data() as Documento)
    
    if (schoolId) {
      return allDocs.filter(doc => 
        doc.allowed_schools.length === 0 || doc.allowed_schools.includes(schoolId)
      )
    }
    return allDocs
  }

  async createDocumento(documento: Omit<Documento, 'id' | 'created_at'>): Promise<Documento> {
    const id = await this.getNextId('documentos')
    const newDocumento: Documento = {
      id,
      ...documento,
      allowed_schools: documento.allowed_schools || [],
      created_at: new Date().toISOString(),
    }
    await db.collection('documentos').doc(id.toString()).set(newDocumento)
    return newDocumento
  }

  async updateDocumento(id: number, documento: Partial<Documento>): Promise<Documento | null> {
    try {
      await db.collection('documentos').doc(id.toString()).update(documento)
      const doc = await db.collection('documentos').doc(id.toString()).get()
      return doc.data() as Documento
    } catch {
      return null
    }
  }

  async deleteDocumento(id: number): Promise<boolean> {
    try {
      await db.collection('documentos').doc(id.toString()).delete()
      return true
    } catch {
      return false
    }
  }

  async getEmailConfig(reportType: string): Promise<EmailConfig | null> {
    const snapshot = await db.collection('email_config')
      .where('report_type', '==', reportType)
      .limit(1)
      .get()
    if (snapshot.empty) return null
    return snapshot.docs[0].data() as EmailConfig
  }

  async updateEmailConfig(reportType: string, recipients: string): Promise<void> {
    const existing = await this.getEmailConfig(reportType)
    const configData = {
      report_type: reportType,
      recipients,
      updated_at: new Date().toISOString(),
    }

    if (existing) {
      await db.collection('email_config').doc(existing.id.toString()).update(configData)
    } else {
      const id = await this.getNextId('email_config')
      await db.collection('email_config').doc(id.toString()).set({
        id,
        ...configData,
      })
    }
  }
}

export default new FirestoreDB()
