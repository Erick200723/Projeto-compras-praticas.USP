const {db, generateToken} = require('../config/db');
const bcrypt = require('bcryptjs');

// função para adicionar um novo usuário

async function addUser( nome,email,senha) {
    try {
        const hash = await bcrypt.hash(senha, 10);

    const query = 'INSERT INTO registro (nome, email, senha) VALUES (?,?,?)';
    const [results] = await db.promise().query(query, [nome,email,hash]);

    const token = generateToken({id: results.insertId, email});

    const tokenLimitado = token.slice(0, 10);


    return {id: results.insertId, nome, email, tokenLimitado};


    }catch (error) {
        console.error('Erro ao adicionar usuário:', error);
        throw error;
     }
 
}

// função para excluir um usuário pelo id

async function deleteUser(id){
    try {
        const query = 'DELETE FROM registro WHERE id = ?';
        const [results] = await db.promise().query(query, [id]);

        if(results.affectedRows === 0) {
            throw new Error('Usuário não encontrado');
        }
        return {mensagem: 'Usuário removido com sucesso'};
    }catch (err){
        console.error('Erro ao remover usuário:', err);
        throw err;
    }
}

// função para atualizar o usuário pelo id

async function updateUser(id, nomeNovo){
    try{
        const query = 'UPDATE registro SET nome = ? WHERE id = ?';
        const [results] = await db.promise().query(query, [nomeNovo, id]);

        if(results.affectedRows === 0){
            throw new Error('Usuário não encontrado');
        }
        return {mensagem: 'Usuário atualizado com sucesso'};

    }catch (err){
        console.error('Erro ao atualizar usuário:', err);
        throw err;
    }
}

// função para listar todos os usuários 
async function listUsers() {
    try {
        const query = 'SELECT * FROM registro';
        const [results] = await db.promise().query(query);
        return results;
    } catch (error) {
        console.error('Erro ao listar usuários:', error);
        throw error;
    }
}
module.exports = {
    addUser,
    deleteUser,
    updateUser,
    listUsers
}