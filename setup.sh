#!/bin/bash
# Quick LMS Setup Script

echo "🚀 LMS Backend-Frontend Setup"
echo "================================"

# Frontend Setup
echo ""
echo "📱 Setting up Frontend..."
cd frontend

if [ ! -f ".env.local" ]; then
  echo "REACT_APP_API_URL=http://localhost:5000/api" > .env.local
  echo "✓ Created .env.local with local API URL"
else
  echo "✓ .env.local already exists"
fi

# Backend Setup
echo ""
echo "🔧 Setting up Backend..."
cd ../backend

if [ ! -f ".env" ]; then
  # Copy from example
  if [ -f ".env.example" ]; then
    cp .env.example .env
    echo "✓ Created .env from .env.example"
    echo "⚠️  Edit .env with your actual credentials"
  else
    echo "✗ .env.example not found"
  fi
else
  echo "✓ .env already exists"
fi

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

cd ..
echo ""
echo "✅ Setup complete!"
echo ""
echo "📝 Quick Start Commands:"
echo "  Backend:  cd backend && npm start"
echo "  Frontend: cd frontend && npm start"
echo ""
echo "🌐 URLs:"
echo "  Frontend: http://localhost:3000"
echo "  Backend:  http://localhost:5000"
