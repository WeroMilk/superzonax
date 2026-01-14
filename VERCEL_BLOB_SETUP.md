# Configuración de Vercel Blob Storage

## ✅ Cambios Realizados

He migrado completamente tu aplicación para usar **Vercel Blob Storage** en lugar del sistema de archivos local. Todos los archivos ahora se guardarán permanentemente en Vercel Blob.

## 📋 Pasos que DEBES hacer en Vercel

### 1. Crear el Blob Store

1. Ve a tu proyecto en [Vercel Dashboard](https://vercel.com/dashboard)
2. Haz clic en la pestaña **"Storage"** (o "Almacenamiento")
3. Haz clic en **"Create Database"** o **"Connect Database"**
4. Selecciona **"Blob"**
5. Dale un nombre a tu Blob Store (ej: `supzonax-blob`)
6. Selecciona la región más cercana (ej: `us-east-1`)
7. Haz clic en **"Create"**

### 2. Configurar Variables de Entorno

Vercel automáticamente creará una variable de entorno llamada `BLOB_READ_WRITE_TOKEN`. 

**Verifica que esté configurada:**
1. Ve a **Settings** → **Environment Variables**
2. Deberías ver `BLOB_READ_WRITE_TOKEN` con un valor automático
3. Si no está, puedes obtenerla desde la pestaña **Storage** → tu Blob Store → **Settings**

### 3. Sincronizar Variables de Entorno Localmente (Opcional)

Si quieres probar localmente, ejecuta:

```bash
vercel env pull
```

Esto descargará las variables de entorno a tu archivo `.env.local`.

### 4. Hacer Deploy

Una vez configurado el Blob Store:

1. Haz commit y push de los cambios:
   ```bash
   git add .
   git commit -m "Migración a Vercel Blob Storage"
   git push
   ```

2. Vercel automáticamente hará el deploy

## 📊 Límites Configurados

La aplicación ahora tiene los siguientes límites para mantenerte dentro del plan gratuito:

- **Evidencias**: Máximo 100 fotos totales, 10 fotos por evidencia, 10MB por foto
- **Documentos**: Máximo 20 archivos, 5MB por archivo
- **Asistencia**: Máximo 20 archivos Excel, 2MB por archivo
- **Consejo Técnico**: Máximo 20 archivos, 5MB por archivo
- **Reporte Trimestral**: Máximo 20 archivos, 5MB por archivo
- **Eventos**: Máximo 50 imágenes, 5MB por imagen

## 🔄 Compatibilidad con Archivos Antiguos

La aplicación es compatible con archivos antiguos que ya estaban en el sistema de archivos. Si un archivo no es una URL de Blob, intentará buscarlo en el sistema de archivos local (solo para desarrollo).

## ⚠️ Notas Importantes

1. **Los archivos antiguos** seguirán funcionando mientras estén en el sistema de archivos local (solo en desarrollo)
2. **Los nuevos archivos** se guardarán automáticamente en Vercel Blob Storage
3. **No necesitas migrar archivos antiguos** manualmente - la aplicación maneja ambos formatos
4. **El plan gratuito de Vercel Blob** incluye:
   - 1 GB de almacenamiento
   - 10 GB de transferencia al mes
   - 2,000 operaciones de escritura
   - 10,000 operaciones de lectura

## 🧪 Probar Localmente

Si quieres probar localmente con Blob Storage:

1. Instala Vercel CLI: `npm i -g vercel`
2. Ejecuta: `vercel env pull`
3. Esto creará/actualizará tu `.env.local` con el token de Blob

## 📝 Archivos Modificados

- ✅ `lib/blob-storage.ts` - Nueva utilidad para manejar Blob Storage
- ✅ `app/api/evidencias/route.ts` - Migrado a Blob
- ✅ `app/api/documentos/route.ts` - Migrado a Blob
- ✅ `app/api/attendance/route.ts` - Migrado a Blob
- ✅ `app/api/consejo-tecnico/route.ts` - Migrado a Blob
- ✅ `app/api/reporte-trimestral/route.ts` - Migrado a Blob
- ✅ `app/api/events/route.ts` - Migrado a Blob
- ✅ `app/api/files/[filename]/route.ts` - Actualizado para manejar URLs de Blob
- ✅ `lib/email.ts` - Actualizado para descargar archivos desde Blob antes de enviar

## 🎉 ¡Listo!

Una vez que crees el Blob Store en Vercel, todos los archivos se guardarán permanentemente y no se perderán entre deployments.
