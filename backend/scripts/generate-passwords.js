const bcrypt = require('bcrypt');

async function generatePasswords() {
  console.log('\n🔑 Gerando hashes de senhas...\n');

  const senhas = [
    { nome: 'Admin', senha: 'admin123' },
    { nome: 'Motorista', senha: 'moto123' },
    { nome: 'Passageiro', senha: 'pass123' }
  ];

  for (const item of senhas) {
    const hash = await bcrypt.hash(item.senha, 10);
    console.log(`${item.nome} (${item.senha}):`);
    console.log(`'${hash}'\n`);
  }
}

generatePasswords();