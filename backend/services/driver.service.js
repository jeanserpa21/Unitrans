const db = require('../config/database');
const crypto = require('crypto');

class DriverService {
  /**
   * Busca viagem do dia do motorista
   */
  async getTodayTrip(motoristaId) {
    const query = `
      SELECT 
        v.id,
        v.data,
        v.status,
        v.total_planejado,
        v.total_embarcados,
        v.total_desembarcados,
        l.nome as linha_nome,
        json_agg(
          json_build_object(
            'id', pv.id,
            'nome', u.nome,
            'foto_url', u.foto_url,
            'ponto', p.nome,
            'ponto_ordem', p.ordem,
            'status', pv.status
          ) ORDER BY p.ordem, u.nome
        ) as passageiros
      FROM viagens v
      INNER JOIN linhas l ON v.linha_id = l.id
      INNER JOIN passageiros_viagem pv ON v.id = pv.viagem_id
      INNER JOIN passageiros pas ON pv.passageiro_id = pas.id
      INNER JOIN usuarios u ON pas.usuario_id = u.id
      LEFT JOIN pontos p ON pv.ponto_id = p.id
      WHERE l.motorista_id = $1 
        AND v.data = CURRENT_DATE
      GROUP BY v.id, l.nome
    `;
    const result = await db.query(query, [motoristaId]);
    if (result.rows.length === 0) return null;
    return result.rows[0];
  }

  /**
   * Inicia a viagem do dia
   */
  async startTrip(motoristaId) {
    const viagemQuery = `
      SELECT v.id, v.status
      FROM viagens v
      INNER JOIN linhas l ON v.linha_id = l.id
      WHERE l.motorista_id = $1 
        AND v.data = CURRENT_DATE
    `;
    const viagemResult = await db.query(viagemQuery, [motoristaId]);

    if (viagemResult.rows.length === 0) {
      throw new Error('NENHUMA_VIAGEM_PLANEJADA');
    }

    const viagem = viagemResult.rows[0];
    if (viagem.status !== 'PLANEJADA') {
      throw new Error('VIAGEM_JA_INICIADA');
    }

    const viagemId = viagem.id;
    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const updateQuery = `
      UPDATE viagens
      SET status = 'EM_ANDAMENTO',
          iniciada_em = NOW(),
          token_qr_hash = $1
      WHERE id = $2
      RETURNING *
    `;
    const result = await db.query(updateQuery, [tokenHash, viagemId]);

    return { ...result.rows[0], token };
  }

  /**
   * Finaliza viagem
   */
  async endTrip(motoristaId) {
    const query = `
      UPDATE viagens v
      SET status = 'FINALIZADA',
          finalizada_em = NOW()
      FROM linhas l
      WHERE v.linha_id = l.id
        AND l.motorista_id = $1
        AND v.data = CURRENT_DATE
        AND v.status = 'EM_ANDAMENTO'
      RETURNING v.*
    `;
    const result = await db.query(query, [motoristaId]);
    if (result.rows.length === 0) throw new Error('VIAGEM_NAO_ENCONTRADA');

    await db.query(`
      UPDATE passageiros_viagem
      SET status = 'FALTOU'
      WHERE viagem_id = $1 AND status = 'AGUARDANDO'
    `, [result.rows[0].id]);

    return result.rows[0];
  }

  /**
   * Busca histórico de viagens
   */
  async getHistory(motoristaId, { dataInicio, dataFim }) {
    const query = `
      SELECT 
        v.id,
        v.data,
        v.status,
        v.total_planejado,
        v.total_embarcados,
        v.total_desembarcados,
        l.nome as linha_nome,
        v.iniciada_em,
        v.finalizada_em,
        ROUND((v.total_embarcados::NUMERIC / NULLIF(v.total_planejado, 0) * 100), 2) as taxa_presenca
      FROM viagens v
      INNER JOIN linhas l ON v.linha_id = l.id
      WHERE l.motorista_id = $1
        AND v.data BETWEEN $2 AND $3
      ORDER BY v.data DESC
    `;
    const result = await db.query(query, [motoristaId, dataInicio, dataFim]);
    return result.rows;
  }

  /**
   * 👥 Lista passageiros agrupados por ponto
   */
  async getPassengers(motoristaId) {
    const query = `
      SELECT 
        p.id as ponto_id,
        p.nome as ponto_nome,
        p.ordem as ponto_ordem,
        json_agg(
          json_build_object(
            'id', u.id,
            'nome', u.nome,
            'foto_url', u.foto_url,
            'status', pv.status,
            'passageiro_viagem_id', pv.id
          ) ORDER BY u.nome
        ) as passageiros
      FROM viagens v
      INNER JOIN linhas l ON v.linha_id = l.id
      INNER JOIN passageiros_viagem pv ON v.id = pv.viagem_id
      INNER JOIN passageiros pas ON pv.passageiro_id = pas.id
      INNER JOIN usuarios u ON pas.usuario_id = u.id
      LEFT JOIN pontos p ON pv.ponto_id = p.id
      WHERE l.motorista_id = $1 
        AND v.data = CURRENT_DATE
      GROUP BY p.id, p.nome, p.ordem
      ORDER BY p.ordem
    `;
    const result = await db.query(query, [motoristaId]);
    return result.rows;
  }

  /**
   * 📍 Lista pontos da rota com contadores
   */
  async getRoutePoints(motoristaId) {
    const query = `
      SELECT 
        p.id,
        p.nome,
        p.ordem,
        COUNT(pv.id) as total_passageiros,
        COUNT(pv.id) FILTER (WHERE pv.status = 'EMBARCADO') as embarcados,
        COUNT(pv.id) FILTER (WHERE pv.status = 'AGUARDANDO') as aguardando
      FROM pontos p
      INNER JOIN passageiros_viagem pv ON p.id = pv.ponto_id
      INNER JOIN viagens v ON pv.viagem_id = v.id
      INNER JOIN linhas l ON v.linha_id = l.id
      WHERE l.motorista_id = $1 
        AND v.data = CURRENT_DATE
      GROUP BY p.id, p.nome, p.ordem
      ORDER BY p.ordem
    `;
    const result = await db.query(query, [motoristaId]);
    return result.rows;
  }

  /**
   * ✅ Valida QR Code e marca embarque
   */
  async validateQRCode(motoristaId, qrCodeData) {
    const viagemQuery = `
      SELECT v.id, v.status, v.token_qr_hash
      FROM viagens v
      INNER JOIN linhas l ON v.linha_id = l.id
      WHERE l.motorista_id = $1 
        AND v.data = CURRENT_DATE
    `;
    const viagemResult = await db.query(viagemQuery, [motoristaId]);
    if (viagemResult.rows.length === 0) throw new Error('NENHUMA_VIAGEM_ATIVA');
    const viagem = viagemResult.rows[0];
    if (viagem.status !== 'EM_ANDAMENTO') throw new Error('VIAGEM_NAO_INICIADA');

    const updateQuery = `
      UPDATE passageiros_viagem pv
      SET status = 'EMBARCADO',
          embarcado_em = NOW()
      FROM passageiros pas
      INNER JOIN usuarios u ON pas.usuario_id = u.id
      WHERE pv.id = $1
        AND pv.viagem_id = $2
        AND pv.status = 'AGUARDANDO'
      RETURNING u.nome as passageiro_nome
    `;
    const result = await db.query(updateQuery, [qrCodeData, viagem.id]);
    if (result.rows.length === 0) throw new Error('QR_CODE_INVALIDO');

    await db.query(`
      UPDATE viagens
      SET total_embarcados = (
        SELECT COUNT(*) FROM passageiros_viagem 
        WHERE viagem_id = $1 AND status = 'EMBARCADO'
      )
      WHERE id = $1
    `, [viagem.id]);

    return { success: true, passageiro: result.rows[0].passageiro_nome };
  }

  /**
   * 📢 Anuncia próximo ponto
   */
  async announceNextPoint(motoristaId, pontoId) {
    const viagemQuery = `
      SELECT v.id, p.nome as ponto_nome
      FROM viagens v
      INNER JOIN linhas l ON v.linha_id = l.id
      INNER JOIN pontos p ON p.id = $2
      WHERE l.motorista_id = $1 
        AND v.data = CURRENT_DATE
        AND v.status = 'EM_ANDAMENTO'
    `;
    const result = await db.query(viagemQuery, [motoristaId, pontoId]);
    if (result.rows.length === 0) throw new Error('NENHUMA_VIAGEM_ATIVA');

    const { ponto_nome } = result.rows[0];
    return { success: true, ponto: ponto_nome };
  }
}

/**
 * Enviar mensagem para passageiros
 * (método anexado ao protótipo, com tabela viagens_passageiros)
 */
DriverService.prototype.sendMessage = async function (motoristaId, { titulo, corpo }) {
  console.log('🔍 Buscando viagem ativa para motorista:', motoristaId);

  // Buscar viagem ativa do motorista
  const viagemQuery = `
    SELECT v.id, v.linha_id
    FROM viagens v
    INNER JOIN motoristas m ON v.motorista_id = m.id
    WHERE m.id = $1
      AND v.data = CURRENT_DATE
      AND v.status IN ('PLANEJADA', 'EM_ANDAMENTO')
    ORDER BY v.id DESC
    LIMIT 1
  `;
  const viagemResult = await db.query(viagemQuery, [motoristaId]);

  if (viagemResult.rows.length === 0) {
    console.log('❌ Nenhuma viagem encontrada');
    throw new Error('NENHUMA_VIAGEM_ATIVA');
  }

  const viagemId = viagemResult.rows[0].id;
  console.log('✅ Viagem encontrada:', viagemId);

  // Buscar passageiros da viagem (usando viagens_passageiros, conforme solicitado)
const passageirosQuery = `
  SELECT DISTINCT p.usuario_id
  FROM passageiros_viagem pv
  INNER JOIN passageiros p ON pv.passageiro_id = p.id
  WHERE pv.viagem_id = $1
`;
  const passageirosResult = await db.query(passageirosQuery, [viagemId]);
  console.log('👥 Total de passageiros:', passageirosResult.rows.length);

  if (passageirosResult.rows.length === 0) {
    console.log('⚠️ Nenhum passageiro encontrado');
    return {
      success: true,
      message: 'Mensagem processada (sem passageiros cadastrados)',
      total_notificacoes: 0
    };
  }

  // Inserir notificações para cada passageiro
  const insertPromises = passageirosResult.rows.map(row =>
    db.query(
      `INSERT INTO notificacoes (usuario_id, titulo, mensagem, tipo, lida, criado_em)
       VALUES ($1, $2, $3, 'MENSAGEM_MOTORISTA', false, NOW())`,
      [row.usuario_id, titulo, corpo]
    )
  );
  await Promise.all(insertPromises);
  console.log('✅ Notificações inseridas');

  return {
    success: true,
    message: 'Mensagem enviada com sucesso',
    total_notificacoes: passageirosResult.rows.length
  };
};

/**
 * Exportação dos métodos do serviço
 */
module.exports = {
  getTodayTrip: DriverService.prototype.getTodayTrip,
  startTrip: DriverService.prototype.startTrip,
  endTrip: DriverService.prototype.endTrip,
  getHistory: DriverService.prototype.getHistory,
  sendMessage: DriverService.prototype.sendMessage, // ✅ CORRETO
  getPassengers: DriverService.prototype.getPassengers,
  getRoutePoints: DriverService.prototype.getRoutePoints,
  validateQRCode: DriverService.prototype.validateQRCode,
  announceNextPoint: DriverService.prototype.announceNextPoint
};
