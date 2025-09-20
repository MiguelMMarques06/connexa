# 🚀 GUIA DE INICIALIZAÇÃO - SOLUÇÃO PARA POLÍTICA POWERSHELL

## ❌ Problema: "execução de scripts foi desabilitada neste sistema"

Este erro ocorre quando o Windows bloqueia a execução de scripts PowerShell por segurança.

## ✅ SOLUÇÕES (escolha uma):

### 🥇 OPÇÃO 1: Mais Simples (SEM privilégios de admin)
```cmd
iniciar-simples.bat
```
**Vantagens:**
- ✅ Funciona sem ser administrador
- ✅ Não altera configurações do sistema
- ✅ Solução mais segura

### 🥈 OPÇÃO 2: PowerShell Bypass (SEM privilégios de admin)
```powershell
powershell -ExecutionPolicy Bypass -File .\iniciar-seguro.ps1
```
**Vantagens:**
- ✅ Funciona sem ser administrador
- ✅ Usa PowerShell mas contorna bloqueio
- ✅ Não altera configurações permanentes

### 🥉 OPÇÃO 3: Corrigir PowerShell Permanentemente (REQUER admin)
```powershell
# 1. Abrir PowerShell como Administrador
# 2. Executar:
powershell -ExecutionPolicy Bypass -File .\corrigir-powershell.ps1
```
**Vantagens:**
- ✅ Corrige o problema permanentemente
- ✅ Permite usar todos os scripts .ps1 normalmente

**Desvantagens:**
- ❌ Requer privilégios de administrador
- ⚠️ Altera configurações de segurança do sistema

## 🎯 RECOMENDAÇÃO

**Para teste rápido:** Use `iniciar-simples.bat`

**Para desenvolvimento:** Use Opção 2 ou 3

## 🔍 Verificar se funcionou

Após executar qualquer opção, verifique:

1. **Backend rodando:** http://localhost:3001
2. **Frontend rodando:** http://localhost:3002  
3. **Teste de registro:** http://localhost:3002/register

## 🆘 Se ainda houver problemas

1. **Verifique portas ocupadas:**
   ```cmd
   netstat -ano | findstr :3001
   netstat -ano | findstr :3002
   ```

2. **Execute diagnóstico:**
   ```cmd
   powershell -ExecutionPolicy Bypass -File .\diagnostico.ps1
   ```

3. **Limpeza completa:**
   ```cmd
   iniciar-simples.bat
   ```

## 📱 Comandos de Emergência

```cmd
# Parar todos os processos Node
taskkill /f /im node.exe

# Limpar cache NPM
npm cache clean --force

# Reinstalar dependências
rmdir /s /q node_modules
npm install
```

## 🎉 Resultado Esperado

Após executar com sucesso:
- ✅ Backend na porta 3001
- ✅ Frontend na porta 3002  
- ✅ Navegador abre automaticamente
- ✅ Sistema de registro funcionando
- ✅ Sem erros de MySQL/EER_CONNECTION_REFUSED