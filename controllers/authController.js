const { db, generateToken } = require('../config/db');
const bcrypt = require('bcryptjs');

async function login(req, res) {
    const { email, senha, nome } = req.body;
    console.log('Dados recebidos no backend:', { email, senha, nome }); // Debug

    try {
        if (!email || !senha) {
            console.log('Campos obrigatórios faltando'); // Debug
            return res.status(400).json({ error: 'E-mail e senha são obrigatórios' });
        }

        const [results] = await db.promise().query(
            'SELECT * FROM registro WHERE email = ?', 
            [email]
        );

        if (results.length === 0) {
            console.log('Usuário não encontrado para email:', email); // Debug
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        const user = results[0];
        console.log('Usuário encontrado:', user.id); // Debug

        const isMatch = await bcrypt.compare(senha, user.senha);
        if (!isMatch) {
            console.log('Senha incorreta para usuário:', user.id); // Debug
            return res.status(401).json({ error: 'Senha incorreta' });
        }

        const token = generateToken(user);
        console.log('Token gerado para usuário:', user.id); // Debug

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

module.exports = { login };