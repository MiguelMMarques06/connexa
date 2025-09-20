# 🌐 Connexa - Plataforma de Conexão Estudantil

Uma plataforma moderna para conectar estudantes ao redor do mundo, desenvolvida com React, Node.js e autenticação JWT segura.

## 🚀 Inicialização Rápida

### Opção 1: Script Automático (Recomendado)

**Windows PowerShell:**
```powershell
# Execute como Administrador
.\inicializar.ps1
```

**Windows CMD:**
```cmd
inicializar.bat
```

### Opção 2: Manual

```bash
# 1. Instalar dependências
npm run install:all

# 2. Iniciar apenas o backend
npm start

# 3. Em outro terminal, iniciar o frontend
npm run frontend
```

## 🌐 URLs de Acesso

- **Frontend**: http://localhost:3002
- **Backend API**: http://localhost:3001

## 📁 Estrutura do Projeto

```
connexa/
├── 📁 backend/              # API Node.js + Express
│   ├── 📁 src/
│   │   ├── 📁 controllers/  # Controladores da API
│   │   ├── 📁 middleware/   # Middlewares (auth, validação)
│   │   ├── 📁 services/     # Lógica de negócio
│   │   ├── 📁 utils/        # Utilitários
│   │   └── 📁 tests/        # Testes unitários
│   └── 📄 server.js         # Servidor principal
├── 📁 frontend/             # Aplicação React
│   ├── 📁 src/
│   │   ├── 📁 components/   # Componentes React
│   │   ├── 📁 contexts/     # Context API (Auth)
│   │   ├── 📁 hooks/        # Custom Hooks
│   │   ├── 📁 pages/        # Páginas da aplicação
│   │   ├── 📁 services/     # Serviços de API
│   │   └── 📁 utils/        # Utilitários
│   └── 📄 package.json      # Dependências do frontend
├── 📁 database/             # Banco SQLite
└── 📄 package.json          # Dependências do backend
```

## 🔐 Recursos de Segurança

### ✅ Autenticação JWT Avançada
- Tokens criptografados com AES-256
- Verificação de integridade com HMAC
- Refresh tokens automáticos
- Armazenamento seguro no browser

### ✅ Proteção de Rotas
- Sistema de roles hierárquico (user → moderator → admin → super_admin)
- Guards customizáveis por componente
- Redirecionamento inteligente pós-login
- Verificações de permissão em tempo real

### ✅ Validação e Sanitização
- Validação robusta de dados de entrada
- Sanitização contra XSS
- Rate limiting configurável
- Hashing seguro de senhas (bcrypt)

## 🛡️ Sistema de Permissões

```jsx
// Exemplo de uso dos guards
<AdminGuard>
  <AdminDashboard />
</AdminGuard>

<ModeratorGuard>
  <ModerationPanel />
</ModeratorGuard>

// Verificação customizada
<RouteGuard
  permissions={[{
    level: 'user',
    customCheck: (user) => user.isActive && user.emailVerified
  }]}
>
  <ProtectedFeature />
</RouteGuard>
```

## 🎨 Interface

- **Design System**: Material-UI v5
- **Responsividade**: Mobile-first
- **Tema**: Customizado para a marca Connexa
- **Formulários**: Validação em tempo real com Formik + Yup
- **Navegação**: React Router v6 com proteção de rotas

## 🗄️ Banco de Dados

- **Desenvolvimento**: SQLite (automático)
- **Produção**: PostgreSQL/MySQL (configurável)
- **ORM**: Nativo (SQL direto para performance)

## 📝 Scripts Disponíveis

### Backend
```bash
npm start              # Servidor de produção
npm run dev            # Desenvolvimento com auto-reload
npm test               # Testes unitários
npm run test:watch     # Testes em modo watch
npm run test:coverage  # Cobertura de testes
```

### Frontend
```bash
npm run frontend           # Servidor de desenvolvimento
npm run frontend:build     # Build de produção
npm run frontend:serve     # Servir build de produção
```

### Projeto Completo
```bash
npm run install:all    # Instalar todas as dependências
npm run dev:full       # Backend + Frontend simultâneos
```

## 🔧 Configuração

### Variáveis de Ambiente

**Backend (.env):**
```env
PORT=3001
JWT_SECRET=your-super-secret-key
JWT_EXPIRES_IN=24h
DB_PATH=./database/connexa.db
BCRYPT_ROUNDS=12
```

**Frontend (frontend/.env):**
```env
REACT_APP_ENCRYPTION_KEY=your-encryption-key
REACT_APP_HMAC_KEY=your-hmac-key
REACT_APP_API_URL=http://localhost:3001
```

## 🚨 Solução de Problemas

### Porta em uso
```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

### Reinstalar dependências
```bash
# Raiz do projeto
rm -rf node_modules package-lock.json
npm install

# Frontend
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Problemas de CORS
- Verifique se o backend está rodando na porta 3001
- Confirme a variável REACT_APP_API_URL

## 📚 Documentação

- [📖 Segurança JWT](./SECURITY.md)
- [🛡️ Proteção de Rotas](./ROUTE_PROTECTION.md)
- [🚀 API Documentation](./JWT_API_DOCS.md)
- [⚡ Guia de Inicialização](./INICIALIZACAO.md)

## 🌟 Funcionalidades Implementadas

### Autenticação
- [x] Registro de usuários
- [x] Login/Logout
- [x] Recuperação de senha
- [x] Verificação de email
- [x] Refresh tokens
- [x] Sessions persistentes

### Interface
- [x] Dashboard responsivo
- [x] Formulários validados
- [x] Páginas de erro (404, 403)
- [x] Loading states
- [x] Feedback visual
- [x] Navegação intuitiva

### Segurança
- [x] JWT criptografado
- [x] Rate limiting
- [x] Validação robusta
- [x] Sanitização XSS
- [x] CORS configurado
- [x] Headers de segurança

### Sistema de Roles
- [x] Hierarquia de permissões
- [x] Guards por componente
- [x] Verificações customizadas
- [x] UI condicional por role
- [x] Audit trail (logs)

## 🔄 Roadmap

### Próximas Versões
- [ ] Sistema de notificações
- [ ] Chat em tempo real
- [ ] Upload de arquivos
- [ ] Busca avançada
- [ ] Dashboard analytics
- [ ] Mobile app (React Native)

### Melhorias Técnicas
- [ ] Testes E2E (Cypress)
- [ ] Docker containers
- [ ] CI/CD pipeline
- [ ] Monitoramento (Sentry)
- [ ] Cache Redis
- [ ] CDN para assets

## 👥 Contribuição

1. Faça um fork do projeto
2. Crie sua feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🆘 Suporte

Encontrou um problema? Precisa de ajuda?

1. Consulte a [documentação completa](./INICIALIZACAO.md)
2. Verifique as [issues existentes](../../issues)
3. Abra uma [nova issue](../../issues/new)

---

**Desenvolvido com ❤️ para conectar estudantes ao redor do mundo**
Projeto que conecta alunos com interesses em comum em diferentes grupos de estudos.
