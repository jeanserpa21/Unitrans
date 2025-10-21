require('dotenv').config();
const fs = require('fs');
const path = require('path');
const db = require('../config/database');

async function runSeed() {
  console.log('\n🌱 Iniciando seed (dados de teste)...\n');
  
  try {
    const seedPath = path.join(__dirname, '../sql/seed.sql');
    const seed = fs.readFileSync(seedPath, 'utf8');
    
    console.log('📝 Inserindo dados de teste...');
    await db.query(seed);
    
    console.log('✅ Seed executado com sucesso!\n');
    
    // Mostrar resumo
    console.log('📊 Resumo dos dados:');
    
    const usuarios = await db.query('SELECT COUNT(*) FROM usuarios');
    console.log('  👥 Usuários:', usuarios.rows[0].count);
    
    const passageiros = await db.query('SELECT COUNT(*) FROM passageiros');
    console.log('  🎓 Passageiros:', passageiros.rows[0].count);
    
    const motoristas = await db.query('SELECT COUNT(*) FROM motoristas');
    console.log('  🚗 Motoristas:', motoristas.rows[0].count);
    
    const linhas = await db.query('SELECT COUNT(*) FROM linhas');
    console.log('  🚌 Linhas:', linhas.rows[0].count);
    
    const viagens = await db.query('SELECT COUNT(*) FROM viagens');
    console.log('  📅 Viagens:', viagens.rows[0].count);
    
    console.log('\n🔑 Contas de teste:');
    console.log('  Admin: admin@unitrans.com / admin123');
    console.log('  Motorista: joao.motorista@unitrans.com / moto123');
    console.log('  Passageiro: carlos@estudante.com / pass123');
    console.log('\n');
    
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Erro ao executar seed:', error.message);
    console.error('\nDetalhes:', error);
    process.exit(1);
  }
}

runSeed();