const axios = require('axios');

async function testPassenger() {
  console.log('\n🎓 Testando Rotas do Passageiro...\n');

  try {
    // 1. Fazer login
    console.log('1️⃣ Fazendo login como passageiro...');
    const login = await axios.post('http://localhost:3000/api/auth/login', {
      email: 'carlos@estudante.com',
      senha: 'pass123'
    });
    
    const token = login.data.accessToken;
    console.log('✅ Login OK! Token:', token.substring(0, 30) + '...\n');
    
    const config = {
      headers: { Authorization: `Bearer ${token}` }
    };

    // 2. Ver perfil
    console.log('2️⃣ Buscando perfil...');
    const perfil = await axios.get('http://localhost:3000/api/passageiros/me', config);
    console.log('✅ Perfil:', perfil.data.profile.nome);
    console.log('   Linha:', perfil.data.profile.linha);
    console.log('   Ponto:', perfil.data.profile.ponto_padrao, '\n');

    // 3. Ver viagem do dia
    console.log('3️⃣ Buscando viagem do dia...');
    const viagem = await axios.get('http://localhost:3000/api/passageiros/viagem-hoje', config);
    console.log('✅ Viagem encontrada!');
    console.log('   Linha:', viagem.data.viagem.linha.nome);
    console.log('   Status:', viagem.data.viagem.status);
    console.log('   Motorista:', viagem.data.motorista.nome);
    console.log('   Total passageiros:', viagem.data.total_passageiros, '\n');

    // 4. Ver mensagens
    console.log('4️⃣ Buscando mensagens...');
    const mensagens = await axios.get('http://localhost:3000/api/passageiros/mensagens', config);
    console.log('✅ Mensagens:', mensagens.data.messages.length);
    if (mensagens.data.messages.length > 0) {
      console.log('   Última:', mensagens.data.messages[0].titulo, '\n');
    }

    console.log('🎉 TODOS OS TESTES DO PASSAGEIRO PASSARAM!\n');

  } catch (error) {
    console.error('\n❌ ERRO:');
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Dados:', error.response.data);
    } else {
      console.error('   Mensagem:', error.message);
    }
  }
}

testPassenger();