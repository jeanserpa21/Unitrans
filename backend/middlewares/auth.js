const jwt = require('jsonwebtoken');

/**
 * Middleware para verificar token JWT
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  // 🔄 Substituído conforme solicitado
  jwt.verify(token, process.env.JWT_SECRET || 'seu_secret_aqui', (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido' });
    }

    // Normalizar: userId -> id
    req.user = {
      id: decoded.userId || decoded.id,
      papel: decoded.papel,
      ...decoded
    };

    next();
  });
};

/**
 * Middleware para verificar se é admin
 */
const isAdmin = (req, res, next) => {
  if (req.user.papel !== 'ADM') {
    return res.status(403).json({ error: 'Acesso negado. Apenas administradores.' });
  }
  next();
};

/**
 * Middleware para verificar se é motorista
 */
const isMotorista = (req, res, next) => {
  if (req.user.papel !== 'MOTORISTA') {
    return res.status(403).json({ error: 'Acesso negado. Apenas motoristas.' });
  }
  next();
};

/**
 * Middleware para verificar se é passageiro
 */
const isPassageiro = (req, res, next) => {
  if (req.user.papel !== 'PASSAGEIRO') {
    return res.status(403).json({ error: 'Acesso negado. Apenas passageiros.' });
  }
  next();
};

module.exports = {
  authenticateToken,
  isAdmin,
  isMotorista,
  isPassageiro
};
