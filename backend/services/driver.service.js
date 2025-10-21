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
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return result.rows[0];
  }

  /**
   * Inicia a viagem do dia
   */
  async startTrip(motoristaId) {
    // Buscar viagem
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
    
    // Gerar token para QR Code (simulado)
    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    
    // Atualizar viagem
    const updateQuery = `
      UPDATE viagens
      SET status = 'EM_ANDAMENTO',
          iniciada_em = NOW(),
          token_qr_hash = $1
      WHERE id = $2
      RETURNING *
    `;
    const result = await db.query(updateQuery, [tokenHash, viagemId]);
    
    return {
      ...result.rows[0],
      token
    };
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
    
    if (result.rows.length === 0) {
      throw new Error('VIAGEM_NAO_ENCONTRADA');
    }
    
    // Marcar faltosos
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
   * Envia mensagem para passageiros
   */
  async sendMessage(motoristaId, { titulo, corpo }) {
    // Buscar linha do motorista
    const linhaQuery = `
      SELECT l.id as linha_id, m.usuario_id
      FROM motoristas m
      INNER JOIN linhas l ON l.motorista_id = m.id
      WHERE m.id = $1
    `;
    const linhaResult = await db.query(linhaQuery, [motoristaId]);
    
    if (linhaResult.rows.length === 0) {
      throw new Error('MOTORISTA_SEM_LINHA');
    }
    
    const { linha_id, usuario_id } = linhaResult.rows[0];
    
    // Buscar viagem do dia
    const viagemQuery = `
      SELECT id FROM viagens 
      WHERE linha_id = $1 AND data = CURRENT_DATE
    `;
    const viagemResult = await db.query(viagemQuery, [linha_id]);
    const viagemId = viagemResult.rows.length > 0 ? viagemResult.rows[0].id : null;
    
    // Inserir mensagem
    const insertQuery = `
      INSERT INTO mensagens (origem, remetente_id, linha_id, viagem_id, titulo, corpo)
      VALUES ('MOTORISTA', $1, $2, $3, $4, $5)
      RETURNING *
    `;
    
    const result = await db.query(insertQuery, [
      usuario_id,
      linha_id,
      viagemId,
      titulo,
      corpo
    ]);
    
    return result.rows[0];
  }
}

module.exports = new DriverService();