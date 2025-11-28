import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import AdminSidebar from '../../components/admin/Sidebar';
import VehicleFormModal from '../../components/admin/VehicleFormModal';
import * as adminService from '../../services/adminService';

export default function VehiclesPage() {
  const { user } = useAuth();

  const [veiculos, setVeiculos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // 2️⃣ States do modal
  const [showModal, setShowModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  // Carregar lista de veículos
  const loadVehicles = async () => {
    try {
      const data = await adminService.getVehicles();
      // Ajuste conforme o formato do seu backend:
      // se o backend retorna { veiculos: [...] }, use data.veiculos
      // se retorna diretamente [...], use data
      const lista = Array.isArray(data) ? data : (data.veiculos || []);
      setVeiculos(lista);
    } catch (err) {
      console.error('Erro ao carregar veículos:', err);
      // fallback opcional (remova se não quiser mock)
      setVeiculos([
        { id: 1, modelo: 'ABC', marca: 'Teste', cor: 'Branco', placa: '123-BCD', tipo: 'Van' },
        { id: 2, modelo: 'DEF', marca: 'Teste 2', cor: 'Preto', placa: '456-DDF', tipo: 'Ônibus' },
      ]);
    }
  };

  useEffect(() => {
    loadVehicles();
  }, []);

  // 3️⃣ Funções criar/editar/salvar/excluir
  const handleCreate = () => {
    setSelectedVehicle(null);
    setShowModal(true);
  };

  const handleEdit = (vehicle) => {
    setSelectedVehicle(vehicle);
    setShowModal(true);
  };

  const handleSave = async (vehicleData) => {
    try {
      if (selectedVehicle) {
        await adminService.updateVehicle(selectedVehicle.id, vehicleData);
        alert('✅ Veículo atualizado com sucesso!');
      } else {
        await adminService.createVehicle(vehicleData);
        alert('✅ Veículo cadastrado com sucesso!');
      }
      setShowModal(false);
      loadVehicles();
    } catch (error) {
      console.error('Erro ao salvar veículo:', error);
      alert('❌ Erro ao salvar veículo: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('❓ Deseja realmente desativar este veículo?')) return;
    try {
      await adminService.deleteVehicle(id);
      alert('✅ Veículo desativado com sucesso!');
      loadVehicles();
    } catch (error) {
      console.error('Erro ao deletar veículo:', error);
      alert('❌ Erro ao deletar veículo');
    }
  };

  const filteredVeiculos = veiculos.filter(v =>
    v.modelo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.placa?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            {/* Você pode manter este botão, mas agora com o handler */}
            <button
              onClick={handleCreate}
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
              <button className="text-white text-xl">🔍</button>
            </div>
          </div>



          {/* Tabela */}
          <div className="max-w-7xl mx-auto bg-gradient-to-br from-green-800 to-green-700 rounded-3xl shadow-2xl overflow-hidden">
            <table className="w-full text-white">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="px-6 py-4 text-left font-bold uppercase tracking-wider">Modelo</th>
                  <th className="px-6 py-4 text-left font-bold uppercase tracking-wider">Marca</th>
                  <th className="px-6 py-4 text-left font-bold uppercase tracking-wider">Cor</th>
                  <th className="px-6 py-4 text-left font-bold uppercase tracking-wider">Placa</th>
                  <th className="px-6 py-4 text-left font-bold uppercase tracking-wider">Tipo veículo</th>
                  {/* 5️⃣ Nova coluna de ações */}
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-200 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredVeiculos.map((veiculo) => (
                  <tr key={veiculo.id} className="border-b border-white/10 hover:bg-white/5">
                    <td className="px-6 py-4 uppercase">{veiculo.modelo}</td>
                    <td className="px-6 py-4 uppercase">{veiculo.marca}</td>
                    <td className="px-6 py-4 uppercase">{veiculo.cor}</td>
                    <td className="px-6 py-4 uppercase">{veiculo.placa}</td>
                    <td className="px-6 py-4 uppercase">{veiculo.tipo}</td>
                    {/* 5️⃣ Botões de ação */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(veiculo)}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                          title="Editar"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(veiculo.id)}
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
                          title="Desativar"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredVeiculos.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-green-200">
                      Nenhum veículo encontrado
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* 6️⃣ Modal de Criar/Editar */}
          <VehicleFormModal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            vehicle={selectedVehicle}
            onSave={handleSave}
          />
        </div>
      </div>
    </div>
  );
}
