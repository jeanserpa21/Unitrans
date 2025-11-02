const adminService = require('../services/admin.service');

/**
 * Dashboard
 */
exports.getDashboard = async (req, res) => {
  try {
    const { data } = req.query;
    const dashboard = await adminService.getDashboard(data);
    res.json(dashboard);
  } catch (error) {
    console.error('Erro no getDashboard:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Passageiros
 */
exports.getPassengers = async (req, res) => {
  try {
    const result = await adminService.getPassengers();
    res.json(result);
  } catch (error) {
    console.error('Erro no getPassengers:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.approvePassenger = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await adminService.approvePassenger(parseInt(id));
    res.json(result);
  } catch (error) {
    console.error('Erro no approvePassenger:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.rejectPassenger = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await adminService.rejectPassenger(parseInt(id));
    res.json(result);
  } catch (error) {
    console.error('Erro no rejectPassenger:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Motoristas
 */
exports.getDrivers = async (req, res) => {
  try {
    const result = await adminService.getDrivers();
    res.json(result);
  } catch (error) {
    console.error('Erro no getDrivers:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.createDriver = async (req, res) => {
  try {
    const driverData = req.body;
    const result = await adminService.createDriver(driverData);
    res.json(result);
  } catch (error) {
    console.error('Erro no createDriver:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.updateDriver = async (req, res) => {
  try {
    const { id } = req.params;
    const driverData = req.body;
    const result = await adminService.updateDriver(parseInt(id), driverData);
    res.json(result);
  } catch (error) {
    console.error('Erro no updateDriver:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Deletar motorista
 */
exports.deleteDriver = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await adminService.deleteDriver(parseInt(id));
    res.json(result);
  } catch (error) {
    console.error('Erro no deleteDriver:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Linhas
 */
exports.getLines = async (req, res) => {
  try {
    const result = await adminService.getLines();
    res.json(result);
  } catch (error) {
    console.error('Erro no getLines:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.createLine = async (req, res) => {
  try {
    const lineData = req.body;
    const result = await adminService.createLine(lineData);
    res.json(result);
  } catch (error) {
    console.error('Erro no createLine:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.updateLine = async (req, res) => {
  try {
    const { id } = req.params;
    const lineData = req.body;
    const result = await adminService.updateLine(parseInt(id), lineData);
    res.json(result);
  } catch (error) {
    console.error('Erro no updateLine:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.assignDriver = async (req, res) => {
  try {
    const { id } = req.params;
    const { motoristaId } = req.body;
    const result = await adminService.assignDriver(parseInt(id), motoristaId);
    res.json(result);
  } catch (error) {
    console.error('Erro no assignDriver:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Pontos
 */
exports.getPoints = async (req, res) => {
  try {
    const { linhaId } = req.params;
    const result = await adminService.getPoints(parseInt(linhaId));
    res.json(result);
  } catch (error) {
    console.error('Erro no getPoints:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.createPoint = async (req, res) => {
  try {
    const { linhaId } = req.params;
    const pointData = req.body;
    const result = await adminService.createPoint(parseInt(linhaId), pointData);
    res.json(result);
  } catch (error) {
    console.error('Erro no createPoint:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.updatePoint = async (req, res) => {
  try {
    const { id } = req.params;
    const pointData = req.body;
    const result = await adminService.updatePoint(parseInt(id), pointData);
    res.json(result);
  } catch (error) {
    console.error('Erro no updatePoint:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.deletePoint = async (req, res) => {
  try {
    const { id } = req.params;
    await adminService.deletePoint(parseInt(id));
    res.json({ success: true, message: 'Ponto deletado com sucesso' });
  } catch (error) {
    console.error('Erro no deletePoint:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Relatórios
 */
exports.getAbsenceReport = async (req, res) => {
  try {
    const { dataInicio, dataFim } = req.query;
    const result = await adminService.getAbsenceReport(dataInicio, dataFim);
    res.json(result);
  } catch (error) {
    console.error('Erro no getAbsenceReport:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getAttendanceReport = async (req, res) => {
  try {
    const { dataInicio, dataFim } = req.query;
    const result = await adminService.getAttendanceReport(dataInicio, dataFim);
    res.json(result);
  } catch (error) {
    console.error('Erro no getAttendanceReport:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Buscar passageiros de uma linha
 */
exports.getLinePassengers = async (req, res) => {
  try {
    const { linhaId } = req.params;
    const result = await adminService.getLinePassengers(parseInt(linhaId));
    res.json(result);
  } catch (error) {
    console.error('Erro no getLinePassengers:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Atualizar configurações da linha
 */
exports.updateLineConfig = async (req, res) => {
  try {
    const { linhaId } = req.params;
    const configData = req.body;
    const result = await adminService.updateLineConfig(parseInt(linhaId), configData);
    res.json(result);
  } catch (error) {
    console.error('Erro no updateLineConfig:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Veículos
 */
exports.createVehicle = async (req, res) => {
  try {
    const vehicleData = req.body;
    const result = await adminService.createVehicle(vehicleData);
    res.json(result);
  } catch (error) {
    console.error('Erro no createVehicle:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.updateVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const vehicleData = req.body;
    const result = await adminService.updateVehicle(parseInt(id), vehicleData);
    res.json(result);
  } catch (error) {
    console.error('Erro no updateVehicle:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.deleteVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await adminService.deleteVehicle(parseInt(id));
    res.json(result);
  } catch (error) {
    console.error('Erro no deleteVehicle:', error);
    res.status(500).json({ error: error.message });
  }
};
/**
 * Relatórios
 */
exports.getActivePassengersReport = async (req, res) => {
  try {
    const result = await adminService.getActivePassengersReport();
    res.json(result);
  } catch (error) {
    console.error('Erro no getActivePassengersReport:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getAbsenceReport = async (req, res) => {
  try {
    const { dataInicio, dataFim } = req.query;
    const result = await adminService.getAbsenceReport(dataInicio, dataFim);
    res.json(result);
  } catch (error) {
    console.error('Erro no getAbsenceReport:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getAttendanceReport = async (req, res) => {
  try {
    const { dataInicio, dataFim } = req.query;
    const result = await adminService.getAttendanceReport(dataInicio, dataFim);
    res.json(result);
  } catch (error) {
    console.error('Erro no getAttendanceReport:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getTripsReport = async (req, res) => {
  try {
    const { dataInicio, dataFim } = req.query;
    const result = await adminService.getTripsReport(dataInicio, dataFim);
    res.json(result);
  } catch (error) {
    console.error('Erro no getTripsReport:', error);
    res.status(500).json({ error: error.message });
  }
};