# Script de Diagnóstico do Connexa
# Identifica problemas de conexão e configuração

Write-Host "🔍 DIAGNÓSTICO CONNEXA - Investigando EER_CONNECTION_REFUSED" -ForegroundColor Yellow
Write-Host "=================================================================" -ForegroundColor Gray
Write-Host ""

$BaseDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# 1. Verificar processos MySQL rodando
Write-Host "1. 🔍 Verificando processos MySQL..." -ForegroundColor Cyan
try {
    $mysqlProcesses = Get-Process | Where-Object { $_.ProcessName -like "*mysql*" -or $_.ProcessName -like "*mariadb*" }
    if ($mysqlProcesses) {
        Write-Host "⚠️  Processos MySQL encontrados:" -ForegroundColor Yellow
        $mysqlProcesses | ForEach-Object {
            Write-Host "   - $($_.ProcessName) (PID: $($_.Id))" -ForegroundColor Gray
        }
        Write-Host "   Isso pode estar causando conflitos!" -ForegroundColor Yellow
    } else {
        Write-Host "✅ Nenhum processo MySQL rodando" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️  Erro ao verificar processos MySQL" -ForegroundColor Yellow
}

Write-Host ""

# 2. Verificar portas ocupadas
Write-Host "2. 🔍 Verificando portas importantes..." -ForegroundColor Cyan
$ports = @(3001, 3002, 3306, 5432)
foreach ($port in $ports) {
    try {
        $connection = Test-NetConnection -ComputerName localhost -Port $port -InformationLevel Quiet -WarningAction SilentlyContinue
        if ($connection) {
            $process = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
            if ($process) {
                $processInfo = Get-Process -Id $process[0].OwningProcess -ErrorAction SilentlyContinue
                Write-Host "   Porta $port: ✅ OCUPADA por $($processInfo.ProcessName)" -ForegroundColor Green
            } else {
                Write-Host "   Porta $port: ✅ OCUPADA" -ForegroundColor Green
            }
        } else {
            Write-Host "   Porta $port: ⭕ LIVRE" -ForegroundColor Gray
        }
    } catch {
        Write-Host "   Porta $port: ❓ DESCONHECIDO" -ForegroundColor Yellow
    }
}

Write-Host ""

# 3. Verificar variáveis de ambiente problemáticas
Write-Host "3. 🔍 Verificando variáveis de ambiente..." -ForegroundColor Cyan
$envVars = @("DATABASE_URL", "DB_HOST", "DB_USER", "DB_PASSWORD", "MYSQL_HOST", "MYSQL_USER", "MYSQL_PASSWORD")
$foundEnvVars = @()

foreach ($var in $envVars) {
    $value = [Environment]::GetEnvironmentVariable($var)
    if ($value) {
        $foundEnvVars += "$var = $value"
    }
}

if ($foundEnvVars.Count -gt 0) {
    Write-Host "⚠️  Variáveis de ambiente de banco encontradas:" -ForegroundColor Yellow
    $foundEnvVars | ForEach-Object {
        Write-Host "   - $_" -ForegroundColor Gray
    }
    Write-Host "   Isso pode estar interferindo!" -ForegroundColor Yellow
} else {
    Write-Host "✅ Nenhuma variável de ambiente de banco problemática" -ForegroundColor Green
}

Write-Host ""

# 4. Verificar arquivos de configuração
Write-Host "4. 🔍 Verificando configurações do projeto..." -ForegroundColor Cyan

# Backend
$backendDb = Join-Path $BaseDir "backend\database.js"
if (Test-Path $backendDb) {
    $content = Get-Content $backendDb -Raw
    if ($content -match "mysql|MySQL") {
        Write-Host "⚠️  Configuração MySQL encontrada no backend/database.js" -ForegroundColor Yellow
    } else {
        Write-Host "✅ Backend configurado para SQLite" -ForegroundColor Green
    }
} else {
    Write-Host "❌ Arquivo backend/database.js não encontrado" -ForegroundColor Red
}

# Frontend .env
$frontendEnv = Join-Path $BaseDir "frontend\.env"
if (Test-Path $frontendEnv) {
    $content = Get-Content $frontendEnv -Raw
    if ($content -match "mysql|MySQL|3306") {
        Write-Host "⚠️  Configuração MySQL encontrada no frontend/.env" -ForegroundColor Yellow
    } else {
        Write-Host "✅ Frontend configurado corretamente" -ForegroundColor Green
    }
} else {
    Write-Host "⚠️  Arquivo frontend/.env não encontrado" -ForegroundColor Yellow
}

Write-Host ""

# 5. Testar conectividade básica
Write-Host "5. 🔍 Testando conectividade..." -ForegroundColor Cyan

# Testar backend
try {
    $backendTest = Invoke-WebRequest -Uri "http://localhost:3001" -UseBasicParsing -TimeoutSec 3 -ErrorAction Stop
    Write-Host "✅ Backend respondendo na porta 3001" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend não responde na porta 3001" -ForegroundColor Red
    Write-Host "   Erro: $($_.Exception.Message)" -ForegroundColor Gray
}

# Testar frontend
try {
    $frontendTest = Invoke-WebRequest -Uri "http://localhost:3002" -UseBasicParsing -TimeoutSec 3 -ErrorAction Stop
    Write-Host "✅ Frontend respondendo na porta 3002" -ForegroundColor Green
} catch {
    Write-Host "❌ Frontend não responde na porta 3002" -ForegroundColor Red
    Write-Host "   Erro: $($_.Exception.Message)" -ForegroundColor Gray
}

Write-Host ""

# 6. Verificar logs recentes
Write-Host "6. 🔍 Sugestões de resolução..." -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 POSSÍVEIS CAUSAS DO EER_CONNECTION_REFUSED:" -ForegroundColor Yellow
Write-Host "   1. Algum serviço está tentando conectar ao MySQL (porta 3306)" -ForegroundColor Gray
Write-Host "   2. Variável de ambiente incorreta configurada" -ForegroundColor Gray
Write-Host "   3. Dependência oculta tentando conectar ao MySQL" -ForegroundColor Gray
Write-Host "   4. Cache do npm com configurações antigas" -ForegroundColor Gray
Write-Host ""
Write-Host "🔧 SOLUÇÕES RECOMENDADAS:" -ForegroundColor Green
Write-Host "   1. Limpar cache do npm: npm cache clean --force" -ForegroundColor Gray
Write-Host "   2. Reinstalar dependências: rm -rf node_modules && npm install" -ForegroundColor Gray
Write-Host "   3. Verificar logs do navegador (F12 -> Console)" -ForegroundColor Gray
Write-Host "   4. Reiniciar completamente os serviços" -ForegroundColor Gray
Write-Host ""
Write-Host "🚀 COMANDO DE LIMPEZA RÁPIDA:" -ForegroundColor Green
Write-Host "   .\limpar-e-iniciar.ps1" -ForegroundColor Cyan
Write-Host ""