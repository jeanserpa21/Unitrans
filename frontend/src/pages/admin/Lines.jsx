import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import * as adminService from '../../services/adminService';
import AdminSidebar from '../../components/admin/Sidebar';
import LineDetailsModal from '../../components/admin/LineDetailsModal';
import LinePassengersModal from '../../components/admin/LinePassengersModal';

export default function LinesPage() {
  const { user } = useAuth();

  const [linhas, setLinhas] = useState([]);
  const [loading, setLoading] = useState(true);

  // 👇 novos states para os modals e linha selecionada
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showPassengersModal, setShowPassengersModal] = useState(false);
  const [selectedLinha, setSelectedLinha] = useState(null);

  useEffect(() => {
    loadLines();
  }, []);

  const loadLines = async () => {
    try {
      setLoading(true);
      const data = await adminService.getDashboard();
      setLinhas(data.linhas || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 👇 abre modal de passageiros
  const handleLineClick = (linha) => {
    setSelectedLinha(linha);
    setShowPassengersModal(true);
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
          <h1 className="text-4xl font-bold text-center text-gray-800 mb-12">Linhas</h1>

          {/* Grid de Linhas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {linhas.map((linha) => (
              <div
                key={linha.id}
                onClick={() => handleLineClick(linha)}
                className="bg-gradient-to-br from-green-800 to-green-700 text-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition text-center cursor-pointer transform hover:scale-105"
              >
                <h3 className="text-xl font-bold mb-2">Linha</h3>

                <div className="w-24 h-24 mx-auto bg-white rounded-full flex items-center justify-center mb-4">
                  <span className="text-5xl font-bold text-green-800">{linha.id}</span>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation(); // evita disparar o onClick do card
                    handleLineClick(linha);
                  }}
                  className="bg-white hover:bg-green-50 text-green-800 font-semibold px-6 py-2 rounded-full transition"
                >
                  Ver
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Modals */}
<LinePassengersModal
  isOpen={showPassengersModal}
  onClose={() => setShowPassengersModal(false)}
  linha={selectedLinha}
/>

        <LineDetailsModal
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          linha={selectedLinha}
          onSave={(data) => {
            console.log('Dados salvos:', data);
            setShowDetailsModal(false);
            alert('✅ Configurações salvas!');
          }}
        />
      </div>
    </div>
  );
}
