import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Menu, 
  X, 
  User, 
  Bus,
  Clock,
  MapPin,
  LogOut,
  Users,
  Play,
  AlertCircle
} from 'lucide-react';

export default function DashboardMotorista() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [viagem, setViagem] = useState(null);
  const [passageiros, setPassageiros] = useState([]);

  useEffect(() => {
    buscarViagemDoDia();
  }, []);

  const buscarViagemDoDia = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/driver/viagem-hoje', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setViagem(data);
        setPassageiros(data.passageiros || []);
      } else {
        setViagem(null);
      }
    } catch (error) {
      console.error('Erro ao buscar viagem:', error);
      setViagem(null);
    } finally {
      setLoading(false);
    }
  };

  const iniciarViagem = async () => {
    if (!window.confirm('Deseja iniciar a viagem?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/driver/iniciar-viagem', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        alert('✅ Viagem iniciada com sucesso!');
        navigate('/motorista/viagem-andamento');
      } else {
        const error = await response.json();
        alert('❌ ' + error.error);
      }
    } catch (error) {
      console.error('Erro ao iniciar viagem:', error);
      alert('❌ Erro ao iniciar viagem');
    }
  };

  const MenuItem = ({ icon: Icon, label, onClick }) => (
    <button
      onClick={onClick}
      className="flex items-center gap-4 px-6 py-4 hover:bg-green-800 transition w-full text-left"
    >
      <Icon size={24} className="text-white" />
      <span className="text-white font-medium">{label}</span>
    </button>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600"></div>
      </div>
    );
  }

  if (!viagem) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100">
        <header className="bg-green-700 shadow-lg">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <button
              onClick={() => setMenuOpen(true)}
              className="text-white p-2 hover:bg-green-600 rounded-lg transition"
            >
              <Menu size={28} />
            </button>
            <h1 className="text-xl font-bold text-white">UniTrans - Motorista</h1>
            <div className="w-10"></div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="text-gray-400" size={40} />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              Nenhuma viagem programada
            </h2>
            <p className="text-gray-600">
              Você não tem viagens agendadas para hoje
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100">
      {/* Header */}
      <header className="bg-green-700 shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setMenuOpen(true)}
              className="text-white p-2 hover:bg-green-600 rounded-lg transition"
            >
              <Menu size={28} />
            </button>

            {/* Info do Motorista */}
            <div className="flex items-center gap-3 bg-green-600 px-4 py-2 rounded-full">
              <div className="text-right">
                <p className="text-white text-sm font-medium">{user?.nome?.split(' ')[0]}</p>
                <p className="text-green-200 text-xs">{viagem.linha_nome}</p>
                <p className="text-green-200 text-xs">Cód: {user?.motorista_id}</p>
              </div>
              <div className="w-10 h-10 bg-green-200 rounded-full flex items-center justify-center">
                <User className="text-green-700" size={24} />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Menu Lateral */}
      {menuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setMenuOpen(false)}
          />
          <div className="fixed left-0 top-0 h-full w-80 bg-green-900 shadow-2xl z-50">
            <div className="p-6">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-white">Menu</h2>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="text-white hover:bg-green-800 p-2 rounded-lg"
                >
                  <X size={24} />
                </button>
              </div>

              <nav className="space-y-2">
                <MenuItem icon={Bus} label="Dashboard" onClick={() => setMenuOpen(false)} />
                <MenuItem icon={Users} label="Passageiros" onClick={() => navigate('/motorista/passageiros')} />
                <MenuItem icon={MapPin} label="Pontos" onClick={() => navigate('/motorista/pontos')} />
                <MenuItem icon={Clock} label="Histórico" onClick={() => navigate('/motorista/historico')} />
                <MenuItem icon={User} label="Perfil" onClick={() => navigate('/motorista/perfil')} />
                <MenuItem icon={LogOut} label="Sair" onClick={logout} />
              </nav>
            </div>
          </div>
        </>
      )}

      {/* Conteúdo Principal */}
      <main className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Card da Linha */}
        <div className="bg-green-700 rounded-3xl shadow-2xl p-8 mb-6 text-white">
          <h2 className="text-3xl font-bold text-center mb-6 border-b-2 border-white pb-4">
            {viagem.linha_nome}
          </h2>

          <div className="text-center mb-6">
            <p className="text-green-200 text-lg mb-2">Total de passageiros</p>
            <p className="text-6xl font-bold">{passageiros.length}</p>
          </div>

          {/* Tabela de Passageiros */}
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/30">
                  <th className="text-left py-3 px-2 text-sm font-semibold">Ordem</th>
                  <th className="text-left py-3 px-2 text-sm font-semibold">Aluno</th>
                  <th className="text-left py-3 px-2 text-sm font-semibold">Embarque</th>
                  <th className="text-left py-3 px-2 text-sm font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {passageiros.length > 0 ? (
                  passageiros.map((p, index) => (
                    <tr key={p.id} className="border-b border-white/20">
                      <td className="py-3 px-2 text-sm">{index + 1}</td>
                      <td className="py-3 px-2 text-sm font-medium">{p.nome}</td>
                      <td className="py-3 px-2 text-sm">{p.ponto || '-'}</td>
                      <td className="py-3 px-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          p.status === 'EMBARCADO' 
                            ? 'bg-green-500 text-white' 
                            : 'bg-yellow-500 text-white'
                        }`}>
                          {p.status === 'EMBARCADO' ? '✓ Embarcado' : '○ Aguardando'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center py-6 text-green-200">
                      Nenhum passageiro cadastrado
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="space-y-4">
          {viagem.status === 'PLANEJADA' && (
            <>
              <button
                onClick={iniciarViagem}
                className="w-full bg-green-700 hover:bg-green-800 text-white py-5 rounded-2xl font-bold text-xl shadow-xl transition flex items-center justify-center gap-3"
              >
                <Play size={28} />
                Iniciar Ida
              </button>

              <button
                onClick={iniciarViagem}
                className="w-full bg-green-700 hover:bg-green-800 text-white py-5 rounded-2xl font-bold text-xl shadow-xl transition flex items-center justify-center gap-3"
              >
                <Play size={28} />
                Iniciar Volta
              </button>
            </>
          )}

          {viagem.status === 'EM_ANDAMENTO' && (
            <button
              onClick={() => navigate('/motorista/viagem-andamento')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl font-bold text-xl shadow-xl transition"
            >
              📍 Ver Viagem em Andamento
            </button>
          )}
        </div>
      </main>
    </div>
  );
}