require('dotenv').config();
const fs = require('fs');
const path = require('path');
const db = require('../config/database');

async function runMigrations() {
  console.log('\n🔄 Iniciando migrations...\n');
  
  try {
    // Ler arquivo SQL
    const schemaPath = path.join(__dirname, '../sql/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Executar
    console.log('📝 Criando tabelas...');
    await db.query(schema);
    
    console.log('✅ Migrations executadas com sucesso!\n');
    
    // Verificar tabelas criadas
    const result = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    console.log('📋 Tabelas criadas:');
    result.rows.forEach(row => {
      console.log('  ✓', row.table_name);
    });
    
    console.log('\n');
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Erro ao executar migrations:', error.message);
    console.error('\nDetalhes:', error);
    process.exit(1);
  }
}

runMigrations();