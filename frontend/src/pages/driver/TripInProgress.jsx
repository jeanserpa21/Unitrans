import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import * as driverService from '../../services/driverService';
import Sidebar from '../../components/driver/Sidebar';

export default function TripInProgress() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [pontos, setPontos] = useState([]);
  const [proximoPonto, setProximoPonto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [announcing, setAnnouncing] = useState(false);

  const tipo = location.state?.tipo || 'IDA';

  // Carregar pontos
  const loadPoints = async () => {
    try {
      setLoading(true);
      const data = await driverService.getRoutePoints();
      const pontosOrdenados = (data.pontos || []).sort((a, b) => a.ordem - b.ordem);
      setPontos(pontosOrdenados);
      
      // Próximo ponto = primeiro com passageiros aguardando
      const proximo = pontosOrdenados.find(p => (p.aguardando || 0) > 0) || pontosOrdenados[0];
      setProximoPonto(proximo);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPoints();
  }, []);

  // Anunciar ponto
  const handleAnnounce = async () => {
    if (!proximoPonto) return;

    try {
      setAnnouncing(true);
      await driverService.announceNextPoint(proximoPonto.id);
      alert(`📢 Ponto "${proximoPonto.nome}" anunciado!`);
      loadPoints(); // Recarregar
    } catch (err) {
      alert('Erro ao anunciar ponto');
    } finally {
      setAnnouncing(false);
    }
  };

  // Finalizar viagem
  const handleFinish = async () => {
    if (!confirm('Finalizar viagem?')) return;

    try {
      await driverService.endTrip();
      alert('✅ Viagem finalizada!');
      navigate('/motorista');
    } catch (err) {
      alert(err.response?.data?.error || 'Erro ao finalizar');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-green-50">
      <Sidebar />

      {/* Header com Badge */}
      <div className="fixed top-4 right-4 z-30">
        <div className="bg-green-700 text-white rounded-full px-6 py-3 shadow-lg flex items-center space-x-3">
          <div>
            <p className="text-sm font-semibold">{user?.nome || 'Motorista'}</p>
            <p className="text-xs text-green-200">Viagem de {tipo}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-green-700 font-bold">
            {user?.nome?.charAt(0) || 'M'}
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto space-y-8">
          
          {/* Card do Próximo Ponto */}
          <div className="bg-green-700 rounded-3xl shadow-2xl overflow-hidden p-12 text-white text-center">
            {/* Botão de Som */}
            <button
              onClick={handleAnnounce}
              disabled={announcing || !proximoPonto}
              className="mb-8 mx-auto w-24 h-24 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition disabled:opacity-50"
            >
              <span className="text-5xl">🔊</span>
            </button>

            <h2 className="text-2xl font-semibold mb-4">Próxima Parada</h2>
            <h1 className="text-5xl font-bold">
              {proximoPonto?.nome || 'Nenhum ponto'}
            </h1>

            {proximoPonto && (
              <div className="mt-8 flex justify-center space-x-8 text-lg">
                <div>
                  <p className="text-green-200">Aguardando</p>
                  <p className="text-3xl font-bold">{proximoPonto.aguardando || 0}</p>
                </div>
                <div>
                  <p className="text-green-200">Embarcados</p>
                  <p className="text-3xl font-bold">{proximoPonto.embarcados || 0}</p>
                </div>
              </div>
            )}
          </div>

          {/* Botão Finalizar */}
          <button
            onClick={handleFinish}
            className="w-full bg-green-700 hover:bg-green-600 text-white font-bold text-xl py-6 rounded-full shadow-xl transition flex items-center justify-center space-x-4"
          >
            <span>Finalizar {tipo.toLowerCase()}</span>
            <span className="text-2xl">❌</span>
          </button>

          {/* Lista de Todos os Pontos */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="font-bold text-xl mb-4 text-gray-800">Todos os Pontos</h3>
            <div className="space-y-2">
              {pontos.map((ponto, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-lg flex items-center justify-between ${
                    ponto.id === proximoPonto?.id
                      ? 'bg-green-100 border-2 border-green-600'
                      : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center font-bold">
                      {ponto.ordem}
                    </div>
                    <div>
                      <p className="font-semibold">{ponto.nome}</p>
                      <p className="text-sm text-gray-600">
                        {ponto.total_passageiros || 0} passageiros
                      </p>
                    </div>
                  </div>
                  <div className="text-right text-sm">
                    <p className="text-gray-600">✅ {ponto.embarcados || 0}</p>
                    <p className="text-gray-600">⏳ {ponto.aguardando || 0}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}