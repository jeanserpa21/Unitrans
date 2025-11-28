import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function DriverProfilePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    if (confirm('Deseja realmente sair?')) {
      logout();
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-700 to-gray-600 text-white p-6 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <button 
            onClick={() => navigate('/motorista')}
            className="text-gray-100 hover:text-white mb-2 flex items-center"
          >
            ← Voltar
          </button>
          <h1 className="text-2xl font-bold">👤 Perfil do Motorista</h1>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        
        {/* Card do Perfil */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Avatar e Info Principal */}
          <div className="bg-gradient-to-r from-gray-700 to-gray-600 p-8 text-white text-center">
            <div className="w-24 h-24 rounded-full bg-white mx-auto flex items-center justify-center text-gray-700 font-bold text-3xl shadow-lg">
              {user?.nome?.charAt(0) || 'M'}
            </div>
            <h2 className="text-2xl font-bold mt-4">{user?.nome}</h2>
            <p className="text-gray-200 mt-1">{user?.email}</p>
            <span className="inline-block mt-3 px-4 py-1 bg-white/20 rounded-full text-sm font-semibold">
              🚗 Motorista
            </span>
          </div>

          {/* Informações */}
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between py-3 border-b">
              <span className="text-gray-600">ID do Usuário</span>
              <span className="font-semibold">{user?.id}</span>
            </div>

            <div className="flex items-center justify-between py-3 border-b">
              <span className="text-gray-600">Email</span>
              <span className="font-semibold">{user?.email}</span>
            </div>

            <div className="flex items-center justify-between py-3 border-b">
              <span className="text-gray-600">Papel</span>
              <span className="font-semibold">{user?.papel}</span>
            </div>

            {user?.motorista_id && (
              <div className="flex items-center justify-between py-3 border-b">
                <span className="text-gray-600">ID do Motorista</span>
                <span className="font-semibold">{user.motorista_id}</span>
              </div>
            )}
          </div>
        </div>

        {/* Ações */}
        <div className="space-y-3">
          <button
            onClick={() => navigate('/motorista/historico')}
            className="w-full bg-white hover:bg-gray-50 border-2 border-gray-200 text-gray-700 font-semibold py-4 px-6 rounded-lg shadow transition flex items-center justify-center"
          >
            📜 Ver Histórico Completo
          </button>

          <button
            onClick={handleLogout}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-6 rounded-lg shadow transition"
          >
            🚪 Sair da Conta
          </button>
        </div>

        {/* Informações do Sistema */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
          <p className="text-blue-800 text-sm">
            <strong>💡 Dica:</strong> Mantenha seus dados atualizados para receber notificações importantes sobre suas viagens!
          </p>
        </div>

      </div>
    </div>
  );
}