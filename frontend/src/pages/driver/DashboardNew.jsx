import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import * as driverService from '../../services/driverService';
import Sidebar from '../../components/driver/Sidebar';

export default function DashboardNew() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [viagem, setViagem] = useState(null);
  const [passageiros, setPassageiros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Carregar dados da viagem e passageiros
  const loadData = async () => {
    try {
      setLoading(true);
      const data = await driverService.getTodayTrip();
      setViagem(data);

      if (data && data.viagem_id) {
        const passData = await driverService.getPassengers();
        const allPassengers = (passData.pontos || []).flatMap(ponto =>
          (ponto.passageiros || []).map(p => ({
            ...p,
            ordem: ponto.ordem,
            ponto: ponto.nome,
            universidade: p.universidade_nome || 'N/A',
          }))
        );
        setPassageiros(allPassengers);
      }
    } catch (err) {
      console.error(err);
      setViagem(null);
      setPassageiros([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // 🔹 Iniciar Ida (COM NOTIFICAÇÃO AUTOMÁTICA)
  const handleStartIda = async () => {
    if (!window.confirm('Deseja iniciar a viagem de IDA?')) return;

    try {
      setActionLoading(true);

      // 1️⃣ PRIMEIRO: Iniciar a viagem
      console.log('1. Iniciando viagem...');
      await driverService.startTrip();

      // 2️⃣ DEPOIS: Enviar notificação automática
      console.log('2. Enviando notificação...');
      await driverService.sendMessage(
        '🚌 Viagem Iniciada - IDA',
        'O ônibus saiu! A viagem de ida foi iniciada. Por favor, esteja no ponto de embarque.'
      );

      // 3️⃣ Redirecionar
      console.log('3. Redirecionando...');
      alert('✅ Viagem iniciada e passageiros notificados!');
      navigate('/motorista/viagem-andamento');
    } catch (error) {
      console.error('Erro ao iniciar viagem:', error);

      if (error.response?.data?.error) {
        alert('❌ ' + error.response.data.error);
      } else {
        alert('❌ Erro ao iniciar viagem: ' + error.message);
      }
    } finally {
      setActionLoading(false);
    }
  };

  // 🔹 Iniciar Volta (COM NOTIFICAÇÃO AUTOMÁTICA)
  const handleStartVolta = async () => {
    if (!window.confirm('Deseja iniciar a viagem de VOLTA?')) return;

    try {
      setActionLoading(true);

      // 1️⃣ PRIMEIRO: Iniciar a viagem
      console.log('1. Iniciando viagem de volta...');
      await driverService.startTrip();

      // 2️⃣ DEPOIS: Enviar notificação automática
      console.log('2. Enviando notificação...');
      await driverService.sendMessage(
        '🔙 Viagem Iniciada - VOLTA',
        'O ônibus está retornando! A viagem de volta foi iniciada. Por favor, esteja no ponto de embarque.'
      );

      // 3️⃣ Redirecionar
      console.log('3. Redirecionando...');
      alert('✅ Viagem de volta iniciada e passageiros notificados!');
      navigate('/motorista/viagem-andamento');
    } catch (error) {
      console.error('Erro ao iniciar viagem de volta:', error);

      if (error.response?.data?.error) {
        alert('❌ ' + error.response.data.error);
      } else {
        alert('❌ Erro ao iniciar viagem: ' + error.message);
      }
    } finally {
      setActionLoading(false);
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
      {/* Sidebar */}
      <Sidebar />

      {/* Header com informações do motorista */}
      <div className="fixed top-4 right-4 z-30">
        <div className="bg-green-700 text-white rounded-full px-6 py-3 shadow-lg flex items-center space-x-3">
          <div>
            <p className="text-sm font-semibold">{user?.nome || 'Motorista'}</p>
            <p className="text-xs text-green-200">
              {viagem?.linha_nome || 'Sem linha'} | Cód: {user?.motorista_id || '?'}
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-green-700 font-bold">
            {user?.nome?.charAt(0) || 'M'}
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto">
          {/* Card Principal */}
          <div className="bg-green-700 rounded-3xl shadow-2xl overflow-hidden">
            {/* Cabeçalho */}
            <div className="p-8 text-white text-center border-b-2 border-white/20">
              <h1 className="text-3xl font-bold mb-2">
                {viagem?.linha_nome || 'Sem viagem programada'}
              </h1>
            </div>

            {/* Total de Passageiros */}
            <div className="p-8 text-white text-center">
              <p className="text-xl mb-2">Total de passageiros</p>
              <p className="text-6xl font-bold">{passageiros.length}</p>
            </div>

            {/* Lista de Passageiros */}
            {passageiros.length > 0 && (
              <div className="px-8 pb-8">
                <div className="bg-green-600 rounded-xl overflow-hidden">
                  <table className="w-full text-white">
                    <thead>
                      <tr className="border-b-2 border-white/30">
                        <th className="p-4 text-left font-semibold">Ordem</th>
                        <th className="p-4 text-left font-semibold">Aluno</th>
                        <th className="p-4 text-left font-semibold">Embarque</th>
                        <th className="p-4 text-left font-semibold">Uni</th>
                      </tr>
                    </thead>
                    <tbody>
                      {passageiros.slice(0, 8).map((p, idx) => (
                        <tr key={idx} className="border-b border-white/10">
                          <td className="p-4">{p.ordem}</td>
                          <td className="p-4">{p.nome}</td>
                          <td className="p-4">{p.ponto}</td>
                          <td className="p-4 text-sm">{p.universidade}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {passageiros.length > 8 && (
                    <div className="p-4 text-center text-green-200 text-sm">
                      + {passageiros.length - 8} passageiros
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Sem passageiros */}
            {passageiros.length === 0 && viagem && (
              <div className="px-8 pb-8 text-center text-white/80">
                <p>Nenhum passageiro cadastrado</p>
              </div>
            )}

            {/* Sem viagem */}
            {!viagem && (
              <div className="px-8 pb-8 text-center text-white/80">
                <p>Nenhuma viagem programada para hoje</p>
              </div>
            )}
          </div>

          {/* Botões de Ação */}
          {viagem && viagem.status === 'PLANEJADA' && (
            <div className="mt-8 space-y-4">
              <button
                onClick={handleStartIda}
                disabled={actionLoading}
                className="w-full bg-green-700 hover:bg-green-600 text-white font-bold text-xl py-6 rounded-full shadow-xl transition disabled:opacity-50"
              >
                {actionLoading ? 'Iniciando...' : 'Iniciar Ida'}
              </button>

              <button
                onClick={handleStartVolta}
                disabled={actionLoading}
                className="w-full bg-green-700 hover:bg-green-600 text-white font-bold text-xl py-6 rounded-full shadow-xl transition disabled:opacity-50"
              >
                {actionLoading ? 'Iniciando...' : 'Iniciar Volta'}
              </button>
            </div>
          )}

          {/* Viagem em andamento */}
          {viagem && viagem.status === 'EM_ANDAMENTO' && (
            <div className="mt-8">
              <button
                onClick={() => navigate('/motorista/viagem-andamento')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xl py-6 rounded-full shadow-xl transition"
              >
                🚌 Ver Viagem em Andamento
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
