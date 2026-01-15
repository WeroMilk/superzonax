# 🔑 Cómo Obtener el Token de Blob Store Manualmente

Si ya creaste el Blob Store pero sigue el error, necesitas obtener el token manualmente:

## 📋 Pasos Detallados

### 1. Obtener el Token desde Vercel Dashboard

1. **Ve a tu proyecto en Vercel Dashboard**
   - https://vercel.com/dashboard
   - Selecciona tu proyecto `supzonax`

2. **Ve a Storage**
   - Haz clic en la pestaña **"Storage"** (o "Almacenamiento")
   - Deberías ver tu Blob Store listado

3. **Abre la configuración del Blob Store**
   - Haz clic en el nombre de tu Blob Store
   - O haz clic en los 3 puntos (⋯) → **"Settings"**

4. **Copia el Token**
   - En la sección **"Tokens"** o **"Access Tokens"**
   - Busca **"Read and Write Token"** o **"BLOB_READ_WRITE_TOKEN"**
   - Haz clic en **"Show"** o **"Reveal"** para verlo
   - **Copia el token completo** (empieza con `vercel_blob_rw_...`)

### 2. Agregar la Variable de Entorno Manualmente

1. **Ve a Settings → Environment Variables**
   - En tu proyecto de Vercel
   - Pestaña **"Settings"**
   - Sección **"Environment Variables"**

2. **Agregar Nueva Variable**
   - Haz clic en **"Add New"** o **"Add"**
   - **Key**: `BLOB_READ_WRITE_TOKEN`
   - **Value**: Pega el token que copiaste
   - **Environment**: Selecciona TODOS:
     - ✅ Production
     - ✅ Preview  
     - ✅ Development

3. **Guardar**
   - Haz clic en **"Save"** o **"Add"**

### 3. Hacer Redeploy

1. **Ve a Deployments**
   - Pestaña **"Deployments"** en tu proyecto

2. **Redeploy**
   - En el último deployment, haz clic en los 3 puntos (⋯)
   - Selecciona **"Redeploy"**
   - Confirma

### 4. Verificar

Después del redeploy, intenta subir un archivo nuevamente. El error debería desaparecer.

## 🔍 Verificación Adicional

Si aún no funciona, verifica:

1. **Que el Blob Store esté conectado al proyecto correcto**
   - En Storage → tu Blob Store → Settings
   - Verifica que aparezca tu proyecto en "Connected Projects"

2. **Que la variable esté en el entorno correcto**
   - En Environment Variables, verifica que `BLOB_READ_WRITE_TOKEN` tenga ✅ en Production

3. **Revisa los logs del deployment**
   - En Deployments → tu último deployment → "Logs"
   - Busca si hay algún error relacionado con BLOB

## ⚠️ Nota Importante

El token debe empezar con `vercel_blob_rw_` seguido de una cadena larga. Si no lo encuentras, puede que necesites regenerarlo desde Settings del Blob Store.
