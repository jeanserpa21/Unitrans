import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import * as adminService from '../../services/adminService';
import AdminSidebar from '../../components/admin/Sidebar';
import PassengerDetailsModal from '../../components/admin/PassengerDetailsModal'; // ✅ Import do modal

export default function SecretaryPage() {
  const { user } = useAuth();
  const [passageiros, setPassageiros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [semestre, setSemestre] = useState('2024.1');

  const [selectedPassenger, setSelectedPassenger] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    loadPassengers();
  }, []);

  const loadPassengers = async () => {
    try {
      setLoading(true);
      const data = await adminService.getPassengers();
      setPassageiros(data.passageiros || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    if (!confirm('Aprovar este passageiro?')) return;
    try {
      await adminService.approvePassenger(id);
      alert('✅ Passageiro aprovado!');
      loadPassengers();
    } catch (err) {
      alert('Erro ao aprovar passageiro');
    }
  };

  const handleReject = async (id) => {
    if (!confirm('Recusar este passageiro?')) return;
    try {
      await adminService.rejectPassenger(id);
      alert('❌ Passageiro recusado!');
      loadPassengers();
    } catch (err) {
      alert('Erro ao recusar passageiro');
    }
  };

  // ✅ Filtros atualizados
  const aprovados = passageiros.filter(p => p.status === 'APROVADO');
  const aguardando = passageiros.filter(p => p.status === 'PENDENTE');

  if (loading) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-green-50">
      <AdminSidebar />

      <div className="ml-48 min-h-screen">
        {/* Header Badge */}
        <div className="fixed top-4 right-4 z-30">
          <div className="bg-green-700 text-white rounded-full px-6 py-3 shadow-lg flex items-center space-x-3">
            <div>
              <p className="text-sm font-semibold">User</p>
              <p className="text-xs text-green-200">Cod: {user?.id || '?'}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-green-700 font-bold">
              {user?.nome?.charAt(0) || 'A'}
            </div>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="p-12 pt-20">
          <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">Secretaria</h1>

          {/* Painel Principal */}
          <div className="max-w-7xl mx-auto bg-gradient-to-br from-green-800 to-green-700 rounded-3xl shadow-2xl p-8">
            <div className="flex items-center justify-between mb-6">
              <button className="text-white text-3xl hover:opacity-80 transition">↩</button>

              <select
                value={semestre}
                onChange={(e) => setSemestre(e.target.value)}
                className="bg-white text-green-800 font-semibold px-6 py-2 rounded-full cursor-pointer"
              >
                <option>Semestre ▼</option>
                <option value="2024.1">2024.1</option>
                <option value="2023.2">2023.2</option>
                <option value="2023.1">2023.1</option>
              </select>
            </div>

            {/* ✅ Grid alterado de 3 para 2 colunas */}
            <div className="grid grid-cols-2 gap-6 text-white">
              
              {/* Aprovados */}
              <div>
                <h3 className="text-center font-bold mb-4 text-lg">Cadastros Aprovados</h3>
                <div className="space-y-3">
                  {aprovados.map((p) => (
                    <div key={p.id} className="bg-white/10 backdrop-blur rounded-lg p-3 flex items-center justify-between">
                      <span className="text-sm">{p.nome}</span>
                      <button
                        onClick={() => {
                          setSelectedPassenger(p);
                          setShowDetailsModal(true);
                        }}
                        className="text-white hover:opacity-80"
                      >
                        👤
                      </button>
                    </div>
                  ))}
                  {aprovados.length === 0 && (
                    <p className="text-center text-green-200 text-sm py-4">Nenhum aprovado</p>
                  )}
                </div>
              </div>

              {/* Aguardando */}
              <div>
                <h3 className="text-center font-bold mb-4 text-lg">Aguardando Aprovação</h3>
                <div className="space-y-3">
                  {aguardando.map((p) => (
                    <div key={p.id} className="bg-white/10 backdrop-blur rounded-lg p-3 flex items-center justify-between">
                      <span className="text-sm">{p.nome}</span>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleApprove(p.id)}
                          className="text-green-300 hover:text-white transition"
                        >
                          ✅
                        </button>
                        <button
                          onClick={() => handleReject(p.id)}
                          className="text-red-300 hover:text-white transition"
                        >
                          ❌
                        </button>
                        <button
                          onClick={() => {
                            setSelectedPassenger(p);
                            setShowDetailsModal(true);
                          }}
                          className="text-white hover:opacity-80"
                        >
                          👤
                        </button>
                      </div>
                    </div>
                  ))}
                  {aguardando.length === 0 && (
                    <p className="text-center text-green-200 text-sm py-4">Nenhum aguardando</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ✅ Modal de Detalhes */}
        <PassengerDetailsModal
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          passenger={selectedPassenger}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      </div>
    </div>
  );
}
