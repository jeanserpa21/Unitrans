const authService = require('../services/auth.service');

/**
 * Login
 */
exports.login = async (req, res) => {
  try {
    const { email, senha } = req.body;
    
    // Validar dados
    if (!email || !senha) {
      return res.status(400).json({ 
        error: 'Email e senha são obrigatórios' 
      });
    }
    
    // Fazer login
    const result = await authService.login(email, senha);
    
    return res.json(result);
    
  } catch (error) {
    console.error('Erro no login:', error);
    
    // Tratar erros específicos
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
        error: 'Sua conta está aguardando aprovação do administrador' 
      });
    }
    
    return res.status(500).json({ error: 'Erro ao fazer login' });
  }
};

/**
 * Ver perfil do usuário logado
 */
exports.getProfile = async (req, res) => {
  try {
    return res.json({ user: req.user });
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    return res.status(500).json({ error: 'Erro ao buscar perfil' });
  }
};

/**
 * Logout (apenas retorna sucesso - token é deletado no frontend)
 */
exports.logout = async (req, res) => {
  return res.json({ message: 'Logout realizado com sucesso' });
};