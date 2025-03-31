
const express = require('express');
const router = express.Router();
const controller = require('../controllers/listaController');
const authMiddleware = require('../middlewares/authMiddleware');

// Todas as rotas exigem autenticação
router.use(authMiddleware);

// POST /api/lista (criar nova lista)
router.post('/', controller.criarLista);

// GET /api/lista (listar todas as listas do usuário)
router.get('/', controller.obterListas);

// GET /api/lista/:id (obter uma lista específica)
router.get('/:id', controller.obterListaPorId);
router.delete('/:id', controller.excluirLista);

module.exports = router;