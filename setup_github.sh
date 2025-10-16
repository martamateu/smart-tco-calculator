#!/bin/bash
# Setup GitHub repository and deploy frontend to GitHub Pages

set -e

echo "🚀 Smart TCO Calculator - GitHub Pages Setup"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found"
    echo "   Please run this script from the project root"
    exit 1
fi

# Initialize git if not already done
if [ ! -d ".git" ]; then
    echo "1️⃣  Inicializando repositorio Git..."
    git init
    echo "   ✅ Git inicializado"
else
    echo "1️⃣  ✅ Repositorio Git ya existe"
fi

# Create .gitignore if doesn't exist
if [ ! -f ".gitignore" ]; then
    echo "2️⃣  Creando .gitignore..."
    cat > .gitignore << 'EOF'
# Dependencies
node_modules/
backend/venv/
backend/__pycache__/
backend/**/__pycache__/

# Build outputs
dist/
build/
*.pyc
*.pyo

# Environment variables
.env
.env.local
.env.production

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Cache
backend/data/cache/
*.log

# Secrets (already in Secret Manager)
*_api_key.txt
/tmp/

# Cloud
.gcloud/
EOF
    echo "   ✅ .gitignore creado"
else
    echo "2️⃣  ✅ .gitignore ya existe"
fi

# Stage all files
echo "3️⃣  Agregando archivos a Git..."
git add .
echo "   ✅ Archivos agregados"

# Initial commit
if ! git rev-parse HEAD >/dev/null 2>&1; then
    echo "4️⃣  Creando commit inicial..."
    git commit -m "🎉 Initial commit - Smart TCO Calculator

- Backend API (FastAPI) deployed to Cloud Run
- Frontend (React + TypeScript + Vite)
- Real-time energy prices (ENTSO-E + EIA)
- 72% live data coverage (13/18 regions)
- Automatic updates via Cloud Scheduler
- RAG-based AI assistant
"
    echo "   ✅ Commit creado"
else
    echo "4️⃣  Creando commit con cambios de deployment..."
    git commit -m "🚀 Setup GitHub Pages deployment

- Configure GitHub Actions workflow
- Update API URLs for production
- Add deployment documentation
" || echo "   ℹ️  No hay cambios para commitear"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Git configurado localmente!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 PRÓXIMOS PASOS:"
echo ""
echo "1️⃣  Crear repositorio en GitHub:"
echo "   • Ir a: https://github.com/new"
echo "   • Repository name: smart-tco-calculator"
echo "   • Visibility: Public (para GitHub Pages gratis)"
echo "   • NO inicializar con README (ya lo tienes local)"
echo ""
echo "2️⃣  Conectar este repo con GitHub:"
echo "   git remote add origin https://github.com/martamateu18/smart-tco-calculator.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "3️⃣  Habilitar GitHub Pages:"
echo "   • Ir a: Settings → Pages"
echo "   • Source: GitHub Actions"
echo "   • Guardar"
echo ""
echo "4️⃣  La primera vez que hagas push, GitHub Actions:"
echo "   • Instalará dependencias"
echo "   • Compilará el frontend"
echo "   • Lo deployará a GitHub Pages"
echo "   • URL será: https://martamateu18.github.io/smart-tco-calculator/"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "¿Quieres que abra GitHub para crear el repo? (y/n)"
read -r response
if [[ "$response" =~ ^[Yy]$ ]]; then
    open "https://github.com/new"
    echo "✅ Abriendo GitHub en tu navegador..."
fi
echo ""
