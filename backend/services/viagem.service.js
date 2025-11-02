  const db = require('../config/database');
  const { v4: uuidv4 } = require('uuid');
  const crypto = require('crypto');

  class ViagemService {
    /**
     * Gerar token único para QR Code da viagem
     */
    generateViagemToken() {
      return crypto.randomBytes(32).toString('hex');
    }

    /**
     * Criar/buscar viagem do dia para uma linha
     */
    async getOrCreateViagemDoDia(linhaId, data) {
      const dataFormatada = data || new Date().toISOString().split('T')[0];

      // Verificar se já existe viagem para hoje
      let viagem = await db.query(
        'SELECT * FROM viagens WHERE linha_id = $1 AND data = $2',
        [linhaId, dataFormatada]
      );

      if (viagem.rows.length > 0) {
        return viagem.rows[0];
      }

      // Criar nova viagem
      const token = this.generateViagemToken();
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

      const result = await db.query(
        `INSERT INTO viagens (linha_id, data, status, token_qr_hash)
        VALUES ($1, $2, 'PLANEJADA', $3)
        RETURNING *`,
        [linhaId, dataFormatada, tokenHash]
      );

      const novaViagem = result.rows[0];

      // Retornar com token em texto claro (apenas na criação)
      return {
        ...novaViagem,
        token_qr: token
      };
    }

    /**
     * Passageiro solicita participar de uma viagem
     */
    async solicitarViagem(passageiroId, linhaId, data, pontoId) {
      const dataFormatada = data || new Date().toISOString().split('T')[0];

      // Buscar ou criar viagem
      const viagem = await this.getOrCreateViagemDoDia(linhaId, dataFormatada);

      // Verificar se já existe solicitação
      const jaExiste = await db.query(
        'SELECT * FROM passageiros_viagem WHERE viagem_id = $1 AND passageiro_id = $2',
        [viagem.id, passageiroId]
      );

      if (jaExiste.rows.length > 0) {
        return { message: 'Você já está inscrito nesta viagem', viagem: jaExiste.rows[0] };
      }

      // Criar registro
      const result = await db.query(
        `INSERT INTO passageiros_viagem (viagem_id, passageiro_id, ponto_id, status)
        VALUES ($1, $2, $3, 'AGUARDANDO')
        RETURNING *`,
        [viagem.id, passageiroId, pontoId]
      );

      // Atualizar total planejado
      await db.query(
        `UPDATE viagens 
        SET total_planejado = (SELECT COUNT(*) FROM passageiros_viagem WHERE viagem_id = $1)
        WHERE id = $1`,
        [viagem.id]
      );

      return { 
        message: 'Viagem solicitada com sucesso!',
        viagem: result.rows[0]
      };
    }

    /**
     * Validar token do QR Code
     */
    async validarTokenViagem(token) {
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

      const result = await db.query(
        `SELECT v.*, l.nome as linha_nome 
        FROM viagens v
        INNER JOIN linhas l ON v.linha_id = l.id
        WHERE v.token_qr_hash = $1 AND v.data = CURRENT_DATE AND v.status != 'FINALIZADA'`,
        [tokenHash]
      );

      if (result.rows.length === 0) {
        throw new Error('QR Code inválido ou viagem não encontrada');
      }

      return result.rows[0];
    }

    /**
     * Check-in: Passageiro embarca no ônibus
     */
    async checkIn(passageiroId, token, latitude, longitude) {
      // Validar token
      const viagem = await this.validarTokenViagem(token);

      // Buscar registro do passageiro nesta viagem
      const registro = await db.query(
        `SELECT pv.*, p.ponto_padrao_id, pt.latitude as ponto_lat, pt.longitude as ponto_lng, pt.raio_m
        FROM passageiros_viagem pv
        INNER JOIN passageiros p ON pv.passageiro_id = p.id
        LEFT JOIN pontos pt ON pv.ponto_id = pt.id
        WHERE pv.viagem_id = $1 AND pv.passageiro_id = $2`,
        [viagem.id, passageiroId]
      );

      if (registro.rows.length === 0) {
        throw new Error('Você não está inscrito nesta viagem');
      }

      const passageiroViagem = registro.rows[0];

      if (passageiroViagem.status === 'EMBARCADO') {
        throw new Error('Você já fez check-in nesta viagem');
      }

      /*// Validar localização (opcional - verificar se está perto do ponto)
      if (latitude && longitude && passageiroViagem.ponto_lat && passageiroViagem.ponto_lng) {
        const distancia = this.calcularDistancia(
          latitude, longitude,
          passageiroViagem.ponto_lat, passageiroViagem.ponto_lng
        );

        const raioPermitido = passageiroViagem.raio_m || 100; // 100m padrão

        if (distancia > raioPermitido) {
          throw new Error(`Você está muito longe do ponto (${Math.round(distancia)}m). Aproxime-se para fazer check-in.`);
        }
      }
*/
      // Registrar check-in
      await db.query(
        `UPDATE passageiros_viagem 
        SET status = 'EMBARCADO', checkin_em = NOW()
        WHERE id = $1`,
        [passageiroViagem.id]
      );

      // Atualizar contador da viagem
      await db.query(
        `UPDATE viagens 
        SET total_embarcados = (SELECT COUNT(*) FROM passageiros_viagem WHERE viagem_id = $1 AND status = 'EMBARCADO')
        WHERE id = $1`,
        [viagem.id]
      );

      // Atualizar status da viagem se necessário
      if (viagem.status === 'PLANEJADA') {
        await db.query(
          `UPDATE viagens SET status = 'EM_ANDAMENTO', iniciada_em = NOW() WHERE id = $1`,
          [viagem.id]
        );
      }

      return { 
        message: 'Check-in realizado com sucesso!',
        viagem: viagem.linha_nome,
        horario: new Date()
      };
    }

    /**
     * Check-out: Passageiro desembarca
     */
    async checkOut(passageiroId, token) {
      // Validar token
      const viagem = await this.validarTokenViagem(token);

      // Buscar registro do passageiro
      const registro = await db.query(
        `SELECT * FROM passageiros_viagem 
        WHERE viagem_id = $1 AND passageiro_id = $2`,
        [viagem.id, passageiroId]
      );

      if (registro.rows.length === 0) {
        throw new Error('Você não está inscrito nesta viagem');
      }

      const passageiroViagem = registro.rows[0];

      if (passageiroViagem.status !== 'EMBARCADO') {
        throw new Error('Você precisa fazer check-in primeiro');
      }

      if (passageiroViagem.status === 'DESEMBARCADO') {
        throw new Error('Você já fez check-out nesta viagem');
      }

      // Registrar check-out
      await db.query(
        `UPDATE passageiros_viagem 
        SET status = 'DESEMBARCADO', checkout_em = NOW()
        WHERE id = $1`,
        [passageiroViagem.id]
      );

      // Atualizar contador da viagem
      await db.query(
        `UPDATE viagens 
        SET total_desembarcados = (SELECT COUNT(*) FROM passageiros_viagem WHERE viagem_id = $1 AND status = 'DESEMBARCADO')
        WHERE id = $1`,
        [viagem.id]
      );

      return { 
        message: 'Check-out realizado com sucesso!',
        viagem: viagem.linha_nome,
        horario: new Date()
      };
    }

    /**
     * Calcular distância entre dois pontos (em metros)
     * Usando fórmula de Haversine
     */
    calcularDistancia(lat1, lon1, lat2, lon2) {
      const R = 6371e3; // Raio da Terra em metros
      const φ1 = lat1 * Math.PI / 180;
      const φ2 = lat2 * Math.PI / 180;
      const Δφ = (lat2 - lat1) * Math.PI / 180;
      const Δλ = (lon2 - lon1) * Math.PI / 180;

      const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
                Math.cos(φ1) * Math.cos(φ2) *
                Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

      return R * c; // Distância em metros
    }

    /**
     * Listar passageiros de uma viagem
     */
    async getPassageirosViagem(viagemId) {
      const result = await db.query(
        `SELECT 
          pv.id,
          pv.status,
          pv.checkin_em,
          pv.checkout_em,
          u.nome as passageiro_nome,
          u.foto_url,
          pt.nome as ponto_nome
        FROM passageiros_viagem pv
        INNER JOIN passageiros p ON pv.passageiro_id = p.id
        INNER JOIN usuarios u ON p.usuario_id = u.id
        LEFT JOIN pontos pt ON pv.ponto_id = pt.id
        WHERE pv.viagem_id = $1
        ORDER BY pt.ordem, u.nome`,
        [viagemId]
      );

      return result.rows;
    }
  }

  module.exports = new ViagemService();