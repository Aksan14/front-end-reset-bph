import { endpoints } from '@/config/api';

export const loginUser = async (credentials) => {
  try {
    const response = await fetch(endpoints.ADMIN_LOGIN, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        nra: credentials.username,
        password: credentials.password
      })
    });

    const data = await response.json();

    if (data.code !== 200) {
      throw new Error(data.message || 'Login gagal');
    }

    return {
      success: true,
      data: {
        token: data.data,
        user: { nra: credentials.username }
      }
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || 'Terjadi kesalahan saat login'
    };
  }
};