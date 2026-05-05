@echo off
REM MediAgenda - Deploy Script to GitHub and Render (Windows)
REM ========================================================

echo.
echo ============================================================
echo  MediAgenda - Pre-deployment Validation
echo ============================================================
echo.

REM Validar render.yaml
if not exist "render.yaml" (
    echo [ERROR] No se encontro render.yaml
    echo Asegurate de estar en la raiz de MediAgenda
    pause
    exit /b 1
)
echo [OK] render.yaml encontrado

REM Backend checks
echo.
echo Verificando Backend...
if not exist "Backend\requirements.txt" (
    echo [ERROR] Backend\requirements.txt no existe
    pause
    exit /b 1
)
echo [OK] Backend\requirements.txt

if not exist "Backend\Dockerfile" (
    echo [ERROR] Backend\Dockerfile no existe
    pause
    exit /b 1
)
echo [OK] Backend\Dockerfile

REM Frontend checks
echo.
echo Verificando Frontend...
if not exist "Frontend\package.json" (
    echo [ERROR] Frontend\package.json no existe
    pause
    exit /b 1
)
echo [OK] Frontend\package.json

if not exist "Frontend\vite.config.ts" (
    echo [ERROR] Frontend\vite.config.ts no existe
    pause
    exit /b 1
)
echo [OK] Frontend\vite.config.ts

REM Documentation
echo.
echo Verificando documentacion...
if not exist "README.md" (
    echo [ERROR] README.md no existe
    pause
    exit /b 1
)
echo [OK] README.md

if not exist "DEPLOYMENT_CHECKLIST.md" (
    echo [ERROR] DEPLOYMENT_CHECKLIST.md no existe
    pause
    exit /b 1
)
echo [OK] DEPLOYMENT_CHECKLIST.md

if not exist ".env.example" (
    echo [ERROR] .env.example no existe
    pause
    exit /b 1
)
echo [OK] .env.example

echo.
echo ============================================================
echo [SUCCESS] Todos los archivos estan en orden
echo ============================================================
echo.
echo Proximos pasos:
echo.
echo 1. Crear repositorio en GitHub:
echo    https://github.com/new
echo    Repository name: mediagenda
echo.
echo 2. Agregar remoto y push:
echo    git remote add origin https://github.com/TU_USUARIO/mediagenda.git
echo    git branch -M main
echo    git add .
echo    git commit -m "Initial: MediAgenda MVP - Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
echo    git push -u origin main
echo.
echo 3. En Render:
echo    - New Blueprint
echo    - Conectar GitHub repo
echo    - Render detecta render.yaml automaticamente
echo    - Deploy!
echo.
echo 4. Crear superuser en Render console:
echo    python manage.py createsuperuser
echo.
echo Listo para produccion! :)
echo.
pause
