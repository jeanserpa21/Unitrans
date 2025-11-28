const axios = require('axios');

async function testAdmin() {
  console.log('\n👨‍💼 Testando Rotas do Admin...\n');

  try {
    // Login
    console.log('1️⃣ Fazendo login como admin...');
    const login = await axios.post('http://localhost:3000/api/auth/login', {
      email: 'admin@unitrans.com',
      senha: 'admin123'
    });
    
    const token = login.data.accessToken;
    console.log('✅ Login OK!\n');
    
    const config = { headers: { Authorization: `Bearer ${token}` } };

    // Dashboard
    console.log('2️⃣ Buscando dashboard...');
    const dashboard = await axios.get('http://localhost:3000/api/admin/dashboard', config);
    console.log('✅ Dashboard carregado!');
    console.log('   Estatísticas:');
    console.log('     - Linhas:', dashboard.data.estatisticas.total_linhas);
    console.log('     - Motoristas:', dashboard.data.estatisticas.total_motoristas);
    console.log('     - Passageiros ativos:', dashboard.data.estatisticas.passageiros_ativos);
    console.log('     - Aprovações pendentes:', dashboard.data.estatisticas.passageiros_pendentes, '\n');

    // Listar passageiros pendentes
    console.log('3️⃣ Listando passageiros pendentes...');
    const pendentes = await axios.get(
      'http://localhost:3000/api/admin/passageiros?aprovado=false',
      config
    );
    console.log('✅ Passageiros pendentes:', pendentes.data.total, '\n');

    // Listar motoristas
    console.log('4️⃣ Listando motoristas...');
    const motoristas = await axios.get('http://localhost:3000/api/admin/motoristas', config);
    console.log('✅ Motoristas:', motoristas.data.motoristas.length);
    motoristas.data.motoristas.forEach(m => {
      console.log(`     - ${m.nome} (CNH: ${m.cnh}) - ${m.linha_atual || 'Sem linha'}`);
    });
    console.log();

    // Listar linhas
    console.log('5️⃣ Listando linhas...');
    const linhas = await axios.get('http://localhost:3000/api/admin/linhas', config);
    console.log('✅ Linhas:', linhas.data.linhas.length);
    linhas.data.linhas.forEach(l => {
      console.log(`     - ${l.nome} (${l.total_pontos} pontos) - Motorista: ${l.motorista || 'Não atribuído'}`);
    });
    console.log();

    // Relatório de presença
    console.log('6️⃣ Gerando relatório de presença...');
    const hoje = new Date().toISOString().split('T')[0];
    const umMesAtras = new Date();
    umMesAtras.setDate(umMesAtras.getDate() - 30);
    const dataInicio = umMesAtras.toISOString().split('T')[0];
    
    const relatorio = await axios.get(
      `http://localhost:3000/api/admin/relatorios/presenca?dataInicio=${dataInicio}&dataFim=${hoje}`,
      config
    );
    console.log('✅ Relatório gerado!');
    if (relatorio.data.relatorio.length > 0) {
      relatorio.data.relatorio.forEach(r => {
        console.log(`     - ${r.linha}: ${r.taxa_presenca}% de presença`);
      });
    }
    console.log();

    console.log('🎉 TODOS OS TESTES DO ADMIN PASSARAM!\n');

  } catch (error) {
    console.error('\n❌ ERRO:');
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Dados:', error.response.data);
    } else {
      console.error('   Mensagem:', error.message);
    }
    console.log();
  }
}

testAdmin();