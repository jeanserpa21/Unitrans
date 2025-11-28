const express = require('express');
const router = express.Router();
const viagemController = require('../controllers/viagem.controller');
const { authenticateToken } = require('../middlewares/auth');

// === ROTAS PÚBLICAS/ADMIN ===
router.post('/gerar-qrcode', viagemController.gerarQRCodeViagem);
router.get('/:viagemId/passageiros', authenticateToken, viagemController.getPassageirosViagem);

// === ROTAS DO PASSAGEIRO ===
router.post('/solicitar', authenticateToken, viagemController.solicitarViagem);
router.post('/checkin', authenticateToken, viagemController.checkIn);
router.post('/checkout', authenticateToken, viagemController.checkOut);
router.get('/minhas', authenticateToken, viagemController.getMinhasViagens);

module.exports = router;