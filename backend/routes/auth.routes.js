const router = require('express').Router();
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middlewares/auth.middleware');

// POST /api/auth/login
router.post('/login', authController.login);

// GET /api/auth/profile (protegida)
router.get('/profile', authenticate, authController.getProfile);

// POST /api/auth/logout (protegida)
router.post('/logout', authenticate, authController.logout);

module.exports = router;