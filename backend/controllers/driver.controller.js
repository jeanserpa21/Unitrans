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
    const dataInicio =
      req.query.dataInicio ||
      (() => {
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
 * Lista passageiros da viagem
 */
exports.getPassengers = async (req, res) => {
  try {
    const motoristaId = req.user.motorista_id;

    if (!motoristaId) {
      return res.status(403).json({ error: 'Usuário não é um motorista' });
    }

    const pontos = await driverService.getPassengers(motoristaId);

    return res.json({
      pontos,
      total: pontos.reduce(
        (sum, ponto) => sum + (ponto.passageiros?.length || 0),
        0
      )
    });
  } catch (error) {
    console.error('Erro ao buscar passageiros:', error);
    return res.status(500).json({ error: 'Erro ao buscar passageiros' });
  }
};

/**
 * Lista pontos da rota
 */
exports.getRoutePoints = async (req, res) => {
  try {
    const motoristaId = req.user.motorista_id;

    if (!motoristaId) {
      return res.status(403).json({ error: 'Usuário não é um motorista' });
    }

    const pontos = await driverService.getRoutePoints(motoristaId);

    return res.json({ pontos });
  } catch (error) {
    console.error('Erro ao buscar pontos:', error);
    return res.status(500).json({ error: 'Erro ao buscar pontos' });
  }
};

/**
 * Valida QR Code
 */
exports.validateQRCode = async (req, res) => {
  try {
    const motoristaId = req.user.motorista_id;
    const { qrcode } = req.body;

    if (!motoristaId) {
      return res.status(403).json({ error: 'Usuário não é um motorista' });
    }

    if (!qrcode) {
      return res.status(400).json({ error: 'QR Code é obrigatório' });
    }

    const result = await driverService.validateQRCode(motoristaId, qrcode);

    return res.json({
      success: true,
      message: `✅ Embarque confirmado: ${result.passageiro}`,
      passageiro: result.passageiro
    });
  } catch (error) {
    console.error('Erro ao validar QR Code:', error);

    if (error.message === 'NENHUMA_VIAGEM_ATIVA') {
      return res.status(404).json({
        error: 'Nenhuma viagem ativa encontrada'
      });
    }

    if (error.message === 'VIAGEM_NAO_INICIADA') {
      return res.status(400).json({
        error: 'A viagem ainda não foi iniciada'
      });
    }

    if (error.message === 'QR_CODE_INVALIDO') {
      return res.status(404).json({
        error: 'QR Code inválido ou passageiro já embarcado'
      });
    }

    return res.status(500).json({ error: 'Erro ao validar QR Code' });
  }
};

/**
 * Anuncia próximo ponto
 */
exports.announceNextPoint = async (req, res) => {
  try {
    const motoristaId = req.user.motorista_id;
    const { pontoId } = req.body;

    if (!motoristaId) {
      return res.status(403).json({ error: 'Usuário não é um motorista' });
    }

    if (!pontoId) {
      return res.status(400).json({ error: 'ID do ponto é obrigatório' });
    }

    const result = await driverService.announceNextPoint(motoristaId, pontoId);

    return res.json({
      success: true,
      message: `📍 Anúncio enviado: ${result.ponto}`,
      ponto: result.ponto
    });
  } catch (error) {
    console.error('Erro ao anunciar ponto:', error);

    if (error.message === 'NENHUMA_VIAGEM_ATIVA') {
      return res.status(404).json({
        error: 'Nenhuma viagem ativa encontrada'
      });
    }

    return res.status(500).json({ error: 'Erro ao anunciar ponto' });
  }
};

/**
 * Enviar mensagem para passageiros (com logs)
 */
exports.sendMessage = async (req, res) => {
  try {
    const motoristaId = req.user.motorista_id;
    const { titulo, corpo } = req.body;

    console.log('💬 [DRIVER][SENDMESSAGE] Motorista:', motoristaId);
    console.log('📝 Título:', titulo);
    console.log('📄 Corpo:', corpo);

    if (!motoristaId) {
      console.log('❌ Usuário não é motorista');
      return res.status(403).json({ error: 'Usuário não é um motorista' });
    }

    if (!titulo || !corpo) {
      console.log('❌ Título ou corpo ausente');
      return res.status(400).json({ error: 'Título e corpo são obrigatórios' });
    }

    const result = await driverService.sendMessage(motoristaId, { titulo, corpo });

    console.log('✅ Mensagem enviada:', result.total_notificacoes, 'notificações');
    return res.json(result);
  } catch (error) {
    console.error('❌ [DRIVER][SENDMESSAGE] Erro:', error.message);

    if (error.message === 'NENHUMA_VIAGEM_ATIVA') {
      return res.status(404).json({ error: 'Nenhuma viagem ativa encontrada' });
    }

    if (error.message === 'MOTORISTA_SEM_LINHA') {
      return res.status(400).json({ error: 'Você não está vinculado a nenhuma linha' });
    }

    return res.status(500).json({ error: 'Erro ao enviar mensagem' });
  }
};
