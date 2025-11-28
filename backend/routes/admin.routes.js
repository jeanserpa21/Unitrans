const router = require('express').Router();
const adminController = require('../controllers/admin.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const adminViagemController = require('../controllers/admin-viagem.controller');


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
router.delete('/motoristas/:id', adminController.deleteDriver); 

// === LINHAS ===
router.get('/linhas', adminController.getLines);
router.post('/linhas', adminController.createLine);
router.put('/linhas/:id', adminController.updateLine);
router.put('/linhas/:id/motorista', adminController.assignDriver);
router.get('/linhas', adminController.getLines);
router.get('/linhas/:linhaId/passageiros', adminController.getLinePassengers); // ← ADICIONAR
router.put('/linhas/:linhaId/configuracao', adminController.updateLineConfig); // ← ADICIONAR

// === PONTOS ===
router.get('/linhas/:linhaId/pontos', adminController.getPoints);
router.post('/linhas/:linhaId/pontos', adminController.createPoint);
router.put('/pontos/:id', adminController.updatePoint);
router.delete('/pontos/:id', adminController.deletePoint);

// === RELATÓRIOS ===
router.get('/relatorios/faltas', adminController.getAbsenceReport);
router.get('/relatorios/presenca', adminController.getAttendanceReport);
// === RELATÓRIOS ===
router.get('/relatorios/passageiros-ativos', adminController.getActivePassengersReport);
router.get('/relatorios/faltas', adminController.getAbsenceReport);
router.get('/relatorios/presenca', adminController.getAttendanceReport);
router.get('/relatorios/viagens', adminController.getTripsReport);

// Rotas de Viagens
router.get('/viagens', adminViagemController.listarViagens);
router.post('/viagens', adminViagemController.criarViagem);
router.post('/viagens/gerar-qrcode', adminViagemController.gerarQRCode);
router.get('/viagens/:viagemId', adminViagemController.verDetalhes);
router.delete('/viagens/:viagemId', adminViagemController.deletarViagem);
router.get('/viagens/passageiros/:linhaId', adminViagemController.buscarPassageirosDisponiveis);

// === VEÍCULOS ===
//router.get('/veiculos', adminController.getVehicles); 
//router.post('/veiculos', adminController.createVehicle);
//router.put('/veiculos/:id', adminController.updateVehicle);
//router.delete('/veiculos/:id', adminController.deleteVehicle);


module.exports = router;