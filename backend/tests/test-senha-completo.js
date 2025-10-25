const bcrypt = require('bcrypt');
const db = require('../config/database');

async function testar() {
  try {
    // 1. Buscar hash do banco
    const result = await db.query(
      "SELECT email, senha_hash FROM usuarios WHERE email = 'carlos@estudante.com'"
    );
    
    console.log('Usuário encontrado:', result.rows.length);
    
    if (result.rows.length === 0) {
      console.log('❌ Usuário não existe!');
      return;
    }
    
    const hashDoBanco = result.rows[0].senha_hash;
    console.log('Hash do banco:', hashDoBanco);
    
    // 2. Hash que deveria estar
    const hashCorreto = '$2b$10$OU.Gs66W74NecF1012P6OuXIzMuyCVhr/KQUalegjqPikrA.DWIKK';
    console.log('Hash correto:  ', hashCorreto);
    console.log('São iguais?', hashDoBanco === hashCorreto);
    
    // 3. Testar senha
    const senhaDigitada = 'senha123';
    const resultado = await bcrypt.compare(senhaDigitada, hashDoBanco);
    console.log('\n✅ Senha "senha123" funciona?', resultado);
    
    // 4. Testar com hash correto
    const resultadoCorreto = await bcrypt.compare(senhaDigitada, hashCorreto);
    console.log('✅ Com hash correto funciona?', resultadoCorreto);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }
}

testar();