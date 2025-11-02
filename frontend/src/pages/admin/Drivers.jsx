import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import * as adminService from '../../services/adminService';
import AdminSidebar from '../../components/admin/Sidebar';
import DriverModal from '../../components/admin/DriverModal';

export default function DriversPage() {
  const { user } = useAuth();
  const [motoristas, setMotoristas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);

  useEffect(() => {
    loadDrivers();
  }, []);

  const loadDrivers = async () => {
    try {
      setLoading(true);
      const data = await adminService.getDrivers();
      setMotoristas(Array.isArray(data) ? data : (data.motoristas || []));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // === Handlers do modal ===
  const handleAdd = () => {
    setSelectedDriver(null);
    setShowModal(true);
  };

  const handleEdit = (driver) => {
    setSelectedDriver(driver);
    setShowModal(true);
  };

  const handleSave = async (driverData) => {
    try {
      if (selectedDriver) {
        await adminService.updateDriver(selectedDriver.id, driverData);
        alert('✅ Motorista atualizado!');
      } else {
        await adminService.createDriver(driverData);
        alert('✅ Motorista cadastrado!');
      }
      setShowModal(false);
      loadDrivers();
    } catch (err) {
      console.error(err);
      alert('❌ Erro ao salvar motorista');
    }
  };

  // === DELETE / DESATIVAR ===
  const handleDelete = async (id, nome) => {
    if (!window.confirm(`❓ Deseja realmente desativar o motorista ${nome}?`)) return;

    try {
      await adminService.deleteDriver(id);
      alert('✅ Motorista desativado com sucesso!');
      loadDrivers();
    } catch (error) {
      console.error('Erro ao deletar motorista:', error);
      alert('❌ Erro ao desativar motorista');
    }
  };

  const filteredMotoristas = motoristas.filter((m) => {
    const nome = (m.nome || '').toLowerCase();
    const email = (m.email || '').toLowerCase();
    const term = searchTerm.toLowerCase();
    return nome.includes(term) || email.includes(term);
  });

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
          {/* Barra de Ações */}
          <div className="max-w-7xl mx-auto mb-6 flex items-center justify-between">
            <button
              onClick={handleAdd}
              className="bg-green-700 hover:bg-green-600 text-white font-bold px-8 py-3 rounded-full shadow-lg transition"
            >
              Adicionar
            </button>

            <div className="flex items-center space-x-2 bg-green-700 rounded-full px-6 py-3 shadow-lg">
              <input
                type="text"
                placeholder="PESQUISAR"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent text-white placeholder-green-200 outline-none uppercase tracking-wider"
              />
              <button className="text-white text-xl" title="Pesquisar">🔍</button>
            </div>
          </div>

          {/* Tabela */}
          <div className="max-w-7xl mx-auto bg-gradient-to-br from-green-800 to-green-700 rounded-3xl shadow-2xl overflow-hidden">
            <table className="w-full text-white">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="px-6 py-4 text-left font-bold uppercase tracking-wider">Nome</th>
                  <th className="px-6 py-4 text-left font-bold uppercase tracking-wider">E-mail</th>
                  <th className="px-6 py-4 text-left font-bold uppercase tracking-wider">CNH</th>
                  <th className="px-6 py-4 text-left font-bold uppercase tracking-wider">CPF</th>
                  <th className="px-6 py-4 text-left font-bold uppercase tracking-wider">ID Funcionário</th>
                  <th className="px-6 py-4 text-center font-bold uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredMotoristas.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-12 text-green-200">
                      Nenhum motorista encontrado
                    </td>
                  </tr>
                ) : (
                  filteredMotoristas.map((motorista) => (
                    <tr key={motorista.id} className="border-b border-white/10 hover:bg-white/5">
                      <td className="px-6 py-4 uppercase">{motorista.nome}</td>
                      <td className="px-6 py-4 uppercase">{motorista.email}</td>
                      <td className="px-6 py-4">{motorista.cnh || 'N/A'}</td>
                      <td className="px-6 py-4">{motorista.cpf || 'N/A'}</td>
                      <td className="px-6 py-4">{motorista.id}</td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEdit(motorista)}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                            title="Editar"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDelete(motorista.id, motorista.nome)}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
                            title="Desativar"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Modal de Criar/Editar Motorista */}
          <DriverModal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            driver={selectedDriver}
            onSave={handleSave}
          />
        </div>
      </div>
    </div>
  );
}
