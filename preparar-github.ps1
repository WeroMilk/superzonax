# Script para preparar el proyecto para GitHub
# Ejecuta este script en PowerShell desde la carpeta del proyecto

Write-Host "=== Preparando proyecto para GitHub ===" -ForegroundColor Cyan
Write-Host ""

# Paso 1: Verificar si Git está inicializado
if (-not (Test-Path .git)) {
    Write-Host "Inicializando repositorio Git..." -ForegroundColor Yellow
    git init
    Write-Host "✓ Repositorio inicializado" -ForegroundColor Green
} else {
    Write-Host "✓ Repositorio Git ya está inicializado" -ForegroundColor Green
}

Write-Host ""

# Paso 2: Resetear staging si hay archivos agregados
Write-Host "Limpiando staging..." -ForegroundColor Yellow
git reset
Write-Host "✓ Staging limpiado" -ForegroundColor Green

Write-Host ""

# Paso 3: Remover archivos que ya estaban trackeados pero ahora deben ignorarse
Write-Host "Removiendo archivos que no deberían estar en Git..." -ForegroundColor Yellow

# Remover .next/ si existe y está trackeado
if (git ls-files --error-unmatch .next/ 2>$null) {
    git rm -r --cached .next/ 2>$null
    Write-Host "✓ Removido .next/ del tracking" -ForegroundColor Green
}

# Remover data/uploads/ si está trackeado
if (git ls-files --error-unmatch data/uploads/ 2>$null) {
    git rm -r --cached data/uploads/ 2>$null
    Write-Host "✓ Removido data/uploads/ del tracking" -ForegroundColor Green
}

# Remover data/db.json si está trackeado
if (git ls-files --error-unmatch data/db.json 2>$null) {
    git rm --cached data/db.json 2>$null
    Write-Host "✓ Removido data/db.json del tracking" -ForegroundColor Green
}

# Remover archivos de backup
if (git ls-files --error-unmatch *.zip 2>$null) {
    git rm --cached *.zip 2>$null
    Write-Host "✓ Removidos archivos .zip del tracking" -ForegroundColor Green
}

# Remover tsbuildinfo
if (git ls-files --error-unmatch *.tsbuildinfo 2>$null) {
    git rm --cached *.tsbuildinfo 2>$null
    Write-Host "✓ Removidos archivos .tsbuildinfo del tracking" -ForegroundColor Green
}

# Remover CSV temporal
if (git ls-files --error-unmatch lista_archivos_completa.csv 2>$null) {
    git rm --cached lista_archivos_completa.csv 2>$null
    Write-Host "✓ Removido lista_archivos_completa.csv del tracking" -ForegroundColor Green
}

Write-Host ""

# Paso 4: Agregar solo los archivos esenciales
Write-Host "Agregando archivos esenciales..." -ForegroundColor Yellow

# Archivos de configuración
git add package.json
git add pnpm-lock.yaml
git add next.config.js
git add tsconfig.json
git add tailwind.config.ts
git add postcss.config.js
git add middleware.ts

# Archivos de código fuente
git add app/
git add components/
git add lib/
git add styles/
git add public/
git add scripts/

# Archivos de configuración y documentación
git add .gitignore
git add README.md
git add ARCHIVOS_IMPORTANTES.md
git add CHECKPOINT.md
git add ESTADO_PROYECTO.md
git add GITHUB_SETUP.md
git add USUARIOS.md

# Assets en la raíz (si los quieres mantener)
if (Test-Path assets/) {
    git add assets/
}

Write-Host "✓ Archivos esenciales agregados" -ForegroundColor Green

Write-Host ""

# Paso 5: Mostrar estado
Write-Host "=== Estado actual ===" -ForegroundColor Cyan
git status --short

Write-Host ""
Write-Host "=== Archivos que NO se subirán (gracias a .gitignore) ===" -ForegroundColor Cyan
Write-Host "- node_modules/" -ForegroundColor Gray
Write-Host "- .next/" -ForegroundColor Gray
Write-Host "- data/db.json" -ForegroundColor Gray
Write-Host "- data/uploads/" -ForegroundColor Gray
Write-Host "- *.zip (backups)" -ForegroundColor Gray
Write-Host "- *.tsbuildinfo" -ForegroundColor Gray
Write-Host "- .env* (variables de entorno)" -ForegroundColor Gray

Write-Host ""
Write-Host "=== Próximos pasos ===" -ForegroundColor Cyan
Write-Host "1. Revisa los archivos que se van a subir con: git status" -ForegroundColor White
Write-Host "2. Si todo está bien, haz commit:" -ForegroundColor White
Write-Host "   git commit -m 'Initial commit: Sistema SupZonax completo'" -ForegroundColor Yellow
Write-Host ""
Write-Host "3. Conecta con GitHub (reemplaza TU_USUARIO):" -ForegroundColor White
Write-Host "   git remote add origin https://github.com/TU_USUARIO/supzonax.git" -ForegroundColor Yellow
Write-Host "   git branch -M main" -ForegroundColor Yellow
Write-Host "   git push -u origin main" -ForegroundColor Yellow
Write-Host ""
Write-Host "✓ Proceso completado!" -ForegroundColor Green
