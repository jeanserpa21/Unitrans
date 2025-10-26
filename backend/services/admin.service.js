const db = require('../config/database');

class AdminService {
  /**
   * Dashboard - visão geral do sistema
   */
  async getDashboard(data) {
    const dataConsulta = data || new Date().toISOString().split('T')[0];
    
    // Estatísticas gerais
    const statsQuery = `
      SELECT 
        (SELECT COUNT(*) FROM linhas WHERE ativo = true) as total_linhas,
        (SELECT COUNT(*) FROM motoristas WHERE ativo = true) as total_motoristas,
        (SELECT COUNT(*) FROM passageiros WHERE aprovado = true) as passageiros_ativos,
        (SELECT COUNT(*) FROM passageiros WHERE aprovado = false) as passageiros_pendentes,
        (SELECT COUNT(*) FROM universidades WHERE ativo = true) as total_universidades,
        (SELECT COUNT(*) FROM veiculos WHERE ativo = true) as total_veiculos
    `;
    
    const stats = await db.query(statsQuery);
    
    // Viagens do dia
    const viagensQuery = `
      SELECT 
        l.id,
        l.nome,
        v.status as viagem_status,
        v.total_planejado,
        v.total_embarcados,
        v.total_desembarcados,
        u.nome as motorista_nome,
        ve.placa as veiculo_placa
      FROM linhas l
      LEFT JOIN viagens v ON l.id = v.linha_id AND v.data = $1
      LEFT JOIN motoristas m ON l.motorista_id = m.id
      LEFT JOIN usuarios u ON m.usuario_id = u.id
      LEFT JOIN veiculos ve ON l.veiculo_id = ve.id
      WHERE l.ativo = true
      ORDER BY l.nome
    `;
    
    const viagens = await db.query(viagensQuery, [dataConsulta]);
    
    return {
      estatisticas: stats.rows[0],
      linhas: viagens.rows,
      data: dataConsulta
    };
  }

  /**
   * Listar passageiros
   */
  async getPassengers({ aprovado, page = 1, limit = 20 } = {}) {
    const offset = (page - 1) * limit;
    let whereClause = '1=1';
    const params = [];
    
    if (aprovado !== undefined) {
      whereClause = 'p.aprovado = $1';
      params.push(aprovado === 'true' || aprovado === true);
    }
    
    const query = `
      SELECT 
        p.id,
        u.nome,
        u.email,
        u.foto_url,
        un.nome as universidade,
        pt.nome as ponto_padrao,
        l.nome as linha,
        p.aprovado,
        p.status,
        p.criado_em,
        EXTRACT(DAY FROM NOW() - p.criado_em) as dias_aguardando
      FROM passageiros p
      INNER JOIN usuarios u ON p.usuario_id = u.id
      LEFT JOIN universidades un ON p.universidade_id = un.id
      LEFT JOIN pontos pt ON p.ponto_padrao_id = pt.id
      LEFT JOIN linhas l ON pt.linha_id = l.id
      WHERE ${whereClause}
      ORDER BY p.criado_em DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;
    
    params.push(limit, offset);
    
    const result = await db.query(query, params);
    
    // Total
    const countQuery = `SELECT COUNT(*) FROM passageiros p WHERE ${whereClause}`;
    const countParams = params.slice(0, whereClause === '1=1' ? 0 : 1);
    const countResult = await db.query(countQuery, countParams);
    
    return {
      passageiros: result.rows,
      total: parseInt(countResult.rows[0].count),
      pagina: page,
      total_paginas: Math.ceil(countResult.rows[0].count / limit)
    };
  }

  /**
   * Aprovar passageiro
   */
  async approvePassenger(passageiroId, adminId) {
    const query = `
      UPDATE passageiros
      SET aprovado = true,
          aprovado_em = NOW(),
          aprovado_por = $2
      WHERE id = $1
      RETURNING *
    `;
    
    const result = await db.query(query, [passageiroId, adminId]);
    
    if (result.rows.length === 0) {
      throw new Error('PASSAGEIRO_NAO_ENCONTRADO');
    }
    
    return result.rows[0];
  }

  /**
   * Recusar passageiro
   */
  async rejectPassenger(passageiroId) {
    const query = `
      DELETE FROM passageiros WHERE id = $1 RETURNING id
    `;
    
    const result = await db.query(query, [passageiroId]);
    
    if (result.rows.length === 0) {
      throw new Error('PASSAGEIRO_NAO_ENCONTRADO');
    }
    
    return { message: 'Passageiro recusado e removido do sistema' };
  }

  /**
   * Listar motoristas
   */
  async getDrivers() {
    const query = `
      SELECT 
        m.id,
        u.nome,
        u.email,
        u.foto_url,
        m.cnh,
        m.ativo,
        l.nome as linha_atual,
        m.criado_em
      FROM motoristas m
      INNER JOIN usuarios u ON m.usuario_id = u.id
      LEFT JOIN linhas l ON l.motorista_id = m.id
      ORDER BY u.nome
    `;
    
    const result = await db.query(query);
    return result.rows;
  }

  /**
   * Criar motorista
   */
  async createDriver({ nome, email, senha, cnh }) {
    const bcrypt = require('bcrypt');
    const senhaHash = await bcrypt.hash(senha, 10);
    
    const client = await db.getClient();
    
    try {
      await client.query('BEGIN');
      
      // Verificar se email já existe
      const emailCheck = await client.query(
        'SELECT id FROM usuarios WHERE email = $1',
        [email]
      );
      
      if (emailCheck.rows.length > 0) {
        throw new Error('EMAIL_JA_EXISTE');
      }
      
      // Criar usuário
      const userQuery = `
        INSERT INTO usuarios (nome, email, senha_hash, papel, ativo)
        VALUES ($1, $2, $3, 'MOTORISTA', true)
        RETURNING id
      `;
      const userResult = await client.query(userQuery, [nome, email, senhaHash]);
      const userId = userResult.rows[0].id;
      
      // Criar motorista
      const driverQuery = `
        INSERT INTO motoristas (usuario_id, cnh, ativo)
        VALUES ($1, $2, true)
        RETURNING *
      `;
      const driverResult = await client.query(driverQuery, [userId, cnh]);
      
      await client.query('COMMIT');
      
      return driverResult.rows[0];
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Atualizar motorista
   */
  async updateDriver(motoristaId, { nome, email, cnh, ativo }) {
    const updates = [];
    const params = [];
    let paramIndex = 1;
    
    if (nome) {
      updates.push(`nome = $${paramIndex++}`);
      params.push(nome);
    }
    
    if (email) {
      updates.push(`email = $${paramIndex++}`);
      params.push(email);
    }
    
    if (updates.length > 0) {
      const userQuery = `
        UPDATE usuarios u
        SET ${updates.join(', ')}
        FROM motoristas m
        WHERE u.id = m.usuario_id AND m.id = $${paramIndex}
        RETURNING u.*
      `;
      params.push(motoristaId);
      await db.query(userQuery, params);
    }
    
    // Atualizar dados do motorista
    const driverUpdates = [];
    const driverParams = [];
    let driverParamIndex = 1;
    
    if (cnh) {
      driverUpdates.push(`cnh = $${driverParamIndex++}`);
      driverParams.push(cnh);
    }
    
    if (ativo !== undefined) {
      driverUpdates.push(`ativo = $${driverParamIndex++}`);
      driverParams.push(ativo);
    }
    
    if (driverUpdates.length > 0) {
      const driverQuery = `
        UPDATE motoristas
        SET ${driverUpdates.join(', ')}
        WHERE id = $${driverParamIndex}
        RETURNING *
      `;
      driverParams.push(motoristaId);
      const result = await db.query(driverQuery, driverParams);
      return result.rows[0];
    }
    
    return { message: 'Motorista atualizado' };
  }

  /**
   * Listar linhas
   */
  async getLines() {
    const query = `
      SELECT 
        l.id,
        l.nome,
        l.ativo,
        un.nome as universidade,
        ve.placa as veiculo,
        u.nome as motorista,
        l.criado_em,
        (SELECT COUNT(*) FROM pontos WHERE linha_id = l.id) as total_pontos
      FROM linhas l
      LEFT JOIN universidades un ON l.universidade_id = un.id
      LEFT JOIN veiculos ve ON l.veiculo_id = ve.id
      LEFT JOIN motoristas m ON l.motorista_id = m.id
      LEFT JOIN usuarios u ON m.usuario_id = u.id
      ORDER BY l.nome
    `;
    
    const result = await db.query(query);
    return result.rows;
  }

  /**
   * Criar linha
   */
  async createLine({ nome, universidade_id, veiculo_id, motorista_id }) {
    const query = `
      INSERT INTO linhas (nome, universidade_id, veiculo_id, motorista_id, ativo)
      VALUES ($1, $2, $3, $4, true)
      RETURNING *
    `;
    
    const result = await db.query(query, [nome, universidade_id, veiculo_id, motorista_id]);
    return result.rows[0];
  }

  /**
   * Atualizar linha
   */
  async updateLine(linhaId, { nome, universidade_id, veiculo_id, motorista_id, ativo }) {
    const updates = [];
    const params = [];
    let paramIndex = 1;
    
    if (nome) {
      updates.push(`nome = $${paramIndex++}`);
      params.push(nome);
    }
    
    if (universidade_id) {
      updates.push(`universidade_id = $${paramIndex++}`);
      params.push(universidade_id);
    }
    
    if (veiculo_id) {
      updates.push(`veiculo_id = $${paramIndex++}`);
      params.push(veiculo_id);
    }
    
    if (motorista_id !== undefined) {
      updates.push(`motorista_id = $${paramIndex++}`);
      params.push(motorista_id);
    }
    
    if (ativo !== undefined) {
      updates.push(`ativo = $${paramIndex++}`);
      params.push(ativo);
    }
    
    if (updates.length === 0) {
      throw new Error('NENHUM_CAMPO_PARA_ATUALIZAR');
    }
    
    const query = `
      UPDATE linhas
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;
    
    params.push(linhaId);
    const result = await db.query(query, params);
    
    if (result.rows.length === 0) {
      throw new Error('LINHA_NAO_ENCONTRADA');
    }
    
    return result.rows[0];
  }

  /**
   * Atribuir motorista a linha
   */
  async assignDriver(linhaId, motoristaId) {
    const query = `
      UPDATE linhas
      SET motorista_id = $2
      WHERE id = $1
      RETURNING *
    `;
    
    const result = await db.query(query, [linhaId, motoristaId]);
    
    if (result.rows.length === 0) {
      throw new Error('LINHA_NAO_ENCONTRADA');
    }
    
    return result.rows[0];
  }

  /**
   * Listar pontos de uma linha
   */
  async getPoints(linhaId) {
    const query = `
      SELECT 
        id,
        nome,
        latitude,
        longitude,
        ordem,
        raio_m,
        ativo
      FROM pontos
      WHERE linha_id = $1
      ORDER BY ordem
    `;
    
    const result = await db.query(query, [linhaId]);
    return result.rows;
  }

  /**
   * Criar ponto
   */
  async createPoint(linhaId, { nome, latitude, longitude, ordem, raio_m }) {
    const query = `
      INSERT INTO pontos (linha_id, nome, latitude, longitude, ordem, raio_m, ativo)
      VALUES ($1, $2, $3, $4, $5, $6, true)
      RETURNING *
    `;
    
    const result = await db.query(query, [
      linhaId,
      nome,
      latitude,
      longitude,
      ordem,
      raio_m || 100
    ]);
    
    return result.rows[0];
  }

  /**
   * Atualizar ponto
   */
  async updatePoint(pontoId, { nome, latitude, longitude, ordem, raio_m, ativo }) {
    const updates = [];
    const params = [];
    let paramIndex = 1;
    
    if (nome) {
      updates.push(`nome = $${paramIndex++}`);
      params.push(nome);
    }
    
    if (latitude !== undefined) {
      updates.push(`latitude = $${paramIndex++}`);
      params.push(latitude);
    }
    
    if (longitude !== undefined) {
      updates.push(`longitude = $${paramIndex++}`);
      params.push(longitude);
    }
    
    if (ordem !== undefined) {
      updates.push(`ordem = $${paramIndex++}`);
      params.push(ordem);
    }
    
    if (raio_m !== undefined) {
      updates.push(`raio_m = $${paramIndex++}`);
      params.push(raio_m);
    }
    
    if (ativo !== undefined) {
      updates.push(`ativo = $${paramIndex++}`);
      params.push(ativo);
    }
    
    if (updates.length === 0) {
      throw new Error('NENHUM_CAMPO_PARA_ATUALIZAR');
    }
    
    const query = `
      UPDATE pontos
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;
    
    params.push(pontoId);
    const result = await db.query(query, params);
    
    if (result.rows.length === 0) {
      throw new Error('PONTO_NAO_ENCONTRADO');
    }
    
    return result.rows[0];
  }

  /**
   * Deletar ponto
   */
  async deletePoint(pontoId) {
    const query = `DELETE FROM pontos WHERE id = $1 RETURNING id`;
    const result = await db.query(query, [pontoId]);
    
    if (result.rows.length === 0) {
      throw new Error('PONTO_NAO_ENCONTRADO');
    }
    
    return { message: 'Ponto removido com sucesso' };
  }

  /**
   * Relatório de faltas
   */
  async getAbsenceReport({ dataInicio, dataFim, linhaId }) {
    let whereClause = 'v.data BETWEEN $1 AND $2';
    const params = [dataInicio, dataFim];
    
    if (linhaId) {
      whereClause += ' AND l.id = $3';
      params.push(linhaId);
    }
    
    const query = `
      SELECT 
        l.nome as linha,
        v.data,
        u.nome as passageiro,
        pv.status,
        p.nome as ponto
      FROM passageiros_viagem pv
      INNER JOIN viagens v ON pv.viagem_id = v.id
      INNER JOIN linhas l ON v.linha_id = l.id
      INNER JOIN passageiros pas ON pv.passageiro_id = pas.id
      INNER JOIN usuarios u ON pas.usuario_id = u.id
      LEFT JOIN pontos p ON pv.ponto_id = p.id
      WHERE ${whereClause}
        AND pv.status IN ('AGUARDANDO', 'FALTOU')
      ORDER BY v.data DESC, l.nome, u.nome
    `;
    
    const result = await db.query(query, params);
    return result.rows;
  }

  /**
   * Relatório de taxa de presença
   */
  async getAttendanceReport({ dataInicio, dataFim, linhaId }) {
    let whereClause = 'v.data BETWEEN $1 AND $2';
    const params = [dataInicio, dataFim];
    
    if (linhaId) {
      whereClause += ' AND l.id = $3';
      params.push(linhaId);
    }
    
    const query = `
      SELECT 
        l.nome as linha,
        COUNT(pv.id) as total_esperado,
        COUNT(CASE WHEN pv.status IN ('EMBARCADO', 'DESEMBARCADO') THEN 1 END) as total_presente,
        ROUND(
          (COUNT(CASE WHEN pv.status IN ('EMBARCADO', 'DESEMBARCADO') THEN 1 END)::NUMERIC 
          / NULLIF(COUNT(pv.id), 0) * 100), 2
        ) as taxa_presenca
      FROM passageiros_viagem pv
      INNER JOIN viagens v ON pv.viagem_id = v.id
      INNER JOIN linhas l ON v.linha_id = l.id
      WHERE ${whereClause}
      GROUP BY l.nome
      ORDER BY taxa_presenca DESC
    `;
    
    const result = await db.query(query, params);
    return result.rows;
  }

  /**
   * Buscar passageiros de uma linha específica
   */
  async getLinePassengers(linhaId) {
    const query = `
      SELECT 
        p.id,
        u.nome,
        u.email,
        p.curso,
        p.status,
        pt.nome as ponto_nome,
        uni.nome as universidade,
        p.dias_transporte
      FROM passageiros p
      INNER JOIN usuarios u ON p.usuario_id = u.id
      INNER JOIN pontos pt ON p.ponto_padrao_id = pt.id
      INNER JOIN linhas l ON pt.linha_id = l.id
      LEFT JOIN universidades uni ON p.universidade_id = uni.id
      WHERE l.id = $1 AND p.status = 'APROVADO'
      ORDER BY pt.ordem, u.nome
    `;
    
    const result = await db.query(query, [linhaId]);
    return { passageiros: result.rows };
  }

  /**
   * Atualizar configurações da linha (horários)
   */
  async updateLineConfig(linhaId, { horario_inicio, horario_fim }) {
    const query = `
      UPDATE linhas
      SET horario_inicio = $2, horario_fim = $3
      WHERE id = $1
      RETURNING *
    `;
    
    const result = await db.query(query, [linhaId, horario_inicio, horario_fim]);
    if (result.rows.length === 0) throw new Error('LINHA_NAO_ENCONTRADA');
    return result.rows[0];
  }
}

module.exports = new AdminService();
