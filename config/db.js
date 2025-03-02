const mysql = require('mysql2');

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
`;

    db.query(createTableQuery, (err, result =>{
        if(err){
            console.error('Erro ao criar a tabela:', err);
        }
        else{
            console.log('Tabela criada com sucesso');
        }

    }))
})

module.exports = db;