import axios from 'axios';
import { getSecureToken, clearAllAuthData, isTokenExpired } from '../utils/secureStorage';

// Usar variável de ambiente ou fallback para desenvolvimento
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Debug: Log da URL da API
console.log('API_URL configurada:', API_URL);
console.log('Environment:', process.env.NODE_ENV);
console.log('REACT_APP_API_URL:', process.env.REACT_APP_API_URL);

// Configuração do axios
const api = axios.create({
    baseURL: API_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor para adicionar token nas requisições
api.interceptors.request.use((config) => {
    const token = getSecureToken();
    if (token) {
        // Verificar se o token não está expirado antes de usar
        if (!isTokenExpired(token)) {
            config.headers.Authorization = `Bearer ${token}`;
        } else {
            console.warn('Token expirado detectado no interceptor');
            clearAllAuthData();
            window.location.href = '/login';
        }
    }
    return config;
});

// Interceptor para tratar respostas
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expirado ou inválido
            console.warn('Resposta 401 recebida, limpando dados de autenticação');
            clearAllAuthData();
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

interface UserRegistrationData {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
}

interface LoginData {
    email: string;
    password: string;
}

interface User {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

interface AuthResponse {
    message: string;
    user: User;
    token: string;
}

interface ApiResponse {
    success: boolean;
    user?: User;
    token?: string;
    message?: string;
    error?: string;
}

// Login de usuário
export const loginUser = async (credentials: LoginData): Promise<ApiResponse> => {
    try {
        const response = await api.post<AuthResponse>('/users/login', credentials);
        return {
            success: true,
            user: response.data.user,
            token: response.data.token,
            message: response.data.message
        };
    } catch (error) {
        console.error('Login API error:', error);
        throw error;
    }
};

// Registrar novo usuário
export const registerUser = async (userData: UserRegistrationData): Promise<ApiResponse> => {
    try {
        console.log('registerUser chamado com:', userData);
        console.log('URL da requisição:', `${API_URL}/users/register`);
        
        const response = await api.post<AuthResponse>('/users/register', userData);
        console.log('Resposta da API:', response);
        
        return {
            success: true,
            user: response.data.user,
            token: response.data.token,
            message: response.data.message
        };
    } catch (error: any) {
        console.error('Registration API error:', error);
        console.error('Error details:', {
            message: error.message,
            response: error.response,
            request: error.request
        });
        throw error;
    }
};

// Obter perfil do usuário
export const getUserProfile = async (): Promise<{ user: User }> => {
    try {
        const response = await api.get<{ user: User }>('/users/profile');
        return response.data;
    } catch (error) {
        console.error('Get profile API error:', error);
        throw error;
    }
};

// Atualizar perfil do usuário
export const updateUserProfile = async (userId: number, data: Partial<User>): Promise<{ user: User }> => {
    try {
        const response = await api.put<{ user: User }>(`/users/profile/${userId}`, data);
        return response.data;
    } catch (error) {
        console.error('Update profile API error:', error);
        throw error;
    }
};

// Logout (revogar token)
export const logoutUser = async (): Promise<{ message: string }> => {
    try {
        const response = await api.post<{ message: string }>('/users/logout');
        return response.data;
    } catch (error) {
        console.error('Logout API error:', error);
        throw error;
    }
};

// Refresh token
export const refreshToken = async (): Promise<AuthResponse> => {
    try {
        const response = await api.post<AuthResponse>('/users/refresh');
        return response.data;
    } catch (error) {
        console.error('Refresh token API error:', error);
        throw error;
    }
};

export { api };