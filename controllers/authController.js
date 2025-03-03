const { db, generateToken } = require('../config/db');
const bcrypt = require('bcryptjs');

// Função para lidar com o login
const { db, generateToken } = require('../config/db');
const bcrypt = require('bcryptjs');

async function login(req, res) {
    const { email, senha } = req.body;

    try {
        // Validação básica
        if (!email || !senha) {
            return res.status(400).json({ error: 'E-mail e senha são obrigatórios' });
        }

        // Verificar se o usuário existe no banco de dados
        const [results] = await db.promise().query('SELECT * FROM registro WHERE email = ?', [email]);

        if (results.length === 0) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        const user = results[0];

        // Comparar a senha fornecida com a senha criptografada no banco de dados
        const isMatch = await bcrypt.compare(senha, user.senha);
        if (!isMatch) {
            return res.status(401).json({ error: 'Senha incorreta' });
        }

        // Gerar token JWT
        const token = generateToken(user);

        // Retornar token e informações do usuário
        res.json({ 
            token, 
            user: { 
                id: user.id, 
                nome: user.nome, 
                email: user.email 
            } 
        });
    } catch (err) {
        console.error('Erro no login:', err);
        res.status(500).json({ error: 'Erro no servidor', details: err.message });
    }
}

// Função para acessar uma rota protegida
function rotaProtegida(req, res) {
    res.json({ 
        message: 'Esta é uma rota protegida', 
        userId: req.userId 
    });
}

module.exports = {
    login,
    rotaProtegida
};