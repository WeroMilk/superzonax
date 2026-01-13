# 📋 Lista de Archivos Importantes del Proyecto

**Fecha de creación:** 2026-01-12

## ✅ Archivos Críticos que DEBEN Conservarse

### 🔧 Configuración del Proyecto
- `package.json` - Dependencias del proyecto
- `tsconfig.json` - Configuración TypeScript
- `tailwind.config.ts` - Configuración Tailwind CSS
- `next.config.js` - Configuración Next.js
- `postcss.config.js` - Configuración PostCSS
- `.gitignore` - Archivos a ignorar en Git

### 📱 Código Fuente - Frontend
- `app/page.tsx` - Página de inicio/login
- `app/layout.tsx` - Layout principal
- `app/globals.css` - Estilos globales
- `app/dashboard/page.tsx` - Página del dashboard
- `app/api/**/*.ts` - Todas las rutas API (17 archivos)

### 🧩 Componentes React
- `components/LoginPage.tsx` - Página de login
- `components/Dashboard.tsx` - Dashboard principal
- `components/DatePicker.tsx` - Selector de fechas
- `components/EmailSelector.tsx` - Selector de emails
- `components/LoadingSpinner.tsx` - Spinner de carga
- `components/tabs/AsistenciaTab.tsx` - Pestaña de asistencia
- `components/tabs/ConsejoTecnicoTab.tsx` - Pestaña consejo técnico
- `components/tabs/ReporteTrimestralTab.tsx` - Pestaña reporte trimestral
- `components/tabs/EventosTab.tsx` - Pestaña de eventos
- `components/tabs/EvidenciasTab.tsx` - Pestaña de evidencias
- `components/tabs/RepositorioTab.tsx` - Pestaña repositorio

### 🔐 Lógica del Backend
- `lib/auth.ts` - Sistema de autenticación
- `lib/db-json.ts` - Base de datos JSON
- `lib/email.ts` - Envío de correos
- `lib/utils.ts` - Utilidades generales
- `middleware.ts` - Middleware de autenticación

### 🎨 Estilos
- `styles/calendar.css` - Estilos del calendario
- `app/globals.css` - Estilos globales

### 📁 Archivos Estáticos
- `public/logo-dgest.png` - Logo DGEST
- `assets/estlogo.png` - Logo original

### 📚 Documentación
- `README.md` - Documentación principal
- `ESTADO_PROYECTO.md` - Estado del proyecto
- `CHECKPOINT.md` - Punto de guardado
- `GITHUB_SETUP.md` - Guía de GitHub
- `RESPALDO_INSTRUCCIONES.md` - Instrucciones de respaldo
- `USUARIOS.md` - Credenciales de usuarios
- `ARCHIVOS_IMPORTANTES.md` - Este archivo

### 🗄️ Base de Datos (Opcional - contiene datos)
- `data/db.json` - Base de datos JSON (se regenera si se elimina)

### ⚙️ Scripts
- `scripts/init-db.js` - Script de inicialización

## ⚠️ Archivos que NO son Críticos (se regeneran)

- `node_modules/` - Se regenera con `npm install`
- `.next/` - Se regenera con `npm run build`
- `data/uploads/` - Archivos subidos por usuarios (opcional)
- `*.log` - Archivos de log
- `*.tsbuildinfo` - Archivos de build de TypeScript

## 🔒 Archivos que NO deben Subirse a Git

- `.env.local` - Variables de entorno con credenciales
- `data/db.json` - Base de datos local (opcional)
- `data/uploads/` - Archivos subidos (opcional)

## 📦 Para Restaurar el Proyecto

1. Todos los archivos listados arriba deben estar presentes
2. Ejecutar `npm install` para regenerar `node_modules`
3. Ejecutar `npm run build` para regenerar `.next`
4. Crear `.env.local` con las credenciales necesarias

---

**Total de archivos críticos:** ~50+ archivos de código fuente + configuración
