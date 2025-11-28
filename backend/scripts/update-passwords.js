require('dotenv').config();
const bcrypt = require('bcrypt');
const db = require('../config/database');

async function updatePasswords() {
  console.log('\n🔑 Atualizando senhas no banco...\n');

  try {
    // Gerar hashes
    console.log('Gerando hashes...');
    const adminHash = await bcrypt.hash('admin123', 10);
    const motoHash = await bcrypt.hash('moto123', 10);
    const passHash = await bcrypt.hash('pass123', 10);

    console.log('✅ Hashes gerados\n');

    // Atualizar Admin
    const admin = await db.query(
      'UPDATE usuarios SET senha_hash = $1 WHERE email = $2 RETURNING nome',
      [adminHash, 'admin@unitrans.com']
    );
    console.log('✅ Senha do Admin atualizada:', admin.rows[0]?.nome || 'OK');

    // Atualizar Motoristas (SEM COUNT)
    const moto = await db.query(
      'UPDATE usuarios SET senha_hash = $1 WHERE papel = $2',
      [motoHash, 'MOTORISTA']
    );
    console.log('✅ Senhas dos Motoristas atualizadas (' + moto.rowCount + ' usuários)');

    // Atualizar Passageiros (SEM COUNT)
    const pass = await db.query(
      'UPDATE usuarios SET senha_hash = $1 WHERE papel = $2',
      [passHash, 'PASSAGEIRO']
    );
    console.log('✅ Senhas dos Passageiros atualizadas (' + pass.rowCount + ' usuários)');

    console.log('\n🎉 Todas as senhas foram atualizadas!\n');
    
    // Testar login
    console.log('🧪 Testando login do Admin...\n');
    const AuthService = require('../services/auth.service');
    
    try {
      const result = await AuthService.login('admin@unitrans.com', 'admin123');
      
      console.log('✅ ✅ ✅ LOGIN FUNCIONOU! ✅ ✅ ✅');
      console.log('\nDados do usuário:');
      console.log('   Nome:', result.user.nome);
      console.log('   Email:', result.user.email);
      console.log('   Papel:', result.user.papel);
      console.log('\nToken gerado:', result.accessToken.substring(0, 50) + '...');
      console.log('\n🎊 TUDO PRONTO PARA USAR! 🎊\n');
      
    } catch (loginError) {
      console.error('❌ Login ainda não funcionou:', loginError.message);
      console.error('\nVamos verificar o que está no banco...\n');
      
      const check = await db.query(
        'SELECT nome, email, substring(senha_hash, 1, 20) as hash_preview FROM usuarios WHERE email = $1',
        ['admin@unitrans.com']
      );
      console.log('Usuário no banco:', check.rows[0]);
    }

    process.exit(0);

  } catch (error) {
    console.error('\n❌ Erro:', error.message);
    console.error(error);
    process.exit(1);
  }
}

updatePasswords();