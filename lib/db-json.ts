import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

const dataDir = path.join(process.cwd(), 'data');
const dbPath = path.join(dataDir, 'db.json');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
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
    created_at: string;
  }>;
  email_config: Array<{
    id: number;
    report_type: string;
    recipients: string;
    updated_at: string;
  }>;
}

function readDB(): Database {
  if (!fs.existsSync(dbPath)) {
    return {
      users: [],
      attendance: [],
      consejo_tecnico: [],
      reporte_trimestral: [],
      events: [],
      evidencias: [],
      documentos: [],
      email_config: [],
    };
  }
  const data = fs.readFileSync(dbPath, 'utf-8');
  return JSON.parse(data);
}

function writeDB(db: Database): void {
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf-8');
}

function initializeDB(): void {
  const db = readDB();
  
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
    ];
    writeDB(db);
  }
}

initializeDB();

class DB {
  private getNextId(collection: keyof Database): number {
    const db = readDB();
    const items = db[collection] as any[];
    if (items.length === 0) return 1;
    return Math.max(...items.map((item: any) => item.id)) + 1;
  }

  findUser(username: string) {
    const db = readDB();
    return db.users.find(u => u.username === username);
  }

  getUserById(id: number) {
    const db = readDB();
    return db.users.find(u => u.id === id);
  }

  findAttendance(schoolId: string, date: string) {
    const db = readDB();
    return db.attendance.find(a => a.school_id === schoolId && a.date === date);
  }

  getAllAttendance(schoolId?: string) {
    const db = readDB();
    if (schoolId) {
      return db.attendance.filter(a => a.school_id === schoolId);
    }
    return db.attendance;
  }

  createOrUpdateAttendance(schoolId: string, date: string, studentsFile: string | null, staffFile: string | null) {
    const db = readDB();
    const existing = db.attendance.findIndex(a => a.school_id === schoolId && a.date === date);
    
    const attendanceData = {
      school_id: schoolId,
      date,
      students_file: studentsFile,
      staff_file: staffFile,
      created_at: new Date().toISOString(),
    };

    if (existing >= 0) {
      db.attendance[existing] = { ...db.attendance[existing], ...attendanceData };
    } else {
      db.attendance.push({
        id: this.getNextId('attendance'),
        ...attendanceData,
      });
    }
    writeDB(db);
  }

  findConsejoTecnico(schoolId: string, month: string, year: number) {
    const db = readDB();
    return db.consejo_tecnico.find(c => c.school_id === schoolId && c.month === month && c.year === year);
  }

  getAllConsejoTecnico(schoolId?: string) {
    const db = readDB();
    if (schoolId) {
      return db.consejo_tecnico.filter(c => c.school_id === schoolId);
    }
    return db.consejo_tecnico;
  }

  createOrUpdateConsejoTecnico(schoolId: string, month: string, year: number, file: string) {
    const db = readDB();
    const existing = db.consejo_tecnico.findIndex(c => c.school_id === schoolId && c.month === month && c.year === year);
    
    const consejoData = {
      school_id: schoolId,
      month,
      year,
      file,
      created_at: new Date().toISOString(),
    };

    if (existing >= 0) {
      db.consejo_tecnico[existing] = { ...db.consejo_tecnico[existing], ...consejoData };
    } else {
      db.consejo_tecnico.push({
        id: this.getNextId('consejo_tecnico'),
        ...consejoData,
      });
    }
    writeDB(db);
  }

  findReporteTrimestral(schoolId: string, quarter: number, year: number) {
    const db = readDB();
    return db.reporte_trimestral.find(r => r.school_id === schoolId && r.quarter === quarter && r.year === year);
  }

  getAllReporteTrimestral(schoolId?: string) {
    const db = readDB();
    if (schoolId) {
      return db.reporte_trimestral.filter(r => r.school_id === schoolId);
    }
    return db.reporte_trimestral;
  }

  createOrUpdateReporteTrimestral(schoolId: string, quarter: number, year: number, file: string) {
    const db = readDB();
    const existing = db.reporte_trimestral.findIndex(r => r.school_id === schoolId && r.quarter === quarter && r.year === year);
    
    const reporteData = {
      school_id: schoolId,
      quarter,
      year,
      file,
      created_at: new Date().toISOString(),
    };

    if (existing >= 0) {
      db.reporte_trimestral[existing] = { ...db.reporte_trimestral[existing], ...reporteData };
    } else {
      db.reporte_trimestral.push({
        id: this.getNextId('reporte_trimestral'),
        ...reporteData,
      });
    }
    writeDB(db);
  }

  getAllEvents() {
    const db = readDB();
    return db.events;
  }

  createEvent(event: Omit<Database['events'][0], 'id' | 'created_at'>) {
    const db = readDB();
    const newEvent = {
      id: this.getNextId('events'),
      ...event,
      created_at: new Date().toISOString(),
    };
    db.events.push(newEvent);
    writeDB(db);
    return newEvent;
  }

  updateEvent(id: number, event: Partial<Database['events'][0]>) {
    const db = readDB();
    const index = db.events.findIndex(e => e.id === id);
    if (index >= 0) {
      db.events[index] = { ...db.events[index], ...event };
      writeDB(db);
      return db.events[index];
    }
    return null;
  }

  deleteEvent(id: number) {
    const db = readDB();
    const index = db.events.findIndex(e => e.id === id);
    if (index >= 0) {
      db.events.splice(index, 1);
      writeDB(db);
      return true;
    }
    return false;
  }

  getAllEvidencias(schoolId?: string) {
    const db = readDB();
    if (schoolId) {
      return db.evidencias.filter(e => e.school_id === schoolId);
    }
    return db.evidencias;
  }

  createEvidencia(evidencia: Omit<Database['evidencias'][0], 'id' | 'created_at'>) {
    const db = readDB();
    const newEvidencia = {
      id: this.getNextId('evidencias'),
      ...evidencia,
      created_at: new Date().toISOString(),
    };
    db.evidencias.push(newEvidencia);
    writeDB(db);
    return newEvidencia;
  }

  deleteEvidencia(id: number) {
    const db = readDB();
    const index = db.evidencias.findIndex(e => e.id === id);
    if (index >= 0) {
      db.evidencias.splice(index, 1);
      writeDB(db);
      return true;
    }
    return false;
  }

  getAllDocumentos() {
    const db = readDB();
    return db.documentos;
  }

  createDocumento(documento: Omit<Database['documentos'][0], 'id' | 'created_at'>) {
    const db = readDB();
    const newDocumento = {
      id: this.getNextId('documentos'),
      ...documento,
      created_at: new Date().toISOString(),
    };
    db.documentos.push(newDocumento);
    writeDB(db);
    return newDocumento;
  }

  deleteDocumento(id: number) {
    const db = readDB();
    const index = db.documentos.findIndex(d => d.id === id);
    if (index >= 0) {
      db.documentos.splice(index, 1);
      writeDB(db);
      return true;
    }
    return false;
  }
}

export default new DB();
