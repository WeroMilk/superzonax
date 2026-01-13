# Supervisión de Zona No. 10 - Sistema de Gestión

Sistema web moderno y responsive para la gestión de la Supervisión de Zona No. 10 de Secundarias Técnicas en Hermosillo, Sonora.

## 🚀 Características

- **Autenticación simple** con 4 usuarios (admin + 3 secundarias)
- **Asistencia Diaria**: Subida de reportes de asistencia de alumnos y personal, con consolidación y envío por correo
- **Consejo Técnico Mensual**: Gestión de reportes mensuales con consolidación
- **Reporte Trimestral**: Sistema de reportes trimestrales
- **Eventos Personalizados**: Calendario de eventos, asuetos, consejos técnicos y conmemoraciones
- **Galería de Evidencias**: Subida y visualización de fotografías de eventos
- **Repositorio de Documentos**: Administración de documentos importantes
- **Diseño Responsive**: Optimizado para dispositivos móviles (90% de usuarios)
- **Animaciones Fluidas**: Interfaz moderna con animaciones suaves

## 🛠️ Tecnologías

- **Next.js 14** con App Router
- **TypeScript**
- **Tailwind CSS** para estilos
- **JSON** para base de datos (sistema simple y eficiente)
- **Framer Motion** para animaciones
- **Nodemailer** para envío de correos
- **XLSX** para consolidación de archivos Excel

## 📋 Requisitos Previos

- Node.js 18+ 
- npm o yarn

## 🔧 Instalación

1. Clona el repositorio o descarga los archivos
2. Instala las dependencias:

```bash
npm install
```

3. Crea un archivo `.env.local` en la raíz del proyecto:

```env
JWT_SECRET=tu-clave-secreta-super-segura-aqui
GMAIL_USER=tu-correo@gmail.com
GMAIL_APP_PASSWORD=tu-contraseña-de-aplicacion-gmail
```

### Configuración de Gmail

Para enviar correos electrónicos, necesitas crear una contraseña de aplicación en Gmail:

1. Ve a tu cuenta de Google: https://myaccount.google.com/
2. Activa la verificación en dos pasos si no está activada
3. Ve a "Contraseñas de aplicaciones": https://myaccount.google.com/apppasswords
4. Genera una nueva contraseña para "Correo" y "Otro (personalizado)" - escribe "SupZonax"
5. Copia la contraseña generada y úsala en `GMAIL_APP_PASSWORD`

## 🚀 Uso

1. Inicia el servidor de desarrollo:

```bash
npm run dev
```

2. Abre [http://localhost:3000](http://localhost:3000) en tu navegador

3. Inicia sesión con las credenciales:
   - **Admin**: usuario `supzonax`, contraseña `admin`
   - **Secundaria 6**: usuario `sec06`, contraseña `sec06`
   - **Secundaria 60**: usuario `sec60`, contraseña `sec60`
   - **Secundaria 72**: usuario `sec72`, contraseña `sec72`

## 📁 Estructura del Proyecto

```
supzonax/
├── app/                    # Rutas y páginas de Next.js
│   ├── api/               # API routes
│   ├── dashboard/          # Página del dashboard
│   ├── globals.css         # Estilos globales
│   ├── layout.tsx         # Layout principal
│   └── page.tsx           # Página de inicio/login
├── components/            # Componentes React
│   ├── tabs/             # Componentes de cada pestaña
│   ├── Dashboard.tsx     # Componente principal del dashboard
│   └── LoginPage.tsx     # Página de login
├── lib/                  # Utilidades y lógica
│   ├── auth.ts           # Autenticación
│   ├── db-json.ts        # Base de datos JSON
│   ├── email.ts          # Envío de correos
│   └── utils.ts          # Utilidades generales
├── data/                 # Base de datos y archivos subidos
│   ├── db.json           # Base de datos JSON (se crea automáticamente)
│   └── uploads/          # Archivos subidos por usuarios
└── public/               # Archivos estáticos
```

## 🔐 Seguridad

- Las contraseñas se almacenan con hash usando bcrypt
- Las sesiones se manejan con JWT tokens
- Validación de permisos en cada endpoint
- Sanitización de datos de entrada

## 📱 Responsive Design

El sistema está completamente optimizado para dispositivos móviles:
- Sidebar colapsable en móviles
- Navegación táctil optimizada
- Formularios adaptativos
- Imágenes y contenido responsive

## 🎨 Diseño

El diseño sigue los colores del Gobierno de Sonora 2026:
- Guinda primario (#8B1538)
- Azul secundario (#0ea5e9)
- Diseño minimalista y moderno
- Animaciones fluidas y suaves

## 📝 Notas

- La base de datos JSON se crea automáticamente en `data/db.json`
- Los archivos subidos se guardan en `data/uploads/`
- El sistema está diseñado para un uso ligero (4 usuarios, ~10 visitas/día)
- No requiere Firebase ni servicios externos complejos
- No requiere SQLite ni dependencias nativas, funciona en cualquier plataforma

## 🐛 Solución de Problemas

### Error al iniciar sesión
- Verifica que el archivo `data/db.json` se haya creado correctamente
- Verifica que las credenciales sean correctas (ver USUARIOS.md)
- Revisa los logs del servidor para más detalles

### Error al enviar correos
- Verifica que `GMAIL_USER` y `GMAIL_APP_PASSWORD` estén configurados correctamente
- Asegúrate de usar una contraseña de aplicación, no tu contraseña normal de Gmail

### Error al subir archivos
- Verifica que el directorio `data/uploads/` tenga permisos de escritura
- Asegúrate de que haya suficiente espacio en disco

## 📄 Licencia

Este proyecto es privado y está destinado exclusivamente para uso de la Supervisión de Zona No. 10.

## 👨‍💻 Desarrollo

Para producción:

```bash
npm run build
npm start
```

El sistema estará disponible en `http://localhost:3000`

---

Desarrollado con ❤️ para la Supervisión de Zona No. 10 de Secundarias Técnicas

