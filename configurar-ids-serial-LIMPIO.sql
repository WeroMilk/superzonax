-- Configurar secuencias para cada tabla
-- Esto permite que los IDs se generen automáticamente

-- Tabla users
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_sequences WHERE sequencename = 'users_id_seq') THEN
    CREATE SEQUENCE users_id_seq OWNED BY users.id;
    ALTER TABLE users ALTER COLUMN id SET DEFAULT nextval('users_id_seq');
    SELECT setval('users_id_seq', COALESCE((SELECT MAX(id) FROM users), 0) + 1, false);
  END IF;
END $$;

-- Tabla attendance
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_sequences WHERE sequencename = 'attendance_id_seq') THEN
    CREATE SEQUENCE attendance_id_seq OWNED BY attendance.id;
    ALTER TABLE attendance ALTER COLUMN id SET DEFAULT nextval('attendance_id_seq');
    SELECT setval('attendance_id_seq', COALESCE((SELECT MAX(id) FROM attendance), 0) + 1, false);
  END IF;
END $$;

-- Tabla consejo_tecnico
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_sequences WHERE sequencename = 'consejo_tecnico_id_seq') THEN
    CREATE SEQUENCE consejo_tecnico_id_seq OWNED BY consejo_tecnico.id;
    ALTER TABLE consejo_tecnico ALTER COLUMN id SET DEFAULT nextval('consejo_tecnico_id_seq');
    SELECT setval('consejo_tecnico_id_seq', COALESCE((SELECT MAX(id) FROM consejo_tecnico), 0) + 1, false);
  END IF;
END $$;

-- Tabla reporte_trimestral
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_sequences WHERE sequencename = 'reporte_trimestral_id_seq') THEN
    CREATE SEQUENCE reporte_trimestral_id_seq OWNED BY reporte_trimestral.id;
    ALTER TABLE reporte_trimestral ALTER COLUMN id SET DEFAULT nextval('reporte_trimestral_id_seq');
    SELECT setval('reporte_trimestral_id_seq', COALESCE((SELECT MAX(id) FROM reporte_trimestral), 0) + 1, false);
  END IF;
END $$;

-- Tabla events
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_sequences WHERE sequencename = 'events_id_seq') THEN
    CREATE SEQUENCE events_id_seq OWNED BY events.id;
    ALTER TABLE events ALTER COLUMN id SET DEFAULT nextval('events_id_seq');
    SELECT setval('events_id_seq', COALESCE((SELECT MAX(id) FROM events), 0) + 1, false);
  END IF;
END $$;

-- Tabla evidencias
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_sequences WHERE sequencename = 'evidencias_id_seq') THEN
    CREATE SEQUENCE evidencias_id_seq OWNED BY evidencias.id;
    ALTER TABLE evidencias ALTER COLUMN id SET DEFAULT nextval('evidencias_id_seq');
    SELECT setval('evidencias_id_seq', COALESCE((SELECT MAX(id) FROM evidencias), 0) + 1, false);
  END IF;
END $$;

-- Tabla documentos
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_sequences WHERE sequencename = 'documentos_id_seq') THEN
    CREATE SEQUENCE documentos_id_seq OWNED BY documentos.id;
    ALTER TABLE documentos ALTER COLUMN id SET DEFAULT nextval('documentos_id_seq');
    SELECT setval('documentos_id_seq', COALESCE((SELECT MAX(id) FROM documentos), 0) + 1, false);
  END IF;
END $$;

-- Tabla email_config
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_sequences WHERE sequencename = 'email_config_id_seq') THEN
    CREATE SEQUENCE email_config_id_seq OWNED BY email_config.id;
    ALTER TABLE email_config ALTER COLUMN id SET DEFAULT nextval('email_config_id_seq');
    SELECT setval('email_config_id_seq', COALESCE((SELECT MAX(id) FROM email_config), 0) + 1, false);
  END IF;
END $$;

-- Verificar que las secuencias se crearon correctamente
SELECT 
  schemaname,
  sequencename,
  last_value
FROM pg_sequences
WHERE sequencename LIKE '%_id_seq'
ORDER BY sequencename;
