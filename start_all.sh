#!/bin/bash
# Script para iniciar Frontend + Backend correctamente

echo "🚀 Iniciando Smart TCO Calculator..."
echo ""

# Matar procesos anteriores COMPLETAMENTE
echo "🧹 Limpiando procesos anteriores..."
pkill -9 -f "vite" 2>/dev/null
pkill -9 -f "uvicorn" 2>/dev/null
pkill -9 -f "node.*vite" 2>/dev/null
lsof -ti:3000 | xargs kill -9 2>/dev/null
lsof -ti:3001 | xargs kill -9 2>/dev/null
lsof -ti:3002 | xargs kill -9 2>/dev/null
lsof -ti:8000 | xargs kill -9 2>/dev/null
sleep 3

# Directorio base
cd "$(dirname "$0")"

# 1. Iniciar Backend
echo "🔧 Iniciando Backend (FastAPI)..."
cd backend
source venv/bin/activate
cd ..
python -m uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000 > /tmp/backend.log 2>&1 &
BACKEND_PID=$!
echo "   ✅ Backend PID: $BACKEND_PID"
sleep 3

# Verificar backend
if curl -s http://localhost:8000/health > /dev/null; then
    echo "   ✅ Backend healthy: http://localhost:8000"
else
    echo "   ❌ Backend error. Check /tmp/backend.log"
    tail -20 /tmp/backend.log
    exit 1
fi

# 2. Iniciar Frontend
echo ""
echo "🎨 Iniciando Frontend (Vite)..."
npm run dev > /tmp/frontend.log 2>&1 &
FRONTEND_PID=$!
echo "   ✅ Frontend PID: $FRONTEND_PID"
sleep 3

# Verificar frontend
if lsof -ti:3000 > /dev/null; then
    echo "   ✅ Frontend running: http://localhost:3000"
else
    echo "   ❌ Frontend error. Check /tmp/frontend.log"
    tail -20 /tmp/frontend.log
    exit 1
fi

echo ""
echo "✅ TODO LISTO!"
echo ""
echo "📊 URLs:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:8000"
echo "   Health:   http://localhost:8000/health"
echo ""
echo "📝 Logs:"
echo "   Frontend: tail -f /tmp/frontend.log"
echo "   Backend:  tail -f /tmp/backend.log"
echo ""
echo "🛑 Para detener:"
echo "   pkill -f vite && pkill -f uvicorn"
