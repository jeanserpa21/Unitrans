const adminViagemService = require('../services/admin-viagem.service');

/**
 * Listar viagens
 */
exports.listarViagens = async (req, res) => {
  try {
    const filtros = {
      dataInicio: req.query.dataInicio,
      dataFim: req.query.dataFim,
      linhaId: req.query.linhaId,
      status: req.query.status
    };

    const viagens = await adminViagemService.listarViagens(filtros);

    res.json({ viagens });
  } catch (error) {
    console.error('Erro ao listar viagens:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Criar viagem
 */
exports.criarViagem = async (req, res) => {
  try {
    const { linhaId, data, passageirosIds } = req.body;

    if (!linhaId || !data) {
      return res.status(400).json({ error: 'Linha e data são obrigatórios' });
    }

    const viagem = await adminViagemService.criarViagem({ linhaId, data, passageirosIds });

    res.json({
      message: 'Viagem criada com sucesso',
      viagem
    });
  } catch (error) {
    console.error('Erro ao criar viagem:', error);
    res.status(400).json({ error: error.message });
  }
};

/**
 * Buscar passageiros disponíveis
 */
exports.buscarPassageirosDisponiveis = async (req, res) => {
  try {
    const { linhaId } = req.params;

    const passageiros = await adminViagemService.buscarPassageirosDisponiveis(linhaId);

    res.json({ passageiros });
  } catch (error) {
    console.error('Erro ao buscar passageiros:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Ver detalhes da viagem
 */
exports.verDetalhes = async (req, res) => {
  try {
    const { viagemId } = req.params;

    const dados = await adminViagemService.verDetalhes(viagemId);

    res.json(dados);
  } catch (error) {
    console.error('Erro ao buscar detalhes:', error);
    res.status(404).json({ error: error.message });
  }
};

/**
 * Deletar viagem
 */
exports.deletarViagem = async (req, res) => {
  try {
    const { viagemId } = req.params;

    const result = await adminViagemService.deletarViagem(viagemId);

    res.json(result);
  } catch (error) {
    console.error('Erro ao deletar viagem:', error);
    res.status(400).json({ error: error.message });
  }
};
/**
 * Gerar QR Code para viagem
 */
exports.gerarQRCode = async (req, res) => {
  try {
    const { linhaId, data } = req.body;

    if (!linhaId || !data) {
      return res.status(400).json({ error: 'Linha e data são obrigatórios' });
    }

    const QRCode = require('qrcode');
    const crypto = require('crypto');
    const db = require('../config/database');
    
    // Buscar ou criar viagem
    let viagem = await db.query(
      'SELECT * FROM viagens WHERE linha_id = $1 AND data = $2',
      [linhaId, data]
    );

    let viagemId;
    let token;

    if (viagem.rows.length === 0) {
      // Criar nova viagem
      token = crypto.randomBytes(16).toString('hex');
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

      const result = await db.query(
        `INSERT INTO viagens (linha_id, data, status, token_qr_hash)
         VALUES ($1, $2, 'PLANEJADA', $3)
         RETURNING *`,
        [linhaId, data, tokenHash]
      );

      viagemId = result.rows[0].id;
    } else {
      // Usar viagem existente e gerar novo token
      viagemId = viagem.rows[0].id;
      token = crypto.randomBytes(16).toString('hex');
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

      await db.query(
        'UPDATE viagens SET token_qr_hash = $1 WHERE id = $2',
        [tokenHash, viagemId]
      );
    }

    // Gerar QR Code em base64
    const qrcodeDataURL = await QRCode.toDataURL(token, {
      width: 400,
      margin: 2,
      color: {
        dark: '#166534',
        light: '#FFFFFF'
      }
    });

    res.json({
      message: 'QR Code gerado com sucesso',
      viagem_id: viagemId,
      qrcode: qrcodeDataURL,
      token: token // Para debug
    });
  } catch (error) {
    console.error('Erro ao gerar QR Code:', error);
    res.status(500).json({ error: error.message });
  }
};