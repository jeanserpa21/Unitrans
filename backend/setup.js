const db = require('./config/database');
const fs = require('fs');
const path = require('path');

async function setup() {
  try {
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

    console.log('🎉 Setup concluído com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro no setup:', error);
    process.exit(1);
  }
}

setup();