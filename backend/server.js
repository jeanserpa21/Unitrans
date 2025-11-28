require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const app = express();

// 🧠 Middlewares de segurança e CORS
app.use(helmet());
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 🧾 Limite aumentado para uploads grandes (como base64)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// 🔗 Importar rotas
const authRoutes = require('./routes/auth.routes');
const passengerRoutes = require('./routes/passenger.routes');
const driverRoutes = require('./routes/driver.routes');
const adminRoutes = require('./routes/admin.routes');
const viagemRoutes = require('./routes/viagem.routes');
const notificacaoRoutes = require('./routes/notificacao.routes');

// 🚏 Usar rotas
app.use('/api/auth', authRoutes);
app.use('/api/passageiros', passengerRoutes);
app.use('/api/driver', driverRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/viagens', viagemRoutes);
app.use('/api/notificacoes', notificacaoRoutes);

// 🏠 Rota principal
app.get('/', (req, res) => {
  res.json({
    message: '🚌 UniTrans API está funcionando!',
    timestamp: new Date().toISOString(),
    status: 'online'
  });
});

// 🩺 Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    database: 'connected',
    timestamp: new Date().toISOString()
  });
});

// 🔧 ROTA TEMPORÁRIA - Setup do banco de dados
app.get('/setup-database', async (req, res) => {
  try {
    const db = require('./config/database');
    const fs = require('fs');
    const path = require('path');

    console.log('🔧 Iniciando setup do banco de dados...');

    // 1. Criar tabelas (schema.sql)
    console.log('📋 Criando tabelas...');
    const schema = fs.readFileSync(path.join(__dirname, 'sql', 'schema.sql'), 'utf8');
    await db.query(schema);
    console.log('✅ Tabelas criadas!');

    // 2. Inserir dados de teste (seed.sql)
    console.log('🌱 Inserindo dados de teste...');
    const seed = fs.readFileSync(path.join(__dirname, 'sql', 'seed.sql'), 'utf8');
    await db.query(seed);
    console.log('✅ Dados inseridos!');

    res.json({
      success: true,
      message: '✅ Banco de dados configurado com sucesso!',
      tabelas: 'Criadas',
      dados: 'Inseridos'
    });
  } catch (error) {
    console.error('❌ Erro no setup:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
});

// 🔑 ROTA TEMPORÁRIA - Atualizar senhas com hash correto
app.get('/update-passwords', async (req, res) => {
  try {
    const db = require('./config/database');
    const bcrypt = require('bcrypt');

    console.log('🔑 Gerando hashes de senhas...');

    // Gerar hashes corretos
    const adminHash = await bcrypt.hash('admin123', 10);
    const motoristaHash = await bcrypt.hash('motorista123', 10);
    const passageiroHash = await bcrypt.hash('passageiro123', 10);

    console.log('📝 Atualizando senhas no banco...');

    // Atualizar no banco
    await db.query('UPDATE usuarios SET senha_hash = $1 WHERE email = $2', [adminHash, 'admin@unitrans.com']);
    await db.query('UPDATE usuarios SET senha_hash = $1 WHERE papel = $2', [motoristaHash, 'MOTORISTA']);
    await db.query('UPDATE usuarios SET senha_hash = $1 WHERE papel = $2', [passageiroHash, 'PASSAGEIRO']);

    console.log('✅ Senhas atualizadas!');

    res.json({
      success: true,
      message: '✅ Senhas atualizadas com sucesso!',
      credenciais: {
        admin: { email: 'admin@unitrans.com', senha: 'admin123' },
        motorista: { exemplo: 'joao.motorista@unitrans.com', senha: 'motorista123' },
        passageiro: { exemplo: 'ana@estudante.com', senha: 'passageiro123' }
      }
    });
  } catch (error) {
    console.error('❌ Erro ao atualizar senhas:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 🔍 Rotas de teste
app.get('/test/usuarios', async (req, res) => {
  try {
    const db = require('./config/database');
    const result = await db.query('SELECT id, nome, email, papel FROM usuarios');
    res.json({
      total: result.rows.length,
      usuarios: result.rows
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/test/viagens', async (req, res) => {
  try {
    const db = require('./config/database');
    const result = await db.query(`
      SELECT v.*, l.nome as linha_nome 
      FROM viagens v
      INNER JOIN linhas l ON v.linha_id = l.id
    `);
    res.json({
      total: result.rows.length,
      viagens: result.rows
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 🔧 ENDPOINT TEMPORÁRIO - Gerar hash correto
app.post('/dev/gerar-hash', async (req, res) => {
  const bcrypt = require('bcrypt');
  const { senha } = req.body;

  if (!senha) {
    return res.status(400).json({ error: 'Informe a senha no corpo da requisição' });
  }

  const hash = await bcrypt.hash(senha, 10);

  res.json({
    senha,
    hash,
    tamanho: hash.length
  });
});

// 🧯 Tratamento global de erros
app.use((err, req, res, next) => {
  console.error('❌ Erro interno:', err.stack);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

const PORT = process.env.PORT || 3000;

// 🚀 Inicialização do servidor
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════╗
║         🚌 UniTrans Backend 🚌           ║
╚═══════════════════════════════════════════╝

✅ Servidor rodando na porta ${PORT}
🌍 Ambiente: ${process.env.NODE_ENV}
📡 API: http://localhost:${PORT}
🏥 Health: http://localhost:${PORT}/health

💡 Para parar: Ctrl + C
  `);
});