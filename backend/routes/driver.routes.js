const router = require('express').Router();
const driverController = require('../controllers/driver.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

// Todas as rotas requerem autenticação de MOTORISTA
router.use(authenticate);
router.use(authorize(['MOTORISTA']));

// GET /api/motoristas/viagem-hoje - Viagem do dia
router.get('/viagem-hoje', driverController.getTodayTrip);

// POST /api/motoristas/iniciar-viagem - Iniciar viagem
router.post('/iniciar-viagem', driverController.startTrip);

// POST /api/motoristas/finalizar-viagem - Finalizar viagem
router.post('/finalizar-viagem', driverController.endTrip);

// GET /api/motoristas/historico - Histórico
router.get('/historico', driverController.getHistory);

// POST /api/motoristas/mensagens - Enviar mensagem
router.post('/mensagens', driverController.sendMessage);

module.exports = router;