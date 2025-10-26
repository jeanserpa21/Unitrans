import api from './api';

/**
 * Dashboard
 */
export const getDashboard = async () => {
  const response = await api.get('/admin/dashboard');
  return response.data;
};

/**
 * Passageiros
 */
export const getPassengers = async () => {
  const response = await api.get('/admin/passageiros');
  return response.data;
};

export const approvePassenger = async (id) => {
  const response = await api.put(`/admin/passageiros/${id}/aprovar`);
  return response.data;
};

export const rejectPassenger = async (id) => {
  const response = await api.put(`/admin/passageiros/${id}/recusar`);
  return response.data;
};

/**
 * Motoristas
 */
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

/**
 * Relatórios
 */
export const getAbsenceReport = async (params) => {
  const response = await api.get('/admin/relatorios/faltas', { params });
  return response.data;
};

export const getAttendanceReport = async (params) => {
  const response = await api.get('/admin/relatorios/presenca', { params });
  return response.data;
};