# 🚀 Guia de Inicialização do Projeto Connexa

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** (versão 18 ou superior)
- **npm** (geralmente vem com o Node.js)
- **Git** (para controle de versão)

## 🏗️ Estrutura do Projeto

```
connexa/
├── backend/          # Servidor Node.js + Express
├── frontend/         # Aplicação React
├── database/         # Arquivos do banco SQLite
└── package.json      # Configuração raiz do projeto
```

## 🔧 Inicialização Passo a Passo

### 1. Clone e Navegue para o Projeto

```bash
cd c:\Users\pichau\OneDrive\Documentos\connexa-engs3\connexa
```

### 2. Instale as Dependências do Backend

```bash
# Instalar dependências raiz (backend)
npm install
```

### 3. Instale as Dependências do Frontend

```bash
# Navegar para o frontend
cd frontend

# Instalar dependências do React
npm install

# Voltar para a raiz
cd ..
```

### 4. Configure as Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```bash
# Na raiz do projeto (connexa/)
echo "# Configurações do Backend
PORT=3000
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h

# Configurações do Banco
DB_PATH=./database/connexa.db

# Configurações de Segurança
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100" > .env
```

Crie um arquivo `.env` no frontend:

```bash
# Na pasta frontend/
cd frontend
echo "# Configurações de Criptografia Frontend
REACT_APP_ENCRYPTION_KEY=your-encryption-key-change-in-production
REACT_APP_HMAC_KEY=your-hmac-key-change-in-production

# URL da API (quando backend estiver rodando)
REACT_APP_API_URL=http://localhost:3000" > .env
cd ..
```

## 🚀 Comandos de Execução

### Opção 1: Executar Backend e Frontend Separadamente

#### Terminal 1 - Backend:
```bash
# Na raiz do projeto
npm start
# ou para desenvolvimento com auto-reload
npm run dev
```

#### Terminal 2 - Frontend:
```bash
# Na pasta frontend
cd frontend
npm start
```

### Opção 2: Executar Apenas o Frontend (modo desenvolvimento)

Se você quiser testar apenas a interface:

```bash
cd frontend
npm start
```

### Opção 3: Build de Produção

Para criar a versão otimizada:

```bash
# Frontend
cd frontend
npm run build

# Servir a versão de produção
npx serve -s build -p 3001
```

## 🌐 URLs de Acesso

- **Frontend (desenvolvimento)**: http://localhost:3001
- **Frontend (produção)**: http://localhost:3001
- **Backend API**: http://localhost:3000
- **Documentação da API**: Veja JWT_API_DOCS.md

## 🔧 Comandos Úteis

### Backend:
```bash
npm start          # Inicia o servidor
npm run dev        # Inicia com nodemon (auto-reload)
npm test           # Executa testes
npm run test:watch # Testes em modo watch
```

### Frontend:
```bash
npm start          # Servidor de desenvolvimento
npm run build      # Build de produção
npm test           # Executa testes do React
```

## 🗄️ Banco de Dados

O projeto usa SQLite. O banco será criado automaticamente na primeira execução em:
```
database/connexa.db
```

## 🔒 Recursos Implementados

### Autenticação e Segurança:
- ✅ JWT com criptografia AES
- ✅ Armazenamento seguro de tokens
- ✅ Sistema de refresh tokens
- ✅ Rate limiting
- ✅ Validação de dados
- ✅ Hashing de senhas com bcrypt

### Sistema de Rotas:
- ✅ Proteção de rotas baseada em autenticação
- ✅ Sistema de permissões por role (user/moderator/admin/super_admin)
- ✅ Redirecionamento inteligente pós-login
- ✅ Páginas de erro personalizadas (404, 403)

### Interface:
- ✅ Design responsivo com Material-UI
- ✅ Formulários de login e registro
- ✅ Navegação entre páginas
- ✅ Feedback visual para usuário
- ✅ Dashboard administrativo

## 🚨 Solução de Problemas

### Erro "Cannot find module"
```bash
# Reinstalar dependências
rm -rf node_modules
npm install

# Frontend
cd frontend
rm -rf node_modules
npm install
```

### Porta já em uso
```bash
# Windows - matar processo na porta 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Ou usar outra porta
set PORT=3001 && npm start
```

### Problemas de CORS
- Certifique-se de que o backend está rodando na porta 3000
- Verifique se REACT_APP_API_URL está configurado corretamente

## 📝 Próximos Passos

1. **Configurar Banco em Produção**: Migrar de SQLite para PostgreSQL/MySQL
2. **Deploy**: Configurar para Heroku, Vercel ou AWS
3. **Testes**: Expandir cobertura de testes
4. **Monitoramento**: Adicionar logs e métricas

## 🆘 Suporte

Se encontrar problemas:
1. Verifique se todas as dependências estão instaladas
2. Confirme que as portas não estão em uso
3. Verifique os logs de erro no terminal
4. Consulte a documentação em SECURITY.md e ROUTE_PROTECTION.md