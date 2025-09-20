@echo off
echo 🚀 Iniciando Projeto Connexa...
echo.

cd /d "c:\Users\pichau\OneDrive\Documentos\connexa-engs3\connexa"

echo 📦 Verificando dependências...
if not exist "node_modules" (
    echo Instalando dependências do backend...
    call npm install
)

cd frontend
if not exist "node_modules" (
    echo Instalando dependências do frontend...
    call npm install
)

echo.
echo 🔧 Iniciando serviços...

:: Iniciar backend
echo Iniciando Backend...
cd /d "c:\Users\pichau\OneDrive\Documentos\connexa-engs3\connexa"
start "Backend Connexa" cmd /k "echo Backend Connexa & npm start"

:: Aguardar backend iniciar
timeout /t 3 /nobreak >nul

:: Iniciar frontend
echo Iniciando Frontend...
cd frontend
start "Frontend Connexa" cmd /k "echo Frontend Connexa & set PORT=3002 & npm start"

echo.
echo ✅ Projeto inicializado!
echo.
echo 🌐 URLs:
echo    Frontend: http://localhost:3002
echo    Backend:  http://localhost:3001
echo.
echo 📝 Verifique as janelas abertas para ver os logs
echo.
pause