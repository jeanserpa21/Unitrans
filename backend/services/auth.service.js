const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

class AuthService {
  /**
   * Realiza login e retorna token JWT
   */
  async login(email, senha) {
    // Buscar usuário
    const query = `
      SELECT 
        u.id,
        u.nome,
        u.email,
        u.senha_hash,
        u.papel,
        u.foto_url,
        u.ativo,
        p.id as passageiro_id,
        p.aprovado,
        m.id as motorista_id
      FROM usuarios u
      LEFT JOIN passageiros p ON u.id = p.usuario_id
      LEFT JOIN motoristas m ON u.id = m.usuario_id
      WHERE u.email = $1
    `;
    
    const result = await db.query(query, [email]);
    
    if (result.rows.length === 0) {
      throw new Error('EMAIL_NAO_ENCONTRADO');
    }
    
    const user = result.rows[0];
    
    // Verificar se usuário está ativo
    if (!user.ativo) {
      throw new Error('USUARIO_INATIVO');
    }
    
    // Verificar senha
    const senhaValida = await bcrypt.compare(senha, user.senha_hash);
    
    if (!senhaValida) {
      throw new Error('SENHA_INVALIDA');
    }
    
    // Verificar aprovação para passageiros
    if (user.papel === 'PASSAGEIRO' && !user.aprovado) {
      throw new Error('AGUARDANDO_APROVACAO');
    }
    
    // Gerar token
    const accessToken = this.generateToken(user);
    
    return {
      accessToken,
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        papel: user.papel,
        foto_url: user.foto_url,
        passageiro_id: user.passageiro_id,
        motorista_id: user.motorista_id
      }
    };
  }

  /**
   * Gera token JWT
   */
  generateToken(user) {
    return jwt.sign(
      {
        userId: user.id,
        email: user.email,
        papel: user.papel
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
  }

  /**
   * Verifica se o token é válido
   */
  verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      throw new Error('TOKEN_INVALIDO');
    }
  }
}

module.exports = new AuthService();