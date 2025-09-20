# Versão segura que contorna política de execução
# Execute: powershell -ExecutionPolicy Bypass -File .\iniciar-seguro.ps1

Write-Host "🧹 LIMPEZA E INICIALIZACAO SEGURA DO CONNEXA" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Gray
Write-Host ""

$BaseDir = $PSScriptRoot
if (-not $BaseDir) {
    $BaseDir = Split-Path -Parent $MyInvocation.MyCommand.Path
}
$FrontendDir = Join-Path $BaseDir "frontend"

# 1. Parar processos
Write-Host "🛑 Parando processos..." -ForegroundColor Cyan
try {
    Get-Process | Where-Object {$_.ProcessName -eq "node"} | Stop-Process -Force -ErrorAction SilentlyContinue
    Get-Process | Where-Object {$_.ProcessName -eq "npm"} | Stop-Process -Force -ErrorAction SilentlyContinue
    Write-Host "✅ Processos parados" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Alguns processos podem não ter sido parados" -ForegroundColor Yellow
}

Write-Host ""

# 2. Limpar cache
Write-Host "🧹 Limpando cache..." -ForegroundColor Cyan
Set-Location $BaseDir
try {
    & npm cache clean --force 2>$null
    Write-Host "✅ Cache limpo" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Erro ao limpar cache" -ForegroundColor Yellow
}

Write-Host ""

# 3. Remover node_modules
Write-Host "🗑️ Removendo dependências antigas..." -ForegroundColor Cyan

# Backend
if (Test-Path "node_modules") {
    Remove-Item -Recurse -Force "node_modules" -ErrorAction SilentlyContinue
}
if (Test-Path "package-lock.json") {
    Remove-Item -Force "package-lock.json" -ErrorAction SilentlyContinue
}

# Frontend
Set-Location $FrontendDir
if (Test-Path "node_modules") {
    Remove-Item -Recurse -Force "node_modules" -ErrorAction SilentlyContinue
}
if (Test-Path "package-lock.json") {
    Remove-Item -Force "package-lock.json" -ErrorAction SilentlyContinue
}

Write-Host "✅ Dependências antigas removidas" -ForegroundColor Green
Write-Host ""

# 4. Reinstalar dependências
Write-Host "📦 Reinstalando dependências..." -ForegroundColor Cyan

# Backend
Set-Location $BaseDir
Write-Host "   Backend..." -ForegroundColor Gray
& npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro ao instalar dependências do backend" -ForegroundColor Red
    Read-Host "Pressione Enter para continuar"
    exit 1
}

# Frontend
Set-Location $FrontendDir
Write-Host "   Frontend..." -ForegroundColor Gray
& npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro ao instalar dependências do frontend" -ForegroundColor Red
    Read-Host "Pressione Enter para continuar"
    exit 1
}

Write-Host "✅ Dependências reinstaladas" -ForegroundColor Green
Write-Host ""

# 5. Iniciar serviços usando cmd para contornar política
Write-Host "🚀 Iniciando serviços..." -ForegroundColor Cyan

# Backend
Write-Host "   Iniciando Backend..." -ForegroundColor Gray
Set-Location $BaseDir
$backendScript = "cd /d `"$BaseDir`" && title Backend Connexa && echo 🖥️ Backend Connexa && npm start"
Start-Process cmd -ArgumentList "/k", $backendScript

Start-Sleep -Seconds 3

# Frontend
Write-Host "   Iniciando Frontend..." -ForegroundColor Gray
$frontendScript = "cd /d `"$FrontendDir`" && title Frontend Connexa && echo 🌐 Frontend Connexa && set PORT=3002 && npm start"
Start-Process cmd -ArgumentList "/k", $frontendScript

Write-Host ""
Write-Host "✅ INICIALIZAÇÃO CONCLUÍDA!" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 URLs:" -ForegroundColor Yellow
Write-Host "   Frontend: http://localhost:3002" -ForegroundColor Cyan
Write-Host "   Backend:  http://localhost:3001" -ForegroundColor Cyan
Write-Host ""
Write-Host "⏳ Aguardando 5 segundos..." -ForegroundColor Gray
Start-Sleep -Seconds 5

Write-Host "🌐 Abrindo navegador..." -ForegroundColor Green
Start-Process "http://localhost:3002"

Write-Host ""
Write-Host "🎉 Projeto Connexa iniciado com sucesso!" -ForegroundColor Green
Write-Host "Verifique as janelas CMD abertas para os logs." -ForegroundColor Gray
Write-Host ""
Write-Host "Pressione qualquer tecla para finalizar..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")