# Configuración de Supabase para Sup Zona X

Este proyecto usa **Supabase** para almacenar datos (PostgreSQL) y archivos (Storage). Supabase es una excelente alternativa gratuita a Firebase.

## 🎯 ¿Por qué Supabase?

- ✅ **100% Gratis** para proyectos pequeños/medianos
- ✅ **500MB de base de datos** PostgreSQL
- ✅ **1GB de almacenamiento** de archivos
- ✅ **2GB de transferencia** mensual
- ✅ **PostgreSQL** (más potente que Firestore)
- ✅ **Storage integrado** con URLs públicas
- ✅ **Muy fácil de usar** y configurar
- ✅ **Dashboard visual** para gestionar datos

## 📋 Pasos para Configurar Supabase

### 1. Crear una Cuenta en Supabase

1. Ve a [supabase.com](https://supabase.com)
2. Haz clic en "Start your project"
3. Inicia sesión con GitHub (recomendado) o crea una cuenta

### 2. Crear un Nuevo Proyecto

1. Haz clic en "New Project"
2. Completa el formulario:
   - **Name**: `supzonax` (o el nombre que prefieras)
   - **Database Password**: Crea una contraseña segura (guárdala bien)
   - **Region**: Elige la más cercana (ej: `South America (São Paulo)`)
   - **Pricing Plan**: Selecciona **Free**
3. Haz clic en "Create new project"
4. Espera 2-3 minutos mientras se crea el proyecto

### 3. Obtener las Credenciales

Una vez creado el proyecto:

1. Ve a **Settings** (ícono de engranaje) → **API**
2. Encontrarás:
   - **Project URL**: Algo como `https://xxxxx.supabase.co`
   - **anon/public key**: Una clave larga que empieza con `eyJ...`
   - **service_role key**: Otra clave larga (⚠️ **MANTÉN ESTA SECRETA**)

### 4. Crear el Bucket de Storage

1. Ve a **Storage** en el menú lateral
2. Haz clic en "New bucket"
3. Configura:
   - **Name**: `files`
   - **Public bucket**: ✅ **Marcar como público** (para que los archivos sean accesibles)
4. Haz clic en "Create bucket"

### 5. Crear las Tablas en la Base de Datos

Ve a **SQL Editor** en el menú lateral y ejecuta este script:

```sql
-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'sec6', 'sec60', 'sec72')),
  school_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de asistencia diaria
CREATE TABLE IF NOT EXISTS attendance (
  id INTEGER PRIMARY KEY,
  school_id TEXT NOT NULL,
  date TEXT NOT NULL,
  students_file TEXT,
  staff_file TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(school_id, date)
);

-- Tabla de consejo técnico
CREATE TABLE IF NOT EXISTS consejo_tecnico (
  id INTEGER PRIMARY KEY,
  school_id TEXT NOT NULL,
  month TEXT NOT NULL,
  year INTEGER NOT NULL,
  file TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(school_id, month, year)
);

-- Tabla de reporte trimestral
CREATE TABLE IF NOT EXISTS reporte_trimestral (
  id INTEGER PRIMARY KEY,
  school_id TEXT NOT NULL,
  quarter INTEGER NOT NULL CHECK (quarter BETWEEN 1 AND 4),
  year INTEGER NOT NULL,
  file TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(school_id, quarter, year)
);

-- Tabla de eventos
CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY,
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
  id INTEGER PRIMARY KEY,
  school_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  file_paths TEXT[] DEFAULT '{}',
  file_types TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de documentos
CREATE TABLE IF NOT EXISTS documentos (
  id INTEGER PRIMARY KEY,
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
  id INTEGER PRIMARY KEY,
  report_type TEXT UNIQUE NOT NULL,
  recipients TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_attendance_school_date ON attendance(school_id, date);
CREATE INDEX IF NOT EXISTS idx_consejo_school_month_year ON consejo_tecnico(school_id, month, year);
CREATE INDEX IF NOT EXISTS idx_reporte_school_quarter_year ON reporte_trimestral(school_id, quarter, year);
CREATE INDEX IF NOT EXISTS idx_evidencias_school ON evidencias(school_id);
CREATE INDEX IF NOT EXISTS idx_events_start_date ON events(start_date);
```

### 6. Configurar Políticas de Seguridad (RLS)

Por defecto, Supabase usa Row Level Security (RLS). Para este proyecto, vamos a permitir acceso completo desde el servidor usando la service_role key.

Ve a **SQL Editor** y ejecuta:

```sql
-- Deshabilitar RLS para estas tablas (ya que usamos service_role en el servidor)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE attendance DISABLE ROW LEVEL SECURITY;
ALTER TABLE consejo_tecnico DISABLE ROW LEVEL SECURITY;
ALTER TABLE reporte_trimestral DISABLE ROW LEVEL SECURITY;
ALTER TABLE events DISABLE ROW LEVEL SECURITY;
ALTER TABLE evidencias DISABLE ROW LEVEL SECURITY;
ALTER TABLE documentos DISABLE ROW LEVEL SECURITY;
ALTER TABLE email_config DISABLE ROW LEVEL SECURITY;
```

**Nota**: Esto es seguro porque estamos usando la `service_role` key solo en el servidor (nunca en el cliente).

### 7. Configurar Variables de Entorno en Vercel

Ve a tu proyecto en Vercel → **Settings** → **Environment Variables** y agrega:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ... (la clave anon/public)
SUPABASE_SERVICE_ROLE_KEY=eyJ... (la clave service_role)
```

**⚠️ IMPORTANTE**:
- `NEXT_PUBLIC_SUPABASE_URL`: Tu Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: La clave `anon` o `public`
- `SUPABASE_SERVICE_ROLE_KEY`: La clave `service_role` (mantén esta secreta)

Asegúrate de seleccionar:
- ✅ Production
- ✅ Preview  
- ✅ Development

### 8. Configurar Variables de Entorno Localmente (Opcional)

Crea un archivo `.env.local` en la raíz del proyecto:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

**⚠️ IMPORTANTE**: Agrega `.env.local` a tu `.gitignore` para no subir las credenciales a GitHub.

### 9. Inicializar los Usuarios por Defecto

La primera vez que ejecutes la aplicación, se crearán automáticamente los usuarios por defecto:
- `supzonax` / `admin` (admin)
- `sec06` / `sec06` (sec6)
- `sec60` / `sec60` (sec60)
- `sec72` / `sec72` (sec72)

Esto sucede automáticamente cuando se importa `lib/supabase-db.ts`.

### 10. Verificar la Configuración

1. Haz deploy en Vercel
2. Intenta iniciar sesión con uno de los usuarios
3. Sube un archivo de prueba
4. Verifica en Supabase Dashboard que:
   - Los datos aparecen en **Table Editor**
   - Los archivos aparecen en **Storage** → **files**

## 📊 Estructura de Datos

### Tablas Creadas

- `users` - Usuarios del sistema
- `attendance` - Registros de asistencia diaria
- `consejo_tecnico` - Reportes de consejo técnico
- `reporte_trimestral` - Reportes trimestrales
- `events` - Eventos del calendario
- `evidencias` - Evidencias fotográficas
- `documentos` - Documentos del repositorio
- `email_config` - Configuración de correos

### Estructura de Archivos en Storage

Los archivos se organizan en el bucket `files` con estas carpetas:
- `attendance/` - Archivos de asistencia
- `consejo/` - Archivos de consejo técnico
- `trimestral/` - Archivos de reportes trimestrales
- `evidencias/` - Fotos de evidencias
- `documentos/` - Documentos del repositorio
- `events/` - Imágenes de eventos

## 🔧 Solución de Problemas

### Error: "Supabase no está configurado"
- Verifica que todas las variables de entorno estén configuradas en Vercel
- Asegúrate de que los nombres de las variables sean exactos (case-sensitive)

### Error: "relation does not exist"
- Ejecuta el script SQL para crear las tablas
- Verifica que estés en el proyecto correcto de Supabase

### Los archivos no se suben
- Verifica que el bucket `files` esté creado y sea público
- Revisa los logs en Vercel para ver errores específicos

### Los datos no se guardan
- Verifica que las tablas estén creadas correctamente
- Revisa que RLS esté deshabilitado o las políticas permitan acceso
- Verifica los logs en Vercel

### Error de autenticación
- Verifica que `SUPABASE_SERVICE_ROLE_KEY` sea la clave correcta (service_role, no anon)
- Asegúrate de que la clave no tenga espacios extra

## 💰 Plan Gratuito de Supabase

El plan gratuito incluye:
- ✅ **500MB** de base de datos PostgreSQL
- ✅ **1GB** de almacenamiento de archivos
- ✅ **2GB** de transferencia mensual
- ✅ **50,000 usuarios activos** mensuales
- ✅ **500MB** de transferencia de base de datos

Para este proyecto con 3 usuarios y un admin, el plan gratuito es más que suficiente.

## 🚀 Ventajas sobre Firebase

1. **PostgreSQL** vs Firestore: SQL es más potente y familiar
2. **Más generoso**: 1GB de storage vs 5GB de Firebase (pero Firebase tiene más transferencia)
3. **Open Source**: Puedes auto-hospedarlo si quieres
4. **Mejor dashboard**: Más intuitivo para gestionar datos
5. **SQL Editor**: Puedes ejecutar queries SQL directamente

## 📝 Notas Adicionales

- Los archivos se almacenan con URLs públicas, accesibles desde cualquier dispositivo
- La base de datos es PostgreSQL, puedes usar herramientas como pgAdmin si lo necesitas
- Puedes hacer backups de la base de datos desde el dashboard de Supabase
- Si necesitas más espacio, el plan Pro cuesta $25/mes y incluye mucho más

## ✅ Checklist Final

- [ ] Proyecto creado en Supabase
- [ ] Bucket `files` creado y configurado como público
- [ ] Tablas creadas con el script SQL
- [ ] RLS deshabilitado (o políticas configuradas)
- [ ] Variables de entorno configuradas en Vercel
- [ ] Deploy realizado
- [ ] Login funcionando
- [ ] Subida de archivos funcionando

¡Listo! Tu proyecto ahora usa Supabase de forma completamente gratuita. 🎉
