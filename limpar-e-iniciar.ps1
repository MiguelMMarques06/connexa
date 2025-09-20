# Script de Limpeza e Inicialização Limpa do Connexa
# Resolve problemas de cache e dependências

Write-Host "🧹 LIMPEZA COMPLETA DO PROJETO CONNEXA" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Gray
Write-Host ""

$BaseDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$FrontendDir = Join-Path $BaseDir "frontend"

# Função para matar processos nas portas
function Kill-ProcessOnPort {
    param($Port)
    Write-Host "🔄 Liberando porta $Port..." -ForegroundColor Yellow
    try {
        $processes = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
        if ($processes) {
            $processes | ForEach-Object {
                $process = Get-Process -Id $_.OwningProcess -ErrorAction SilentlyContinue
                if ($process) {
                    Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
                    Write-Host "   ✅ Processo $($process.ProcessName) finalizado" -ForegroundColor Green
                }
            }
        } else {
            Write-Host "   ✅ Porta $Port já estava livre" -ForegroundColor Green
        }
    } catch {
        Write-Host "   ⚠️  Erro ao liberar porta $Port" -ForegroundColor Yellow
    }
}

# 1. Parar todos os processos
Write-Host "1. 🛑 Parando processos..." -ForegroundColor Cyan
Kill-ProcessOnPort 3001
Kill-ProcessOnPort 3002
Kill-ProcessOnPort 3000

# Matar processos Node.js relacionados ao projeto
try {
    $nodeProcesses = Get-Process | Where-Object { 
        $_.ProcessName -eq "node" -and 
        $_.MainWindowTitle -like "*connexa*" 
    }
    $nodeProcesses | ForEach-Object {
        Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
        Write-Host "   ✅ Processo Node.js finalizado" -ForegroundColor Green
    }
} catch {
    Write-Host "   ⚠️  Erro ao finalizar processos Node.js" -ForegroundColor Yellow
}

Write-Host ""

# 2. Limpar cache
Write-Host "2. 🧹 Limpando cache..." -ForegroundColor Cyan
Set-Location $BaseDir

Write-Host "   Limpando cache do npm..." -ForegroundColor Gray
npm cache clean --force 2>$null

Write-Host "   Limpando cache do yarn (se existir)..." -ForegroundColor Gray
if (Get-Command yarn -ErrorAction SilentlyContinue) {
    yarn cache clean 2>$null
}

Write-Host "✅ Cache limpo" -ForegroundColor Green
Write-Host ""

# 3. Remover node_modules
Write-Host "3. 🗑️  Removendo dependências antigas..." -ForegroundColor Cyan

# Backend
if (Test-Path "node_modules") {
    Write-Host "   Removendo node_modules do backend..." -ForegroundColor Gray
    Remove-Item -Recurse -Force "node_modules" -ErrorAction SilentlyContinue
}

if (Test-Path "package-lock.json") {
    Write-Host "   Removendo package-lock.json do backend..." -ForegroundColor Gray
    Remove-Item -Force "package-lock.json" -ErrorAction SilentlyContinue
}

# Frontend
Set-Location $FrontendDir

if (Test-Path "node_modules") {
    Write-Host "   Removendo node_modules do frontend..." -ForegroundColor Gray
    Remove-Item -Recurse -Force "node_modules" -ErrorAction SilentlyContinue
}

if (Test-Path "package-lock.json") {
    Write-Host "   Removendo package-lock.json do frontend..." -ForegroundColor Gray
    Remove-Item -Force "package-lock.json" -ErrorAction SilentlyContinue
}

Write-Host "✅ Dependências antigas removidas" -ForegroundColor Green
Write-Host ""

# 4. Limpar variáveis de ambiente problemáticas
Write-Host "4. 🔧 Limpando variáveis de ambiente..." -ForegroundColor Cyan
$envVarsToRemove = @("DATABASE_URL", "DB_HOST", "DB_USER", "DB_PASSWORD", "MYSQL_HOST", "MYSQL_USER", "MYSQL_PASSWORD")

foreach ($var in $envVarsToRemove) {
    if ([Environment]::GetEnvironmentVariable($var)) {
        [Environment]::SetEnvironmentVariable($var, $null, "Process")
        Write-Host "   ✅ Removida variável $var da sessão atual" -ForegroundColor Green
    }
}

Write-Host ""

# 5. Reinstalar dependências
Write-Host "5. 📦 Reinstalando dependências..." -ForegroundColor Cyan

# Backend
Set-Location $BaseDir
Write-Host "   Instalando dependências do backend..." -ForegroundColor Gray
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro ao instalar dependências do backend" -ForegroundColor Red
    exit 1
}

# Frontend
Set-Location $FrontendDir
Write-Host "   Instalando dependências do frontend..." -ForegroundColor Gray
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro ao instalar dependências do frontend" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Dependências reinstaladas com sucesso" -ForegroundColor Green
Write-Host ""

# 6. Verificar arquivos de configuração
Write-Host "6. 🔧 Verificando configurações..." -ForegroundColor Cyan

Set-Location $BaseDir

# Criar .env do backend se necessário
if (-not (Test-Path ".env")) {
    Write-Host "   Criando .env do backend..." -ForegroundColor Gray
    @"
# Configurações do Backend
PORT=3001
JWT_SECRET=connexa-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h

# Configurações do Banco SQLite (NÃO MySQL!)
DB_PATH=./database/connexa.db

# Configurações de Segurança
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
"@ | Out-File -FilePath ".env" -Encoding UTF8
}

# Verificar .env do frontend
Set-Location $FrontendDir
if (-not (Test-Path ".env")) {
    Write-Host "   Criando .env do frontend..." -ForegroundColor Gray
    @"
# Configurações de Criptografia Frontend
REACT_APP_ENCRYPTION_KEY=connexa-encryption-key-change-in-production
REACT_APP_HMAC_KEY=connexa-hmac-key-change-in-production

# URL da API (SEM MySQL!)
REACT_APP_API_URL=http://localhost:3001/api
"@ | Out-File -FilePath ".env" -Encoding UTF8
}

Write-Host "✅ Configurações verificadas" -ForegroundColor Green
Write-Host ""

# 7. Iniciar serviços
Write-Host "7. 🚀 Iniciando serviços limpos..." -ForegroundColor Cyan

Set-Location $BaseDir

# Backend
Write-Host "   Iniciando backend..." -ForegroundColor Gray
$backendCommand = "cd '$BaseDir'; Write-Host '🖥️  Backend Connexa (LIMPO)' -ForegroundColor Green; npm start"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendCommand

Start-Sleep -Seconds 3

# Frontend
Write-Host "   Iniciando frontend..." -ForegroundColor Gray
Set-Location $FrontendDir
$frontendCommand = "cd '$FrontendDir'; `$env:PORT='3002'; Write-Host '🌐 Frontend Connexa (LIMPO)' -ForegroundColor Blue; npm start"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendCommand

Write-Host ""
Write-Host "✅ LIMPEZA E INICIALIZAÇÃO CONCLUÍDA!" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 URLs disponíveis:" -ForegroundColor Yellow
Write-Host "   Frontend: http://localhost:3002" -ForegroundColor Cyan
Write-Host "   Backend:  http://localhost:3001" -ForegroundColor Cyan
Write-Host ""
Write-Host "📝 O que foi feito:" -ForegroundColor Yellow
Write-Host "   ✅ Processos parados" -ForegroundColor Gray
Write-Host "   ✅ Cache limpo" -ForegroundColor Gray
Write-Host "   ✅ Dependências reinstaladas" -ForegroundColor Gray
Write-Host "   ✅ Variáveis de ambiente limpas" -ForegroundColor Gray
Write-Host "   ✅ Configurações verificadas" -ForegroundColor Gray
Write-Host "   ✅ Serviços reiniciados" -ForegroundColor Gray
Write-Host ""
Write-Host "⏳ Aguarde 10 segundos e teste: http://localhost:3002" -ForegroundColor Green

Start-Sleep -Seconds 5
Write-Host "🌐 Abrindo navegador..." -ForegroundColor Green
Start-Process "http://localhost:3002"

Write-Host ""
Write-Host "Se o erro EER_CONNECTION_REFUSED persistir, execute:" -ForegroundColor Yellow
Write-Host ".\diagnostico.ps1" -ForegroundColor Cyan