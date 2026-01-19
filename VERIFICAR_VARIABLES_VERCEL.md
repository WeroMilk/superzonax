# 🔍 Verificar Variables de Entorno en Vercel

## Problema
Si el login no funciona en producción (superzonax.vercel.app), probablemente las variables de entorno de Supabase no están configuradas en Vercel.

## ✅ Pasos para Verificar y Configurar

### 1. Verificar Variables Actuales en Vercel

1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecciona tu proyecto `supzonax`
3. Ve a **Settings** → **Environment Variables**
4. Verifica que tengas estas 3 variables:

   - ✅ `NEXT_PUBLIC_SUPABASE_URL`
   - ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - ✅ `SUPABASE_SERVICE_ROLE_KEY`

### 2. Obtener las Claves Correctas de Supabase

1. Ve a [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecciona tu proyecto (el que tiene la URL `sujqmrkupfhkfgptkvxd`)
3. Ve a **Settings** (⚙️) → **API**
4. Busca la sección **Project API keys**:

   **Clave Pública (anon/public):**
   - Busca la clave que dice `anon` `public`
   - Debe empezar con `eyJ...` (es un JWT)
   - Esta es la que va en `NEXT_PUBLIC_SUPABASE_ANON_KEY`

   **Clave Secreta (service_role):**
   - Busca la clave que dice `service_role` `secret`
   - También debe empezar con `eyJ...`
   - ⚠️ **MUY IMPORTANTE**: Esta clave es secreta, no la compartas
   - Esta es la que va en `SUPABASE_SERVICE_ROLE_KEY`

### 3. Configurar Variables en Vercel

Si no tienes las variables o están incorrectas:

1. En Vercel Dashboard → Settings → Environment Variables
2. Haz clic en **Add New**
3. Agrega cada variable:

   **Variable 1:**
   ```
   Key: NEXT_PUBLIC_SUPABASE_URL
   Value: https://sujqmrkupfhkfgptkvxd.supabase.co
   Environments: ✅ Production, ✅ Preview, ✅ Development
   ```

   **Variable 2:**
   ```
   Key: NEXT_PUBLIC_SUPABASE_ANON_KEY
   Value: [Pega aquí la clave anon/public de Supabase]
   Environments: ✅ Production, ✅ Preview, ✅ Development
   ```

   **Variable 3:**
   ```
   Key: SUPABASE_SERVICE_ROLE_KEY
   Value: [Pega aquí la clave service_role de Supabase]
   Environments: ✅ Production, ✅ Preview, ✅ Development
   ```

4. Haz clic en **Save** para cada variable

### 4. Hacer un Nuevo Deploy

Después de agregar/actualizar las variables:

1. Ve a **Deployments** en Vercel
2. Haz clic en los **3 puntos** (⋯) del último deployment
3. Selecciona **Redeploy**
4. O simplemente haz un nuevo push a tu repositorio

### 5. Verificar que Funciona

Después del deploy:

1. Ve a tu aplicación: https://superzonax.vercel.app
2. Intenta iniciar sesión con:
   - Usuario: `supzonax`
   - Contraseña: `admin`

3. Si funciona, ¡listo! ✅
4. Si no funciona, revisa los logs de Vercel:
   - Ve a **Deployments** → Selecciona el último deployment
   - Haz clic en **View Function Logs**
   - Busca errores relacionados con Supabase

## 🔧 Verificar Variables desde el Código

También puedes crear un endpoint de prueba temporal para verificar las variables:

```typescript
// app/api/test-supabase/route.ts
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const hasAnonKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const hasServiceKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY
  
  // Probar conexión
  let connectionTest = 'No configurado'
  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('id')
      .limit(1)
    
    if (error) {
      connectionTest = `Error: ${error.message}`
    } else {
      connectionTest = '✅ Conectado correctamente'
    }
  } catch (err: any) {
    connectionTest = `Error: ${err.message}`
  }
  
  return NextResponse.json({
    supabaseUrl,
    hasAnonKey,
    hasServiceKey,
    connectionTest,
    // ⚠️ NO incluyas las claves reales en la respuesta
  })
}
```

Luego visita: `https://superzonax.vercel.app/api/test-supabase`

## ⚠️ Problemas Comunes

### Las claves tienen formato diferente
Si las claves en Supabase empiezan con `sb_` en lugar de `eyJ`, son válidas. Úsalas tal cual.

### Las variables no se aplican después del deploy
- Asegúrate de haber seleccionado todos los ambientes (Production, Preview, Development)
- Haz un nuevo deploy después de agregar las variables
- Espera unos minutos para que Vercel procese los cambios

### Error "Invalid API key"
- Verifica que copiaste las claves completas (son muy largas)
- Asegúrate de no tener espacios al inicio o final
- Verifica que estás usando la clave correcta (anon vs service_role)

## 📝 Nota Importante

Las variables que empiezan con `NEXT_PUBLIC_` son públicas y se exponen al cliente.
Las variables sin ese prefijo (como `SUPABASE_SERVICE_ROLE_KEY`) son secretas y solo están disponibles en el servidor.
