import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { User, Lock, AlertCircle } from 'lucide-react';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    senha: ''
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(formData.email, formData.senha);
      
      if (user.papel === 'ADM') {
        navigate('/admin');
      } else if (user.papel === 'MOTORISTA') {
        navigate('/motorista');
      } else if (user.papel === 'PASSAGEIRO') {
        navigate('/passageiro');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = (email, senha) => {
    setFormData({ email, senha });
  };

  return (
    <div className="min-h-screen bg-unitrans-dark flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo e Cabeçalho */}
        <div className="text-center mb-8">
          <div className="bg-unitrans-light w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl">
            <span className="text-5xl font-bold text-unitrans-dark">U</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Unitrans</h1>
          <p className="text-unitrans-light text-sm">
            Facilidade para quem estuda, pontualidade para quem precisa!
          </p>
        </div>

        {/* Card de Login */}
        <div className="bg-unitrans-light rounded-3xl shadow-2xl p-8">
          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 bg-red-100 border-2 border-red-300 rounded-xl flex items-start">
              <AlertCircle size={20} className="text-red-600 mr-2 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800 font-medium">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <div className="relative">
                <User size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-unitrans-dark" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input pl-12"
                  placeholder="E-mail"
                  required
                />
              </div>
            </div>

            <div>
              <div className="relative">
                <Lock size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-unitrans-dark" />
                <input
                  type="password"
                  value={formData.senha}
                  onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                  className="input pl-12"
                  placeholder="Senha"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full py-4 text-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-700 text-sm">
              Não tem conta?{' '}
              <button className="text-unitrans-dark font-bold hover:underline">
                Cadastre-se
              </button>
            </p>
          </div>
        </div>

        {/* Login Rápido para Testes */}
        <div className="mt-6 bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
          <p className="text-white text-xs font-semibold mb-3 text-center">
            🧪 Acesso Rápido (Teste):
          </p>
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => quickLogin('admin@unitrans.com', 'admin123')}
              className="w-full text-left px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 text-sm transition"
            >
              👨‍💼 <strong>Admin</strong>
            </button>
            <button
              type="button"
              onClick={() => quickLogin('joao.motorista@unitrans.com', 'moto123')}
              className="w-full text-left px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 text-sm transition"
            >
              🚗 <strong>Motorista</strong>
            </button>
            <button
              type="button"
              onClick={() => quickLogin('carlos@estudante.com', 'pass123')}
              className="w-full text-left px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 text-sm transition"
            >
              🎓 <strong>Passageiro</strong>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;