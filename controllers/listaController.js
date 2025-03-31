const { pool } = require('../config/db'); // Importe o pool corretamente (não db)

const criarLista = async (req, res) => {
    console.log('ID do usuário na requisição:', req.user.id);
    const { nome_lista, produtos } = req.body;
    const userId = req.user.id;

    // Validação dos dados de entrada
    if (!nome_lista || !produtos || !Array.isArray(produtos)) {
        return res.status(400).json({
            success: false,
            message: 'Dados inválidos: nome da lista e array de produtos são obrigatórios'
        });
    }

    const connection = await pool.getConnection();
    
    try {
        await connection.beginTransaction();

        // 1. Verificar usuário
        const [user] = await connection.query('SELECT id FROM registro WHERE id = ?', [userId]);
        if (user.length === 0) {
            await connection.rollback();
            return res.status(404).json({ 
                success: false, 
                message: 'Usuário não encontrado' 
            });
        }

        // 2. Criar a lista principal
        const [listaResult] = await connection.query(
            'INSERT INTO listas (nome, user_id) VALUES (?, ?)',
            [nome_lista, userId]
        );
        const listaId = listaResult.insertId;

        // 3. Inserir produtos
        const insertPromises = produtos.map(produto => {
            return connection.query(
                `INSERT INTO itens_lista 
                (lista_id, nome_produto, quantidade, preco) 
                VALUES (?, ?, ?, ?)`,
                [listaId, produto.nomeProduto, produto.quantidade, produto.preco]
            );
        });

        await Promise.all(insertPromises);
        await connection.commit();
        
        res.status(201).json({ 
            success: true, 
            message: 'Lista salva com sucesso',
            data: {
                listaId,
                itensSalvos: produtos.length,
                nomeLista: nome_lista
            }
        });

    } catch (error) {
        await connection.rollback();
        console.error('Erro ao salvar lista:', error);

        if (error.code === 'ER_NO_REFERENCED_ROW_2') {
            return res.status(400).json({ 
                success: false, 
                message: 'Usuário inválido' 
            });
        }

        res.status(500).json({ 
            success: false, 
            message: 'Erro ao salvar lista',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    } finally {
        connection.release();
    }
};

const obterListas = async (req, res) => {
    const userId = req.user.id;

    try {
        const [listas] = await pool.query(`
            SELECT 
                l.id, 
                l.nome as nome_lista, 
                COUNT(i.id) as total_itens,
                SUM(i.preco * i.quantidade) as total_valor,
                l.data_criacao as data
            FROM listas l
            LEFT JOIN itens_lista i ON l.id = i.lista_id
            WHERE l.user_id = ?
            GROUP BY l.id
            ORDER BY l.data_criacao DESC
        `, [userId]);

        res.json({
            success: true,
            data: listas
        });
    } catch (error) {
        console.error('Erro ao obter listas:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao carregar listas',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

const obterListaPorId = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    try {
        // Verifica se a lista pertence ao usuário
        const [lista] = await pool.query(
            `SELECT l.id, l.nome as nome_lista, l.data_criacao 
             FROM listas l 
             WHERE l.id = ? AND l.user_id = ?`,
            [id, userId]
        );

        if (lista.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Lista não encontrada ou não pertence ao usuário'
            });
        }

        // Obtém os itens da lista
        const [produtos] = await pool.query(
            `SELECT id, nome_produto, quantidade, preco 
             FROM itens_lista 
             WHERE lista_id = ?`,
            [id]
        );

        res.json({
            success: true,
            data: {
                ...lista[0],
                produtos,
                total: produtos.reduce((sum, item) => sum + (item.preco * item.quantidade), 0)
            }
        });
    } catch (error) {
        console.error('Erro ao obter lista:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao carregar lista',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

const excluirLista = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    const connection = await pool.getConnection();
    
    try {
        await connection.beginTransaction();

        // Verifica se a lista pertence ao usuário
        const [lista] = await connection.query(
            'SELECT id FROM listas WHERE id = ? AND user_id = ?',
            [id, userId]
        );

        if (lista.length === 0) {
            await connection.rollback();
            return res.status(404).json({
                success: false,
                message: 'Lista não encontrada ou não pertence ao usuário'
            });
        }

        // Exclui os itens primeiro (devido à chave estrangeira)
        await connection.query(
            'DELETE FROM itens_lista WHERE lista_id = ?',
            [id]
        );

        // Exclui a lista
        await connection.query(
            'DELETE FROM listas WHERE id = ?',
            [id]
        );

        await connection.commit();
        
        res.json({
            success: true,
            message: 'Lista excluída com sucesso'
        });
    } catch (error) {
        await connection.rollback();
        console.error('Erro ao excluir lista:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao excluir lista',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    } finally {
        connection.release();
    }
};

module.exports = { criarLista, obterListas, obterListaPorId, excluirLista };

