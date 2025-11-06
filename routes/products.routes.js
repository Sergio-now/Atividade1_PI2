const { Router } = require('express');
const router = Router();

// Nosso "banco de dados" em memória
let produtos = [];
// Um contador para gerar IDs únicos e incrementais
let proximoId = 1;

// --- Middlewares de Validação (Opcional, mas boa prática) ---

// Middleware para validar se o ID é um número
const validarIdNumerico = (req, res, next) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    // Retorna 400 Bad Request se o ID não for um número
    return res.status(400).json({ message: "ID inválido. Deve ser um número." });
  }
  // Se for um número, anexa ao request para uso posterior e continua
  req.id = id;
  next();
};

// Middleware para encontrar o produto e o índice
const encontrarProduto = (req, res, next) => {
  const produto = produtos.find(p => p.id === req.id);
  const index = produtos.findIndex(p => p.id === req.id);

  if (!produto) {
    // Retorna 404 Not Found se o produto não existir
    return res.status(404).json({ message: "Produto não encontrado" });
  }
  
  // Anexa o produto e o índice ao request para as rotas PUT, PATCH, DELETE
  req.produto = produto;
  req.index = index;
  next();
};

// --- ROTAS DO CRUD ---

/**
 * 1. POST /produtos
 * Adiciona um novo produto.
 */
router.post('/', (req, res) => {
  const { nome, preco } = req.body;

  // Validação do corpo da requisição
  if (!nome || preco === undefined || preco < 0) {
    return res.status(400).json({ message: "Dados inválidos. 'nome' (string) e 'preco' (número >= 0) são obrigatórios." });
  }

  const novoProduto = {
    id: proximoId++, // ID único e incremental
    nome: nome,
    preco: preco
  };

  produtos.push(novoProduto);
  // Retorna 201 Created com o produto criado
  res.status(201).json(novoProduto);
});

/**
 * 2. GET /produtos
 * Retorna todos os produtos.
 */
router.get('/', (req, res) => {
  // Retorna 200 OK com a lista de produtos
  res.status(200).json(produtos);
});

/**
 * 3. GET /produtos/:id
 * Retorna um produto pelo ID.
 */
router.get('/:id', validarIdNumerico, encontrarProduto, (req, res) => {
  // A lógica de validação e busca já foi feita pelos middlewares
  // Se chegou aqui, o produto foi encontrado
  // Retorna 200 OK com o produto encontrado
  res.status(200).json(req.produto);
});

/**
 * 4. PUT /produtos/:id
 * Atualiza TODOS os campos de um produto.
 */
router.put('/:id', validarIdNumerico, encontrarProduto, (req, res) => {
  const { nome, preco } = req.body;

  // Validação do corpo (PUT exige todos os campos)
  if (!nome || preco === undefined || preco < 0) {
    return res.status(400).json({ message: "Dados inválidos. 'nome' e 'preco' são obrigatórios." });
  }

  // Atualiza o produto no array
  const produtoAtualizado = { ...req.produto, nome: nome, preco: preco };
  produtos[req.index] = produtoAtualizado;

  // Retorna 200 OK com o produto atualizado
  res.status(200).json(produtoAtualizado);
});

/**
 * 5. PATCH /produtos/:id
 * Atualiza PARCIALMENTE um produto.
 */
router.patch('/:id', validarIdNumerico, encontrarProduto, (req, res) => {
  const { nome, preco } = req.body;

  // Se nenhum campo foi enviado, retorna erro
  if (!nome && preco === undefined) {
    return res.status(400).json({ message: "Dados inválidos. Pelo menos 'nome' ou 'preco' deve ser enviado." });
  }

  // Pega o produto original
  const produtoAtualizado = { ...req.produto };

  // Atualiza apenas os campos que foram enviados
  if (nome) {
    produtoAtualizado.nome = nome;
  }
  if (preco !== undefined && preco >= 0) {
    produtoAtualizado.preco = preco;
  } else if (preco < 0) {
     return res.status(400).json({ message: "Preço inválido. Deve ser um número >= 0." });
  }

  // Atualiza o produto no array
  produtos[req.index] = produtoAtualizado;

  // Retorna 200 OK com o produto atualizado
  res.status(200).json(produtoAtualizado);
});

/**
 * 6. DELETE /produtos/:id
 * Remove um produto.
 */
router.delete('/:id', validarIdNumerico, encontrarProduto, (req, res) => {
  // Remove o produto do array usando o índice
  produtos.splice(req.index, 1);

  // Retorna 204 No Content (sucesso sem corpo de resposta)
  res.status(204).send();
});

// Exporta o router para ser usado no main.js
module.exports = router;