const mysql = require('mysql2');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '', 
    database: 'mercado_db' 
});
//conectar ao banco de dados
db.connect(err =>{
    if(err){
        console.error('Erro ao conectar ao MySQL:', err);
    }
    else{
        console.log('Conectado ao MySQL');
    }

    //verificar se a tabela existe e crialas

    const createTableQuery = `
    CREATE TABLE IF NOT EXISTS itens_compra (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        quantidade INT NOT NULL,
        preco DECIMAL(10, 2) NOT NULL
    )

    
`
    const createTableRegist = `
        CREATE TABLE IF NOT EXISTS registro (
            id INT AUTO_INCREMENT PRIMARY KEY,
            nome VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL,
            senha VARCHAR(255) NOT NULL
        )`;
    
;
  

    db.query(createTableQuery, (err, result) =>{
        if(err){
            console.error('Erro ao criar a tabela:', err);
        }
        else{
            console.log('Tabela criada com sucesso');
        }

    });

    db.query(createTableRegist, (err, result) =>{
        if(err){
            console.error('Erro ao criar a tabela regist:', err);
        }
        else{
            console.log('Tabela criada regist com sucesso');
        }
    });

    
});
//função para token twj
function generateToken(user){
    return jwt.sign({id: user.id, email: user.email}, 'secret', {
        expiresIn: '1h'
    });
}

//função para verificar token
function verifyToken(req, res, next){
    const token = req.headers['authorization'];
    if(!token) return res.status(401).json({error: 'Acesso negado'});
    jwt.verify(token, 'secret', (err, user)=>{
        if(err){
            return res.status(403).json({error: 'Token inválido'});
        }
        req.userId = user.id;
        next();
    })
    
}

module.exports = {
    db,
    generateToken,
    verifyToken,
};
 