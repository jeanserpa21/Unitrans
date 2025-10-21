const router = require('express').Router();
const adminController = require('../controllers/admin.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

// Todas as rotas requerem autenticação de ADMIN
router.use(authenticate);
router.use(authorize(['ADM']));

// Dashboard
router.get('/dashboard', adminController.getDashboard);

// === PASSAGEIROS ===
router.get('/passageiros', adminController.getPassengers);
router.put('/passageiros/:id/aprovar', adminController.approvePassenger);
router.put('/passageiros/:id/recusar', adminController.rejectPassenger);

// === MOTORISTAS ===
router.get('/motoristas', adminController.getDrivers);
router.post('/motoristas', adminController.createDriver);
router.put('/motoristas/:id', adminController.updateDriver);

// === LINHAS ===
router.get('/linhas', adminController.getLines);
router.post('/linhas', adminController.createLine);
router.put('/linhas/:id', adminController.updateLine);
router.put('/linhas/:id/motorista', adminController.assignDriver);

// === PONTOS ===
router.get('/linhas/:linhaId/pontos', adminController.getPoints);
router.post('/linhas/:linhaId/pontos', adminController.createPoint);
router.put('/pontos/:id', adminController.updatePoint);
router.delete('/pontos/:id', adminController.deletePoint);

// === RELATÓRIOS ===
router.get('/relatorios/faltas', adminController.getAbsenceReport);
router.get('/relatorios/presenca', adminController.getAttendanceReport);

module.exports = router;