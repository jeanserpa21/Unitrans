const db = require('../config/database');
const crypto = require('crypto');

class AdminViagemService {
  /**
   * Listar todas as viagens (com filtros)
   */
  async listarViagens(filtros = {}) {
    const { dataInicio, dataFim, linhaId, status } = filtros;

    let query = `
      SELECT 
        v.id,
        v.data,
        v.status,
        v.total_planejado,
        v.total_embarcados,
        v.total_desembarcados,
        v.iniciada_em,
        v.finalizada_em,
        l.nome as linha_nome,
        l.id as linha_id,
        u.nome as motorista_nome
      FROM viagens v
      INNER JOIN linhas l ON v.linha_id = l.id
      LEFT JOIN motoristas m ON l.motorista_id = m.id
      LEFT JOIN usuarios u ON m.usuario_id = u.id
      WHERE 1=1
    `;

    const params = [];
    let paramIndex = 1;

    if (dataInicio) {
      query += ` AND v.data >= $${paramIndex}`;
      params.push(dataInicio);
      paramIndex++;
    }

    if (dataFim) {
      query += ` AND v.data <= $${paramIndex}`;
      params.push(dataFim);
      paramIndex++;
    }

    if (linhaId) {
      query += ` AND v.linha_id = $${paramIndex}`;
      params.push(linhaId);
      paramIndex++;
    }

    if (status) {
      query += ` AND v.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    query += ` ORDER BY v.data DESC, v.id DESC`;

    const result = await db.query(query, params);
    return result.rows;
  }

  /**
   * Criar nova viagem
   */
  async criarViagem(dados) {
    const { linhaId, data, passageirosIds } = dados;

    // Verificar se já existe viagem para essa linha nessa data
    const existente = await db.query(
      'SELECT id FROM viagens WHERE linha_id = $1 AND data = $2',
      [linhaId, data]
    );

    if (existente.rows.length > 0) {
      throw new Error('Já existe uma viagem para essa linha nesta data');
    }

    // Gerar token
    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Criar viagem
    const viagemResult = await db.query(
      `INSERT INTO viagens (linha_id, data, status, token_qr_hash)
       VALUES ($1, $2, 'PLANEJADA', $3)
       RETURNING *`,
      [linhaId, data, tokenHash]
    );

    const viagem = viagemResult.rows[0];

    // Adicionar passageiros (se fornecidos)
    if (passageirosIds && passageirosIds.length > 0) {
      for (const passageiroId of passageirosIds) {
        // Buscar ponto padrão do passageiro
        const pontoResult = await db.query(
          'SELECT ponto_padrao_id FROM passageiros WHERE id = $1',
          [passageiroId]
        );

        const pontoId = pontoResult.rows[0]?.ponto_padrao_id;

        await db.query(
          `INSERT INTO passageiros_viagem (viagem_id, passageiro_id, ponto_id, status)
           VALUES ($1, $2, $3, 'AGUARDANDO')
           ON CONFLICT DO NOTHING`,
          [viagem.id, passageiroId, pontoId]
        );
      }

      // Atualizar total planejado
      await db.query(
        `UPDATE viagens 
         SET total_planejado = (SELECT COUNT(*) FROM passageiros_viagem WHERE viagem_id = $1)
         WHERE id = $1`,
        [viagem.id]
      );
    }

    return { ...viagem, token };
  }

  /**
   * Buscar passageiros disponíveis para uma linha
   */
  async buscarPassageirosDisponiveis(linhaId) {
    const query = `
      SELECT 
        p.id,
        u.nome,
        u.email,
        pt.nome as ponto_nome
      FROM passageiros p
      INNER JOIN usuarios u ON p.usuario_id = u.id
      LEFT JOIN pontos pt ON p.ponto_padrao_id = pt.id
      WHERE p.aprovado = true
        AND pt.linha_id = $1
      ORDER BY u.nome
    `;

    const result = await db.query(query, [linhaId]);
    return result.rows;
  }

  /**
   * Deletar viagem (apenas se PLANEJADA)
   */
  async deletarViagem(viagemId) {
    // Verificar status
    const viagem = await db.query(
      'SELECT status FROM viagens WHERE id = $1',
      [viagemId]
    );

    if (viagem.rows.length === 0) {
      throw new Error('Viagem não encontrada');
    }

    if (viagem.rows[0].status !== 'PLANEJADA') {
      throw new Error('Apenas viagens planejadas podem ser deletadas');
    }

    // Deletar passageiros da viagem
    await db.query('DELETE FROM passageiros_viagem WHERE viagem_id = $1', [viagemId]);

    // Deletar viagem
    await db.query('DELETE FROM viagens WHERE id = $1', [viagemId]);

    return { message: 'Viagem deletada com sucesso' };
  }

  /**
   * Ver detalhes de uma viagem
   */
  async verDetalhes(viagemId) {
    const viagemQuery = `
      SELECT 
        v.*,
        l.nome as linha_nome,
        u.nome as motorista_nome
      FROM viagens v
      INNER JOIN linhas l ON v.linha_id = l.id
      LEFT JOIN motoristas m ON l.motorista_id = m.id
      LEFT JOIN usuarios u ON m.usuario_id = u.id
      WHERE v.id = $1
    `;

    const passageirosQuery = `
      SELECT 
        pv.id,
        pv.status,
        pv.checkin_em,
        pv.checkout_em,
        u.nome as passageiro_nome,
        u.email,
        pt.nome as ponto_nome
      FROM passageiros_viagem pv
      INNER JOIN passageiros p ON pv.passageiro_id = p.id
      INNER JOIN usuarios u ON p.usuario_id = u.id
      LEFT JOIN pontos pt ON pv.ponto_id = pt.id
      WHERE pv.viagem_id = $1
      ORDER BY pt.ordem, u.nome
    `;

    const [viagemResult, passageirosResult] = await Promise.all([
      db.query(viagemQuery, [viagemId]),
      db.query(passageirosQuery, [viagemId])
    ]);

    if (viagemResult.rows.length === 0) {
      throw new Error('Viagem não encontrada');
    }

    return {
      viagem: viagemResult.rows[0],
      passageiros: passageirosResult.rows
    };
  }
}

module.exports = new AdminViagemService();