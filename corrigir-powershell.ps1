# Script para corrigir política de execução do PowerShell
# Execute como Administrador: powershell -ExecutionPolicy Bypass -File .\corrigir-powershell.ps1

Write-Host "🔧 CORRIGINDO POLÍTICA DE EXECUÇÃO DO POWERSHELL" -ForegroundColor Yellow
Write-Host "===============================================" -ForegroundColor Gray
Write-Host ""

# Verificar se está executando como administrador
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")

if (-not $isAdmin) {
    Write-Host "⚠️ Este script precisa ser executado como Administrador!" -ForegroundColor Red
    Write-Host ""
    Write-Host "🔧 Como executar como Administrador:" -ForegroundColor Yellow
    Write-Host "   1. Abra PowerShell como Administrador" -ForegroundColor Gray
    Write-Host "   2. Execute: cd '$PSScriptRoot'" -ForegroundColor Gray
    Write-Host "   3. Execute: powershell -ExecutionPolicy Bypass -File .\corrigir-powershell.ps1" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Ou use a alternativa segura sem privilégios:" -ForegroundColor Green
    Write-Host "   .\iniciar-simples.bat" -ForegroundColor Cyan
    Write-Host ""
    Read-Host "Pressione Enter para sair"
    exit 1
}

Write-Host "✅ Executando como Administrador" -ForegroundColor Green
Write-Host ""

# Mostrar política atual
Write-Host "📋 Política atual:" -ForegroundColor Cyan
$currentPolicy = Get-ExecutionPolicy
Write-Host "   $currentPolicy" -ForegroundColor Gray
Write-Host ""

# Definir política mais permissiva
Write-Host "🔧 Alterando política de execução..." -ForegroundColor Cyan
try {
    Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force
    Write-Host "✅ Política alterada para RemoteSigned (usuário atual)" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Erro ao alterar política para usuário atual" -ForegroundColor Yellow
    
    # Tentar política global
    try {
        Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope LocalMachine -Force
        Write-Host "✅ Política alterada para RemoteSigned (máquina local)" -ForegroundColor Green
    } catch {
        Write-Host "❌ Erro ao alterar política de execução" -ForegroundColor Red
        Write-Host "   Erro: $($_.Exception.Message)" -ForegroundColor Gray
    }
}

Write-Host ""

# Verificar nova política
Write-Host "📋 Nova política:" -ForegroundColor Cyan
$newPolicy = Get-ExecutionPolicy
Write-Host "   $newPolicy" -ForegroundColor Gray
Write-Host ""

if ($newPolicy -ne "Restricted") {
    Write-Host "✅ CORREÇÃO CONCLUÍDA!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📝 O que foi feito:" -ForegroundColor Yellow
    Write-Host "   - Política alterada de '$currentPolicy' para '$newPolicy'" -ForegroundColor Gray
    Write-Host "   - Scripts PowerShell agora podem ser executados" -ForegroundColor Gray
    Write-Host ""
    Write-Host "🚀 Agora você pode usar:" -ForegroundColor Green
    Write-Host "   .\inicializar.ps1" -ForegroundColor Cyan
    Write-Host "   .\limpar-e-iniciar.ps1" -ForegroundColor Cyan
    Write-Host "   .\diagnostico.ps1" -ForegroundColor Cyan
} else {
    Write-Host "❌ A política ainda está restritiva" -ForegroundColor Red
    Write-Host ""
    Write-Host "🔧 Alternativas:" -ForegroundColor Yellow
    Write-Host "   1. Use: .\iniciar-simples.bat" -ForegroundColor Cyan
    Write-Host "   2. Execute PowerShell sempre com: powershell -ExecutionPolicy Bypass -File script.ps1" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "ℹ️ Informações sobre políticas:" -ForegroundColor Blue
Write-Host "   - Restricted: Nenhum script pode ser executado" -ForegroundColor Gray
Write-Host "   - RemoteSigned: Scripts locais podem executar, remotos precisam assinatura" -ForegroundColor Gray
Write-Host "   - Unrestricted: Todos os scripts podem executar (menos seguro)" -ForegroundColor Gray
Write-Host ""
Read-Host "Pressione Enter para continuar"