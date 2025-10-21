const adminService = require('../services/admin.service');

/**
 * Dashboard
 */
exports.getDashboard = async (req, res) => {
  try {
    const { data } = req.query;
    const dashboard = await adminService.getDashboard(data);
    return res.json(dashboard);
  } catch (error) {
    console.error('Erro ao buscar dashboard:', error);
    return res.status(500).json({ error: 'Erro ao buscar dashboard' });
  }
};

/**
 * Listar passageiros
 */
exports.getPassengers = async (req, res) => {
  try {
    const { aprovado, page, limit } = req.query;
    const result = await adminService.getPassengers({ aprovado, page, limit });
    return res.json(result);
  } catch (error) {
    console.error('Erro ao listar passageiros:', error);
    return res.status(500).json({ error: 'Erro ao listar passageiros' });
  }
};

/**
 * Aprovar passageiro
 */
exports.approvePassenger = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user.id;
    
    const result = await adminService.approvePassenger(id, adminId);
    
    return res.json({
      success: true,
      message: 'Passageiro aprovado com sucesso!',
      passageiro: result
    });
  } catch (error) {
    console.error('Erro ao aprovar passageiro:', error);
    
    if (error.message === 'PASSAGEIRO_NAO_ENCONTRADO') {
      return res.status(404).json({ error: 'Passageiro não encontrado' });
    }
    
    return res.status(500).json({ error: 'Erro ao aprovar passageiro' });
  }
};

/**
 * Recusar passageiro
 */
exports.rejectPassenger = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await adminService.rejectPassenger(id);
    
    return res.json({
      success: true,
      message: result.message
    });
  } catch (error) {
    console.error('Erro ao recusar passageiro:', error);
    
    if (error.message === 'PASSAGEIRO_NAO_ENCONTRADO') {
      return res.status(404).json({ error: 'Passageiro não encontrado' });
    }
    
    return res.status(500).json({ error: 'Erro ao recusar passageiro' });
  }
};

/**
 * Listar motoristas
 */
exports.getDrivers = async (req, res) => {
  try {
    const drivers = await adminService.getDrivers();
    return res.json({ motoristas: drivers });
  } catch (error) {
    console.error('Erro ao listar motoristas:', error);
    return res.status(500).json({ error: 'Erro ao listar motoristas' });
  }
};

/**
 * Criar motorista
 */
exports.createDriver = async (req, res) => {
  try {
    const { nome, email, senha, cnh } = req.body;
    
    if (!nome || !email || !senha || !cnh) {
      return res.status(400).json({ 
        error: 'Nome, email, senha e CNH são obrigatórios' 
      });
    }
    
    const driver = await adminService.createDriver({ nome, email, senha, cnh });
    
    return res.status(201).json({
      success: true,
      message: 'Motorista criado com sucesso!',
      motorista: driver
    });
  } catch (error) {
    console.error('Erro ao criar motorista:', error);
    
    if (error.message === 'EMAIL_JA_EXISTE') {
      return res.status(400).json({ error: 'Email já cadastrado' });
    }
    
    return res.status(500).json({ error: 'Erro ao criar motorista' });
  }
};

/**
 * Atualizar motorista
 */
exports.updateDriver = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, email, cnh, ativo } = req.body;
    
    const result = await adminService.updateDriver(id, { nome, email, cnh, ativo });
    
    return res.json({
      success: true,
      message: 'Motorista atualizado com sucesso!',
      motorista: result
    });
  } catch (error) {
    console.error('Erro ao atualizar motorista:', error);
    return res.status(500).json({ error: 'Erro ao atualizar motorista' });
  }
};

/**
 * Listar linhas
 */
exports.getLines = async (req, res) => {
  try {
    const lines = await adminService.getLines();
    return res.json({ linhas: lines });
  } catch (error) {
    console.error('Erro ao listar linhas:', error);
    return res.status(500).json({ error: 'Erro ao listar linhas' });
  }
};

/**
 * Criar linha
 */
exports.createLine = async (req, res) => {
  try {
    const { nome, universidade_id, veiculo_id, motorista_id } = req.body;
    
    if (!nome) {
      return res.status(400).json({ error: 'Nome da linha é obrigatório' });
    }
    
    const line = await adminService.createLine({ 
      nome, 
      universidade_id, 
      veiculo_id, 
      motorista_id 
    });
    
    return res.status(201).json({
      success: true,
      message: 'Linha criada com sucesso!',
      linha: line
    });
  } catch (error) {
    console.error('Erro ao criar linha:', error);
    return res.status(500).json({ error: 'Erro ao criar linha' });
  }
};

/**
 * Atualizar linha
 */
exports.updateLine = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, universidade_id, veiculo_id, motorista_id, ativo } = req.body;
    
    const result = await adminService.updateLine(id, { 
      nome, 
      universidade_id, 
      veiculo_id, 
      motorista_id, 
      ativo 
    });
    
    return res.json({
      success: true,
      message: 'Linha atualizada com sucesso!',
      linha: result
    });
  } catch (error) {
    console.error('Erro ao atualizar linha:', error);
    
    if (error.message === 'LINHA_NAO_ENCONTRADA') {
      return res.status(404).json({ error: 'Linha não encontrada' });
    }
    
    if (error.message === 'NENHUM_CAMPO_PARA_ATUALIZAR') {
      return res.status(400).json({ error: 'Nenhum campo para atualizar' });
    }
    
    return res.status(500).json({ error: 'Erro ao atualizar linha' });
  }
};

/**
 * Atribuir motorista a linha
 */
exports.assignDriver = async (req, res) => {
  try {
    const { id } = req.params;
    const { motorista_id } = req.body;
    
    if (!motorista_id) {
      return res.status(400).json({ error: 'ID do motorista é obrigatório' });
    }
    
    const result = await adminService.assignDriver(id, motorista_id);
    
    return res.json({
      success: true,
      message: 'Motorista atribuído com sucesso!',
      linha: result
    });
  } catch (error) {
    console.error('Erro ao atribuir motorista:', error);
    
    if (error.message === 'LINHA_NAO_ENCONTRADA') {
      return res.status(404).json({ error: 'Linha não encontrada' });
    }
    
    return res.status(500).json({ error: 'Erro ao atribuir motorista' });
  }
};

/**
 * Listar pontos
 */
exports.getPoints = async (req, res) => {
  try {
    const { linhaId } = req.params;
    const points = await adminService.getPoints(linhaId);
    return res.json({ pontos: points });
  } catch (error) {
    console.error('Erro ao listar pontos:', error);
    return res.status(500).json({ error: 'Erro ao listar pontos' });
  }
};

/**
 * Criar ponto
 */
exports.createPoint = async (req, res) => {
  try {
    const { linhaId } = req.params;
    const { nome, latitude, longitude, ordem, raio_m } = req.body;
    
    if (!nome || !latitude || !longitude || !ordem) {
      return res.status(400).json({ 
        error: 'Nome, latitude, longitude e ordem são obrigatórios' 
      });
    }
    
    const point = await adminService.createPoint(linhaId, { 
      nome, 
      latitude, 
      longitude, 
      ordem, 
      raio_m 
    });
    
    return res.status(201).json({
      success: true,
      message: 'Ponto criado com sucesso!',
      ponto: point
    });
  } catch (error) {
    console.error('Erro ao criar ponto:', error);
    return res.status(500).json({ error: 'Erro ao criar ponto' });
  }
};

/**
 * Atualizar ponto
 */
exports.updatePoint = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, latitude, longitude, ordem, raio_m, ativo } = req.body;
    
    const result = await adminService.updatePoint(id, { 
      nome, 
      latitude, 
      longitude, 
      ordem, 
      raio_m, 
      ativo 
    });
    
    return res.json({
      success: true,
      message: 'Ponto atualizado com sucesso!',
      ponto: result
    });
  } catch (error) {
    console.error('Erro ao atualizar ponto:', error);
    
    if (error.message === 'PONTO_NAO_ENCONTRADO') {
      return res.status(404).json({ error: 'Ponto não encontrado' });
    }
    
    return res.status(500).json({ error: 'Erro ao atualizar ponto' });
  }
};

/**
 * Deletar ponto
 */
exports.deletePoint = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await adminService.deletePoint(id);
    
    return res.json({
      success: true,
      message: result.message
    });
  } catch (error) {
    console.error('Erro ao deletar ponto:', error);
    
    if (error.message === 'PONTO_NAO_ENCONTRADO') {
      return res.status(404).json({ error: 'Ponto não encontrado' });
    }
    
    return res.status(500).json({ error: 'Erro ao deletar ponto' });
  }
};

/**
 * Relatório de faltas
 */
exports.getAbsenceReport = async (req, res) => {
  try {
    const { dataInicio, dataFim, linhaId } = req.query;
    
    if (!dataInicio || !dataFim) {
      return res.status(400).json({ 
        error: 'Data de início e fim são obrigatórias' 
      });
    }
    
    const report = await adminService.getAbsenceReport({ 
      dataInicio, 
      dataFim, 
      linhaId 
    });
    
    return res.json({ 
      faltas: report,
      periodo: { dataInicio, dataFim }
    });
  } catch (error) {
    console.error('Erro ao gerar relatório:', error);
    return res.status(500).json({ error: 'Erro ao gerar relatório de faltas' });
  }
};

/**
 * Relatório de taxa de presença
 */
exports.getAttendanceReport = async (req, res) => {
  try {
    const { dataInicio, dataFim, linhaId } = req.query;
    
    if (!dataInicio || !dataFim) {
      return res.status(400).json({ 
        error: 'Data de início e fim são obrigatórias' 
      });
    }
    
    const report = await adminService.getAttendanceReport({ 
      dataInicio, 
      dataFim, 
      linhaId 
    });
    
    return res.json({ 
      relatorio: report,
      periodo: { dataInicio, dataFim }
    });
  } catch (error) {
    console.error('Erro ao gerar relatório:', error);
    return res.status(500).json({ error: 'Erro ao gerar relatório de presença' });
  }
};