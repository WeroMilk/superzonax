import { supabaseAdmin } from './supabase'
import bcrypt from 'bcryptjs'

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
  const { data: existingUsers } = await supabaseAdmin
    .from('users')
    .select('id')
    .limit(1)
  
  if (!existingUsers || existingUsers.length === 0) {
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

    await supabaseAdmin.from('users').insert(defaultUsers)
  }
}

// Inicializar usuarios al importar (solo una vez)
let initialized = false
if (!initialized) {
  initialized = true
  initializeUsers().catch(console.error)
}

class SupabaseDB {
  private async getNextId(table: string): Promise<number> {
    const { data, error } = await supabaseAdmin
      .from(table)
      .select('id')
      .order('id', { ascending: false })
      .limit(1)
    
    if (error || !data || data.length === 0) return 1
    return (data[0].id as number) + 1
  }

  async findUser(username: string): Promise<User | undefined> {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('username', username)
      .single()
    
    if (error || !data) return undefined
    return data as User
  }

  async getUserById(id: number): Promise<User | undefined> {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error || !data) return undefined
    return data as User
  }

  async findAttendance(schoolId: string, date: string): Promise<Attendance | undefined> {
    const { data, error } = await supabaseAdmin
      .from('attendance')
      .select('*')
      .eq('school_id', schoolId)
      .eq('date', date)
      .single()
    
    if (error || !data) return undefined
    return data as Attendance
  }

  async getAllAttendance(schoolId?: string): Promise<Attendance[]> {
    let query = supabaseAdmin.from('attendance').select('*')
    
    if (schoolId) {
      query = query.eq('school_id', schoolId)
    }
    
    const { data, error } = await query
    
    if (error || !data) return []
    return data as Attendance[]
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
      await supabaseAdmin
        .from('attendance')
        .update(attendanceData)
        .eq('id', existing.id)
    } else {
      const id = await this.getNextId('attendance')
      await supabaseAdmin
        .from('attendance')
        .insert({ id, ...attendanceData })
    }
  }

  async deleteAttendance(id: number): Promise<boolean> {
    const { error } = await supabaseAdmin
      .from('attendance')
      .delete()
      .eq('id', id)
    
    return !error
  }

  async findConsejoTecnico(schoolId: string, month: string, year: number): Promise<ConsejoTecnico | undefined> {
    const { data, error } = await supabaseAdmin
      .from('consejo_tecnico')
      .select('*')
      .eq('school_id', schoolId)
      .eq('month', month)
      .eq('year', year)
      .single()
    
    if (error || !data) return undefined
    return data as ConsejoTecnico
  }

  async getAllConsejoTecnico(schoolId?: string): Promise<ConsejoTecnico[]> {
    let query = supabaseAdmin.from('consejo_tecnico').select('*')
    
    if (schoolId) {
      query = query.eq('school_id', schoolId)
    }
    
    const { data, error } = await query
    
    if (error || !data) return []
    return data as ConsejoTecnico[]
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
      await supabaseAdmin
        .from('consejo_tecnico')
        .update(consejoData)
        .eq('id', existing.id)
    } else {
      const id = await this.getNextId('consejo_tecnico')
      await supabaseAdmin
        .from('consejo_tecnico')
        .insert({ id, ...consejoData })
    }
  }

  async deleteConsejoTecnico(id: number): Promise<boolean> {
    const { error } = await supabaseAdmin
      .from('consejo_tecnico')
      .delete()
      .eq('id', id)
    
    return !error
  }

  async findReporteTrimestral(schoolId: string, quarter: number, year: number): Promise<ReporteTrimestral | undefined> {
    const { data, error } = await supabaseAdmin
      .from('reporte_trimestral')
      .select('*')
      .eq('school_id', schoolId)
      .eq('quarter', quarter)
      .eq('year', year)
      .single()
    
    if (error || !data) return undefined
    return data as ReporteTrimestral
  }

  async getAllReporteTrimestral(schoolId?: string): Promise<ReporteTrimestral[]> {
    let query = supabaseAdmin.from('reporte_trimestral').select('*')
    
    if (schoolId) {
      query = query.eq('school_id', schoolId)
    }
    
    const { data, error } = await query
    
    if (error || !data) return []
    return data as ReporteTrimestral[]
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
      await supabaseAdmin
        .from('reporte_trimestral')
        .update(reporteData)
        .eq('id', existing.id)
    } else {
      const id = await this.getNextId('reporte_trimestral')
      await supabaseAdmin
        .from('reporte_trimestral')
        .insert({ id, ...reporteData })
    }
  }

  async deleteReporteTrimestral(id: number): Promise<boolean> {
    const { error } = await supabaseAdmin
      .from('reporte_trimestral')
      .delete()
      .eq('id', id)
    
    return !error
  }

  async getAllEvents(): Promise<Event[]> {
    const { data, error } = await supabaseAdmin
      .from('events')
      .select('*')
    
    if (error || !data) return []
    return data as Event[]
  }

  async createEvent(event: Omit<Event, 'id' | 'created_at'>): Promise<Event> {
    const id = await this.getNextId('events')
    const newEvent: Event = {
      id,
      ...event,
      created_at: new Date().toISOString(),
    }
    
    await supabaseAdmin.from('events').insert(newEvent)
    return newEvent
  }

  async updateEvent(id: number, event: Partial<Event>): Promise<Event | null> {
    const { data, error } = await supabaseAdmin
      .from('events')
      .update(event)
      .eq('id', id)
      .select()
      .single()
    
    if (error || !data) return null
    return data as Event
  }

  async deleteEvent(id: number): Promise<boolean> {
    const { error } = await supabaseAdmin
      .from('events')
      .delete()
      .eq('id', id)
    
    return !error
  }

  async getAllEvidencias(schoolId?: string): Promise<Evidencia[]> {
    let query = supabaseAdmin.from('evidencias').select('*')
    
    if (schoolId) {
      query = query.eq('school_id', schoolId)
    }
    
    const { data, error } = await query
    
    if (error || !data) return []
    return data as Evidencia[]
  }

  async createEvidencia(evidencia: Omit<Evidencia, 'id' | 'created_at'>): Promise<Evidencia> {
    const id = await this.getNextId('evidencias')
    const newEvidencia: Evidencia = {
      id,
      ...evidencia,
      created_at: new Date().toISOString(),
    }
    
    await supabaseAdmin.from('evidencias').insert(newEvidencia)
    return newEvidencia
  }

  async deleteEvidencia(id: number): Promise<boolean> {
    const { error } = await supabaseAdmin
      .from('evidencias')
      .delete()
      .eq('id', id)
    
    return !error
  }

  async getAllDocumentos(schoolId?: string): Promise<Documento[]> {
    const { data, error } = await supabaseAdmin
      .from('documentos')
      .select('*')
    
    if (error || !data) return []
    
    const allDocs = data as Documento[]
    
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
    
    await supabaseAdmin.from('documentos').insert(newDocumento)
    return newDocumento
  }

  async updateDocumento(id: number, documento: Partial<Documento>): Promise<Documento | null> {
    const { data, error } = await supabaseAdmin
      .from('documentos')
      .update(documento)
      .eq('id', id)
      .select()
      .single()
    
    if (error || !data) return null
    return data as Documento
  }

  async deleteDocumento(id: number): Promise<boolean> {
    const { error } = await supabaseAdmin
      .from('documentos')
      .delete()
      .eq('id', id)
    
    return !error
  }

  async getEmailConfig(reportType: string): Promise<EmailConfig | null> {
    const { data, error } = await supabaseAdmin
      .from('email_config')
      .select('*')
      .eq('report_type', reportType)
      .single()
    
    if (error || !data) return null
    return data as EmailConfig
  }

  async updateEmailConfig(reportType: string, recipients: string): Promise<void> {
    const existing = await this.getEmailConfig(reportType)
    const configData = {
      report_type: reportType,
      recipients,
      updated_at: new Date().toISOString(),
    }

    if (existing) {
      await supabaseAdmin
        .from('email_config')
        .update(configData)
        .eq('id', existing.id)
    } else {
      const id = await this.getNextId('email_config')
      await supabaseAdmin
        .from('email_config')
        .insert({ id, ...configData })
    }
  }
}

export default new SupabaseDB()
