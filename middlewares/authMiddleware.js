const jwt = require('jsonwebtoken');
const JWT_SECRET = 'seu_segredo_super_secreto'; // Mesmo segredo usado no controller

function authMiddleware(req, res, next) {
    const authHeader = req.headers["authorization"];
    
    if (!authHeader) {
        return res.status(401).json({ 
            success: false, 
            error: "Token não fornecido" 
        });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, 'seu_segredo_super_secreto');
        req.user = decoded; // Adiciona usuário decodificado à requisição
        next();
    } catch (err) {
        console.error("Erro no token:", err);
        return res.status(403).json({ 
            success: false, 
            error: "Token inválido/experido" 
        });
    }
}

module.exports = authMiddleware;