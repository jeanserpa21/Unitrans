const notificacaoService = require('../services/notificacao.service');

/**
 * Buscar notificações do usuário
 */
exports.getMinhasNotificacoes = async (req, res) => {
  try {
    const usuarioId = req.user.id;

    const notificacoes = await notificacaoService.getNotificacoesUsuario(usuarioId);

    res.json({ notificacoes });
  } catch (error) {
    console.error('Erro ao buscar notificações:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Marcar notificação como lida
 */
exports.marcarComoLida = async (req, res) => {
  try {
    const usuarioId = req.user.id;
    const { notificacaoId } = req.params;

    const result = await notificacaoService.marcarComoLida(notificacaoId, usuarioId);

    res.json(result);
  } catch (error) {
    console.error('Erro ao marcar como lida:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Marcar todas como lidas
 */
exports.marcarTodasComoLidas = async (req, res) => {
  try {
    const usuarioId = req.user.id;

    const result = await notificacaoService.marcarTodasComoLidas(usuarioId);

    res.json(result);
  } catch (error) {
    console.error('Erro ao marcar todas como lidas:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Contar não lidas
 */
exports.contarNaoLidas = async (req, res) => {
  try {
    const usuarioId = req.user.id;

    const total = await notificacaoService.contarNaoLidas(usuarioId);

    res.json({ total });
  } catch (error) {
    console.error('Erro ao contar não lidas:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Criar notificação (Admin)
 */
exports.criarNotificacao = async (req, res) => {
  try {
    const { usuarioId, titulo, mensagem, tipo } = req.body;

    if (!usuarioId || !titulo || !mensagem) {
      return res.status(400).json({ error: 'Campos obrigatórios: usuarioId, titulo, mensagem' });
    }

    const notificacao = await notificacaoService.criarNotificacao({ usuarioId, titulo, mensagem, tipo });

    res.json(notificacao);
  } catch (error) {
    console.error('Erro ao criar notificação:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Criar notificação para todos passageiros (Admin)
 */
exports.criarNotificacaoGeral = async (req, res) => {
  try {
    const { titulo, mensagem, tipo } = req.body;

    if (!titulo || !mensagem) {
      return res.status(400).json({ error: 'Campos obrigatórios: titulo, mensagem' });
    }

    // Buscar todos os passageiros
    const passageiros = await require('../config/database').query(
      'SELECT usuario_id FROM passageiros WHERE aprovado = true'
    );

    const usuariosIds = passageiros.rows.map(p => p.usuario_id);

    const result = await notificacaoService.criarNotificacaoEmMassa(usuariosIds, titulo, mensagem, tipo || 'GERAL');

    res.json(result);
  } catch (error) {
    console.error('Erro ao criar notificação geral:', error);
    res.status(500).json({ error: error.message });
  }
};