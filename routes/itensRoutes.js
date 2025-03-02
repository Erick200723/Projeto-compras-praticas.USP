// routes/itensRoutes.js
const express = require('express');
const router = express.Router();
const backEnd = require('../services/back_end');

// Listar itens
router.get('/itens', (req, res) => {
    backEnd.listarItens((err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

// Adicionar item
router.post('/itens', (req, res) => {
    const { nome, quantidade, preco } = req.body;

    // Verifique se os campos obrigatórios estão presentes
    if (!nome || !quantidade || !preco) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }

    // Use a função adicionarItem do back_end.js
    backEnd.adicionarItem({ nome, quantidade, preco }, (err, result) => {
        if (err) {
            console.error('Erro ao adicionar item:', err);
            return res.status(500).json({ error: 'Erro ao adicionar item' });
        }
        res.json(result);
    });
});
// Remover item
router.delete('/itens/:id', (req, res) => {
    const { id } = req.params;
    backEnd.removerItem(id, (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });
});

// Editar item
router.put('/itens/:id', (req, res) => {
    const { id } = req.params;
    const item = req.body;
    backEnd.editarItem(id, item, (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });
});

// Calcular média do valor dos itens
router.get('/media', (req, res) => {
    backEnd.calcularMedia((err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });
});

module.exports = router;