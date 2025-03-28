const express = require('express');
const router = express.Router();
const { login, rotaProtegida } = require('../controllers/authController');
const { verifyToken } = require('../config/db');
const authMiddleware = require('../controllers/authMiddleware');

// Rota de login
router.post('/login', login);

// Rota protegida
router.get('/protegido', authMiddleware, (req, res) => {
    res.json({ 
        message: 'Você acessou uma rota protegida!',
        userId: req.userId // ID do usuário obtido do token
    });
});
module.exports = router;