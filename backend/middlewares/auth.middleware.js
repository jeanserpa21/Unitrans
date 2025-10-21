const jwt = require('jsonwebtoken');
const db = require('../config/database');

/**
 * Middleware de autenticação
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }
    
    const token = authHeader.split(' ')[1];
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Buscar usuário no banco
      const query = `
        SELECT 
          u.id,
          u.nome,
          u.email,
          u.papel,
          u.foto_url,
          u.ativo,
          p.id as passageiro_id,
          m.id as motorista_id
        FROM usuarios u
        LEFT JOIN passageiros p ON u.id = p.usuario_id
        LEFT JOIN motoristas m ON u.id = m.usuario_id
        WHERE u.id = $1 AND u.ativo = true
      `;
      
      const result = await db.query(query, [decoded.userId]);
      
      if (result.rows.length === 0) {
        return res.status(401).json({ error: 'Usuário não encontrado ou inativo' });
      }
      
      req.user = result.rows[0];
      next();
      
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token expirado' });
      }
      return res.status(401).json({ error: 'Token inválido' });
    }
    
  } catch (error) {
    console.error('Erro no middleware de autenticação:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

/**
 * Middleware de autorização por papel
 */
const authorize = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }
    
    if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.papel)) {
      return res.status(403).json({ 
        error: 'Acesso negado. Você não tem permissão.' 
      });
    }
    
    next();
  };
};

module.exports = { authenticate, authorize };