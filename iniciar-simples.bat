@echo off
echo 🧹 LIMPEZA E INICIALIZACAO SIMPLES DO CONNEXA
echo ==========================================
echo.

cd /d "%~dp0"

echo 🛑 Parando processos...
taskkill /f /im node.exe >nul 2>&1
taskkill /f /im npm.exe >nul 2>&1

echo.
echo 🧹 Limpando cache...
call npm cache clean --force >nul 2>&1

echo.
echo 🗑️ Removendo dependencias antigas...
if exist "node_modules" rmdir /s /q "node_modules" >nul 2>&1
if exist "package-lock.json" del /q "package-lock.json" >nul 2>&1

cd frontend
if exist "node_modules" rmdir /s /q "node_modules" >nul 2>&1
if exist "package-lock.json" del /q "package-lock.json" >nul 2>&1

echo.
echo 📦 Reinstalando dependencias...
cd /d "%~dp0"
echo   Backend...
call npm install
if errorlevel 1 (
    echo ❌ Erro ao instalar dependencias do backend
    pause
    exit /b 1
)

cd frontend
echo   Frontend...
call npm install
if errorlevel 1 (
    echo ❌ Erro ao instalar dependencias do frontend
    pause
    exit /b 1
)

echo.
echo 🚀 Iniciando servicos...
cd /d "%~dp0"

echo   Iniciando Backend...
start "Backend Connexa" cmd /k "title Backend Connexa & echo 🖥️ Backend Connexa & npm start"

timeout /t 3 /nobreak >nul

echo   Iniciando Frontend...
cd frontend
start "Frontend Connexa" cmd /k "title Frontend Connexa & echo 🌐 Frontend Connexa & set PORT=3002 & npm start"

echo.
echo ✅ INICIALIZACAO CONCLUIDA!
echo.
echo 🌐 URLs:
echo    Frontend: http://localhost:3002
echo    Backend:  http://localhost:3001
echo.
echo ⏳ Aguardando 5 segundos...
timeout /t 5 /nobreak >nul

echo 🌐 Abrindo navegador...
start http://localhost:3002

echo.
echo 🎉 Projeto Connexa iniciado com sucesso!
echo Verifique as janelas abertas para os logs.
echo.
pause