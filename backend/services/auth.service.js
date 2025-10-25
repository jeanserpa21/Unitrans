const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

/**
 * Fazer login (com logs)
 */
const login = async (email, senha) => {
  console.log('🔍 Tentando login com:', email);

  // Buscar usuário
  const query = `
    SELECT 
      u.id,
      u.nome,
      u.email,
      u.senha_hash,
      u.papel,
      u.ativo,
      p.id as passageiro_id,
      p.aprovado,
      m.id as motorista_id
    FROM usuarios u
    LEFT JOIN passageiros p ON u.id = p.usuario_id
    LEFT JOIN motoristas m ON u.id = m.usuario_id
    WHERE LOWER(u.email) = LOWER($1)
  `;

  const result = await db.query(query, [email]);
  console.log('📊 Usuários encontrados:', result.rows.length);

  if (result.rows.length === 0) {
    console.log('❌ Usuário não encontrado');
    throw new Error('EMAIL_NAO_ENCONTRADO');
  }

  const user = result.rows[0];
  console.log('👤 Usuário:', user.nome);
  console.log('📩 E-mail no banco:', user.email);
  console.log('🔑 Hash do banco:', user.senha_hash ? user.senha_hash.substring(0, 20) + '...' : 'NULO');
  console.log('🔑 Senha digitada:', senha);

  // Verificar se está ativo
  if (!user.ativo) {
    console.log('⚠️ Usuário inativo');
    throw new Error('USUARIO_INATIVO');
  }

  // Comparar senha
  const senhaValida = await bcrypt.compare(senha, user.senha_hash);
  console.log('✅ Senha válida?', senhaValida);

  if (!senhaValida) {
    console.log('❌ Senha inválida');
    throw new Error('SENHA_INVALIDA');
  }

  // Verificar aprovação (se for passageiro)
  if (user.papel === 'PASSAGEIRO') {
    console.log('🧾 Papel: PASSAGEIRO | Aprovado:', user.aprovado);
    if (!user.aprovado) {
      console.log('⚠️ Conta aguardando aprovação');
      throw new Error('AGUARDANDO_APROVACAO');
    }
  }

  // Gerar token JWT
  const payload = { userId: user.id, papel: user.papel };
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

  console.log('🎫 Token gerado para:', user.email);
  console.log('-----------------------------');

  return {
    token,
    user: {
      id: user.id,
      nome: user.nome,
      email: user.email,
      papel: user.papel,
      passageiro_id: user.passageiro_id,
      motorista_id: user.motorista_id,
      aprovado: user.aprovado
    }
  };
};

/**
 * Registrar novo passageiro
 */
const register = async (dadosCadastro) => {
  const client = await db.getClient();

  try {
    await client.query('BEGIN');

    const {
      nome,
      cpf,
      email,
      telefone,
      universidade_id,
      curso,
      dias_transporte,
      senha,
      documento_identidade,
      comprovante_matricula,
      foto_3x4
    } = dadosCadastro;

    console.log('📝 Tentando registrar novo passageiro:', email);

    // Verificar duplicidade de e-mail e CPF
    const emailCheck = await client.query('SELECT id FROM usuarios WHERE email = $1', [email]);
    if (emailCheck.rows.length > 0) {
      console.log('❌ E-mail já cadastrado');
      throw new Error('EMAIL_JA_CADASTRADO');
    }

    const cpfCheck = await client.query('SELECT id FROM passageiros WHERE cpf = $1', [cpf]);
    if (cpfCheck.rows.length > 0) {
      console.log('❌ CPF já cadastrado');
      throw new Error('CPF_JA_CADASTRADO');
    }

    // Criar hash da senha
    const senhaHash = await bcrypt.hash(senha, 10);
    console.log('🔐 Hash gerado:', senhaHash.substring(0, 20) + '...');

    // Inserir usuário
    const userResult = await client.query(
      `INSERT INTO usuarios (nome, email, senha_hash, papel, ativo)
       VALUES ($1, $2, $3, 'PASSAGEIRO', true)
       RETURNING id`,
      [nome, email, senhaHash]
    );
    const userId = userResult.rows[0].id;
    console.log('✅ Usuário criado com ID:', userId);

    // Inserir passageiro
    const passengerResult = await client.query(
      `INSERT INTO passageiros (
        usuario_id,
        cpf,
        telefone,
        universidade_id,
        curso,
        dias_transporte,
        documento_identidade_url,
        comprovante_matricula_url,
        foto_url,
        aprovado
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,false)
      RETURNING id`,
      [
        userId,
        cpf,
        telefone,
        universidade_id,
        curso,
        JSON.stringify(dias_transporte),
        documento_identidade,
        comprovante_matricula,
        foto_3x4
      ]
    );
    console.log('✅ Passageiro criado com ID:', passengerResult.rows[0].id);

    await client.query('COMMIT');
    console.log('🎉 Registro concluído com sucesso!\n-----------------------------');

    return {
      success: true,
      message: 'Cadastro realizado com sucesso! Aguarde aprovação do administrador.',
      userId: userId,
      passageiroId: passengerResult.rows[0].id
    };
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Erro no registro:', error.message);
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Buscar universidades
 */
const getUniversidades = async () => {
  const result = await db.query('SELECT id, nome, cidade FROM universidades ORDER BY nome');
  return result.rows;
};

module.exports = {
  login,
  register,
  getUniversidades
};
