const fetch = require('node-fetch');

async function testarCadastro() {
  try {
    const dados = {
      nome: 'Teste Usuario',
      cpf: '99999999999',
      email: 'teste@teste.com',
      telefone: '(47) 99999-9999',
      universidade_id: 1,
      curso: 'Engenharia de Teste',
      dias_transporte: ['SEG', 'TER', 'QUA'],
      senha: 'senha123',
      documento_identidade: 'data:image/png;base64,test',
      comprovante_matricula: 'data:image/png;base64,test',
      foto_3x4: 'data:image/png;base64,test'
    };

    console.log('📝 Testando cadastro...');
    
    const response = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados)
    });

    console.log('Status:', response.status);
    
    const data = await response.json();
    console.log('Response:', data);

  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

testarCadastro();