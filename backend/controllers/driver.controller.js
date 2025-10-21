const driverService = require('../services/driver.service');

/**
 * Ver viagem do dia
 */
exports.getTodayTrip = async (req, res) => {
  try {
    const motoristaId = req.user.motorista_id;
    
    if (!motoristaId) {
      return res.status(403).json({ error: 'Usuário não é um motorista' });
    }
    
    const trip = await driverService.getTodayTrip(motoristaId);
    
    if (!trip) {
      return res.status(404).json({ 
        message: 'Nenhuma viagem programada para hoje' 
      });
    }
    
    return res.json(trip);
    
  } catch (error) {
    console.error('Erro ao buscar viagem:', error);
    return res.status(500).json({ error: 'Erro ao buscar viagem do dia' });
  }
};

/**
 * Iniciar viagem
 */
exports.startTrip = async (req, res) => {
  try {
    const motoristaId = req.user.motorista_id;
    
    if (!motoristaId) {
      return res.status(403).json({ error: 'Usuário não é um motorista' });
    }
    
    const trip = await driverService.startTrip(motoristaId);
    
    return res.json({
      success: true,
      message: 'Viagem iniciada com sucesso! Passageiros foram notificados.',
      viagem: trip
    });
    
  } catch (error) {
    console.error('Erro ao iniciar viagem:', error);
    
    if (error.message === 'NENHUMA_VIAGEM_PLANEJADA') {
      return res.status(404).json({ error: 'Nenhuma viagem planejada para hoje' });
    }
    
    if (error.message === 'VIAGEM_JA_INICIADA') {
      return res.status(400).json({ error: 'A viagem já foi iniciada' });
    }
    
    return res.status(500).json({ error: 'Erro ao iniciar viagem' });
  }
};

/**
 * Finalizar viagem
 */
exports.endTrip = async (req, res) => {
  try {
    const motoristaId = req.user.motorista_id;
    
    if (!motoristaId) {
      return res.status(403).json({ error: 'Usuário não é um motorista' });
    }
    
    const trip = await driverService.endTrip(motoristaId);
    
    return res.json({
      success: true,
      message: 'Viagem finalizada com sucesso!',
      viagem: trip
    });
    
  } catch (error) {
    console.error('Erro ao finalizar viagem:', error);
    
    if (error.message === 'VIAGEM_NAO_ENCONTRADA') {
      return res.status(404).json({ 
        error: 'Nenhuma viagem em andamento encontrada' 
      });
    }
    
    return res.status(500).json({ error: 'Erro ao finalizar viagem' });
  }
};

/**
 * Ver histórico
 */
exports.getHistory = async (req, res) => {
  try {
    const motoristaId = req.user.motorista_id;
    
    if (!motoristaId) {
      return res.status(403).json({ error: 'Usuário não é um motorista' });
    }
    
    // Padrão: últimos 30 dias
    const dataFim = req.query.dataFim || new Date().toISOString().split('T')[0];
    const dataInicio = req.query.dataInicio || (() => {
      const d = new Date();
      d.setDate(d.getDate() - 30);
      return d.toISOString().split('T')[0];
    })();
    
    const history = await driverService.getHistory(motoristaId, {
      dataInicio,
      dataFim
    });
    
    return res.json({ 
      viagens: history,
      periodo: { dataInicio, dataFim }
    });
    
  } catch (error) {
    console.error('Erro ao buscar histórico:', error);
    return res.status(500).json({ error: 'Erro ao buscar histórico' });
  }
};

/**
 * Enviar mensagem
 */
exports.sendMessage = async (req, res) => {
  try {
    const motoristaId = req.user.motorista_id;
    const { titulo, corpo } = req.body;
    
    if (!motoristaId) {
      return res.status(403).json({ error: 'Usuário não é um motorista' });
    }
    
    if (!titulo || !corpo) {
      return res.status(400).json({ 
        error: 'Título e corpo da mensagem são obrigatórios' 
      });
    }
    
    const message = await driverService.sendMessage(motoristaId, {
      titulo,
      corpo
    });
    
    return res.status(201).json({
      success: true,
      message: 'Mensagem enviada com sucesso!',
      mensagem: message
    });
    
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    
    if (error.message === 'MOTORISTA_SEM_LINHA') {
      return res.status(400).json({ 
        error: 'Você não está vinculado a nenhuma linha' 
      });
    }
    
    return res.status(500).json({ error: 'Erro ao enviar mensagem' });
  }
};