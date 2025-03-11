const express = require('express');
const router = express.Router();
const { login, rotaProtegida } = require('../controllers/authController');
const { verifyToken } = require('../config/db');
const authMiddleware = require('../controllers/authMiddleware');

// Rota de login
router.post('/login', login);

// Rota protegida
router.get('/protegido', authMiddleware,rotaProtegida, verifyToken);

module.exports = router;