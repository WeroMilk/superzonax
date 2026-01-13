# 🚀 Comandos para Subir el Proyecto a GitHub

## Opción 1: Usar el Script Automático (Recomendado)

Ejecuta en PowerShell desde la carpeta del proyecto:

```powershell
.\preparar-github.ps1
```

Luego sigue las instrucciones que aparecen al final.

---

## Opción 2: Comandos Manuales Paso a Paso

### Paso 1: Verificar/Inicializar Git

```bash
# Si no tienes Git inicializado
git init

# Verificar estado actual
git status
```

### Paso 2: Limpiar Staging (si hay archivos agregados)

```bash
# Esto quita todos los archivos del staging sin borrarlos
git reset
```

### Paso 3: Remover Archivos que NO Deben Estar en Git

Si ya agregaste archivos que ahora deben ignorarse, remuévelos del tracking:

```bash
# Remover .next/ si está trackeado
git rm -r --cached .next/

# Remover data/uploads/ si está trackeado
git rm -r --cached data/uploads/

# Remover data/db.json si está trackeado
git rm --cached data/db.json

# Remover archivos de backup
git rm --cached *.zip

# Remover archivos TypeScript build info
git rm --cached *.tsbuildinfo

# Remover CSV temporal
git rm --cached lista_archivos_completa.csv
```

### Paso 4: Agregar Solo Archivos Esenciales

```bash
# Archivos de configuración
git add package.json
git add pnpm-lock.yaml
git add next.config.js
git add tsconfig.json
git add tailwind.config.ts
git add postcss.config.js
git add middleware.ts

# Código fuente
git add app/
git add components/
git add lib/
git add styles/
git add public/
git add scripts/

# Configuración y documentación
git add .gitignore
git add README.md
git add ARCHIVOS_IMPORTANTES.md
git add CHECKPOINT.md
git add ESTADO_PROYECTO.md
git add GITHUB_SETUP.md
git add USUARIOS.md

# Assets (opcional)
git add assets/
```

**O simplemente agrega todo (el .gitignore filtrará lo que no debe ir):**

```bash
git add .
```

### Paso 5: Verificar Qué se Va a Subir

```bash
# Ver archivos en staging
git status

# Ver archivos que se van a subir (sin los ignorados)
git ls-files
```

### Paso 6: Hacer el Primer Commit

```bash
git commit -m "Initial commit: Sistema SupZonax completo"
```

### Paso 7: Conectar con GitHub

```bash
# Reemplaza TU_USUARIO con tu nombre de usuario de GitHub
git remote add origin https://github.com/TU_USUARIO/supzonax.git

# Cambiar rama a main (si es necesario)
git branch -M main
```

### Paso 8: Subir a GitHub

```bash
git push -u origin main
```

---

## ✅ Verificación Final

Después de subir, verifica que:

1. ✅ No aparezca la carpeta `.next/` en GitHub
2. ✅ No aparezca `node_modules/` en GitHub
3. ✅ No aparezca `data/db.json` ni `data/uploads/` en GitHub
4. ✅ No aparezcan archivos `.zip` de backup
5. ✅ Sí aparezcan todos los archivos de código fuente (`app/`, `components/`, `lib/`, etc.)

---

## 🔍 Si Algo Sale Mal

### Si agregaste archivos incorrectos:

```bash
# Ver qué archivos están trackeados
git ls-files

# Remover archivo específico del tracking (sin borrarlo localmente)
git rm --cached nombre-del-archivo

# Remover carpeta específica del tracking
git rm -r --cached nombre-de-la-carpeta/
```

### Si necesitas empezar de nuevo:

```bash
# CUIDADO: Esto borra todo el historial local
rm -rf .git
git init
# Luego repite los pasos desde el inicio
```

---

## 📝 Notas Importantes

1. **NO necesitas compilar antes de subir**: Next.js se compila en el servidor o durante el deployment
2. **El .gitignore ya está configurado correctamente**: Incluye `.next/`, `node_modules/`, `data/`, etc.
3. **Los archivos de entorno (.env) NO se subirán**: Están en `.gitignore`
4. **Los datos locales (db.json, uploads) NO se subirán**: Están protegidos en `.gitignore`

---

## 🆘 Problemas Comunes

### Error: "remote origin already exists"
```bash
# Ver remotes actuales
git remote -v

# Remover el remote existente
git remote remove origin

# Agregar el nuevo
git remote add origin https://github.com/TU_USUARIO/supzonax.git
```

### Error de autenticación al hacer push
Necesitas usar un Personal Access Token en lugar de tu contraseña:
1. Ve a GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Genera un nuevo token con permisos `repo`
3. Usa el token como contraseña cuando Git te lo pida

---

¡Listo! Tu proyecto debería estar en GitHub correctamente. 🎉
