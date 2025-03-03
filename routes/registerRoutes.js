const express = require('express');
const router = express.Router();
const {addUser,deleteUser,updateUser,listUsers } = require('../services/register');

//Rota para adicionar usuarios

router.post('/register', async (req, res) =>{
    const {nome, email, senha} = req.body;

    try{
        const user = await addUser(nome, email, senha);
        res.status(200).json(user);
    }catch(error){
        console.error('Erro ao adicionar usuário:', error);
        res.status(500).json({error: 'Erro ao adicionar usuário'});
    }
});

// Rota para excluir um usuário
router.delete('/register/:id', async (req, res) =>{
    const {id} = req.params;

    try {
        const result = await deleteUser(id);
        res.json(result);
    }catch(err){
        console.error('Erro ao remover usuário:', err);
        res.status(500).json({error: 'Erro ao remover usuário'});
    }
});

// Rota para atualizar um usuário

router.put('/register/:id', async(req, res) =>{
    const {id} = req.params;
    const {nome} = req.body;

    try {
        const result = await updateUser(id, nome);
        res.json(result);
    }catch(err){
        console.error('Error ao atualizar usuário:', err);
        res.status(500).json({error: 'Error ao atualizar usuário'});
    }
});

// Rota para listar todos os usuários
router.get('/register', async (req, res) => {
    try {
        const results = await listUsers();
        res.json(results);
    } catch (err) {
        console.error('Erro ao listar usuários:', err);
        res.status(500).json({ error: 'Erro ao listar usuários' });
    }
})

module.exports = router;