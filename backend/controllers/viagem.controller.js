const viagemService = require('../services/viagem.service');
const QRCode = require('qrcode');

/**
 * Gerar QR Code para viagem do dia
 */
exports.gerarQRCodeViagem = async (req, res) => {
  try {
    const { linhaId, data } = req.body;

    // Criar ou buscar viagem
    const viagem = await viagemService.getOrCreateViagemDoDia(linhaId, data);

    // Se a viagem acabou de ser criada, temos o token em texto claro
    if (viagem.token_qr) {
      // Gerar QR Code com o token
      const qrCodeDataURL = await QRCode.toDataURL(viagem.token_qr);

      return res.json({
        viagem_id: viagem.id,
        linha_id: viagem.linha_id,
        data: viagem.data,
        qrcode: qrCodeDataURL,
        token: viagem.token_qr
      });
    }

    // Se a viagem já existia, retornar sem o token (por segurança)
    res.json({
      message: 'Viagem já existe. QR Code já foi gerado anteriormente.',
      viagem_id: viagem.id,
      linha_id: viagem.linha_id,
      data: viagem.data
    });

  } catch (error) {
    console.error('Erro ao gerar QR Code:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Passageiro solicita participar de viagem
 */
exports.solicitarViagem = async (req, res) => {
  try {
    const passageiroId = req.user.id; // Assumindo que vem do middleware de autenticação
    const { linhaId, data, pontoId } = req.body;

    const result = await viagemService.solicitarViagem(passageiroId, linhaId, data, pontoId);

    res.json(result);
  } catch (error) {
    console.error('Erro ao solicitar viagem:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Check-in: Passageiro scanneia QR Code ao embarcar
 */
exports.checkIn = async (req, res) => {
  try {
    const usuarioId = req.user.id; // ID do usuário (4)
    const { token, latitude, longitude } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Token do QR Code é obrigatório' });
    }

    // BUSCAR O PASSAGEIRO_ID A PARTIR DO USUARIO_ID
    const passageiroQuery = await require('../config/database').query(
      'SELECT id FROM passageiros WHERE usuario_id = $1',
      [usuarioId]
    );

    if (passageiroQuery.rows.length === 0) {
      return res.status(400).json({ error: 'Passageiro não encontrado' });
    }

    const passageiroId = passageiroQuery.rows[0].id; // ID do passageiro (1)

    const result = await viagemService.checkIn(passageiroId, token, latitude, longitude);

    res.json(result);
  } catch (error) {
    console.error('Erro no check-in:', error);
    res.status(400).json({ error: error.message });
  }
};

/**
 * Check-out: Passageiro scanneia QR Code ao desembarcar
 */
exports.checkOut = async (req, res) => {
  try {
    const usuarioId = req.user.id;
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Token do QR Code é obrigatório' });
    }

    // BUSCAR O PASSAGEIRO_ID A PARTIR DO USUARIO_ID
    const passageiroQuery = await require('../config/database').query(
      'SELECT id FROM passageiros WHERE usuario_id = $1',
      [usuarioId]
    );

    if (passageiroQuery.rows.length === 0) {
      return res.status(400).json({ error: 'Passageiro não encontrado' });
    }

    const passageiroId = passageiroQuery.rows[0].id;

    const result = await viagemService.checkOut(passageiroId, token);

    res.json(result);
  } catch (error) {
    console.error('Erro no check-out:', error);
    res.status(400).json({ error: error.message });
  }
};

/**
 * Listar passageiros de uma viagem (para motorista)
 */
exports.getPassageirosViagem = async (req, res) => {
  try {
    const { viagemId } = req.params;

    const passageiros = await viagemService.getPassageirosViagem(viagemId);

    res.json({ passageiros });
  } catch (error) {
    console.error('Erro ao buscar passageiros:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Minhas viagens (passageiro)
 */
/**
 * Minhas viagens (passageiro)
 */
exports.getMinhasViagens = async (req, res) => {
  try {
    console.log('🔐 [getMinhasViagens] req.user:', req.user);

    const passageiroIdClaim = req.user.passageiro_id || req.user.id;
    console.log('🧾 [getMinhasViagens] passageiroId (claim):', passageiroIdClaim);

    const db = require('../config/database');

    // Descobrir o ID do passageiro a partir do usuário autenticado
    const passageiroQuery = await db.query(
      'SELECT id FROM passageiros WHERE usuario_id = $1',
      [req.user.id]
    );

    console.log('🔎 [getMinhasViagens] Passageiro query rows:', passageiroQuery.rows);

    if (passageiroQuery.rows.length === 0) {
      console.log('❌ [getMinhasViagens] Nenhum passageiro para usuario_id:', req.user.id);
      return res.json({ viagens: [] });
    }

    const passId = passageiroQuery.rows[0].id;
    console.log('✅ [getMinhasViagens] passageiro_id resolvido:', passId);

    const sql = `
      SELECT 
        v.id AS viagem_id,
        v.data,
        v.status AS viagem_status,
        l.nome AS linha,               -- legado (se alguém usa ainda)
        l.nome AS linha_nome,          -- usado pela UI nova
        pv.status AS meu_status,
        pv.checkin_em AS horario_embarque,
        pv.checkout_em AS horario_desembarque,
        pt.nome AS ponto
      FROM passageiros_viagem pv
      INNER JOIN viagens v   ON pv.viagem_id = v.id
      INNER JOIN linhas  l   ON v.linha_id   = l.id
      LEFT  JOIN pontos  pt  ON pv.ponto_id  = pt.id
      WHERE pv.passageiro_id = $1
      ORDER BY v.data DESC
      LIMIT 30
    `;

    console.log('📝 [getMinhasViagens] Executando SQL...');
    const result = await db.query(sql, [passId]);
    console.log('📊 [getMinhasViagens] Total de viagens:', result.rows.length);

    // Log detalhado (opcional; cuidado em produção)
    if (result.rows.length) {
      console.log('📋 [getMinhasViagens] Amostra primeira linha:', result.rows[0]);
    }

    return res.json({ viagens: result.rows });
  } catch (error) {
    console.error('💥 [getMinhasViagens] Erro:', error);
    return res.status(500).json({ error: error.message });
  }
};
