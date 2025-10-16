#!/bin/bash
# Quick start script for local development

set -e

echo "🚀 Smart TCO Calculator - Quick Start"
echo ""

# Check Python version
echo "🐍 Checking Python version..."
python_version=$(python3 --version 2>&1 | awk '{print $2}')
echo "   Found Python $python_version"

# Create virtual environment if not exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "✅ Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📥 Installing dependencies..."
pip install --upgrade pip
pip install -r backend/requirements.txt

# Create .env if not exists
if [ ! -f "backend/.env" ]; then
    echo "⚙️  Creating .env file..."
    cp backend/.env.example backend/.env
    echo "   ⚠️  Please edit backend/.env with your API keys"
fi

# Create data directory
mkdir -p backend/data

echo ""
echo "✅ Setup complete!"
echo ""
echo "📝 Next steps:"
echo "   1. Edit backend/.env with your GEMINI_API_KEY"
echo "   2. Run: cd backend && uvicorn main:app --reload"
echo "   3. Open: http://localhost:8000/docs"
echo ""
echo "🎯 Test endpoints:"
echo "   Health: curl http://localhost:8000/health"
echo "   Materials: curl http://localhost:8000/api/materials"
echo ""
echo "Happy coding! 🚀"
