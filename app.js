// app.js
const bcrypt = require('bcryptjs');
const { db, generateToken } = require('./config/db');
const express = require('express');
const cors = require('cors');
const path = require('path');
const itensRoutes = require('./routes/itensRoutes');
const registerRoutes = require('./routes/registerRoutes');
const authRoutes = require('./routes/authRoutes');
const { login } = require('./controllers/authController');

const app = express();

// Middlewares
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'Public')));

// Rotas da API
app.use('/api', itensRoutes);
app.use('/api', registerRoutes);
app.use('/api', authRoutes);

// Rotas para telas
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'Public', 'index.html'));
});

app.get('/cadastro', (req, res) => {
    res.sendFile(path.join(__dirname, 'Public', 'tela-de-cadastro.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'Public', 'tela-de-login.html'));
});

app.get('/main', (req, res) => {
    res.sendFile(path.join(__dirname, 'Public', 'tela-de-lista-e-grafico.html'));
});

app.get('/lista_itens', (req, res) => {
    res.sendFile(path.join(__dirname, 'Public', 'tela-de-lista-e-grafico.html'));
});

app.get('/grafico', (req, res) => {
    res.sendFile(path.join(__dirname, 'Public', 'tela-de-lista-e-grafico.html'));
});

// Rota de cadastro
app.post('/cadastrar', async (req, res) => {
    const { nome, email, senha, confirSenha } = req.body;

    if (!nome || !email || !senha || !confirSenha) {
        return res.status(400).json({ success: false, message: 'Preencha todos os campos.' });
    }

    if (senha !== confirSenha) {
        return res.status(400).json({ success: false, message: 'As senhas não coincidem.' });
    }

    try {
        const hash = await bcrypt.hash(senha, 10);

        const query = 'INSERT INTO registro (nome, email, senha) VALUES (?, ?, ?)';
        const [results] = await db.promise().query(query, [nome, email, hash]);

        const token = generateToken({ id: results.insertId, email });
        
        res.status(200).json({ 
            success: true, 
            message: 'Cadastro realizado com sucesso!', 
            token: token // Envie o token completo, não limitado
        });
    } catch (error) {
        console.error('Erro ao adicionar usuário:', error);
        
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ 
                success: false, 
                message: 'Este e-mail já está cadastrado.' 
            });
        }
        
        res.status(500).json({ 
            success: false, 
            message: 'Erro ao cadastrar usuário.' 
        });
    }
});

// Rota de login (melhor usar através do authRoutes)
app.post('/api/login', async (req, res) => {
    try {
        const { login } = require('./controllers/authController');
        await login(req, res);
    } catch (error) {
        console.error('Erro na rota de login:', error);
        res.status(500).json({ error: 'Erro interno no servidor' });
    }
});

module.exports = app;