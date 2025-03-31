const bcrypt = require('bcryptjs');
const express = require('express');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');
const {pool, generateToken } = require('./config/db'); // Certifique-se que este export está correto
const itensRoutes = require('./routes/itensRoutes');
const registerRoutes = require('./routes/registerRoutes');
const authRoutes = require('./routes/authRoutes');
const listaRoutes = require('./routes/listaRoutes');
const { login } = require('./controllers/authController');
const authMiddleware = require('./middlewares/authMiddleware');

const app = express();

// Middlewares
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

app.use(express.json());
app.use(cors({
    origin: ['http://localhost:5500', 'http://127.0.0.1:5500'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'Public')));

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/lista', listaRoutes);
app.use('/api/itens', itensRoutes);
app.use('/cadastrar', registerRoutes);

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

app.get('/listas', (req, res) => {
    res.sendFile(path.join(__dirname, 'Public', 'listas_user.html'));
});

// Rota de cadastro melhorada
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
        
        // ✅ Usando pool.query diretamente (sem .promise())
        const [results] = await pool.query(query, [nome, email, hash]);

        const token = generateToken({ id: results.insertId, email });
        
        res.status(200).json({ 
            success: true, 
            message: 'Cadastro realizado com sucesso!', 
            token 
        });
    } catch (error) {
        console.error('Erro ao cadastrar usuário:', error);
        
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

// Middleware de autenticação melhorado
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];
    
    if (!token) return res.status(401).json({ error: 'Token de acesso não fornecido' });

    jwt.verify(token, process.env.JWT_SECRET || 'secret', (err, user) => {
        if (err) return res.status(403).json({ error: 'Token inválido ou expirado' });
        req.user = user;
        next();
    });
};

// Rotas protegidas com tratamento de erros melhorado
app.post('/api/lista_compras', authenticateToken, async (req, res) => {
    const { nome_lista, produtos } = req.body;
    const userId = req.user.id;

    if (!nome_lista || !produtos || !Array.isArray(produtos)) {
        return res.status(400).json({ success: false, message: 'Dados inválidos' });
    }

    const connection = await pool.getConnection();
    
    try {
        await connection.beginTransaction();

        // Inserir a lista principal
        const [listaResult] = await connection.query(
            'INSERT INTO listas (nome, user_id) VALUES (?, ?)',
            [nome_lista, userId]
        );

        const listaId = listaResult.insertId;

        // Inserir os produtos
        for (const produto of produtos) {
            await connection.query(
                `INSERT INTO itens_lista 
                (lista_id, nome_produto, quantidade, preco) 
                VALUES (?, ?, ?, ?)`,
                [listaId, produto.nomeProduto, produto.quantidade, produto.preco]
            );
        }

        await connection.commit();
        
        res.status(201).json({ 
            success: true, 
            message: 'Lista salva com sucesso',
            listaId 
        });
    } catch (error) {
        await connection.rollback();
        console.error('Erro ao salvar lista:', error);
        
        res.status(500).json({ 
            success: false, 
            message: 'Erro ao salvar lista',
            error: error.message 
        });
    } finally {
        connection.release();
    }
});

app.get('/api/lista_compras', authenticateToken, async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT l.id, l.nome, l.data_criacao, 
             COUNT(i.id) as total_itens
             FROM listas l
             LEFT JOIN itens_lista i ON l.id = i.lista_id
             WHERE l.user_id = ?
             GROUP BY l.id
             ORDER BY l.data_criacao DESC`,
            [req.user.id]
        );
        
        res.json(rows);
    } catch (error) {
        console.error('Erro ao buscar listas:', error);
        res.status(500).json({ 
            error: 'Erro ao buscar listas',
            details: error.message 
        });
    }
});

// Tratamento de erros global
app.use((err, req, res, next) => {
    console.error('Erro não tratado:', err);
    res.status(500).json({ 
        success: false, 
        message: 'Erro interno no servidor',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

module.exports = app;