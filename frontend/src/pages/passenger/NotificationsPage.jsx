import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, ArrowLeft, Check, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [notificacoes, setNotificacoes] = useState([]);
  const [filtro, setFiltro] = useState('todas'); // 'todas', 'nao-lidas'

  useEffect(() => {
    buscarNotificacoes();
  }, []);

  const buscarNotificacoes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/notificacoes/minhas', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setNotificacoes(data.notificacoes || []);
      }
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
    } finally {
      setLoading(false);
    }
  };

  const marcarComoLida = async (notificacaoId) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:3000/api/notificacoes/${notificacaoId}/ler`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // Atualizar localmente
      setNotificacoes(prev => 
        prev.map(n => n.id === notificacaoId ? { ...n, lida: true } : n)
      );
    } catch (error) {
      console.error('Erro ao marcar como lida:', error);
    }
  };

  const marcarTodasComoLidas = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch('http://localhost:3000/api/notificacoes/ler-todas', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // Atualizar localmente
      setNotificacoes(prev => prev.map(n => ({ ...n, lida: true })));
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error);
    }
  };

  const getIconePorTipo = (tipo) => {
    switch (tipo) {
      case 'ALERTA':
      case 'URGENTE':
        return <AlertTriangle className="text-red-500" size={24} />;
      case 'AVISO':
        return <AlertCircle className="text-yellow-500" size={24} />;
      case 'INFO':
      default:
        return <Info className="text-blue-500" size={24} />;
    }
  };

  const getCorPorTipo = (tipo) => {
    switch (tipo) {
      case 'ALERTA':
      case 'URGENTE':
        return 'border-l-4 border-red-500 bg-red-50';
      case 'AVISO':
        return 'border-l-4 border-yellow-500 bg-yellow-50';
      case 'INFO':
      default:
        return 'border-l-4 border-blue-500 bg-blue-50';
    }
  };

  const notificacoesFiltradas = filtro === 'nao-lidas' 
    ? notificacoes.filter(n => !n.lida)
    : notificacoes;

  const totalNaoLidas = notificacoes.filter(n => !n.lida).length;

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
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/passageiro')}
              className="text-white p-2 hover:bg-green-700 rounded-lg transition"
            >
              <ArrowLeft size={28} />
            </button>
            
            <div className="flex items-center space-x-2">
              <Bell className="text-white" size={24} />
              <h1 className="text-xl font-bold text-white">Notificações</h1>
              {totalNaoLidas > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  {totalNaoLidas}
                </span>
              )}
            </div>

            <div className="w-10"></div>
          </div>

          {/* Filtros */}
          <div className="flex space-x-2 mt-4">
            <button
              onClick={() => setFiltro('todas')}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                filtro === 'todas'
                  ? 'bg-white text-green-800'
                  : 'bg-green-700 text-white hover:bg-green-600'
              }`}
            >
              Todas ({notificacoes.length})
            </button>
            <button
              onClick={() => setFiltro('nao-lidas')}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                filtro === 'nao-lidas'
                  ? 'bg-white text-green-800'
                  : 'bg-green-700 text-white hover:bg-green-600'
              }`}
            >
              Não lidas ({totalNaoLidas})
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Botão marcar todas como lidas */}
        {totalNaoLidas > 0 && (
          <button
            onClick={marcarTodasComoLidas}
            className="w-full mb-4 px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition flex items-center justify-center space-x-2"
          >
            <Check size={20} />
            <span>Marcar todas como lidas</span>
          </button>
        )}

        {/* Lista de notificações */}
        <div className="space-y-3">
          {notificacoesFiltradas.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center">
              <Bell className="mx-auto text-gray-300 mb-4" size={48} />
              <p className="text-gray-500 font-medium">
                {filtro === 'nao-lidas' 
                  ? 'Nenhuma notificação não lida'
                  : 'Nenhuma notificação ainda'
                }
              </p>
            </div>
          ) : (
            notificacoesFiltradas.map((notif) => (
              <div
                key={notif.id}
                className={`rounded-xl p-4 shadow-lg ${
                  notif.lida ? 'bg-white' : getCorPorTipo(notif.tipo)
                }`}
              >
                <div className="flex items-start space-x-3">
                  {/* Ícone */}
                  <div className="flex-shrink-0 mt-1">
                    {getIconePorTipo(notif.tipo)}
                  </div>

                  {/* Conteúdo */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <h3 className="font-bold text-gray-800 text-lg">
                        {notif.titulo}
                      </h3>
                      {!notif.lida && (
                        <span className="ml-2 flex-shrink-0 w-3 h-3 bg-blue-500 rounded-full"></span>
                      )}
                    </div>

                    <p className="text-gray-700 mt-2 whitespace-pre-wrap">
                      {notif.mensagem}
                    </p>

                    <div className="flex items-center justify-between mt-3">
                      <span className="text-sm text-gray-500">
                        {new Date(notif.criado_em).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>

                      {!notif.lida && (
                        <button
                          onClick={() => marcarComoLida(notif.id)}
                          className="text-sm text-green-700 hover:text-green-800 font-semibold flex items-center space-x-1"
                        >
                          <Check size={16} />
                          <span>Marcar como lida</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}