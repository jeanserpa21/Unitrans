const passengerService = require('../services/passenger.service');

/**
 * Ver viagem do dia
 */
exports.getTodayTrip = async (req, res) => {
  try {
    const passengerId = req.user.passageiro_id;
    
    if (!passengerId) {
      return res.status(403).json({ error: 'Usuário não é um passageiro' });
    }
    
    const trip = await passengerService.getTodayTrip(passengerId);
    
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
 * Fazer check-in ou check-out (simular QR Code)
 */
exports.checkInOut = async (req, res) => {
  try {
    const passengerId = req.user.passageiro_id;
    const { viagem_id } = req.body;
    
    if (!passengerId) {
      return res.status(403).json({ error: 'Usuário não é um passageiro' });
    }
    
    if (!viagem_id) {
      return res.status(400).json({ error: 'ID da viagem é obrigatório' });
    }
    
    const result = await passengerService.processCheckInOut(passengerId, viagem_id);
    
    return res.json({
      success: true,
      tipo: result.tipo,
      mensagem: result.tipo === 'EMBARQUE' 
        ? 'Check-in realizado com sucesso!' 
        : 'Check-out realizado com sucesso!',
      horario: result.timestamp
    });
    
  } catch (error) {
    console.error('Erro no check-in/out:', error);
    
    if (error.message === 'PASSAGEIRO_NAO_VINCULADO') {
      return res.status(400).json({ error: 'Você não está vinculado a esta viagem' });
    }
    
    if (error.message === 'VIAGEM_NAO_ENCONTRADA') {
      return res.status(404).json({ error: 'Viagem não encontrada' });
    }
    
    if (error.message === 'VIAGEM_NAO_INICIADA') {
      return res.status(400).json({ error: 'A viagem ainda não foi iniciada pelo motorista' });
    }
    
    if (error.message === 'JA_DESEMBARCADO') {
      return res.status(400).json({ error: 'Você já fez check-out desta viagem' });
    }
    
    return res.status(500).json({ error: 'Erro ao processar check-in/out' });
  }
};

/**
 * Solicitar carona
 */
exports.requestRide = async (req, res) => {
  try {
    const passengerId = req.user.passageiro_id;
    const { data, observacao } = req.body;
    
    if (!passengerId) {
      return res.status(403).json({ error: 'Usuário não é um passageiro' });
    }
    
    if (!data) {
      return res.status(400).json({ error: 'Data é obrigatória' });
    }
    
    // Validar data não é no passado
    const dataViagem = new Date(data);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    if (dataViagem < hoje) {
      return res.status(400).json({ error: 'Data não pode ser no passado' });
    }
    
    const request = await passengerService.requestRide(
      passengerId,
      data,
      observacao
    );
    
    return res.status(201).json({
      success: true,
      message: 'Solicitação de carona criada com sucesso!',
      solicitacao: request
    });
    
  } catch (error) {
    console.error('Erro ao solicitar carona:', error);
    
    if (error.message === 'PASSAGEIRO_SEM_LINHA') {
      return res.status(400).json({ error: 'Você não está vinculado a nenhuma linha' });
    }
    
    if (error.message === 'SOLICITACAO_DUPLICADA') {
      return res.status(400).json({ error: 'Você já tem uma solicitação para esta data' });
    }
    
    return res.status(500).json({ error: 'Erro ao solicitar carona' });
  }
};

/**
 * Cancelar solicitação
 */
exports.cancelRideRequest = async (req, res) => {
  try {
    const passengerId = req.user.passageiro_id;
    const { id } = req.params;
    
    if (!passengerId) {
      return res.status(403).json({ error: 'Usuário não é um passageiro' });
    }
    
    const result = await passengerService.cancelRideRequest(passengerId, id);
    
    return res.json({
      success: true,
      message: 'Solicitação cancelada com sucesso!',
      solicitacao: result
    });
    
  } catch (error) {
    console.error('Erro ao cancelar solicitação:', error);
    
    if (error.message === 'SOLICITACAO_NAO_ENCONTRADA') {
      return res.status(404).json({ error: 'Solicitação não encontrada ou já processada' });
    }
    
    return res.status(500).json({ error: 'Erro ao cancelar solicitação' });
  }
};

/**
 * Ver mensagens
 */
exports.getMessages = async (req, res) => {
  try {
    const passengerId = req.user.passageiro_id;
    
    if (!passengerId) {
      return res.status(403).json({ error: 'Usuário não é um passageiro' });
    }
    
    const messages = await passengerService.getMessages(passengerId);
    
    return res.json({ messages });
    
  } catch (error) {
    console.error('Erro ao buscar mensagens:', error);
    return res.status(500).json({ error: 'Erro ao buscar mensagens' });
  }
};

/**
 * Ver perfil
 */
exports.getProfile = async (req, res) => {
  try {
    const passengerId = req.user.passageiro_id;
    
    if (!passengerId) {
      return res.status(403).json({ error: 'Usuário não é um passageiro' });
    }
    
    const query = `
      SELECT 
        u.id,
        u.nome,
        u.email,
        u.foto_url,
        p.aprovado,
        p.criado_em,
        un.nome as universidade,
        pt.nome as ponto_padrao,
        l.nome as linha
      FROM passageiros p
      INNER JOIN usuarios u ON p.usuario_id = u.id
      LEFT JOIN universidades un ON p.universidade_id = un.id
      LEFT JOIN pontos pt ON p.ponto_padrao_id = pt.id
      LEFT JOIN linhas l ON pt.linha_id = l.id
      WHERE p.id = $1
    `;
    
    const db = require('../config/database');
    const result = await db.query(query, [passengerId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Perfil não encontrado' });
    }
    
    return res.json({ profile: result.rows[0] });
    
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    return res.status(500).json({ error: 'Erro ao buscar perfil' });
  }
};