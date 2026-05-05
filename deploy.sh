#!/bin/bash
# MediAgenda - Deploy Script to GitHub and Render
# ================================================

set -e

echo "🔍 Verificando estado del proyecto..."

# Validar que estamos en la raíz de MediAgenda
if [ ! -f "render.yaml" ]; then
    echo "❌ Error: No se encontró render.yaml"
    echo "Asegúrate de estar en la raíz de MediAgenda"
    exit 1
fi

echo "✅ render.yaml encontrado"

# Backend checks
echo ""
echo "📦 Verificando Backend..."
if [ ! -f "Backend/requirements.txt" ]; then
    echo "❌ Backend/requirements.txt no existe"
    exit 1
fi
echo "✅ Backend/requirements.txt OK"

if [ ! -f "Backend/Dockerfile" ]; then
    echo "❌ Backend/Dockerfile no existe"
    exit 1
fi
echo "✅ Backend/Dockerfile OK"

# Frontend checks
echo ""
echo "📦 Verificando Frontend..."
if [ ! -f "Frontend/package.json" ]; then
    echo "❌ Frontend/package.json no existe"
    exit 1
fi
echo "✅ Frontend/package.json OK"

if [ ! -f "Frontend/vite.config.ts" ]; then
    echo "❌ Frontend/vite.config.ts no existe"
    exit 1
fi
echo "✅ Frontend/vite.config.ts OK"

# Documentation
echo ""
echo "📋 Verificando documentación..."
if [ ! -f "README.md" ]; then
    echo "❌ README.md no existe"
    exit 1
fi
echo "✅ README.md OK"

if [ ! -f "DEPLOYMENT_CHECKLIST.md" ]; then
    echo "❌ DEPLOYMENT_CHECKLIST.md no existe"
    exit 1
fi
echo "✅ DEPLOYMENT_CHECKLIST.md OK"

if [ ! -f ".env.example" ]; then
    echo "❌ .env.example no existe"
    exit 1
fi
echo "✅ .env.example OK"

# Git check
echo ""
echo "📝 Verificando Git..."
if [ ! -d ".git" ]; then
    echo "⚠️  Git no inicializado. Inicializando..."
    git init
    git config user.email "dev@mediagenda.local"
    git config user.name "MediAgenda Developer"
fi

echo "✅ Todos los archivos están en orden"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 Listo para GitHub + Render"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo ""
echo "Próximos pasos:"
echo ""
echo "1️⃣  Crear repositorio en GitHub:"
echo "   → https://github.com/new"
echo "   → Repository name: mediagenda"
echo "   → Skip initializing (ya tienes .git local)"
echo ""

echo "2️⃣  Agregar remoto y push:"
echo "   git remote add origin https://github.com/TU_USUARIO/mediagenda.git"
echo "   git branch -M main"
echo "   git add ."
echo "   git commit -m 'Initial commit: MediAgenda MVP - Seguridad, RBAC, Tests y UI - Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>'"
echo "   git push -u origin main"
echo ""

echo "3️⃣  Crear Blueprint en Render:"
echo "   → https://dashboard.render.com"
echo "   → New → Blueprint → Select GitHub repository"
echo "   → Render detecta render.yaml automáticamente"
echo "   → Verifica env vars: SECRET_KEY (auto), DATABASE_URL (auto)"
echo "   → Deploy 🎉"
echo ""

echo "4️⃣  Post-deployment (Render Console):"
echo "   python manage.py createsuperuser"
echo "   # Crear usuario admin para pruebas"
echo ""

echo "✨ ¡Listo para producción!"
