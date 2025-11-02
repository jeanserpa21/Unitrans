const db = require('../config/database');

class NotificacaoService {
  /**
   * Buscar notificações de um usuário
   */
  async getNotificacoesUsuario(usuarioId) {
    const query = `
      SELECT 
        id,
        titulo,
        mensagem,
        tipo,
        lida,
        criado_em
      FROM notificacoes
      WHERE usuario_id = $1
      ORDER BY criado_em DESC
      LIMIT 50
    `;

    const result = await db.query(query, [usuarioId]);
    return result.rows;
  }

  /**
   * Marcar notificação como lida
   */
  async marcarComoLida(notificacaoId, usuarioId) {
    await db.query(
      `UPDATE notificacoes 
       SET lida = true 
       WHERE id = $1 AND usuario_id = $2`,
      [notificacaoId, usuarioId]
    );

    return { message: 'Notificação marcada como lida' };
  }

  /**
   * Marcar todas como lidas
   */
  async marcarTodasComoLidas(usuarioId) {
    const result = await db.query(
      `UPDATE notificacoes 
       SET lida = true 
       WHERE usuario_id = $1 AND lida = false
       RETURNING id`,
      [usuarioId]
    );

    return { message: `${result.rowCount} notificações marcadas como lidas` };
  }

  /**
   * Contar notificações não lidas
   */
  async contarNaoLidas(usuarioId) {
    const query = `
      SELECT COUNT(*) as total
      FROM notificacoes
      WHERE usuario_id = $1 AND lida = false
    `;

    const result = await db.query(query, [usuarioId]);
    return parseInt(result.rows[0].total);
  }

  /**
   * Criar notificação
   */
  async criarNotificacao(dados) {
    const { usuarioId, titulo, mensagem, tipo } = dados;

    const result = await db.query(
      `INSERT INTO notificacoes (usuario_id, titulo, mensagem, tipo)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [usuarioId, titulo, mensagem, tipo || 'GERAL']
    );

    return result.rows[0];
  }

  /**
   * Criar notificação para vários usuários
   */
  async criarNotificacaoEmMassa(usuariosIds, titulo, mensagem, tipo) {
    const values = usuariosIds.map((id, index) => 
      `($${index * 3 + 1}, $${index * 3 + 2}, $${index * 3 + 3})`
    ).join(',');

    const params = usuariosIds.flatMap(id => [id, titulo, mensagem]);

    await db.query(
      `INSERT INTO notificacoes (usuario_id, titulo, mensagem, tipo)
       VALUES ${values}`,
      params
    );

    return { message: `${usuariosIds.length} notificações criadas` };
  }
}

module.exports = new NotificacaoService();