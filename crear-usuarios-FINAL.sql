-- Script completo para crear usuarios
-- Ejecuta este script completo en Supabase SQL Editor

-- Paso 1: Configurar secuencia para users (si no existe)
DO $$
BEGIN
  -- Eliminar secuencia si existe (por si acaso)
  DROP SEQUENCE IF EXISTS users_id_seq;
  
  -- Crear secuencia
  CREATE SEQUENCE users_id_seq OWNED BY users.id;
  
  -- Configurar DEFAULT
  ALTER TABLE users ALTER COLUMN id SET DEFAULT nextval('users_id_seq');
  
  -- Establecer el valor inicial basado en el máximo ID existente
  PERFORM setval('users_id_seq', COALESCE((SELECT MAX(id) FROM users), 0) + 1, false);
END $$;

-- Paso 2: Eliminar usuarios existentes si quieres empezar de nuevo (descomenta si es necesario)
-- DELETE FROM users;

-- Paso 3: Insertar usuarios especificando los IDs manualmente
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

-- Paso 4: Actualizar la secuencia para que el próximo ID sea 5
SELECT setval('users_id_seq', 5, false);

-- Paso 5: Verificar que los usuarios se crearon correctamente
SELECT id, username, role, school_name FROM users ORDER BY id;
