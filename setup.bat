@echo off
REM Quick LMS Setup Script for Windows

echo.
echo 🚀 LMS Backend-Frontend Setup
echo ================================
echo.

REM Frontend Setup
echo 📱 Setting up Frontend...
cd frontend

if not exist ".env.local" (
  (
    echo REACT_APP_API_URL=http://localhost:5000/api
  ) > .env.local
  echo ✓ Created .env.local with local API URL
) else (
  echo ✓ .env.local already exists
)

REM Backend Setup
echo.
echo 🔧 Setting up Backend...
cd ..\backend

if not exist ".env" (
  if exist ".env.example" (
    copy .env.example .env
    echo ✓ Created .env from .env.example
    echo ⚠️  Edit .env with your actual credentials
  ) else (
    echo ✗ .env.example not found
  )
) else (
  echo ✓ .env already exists
)

REM Install dependencies
echo.
echo 📦 Installing dependencies...
call npm install

cd ..
echo.
echo ✅ Setup complete!
echo.
echo 📝 Quick Start Commands:
echo   Backend:  cd backend ^&^& npm start
echo   Frontend: cd frontend ^&^& npm start
echo.
echo 🌐 URLs:
echo   Frontend: http://localhost:3000
echo   Backend:  http://localhost:5000
echo.
pause
