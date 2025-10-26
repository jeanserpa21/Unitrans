import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as driverService from '../../services/driverService';

export default function RoutePointsPage() {
  const navigate = useNavigate();
  const [pontos, setPontos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [announcing, setAnnouncing] = useState(null);

  // Carregar pontos
  const loadPoints = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await driverService.getRoutePoints();
      setPontos(data.pontos || []);
    } catch (err) {
      setError('Erro ao carregar pontos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPoints();
  }, []);

  // Anunciar próximo ponto
  const handleAnnounce = async (ponto) => {
    if (!confirm(`Anunciar: "${ponto.nome}"?`)) return;

    try {
      setAnnouncing(ponto.id);
      const result = await driverService.announceNextPoint(ponto.id);
      alert(`✅ ${result.message}`);
    } catch (err) {
      alert(err.response?.data?.error || 'Erro ao anunciar ponto');
      console.error(err);
    } finally {
      setAnnouncing(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando pontos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-700 to-purple-600 text-white p-6 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <button 
            onClick={() => navigate('/motorista')}
            className="text-purple-100 hover:text-white mb-2 flex items-center"
          >
            ← Voltar
          </button>
          <h1 className="text-2xl font-bold">📍 Pontos da Rota</h1>
          <p className="text-purple-100 mt-1">Total: {pontos.length} pontos</p>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="max-w-4xl mx-auto p-6 space-y-4">
        
        {/* Erro */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Sem pontos */}
        {pontos.length === 0 && !error && (
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
            <p className="text-yellow-800">📭 Nenhum ponto cadastrado para esta rota</p>
          </div>
        )}

        {/* Lista de Pontos */}
        {pontos.map((ponto, idx) => (
          <div key={idx} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
            <div className="p-6">
              <div className="flex items-center justify-between">
                {/* Info do Ponto */}
                <div className="flex items-center space-x-4">
                  {/* Número */}
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
                    {ponto.ordem}
                  </div>
                  
                  {/* Detalhes */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">{ponto.nome}</h3>
                    <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                      <span>👥 {ponto.total_passageiros || 0} passageiros</span>
                      <span>✅ {ponto.embarcados || 0} embarcados</span>
                      <span>⏳ {ponto.aguardando || 0} aguardando</span>
                    </div>
                  </div>
                </div>

                {/* Botão Anunciar */}
                <button
                  onClick={() => handleAnnounce(ponto)}
                  disabled={announcing === ponto.id}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-3 rounded-lg shadow transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {announcing === ponto.id ? '📢 Anunciando...' : '📢 Anunciar'}
                </button>
              </div>

              {/* Progresso */}
              {ponto.total_passageiros > 0 && (
                <div className="mt-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Progresso</span>
                    <span>{Math.round((ponto.embarcados / ponto.total_passageiros) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all"
                      style={{ width: `${(ponto.embarcados / ponto.total_passageiros) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

      </div>
    </div>
  );
}