import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  ArrowLeft,
  Calendar,
  MessageSquare,
  Send,
  Clock,
  CheckCircle,
  XCircle,
  Loader,
  AlertCircle
} from 'lucide-react';

const SolicitarCaronaPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [solicitacoes, setSolicitacoes] = useState([]);
  const [formData, setFormData] = useState({
    data: '',
    observacao: ''
  });
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  useEffect(() => {
    buscarSolicitacoes();
    setDataMinima();
  }, []);

  const setDataMinima = () => {
    const hoje = new Date();
    const amanha = new Date(hoje);
    amanha.setDate(amanha.getDate() + 1);
    const dataFormatada = amanha.toISOString().split('T')[0];
    setFormData(prev => ({ ...prev, data: dataFormatada }));
  };

  const buscarSolicitacoes = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/passageiros/solicitacoes', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSolicitacoes(data.solicitacoes || []);
      }
    } catch (error) {
      console.error('Erro ao buscar solicitações:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setSucesso('');

    if (!formData.data) {
      setErro('Selecione uma data');
      return;
    }

    setEnviando(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/passageiros/solicitar-carona', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setSucesso('Solicitação enviada com sucesso!');
        setFormData({ data: '', observacao: '' });
        setDataMinima();
        buscarSolicitacoes();
        
        setTimeout(() => {
          setSucesso('');
        }, 3000);
      } else {
        setErro(data.error || 'Erro ao enviar solicitação');
      }
    } catch (error) {
      console.error('Erro:', error);
      setErro('Erro ao enviar solicitação');
    } finally {
      setEnviando(false);
    }
  };

  const cancelarSolicitacao = async (id) => {
    if (!confirm('Deseja realmente cancelar esta solicitação?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/passageiros/solicitacoes/${id}/cancelar`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setSucesso('Solicitação cancelada com sucesso!');
        buscarSolicitacoes();
        
        setTimeout(() => {
          setSucesso('');
        }, 3000);
      } else {
        const data = await response.json();
        setErro(data.error || 'Erro ao cancelar');
      }
    } catch (error) {
      console.error('Erro:', error);
      setErro('Erro ao cancelar solicitação');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      'PENDENTE': { color: 'bg-yellow-100 text-yellow-700', icon: Clock, label: 'Pendente' },
      'APROVADA': { color: 'bg-green-100 text-green-700', icon: CheckCircle, label: 'Aprovada' },
      'RECUSADA': { color: 'bg-red-100 text-red-700', icon: XCircle, label: 'Recusada' },
      'CANCELADA': { color: 'bg-gray-100 text-gray-700', icon: XCircle, label: 'Cancelada' }
    };

    const badge = badges[status] || badges['PENDENTE'];
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${badge.color}`}>
        <Icon size={16} />
        {badge.label}
      </span>
    );
  };

  const formatarData = (dataISO) => {
    const data = new Date(dataISO + 'T00:00:00');
    return data.toLocaleDateString('pt-BR', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-900 to-green-700">
      {/* Header */}
      <header className="bg-green-800 shadow-lg">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate('/passageiro')}
            className="text-white p-2 hover:bg-green-700 rounded-lg transition"
          >
            <ArrowLeft size={28} />
          </button>
          <h1 className="text-xl font-bold text-white">Solicitar Carona</h1>
          <div className="w-10"></div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl pb-8">
        {/* Mensagens */}
        {erro && (
          <div className="mb-6 p-4 bg-red-100 border-2 border-red-300 rounded-xl flex items-start">
            <AlertCircle size={20} className="text-red-600 mr-2 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800 font-medium">{erro}</p>
          </div>
        )}

        {sucesso && (
          <div className="mb-6 p-4 bg-green-100 border-2 border-green-300 rounded-xl flex items-start">
            <CheckCircle size={20} className="text-green-600 mr-2 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-800 font-medium">{sucesso}</p>
          </div>
        )}

        {/* Formulário */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Calendar className="text-green-600" size={24} />
            Nova Solicitação
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Data */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data da Carona
              </label>
              <input
                type="date"
                value={formData.data}
                onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                Selecione a data em que precisa do transporte
              </p>
            </div>

            {/* Observação */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Observação (opcional)
              </label>
              <div className="relative">
                <MessageSquare className="absolute left-3 top-3 text-gray-400" size={20} />
                <textarea
                  value={formData.observacao}
                  onChange={(e) => setFormData({ ...formData, observacao: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                  rows="3"
                  placeholder="Ex: Preciso chegar mais cedo neste dia..."
                />
              </div>
            </div>

            {/* Botão */}
            <button
              type="submit"
              disabled={enviando}
              className="w-full bg-green-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-green-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {enviando ? (
                <>
                  <Loader className="animate-spin" size={20} />
                  Enviando...
                </>
              ) : (
                <>
                  <Send size={20} />
                  Enviar Solicitação
                </>
              )}
            </button>
          </form>
        </div>

        {/* Lista de Solicitações */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Clock className="text-green-600" size={24} />
            Minhas Solicitações
          </h2>

          {loading ? (
            <div className="text-center py-8">
              <Loader className="animate-spin mx-auto text-green-600 mb-2" size={32} />
              <p className="text-gray-600">Carregando...</p>
            </div>
          ) : solicitacoes.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="mx-auto text-gray-300 mb-3" size={48} />
              <p className="text-gray-600">Nenhuma solicitação ainda</p>
              <p className="text-sm text-gray-500">Suas solicitações aparecerão aqui</p>
            </div>
          ) : (
            <div className="space-y-4">
              {solicitacoes.map((solicitacao) => (
                <div
                  key={solicitacao.id}
                  className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <p className="font-bold text-gray-800 capitalize">
                        {formatarData(solicitacao.data)}
                      </p>
                      <p className="text-sm text-gray-500">
                        Solicitado em {new Date(solicitacao.criado_em).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    {getStatusBadge(solicitacao.status)}
                  </div>

                  {solicitacao.observacao && (
                    <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">
                        <span className="font-semibold">Observação:</span> {solicitacao.observacao}
                      </p>
                    </div>
                  )}

                  {solicitacao.status === 'PENDENTE' && (
                    <button
                      onClick={() => cancelarSolicitacao(solicitacao.id)}
                      className="w-full mt-2 bg-red-50 text-red-600 py-2 rounded-lg font-semibold hover:bg-red-100 transition"
                    >
                      Cancelar Solicitação
                    </button>
                  )}

                  {solicitacao.status === 'RECUSADA' && solicitacao.motivo_recusa && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-700">
                        <span className="font-semibold">Motivo da recusa:</span> {solicitacao.motivo_recusa}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Informação */}
        <div className="mt-6 bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
          <p className="text-blue-800 text-sm font-medium flex items-start gap-2">
            <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
            <span>
              As solicitações são analisadas pela administração. Você receberá uma notificação quando sua solicitação for aprovada ou recusada.
            </span>
          </p>
        </div>
      </main>
    </div>
  );
};

export default SolicitarCaronaPage;