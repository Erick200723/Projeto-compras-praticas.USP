const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'mercado_db'
});

db.connect(err => {
    if (err) {
        console.error('Erro ao conectar ao MySQL:', err);
    } else {
        console.log('Conectado ao MySQL');
    }
});

// Listar itens
app.get('/itens', (req, res) => {
    db.query('SELECT * FROM itens_compra', (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

// Adicionar item
app.post('/itens', (req, res) => {
    const { nome, quantidade, preco } = req.body;
    db.query('INSERT INTO itens_compra (nome, quantidade, preco) VALUES (?, ?, ?)',
        [nome, quantidade, preco],
        (err, result) => {
            if (err) return res.status(500).json(err);
            res.json({ id: result.insertId, nome, quantidade, preco });
        }
    );
});

// Remover item
app.delete('/itens/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM itens_compra WHERE id = ?', [id], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: 'Item removido com sucesso' });
    });
});

// Editar item
app.put('/itens/:id', (req, res) => {
    const { id } = req.params;
    const { nome, quantidade, preco } = req.body;
    db.query('UPDATE itens_compra SET nome = ?, quantidade = ?, preco = ? WHERE id = ?',
        [nome, quantidade, preco, id],
        (err, result) => {
            if (err) return res.status(500).json(err);
            res.json({ message: 'Item atualizado com sucesso' });
        }
    );
});

// Calcular média do valor dos itens
app.get('/media', (req, res) => {
    db.query('SELECT AVG(preco) AS media FROM itens_compra', (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ media: result[0].media });
    });
});

app.listen(3000, () => console.log('Servidor rodando na porta 3000'));
