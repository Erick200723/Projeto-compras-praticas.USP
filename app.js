// app.js
const express = require('express');
const cors = require('cors');
const itensRoutes = require('./routes/itensRoutes'); // Verifique o caminho e o nome

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Rotas
app.use(itensRoutes);

module.exports = app;