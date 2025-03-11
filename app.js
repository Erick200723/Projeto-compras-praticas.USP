// app.js
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

module.exports = app;