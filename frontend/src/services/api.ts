import axios, { AxiosError } from 'axios';

const API_URL = 'http://localhost:3001/api';

interface UserRegistrationData {
    name: string;
    email: string;
    password: string;
}

interface RegistrationResponse {
    message: string;
    userId: number;
}

export const register = async (userData: UserRegistrationData): Promise<RegistrationResponse> => {
    try {
        const response = await axios.post<RegistrationResponse>(`${API_URL}/users/register`, userData);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            const axiosError = error as AxiosError<{ error: string }>;
            if (axiosError.response) {
                // The server responded with a status code outside the 2xx range
                throw new Error(axiosError.response.data?.error || 'Registration failed');
            } else if (axiosError.request) {
                // The request was made but no response was received
                throw new Error('No response from server');
            }
        }
        // Something happened in setting up the request
        throw new Error('Error setting up request');
    }
};