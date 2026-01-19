-- Script para corregir errores y configurar Supabase correctamente
-- Ejecuta este script en Supabase Dashboard → SQL Editor

-- ============================================
-- 1. ELIMINAR TABLAS EXISTENTES (si es necesario)
-- ============================================
-- Descomenta estas líneas solo si necesitas empezar desde cero:
-- DROP TABLE IF EXISTS email_config CASCADE;
-- DROP TABLE IF EXISTS documentos CASCADE;
-- DROP TABLE IF EXISTS evidencias CASCADE;
-- DROP TABLE IF EXISTS events CASCADE;
-- DROP TABLE IF EXISTS reporte_trimestral CASCADE;
-- DROP TABLE IF EXISTS consejo_tecnico CASCADE;
-- DROP TABLE IF EXISTS attendance CASCADE;
-- DROP TABLE IF EXISTS users CASCADE;

-- ============================================
-- 2. CREAR TABLAS CON ESTRUCTURA CORRECTA
-- ============================================

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'sec6', 'sec60', 'sec72')),
  school_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de asistencia diaria
CREATE TABLE IF NOT EXISTS attendance (
  id SERIAL PRIMARY KEY,
  school_id TEXT NOT NULL,
  date TEXT NOT NULL,
  students_file TEXT,
  staff_file TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(school_id, date)
);

-- Tabla de consejo técnico
CREATE TABLE IF NOT EXISTS consejo_tecnico (
  id SERIAL PRIMARY KEY,
  school_id TEXT NOT NULL,
  month TEXT NOT NULL,
  year INTEGER NOT NULL,
  file TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(school_id, month, year)
);

-- Tabla de reporte trimestral
CREATE TABLE IF NOT EXISTS reporte_trimestral (
  id SERIAL PRIMARY KEY,
  school_id TEXT NOT NULL,
  quarter INTEGER NOT NULL CHECK (quarter BETWEEN 1 AND 4),
  year INTEGER NOT NULL,
  file TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(school_id, quarter, year)
);

-- Tabla de eventos
CREATE TABLE IF NOT EXISTS events (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT NOT NULL CHECK (event_type IN ('evento', 'asuelto', 'consejo_tecnico', 'suspension', 'conmemoracion')),
  start_date TEXT NOT NULL,
  end_date TEXT,
  school_id TEXT,
  created_by TEXT NOT NULL,
  image_path TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de evidencias
CREATE TABLE IF NOT EXISTS evidencias (
  id SERIAL PRIMARY KEY,
  school_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  file_paths TEXT[] DEFAULT '{}',
  file_types TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de documentos
CREATE TABLE IF NOT EXISTS documentos (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  uploaded_by TEXT NOT NULL,
  allowed_schools TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de configuración de email
CREATE TABLE IF NOT EXISTS email_config (
  id SERIAL PRIMARY KEY,
  report_type TEXT UNIQUE NOT NULL,
  recipients TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 3. CREAR ÍNDICES PARA MEJORAR RENDIMIENTO
-- ============================================

CREATE INDEX IF NOT EXISTS idx_attendance_school_date ON attendance(school_id, date);
CREATE INDEX IF NOT EXISTS idx_consejo_school_month_year ON consejo_tecnico(school_id, month, year);
CREATE INDEX IF NOT EXISTS idx_reporte_school_quarter_year ON reporte_trimestral(school_id, quarter, year);
CREATE INDEX IF NOT EXISTS idx_evidencias_school ON evidencias(school_id);
CREATE INDEX IF NOT EXISTS idx_events_start_date ON events(start_date);
CREATE INDEX IF NOT EXISTS idx_documentos_uploaded_by ON documentos(uploaded_by);

-- ============================================
-- 4. DESHABILITAR RLS (Row Level Security)
-- ============================================
-- Esto es seguro porque usamos service_role key solo en el servidor

ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE attendance DISABLE ROW LEVEL SECURITY;
ALTER TABLE consejo_tecnico DISABLE ROW LEVEL SECURITY;
ALTER TABLE reporte_trimestral DISABLE ROW LEVEL SECURITY;
ALTER TABLE events DISABLE ROW LEVEL SECURITY;
ALTER TABLE evidencias DISABLE ROW LEVEL SECURITY;
ALTER TABLE documentos DISABLE ROW LEVEL SECURITY;
ALTER TABLE email_config DISABLE ROW LEVEL SECURITY;

-- ============================================
-- 5. INICIALIZAR USUARIOS POR DEFECTO
-- ============================================
-- Solo si no existen usuarios

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users LIMIT 1) THEN
    INSERT INTO users (id, username, password, role, school_name) VALUES
      (1, 'supzonax', '$2a$10$rOzJqJqJqJqJqJqJqJqJqOqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJq', 'admin', 'Supervisión de Zona No. 10'),
      (2, 'sec06', '$2a$10$rOzJqJqJqJqJqJqJqJqJqOqJqJqJqJqJqJqJqJqJqJqJqJqJqJq', 'sec6', 'Secundaria Técnica No. 6'),
      (3, 'sec60', '$2a$10$rOzJqJqJqJqJqJqJqJqJqOqJqJqJqJqJqJqJqJqJqJqJqJqJqJq', 'sec60', 'Secundaria Técnica No. 60'),
      (4, 'sec72', '$2a$10$rOzJqJqJqJqJqJqJqJqJqOqJqJqJqJqJqJqJqJqJqJqJqJqJqJq', 'sec72', 'Secundaria Técnica No. 72')
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;

-- Nota: Las contraseñas se generarán automáticamente cuando se ejecute la aplicación
-- por primera vez usando bcrypt. Los valores aquí son placeholders.

-- ============================================
-- 6. VERIFICAR ESTRUCTURA
-- ============================================
-- Ejecuta esto para verificar que todo está correcto:

SELECT 
  table_name,
  CASE 
    WHEN (SELECT relrowsecurity FROM pg_class WHERE relname = table_name) THEN 'RLS ENABLED'
    ELSE 'RLS DISABLED'
  END as rls_status
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;
