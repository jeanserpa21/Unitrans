const axios = require('axios');

async function testarLogin() {
  console.log('\n🔐 Testando Login...\n');

  try {
    // Teste 1: Login Admin
    console.log('1️⃣ Testando login como ADMIN...');
    console.log('   Email: admin@unitrans.com');
    console.log('   Senha: admin123');
    
    const admin = await axios.post('http://localhost:3000/api/auth/login', {
      email: 'admin@unitrans.com',
      senha: 'admin123'
    });
    
    console.log('✅ Login Admin OK!');
    console.log('   Nome:', admin.data.user.nome);
    console.log('   Papel:', admin.data.user.papel);
    console.log('   Token:', admin.data.accessToken.substring(0, 50) + '...\n');

    // Teste 2: Login Motorista
    console.log('2️⃣ Testando login como MOTORISTA...');
    const motorista = await axios.post('http://localhost:3000/api/auth/login', {
      email: 'joao.motorista@unitrans.com',
      senha: 'moto123'
    });
    
    console.log('✅ Login Motorista OK!');
    console.log('   Nome:', motorista.data.user.nome);
    console.log('   Papel:', motorista.data.user.papel);
    console.log('   Token:', motorista.data.accessToken.substring(0, 50) + '...\n');

    // Teste 3: Login Passageiro
    console.log('3️⃣ Testando login como PASSAGEIRO...');
    const passageiro = await axios.post('http://localhost:3000/api/auth/login', {
      email: 'carlos@estudante.com',
      senha: 'pass123'
    });
    
    console.log('✅ Login Passageiro OK!');
    console.log('   Nome:', passageiro.data.user.nome);
    console.log('   Papel:', passageiro.data.user.papel);
    console.log('   Token:', passageiro.data.accessToken.substring(0, 50) + '...\n');

    // Teste 4: Acessar rota protegida
    console.log('4️⃣ Testando rota protegida (perfil)...');
    const perfil = await axios.get('http://localhost:3000/api/auth/profile', {
      headers: {
        'Authorization': `Bearer ${admin.data.accessToken}`
      }
    });
    
    console.log('✅ Rota protegida OK!');
    console.log('   Perfil:', perfil.data.user.nome, '-', perfil.data.user.email);

    console.log('\n🎉 TODOS OS TESTES PASSARAM!\n');

  } catch (error) {
    console.error('\n❌ ERRO DETALHADO:');
    console.error('   Mensagem:', error.message);
    
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Dados:', error.response.data);
    } else if (error.request) {
      console.error('   Servidor não respondeu');
      console.error('   Verifique se o servidor está rodando em http://localhost:3000');
    } else {
      console.error('   Erro ao fazer requisição:', error.message);
    }
    
    console.log('\n💡 DICAS:');
    console.log('   1. Verifique se o servidor está rodando: npm run dev');
    console.log('   2. Verifique se as senhas foram atualizadas: node scripts/update-passwords.js');
    console.log('   3. Verifique se o banco está rodando: docker ps\n');
  }
}

testarLogin();