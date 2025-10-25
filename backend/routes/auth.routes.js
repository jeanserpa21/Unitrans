const router = require('express').Router();
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middlewares/auth.middleware');

// POST /api/auth/login
router.post('/login', authController.login);

// POST /api/auth/register - NOVA ROTA
router.post('/register', authController.register);

// GET /api/auth/universidades - Buscar universidades para cadastro
router.get('/universidades', authController.getUniversidades);

// GET /api/auth/profile (protegida)
router.get('/profile', authenticate, authController.getProfile);

// POST /api/auth/logout (protegida)
router.post('/logout', authenticate, authController.logout);

module.exports = router;