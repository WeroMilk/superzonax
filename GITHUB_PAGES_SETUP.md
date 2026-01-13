# 🚀 Guía de Despliegue en GitHub Pages

> ⚠️ **ADVERTENCIA IMPORTANTE**: Tu aplicación usa API Routes (`/api/*`) que **NO funcionarán** en GitHub Pages. GitHub Pages solo sirve contenido estático. 
> 
> **Recomendación**: Usa **Vercel** para Next.js (ver `ADVERTENCIA_GITHUB_PAGES.md` para más detalles).
> 
> Si aún así quieres usar GitHub Pages, las funcionalidades del servidor (login, subir archivos, etc.) no funcionarán.

Tu proyecto está configurado para desplegarse automáticamente en GitHub Pages.

## ✅ Configuración Completada

1. ✅ `next.config.js` configurado para export estático
2. ✅ `package.json` con scripts de deploy
3. ✅ Workflow de GitHub Actions creado (`.github/workflows/deploy.yml`)
4. ✅ `.gitignore` configurado correctamente

## 📋 Pasos para Activar GitHub Pages

### Paso 1: Subir los cambios a GitHub

```bash
git add .
git commit -m "Configuración para GitHub Pages"
git push origin main
```

### Paso 2: Activar GitHub Pages en el Repositorio

1. Ve a tu repositorio: https://github.com/WeroMilk/supzonax
2. Haz clic en **Settings** (Configuración)
3. En el menú lateral, busca **Pages**
4. En **Build and deployment**:
   - **Source**: Selecciona **"GitHub Actions"** (NO "Deploy from a branch")
5. Guarda los cambios

### Paso 3: Esperar el Deploy Automático

- GitHub Actions ejecutará automáticamente el workflow cuando hagas push a `main`
- Puedes ver el progreso en la pestaña **Actions** de tu repositorio
- El deploy puede tardar 2-5 minutos

### Paso 4: Verificar tu Sitio

Una vez completado el deploy, tu sitio estará disponible en:
**https://weromilk.github.io/supzonax/**

## 🔄 Deploy Automático

Cada vez que hagas `git push` a la rama `main`, GitHub Actions:
1. Construirá automáticamente tu proyecto
2. Generará los archivos estáticos en `out/`
3. Desplegará a GitHub Pages

## 🛠️ Deploy Manual (Alternativa)

Si prefieres hacer deploy manualmente:

```bash
# 1. Instalar gh-pages (si no está instalado)
npm install

# 2. Construir y desplegar
npm run deploy
```

**Nota**: Para deploy manual, necesitarás configurar GitHub Pages para usar la rama `gh-pages` en lugar de GitHub Actions.

## ⚠️ Limitaciones de GitHub Pages

GitHub Pages solo sirve contenido estático, por lo que:

- ✅ **Funciona**: Componentes React, páginas estáticas, estilos CSS
- ❌ **NO funciona**: 
  - API Routes (`/api/*`)
  - Server Actions
  - Server-side rendering (SSR)
  - Middleware con lógica del servidor

### Soluciones para Funcionalidades del Servidor

Si necesitas funcionalidades del servidor (API, autenticación, etc.):

1. **Vercel** (Recomendado para Next.js):
   - Ve a https://vercel.com
   - Importa tu repositorio
   - Despliega con un clic
   - Soporta API Routes y Server Actions

2. **Backend Separado**:
   - Usa Railway, Render, o Fly.io para el backend
   - Mantén el frontend en GitHub Pages

## 🐛 Solución de Problemas

### Error 404 en las rutas

Si las rutas dan error 404, verifica que:
1. `trailingSlash: true` esté en `next.config.js` ✅ (ya configurado)
2. `basePath: '/supzonax'` esté configurado ✅ (ya configurado)

### Las imágenes no se cargan

Verifica que:
1. `images.unoptimized: true` esté en `next.config.js` ✅ (ya configurado)
2. Las rutas de imágenes usen el `basePath` correcto

### El workflow falla

1. Ve a la pestaña **Actions** en GitHub
2. Revisa los logs del workflow fallido
3. Verifica que `package.json` tenga todas las dependencias necesarias

### El sitio muestra "404 File not found"

- Espera 2-5 minutos después del deploy
- Verifica que GitHub Pages esté configurado para usar **GitHub Actions**
- Revisa que el workflow se haya completado exitosamente

## 📝 Archivos Importantes

- `.github/workflows/deploy.yml` - Workflow de deploy automático
- `next.config.js` - Configuración de Next.js para export estático
- `package.json` - Scripts de build y deploy

## 🎉 ¡Listo!

Tu proyecto está configurado y listo para desplegarse en GitHub Pages. Solo necesitas:

1. Hacer push de los cambios
2. Activar GitHub Pages en Settings → Pages → Source: GitHub Actions
3. Esperar el deploy automático

¡Tu sitio estará disponible en https://weromilk.github.io/supzonax/!
