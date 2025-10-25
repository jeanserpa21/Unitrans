import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Menu, 
  X, 
  Home, 
  Bell, 
  User, 
  HelpCircle, 
  Accessibility,
  Bus,
  Clock,
  MapPin,
  QrCode,
  Calendar,
  LogOut
} from 'lucide-react';

const PassengerDashboardPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [viagemHoje, setViagemHoje] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    buscarViagemHoje();
  }, []);

  const buscarViagemHoje = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/passageiros/viagem-hoje', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setViagemHoje(data);
      } else {
        setViagemHoje(null);
      }
    } catch (error) {
      console.error('Erro ao buscar viagem:', error);
      setViagemHoje(null);
    } finally {
      setLoading(false);
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
      <div className="min-h-screen bg-gradient-to-b from-green-900 to-green-700 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-900 to-green-700">
      {/* Header */}
      <header className="bg-green-800 shadow-lg">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => setMenuOpen(true)}
            className="text-white p-2 hover:bg-green-700 rounded-lg transition"
          >
            <Menu size={28} />
          </button>
          
          <h1 className="text-2xl font-bold text-white">UniTrans</h1>
          
          <button
            onClick={() => navigate('/passageiro/perfil')}
            className="text-white p-2 hover:bg-green-700 rounded-lg transition"
          >
            <User size={28} />
          </button>
        </div>
      </header>

      {/* Menu Lateral */}
      {menuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setMenuOpen(false)}
          />
          <div className="fixed left-0 top-0 h-full w-80 bg-green-900 shadow-2xl z-50 transform transition-transform">
            <div className="p-6 overflow-y-auto h-full">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-white">Menu</h2>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="text-white hover:bg-green-800 p-2 rounded-lg transition"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Foto de Perfil */}
              <div className="mb-8 text-center">
                <div className="w-24 h-24 bg-green-200 rounded-full mx-auto mb-3 flex items-center justify-center">
                  <User size={48} className="text-green-900" />
                </div>
                <p className="text-white font-semibold text-lg">{user?.nome || 'Usuário'}</p>
                <p className="text-green-200 text-sm">{user?.email}</p>
              </div>

              <nav className="space-y-2">
                <MenuItem icon={Home} label="Início" onClick={() => setMenuOpen(false)} />
                <MenuItem icon={Bell} label="Notificações" onClick={() => alert('Em desenvolvimento')} />
                <MenuItem icon={User} label="Perfil" onClick={() => navigate('/passageiro/perfil')} />
                <MenuItem icon={Calendar} label="Minhas Viagens" onClick={() => alert('Em desenvolvimento')} />
                <MenuItem icon={HelpCircle} label="Ajuda" onClick={() => alert('Em desenvolvimento')} />
                <MenuItem icon={Accessibility} label="Acessibilidade" onClick={() => alert('Em desenvolvimento')} />
                <MenuItem icon={LogOut} label="Sair" onClick={logout} />
              </nav>
            </div>
          </div>
        </>
      )}

      {/* Conteúdo Principal */}
      <main className="container mx-auto px-4 py-8 pb-24 max-w-2xl">
        {/* Saudação */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-1">
            Olá, {user?.nome?.split(' ')[0] || 'Passageiro'}! 👋
          </h2>
          <p className="text-gray-600">Bem-vindo ao seu painel</p>
        </div>

        {/* Card de Viagem do Dia */}
        {viagemHoje ? (
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Bus className="text-green-600" size={24} />
                Viagem de Hoje
              </h3>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                viagemHoje.status === 'ANDAMENTO' 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-blue-100 text-blue-700'
              }`}>
                {viagemHoje.status === 'ANDAMENTO' ? 'Em andamento' : 'Agendada'}
              </span>
            </div>

            <div className="space-y-4">
              {/* Linha */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Bus className="text-green-600" size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Linha</p>
                  <p className="font-semibold text-gray-800">{viagemHoje.linha_nome}</p>
                </div>
              </div>

              {/* Motorista */}
              {viagemHoje.motorista_nome && (
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <User className="text-blue-600" size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Motorista</p>
                    <p className="font-semibold text-gray-800">{viagemHoje.motorista_nome}</p>
                  </div>
                </div>
              )}

              {/* Horários */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="text-orange-600" size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Ida</p>
                    <p className="font-semibold text-gray-800">
                      {viagemHoje.horario_ida || '07:00'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="text-purple-600" size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Volta</p>
                    <p className="font-semibold text-gray-800">
                      {viagemHoje.horario_volta || '18:00'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Status de Embarque */}
              {viagemHoje.embarque_feito && (
                <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
                  <p className="text-green-700 font-semibold flex items-center gap-2">
                    ✓ Check-in realizado às {new Date(viagemHoje.horario_embarque).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              )}

              {viagemHoje.desembarque_feito && (
                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                  <p className="text-blue-700 font-semibold flex items-center gap-2">
                    ✓ Check-out realizado às {new Date(viagemHoje.horario_desembarque).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              )}
            </div>

            {/* Botão de QR Code */}
            {viagemHoje.status === 'ANDAMENTO' && !viagemHoje.desembarque_feito && (
              <button
                onClick={() => navigate('/passageiro/qrcode')}
                className="w-full mt-6 bg-green-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-green-700 transition flex items-center justify-center gap-3 shadow-lg"
              >
                <QrCode size={24} />
                {viagemHoje.embarque_feito ? 'Fazer Check-out' : 'Fazer Check-in'}
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-6 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bus className="text-gray-400" size={40} />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Nenhuma viagem programada
            </h3>
            <p className="text-gray-600 mb-6">
              Você não tem viagens agendadas para hoje
            </p>
            <button
              onClick={() => navigate('/passageiro/solicitar-carona')}
              className="bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 transition"
            >
              Solicitar Carona
            </button>
          </div>
        )}

        {/* Ações Rápidas */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button
            onClick={() => navigate('/passageiro/qrcode')}
            className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition"
          >
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-3">
              <QrCode className="text-green-600" size={24} />
            </div>
            <p className="font-bold text-gray-800">QR Code</p>
            <p className="text-sm text-gray-500">Embarque/Desembarque</p>
          </button>

          <button
            onClick={() => navigate('/passageiro/solicitar-carona')}
            className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-3">
              <Calendar className="text-blue-600" size={24} />
            </div>
            <p className="font-bold text-gray-800">Solicitar</p>
            <p className="text-sm text-gray-500">Carona</p>
          </button>
        </div>

        {/* Informações Úteis */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <MapPin className="text-green-600" size={20} />
            Pontos de Embarque
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700">Centro</span>
              <span className="text-sm text-gray-500">07:00</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700">Campus Principal</span>
              <span className="text-sm text-gray-500">07:30</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer com Slogan */}
      <footer className="fixed bottom-0 left-0 right-0 bg-green-800 shadow-lg">
        <div className="container mx-auto px-4 py-3 text-center">
          <p className="text-white text-sm font-medium">
            Facilidade para quem estuda, pontualidade para quem precisa!
          </p>
        </div>
      </footer>
    </div>
  );
};

export default PassengerDashboardPage;