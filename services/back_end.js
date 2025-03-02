// service.js
const db = require('../config/db');

// Função para listar itens
const listarItens = (callback) => {
    db.query('SELECT * FROM itens_compra', (err, results) => {
        if (err) return callback(err, null);
        callback(null, results);
    });
};

// Função para adicionar item
const adicionarItem = (item, callback) => {
    const { nome, quantidade, preco } = item;
    db.query('INSERT INTO itens_compra (nome, quantidade, preco) VALUES (?, ?, ?)',
        [nome, quantidade, preco],
        (err, result) => {
            if (err) return callback(err, null);
            callback(null, { id: result.insertId, nome, quantidade, preco });
        }
    );
};

// Função para remover item
const removerItem = (id, callback) => {
    db.query('DELETE FROM itens_compra WHERE id = ?', [id], (err, result) => {
        if (err) return callback(err, null);
        callback(null, { message: 'Item removido com sucesso' });
    });
};

// Função para editar item
const editarItem = (id, item, callback) => {
    const { nome, quantidade, preco } = item;
    db.query('UPDATE itens_compra SET nome = ?, quantidade = ?, preco = ? WHERE id = ?',
        [nome, quantidade, preco, id],
        (err, result) => {
            if (err) return callback(err, null);
            callback(null, { message: 'Item atualizado com sucesso' });
        }
    );
};

// Função para calcular a média dos preços
const calcularMedia = (callback) => {
    db.query('SELECT AVG(preco) AS media FROM itens_compra', (err, result) => {
        if (err) return callback(err, null);
        callback(null, { media: result[0].media });
    });
};

module.exports = {
    listarItens,
    adicionarItem,
    removerItem,
    editarItem,
    calcularMedia
};