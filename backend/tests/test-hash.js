const bcrypt = require('bcrypt');

const senhaDigitada = 'senha123';
const hashDoBanco = 'COLE_O_HASH_AQUI'; // Cole o hash que você copiou

bcrypt.compare(senhaDigitada, hashDoBanco, (err, result) => {
  console.log('Senha correta?', result);
});