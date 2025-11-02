import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
});

// Interceptor para adicionar token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// === DASHBOARD ===
export const getDashboard = async (data) => {
  const response = await api.get('/admin/dashboard', { params: { data } });
  return response.data;
};

// === PASSAGEIROS ===
export const getPassengers = async (params) => {
  const response = await api.get('/admin/passageiros', { params });
  return response.data;
};

export const approvePassenger = async (id) => {
  const response = await api.post(`/admin/passageiros/${id}/aprovar`);
  return response.data;
};

export const rejectPassenger = async (id) => {
  const response = await api.post(`/admin/passageiros/${id}/recusar`);
  return response.data;
};

// === MOTORISTAS ===
export const getDrivers = async () => {
  const response = await api.get('/admin/motoristas');
  return response.data;
};

export const createDriver = async (driverData) => {
  const response = await api.post('/admin/motoristas', driverData);
  return response.data;
};

export const updateDriver = async (id, driverData) => {
  const response = await api.put(`/admin/motoristas/${id}`, driverData);
  return response.data;
};

export const deleteDriver = async (id) => {
  const response = await api.delete(`/admin/motoristas/${id}`);
  return response.data;
};

// === LINHAS ===
export const getLines = async () => {
  const response = await api.get('/admin/linhas');
  return response.data;
};

export const createLine = async (lineData) => {
  const response = await api.post('/admin/linhas', lineData);
  return response.data;
};

export const updateLine = async (id, lineData) => {
  const response = await api.put(`/admin/linhas/${id}`, lineData);
  return response.data;
};

export const assignDriver = async (linhaId, motoristaId) => {
  const response = await api.post(`/admin/linhas/${linhaId}/motorista`, { motoristaId });
  return response.data;
};

export const getLinePassengers = async (linhaId) => {
  const response = await api.get(`/admin/linhas/${linhaId}/passageiros`);
  return response.data;
};

export const updateLineConfig = async (linhaId, configData) => {
  const response = await api.put(`/admin/linhas/${linhaId}/configuracao`, configData);
  return response.data;
};

// === VEÍCULOS ===
export const getVehicles = async () => {
  const response = await api.get('/admin/veiculos');
  return response.data;
};

export const createVehicle = async (vehicleData) => {
  const response = await api.post('/admin/veiculos', vehicleData);
  return response.data;
};

export const updateVehicle = async (id, vehicleData) => {
  const response = await api.put(`/admin/veiculos/${id}`, vehicleData);
  return response.data;
};

export const deleteVehicle = async (id) => {
  const response = await api.delete(`/admin/veiculos/${id}`);
  return response.data;
};

// === RELATÓRIOS ===
export const getActivePassengersReport = async () => {
  const response = await api.get('/admin/relatorios/passageiros-ativos');
  return response.data;
};

export const getAbsenceReport = async (dataInicio, dataFim) => {
  const response = await api.get('/admin/relatorios/faltas', {
    params: { dataInicio, dataFim }
  });
  return response.data;
};

export const getAttendanceReport = async (dataInicio, dataFim) => {
  const response = await api.get('/admin/relatorios/presenca', {
    params: { dataInicio, dataFim }
  });
  return response.data;
};

export const getTripsReport = async (dataInicio, dataFim) => {
  const response = await api.get('/admin/relatorios/viagens', {
    params: { dataInicio, dataFim }
  });
  return response.data;
};

// === VIAGENS E QR CODE ===
export const gerarQRCodeViagem = async (linhaId, data) => {
  const response = await api.post('/admin/viagens/gerar-qrcode', { linhaId, data });
  return response.data;
};

export const getPassageirosViagem = async (viagemId) => {
  const response = await api.get(`/viagens/${viagemId}/passageiros`);
  return response.data;
};

export default api;