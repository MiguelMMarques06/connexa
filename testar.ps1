# Teste Rápido do Sistema de Registro
# Execute este script para testar rapidamente

Write-Host "🧪 Testando Sistema Connexa..." -ForegroundColor Green
Write-Host ""

$BaseDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Verificar se o backend está rodando
Write-Host "🔍 Verificando backend..." -ForegroundColor Yellow
try {
    $backendTest = Invoke-WebRequest -Uri "http://localhost:3001/api/health" -UseBasicParsing -TimeoutSec 5 -ErrorAction SilentlyContinue
    if ($backendTest.StatusCode -eq 200) {
        Write-Host "✅ Backend respondendo na porta 3001" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Backend resposta inesperada: $($backendTest.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Backend não está respondendo na porta 3001" -ForegroundColor Red
    Write-Host "   Certifique-se de que o backend está rodando" -ForegroundColor Gray
}

# Verificar se o frontend está rodando
Write-Host "🔍 Verificando frontend..." -ForegroundColor Yellow
try {
    $frontendTest = Invoke-WebRequest -Uri "http://localhost:3002" -UseBasicParsing -TimeoutSec 5 -ErrorAction SilentlyContinue
    if ($frontendTest.StatusCode -eq 200) {
        Write-Host "✅ Frontend respondendo na porta 3002" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Frontend resposta inesperada: $($frontendTest.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Frontend não está respondendo na porta 3002" -ForegroundColor Red
    Write-Host "   Certifique-se de que o frontend está rodando" -ForegroundColor Gray
}

# Verificar arquivos de configuração
Write-Host ""
Write-Host "📋 Verificando configurações..." -ForegroundColor Yellow

$backendEnv = Join-Path $BaseDir ".env"
$frontendEnv = Join-Path $BaseDir "frontend\.env"

if (Test-Path $backendEnv) {
    Write-Host "✅ Arquivo .env do backend encontrado" -ForegroundColor Green
} else {
    Write-Host "❌ Arquivo .env do backend não encontrado" -ForegroundColor Red
}

if (Test-Path $frontendEnv) {
    Write-Host "✅ Arquivo .env do frontend encontrado" -ForegroundColor Green
} else {
    Write-Host "❌ Arquivo .env do frontend não encontrado" -ForegroundColor Red
}

# Verificar dependências
Write-Host ""
Write-Host "📦 Verificando dependências..." -ForegroundColor Yellow

$backendNodeModules = Join-Path $BaseDir "node_modules"
$frontendNodeModules = Join-Path $BaseDir "frontend\node_modules"

if (Test-Path $backendNodeModules) {
    Write-Host "✅ Dependências do backend instaladas" -ForegroundColor Green
} else {
    Write-Host "❌ Dependências do backend não instaladas" -ForegroundColor Red
    Write-Host "   Execute: npm install" -ForegroundColor Gray
}

if (Test-Path $frontendNodeModules) {
    Write-Host "✅ Dependências do frontend instaladas" -ForegroundColor Green
} else {
    Write-Host "❌ Dependências do frontend não instaladas" -ForegroundColor Red
    Write-Host "   Execute: cd frontend && npm install" -ForegroundColor Gray
}

Write-Host ""
Write-Host "🌐 URLs para testar:" -ForegroundColor Yellow
Write-Host "   Frontend: http://localhost:3002" -ForegroundColor Cyan
Write-Host "   Backend:  http://localhost:3001" -ForegroundColor Cyan
Write-Host ""
Write-Host "🧪 Para testar o registro:" -ForegroundColor Yellow
Write-Host "   1. Abra http://localhost:3002" -ForegroundColor Gray
Write-Host "   2. Clique em 'Cadastre-se aqui'" -ForegroundColor Gray
Write-Host "   3. Preencha o formulário com dados válidos" -ForegroundColor Gray
Write-Host "   4. Certifique-se de usar senha forte (8+ chars, maiúscula, minúscula, número, símbolo)" -ForegroundColor Gray

Write-Host ""
Write-Host "✅ Teste concluído!" -ForegroundColor Green