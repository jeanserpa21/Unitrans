require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const app = express();

// Middlewares
app.use(helmet());
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// IMPORTAR ROTAS (PRIMEIRO IMPORTA, DEPOIS USA!)
const authRoutes = require('./routes/auth.routes');
const passengerRoutes = require('./routes/passenger.routes');
const driverRoutes = require('./routes/driver.routes');
const adminRoutes = require('./routes/admin.routes');

// USAR ROTAS (AGORA SIM PODE USAR!)
app.use('/api/auth', authRoutes);
app.use('/api/passageiros', passengerRoutes);
app.use('/api/motoristas', driverRoutes);
app.use('/api/admin', adminRoutes);

// Rota principal
app.get('/', (req, res) => {
  res.json({ 
    message: '🚌 UniTrans API está funcionando!',
    timestamp: new Date().toISOString(),
    status: 'online'
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK',
    database: 'connected',
    timestamp: new Date().toISOString()
  });
});

// Rotas de teste (se você tiver)
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

// Error handler
app.use((err, req, res, next) => {
  console.error('❌ Erro:', err.stack);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

const PORT = process.env.PORT || 3000;

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