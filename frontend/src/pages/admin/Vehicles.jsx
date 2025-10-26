import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import AdminSidebar from '../../components/admin/Sidebar';

export default function VehiclesPage() {
  const { user } = useAuth();
  const [veiculos, setVeiculos] = useState([
    { id: 1, modelo: 'ABC', marca: 'Teste', cor: 'Branco', placa: '123-bcd', tipo: 'Van' },
    { id: 2, modelo: 'DEF', marca: 'Teste 2', cor: 'Preto', placa: '456-ddf', tipo: 'Ônibus' },
  ]);
  const [searchTerm, setSearchTerm] = useState('');

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
            <button className="bg-green-700 hover:bg-green-600 text-white font-bold px-8 py-3 rounded-full shadow-lg transition">
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
                  <th className="px-6 py-4 text-center font-bold uppercase tracking-wider">Ações</th>
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
                    <td className="px-6 py-4 text-center">
                      <button className="text-white hover:text-green-200 transition mr-3" title="Editar">
                        ✏️
                      </button>
                      <button className="text-red-300 hover:text-red-100 transition" title="Excluir">
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}