# 🔐 Solución: No Puedo Iniciar Sesión

## Problema
No puedes iniciar sesión en la aplicación. Esto generalmente se debe a que los usuarios no se han creado en Supabase.

## Solución Rápida

### Opción 1: Crear Usuarios Manualmente (Recomendado)

1. Ve a **Supabase Dashboard** → **SQL Editor**
2. Abre el archivo `crear-usuarios.sql` en tu proyecto
3. Copia todo el contenido del archivo
4. Pégalo en el SQL Editor de Supabase
5. Haz clic en **Run**
6. Deberías ver los 4 usuarios creados

### Opción 2: Verificar que los Usuarios Existen

1. Ve a **Supabase Dashboard** → **Table Editor**
2. Selecciona la tabla `users`
3. Verifica que existan estos usuarios:
   - `supzonax` (admin)
   - `sec06` (sec6)
   - `sec60` (sec60)
   - `sec72` (sec72)

Si no existen, usa la **Opción 1**.

## Credenciales de Acceso

Una vez que los usuarios estén creados, puedes iniciar sesión con:

- **Admin**: 
  - Usuario: `supzonax`
  - Contraseña: `admin`

- **Secundaria 6**: 
  - Usuario: `sec06`
  - Contraseña: `sec06`

- **Secundaria 60**: 
  - Usuario: `sec60`
  - Contraseña: `sec60`

- **Secundaria 72**: 
  - Usuario: `sec72`
  - Contraseña: `sec72`

## Verificar Variables de Entorno

Si después de crear los usuarios aún no puedes iniciar sesión, verifica que las variables de entorno estén configuradas en Vercel:

1. Ve a **Vercel Dashboard** → Tu proyecto → **Settings** → **Environment Variables**
2. Verifica que existan estas variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
3. Si faltan, agrégalas según `CONFIGURACION_VERCEL.md`
4. Haz un nuevo deploy después de agregar las variables

## Verificar Errores en la Consola

Si aún no funciona:

1. Abre la consola del navegador (F12)
2. Ve a la pestaña **Network**
3. Intenta iniciar sesión
4. Busca la petición a `/api/auth/login`
5. Haz clic en ella y revisa la respuesta
6. Si hay un error, compártelo para poder ayudarte

## Errores Comunes

### Error: "Usuario no encontrado"
- **Causa**: Los usuarios no existen en Supabase
- **Solución**: Ejecuta el script `crear-usuarios.sql`

### Error: "Contraseña incorrecta"
- **Causa**: El hash de la contraseña no coincide
- **Solución**: Ejecuta el script `crear-usuarios.sql` de nuevo (actualiza los usuarios)

### Error: "Error al procesar el login"
- **Causa**: Problema de conexión con Supabase o variables de entorno incorrectas
- **Solución**: 
  1. Verifica las variables de entorno en Vercel
  2. Verifica que la tabla `users` exista en Supabase
  3. Verifica que RLS esté deshabilitado (debe mostrar "UNRESTRICTED")

## Próximos Pasos

Después de crear los usuarios:

1. Intenta iniciar sesión con `supzonax` / `admin`
2. Si funciona, los demás usuarios también deberían funcionar
3. Si no funciona, comparte el error específico que aparece
