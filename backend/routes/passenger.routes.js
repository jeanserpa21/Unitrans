const router = require('express').Router();
const passengerController = require('../controllers/passenger.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

// Todas as rotas requerem autenticação de PASSAGEIRO
router.use(authenticate);
router.use(authorize(['PASSAGEIRO']));

// GET /api/passageiros/me - Perfil
router.get('/me', passengerController.getProfile);

// GET /api/passageiros/viagem-hoje - Viagem do dia
router.get('/viagem-hoje', passengerController.getTodayTrip);

// POST /api/passageiros/check-in-out - Check-in ou Check-out
router.post('/check-in-out', passengerController.checkInOut);

// POST /api/passageiros/solicitar-carona - Solicitar carona
router.post('/solicitar-carona', passengerController.requestRide);

// PUT /api/passageiros/solicitacoes/:id/cancelar - Cancelar solicitação
router.put('/solicitacoes/:id/cancelar', passengerController.cancelRideRequest);

// GET /api/passageiros/mensagens - Ver mensagens
router.get('/mensagens', passengerController.getMessages);

module.exports = router;