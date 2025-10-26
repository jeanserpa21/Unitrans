import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as driverService from '../../services/driverService';

export default function HistoryPage() {
  const navigate = useNavigate();
  const [viagens, setViagens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [periodo, setPeriodo] = useState({ dataInicio: '', dataFim: '' });

  // Definir período padrão (últimos 30 dias)
  useEffect(() => {
    const hoje = new Date();
    const dataFim = hoje.toISOString().split('T')[0];
    
    const umMesAtras = new Date();
    umMesAtras.setDate(umMesAtras.getDate() - 30);
    const dataInicio = umMesAtras.toISOString().split('T')[0];
    
    setPeriodo({ dataInicio, dataFim });
  }, []);

  // Carregar histórico
  const loadHistory = async () => {
    if (!periodo.dataInicio || !periodo.dataFim) return;

    try {
      setLoading(true);
      setError(null);
      const data = await driverService.getHistory(periodo);
      setViagens(data.viagens || []);
    } catch (err) {
      setError('Erro ao carregar histórico');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (periodo.dataInicio && periodo.dataFim) {
      loadHistory();
    }
  }, [periodo]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando histórico...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-700 to-green-600 text-white p-6 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <button 
            onClick={() => navigate('/motorista')}
            className="text-green-100 hover:text-white mb-2 flex items-center"
          >
            ← Voltar
          </button>
          <h1 className="text-2xl font-bold">📜 Histórico de Viagens</h1>
          <p className="text-green-100 mt-1">Últimas {viagens.length} viagens</p>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        
        {/* Filtros de Data */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Filtrar por Período</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-2">Data Início</label>
              <input
                type="date"
                value={periodo.dataInicio}
                onChange={(e) => setPeriodo({ ...periodo, dataInicio: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-2">Data Fim</label>
              <input
                type="date"
                value={periodo.dataFim}
                onChange={(e) => setPeriodo({ ...periodo, dataFim: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Erro */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Sem viagens */}
        {viagens.length === 0 && !error && (
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
            <p className="text-yellow-800">📭 Nenhuma viagem encontrada neste período</p>
          </div>
        )}

        {/* Lista de Viagens */}
        <div className="space-y-4">
          {viagens.map((viagem, idx) => (
            <div key={idx} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  {/* Info da Viagem */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-800">{viagem.linha_nome}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        viagem.status === 'CONCLUIDA' ? 'bg-green-100 text-green-800' :
                        viagem.status === 'EM_ANDAMENTO' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {viagem.status === 'CONCLUIDA' ? '✅ Concluída' :
                         viagem.status === 'EM_ANDAMENTO' ? '🚌 Em Andamento' :
                         viagem.status}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-3">
                      {viagem.cidade_origem} → {viagem.cidade_destino}
                    </p>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Data</span>
                        <p className="font-semibold">{formatDate(viagem.data)}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Passageiros</span>
                        <p className="font-semibold">
                          {viagem.total_embarcados || 0} / {viagem.total_planejado || 0}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">Taxa de Presença</span>
                        <p className="font-semibold">
                          {viagem.taxa_presenca ? `${viagem.taxa_presenca}%` : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Indicador Visual */}
                  <div className="ml-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold text-xl">
                      {viagem.total_embarcados || 0}
                    </div>
                  </div>
                </div>

                {/* Barra de Progresso */}
                {viagem.total_planejado > 0 && (
                  <div className="mt-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full transition-all"
                        style={{ 
                          width: `${((viagem.total_embarcados || 0) / viagem.total_planejado) * 100}%` 
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}