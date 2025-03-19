// app.js
const bcrypt = require('bcryptjs');
const {db,generateToken} = require('./config/db')
const express = require('express');
const cors = require('cors');
const itensRoutes = require('./routes/itensRoutes'); // Verifique o caminho e o nome
const registerRoutes = require('./routes/registerRoutes');
const authRouters = require('./routes/authRoutes');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Rotas
app.use('/api',itensRoutes);
app.use('/api',registerRoutes);
app.use('/api',authRouters);

//usar arquivo statico

app.use(express.static('/Public'));
app.use(express.urlencoded({ extended: true }));

//Rotas telas

app.get('/', (req, res) =>{
    res.sendFile(__dirname +'/Public/index.html');
})

app.get('/cadastro', (req, res)=>{
    res.sendFile(__dirname + '/Public/tela-de-cadastro.html');
})

app.get('/login', (req, res)=>{
    res.sendFile(__dirname + '/Public/tela-de-login.html');
})

app.post('/cadastrar', async (req,res)=>{
    const{nome,email,senha,confirSenha} = req.body;

    if(!nome || !email || !senha || !confirSenha) {
       return res.status(400).send("Todos os campos são obrigatórios.'");
    }
    if(senha !== confirSenha){
       return res.status(404).send("As senhas não coecidem");
    }
    
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
       
});

module.exports = app;