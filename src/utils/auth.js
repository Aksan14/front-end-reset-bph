import Cookies from 'js-cookie';

export const getToken = () => {
  return Cookies.get('authToken');
};

export const getUser = () => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

export const isAuthenticated = () => {
  return !!getToken();
};

export const logout = () => {
  Cookies.remove('authToken');
  localStorage.removeItem('user');
  window.location.href = '/login';
};