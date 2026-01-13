// Script de inicialización de la base de datos
// Este script se ejecuta automáticamente cuando se inicia la aplicación
// pero puedes ejecutarlo manualmente si necesitas resetear la base de datos

const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(process.cwd(), 'data', 'supzonax.db');
const dbDir = path.dirname(dbPath);

// Asegurar que el directorio existe
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(dbPath);

// Habilitar foreign keys
db.pragma('foreign_keys = ON');

// Crear tablas
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('admin', 'sec6', 'sec60', 'sec72')),
    school_name TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    school_id TEXT NOT NULL,
    date TEXT NOT NULL,
    students_file TEXT,
    staff_file TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(school_id, date)
  );

  CREATE TABLE IF NOT EXISTS consejo_tecnico (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    school_id TEXT NOT NULL,
    month TEXT NOT NULL,
    year INTEGER NOT NULL,
    file TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(school_id, month, year)
  );

  CREATE TABLE IF NOT EXISTS reporte_trimestral (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    school_id TEXT NOT NULL,
    quarter INTEGER NOT NULL CHECK(quarter IN (1, 2, 3, 4)),
    year INTEGER NOT NULL,
    file TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(school_id, quarter, year)
  );

  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    event_type TEXT NOT NULL CHECK(event_type IN ('evento', 'asuelto', 'consejo_tecnico', 'suspension', 'conmemoracion')),
    start_date TEXT NOT NULL,
    end_date TEXT,
    school_id TEXT,
    created_by TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS evidencias (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    school_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    file_path TEXT NOT NULL,
    file_type TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS documentos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    file_path TEXT NOT NULL,
    file_type TEXT NOT NULL,
    uploaded_by TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS email_config (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    report_type TEXT NOT NULL UNIQUE,
    recipients TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Inicializar usuarios por defecto si no existen
const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
if (userCount.count === 0) {
  // Admin
  const adminPassword = bcrypt.hashSync('admin', 10);
  db.prepare(`
    INSERT INTO users (username, password, role, school_name)
    VALUES ('supzonax', ?, 'admin', 'Supervisión de Zona No. 10')
  `).run(adminPassword);
  
  // Secundaria 6
  const sec06Password = bcrypt.hashSync('sec06', 10);
  db.prepare(`
    INSERT INTO users (username, password, role, school_name)
    VALUES ('sec06', ?, 'sec6', 'Secundaria Técnica No. 6')
  `).run(sec06Password);
  
  // Secundaria 60
  const sec60Password = bcrypt.hashSync('sec60', 10);
  db.prepare(`
    INSERT INTO users (username, password, role, school_name)
    VALUES ('sec60', ?, 'sec60', 'Secundaria Técnica No. 60')
  `).run(sec60Password);
  
  // Secundaria 72
  const sec72Password = bcrypt.hashSync('sec72', 10);
  db.prepare(`
    INSERT INTO users (username, password, role, school_name)
    VALUES ('sec72', ?, 'sec72', 'Secundaria Técnica No. 72')
  `).run(sec72Password);
  
  console.log('✅ Base de datos inicializada correctamente');
  console.log('📝 Usuarios creados:');
  console.log('   - supzonax / admin');
  console.log('   - sec06 / sec06');
  console.log('   - sec60 / sec60');
  console.log('   - sec72 / sec72');
} else {
  console.log('✅ Base de datos ya existe');
}

db.close();

