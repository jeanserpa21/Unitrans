import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // ✅ import do navigate
import { useAuth } from '../../contexts/AuthContext';
import * as adminService from '../../services/adminService';
import AdminSidebar from '../../components/admin/Sidebar';

export default function AdminDashboard() {
  const navigate = useNavigate(); // ✅ hook do navigate
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const data = await adminService.getDashboard();
      setDashboard(data);
    } catch (err) {
      console.error('Erro ao carregar dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
      </div>
    );
  }

  const linhas = dashboard?.linhas || [];

  return (
    <div className="min-h-screen bg-green-50">
      <AdminSidebar />

      <div className="ml-48 min-h-screen">
        {/* Header com Badge */}
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
          <h1 className="text-4xl font-bold text-center text-gray-800 mb-12">
            Viagens do dia
          </h1>

          {/* Grid de Viagens */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {linhas.length === 0 ? (
              <div className="col-span-3 text-center text-gray-500 py-12">
                Nenhuma viagem programada para hoje
              </div>
            ) : (
              linhas.map((linha) => (
                <div
                  key={linha.id}
                  className="bg-gradient-to-br from-green-800 to-green-700 text-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition text-center"
                >
                  <h3 className="text-xl font-bold mb-2">Linha {linha.id}</h3>
                  <p className="text-green-200 text-sm mb-4">{linha.nome}</p>

                  <div className="w-24 h-24 mx-auto bg-white rounded-full flex items-center justify-center mb-4">
                    <span className="text-5xl font-bold text-green-800">
                      {linha.total_planejado || 0}
                    </span>
                  </div>

                  <p className="text-green-100 text-sm">Quantidade Passageiros</p>
                </div>
              ))
            )}
          </div>

          {/* Botão Avisos (flutuante) */}
          <button
            onClick={() => navigate('/admin/avisos')} // ✅ navegação adicionada
            className="fixed bottom-8 right-8 bg-green-700 hover:bg-green-600 text-white font-bold px-8 py-4 rounded-full shadow-2xl flex items-center space-x-3 transition"
          >
            <span>Avisos</span>
            <span className="text-2xl">⚠️</span>
          </button>
        </div>
      </div>
    </div>
  );
}
