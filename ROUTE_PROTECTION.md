# Sistema de Proteção de Rotas - Connexa

## 📋 Visão Geral

O sistema de proteção de rotas implementado fornece controle granular de acesso às páginas da aplicação, garantindo que apenas usuários autorizados possam acessar recursos específicos.

## 🛡️ Componentes de Segurança

### 1. **ProtectedRoute** (`components/ProtectedRoute.tsx`)

Componente principal para proteção básica de rotas.

#### Funcionalidades:
- ✅ Verificação de autenticação
- ✅ Validação de usuário ativo
- ✅ Controle de papéis/roles
- ✅ Verificações customizadas de permissão
- ✅ Componentes de fallback personalizados
- ✅ Telas de erro amigáveis

#### Exemplo de Uso:
```tsx
// Rota básica protegida
<ProtectedRoute>
  <Dashboard />
</ProtectedRoute>

// Rota apenas para administradores
<ProtectedRoute allowedRoles={['admin']}>
  <AdminPanel />
</ProtectedRoute>

// Verificação customizada
<ProtectedRoute 
  customPermissionCheck={(user) => user.isActive && user.role !== 'guest'}
>
  <AdvancedFeature />
</ProtectedRoute>
```

### 2. **RouteGuard** (`components/RouteGuard.tsx`)

Sistema avançado de verificação de permissões com hierarquia de papéis.

#### Funcionalidades:
- ✅ Hierarquia de permissões (user < moderator < admin < super_admin)
- ✅ Verificações múltiplas (AND/OR)
- ✅ Mensagens de erro detalhadas
- ✅ Componentes de conveniência (AdminGuard, ModeratorGuard)
- ✅ Hook usePermissions para verificações em componentes

#### Exemplo de Uso:
```tsx
// Verificação simples de papel
<AdminGuard>
  <AdminDashboard />
</AdminGuard>

// Verificações múltiplas
<RouteGuard
  permissions={[
    { level: 'moderator' },
    { customCheck: (user) => user.department === 'IT' }
  ]}
  requireAll={false} // OR logic
>
  <ITModeratorPanel />
</RouteGuard>

// Usando o hook em componentes
const { hasPermission } = usePermissions();
const canViewReports = hasPermission('admin');
```

### 3. **Hook useRedirect** (`hooks/useRedirect.ts`)

Gerenciamento inteligente de redirecionamentos após login/logout.

#### Funcionalidades:
- ✅ Salva localização antes do login
- ✅ Redirecionamento baseado em papel
- ✅ Verificação de segurança de URLs
- ✅ Prevenção de loops de redirecionamento
- ✅ Cleanup automático de dados

#### Exemplo de Uso:
```tsx
// No componente Login
const { handleLoginSuccess } = useAuthRedirect();

const onLoginSuccess = () => {
  login(user, token);
  handleLoginSuccess(); // Redireciona para página original ou dashboard
};

// Redirecionamento manual
const { redirectTo, redirectByRole } = useRedirect();

redirectTo('/profile', { preserveCurrent: true });
redirectByRole(); // Redireciona baseado no papel do usuário
```

## 📄 Páginas de Status

### **NotFoundPage** (404)
- Interface amigável para páginas não encontradas
- Botões de navegação contextuais
- Informações do usuário logado

### **UnauthorizedPage** (403)
- Detalhes da tentativa de acesso
- Informações de permissões necessárias
- Opções de contato com suporte

### **LoadingPage**
- Estados de carregamento configuráveis
- Variantes: minimal, detailed, fullscreen
- Indicadores de progresso

## 🗺️ Estrutura de Rotas (App.tsx)

```tsx
function App() {
  return (
    <Routes>
      {/* Rotas Públicas */}
      <Route path="/login" element={
        <ProtectedRoute requireAuth={false}>
          <Login />
        </ProtectedRoute>
      } />

      {/* Rotas Básicas Protegidas */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />

      {/* Rotas de Moderador */}
      <Route path="/moderator/*" element={
        <ProtectedRoute>
          <ModeratorGuard>
            <ModeratorRoutes />
          </ModeratorGuard>
        </ProtectedRoute>
      } />

      {/* Rotas de Admin */}
      <Route path="/admin/*" element={
        <ProtectedRoute>
          <AdminGuard>
            <AdminPage />
          </AdminGuard>
        </ProtectedRoute>
      } />

      {/* Páginas de Status */}
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
```

## 🎯 Exemplos Práticos

### **1. Página com Múltiplas Verificações**
```tsx
<RouteGuard
  permissions={[
    { level: 'admin' },
    { 
      level: 'user',
      customCheck: (user) => user.isActive && user.department === 'Finance'
    }
  ]}
  requireAll={false} // Qualquer uma das condições
  onUnauthorized={() => console.log('Acesso negado')}
  fallbackPath="/dashboard"
>
  <FinancialReports />
</RouteGuard>
```

### **2. Verificação de Permissão em Componente**
```tsx
const Dashboard = () => {
  const { hasPermission, checkCustomPermission } = usePermissions();
  
  const canViewAdmin = hasPermission('admin');
  const canViewReports = checkCustomPermission(
    (user) => user.department === 'Analytics'
  );

  return (
    <div>
      {canViewAdmin && <AdminButton />}
      {canViewReports && <ReportsSection />}
    </div>
  );
};
```

### **3. Redirecionamento Customizado**
```tsx
const Login = () => {
  const { redirectTo, saveCurrentLocation } = useRedirect();
  
  const handleSpecialLogin = () => {
    saveCurrentLocation(); // Salva página atual
    
    if (user.role === 'admin') {
      redirectTo('/admin/dashboard');
    } else {
      redirectTo('/user/dashboard');
    }
  };
};
```

## 🔐 Hierarquia de Permissões

```
super_admin (4) ← Acesso total
    ↑
admin (3) ← Gerenciamento geral
    ↑
moderator (2) ← Moderação de conteúdo
    ↑
user (1) ← Acesso básico
```

## ⚙️ Configuração

### **Variáveis de Ambiente**
```bash
# .env.local
REACT_APP_TOKEN_CHECK_INTERVAL=30000
REACT_APP_TOKEN_REFRESH_THRESHOLD=300
REACT_APP_DEBUG_MODE=true
```

### **Personalização de Rotas Seguras**
```tsx
const { redirectTo } = useRedirect({
  fallbackPath: '/custom-dashboard',
  allowedPaths: ['/dashboard', '/profile', '/settings'],
  blockedPaths: ['/login', '/register'],
  maxRedirectAttempts: 5
});
```

## 🚨 Considerações de Segurança

### **⚠️ Importantes:**
1. **Validação no Backend**: Sempre validar permissões no servidor
2. **Tokens Seguros**: Usar sistema de armazenamento seguro de JWT
3. **Auditoria**: Logar tentativas de acesso não autorizado
4. **Rate Limiting**: Implementar no backend para prevenir ataques

### **✅ Boas Práticas:**
- Use `ProtectedRoute` para proteção básica
- Use `RouteGuard` para verificações complexas
- Sempre forneça fallbacks e mensagens de erro
- Teste diferentes cenários de permissão
- Mantenha a UX consistente mesmo em casos de erro

## 📊 Status da Implementação

| **Funcionalidade** | **Status** | **Descrição** |
|-------------------|------------|---------------|
| ✅ ProtectedRoute | Completo | Proteção básica com múltiplas opções |
| ✅ RouteGuard | Completo | Sistema avançado de permissões |
| ✅ useRedirect | Completo | Redirecionamentos inteligentes |
| ✅ Páginas de Status | Completo | 404, 403, Loading personalizadas |
| ✅ Hierarquia de Papéis | Completo | Sistema de níveis de acesso |
| ✅ Hook de Permissões | Completo | Verificações em componentes |
| ✅ Exemplo AdminPage | Completo | Demonstração prática |

## 🎉 Resultado Final

O sistema implementado oferece:
- **Segurança robusta** com múltiplas camadas de verificação
- **UX aprimorada** com redirecionamentos inteligentes
- **Flexibilidade** para diferentes tipos de verificação
- **Manutenibilidade** com componentes reutilizáveis
- **Escalabilidade** para futuras funcionalidades

**🚀 O sistema está pronto para produção e pode ser facilmente estendido conforme necessário!**