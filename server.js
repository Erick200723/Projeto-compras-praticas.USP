const app = require('./app');
const db = require('./config/db');

//conctar ao banco de dados
const PORT = 8081;

app.listen(PORT, ()=>{
    console.log(`Servidor estar rodando na porta ${PORT}`);
});