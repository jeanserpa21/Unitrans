const router = require('express').Router();
const driverController = require('../controllers/driver.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

// Todas as rotas requerem autenticação de MOTORISTA
router.use(authenticate);
router.use(authorize(['MOTORISTA']));

// ✅ ROTAS ORIGINAIS
router.get('/viagem-hoje', driverController.getTodayTrip);
router.post('/iniciar-viagem', driverController.startTrip);
router.post('/finalizar-viagem', driverController.endTrip);
router.get('/historico', driverController.getHistory);
router.post('/mensagens', driverController.sendMessage);

// 🆕 ROTAS NOVAS
router.get('/passageiros', driverController.getPassengers);
router.get('/pontos', driverController.getRoutePoints);
router.post('/validar-qrcode', driverController.validateQRCode);
router.post('/anunciar-ponto', driverController.announceNextPoint);

module.exports = router;