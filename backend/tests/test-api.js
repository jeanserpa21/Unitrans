const fetch = require('node-fetch');

async function testar() {
  try {
    // 1. Login
    console.log('1️⃣ Fazendo login...');
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'carlos@estudante.com',
        senha: 'senha123'
      })
    });
    
    const loginData = await loginResponse.json();
    console.log('Login Response:', loginData);
    
    const token = loginData.token;
    console.log('\n✅ Token:', token);
    
    // 2. Buscar perfil
    console.log('\n2️⃣ Buscando perfil...');
    const perfilResponse = await fetch('http://localhost:3000/api/passageiros/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log('Status:', perfilResponse.status);
    const perfilData = await perfilResponse.json();
    console.log('Perfil Response:', perfilData);
    
    // 3. Buscar auth profile
    console.log('\n3️⃣ Buscando auth profile...');
    const authResponse = await fetch('http://localhost:3000/api/auth/profile', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const authData = await authResponse.json();
    console.log('Auth Profile:', authData);
    
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

testar();