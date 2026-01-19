-- Script para crear usuarios manualmente en Supabase
-- Ejecuta este script en Supabase Dashboard → SQL Editor
-- Solo si los usuarios no se crearon automáticamente

-- Primero, eliminar usuarios existentes si es necesario (descomenta si quieres empezar de nuevo)
-- DELETE FROM users;

-- Crear usuarios con contraseñas hasheadas con bcrypt
-- Las contraseñas son: admin, sec06, sec60, sec72

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

-- Verificar que los usuarios se crearon correctamente
SELECT id, username, role, school_name FROM users ORDER BY id;
