# 🔐 Documentação da API JWT - Connexa

## Endpoints de Autenticação

### 1. Login do Usuário
**POST** `/api/users/login`

**Request Body:**
```json
{
    "email": "usuario@exemplo.com",
    "password": "MinhaSenh@123"
}
```

**Response (200 - Sucesso):**
```json
{
    "success": true,
    "message": "Autenticação realizada com sucesso",
    "timestamp": "2025-09-20T15:20:42.737Z",
    "data": {
        "user": {
            "id": 1,
            "name": "Nome do Usuário",
            "email": "usuario@exemplo.com"
        },
        "tokens": {
            "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            "type": "Bearer",
            "expiresIn": "24h"
        }
    }
}
```

### 2. Verificar Token
**GET** `/api/users/verify-token`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 - Token Válido):**
```json
{
    "success": true,
    "message": "Token is valid",
    "user": {
        "id": 1,
        "email": "usuario@exemplo.com",
        "name": "Nome do Usuário",
        "tokenId": "1_1758381642737"
    }
}
```

### 3. Obter Perfil do Usuário (Rota Protegida)
**GET** `/api/users/profile`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 - Sucesso):**
```json
{
    "success": true,
    "message": "Profile retrieved successfully",
    "data": {
        "user": {
            "id": 1,
            "name": "Nome do Usuário",
            "email": "usuario@exemplo.com"
        },
        "tokenInfo": {
            "tokenId": "1_1758381642737",
            "issuedAt": "2025-09-20T15:20:42.737Z"
        }
    }
}
```

## Estrutura do JWT Token

### Access Token Payload:
```json
{
    "userId": 1,
    "email": "usuario@exemplo.com",
    "name": "Nome do Usuário",
    "iat": 1758381642,
    "loginTime": "2025-09-20T15:20:42.737Z",
    "tokenId": "1_1758381642737",
    "type": "access_token",
    "version": "1.0",
    "exp": 1758468042,
    "iss": "connexa-app",
    "aud": "connexa-users"
}
```

### Refresh Token Payload:
```json
{
    "userId": 1,
    "email": "usuario@exemplo.com",
    "type": "refresh_token",
    "tokenId": "refresh_1_1758381642737",
    "iat": 1758381642,
    "exp": 1758986442,
    "iss": "connexa-app",
    "aud": "connexa-users"
}
```

## Códigos de Erro

### 401 - Unauthorized
```json
{
    "error": "Invalid credentials",
    "details": ["Email or password is incorrect"]
}
```

```json
{
    "error": "Access denied",
    "details": ["No token provided"]
}
```

```json
{
    "error": "Token expired",
    "details": ["Please login again"]
}
```

### 429 - Too Many Requests
```json
{
    "error": "Too many login attempts",
    "details": ["Please try again after 15 minutes"]
}
```

### 500 - Internal Server Error
```json
{
    "error": "Authentication token generation failed",
    "details": ["Unable to generate authentication tokens"]
}
```

## Como Usar no Frontend

### 1. Login e Armazenamento do Token
```javascript
// Login
const loginResponse = await fetch('/api/users/login', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        email: 'usuario@exemplo.com',
        password: 'MinhaSenh@123'
    })
});

const authData = await loginResponse.json();

// Armazenar tokens
localStorage.setItem('accessToken', authData.data.tokens.accessToken);
localStorage.setItem('refreshToken', authData.data.tokens.refreshToken);
```

### 2. Fazer Requisições Autenticadas
```javascript
const accessToken = localStorage.getItem('accessToken');

const response = await fetch('/api/users/profile', {
    method: 'GET',
    headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
    }
});

const profileData = await response.json();
```

### 3. Verificar se o Token é Válido
```javascript
const verifyToken = async () => {
    const accessToken = localStorage.getItem('accessToken');
    
    try {
        const response = await fetch('/api/users/verify-token', {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        
        return response.ok;
    } catch (error) {
        return false;
    }
};
```

## Configurações de Segurança

- **Access Token**: Expira em 24 horas
- **Refresh Token**: Expira em 7 dias
- **Rate Limiting**: 5 tentativas de login por 15 minutos
- **Algoritmo**: HS256
- **Issuer**: connexa-app
- **Audience**: connexa-users

## Middleware Disponíveis

1. **`authenticateToken`**: Requer token válido
2. **`optionalAuth`**: Token opcional
3. **`authorizeUser`**: Verifica se o usuário é dono do recurso
4. **`extractTokenInfo`**: Extrai informações do token sem verificar