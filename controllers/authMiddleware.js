const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
    const token = req.header('Authorization');

    if (!token) {
        return res.status(401).json({ error: 'Token não fornecido' });
    }

    try {
        // Remove o prefixo "Bearer " do token
        const tokenSemBearer = token.replace('Bearer ', '');

        // Verifica o token
        const decoded = jwt.verify(tokenSemBearer, 'SUA_CHAVE_SECRETA');
        req.userId = decoded.id; // Adiciona o ID do usuário à requisição
        next();
    } catch (err) {
        console.error('Erro ao verificar token:', err);
        res.status(401).json({ error: 'Token inválido' });
    }
}

module.exports = authMiddleware;