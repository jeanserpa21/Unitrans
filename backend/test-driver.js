const axios = require('axios');

async function testDriver() {
  console.log('\n🚗 Testando Rotas do Motorista...\n');

  try {
    // Login
    console.log('1️⃣ Fazendo login como motorista...');
    console.log('   URL: http://localhost:3000/api/auth/login');
    console.log('   Email: joao.motorista@unitrans.com');
    
    const login = await axios.post('http://localhost:3000/api/auth/login', {
      email: 'joao.motorista@unitrans.com',
      senha: 'moto123'
    });
    
    const token = login.data.accessToken;
    console.log('✅ Login OK! Motorista:', login.data.user.nome);
    console.log('   Token:', token.substring(0, 30) + '...\n');
    
    const config = { headers: { Authorization: `Bearer ${token}` } };

    // Ver viagem
    console.log('2️⃣ Buscando viagem do dia...');
    const viagem = await axios.get('http://localhost:3000/api/motoristas/viagem-hoje', config);
    console.log('✅ Viagem encontrada!');
    console.log('   Linha:', viagem.data.linha_nome);
    console.log('   Status:', viagem.data.status);
    console.log('   Total planejado:', viagem.data.total_planejado);
    console.log('   Embarcados:', viagem.data.total_embarcados);
    
    console.log('\n   📋 Lista de passageiros (ordenados por ponto):');
    viagem.data.passageiros.forEach(p => {
      console.log(`      ${p.ponto_ordem}. ${p.nome} - ${p.ponto} [${p.status}]`);
    });
    console.log();

    const viagemId = viagem.data.id;
    const statusAtual = viagem.data.status;

    // Iniciar viagem
    if (statusAtual === 'PLANEJADA') {
      console.log('3️⃣ Iniciando viagem...');
      const inicio = await axios.post('http://localhost:3000/api/motoristas/iniciar-viagem', {}, config);
      console.log('✅ Viagem iniciada!');
      console.log('   Mensagem:', inicio.data.message);
      console.log('   Token QR:', inicio.data.viagem.token.substring(0, 40) + '...');
      console.log('   ⚠️  Agora passageiros podem fazer check-in!\n');
    } else if (statusAtual === 'EM_ANDAMENTO') {
      console.log('3️⃣ ⚠️  Viagem já está em andamento\n');
    } else {
      console.log('3️⃣ ⚠️  Viagem já finalizada\n');
    }

    // Histórico
    console.log('4️⃣ Buscando histórico...');
    const historico = await axios.get('http://localhost:3000/api/motoristas/historico', config);
    console.log('✅ Histórico:', historico.data.viagens.length, 'viagens');
    if (historico.data.viagens.length > 0) {
      const ultima = historico.data.viagens[0];
      console.log('   Última viagem:', ultima.data, '-', ultima.status);
    }
    console.log();

    console.log('🎉 TODOS OS TESTES DO MOTORISTA PASSARAM!\n');

  } catch (error) {
    console.error('\n❌ ERRO DETALHADO:');
    console.error('   Mensagem:', error.message);
    
    if (error.response) {
      console.error('   Status HTTP:', error.response.status);
      console.error('   Dados da resposta:', JSON.stringify(error.response.data, null, 2));
      console.error('   URL chamada:', error.config?.url);
    } else if (error.request) {
      console.error('   ⚠️  Servidor não respondeu!');
      console.error('   Verifique se o servidor está rodando');
    } else {
      console.error('   Erro ao configurar requisição:', error.message);
    }
    
    console.log('\n💡 VERIFICAÇÕES:');
    console.log('   1. O servidor está rodando? Execute: npm run dev');
    console.log('   2. O servidor está em http://localhost:3000 ?');
    console.log('   3. As rotas foram adicionadas ao server.js?');
    console.log();
  }
}

testDriver();