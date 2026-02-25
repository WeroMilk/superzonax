# Diagnóstico: Login no funciona

## Paso 1: Verificar conexión y usuarios

Visita (reemplaza con tu dominio real):

```
https://superzonax.vercel.app/api/auth/login
```

Deberías ver un JSON con:
- `supabaseConfig.configured`: true
- `connectionTest.status`: "success"
- `connectionTest.usersFound`: 4
- `connectionTest.usernames`: ["supzonax", "sec06", "sec60", "sec72"]

**Si `usersFound` es 0:** Los usuarios no están en la base de datos. Ejecuta `crear-usuarios-FINAL.sql` en Supabase SQL Editor.

**Si `connectionTest.status` es "error":** Las variables de Vercel apuntan a otro proyecto o las claves son incorrectas.

## Paso 2: Variables en Vercel

El proyecto ahora acepta estos nombres (usa los que tenga tu integración Supabase):

| Variable que busca supzonax | Alternativas que también funcionan |
|----------------------------|-------------------------------------|
| NEXT_PUBLIC_SUPABASE_URL | SUPABASE_URL |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | SUPABASE_ANON_KEY, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY |
| SUPABASE_SERVICE_ROLE_KEY | SUPABASE_SECRET_KEY |

**Importante:** La URL debe ser de tu proyecto `supabase-indigo-park` (mdqqvvnukebnfuonjaom):
```
https://mdqqvvnukebnfuonjaom.supabase.co
```

## Paso 3: Verificar usuarios en Supabase

1. Supabase → Table Editor → tabla `users`
2. Debe haber 4 filas: supzonax, sec06, sec60, sec72
3. La columna `password` debe tener hashes largos que empiecen con `$2a$10$`

## Paso 4: Proyecto correcto

Si conectaste Supabase a Vercel desde el panel de Supabase, puede que se haya creado un proyecto nuevo. Comprueba que las variables en Vercel correspondan al proyecto donde ejecutaste `supabase-fix.sql`.
