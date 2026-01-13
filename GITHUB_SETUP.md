# 🚀 Guía para Subir el Proyecto a GitHub

## Paso 1: Crear Repositorio en GitHub

1. Ve a [GitHub.com](https://github.com) e inicia sesión
2. Haz clic en el botón **"+"** en la esquina superior derecha
3. Selecciona **"New repository"**
4. Completa los datos:
   - **Repository name**: `supzonax` (o el nombre que prefieras)
   - **Description**: "Sistema de gestión para Supervisión de Zona X - Secundarias Técnicas"
   - **Visibility**: 
     - ✅ **Private** (recomendado para proyectos privados)
     - O **Public** (si quieres que sea público)
   - ❌ **NO marques** "Initialize this repository with a README" (ya tienes uno)
5. Haz clic en **"Create repository"**

## Paso 2: Inicializar Git en tu Proyecto Local

Abre PowerShell o Terminal en la carpeta del proyecto y ejecuta:

```bash
# Inicializar repositorio git
git init

# Agregar todos los archivos (excepto los que están en .gitignore)
git add .

# Hacer el primer commit
git commit -m "Initial commit: Proyecto completo - Sistema de gestión Supervisión de Zona X"
```

## Paso 3: Conectar con GitHub

### Si usas Git (línea de comandos):

Después de crear el repositorio en GitHub, verás una página con instrucciones. Usa estas líneas:

```bash
# Reemplaza TU_USUARIO con tu nombre de usuario de GitHub
# Reemplaza supzonax con el nombre de tu repositorio si es diferente

git remote add origin https://github.com/TU_USUARIO/supzonax.git
git branch -M main
git push -u origin main
```

### Si usas GitHub Desktop:
GitHub Desktop lo hace automáticamente cuando haces "Publish repository"

## Paso 4: Verificar que Todo Esté Bien

```bash
# Ver el estado
git status

# Ver los remotes configurados
git remote -v
```

## 🔐 Si GitHub te Pide Autenticación

### Opción 1: Personal Access Token (Recomendado)

1. Ve a GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Genera un nuevo token con permisos `repo`
3. Copia el token
4. Cuando git te pida la contraseña, usa el token en lugar de tu contraseña

### Opción 2: GitHub CLI

```bash
# Instalar GitHub CLI (opcional)
# Luego autenticarte:
gh auth login
```

## 📋 Comandos Útiles para el Futuro

```bash
# Ver cambios
git status

# Agregar archivos modificados
git add .

# Hacer commit
git commit -m "Descripción de los cambios"

# Subir cambios a GitHub
git push

# Bajar cambios de GitHub
git pull

# Ver historial de commits
git log --oneline
```

## ⚠️ Archivos que NO se Subirán (gracias a .gitignore)

- `node_modules/` - Dependencias (se regeneran con npm install)
- `.next/` - Build de Next.js (se regenera con npm run build)
- `.env.local` - Variables de entorno (¡IMPORTANTE! No subir credenciales)
- `data/db.json` - Base de datos local
- `data/uploads/` - Archivos subidos por usuarios
- `*.log` - Archivos de log
- Archivos temporales

## 🔒 Seguridad: Variables de Entorno

**IMPORTANTE:** Nunca subas tu archivo `.env.local` a GitHub porque contiene credenciales.

✅ **Ya creé un archivo `.env.example`** que puedes subir (contiene solo los nombres de las variables, sin valores reales).

El archivo `.env.local` está en `.gitignore` y NO se subirá automáticamente.

## 📝 Después de Subir a GitHub

1. ✅ Tu código estará respaldado en la nube
2. ✅ Podrás acceder desde cualquier lugar
3. ✅ Podrás compartir el proyecto fácilmente
4. ✅ Tendrás historial de cambios
5. ✅ Podrás colaborar con otros desarrolladores

---

**¿Necesitas ayuda con algún paso específico?** Avísame y te ayudo.
