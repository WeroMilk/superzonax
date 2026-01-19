-- Script completo para configurar RLS y asegurar que el login funcione
-- Ejecuta este script completo en Supabase SQL Editor

-- ============================================
-- PASO 1: Configurar RLS en todas las tablas
-- ============================================

-- Habilitar RLS en todas las tablas
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consejo_tecnico ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reporte_trimestral ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evidencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_config ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes si las hay (para evitar conflictos)
DROP POLICY IF EXISTS "Bloquear acceso público a users" ON public.users;
DROP POLICY IF EXISTS "Bloquear acceso público a attendance" ON public.attendance;
DROP POLICY IF EXISTS "Bloquear acceso público a consejo_tecnico" ON public.consejo_tecnico;
DROP POLICY IF EXISTS "Bloquear acceso público a reporte_trimestral" ON public.reporte_trimestral;
DROP POLICY IF EXISTS "Bloquear acceso público a events" ON public.events;
DROP POLICY IF EXISTS "Bloquear acceso público a evidencias" ON public.evidencias;
DROP POLICY IF EXISTS "Bloquear acceso público a documentos" ON public.documentos;
DROP POLICY IF EXISTS "Bloquear acceso público a email_config" ON public.email_config;

-- Crear políticas que bloqueen TODO acceso público
-- NOTA: El service_role_key (que usas en tu backend) bypassa RLS automáticamente,
-- así que estas políticas solo afectan acceso público/anónimo

CREATE POLICY "Bloquear acceso público a users" ON public.users
  FOR ALL USING (false);

CREATE POLICY "Bloquear acceso público a attendance" ON public.attendance
  FOR ALL USING (false);

CREATE POLICY "Bloquear acceso público a consejo_tecnico" ON public.consejo_tecnico
  FOR ALL USING (false);

CREATE POLICY "Bloquear acceso público a reporte_trimestral" ON public.reporte_trimestral
  FOR ALL USING (false);

CREATE POLICY "Bloquear acceso público a events" ON public.events
  FOR ALL USING (false);

CREATE POLICY "Bloquear acceso público a evidencias" ON public.evidencias
  FOR ALL USING (false);

CREATE POLICY "Bloquear acceso público a documentos" ON public.documentos
  FOR ALL USING (false);

CREATE POLICY "Bloquear acceso público a email_config" ON public.email_config
  FOR ALL USING (false);

-- ============================================
-- PASO 2: Asegurar que los usuarios estén correctos
-- ============================================

-- Configurar secuencia para users (si no existe)
DO $$
BEGIN
  DROP SEQUENCE IF EXISTS users_id_seq;
  CREATE SEQUENCE users_id_seq OWNED BY users.id;
  ALTER TABLE users ALTER COLUMN id SET DEFAULT nextval('users_id_seq');
  PERFORM setval('users_id_seq', COALESCE((SELECT MAX(id) FROM users), 0) + 1, false);
END $$;

-- Actualizar/Insertar usuarios con las contraseñas correctas
-- Las contraseñas son: supzonax->admin, sec06->sec06, sec60->sec60, sec72->sec72
INSERT INTO users (id, username, password, role, school_name) VALUES
  (1, 'supzonax', '$2a$10$kCrOvMxZg6ogp1jxEq06QuPcETIHPZGVvpEXdPTNeclQSVcZuk5S.', 'admin', 'Supervisión de Zona No. 10'),
  (2, 'sec06', '$2a$10$2tCN3.RrhMx2X2lJHgwcv.ppdykBYM8hhg2UAR4X5Kh9TR4HDHDAa', 'sec6', 'Secundaria Técnica No. 6'),
  (3, 'sec60', '$2a$10$l3qX2Ms3ejOfnYdVRjMMEOQLLm0IRs3FYJcmA0tOFVUjsUC8rBSkq', 'sec60', 'Secundaria Técnica No. 60'),
  (4, 'sec72', '$2a$10$jfRD3Kl6pSiC7pHLlEw3x.vQ2DyUVfmQx/RbUOeav8V.CpF3KP3Qi', 'sec72', 'Secundaria Técnica No. 72')
ON CONFLICT (id) DO UPDATE SET
  username = EXCLUDED.username,
  password = EXCLUDED.password,
  role = EXCLUDED.role,
  school_name = EXCLUDED.school_name;

-- Actualizar la secuencia
SELECT setval('users_id_seq', 5, false);

-- ============================================
-- PASO 3: Verificar que todo esté correcto
-- ============================================

-- Verificar usuarios
SELECT id, username, role, school_name FROM users ORDER BY id;

-- Verificar que RLS está habilitado
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('users', 'attendance', 'consejo_tecnico', 'reporte_trimestral', 'events', 'evidencias', 'documentos', 'email_config');
