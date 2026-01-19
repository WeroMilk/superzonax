# 🔐 Inicializar Usuarios en Producción

## Problema
Los usuarios no se crearon automáticamente en Supabase después del deploy.

## Solución Rápida: Usar el Endpoint API

### Opción 1: Desde el Navegador (Más Fácil)

1. Abre tu aplicación desplegada en Vercel
2. Ve a esta URL en tu navegador:
   ```
   https://tu-dominio.vercel.app/api/init-users
   ```
   O si estás en local:
   ```
   http://localhost:3000/api/init-users
   ```

3. Deberías ver un JSON con el estado de los usuarios

4. Si faltan usuarios, abre otra pestaña y ejecuta:
   ```
   POST https://tu-dominio.vercel.app/api/init-users
   ```
   
   Puedes usar una herramienta como:
   - **Postman**
   - **Thunder Client** (extensión de VS Code)
   - O ejecuta este comando en la terminal:

### Opción 2: Desde la Terminal (cURL)

```bash
curl -X POST https://tu-dominio.vercel.app/api/init-users
```

O si estás en local:

```bash
curl -X POST http://localhost:3000/api/init-users
```

### Opción 3: Desde PowerShell (Windows)

```powershell
Invoke-WebRequest -Uri "https://tu-dominio.vercel.app/api/init-users" -Method POST
```

O si estás en local:

```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/init-users" -Method POST
```

## Verificar que los Usuarios se Crearon

### Opción A: Usar el Endpoint GET

Ve a esta URL en tu navegador:
```
https://tu-dominio.vercel.app/api/init-users
```

Deberías ver algo como:
```json
{
  "success": true,
  "totalUsers": 4,
  "existingUsers": 4,
  "missingUsers": 0,
  "users": [
    { "id": 1, "username": "supzonax", "role": "admin" },
    { "id": 2, "username": "sec06", "role": "sec6" },
    { "id": 3, "username": "sec60", "role": "sec60" },
    { "id": 4, "username": "sec72", "role": "sec72" }
  ],
  "message": "Todos los usuarios existen"
}
```

### Opción B: Verificar en Supabase Dashboard

1. Ve a **Supabase Dashboard** → **Table Editor**
2. Selecciona la tabla `users`
3. Deberías ver los 4 usuarios listados

## Credenciales de Acceso

Una vez que los usuarios estén creados:

- **Admin**: `supzonax` / `admin`
- **Secundaria 6**: `sec06` / `sec06`
- **Secundaria 60**: `sec60` / `sec60`
- **Secundaria 72**: `sec72` / `sec72`

## Solución Alternativa: SQL Directo

Si el endpoint no funciona, puedes ejecutar el script SQL directamente:

1. Ve a **Supabase Dashboard** → **SQL Editor**
2. Abre el archivo `crear-usuarios.sql`
3. Copia y pega el contenido
4. Haz clic en **Run**

## Troubleshooting

### Error: "Los usuarios ya existen"
- ✅ Esto significa que los usuarios ya están creados
- Intenta iniciar sesión con las credenciales

### Error: "Error al crear usuarios"
- Verifica que la tabla `users` exista en Supabase
- Verifica que RLS esté deshabilitado (debe mostrar "UNRESTRICTED")
- Ejecuta el script `supabase-fix.sql` primero

### Error: "No se puede conectar"
- Verifica que las variables de entorno estén configuradas en Vercel
- Verifica que el deploy esté completo
- Espera unos minutos después del deploy para que todo esté listo

## Próximos Pasos

1. Ejecuta `POST /api/init-users`
2. Verifica con `GET /api/init-users` que los usuarios se crearon
3. Intenta iniciar sesión con `supzonax` / `admin`
4. Si funciona, ¡listo! Si no, comparte el error específico
