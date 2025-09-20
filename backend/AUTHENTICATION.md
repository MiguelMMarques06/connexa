# Sistema de Autenticação e Autorização - Connexa

## Visão Geral

O sistema de autenticação do Connexa implementa um mecanismo robusto e flexível baseado em JWT (JSON Web Tokens) com múltiplas camadas de segurança e autorização granular.

## Componentes Principais

### 1. Middleware de Autenticação (`auth.js`)

O middleware principal que fornece:

- **Verificação de tokens JWT** com validação de assinatura e expiração
- **Sistema de blacklist** para tokens revogados
- **Autenticação opcional/obrigatória** configurável
- **Verificação no banco de dados** para validar existência do usuário
- **Avisos de expiração** próxima do token
- **Proteção contra timing attacks**

#### Uso Básico:

```javascript
const { authenticateToken } = require('./middleware/auth');

// Autenticação obrigatória
app.get('/protected', authenticateToken({ required: true }), (req, res) => {
    res.json({ user: req.user });
});

// Autenticação opcional
app.get('/optional', authenticateToken({ required: false }), (req, res) => {
    res.json({ 
        user: req.user || null,
        message: 'Accessible to all'
    });
});
```

### 2. Middleware de Autorização (`authorization.js`)

Sistema avançado de autorização com:

#### Níveis de Acesso Pré-definidos:

```javascript
const { requireAdmin, requireModerator, requireUser } = require('./middleware/authorization');

// Apenas administradores
app.get('/admin/panel', requireAdmin, adminController.dashboard);

// Moderadores e acima
app.get('/moderate/content', requireModerator, moderationController.review);

// Usuários autenticados
app.get('/user/profile', requireUser, userController.profile);
```

#### Permissões de Propriedade:

```javascript
const { canEditProfile, canDeleteAccount } = require('./middleware/authorization');

// Usuário pode editar apenas seu próprio perfil (ou admin pode editar qualquer um)
app.put('/profile/:userId', canEditProfile('userId'), userController.update);

// Controle rigoroso para exclusão de contas
app.delete('/account/:userId', canDeleteAccount('userId'), userController.delete);
```

#### Permissões de Conteúdo:

```javascript
const { contentPermissions } = require('./middleware/authorization');

// Criar conteúdo - qualquer usuário autenticado
app.post('/posts', contentPermissions.create, postController.create);

// Editar conteúdo - dono ou moderador+
app.put('/posts/:id', contentPermissions.edit('authorId'), postController.update);

// Deletar conteúdo - dono ou admin+
app.delete('/posts/:id', contentPermissions.delete('authorId'), postController.delete);
```

#### Autorização Dinâmica:

```javascript
const { dynamicAuth } = require('./middleware/authorization');

// Configuração flexível de permissões
app.get('/resource/:id', 
    dynamicAuth({
        roles: ['admin', 'moderator'],
        requireOwnership: true,
        ownerField: 'userId',
        checkDatabase: true
    }),
    resourceController.get
);
```

### 3. Rate Limiting por Usuário

Sistema de rate limiting específico por usuário autenticado:

```javascript
const { userSpecificRateLimit } = require('./middleware/authorization');

// 50 requests por 15 minutos para visualizar perfil
app.get('/profile', 
    userSpecificRateLimit(50, 15 * 60 * 1000),
    requireUser,
    userController.getProfile
);

// 5 tentativas por hora para operações sensíveis
app.delete('/account/:id',
    userSpecificRateLimit(5, 60 * 60 * 1000),
    canDeleteAccount('id'),
    userController.deleteAccount
);
```

## Hierarquia de Roles

O sistema implementa uma hierarquia clara de permissões:

1. **super_admin**: Acesso total ao sistema
2. **admin**: Gerenciamento de usuários e conteúdo
3. **moderator**: Moderação de conteúdo
4. **user**: Usuário padrão (acesso básico)

## Rotas Protegidas

### Rotas Públicas (sem autenticação):
- `POST /api/users/register` - Registro de usuário
- `POST /api/users/login` - Login de usuário

### Rotas de Usuário (autenticação obrigatória):
- `GET /api/users/profile` - Visualizar perfil próprio
- `PUT /api/users/profile/:userId` - Editar perfil (próprio ou admin)
- `DELETE /api/users/account/:userId` - Excluir conta (própria ou super_admin)
- `POST /api/users/logout` - Logout (revoga token)
- `POST /api/users/refresh` - Renovar token

### Rotas Administrativas (role admin ou superior):
- `GET /api/users/admin/users` - Listar todos os usuários
- `GET /api/users/admin/users/:userId` - Visualizar usuário específico
- `PATCH /api/users/admin/users/:userId/role` - Alterar role de usuário
- `PATCH /api/users/admin/users/:userId/ban` - Banir/desbanir usuário

## Recursos de Segurança

### 1. Token Blacklist
```javascript
const { revokeToken } = require('./middleware/auth');

// Revogar token específico
revokeToken(userToken);

// O token será rejeitado em todas as requisições futuras
```

### 2. Verificação de Expiração
- Avisos automáticos quando token está próximo ao vencimento
- Header `X-Token-Warning` enviado quando restam menos de 10 minutos

### 3. Validação de Banco de Dados
- Opção para verificar se o usuário ainda existe no banco
- Útil para casos onde usuários são deletados mas tokens ainda são válidos

### 4. Proteção Contra Timing Attacks
- Delays consistentes em operações de validação
- Previne vazamento de informações através de diferenças de tempo

## Configuração de Segurança

```javascript
// config/security.js
module.exports = {
    JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key',
    JWT_EXPIRATION: process.env.JWT_EXPIRATION || '1h',
    PASSWORD_SALT_ROUNDS: parseInt(process.env.PASSWORD_SALT_ROUNDS) || 12,
    MAX_LOGIN_ATTEMPTS: parseInt(process.env.MAX_LOGIN_ATTEMPTS) || 5,
    LOCKOUT_TIME: parseInt(process.env.LOCKOUT_TIME) || 15 * 60 * 1000
};
```

## Testes

O sistema inclui testes abrangentes cobrindo:

- **Autenticação**: Tokens válidos, inválidos, expirados
- **Autorização**: Verificação de roles e permissões
- **Blacklist**: Tokens revogados
- **Rate Limiting**: Limites por usuário
- **Edge Cases**: Headers malformados, timing attacks
- **Integração**: Testes end-to-end das rotas protegidas

### Executar Testes:

```bash
npm test -- src/tests/auth.test.js
```

## Exemplos de Uso

### 1. Proteção Básica de Rota

```javascript
const express = require('express');
const { requireUser } = require('./middleware/authorization');

const router = express.Router();

router.get('/dashboard', requireUser, (req, res) => {
    res.json({
        message: `Welcome ${req.user.email}`,
        user: req.user
    });
});
```

### 2. Controle de Propriedade

```javascript
const { authenticateToken, authorizeUser } = require('./middleware/auth');

router.put('/posts/:id', [
    authenticateToken({ required: true }),
    authorizeUser('authorId') // Verifica se req.user.id === req.body.authorId
], (req, res) => {
    // Usuário pode editar apenas seus próprios posts
    postService.update(req.params.id, req.body);
});
```

### 3. Operações Administrativas

```javascript
const { adminOperations } = require('./middleware/authorization');

router.get('/admin/reports', 
    adminOperations.viewLogs,
    adminController.getReports
);

router.post('/admin/moderate/:contentId',
    adminOperations.moderateContent,
    moderationController.moderateContent
);
```

### 4. Autenticação Condicional

```javascript
const { authenticateToken } = require('./middleware/auth');

router.get('/public-content', [
    authenticateToken({ required: false }) // Autenticação opcional
], (req, res) => {
    const content = getContent();
    
    if (req.user) {
        // Usuário autenticado - mostrar conteúdo personalizado
        content.personalized = getPersonalizedContent(req.user.id);
    }
    
    res.json(content);
});
```

## Boas Práticas

1. **Sempre use HTTPS em produção** para proteger tokens em trânsito
2. **Configure JWT_SECRET forte** - use variáveis de ambiente
3. **Implemente refresh tokens** para sessões longas
4. **Monitore tentativas de login** falhadas
5. **Use rate limiting** apropriado para cada endpoint
6. **Registre eventos de segurança** para auditoria
7. **Valide entrada do usuário** em todos os endpoints
8. **Mantenha tokens com vida útil curta** (1-2 horas)
9. **Implemente logout adequado** revogando tokens
10. **Teste regularmente** os middlewares de segurança

Este sistema fornece uma base sólida e flexível para autenticação e autorização, permitindo fácil extensão e customização conforme as necessidades do projeto evoluem.