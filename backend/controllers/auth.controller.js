const authService = require('../services/auth.service');

/**
 * Login
 */
exports.login = async (req, res) => {
  try {
    const { email, senha } = req.body;

    // Log detalhado da tentativa de login (sem expor senha)
    console.log('🔐 [AUTH][LOGIN] Tentativa de login recebida:', {
      email: email || '[sem email]',
      senha: senha ? '***mascarada***' : '[sem senha]',
      ip: req.ip,
      userAgent: req.headers['user-agent'] || '[sem user-agent]',
      data: new Date().toISOString(),
    });

    // Validação básica
    if (!email || !senha) {
      console.log('❌ [AUTH][LOGIN] Falha de validação: email/senha ausentes');
      return res
        .status(400)
        .json({ error: 'Email e senha são obrigatórios' });
    }

    const result = await authService.login(email, senha);

    console.log('✅ [AUTH][LOGIN] Sucesso de login:', {
      email,
      papel: result?.user?.papel || '[sem papel]',
      idUsuario: result?.user?.id || '[sem id]',
    });

    return res.json(result);
  } catch (error) {
    // Log completo do erro
    console.error('🔥 [AUTH][LOGIN] Erro durante o login:', {
      message: error.message,
      stack: error.stack,
      data: new Date().toISOString(),
    });

    if (error.message === 'EMAIL_NAO_ENCONTRADO') {
      return res.status(401).json({ error: 'Email ou senha inválidos' });
    }

    if (error.message === 'SENHA_INVALIDA') {
      return res.status(401).json({ error: 'Email ou senha inválidos' });
    }

    if (error.message === 'USUARIO_INATIVO') {
      return res.status(403).json({ error: 'Usuário inativo' });
    }

    if (error.message === 'AGUARDANDO_APROVACAO') {
      return res.status(403).json({
        error: 'Sua conta está aguardando aprovação do administrador',
      });
    }

    return res.status(500).json({ error: 'Erro ao fazer login' });
  }
};

/**
 * Registrar novo passageiro
 */
exports.register = async (req, res) => {
  try {
    // Log não sensível do payload
    const {
      nome,
      cpf,
      email,
      telefone,
      universidade_id,
      curso,
      dias_transporte,
      senha, // não vamos logar a senha
      documento_identidade,
      comprovante_matricula,
      foto_3x4,
    } = req.body;

    console.log('📝 [AUTH][REGISTER] Dados recebidos do frontend:');
    console.log(
      JSON.stringify(
        {
          nome,
          cpf,
          email,
          telefone,
          universidade_id,
          curso,
          dias_transporte,
          senha: senha ? '***mascarada***' : 'undefined',
          documento_identidade: documento_identidade ? '[presente]' : '[ausente]',
          comprovante_matricula: comprovante_matricula ? '[presente]' : '[ausente]',
          foto_3x4: foto_3x4 ? '[presente]' : '[ausente]',
        },
        null,
        2
      )
    );

    // Validações básicas
    if (!nome || !cpf || !email || !telefone) {
      console.log('❌ [AUTH][REGISTER] Dados pessoais incompletos');
      return res
        .status(400)
        .json({ error: 'Dados pessoais incompletos' });
    }

    if (!universidade_id || !curso || !dias_transporte || dias_transporte.length === 0) {
      console.log('❌ [AUTH][REGISTER] Informações acadêmicas incompletas');
      return res
        .status(400)
        .json({ error: 'Informações acadêmicas incompletas' });
    }

    if (!senha || senha.length < 6) {
      console.log('❌ [AUTH][REGISTER] Senha muito curta');
      return res
        .status(400)
        .json({ error: 'Senha deve ter no mínimo 6 caracteres' });
    }

    if (!documento_identidade || !comprovante_matricula || !foto_3x4) {
      console.log('❌ [AUTH][REGISTER] Documentos obrigatórios ausentes');
      return res
        .status(400)
        .json({ error: 'Todos os documentos são obrigatórios' });
    }

    // Validar CPF (formato básico)
    const cpfLimpo = cpf.replace(/\D/g, '');
    if (cpfLimpo.length !== 11) {
      console.log('❌ [AUTH][REGISTER] CPF inválido');
      return res.status(400).json({ error: 'CPF inválido' });
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('❌ [AUTH][REGISTER] Email inválido');
      return res.status(400).json({ error: 'Email inválido' });
    }

    const result = await authService.register(req.body);

    console.log('✅ [AUTH][REGISTER] Cadastro realizado com sucesso para:', email);
    return res.status(201).json(result);
  } catch (error) {
    console.error('🔥 [AUTH][REGISTER] Erro:', {
      message: error.message,
      stack: error.stack,
    });

    if (error.message === 'EMAIL_JA_CADASTRADO') {
      return res.status(400).json({ error: 'Este email já está cadastrado' });
    }

    if (error.message === 'CPF_JA_CADASTRADO') {
      return res.status(400).json({ error: 'Este CPF já está cadastrado' });
    }

    return res.status(500).json({ error: 'Erro ao realizar cadastro' });
  }
};

/**
 * Buscar universidades
 */
exports.getUniversidades = async (req, res) => {
  try {
    const universidades = await authService.getUniversidades();
    return res.json({ universidades });
  } catch (error) {
    console.error('🔥 [AUTH][UNIVERSIDADES] Erro:', {
      message: error.message,
      stack: error.stack,
    });
    return res.status(500).json({ error: 'Erro ao buscar universidades' });
  }
};

/**
 * Ver perfil do usuário logado
 */
exports.getProfile = async (req, res) => {
  try {
    return res.json({ user: req.user });
  } catch (error) {
    console.error('🔥 [AUTH][PROFILE] Erro:', {
      message: error.message,
      stack: error.stack,
    });
    return res.status(500).json({ error: 'Erro ao buscar perfil' });
  }
};

/**
 * Logout
 */
exports.logout = async (req, res) => {
  return res.json({ message: 'Logout realizado com sucesso' });
};
