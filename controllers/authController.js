// controllers/authController.js
const jwt = require('jsonwebtoken');
const {pool} = require('../config/db'); // Importe diretamente o pool
const bcrypt = require('bcryptjs');

// Configurações do JWT
const JWT_SECRET = process.env.JWT_SECRET || 'seu_segredo_super_secreto';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

async function login(req, res) {
    const { email, senha } = req.body;

    try {
        // Validação básica
        if (!email || !senha) {
            return res.status(400).json({
                success: false,
                message: 'Email e senha são obrigatórios'
            });
        }

        // Buscar usuário no banco - SEM .promise()
        const [results] = await pool.query(
            'SELECT * FROM registro WHERE email = ?', 
            [email]
        );

        if (results.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Credenciais inválidas'
            });
        }

        const user = results[0];

        // Verificar senha
        const isMatch = await bcrypt.compare(senha, user.senha);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Credenciais inválidas'
            });
        }

        // Criar token JWT
        const token = jwt.sign(
            { id: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                nome: user.nome,
                email: user.email
            }
        });

    } catch (error) {
        console.error('Erro no login:', error);
        
        if (error.code === 'ECONNREFUSED') {
            return res.status(503).json({
                success: false,
                message: 'Servidor de banco de dados indisponível'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Erro interno no servidor'
        });
    }
}

module.exports = { login };