const bcrypt = require('bcrypt');

async function generateHashes() {
  const senha = 'senha123';
  const hash = await bcrypt.hash(senha, 10);
  
  console.log('=====================================');
  console.log('Hash para senha: senha123');
  console.log('=====================================');
  console.log(hash);
  console.log('=====================================');
  console.log('\nUse este hash no SQL ao invés do placeholder!');
}

generateHashes();