# Configuración de Variables de Entorno en Vercel

## Credenciales de Supabase

Usa estas credenciales para configurar las variables de entorno en Vercel:

### Variables a Configurar

1. **NEXT_PUBLIC_SUPABASE_URL**
   ```
   https://sujqmrkupfhkfgptkvxd.supabase.co
   ```

2. **NEXT_PUBLIC_SUPABASE_ANON_KEY**
   ```
   sb_publishable_vGlkLHAcEiCHHWkZ3TNQIQ_e7RHXfRi
   ```
   ⚠️ Nota: Si esta clave no funciona, busca la clave "anon" o "public" en Supabase Dashboard → Settings → API

3. **SUPABASE_SERVICE_ROLE_KEY**
   ```
   sb_secret_nfIlA9FbgQ9ibjVuNHTtJw_Zsxg10ay
   ```
   ⚠️ Nota: Si esta clave no funciona, busca la clave "service_role" en Supabase Dashboard → Settings → API

## Pasos para Configurar en Vercel

1. Ve a tu proyecto en [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecciona tu proyecto `supzonax`
3. Ve a **Settings** → **Environment Variables**
4. Agrega cada variable una por una:

   **Variable 1:**
   - Key: `NEXT_PUBLIC_SUPABASE_URL`
   - Value: `https://sujqmrkupfhkfgptkvxd.supabase.co`
   - Environments: ✅ Production, ✅ Preview, ✅ Development

   **Variable 2:**
   - Key: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Value: `sb_publishable_vGlkLHAcEiCHHWkZ3TNQIQ_e7RHXfRi`
   - Environments: ✅ Production, ✅ Preview, ✅ Development

   **Variable 3:**
   - Key: `SUPABASE_SERVICE_ROLE_KEY`
   - Value: `sb_secret_nfIlA9FbgQ9ibjVuNHTtJw_Zsxg10ay`
   - Environments: ✅ Production, ✅ Preview, ✅ Development

5. Haz clic en **Save** para cada variable
6. Ve a **Deployments** y haz un nuevo deploy (o espera al siguiente push)

## ⚠️ Importante: Verificar las Claves Correctas

Las claves que proporcionaste tienen un formato diferente. Para asegurarte de que son las correctas:

1. Ve a [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecciona tu proyecto
3. Ve a **Settings** → **API**
4. Busca estas secciones:

   **Project API keys:**
   - `anon` `public` - Esta es la clave pública (debe empezar con `eyJ...`)
   - `service_role` `secret` - Esta es la clave secreta (debe empezar con `eyJ...`)

5. Si las claves que tienes no empiezan con `eyJ`, es posible que sean claves de una versión más reciente de Supabase. Prueba con las que tienes primero.

## Si las Claves No Funcionan

Si después de configurar las variables obtienes errores de autenticación:

1. Ve a Supabase Dashboard → Settings → API
2. Copia las claves que aparecen en la sección "Project API keys"
3. Actualiza las variables en Vercel con esas claves
4. Haz un nuevo deploy

## Verificar que Funciona

Después del deploy:

1. Intenta iniciar sesión en tu aplicación
2. Si funciona, los usuarios se crearán automáticamente
3. Intenta subir un archivo de prueba
4. Verifica en Supabase Dashboard que:
   - Los datos aparecen en **Table Editor**
   - Los archivos aparecen en **Storage** → **files**

## Configuración Local (Opcional)

Si quieres probar localmente, crea un archivo `.env.local` en la raíz del proyecto:

```env
NEXT_PUBLIC_SUPABASE_URL=https://sujqmrkupfhkfgptkvxd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_vGlkLHAcEiCHHWkZ3TNQIQ_e7RHXfRi
SUPABASE_SERVICE_ROLE_KEY=sb_secret_nfIlA9FbgQ9ibjVuNHTtJw_Zsxg10ay
```

**⚠️ IMPORTANTE**: No subas el archivo `.env.local` a GitHub. Ya está en `.gitignore`.
