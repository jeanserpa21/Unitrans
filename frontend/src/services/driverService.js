import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Criar instância do axios com interceptor
const api = axios.create({
  baseURL: API_URL,
});

// Adicionar token automaticamente em todas as requisições
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * 🚌 Buscar viagem do dia
 */
export const getTodayTrip = async () => {
  const response = await api.get('/driver/viagem-hoje');
  return response.data;
};

/**
 * 🚀 Iniciar viagem
 */
export const startTrip = async () => {
  const response = await api.post('/driver/iniciar-viagem');
  return response.data;
};

/**
 * 🏁 Finalizar viagem
 */
export const endTrip = async () => {
  const response = await api.post('/driver/finalizar-viagem');
  return response.data;
};

/**
 * 👥 Listar passageiros da viagem
 */
export const getPassengers = async () => {
  const response = await api.get('/driver/passageiros');
  return response.data;
};

/**
 * 📍 Listar pontos da rota
 */
export const getRoutePoints = async () => {
  const response = await api.get('/driver/pontos');
  return response.data;
};

/**
 * ✅ Validar QR Code
 */
export const validateQRCode = async (qrcode) => {
  const response = await api.post('/driver/validar-qrcode', { qrcode });
  return response.data;
};

/**
 * 📢 Anunciar próximo ponto
 */
export const announceNextPoint = async (pontoId) => {
  const response = await api.post('/driver/anunciar-ponto', { pontoId });
  return response.data;
};

/**
 * 📜 Buscar histórico
 */
export const getHistory = async (params = {}) => {
  const response = await api.get('/driver/historico', { params });
  return response.data;
};

/**
 * 💬 Enviar mensagem
 */
export const sendMessage = async (titulo, corpo) => {
  const response = await api.post('/driver/mensagens', { titulo, corpo });
  return response.data;
};

export default {
  getTodayTrip,
  startTrip,
  endTrip,
  getPassengers,
  getRoutePoints,
  validateQRCode,
  announceNextPoint,
  getHistory,
  sendMessage,
};