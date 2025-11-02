const express = require('express');
const router = express.Router();
const notificacaoController = require('../controllers/notificacao.controller');
const { authenticateToken, isAdmin } = require('../middlewares/auth');

// === ROTAS DO PASSAGEIRO ===
router.get('/minhas', authenticateToken, notificacaoController.getMinhasNotificacoes);
router.post('/:notificacaoId/ler', authenticateToken, notificacaoController.marcarComoLida);
router.post('/ler-todas', authenticateToken, notificacaoController.marcarTodasComoLidas);
router.get('/nao-lidas/count', authenticateToken, notificacaoController.contarNaoLidas);

// === ROTAS DO ADMIN/MOTORISTA ===
router.post('/', authenticateToken, notificacaoController.criarNotificacao);

module.exports = router;