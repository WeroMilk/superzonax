# 🔧 Configurar BLOB_READ_WRITE_TOKEN

## Error Actual
```
Vercel Blob: No token found. Either configure the `BLOB_READ_WRITE_TOKEN` environment variable, or pass a `token` option to your calls.
```

## ✅ Solución Rápida

### Opción 1: En Vercel Dashboard (Producción)

1. **Ve a tu proyecto en Vercel Dashboard**
   - https://vercel.com/dashboard

2. **Crea el Blob Store** (si aún no lo has hecho):
   - Haz clic en tu proyecto
   - Ve a la pestaña **"Storage"** (o "Almacenamiento")
   - Haz clic en **"Create Database"** o **"Connect Database"**
   - Selecciona **"Blob"**
   - Dale un nombre (ej: `supzonax-blob`)
   - Selecciona la región (ej: `us-east-1`)
   - Haz clic en **"Create"**

3. **Verifica la variable de entorno**:
   - Ve a **Settings** → **Environment Variables**
   - Deberías ver `BLOB_READ_WRITE_TOKEN` automáticamente
   - Si no está, ve a **Storage** → tu Blob Store → **Settings** → copia el token

4. **Haz redeploy**:
   - Ve a **Deployments**
   - Haz clic en los 3 puntos del último deployment
   - Selecciona **"Redeploy"**

### Opción 2: Desarrollo Local

Si quieres probar localmente:

1. **Instala Vercel CLI** (si no lo tienes):
   ```bash
   npm i -g vercel
   ```

2. **Inicia sesión en Vercel**:
   ```bash
   vercel login
   ```

3. **Vincula tu proyecto** (si no está vinculado):
   ```bash
   vercel link
   ```

4. **Descarga las variables de entorno**:
   ```bash
   vercel env pull
   ```

   Esto creará/actualizará tu archivo `.env.local` con el token.

5. **Verifica que el token esté en `.env.local`**:
   ```bash
   # Deberías ver algo como:
   BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxxxxxxxxxx
   ```

6. **Reinicia tu servidor de desarrollo**:
   ```bash
   pnpm dev
   ```

## 🔍 Verificar que Funciona

Después de configurar el token, intenta subir un archivo. Si funciona correctamente, el error desaparecerá.

## ⚠️ Notas Importantes

- **En producción (Vercel)**: El token se configura automáticamente cuando creas el Blob Store
- **En desarrollo local**: Necesitas descargar las variables de entorno con `vercel env pull`
- **El token es secreto**: Nunca lo compartas ni lo subas a Git (ya está en `.gitignore`)

## 🆘 Si el Error Persiste

1. Verifica que el Blob Store esté creado en Vercel
2. Verifica que la variable `BLOB_READ_WRITE_TOKEN` esté en Environment Variables
3. Haz un redeploy después de crear el Blob Store
4. Si estás en local, ejecuta `vercel env pull` y reinicia el servidor
