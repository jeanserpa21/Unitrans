import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as driverService from '../../services/driverService';

export default function DriverDashboard() {
  const navigate = useNavigate();
  const [viagem, setViagem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  // Buscar viagem do dia
  const loadTripData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await driverService.getTodayTrip();
      setViagem(data);
    } catch (err) {
      if (err.response?.status === 404) {
        setViagem(null);
        setError('Nenhuma viagem programada para hoje');
      } else {
        setError('Erro ao carregar viagem');
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTripData();
  }, []);

  // Iniciar viagem
  const handleStartTrip = async () => {
    if (!confirm('Deseja iniciar a viagem?')) return;

    try {
      setActionLoading(true);
      await driverService.startTrip();
      alert('✅ Viagem iniciada! Passageiros foram notificados.');
      loadTripData();
    } catch (err) {
      alert(err.response?.data?.error || 'Erro ao iniciar viagem');
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  // Finalizar viagem
  const handleEndTrip = async () => {
    if (!confirm('Deseja finalizar a viagem?')) return;

    try {
      setActionLoading(true);
      await driverService.endTrip();
      alert('✅ Viagem finalizada com sucesso!');
      loadTripData();
    } catch (err) {
      alert(err.response?.data?.error || 'Erro ao finalizar viagem');
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-700 to-green-600 text-white p-6 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold">🚌 Dashboard do Motorista</h1>
          <p className="text-green-100 mt-1">Bem-vindo ao UniTrans</p>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        
        {/* Erro */}
        {error && !viagem && (
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
            <div className="flex items-center">
              <span className="text-2xl mr-3">⚠️</span>
              <div>
                <p className="font-semibold text-yellow-800">Sem viagem programada</p>
                <p className="text-yellow-700 text-sm mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Card da Viagem */}
        {viagem && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Header do Card */}
            <div className="bg-gradient-to-r from-green-600 to-green-500 p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">{viagem.linha_nome}</h2>
                  <p className="text-green-100 mt-1">
                    {viagem.cidade_origem} → {viagem.cidade_destino}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold">{viagem.total_passageiros || 0}</div>
                  <div className="text-green-100 text-sm">Passageiros</div>
                </div>
              </div>
            </div>

            {/* Informações */}
            <div className="p-6 space-y-4">
              {/* Status */}
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Status:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  viagem.status === 'PLANEJADA' ? 'bg-blue-100 text-blue-800' :
                  viagem.status === 'EM_ANDAMENTO' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {viagem.status === 'PLANEJADA' ? '⏳ Aguardando' :
                   viagem.status === 'EM_ANDAMENTO' ? '🚌 Em Andamento' :
                   '✅ Finalizada'}
                </span>
              </div>

              {/* Horários */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-600 text-sm">Saída</span>
                  <p className="font-semibold">{viagem.horario_saida || '--:--'}</p>
                </div>
                <div>
                  <span className="text-gray-600 text-sm">Chegada Prevista</span>
                  <p className="font-semibold">{viagem.horario_chegada || '--:--'}</p>
                </div>
              </div>

              {/* Veículo */}
              <div className="flex items-center justify-between pt-4 border-t">
                <span className="text-gray-600">Veículo:</span>
                <span className="font-semibold">{viagem.modelo} - {viagem.placa}</span>
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="p-6 bg-gray-50 border-t space-y-3">
              {viagem.status === 'PLANEJADA' && (
                <button
                  onClick={handleStartTrip}
                  disabled={actionLoading}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg shadow transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading ? 'Iniciando...' : '🚀 Iniciar Viagem'}
                </button>
              )}

              {viagem.status === 'EM_ANDAMENTO' && (
                <>
                  <button
                    onClick={() => navigate('/motorista/passageiros')}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow transition"
                  >
                    👥 Ver Passageiros
                  </button>
                  
                  <button
                    onClick={() => navigate('/motorista/pontos')}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg shadow transition"
                  >
                    📍 Ver Pontos da Rota
                  </button>

                  <button
                    onClick={handleEndTrip}
                    disabled={actionLoading}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg shadow transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {actionLoading ? 'Finalizando...' : '🏁 Finalizar Viagem'}
                  </button>
                </>
              )}

              {viagem.status === 'CONCLUIDA' && (
                <div className="text-center py-4">
                  <span className="text-green-600 font-semibold">✅ Viagem Concluída!</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Menu de Navegação */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => navigate('/motorista/historico')}
            className="bg-white hover:bg-gray-50 border-2 border-gray-200 text-gray-700 font-semibold py-4 px-6 rounded-lg shadow transition"
          >
            📜 Histórico
          </button>
          
          <button
            onClick={() => navigate('/motorista/perfil')}
            className="bg-white hover:bg-gray-50 border-2 border-gray-200 text-gray-700 font-semibold py-4 px-6 rounded-lg shadow transition"
          >
            👤 Perfil
          </button>
        </div>

      </div>
    </div>
  );
}