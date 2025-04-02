const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Configuração do pool de conexões
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'comprasusp',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Função para inicializar o banco de dados
async function initializeDatabase() {
    let connection;
    try {
        connection = await pool.getConnection();
        
        // Criação das tabelas
        await connection.query(`
            CREATE TABLE IF NOT EXISTS registro (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nome VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL UNIQUE,
                senha VARCHAR(255) NOT NULL
            )`);
        
        await connection.query(`
            CREATE TABLE IF NOT EXISTS lista_compras (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nome_produto VARCHAR(255) NOT NULL,
                quantidade INT NOT NULL,
                preco DECIMAL(10, 2) NOT NULL,
                user_id INT NOT NULL,
                data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES registro(id)
            )`);
        
        await connection.query(`
        CREATE TABLE IF NOT EXISTS listas (
            id INT AUTO_INCREMENT PRIMARY KEY,
            nome VARCHAR(100) NOT NULL,
            user_id INT NOT NULL,
            data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES registro(id)
            ) ENGINE=InnoDB;
 `)

        await connection.query(`
            CREATE TABLE IF NOT EXISTS itens_lista (
                id INT AUTO_INCREMENT PRIMARY KEY,
                lista_id INT NOT NULL,
                nome_produto VARCHAR(100) NOT NULL,
                quantidade INT NOT NULL,
                preco DECIMAL(10,2) NOT NULL,
                FOREIGN KEY (lista_id) REFERENCES listas(id) ON DELETE CASCADE
                ) ENGINE=InnoDB;
 `)

        console.log('✅ Tabelas verificadas/criadas com sucesso');
    } catch (error) {
        console.error('❌ Erro ao inicializar o banco de dados:', error);
        throw error; // Propaga o erro para quem chamar
    } finally {
        if (connection) connection.release();
    }
}

// Funções JWT
function generateToken(user) {
    return jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: '1h' }
    );
}

function verifyToken(req, res, next) {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).json({ error: 'Acesso negado' });
    
    jwt.verify(token, process.env.JWT_SECRET || 'secret', (err, user) => {
        if (err) return res.status(403).json({ error: 'Token inválido' });
        req.userId = user.id;
        next();
    });
}

// Inicializa o banco e exporta
initializeDatabase()
    .then(() => console.log('✅ Banco de dados inicializado com sucesso'))
    .catch(err => console.error('❌ Falha ao inicializar banco de dados:', err));

module.exports = {
    pool, // Exporta o pool de conexões
    generateToken,
    verifyToken
};