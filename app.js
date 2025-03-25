// app.js
const bcrypt = require('bcryptjs');
const {db,generateToken} = require('./config/db')
const express = require('express');
const cors = require('cors');
const itensRoutes = require('./routes/itensRoutes'); // Verifique o caminho e o nome
const registerRoutes = require('./routes/registerRoutes');
const authRouters = require('./routes/authRoutes');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Rotas
app.use('/api',itensRoutes);
app.use('/api',registerRoutes);
app.use('/api',authRouters);

//usar arquivo statico
app.use(express.static('Public'));
app.use(express.urlencoded({ extended: true }));

//Rotas telas

app.get('/', (req, res) =>{
    res.sendFile(__dirname +'/Public/index.html');
})

app.get('/cadastro', (req, res)=>{
    res.sendFile(__dirname + '/Public/tela-de-cadastro.html');
})

app.get('/login', (req, res)=>{
    res.sendFile(__dirname + '/Public/tela-de-login.html');
})

app.get('/main', (req, res)=>{
    res.sendFile(__dirname + '/Public/tela-de-lista-e-grafico.html')
})

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
        const tokenLimitado = token.slice(0, 10);

        // Resposta de sucesso
        res.status(200).json({ success: true, message: 'Cadastro realizado com sucesso!', token: tokenLimitado });
    } catch (error) {
        console.error('Erro ao adicionar usuário:', error);
        res.status(500).json({ success: false, message: 'Erro ao cadastrar usuário.' });
    }

app.get('/lista_intes', async (req, res)=>{
    res.sendFile(__dirname + '/Public/tela-de-lista-e-grafico.html');

app.get('/grafico', async (req, res)=>{
    res.sendFile(__dirname + '/Public/tela-de-lista-e-grafico.html');
})
})
});
module.exports = app;