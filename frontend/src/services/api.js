import axios from 'axios';

// 🌐 Usar variável de ambiente OU fallback para desenvolvimento local
const API_URL = import.meta.env.VITE_API_URL || 'http://192.168.1.8:3000/api';

console.log('[API] Base URL utilizada:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log pra debug (pode remover depois)
    console.log('[API][REQUEST]', {
      method: config.method,
      url: config.baseURL + config.url,
    });

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Logar o erro pra entender melhor
    console.error('[API][RESPONSE][ERRO]', {
      status: error.response?.status,
      data: error.response?.data,
    });

    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;