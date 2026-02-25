# Configurar Supabase nuevo (supabase-indigo-park) con supzonax

Tu proyecto Supabase está conectado a Vercel. Sigue estos pasos para que supzonax funcione.

## 1. Variables de entorno en Vercel

Supzonax necesita **solo 3 variables**. En el panel de Vercel, agrega o verifica:

| Variable | Valor | Dónde obtenerlo |
|----------|-------|------------------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL de tu proyecto | Supabase → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave anónima pública | Supabase → Settings → API → anon public |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave de servicio (secreta) | Supabase → Settings → API → service_role |

**Importante:** Si Vercel ya tiene variables como `SUPABASE_URL` o `SUPABASE_ANON_KEY`, supzonax usa los nombres con prefijo `NEXT_PUBLIC_`. Asegúrate de tener exactamente:
- `NEXT_PUBLIC_SUPABASE_URL` (no solo SUPABASE_URL)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (no solo SUPABASE_ANON_KEY)

## 2. Crear tablas y usuarios en Supabase

1. Abre tu proyecto en **Supabase**: https://supabase.com/dashboard/project/mdqqvvnukebnfuonjaom
2. Ve a **SQL Editor**
3. Copia y pega el contenido completo de `supabase-fix.sql`
4. Ejecuta el script (Run)

Esto creará todas las tablas y los 4 usuarios con contraseñas válidas.

## 3. Redesplegar en Vercel

Después de configurar las variables:
- Vercel → tu proyecto → Deployments → Redeploy del último deployment

## 4. Probar el login

- **URL:** https://superzonax.vercel.app (o tu dominio)
- **Usuario admin:** `supzonax` / `admin`
- **Usuarios escuela:** `sec06`/`sec06`, `sec60`/`sec60`, `sec72`/`sec72`

## Verificar conexión

- `GET https://superzonax.vercel.app/api/auth/login` — estado de Supabase
- `GET https://superzonax.vercel.app/api/init-users` — usuarios en la base de datos
