import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as driverService from '../../services/driverService';

export default function PassengersPage() {
  const navigate = useNavigate();
  const [pontos, setPontos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scanningQR, setScanningQR] = useState(false);

  // Carregar passageiros
  const loadPassengers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await driverService.getPassengers();
      setPontos(data.pontos || []);
    } catch (err) {
      setError('Erro ao carregar passageiros');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPassengers();
  }, []);

  // Simular scan de QR Code (você pode integrar uma lib de QR Code depois)
  const handleScanQR = async () => {
    const qrcode = prompt('Digite o código do QR Code do passageiro:');
    
    if (!qrcode) return;

    try {
      setScanningQR(true);
      const result = await driverService.validateQRCode(qrcode);
      alert(`✅ ${result.message}\nPassageiro: ${result.passageiro}`);
      loadPassengers(); // Recarregar lista
    } catch (err) {
      alert(err.response?.data?.error || 'Erro ao validar QR Code');
      console.error(err);
    } finally {
      setScanningQR(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando passageiros...</p>
        </div>
      </div>
    );
  }

  const totalPassageiros = pontos.reduce((sum, ponto) => sum + (ponto.passageiros?.length || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-600 text-white p-6 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <button 
              onClick={() => navigate('/motorista')}
              className="text-blue-100 hover:text-white mb-2 flex items-center"
            >
              ← Voltar
            </button>
            <h1 className="text-2xl font-bold">👥 Passageiros</h1>
            <p className="text-blue-100 mt-1">Total: {totalPassageiros}</p>
          </div>
          
          <button
            onClick={handleScanQR}
            disabled={scanningQR}
            className="bg-white text-blue-700 font-semibold px-6 py-3 rounded-lg shadow-lg hover:bg-blue-50 transition disabled:opacity-50"
          >
            {scanningQR ? 'Validando...' : '📷 Escanear QR Code'}
          </button>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        
        {/* Erro */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Sem passageiros */}
        {pontos.length === 0 && !error && (
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
            <p className="text-yellow-800">📭 Nenhum passageiro cadastrado para esta viagem</p>
          </div>
        )}

        {/* Lista de Pontos */}
        {pontos.map((ponto, idx) => (
          <div key={idx} className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Header do Ponto */}
            <div className="bg-gradient-to-r from-green-600 to-green-500 p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold">📍 {ponto.nome || ponto.ponto_nome}</h2>
                  <p className="text-green-100 text-sm">Ordem: {ponto.ordem || ponto.ponto_ordem}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{ponto.passageiros?.length || 0}</div>
                  <div className="text-green-100 text-sm">Passageiros</div>
                </div>
              </div>
            </div>

            {/* Lista de Passageiros */}
            <div className="divide-y">
              {ponto.passageiros && ponto.passageiros.length > 0 ? (
                ponto.passageiros.map((passageiro, pidx) => (
                  <div key={pidx} className="p-4 hover:bg-gray-50 transition">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {/* Avatar */}
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
                          {passageiro.nome?.charAt(0) || '?'}
                        </div>
                        
                        {/* Info */}
                        <div>
                          <p className="font-semibold text-gray-800">{passageiro.nome}</p>
                          <p className="text-sm text-gray-500">ID: {passageiro.id}</p>
                        </div>
                      </div>

                      {/* Status */}
                      <div>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          passageiro.status === 'EMBARCADO' 
                            ? 'bg-green-100 text-green-800' 
                            : passageiro.status === 'AGUARDANDO'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {passageiro.status === 'EMBARCADO' ? '✅ Embarcado' :
                           passageiro.status === 'AGUARDANDO' ? '⏳ Aguardando' :
                           passageiro.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500">
                  Nenhum passageiro neste ponto
                </div>
              )}
            </div>
          </div>
        ))}

      </div>
    </div>
  );
}