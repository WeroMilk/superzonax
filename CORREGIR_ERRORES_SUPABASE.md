# 🔧 Guía para Corregir Errores en Supabase

## Problema: Tablas muestran "UNRESTRICTED" y hay 9 errores

Esto es normal y esperado. Las tablas muestran "UNRESTRICTED" porque Row Level Security (RLS) está deshabilitado, lo cual es correcto para este proyecto ya que usamos la `service_role` key solo en el servidor.

## Pasos para Corregir los Errores

### 1. Ve a Supabase Dashboard → SQL Editor

1. Abre tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard)
2. En el menú lateral, haz clic en **SQL Editor**
3. Haz clic en **New query**

### 2. Ejecuta el Script de Corrección

Copia y pega el contenido completo del archivo `supabase-fix.sql` en el editor SQL y haz clic en **Run**.

Este script:
- ✅ Crea todas las tablas con la estructura correcta
- ✅ Crea los índices necesarios
- ✅ Deshabilita RLS (correcto para este proyecto)
- ✅ Verifica que todo esté configurado correctamente

### 3. Verificar que las Tablas Estén Correctas

Después de ejecutar el script, ve a **Table Editor** y verifica que todas las tablas tengan estas columnas:

#### Tabla `users`
- `id` (SERIAL PRIMARY KEY)
- `username` (TEXT UNIQUE)
- `password` (TEXT)
- `role` (TEXT con CHECK)
- `school_name` (TEXT)
- `created_at` (TIMESTAMP)

#### Tabla `attendance`
- `id` (SERIAL PRIMARY KEY)
- `school_id` (TEXT)
- `date` (TEXT)
- `students_file` (TEXT nullable)
- `staff_file` (TEXT nullable)
- `created_at` (TIMESTAMP)
- Constraint UNIQUE(school_id, date)

#### Tabla `consejo_tecnico`
- `id` (SERIAL PRIMARY KEY)
- `school_id` (TEXT)
- `month` (TEXT)
- `year` (INTEGER)
- `file` (TEXT)
- `created_at` (TIMESTAMP)
- Constraint UNIQUE(school_id, month, year)

#### Tabla `reporte_trimestral`
- `id` (SERIAL PRIMARY KEY)
- `school_id` (TEXT)
- `quarter` (INTEGER con CHECK 1-4)
- `year` (INTEGER)
- `file` (TEXT)
- `created_at` (TIMESTAMP)
- Constraint UNIQUE(school_id, quarter, year)

#### Tabla `events`
- `id` (SERIAL PRIMARY KEY)
- `title` (TEXT)
- `description` (TEXT nullable)
- `event_type` (TEXT con CHECK)
- `start_date` (TEXT)
- `end_date` (TEXT nullable)
- `school_id` (TEXT nullable)
- `created_by` (TEXT)
- `image_path` (TEXT nullable)
- `created_at` (TIMESTAMP)

#### Tabla `evidencias`
- `id` (SERIAL PRIMARY KEY)
- `school_id` (TEXT)
- `title` (TEXT)
- `description` (TEXT nullable)
- `file_paths` (TEXT[] array)
- `file_types` (TEXT[] array)
- `created_at` (TIMESTAMP)

#### Tabla `documentos`
- `id` (SERIAL PRIMARY KEY)
- `title` (TEXT)
- `description` (TEXT nullable)
- `file_path` (TEXT)
- `file_type` (TEXT)
- `uploaded_by` (TEXT)
- `allowed_schools` (TEXT[] array)
- `created_at` (TIMESTAMP)

#### Tabla `email_config`
- `id` (SERIAL PRIMARY KEY)
- `report_type` (TEXT UNIQUE)
- `recipients` (TEXT)
- `updated_at` (TIMESTAMP)

### 4. Verificar RLS (Row Level Security)

Todas las tablas deben mostrar **"RLS disabled"** o **"UNRESTRICTED"**. Esto es **CORRECTO** porque:

- Usamos la `service_role` key solo en el servidor (nunca en el cliente)
- El servidor tiene acceso completo a todas las tablas
- La autenticación se maneja en la aplicación Next.js, no en Supabase

### 5. Crear el Bucket de Storage

1. Ve a **Storage** en el menú lateral
2. Haz clic en **New bucket**
3. Nombre: `files`
4. Marca como **Public bucket** ✅
5. Haz clic en **Create bucket**

### 6. Verificar Errores Específicos

Si después de ejecutar el script todavía hay errores:

1. Ve a **Database** → **Errors** en el menú lateral
2. Revisa cada error específico
3. Los errores comunes son:
   - **Tabla no existe**: Ejecuta el script SQL de nuevo
   - **Tipo de dato incorrecto**: El script corrige esto automáticamente
   - **Constraint faltante**: El script crea todos los constraints necesarios

### 7. Probar la Conexión

Después de corregir los errores:

1. Configura las variables de entorno en Vercel (ver `CONFIGURACION_VERCEL.md`)
2. Haz un nuevo deploy
3. Intenta iniciar sesión en la aplicación
4. Los usuarios se crearán automáticamente la primera vez que inicies sesión

## ⚠️ Notas Importantes

- **RLS Disabled es CORRECTO**: No necesitas habilitar RLS porque usamos `service_role` en el servidor
- **Los usuarios se crean automáticamente**: No necesitas insertarlos manualmente en SQL
- **Storage debe ser público**: El bucket `files` debe estar marcado como público para que las imágenes se puedan ver

## 🆘 Si Aún Hay Errores

Si después de seguir estos pasos todavía hay errores:

1. Copia el mensaje de error exacto
2. Ve a **Database** → **Errors** y copia todos los errores
3. Compártelos para que pueda ayudarte a corregirlos específicamente
