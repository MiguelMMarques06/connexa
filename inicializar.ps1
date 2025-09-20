# Script de Inicialização do Projeto Connexa
# Execute este script no PowerShell

Write-Host "🚀 Iniciando Projeto Connexa..." -ForegroundColor Green
Write-Host ""

# Definir diretório base (usar diretório atual do script)
$BaseDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$FrontendDir = Join-Path $BaseDir "frontend"

Write-Host "📁 Verificando diretórios..." -ForegroundColor Yellow
Write-Host "   Base: $BaseDir" -ForegroundColor Gray

if (-not (Test-Path $BaseDir)) {
    Write-Host "❌ Diretório base não encontrado: $BaseDir" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $FrontendDir)) {
    Write-Host "❌ Diretório frontend não encontrado: $FrontendDir" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Diretórios encontrados!" -ForegroundColor Green
Write-Host ""

# Função para matar processos nas portas
function Kill-ProcessOnPort {
    param($Port)
    
    Write-Host "🔍 Verificando porta $Port..." -ForegroundColor Yellow
    
    try {
        $processes = netstat -ano | Select-String ":$Port "
        if ($processes) {
            Write-Host "⚠️  Porta $Port está em uso. Liberando..." -ForegroundColor Yellow
            
            $pids = $processes | ForEach-Object {
                if ($_.ToString() -match '\s+(\d+)\s*$') {
                    $matches[1]
                }
            } | Where-Object { $_ } | Sort-Object -Unique
            
            foreach ($pid in $pids) {
                try {
                    $process = Get-Process -Id $pid -ErrorAction SilentlyContinue
                    if ($process) {
                        Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
                        Write-Host "✅ Processo $pid ($($process.ProcessName)) finalizado" -ForegroundColor Green
                    }
                } catch {
                    Write-Host "⚠️  Não foi possível finalizar processo $pid" -ForegroundColor Yellow
                }
            }
        } else {
            Write-Host "✅ Porta $Port está livre" -ForegroundColor Green
        }
    } catch {
        Write-Host "⚠️  Erro ao verificar porta $Port" -ForegroundColor Yellow
    }
    }
}

# Liberar portas
Kill-ProcessOnPort 3000
Kill-ProcessOnPort 3001
Kill-ProcessOnPort 3002

Write-Host ""
Write-Host "📦 Instalando dependências..." -ForegroundColor Yellow

# Instalar dependências do backend
Write-Host "Backend..." -ForegroundColor Cyan
Set-Location $BaseDir
if (-not (Test-Path "node_modules")) {
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Erro ao instalar dependências do backend" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✅ Dependências do backend já instaladas" -ForegroundColor Green
}

# Instalar dependências do frontend
Write-Host "Frontend..." -ForegroundColor Cyan
Set-Location $FrontendDir
if (-not (Test-Path "node_modules")) {
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Erro ao instalar dependências do frontend" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✅ Dependências do frontend já instaladas" -ForegroundColor Green
}

Write-Host ""
Write-Host "🔧 Criando arquivos de configuração..." -ForegroundColor Yellow

# Criar .env do backend se não existir
$BackendEnv = Join-Path $BaseDir ".env"
if (-not (Test-Path $BackendEnv)) {
    @"
# Configurações do Backend
PORT=3001
JWT_SECRET=connexa-super-secret-jwt-key-change-in-production-$(Get-Random)
JWT_EXPIRES_IN=24h

# Configurações do Banco
DB_PATH=./database/connexa.db

# Configurações de Segurança
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
"@ | Out-File -FilePath $BackendEnv -Encoding UTF8
    Write-Host "✅ Arquivo .env do backend criado" -ForegroundColor Green
}

# Criar .env do frontend se não existir
$FrontendEnv = Join-Path $FrontendDir ".env"
if (-not (Test-Path $FrontendEnv)) {
    @"
# Configurações de Criptografia Frontend
REACT_APP_ENCRYPTION_KEY=connexa-encryption-key-change-in-production-$(Get-Random)
REACT_APP_HMAC_KEY=connexa-hmac-key-change-in-production-$(Get-Random)

# URL da API
REACT_APP_API_URL=http://localhost:3001
"@ | Out-File -FilePath $FrontendEnv -Encoding UTF8
    Write-Host "✅ Arquivo .env do frontend criado" -ForegroundColor Green
}

Write-Host ""
Write-Host "🚀 Iniciando serviços..." -ForegroundColor Green

# Iniciar backend em nova janela
Write-Host "Iniciando Backend na porta 3001..." -ForegroundColor Cyan
Set-Location $BaseDir
$backendCommand = "cd '$BaseDir'; Write-Host '🖥️  Backend Connexa' -ForegroundColor Green; npm start"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendCommand

# Aguardar backend iniciar
Write-Host "⏳ Aguardando backend inicializar..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Iniciar frontend em nova janela
Write-Host "Iniciando Frontend na porta 3002..." -ForegroundColor Cyan
Set-Location $FrontendDir
$frontendCommand = "cd '$FrontendDir'; `$env:PORT='3002'; Write-Host '🌐 Frontend Connexa' -ForegroundColor Blue; npm start"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendCommand

Write-Host ""
Write-Host "✅ Projeto inicializado com sucesso!" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 URLs disponíveis:" -ForegroundColor Yellow
Write-Host "   Frontend: http://localhost:3002" -ForegroundColor Cyan
Write-Host "   Backend:  http://localhost:3001" -ForegroundColor Cyan
Write-Host ""
Write-Host "📝 Logs:" -ForegroundColor Yellow
Write-Host "   - Backend: Nova janela PowerShell aberta" -ForegroundColor Gray
Write-Host "   - Frontend: Nova janela PowerShell aberta" -ForegroundColor Gray
Write-Host ""
Write-Host "🛑 Para parar os serviços:" -ForegroundColor Yellow
Write-Host "   - Feche as janelas do PowerShell" -ForegroundColor Gray
Write-Host "   - Ou use Ctrl+C em cada terminal" -ForegroundColor Gray
Write-Host ""

# Aguardar um pouco e abrir navegador
Start-Sleep -Seconds 5
Write-Host "🌐 Abrindo navegador..." -ForegroundColor Green
Start-Process "http://localhost:3002"

Write-Host ""
Write-Host "🎉 Projeto Connexa está rodando!" -ForegroundColor Green
Write-Host "Pressione qualquer tecla para finalizar este script..." -ForegroundColor Yellow
Read-Host