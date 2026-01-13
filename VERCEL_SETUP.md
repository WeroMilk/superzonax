# 🚀 Guía de Despliegue en Vercel

Tu proyecto está configurado para Vercel, la mejor plataforma para Next.js.

## ✅ Configuración Completada

1. ✅ `next.config.js` actualizado para Vercel (sin `output: 'export'`)
2. ✅ `.npmrc` creado para configuración de pnpm
3. ✅ `vercel.json` creado con configuración específica
4. ✅ API Routes habilitadas (funcionarán correctamente)

## 📋 Pasos para Desplegar en Vercel

### Paso 1: Subir los cambios a GitHub

```bash
git add .
git commit -m "Configuración para Vercel"
git push origin main
```

### Paso 2: Configurar en Vercel

1. Ve a https://vercel.com y crea una cuenta (puedes usar GitHub)
2. Haz clic en **"Add New Project"**
3. Importa tu repositorio `WeroMilk/supzonax`
4. Vercel detectará automáticamente que es Next.js
5. **Configuración del proyecto**:
   - **Framework Preset**: Next.js (debería detectarse automáticamente)
   - **Build Command**: `pnpm run build` (ya configurado en vercel.json)
   - **Install Command**: `pnpm install` (ya configurado en vercel.json)
   - **Output Directory**: `.next` (por defecto de Next.js)

### Paso 3: Configurar Variables de Entorno

En la configuración del proyecto en Vercel, ve a **Settings → Environment Variables** y agrega:

```
JWT_SECRET=tu-clave-secreta-super-segura-aqui
GMAIL_USER=tu-correo@gmail.com
GMAIL_APP_PASSWORD=tu-contraseña-de-aplicacion-gmail
```

**Importante**: 
- Agrega estas variables para **Production**, **Preview** y **Development**
- Usa valores diferentes para producción si es necesario

### Paso 4: Desplegar

1. Haz clic en **"Deploy"**
2. Vercel construirá y desplegará tu aplicación automáticamente
3. Tu sitio estará disponible en: `https://supzonax.vercel.app` (o el nombre que elijas)

## 🔄 Deploy Automático

Cada vez que hagas `git push` a la rama `main`:
- Vercel detectará los cambios automáticamente
- Construirá y desplegará la nueva versión
- Te notificará cuando el deploy esté completo

## ✅ Ventajas de Vercel para Next.js

- ✅ **API Routes funcionan completamente** (`/api/*`)
- ✅ **Server Actions funcionan**
- ✅ **Server-side rendering (SSR)**
- ✅ **Optimización automática de imágenes**
- ✅ **Despliegue automático con cada push**
- ✅ **Preview deployments** para cada pull request
- ✅ **Analytics y monitoreo** incluidos
- ✅ **CDN global** para mejor rendimiento

## 🐛 Solución de Problemas

### Error: "pnpm install" exited with 1

**Solución**: 
1. Verifica que `pnpm-lock.yaml` esté en el repositorio
2. Asegúrate de que `.npmrc` esté configurado correctamente
3. En Vercel, verifica que el **Install Command** sea `pnpm install`

### Error: Variables de entorno no encontradas

**Solución**:
1. Ve a **Settings → Environment Variables**
2. Agrega todas las variables necesarias (`JWT_SECRET`, `GMAIL_USER`, `GMAIL_APP_PASSWORD`)
3. Asegúrate de agregarlas para todos los ambientes (Production, Preview, Development)

### Error: API Routes no funcionan

**Solución**:
1. Verifica que `next.config.js` NO tenga `output: 'export'`
2. Verifica que las rutas estén en `app/api/`
3. Revisa los logs en Vercel para ver errores específicos

### Error: Build falla

**Solución**:
1. Ve a la pestaña **Deployments** en Vercel
2. Haz clic en el deployment fallido
3. Revisa los **Build Logs** para ver el error específico
4. Verifica que todas las dependencias estén en `package.json`

## 📝 Archivos Importantes

- `vercel.json` - Configuración específica de Vercel
- `.npmrc` - Configuración de pnpm
- `next.config.js` - Configuración de Next.js (sin `output: 'export'`)
- `package.json` - Dependencias y scripts

## 🔐 Seguridad

**IMPORTANTE**: Nunca subas archivos `.env` o `.env.local` al repositorio. Usa las **Environment Variables** de Vercel para:
- `JWT_SECRET`
- `GMAIL_USER`
- `GMAIL_APP_PASSWORD`

## 🎉 ¡Listo!

Tu proyecto está configurado para Vercel. Solo necesitas:

1. Subir los cambios a GitHub
2. Importar el repositorio en Vercel
3. Configurar las variables de entorno
4. Desplegar

¡Tu aplicación estará funcionando con todas las características de Next.js!

---

**URL de tu aplicación**: `https://supzonax.vercel.app` (o el dominio personalizado que configures)
