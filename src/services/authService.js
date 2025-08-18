import { API_BASE_URL, API_ENDPOINTS, getHeaders } from '@/config/api';
import Cookies from 'js-cookie';

export const authService = {
    login: async (username, password) => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
            const response = await fetch(`${apiUrl}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });
            const responseData = await response.json();
            if (!response.ok || !responseData.success) {
                return {
                    success: false,
                    error: responseData.error || responseData.message || 'Login gagal'
                };
            }
            // Jika login berhasil
            const user = responseData.user || responseData.data?.user || { username };
            const token = responseData.token || responseData.data?.token;
            if (token) {
                Cookies.set('authToken', token, { expires: 1 });
            }
            localStorage.setItem('user', JSON.stringify(user));
            return {
                success: true,
                data: {
                    token,
                    user
                }
            };
        } catch (error) {
            console.error('Login error:', error);
            return {
                success: false,
                error: 'Terjadi kesalahan saat login. Silakan coba lagi.'
            };
        }
    },
}; 