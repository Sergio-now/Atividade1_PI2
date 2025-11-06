// Importa o Express
const express = require('express');
// Importa as rotas dos produtos
const productRoutes = require('./routes/products.routes');

// Cria a aplicação Express
const app = express();
const PORT = 3000;

// Middleware essencial para o Express entender JSON
// Isso permite que o `req.body` funcione nas rotas POST, PUT e PATCH
app.use(express.json());

// Middleware para montar as rotas de produtos no caminho /produtos
// Todas as rotas em 'productRoutes' serão prefixadas com '/produtos'
app.use('/produtos', productRoutes);

// Inicia o servidor na porta definida
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});