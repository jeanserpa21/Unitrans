const db = require('../config/database');
const crypto = require('crypto');

class PassengerService {
  /**
   * Busca a viagem do dia para o passageiro
   */
  async getTodayTrip(passengerId) {
    const query = `
      SELECT 
        v.id as viagem_id,
        v.data,
        v.status as viagem_status,
        l.id as linha_id,
        l.nome as linha_nome,
        u.nome as motorista_nome,
        u.foto_url as motorista_foto,
        COUNT(pv.id) as total_passageiros,
        json_agg(
          json_build_object(
            'nome', u2.nome,
            'foto_url', u2.foto_url,
            'ponto', p.nome,
            'ponto_ordem', p.ordem,
            'status', pv.status
          ) ORDER BY p.ordem, u2.nome
        ) as passageiros
      FROM passageiros_viagem pv
      INNER JOIN viagens v ON pv.viagem_id = v.id
      INNER JOIN linhas l ON v.linha_id = l.id
      INNER JOIN motoristas m ON l.motorista_id = m.id
      INNER JOIN usuarios u ON m.usuario_id = u.id
      INNER JOIN passageiros p2 ON pv.passageiro_id = p2.id
      INNER JOIN usuarios u2 ON p2.usuario_id = u2.id
      LEFT JOIN pontos p ON pv.ponto_id = p.id
      WHERE v.data = CURRENT_DATE
        AND pv.passageiro_id = $1
        AND v.status != 'FINALIZADA'
      GROUP BY v.id, l.id, l.nome, u.nome, u.foto_url
    `;
    
    const result = await db.query(query, [passengerId]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return {
      viagem: {
        id: result.rows[0].viagem_id,
        data: result.rows[0].data,
        status: result.rows[0].viagem_status,
        linha: {
          id: result.rows[0].linha_id,
          nome: result.rows[0].linha_nome
        }
      },
      motorista: {
        nome: result.rows[0].motorista_nome,
        foto: result.rows[0].motorista_foto
      },
      passageiros: result.rows[0].passageiros,
      total_passageiros: parseInt(result.rows[0].total_passageiros)
    };
  }

  /**
   * Processa check-in ou check-out
   */
  async processCheckInOut(passengerId, viagemId) {
    // Verificar se passageiro está na viagem
    const checkQuery = `
      SELECT id, status, viagem_id
      FROM passageiros_viagem
      WHERE passageiro_id = $1 AND viagem_id = $2
    `;
    
    const checkResult = await db.query(checkQuery, [passengerId, viagemId]);
    
    if (checkResult.rows.length === 0) {
      throw new Error('PASSAGEIRO_NAO_VINCULADO');
    }
    
    const passageiroViagem = checkResult.rows[0];
    
    // Verificar status da viagem
    const viagemQuery = `
      SELECT status FROM viagens WHERE id = $1
    `;
    const viagemResult = await db.query(viagemQuery, [viagemId]);
    
    if (viagemResult.rows.length === 0) {
      throw new Error('VIAGEM_NAO_ENCONTRADA');
    }
    
    if (viagemResult.rows[0].status !== 'EM_ANDAMENTO') {
      throw new Error('VIAGEM_NAO_INICIADA');
    }
    
    let tipo, updateQuery;
    
    if (passageiroViagem.status === 'AGUARDANDO') {
      // CHECK-IN
      tipo = 'EMBARQUE';
      updateQuery = `
        UPDATE passageiros_viagem
        SET status = 'EMBARCADO', checkin_em = NOW()
        WHERE id = $1
        RETURNING checkin_em as timestamp
      `;
    } else if (passageiroViagem.status === 'EMBARCADO') {
      // CHECK-OUT
      tipo = 'DESEMBARQUE';
      updateQuery = `
        UPDATE passageiros_viagem
        SET status = 'DESEMBARCADO', checkout_em = NOW()
        WHERE id = $1
        RETURNING checkout_em as timestamp
      `;
    } else {
      throw new Error('JA_DESEMBARCADO');
    }
    
    const updateResult = await db.query(updateQuery, [passageiroViagem.id]);
    
    // Atualizar contadores da viagem
    if (tipo === 'EMBARQUE') {
      await db.query(
        'UPDATE viagens SET total_embarcados = total_embarcados + 1 WHERE id = $1',
        [viagemId]
      );
    } else {
      await db.query(
        'UPDATE viagens SET total_desembarcados = total_desembarcados + 1 WHERE id = $1',
        [viagemId]
      );
    }
    
    return {
      tipo,
      timestamp: updateResult.rows[0].timestamp
    };
  }

  /**
   * Solicitar carona para uma data futura
   */
  async requestRide(passengerId, data, observacao) {
    // Buscar linha do passageiro
    const linhaQuery = `
      SELECT l.id as linha_id
      FROM passageiros p
      INNER JOIN pontos pt ON p.ponto_padrao_id = pt.id
      INNER JOIN linhas l ON pt.linha_id = l.id
      WHERE p.id = $1
    `;
    const linhaResult = await db.query(linhaQuery, [passengerId]);
    
    if (linhaResult.rows.length === 0) {
      throw new Error('PASSAGEIRO_SEM_LINHA');
    }
    
    const linhaId = linhaResult.rows[0].linha_id;
    
    // Verificar se já existe solicitação para esta data
    const existingQuery = `
      SELECT id FROM solicitacoes_carona
      WHERE passageiro_id = $1 AND data = $2 
        AND status IN ('PENDENTE', 'APROVADA')
    `;
    const existing = await db.query(existingQuery, [passengerId, data]);
    
    if (existing.rows.length > 0) {
      throw new Error('SOLICITACAO_DUPLICADA');
    }
    
    // Criar solicitação
    const insertQuery = `
      INSERT INTO solicitacoes_carona 
        (passageiro_id, linha_id, data, observacao, status)
      VALUES ($1, $2, $3, $4, 'PENDENTE')
      RETURNING *
    `;
    const result = await db.query(insertQuery, [
      passengerId, 
      linhaId, 
      data, 
      observacao
    ]);
    
    return result.rows[0];
  }

  /**
   * Cancelar solicitação de carona
   */
  async cancelRideRequest(passengerId, solicitacaoId) {
    const query = `
      UPDATE solicitacoes_carona
      SET status = 'CANCELADA'
      WHERE id = $1 AND passageiro_id = $2 AND status = 'PENDENTE'
      RETURNING *
    `;
    
    const result = await db.query(query, [solicitacaoId, passengerId]);
    
    if (result.rows.length === 0) {
      throw new Error('SOLICITACAO_NAO_ENCONTRADA');
    }
    
    return result.rows[0];
  }

  /**
   * Listar mensagens do passageiro
   */
  async getMessages(passengerId) {
    // Buscar linha do passageiro
    const linhaQuery = `
      SELECT l.id as linha_id
      FROM passageiros p
      INNER JOIN pontos pt ON p.ponto_padrao_id = pt.id
      INNER JOIN linhas l ON pt.linha_id = l.id
      WHERE p.id = $1
    `;
    const linhaResult = await db.query(linhaQuery, [passengerId]);
    
    if (linhaResult.rows.length === 0) {
      return [];
    }
    
    const linhaId = linhaResult.rows[0].linha_id;
    
    // Buscar mensagens
    const query = `
      SELECT 
        m.id,
        m.origem,
        m.titulo,
        m.corpo,
        m.criado_em,
        u.nome as remetente_nome
      FROM mensagens m
      INNER JOIN usuarios u ON m.remetente_id = u.id
      WHERE m.linha_id = $1 OR m.linha_id IS NULL
      ORDER BY m.criado_em DESC
      LIMIT 50
    `;
    
    const result = await db.query(query, [linhaId]);
    return result.rows;
  }
}

module.exports = new PassengerService();