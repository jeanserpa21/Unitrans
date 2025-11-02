import { useState, useEffect } from 'react';
import { Calendar, Plus, Trash2, Eye, Filter, X } from 'lucide-react';
import AdminSidebar from '../../components/admin/Sidebar';

export default function ViagensPage() {
  const [viagens, setViagens] = useState([]);
  const [linhas, setLinhas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [detalhesAberto, setDetalhesAberto] = useState(false);
  const [viagemSelecionada, setViagemSelecionada] = useState(null);

  // Filtros
  const [filtros, setFiltros] = useState({
    dataInicio: '',
    dataFim: '',
    linhaId: '',
    status: ''
  });

  // Form nova viagem
  const [novaViagem, setNovaViagem] = useState({
    linhaId: '',
    data: '',
    passageirosIds: []
  });

  const [passageirosDisponiveis, setPassageirosDisponiveis] = useState([]);

  useEffect(() => {
    buscarDados();
  }, [filtros]);

  const buscarDados = async () => {
  try {
    setLoading(true);
    const token = localStorage.getItem('token');
    
    // Buscar viagens
    const params = new URLSearchParams();
    if (filtros.dataInicio) params.append('dataInicio', filtros.dataInicio);
    if (filtros.dataFim) params.append('dataFim', filtros.dataFim);
    if (filtros.linhaId) params.append('linhaId', filtros.linhaId);
    if (filtros.status) params.append('status', filtros.status);

    const [viagensRes, linhasRes] = await Promise.all([
      fetch(`http://localhost:3000/api/admin/viagens?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }),
      fetch('http://localhost:3000/api/admin/linhas', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
    ]);

    const viagensData = await viagensRes.json();
const linhasData = await linhasRes.json();

console.log('📋 Dados de linhas recebidos:', linhasData);

// Se linhasData JÁ é um array, usa direto
const linhasArray = Array.isArray(linhasData) 
  ? linhasData 
  : (linhasData.value || linhasData.linhas || []);

console.log('✅ Array de linhas:', linhasArray);

setViagens(viagensData.viagens || []);
setLinhas(linhasArray);
    
    console.log('✅ Linhas no estado:', linhasData.value || linhasData.linhas || []); // ✅ LOG
  } catch (error) {
    console.error('❌ Erro ao buscar dados:', error);
  } finally {
    setLoading(false);
  }
};

  const buscarPassageiros = async (linhaId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/admin/viagens/passageiros/${linhaId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setPassageirosDisponiveis(data.passageiros || []);
    } catch (error) {
      console.error('Erro ao buscar passageiros:', error);
      setPassageirosDisponiveis([]);
    }
  };

  const handleLinhaSelecionada = (linhaId) => {
    setNovaViagem({ ...novaViagem, linhaId, passageirosIds: [] });
    if (linhaId) {
      buscarPassageiros(linhaId);
    } else {
      setPassageirosDisponiveis([]);
    }
  };

  const togglePassageiro = (passageiroId) => {
    setNovaViagem(prev => ({
      ...prev,
      passageirosIds: prev.passageirosIds.includes(passageiroId)
        ? prev.passageirosIds.filter(id => id !== passageiroId)
        : [...prev.passageirosIds, passageiroId]
    }));
  };

  const selecionarTodos = () => {
    setNovaViagem(prev => ({
      ...prev,
      passageirosIds: passageirosDisponiveis.map(p => p.id)
    }));
  };

  const desmarcarTodos = () => {
    setNovaViagem(prev => ({ ...prev, passageirosIds: [] }));
  };

 const criarViagem = async () => {
  if (!novaViagem.linhaId || !novaViagem.data) {
    alert('Linha e data são obrigatórios');
    return;
  }

  if (novaViagem.passageirosIds.length === 0) {
    if (!window.confirm('Nenhum passageiro selecionado. Deseja criar a viagem mesmo assim?')) {
      return;
    }
  }

  try {
    const token = localStorage.getItem('token');
    const response = await fetch('http://localhost:3000/api/admin/viagens', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(novaViagem)
    });

    if (response.ok) {
      const data = await response.json();
      
      // ✅ Mostrar o token gerado
      if (data.viagem.token) {
        alert(`✅ Viagem criada com sucesso!\n\n🔑 Token do QR Code:\n${data.viagem.token}\n\n⚠️ Guarde este token! Ele será usado pelos passageiros.`);
      } else {
        alert('✅ Viagem criada com sucesso!');
      }
      
      setModalAberto(false);
      setNovaViagem({ linhaId: '', data: '', passageirosIds: [] });
      buscarDados();
    } else {
      const error = await response.json();
      alert('❌ ' + error.error);
    }
  } catch (error) {
    console.error('Erro ao criar viagem:', error);
    alert('❌ Erro ao criar viagem');
  }
};

  const verDetalhes = async (viagemId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/admin/viagens/${viagemId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setViagemSelecionada(data);
      setDetalhesAberto(true);
    } catch (error) {
      console.error('Erro ao buscar detalhes:', error);
    }
  };

  const deletarViagem = async (viagemId) => {
    if (!window.confirm('Tem certeza que deseja deletar esta viagem?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/admin/viagens/${viagemId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        alert('✅ Viagem deletada!');
        buscarDados();
      } else {
        const error = await response.json();
        alert('❌ ' + error.error);
      }
    } catch (error) {
      console.error('Erro ao deletar:', error);
      alert('❌ Erro ao deletar viagem');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PLANEJADA': return 'bg-blue-100 text-blue-700';
      case 'EM_ANDAMENTO': return 'bg-green-100 text-green-700';
      case 'FINALIZADA': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'PLANEJADA': return 'Planejada';
      case 'EM_ANDAMENTO': return 'Em Andamento';
      case 'FINALIZADA': return 'Finalizada';
      default: return status;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />

      <main className="flex-1 p-8 ml-64">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <Calendar size={32} className="text-blue-600" />
            Gerenciar Viagens
          </h1>
          <p className="text-gray-600 mt-2">Crie e gerencie viagens do sistema</p>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Filter size={20} className="text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-800">Filtros</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data Início
              </label>
              <input
                type="date"
                value={filtros.dataInicio}
                onChange={(e) => setFiltros({ ...filtros, dataInicio: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data Fim
              </label>
              <input
                type="date"
                value={filtros.dataFim}
                onChange={(e) => setFiltros({ ...filtros, dataFim: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Linha
              </label>
              <select
                value={filtros.linhaId}
                onChange={(e) => setFiltros({ ...filtros, linhaId: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todas</option>
                {linhas.map(linha => (
                  <option key={linha.id} value={linha.id}>{linha.nome}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={filtros.status}
                onChange={(e) => setFiltros({ ...filtros, status: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todos</option>
                <option value="PLANEJADA">Planejada</option>
                <option value="EM_ANDAMENTO">Em Andamento</option>
                <option value="FINALIZADA">Finalizada</option>
              </select>
            </div>
          </div>
        </div>

        {/* Botão Nova Viagem */}
        <button
          onClick={() => setModalAberto(true)}
          className="mb-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg transition flex items-center gap-2"
        >
          <Plus size={20} />
          Nova Viagem
        </button>

        {/* Lista de Viagens */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : viagens.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">Nenhuma viagem encontrada</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Data</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Linha</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Motorista</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Passageiros</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Ações</th>
                </tr>
              </thead>
              <tbody>
                {viagens.map((viagem) => (
                  <tr key={viagem.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-800">
                      {new Date(viagem.data).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-800">
                      {viagem.linha_nome}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {viagem.motorista_nome || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(viagem.status)}`}>
                        {getStatusText(viagem.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {viagem.total_embarcados || 0} / {viagem.total_planejado || 0}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => verDetalhes(viagem.id)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Ver detalhes"
                        >
                          <Eye size={18} />
                        </button>
                        {viagem.status === 'PLANEJADA' && (
                          <button
                            onClick={() => deletarViagem(viagem.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Deletar"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal Nova Viagem */}
        {modalAberto && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
                <h2 className="text-2xl font-bold text-gray-800">Nova Viagem</h2>
                <button
                  onClick={() => setModalAberto(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Linha */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Linha *
                  </label>
                  <select
                    value={novaViagem.linhaId}
                    onChange={(e) => handleLinhaSelecionada(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Selecione uma linha</option>
                    {linhas.map(linha => (
                      <option key={linha.id} value={linha.id}>{linha.nome}</option>
                    ))}
                  </select>
                </div>

                {/* Data */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data *
                  </label>
                  <input
                    type="date"
                    value={novaViagem.data}
                    onChange={(e) => setNovaViagem({ ...novaViagem, data: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Passageiros */}
                {novaViagem.linhaId && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-sm font-medium text-gray-700">
                        Passageiros ({novaViagem.passageirosIds.length} selecionados)
                      </label>
                      <div className="flex gap-2">
                        <button
                          onClick={selecionarTodos}
                          className="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition"
                        >
                          Selecionar Todos
                        </button>
                        <button
                          onClick={desmarcarTodos}
                          className="text-xs px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                        >
                          Desmarcar Todos
                        </button>
                      </div>
                    </div>

                    <div className="border border-gray-200 rounded-lg max-h-60 overflow-y-auto">
                      {passageirosDisponiveis.length === 0 ? (
                        <p className="text-center text-gray-500 py-8">
                          Nenhum passageiro disponível para esta linha
                        </p>
                      ) : (
                        <div className="divide-y divide-gray-100">
                          {passageirosDisponiveis.map((passageiro) => (
                            <label
                              key={passageiro.id}
                              className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={novaViagem.passageirosIds.includes(passageiro.id)}
                                onChange={() => togglePassageiro(passageiro.id)}
                                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                              />
                              <div className="flex-1">
                                <p className="font-medium text-gray-800">{passageiro.nome}</p>
                                <p className="text-xs text-gray-500">{passageiro.ponto_nome || 'Sem ponto'}</p>
                              </div>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-gray-200 flex gap-3 sticky bottom-0 bg-white">
                <button
                  onClick={() => setModalAberto(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={criarViagem}
                  className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
                >
                  Criar Viagem
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Detalhes */}
        {detalhesAberto && viagemSelecionada && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
                <h2 className="text-2xl font-bold text-gray-800">Detalhes da Viagem</h2>
                <button
                  onClick={() => setDetalhesAberto(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Info da Viagem */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Data</p>
                    <p className="font-semibold text-gray-800">
                      {new Date(viagemSelecionada.viagem.data).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Linha</p>
                    <p className="font-semibold text-gray-800">{viagemSelecionada.viagem.linha_nome}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(viagemSelecionada.viagem.status)}`}>
                      {getStatusText(viagemSelecionada.viagem.status)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Motorista</p>
                    <p className="font-semibold text-gray-800">{viagemSelecionada.viagem.motorista_nome || '-'}</p>
                  </div>
                </div>

                {/* Passageiros */}
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">
                    Passageiros ({viagemSelecionada.passageiros.length})
                  </h3>
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Nome</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Ponto</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {viagemSelecionada.passageiros.map((p) => (
                          <tr key={p.id}>
                            <td className="px-4 py-3 text-sm text-gray-800">{p.passageiro_nome}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{p.ponto_nome || '-'}</td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                p.status === 'EMBARCADO' ? 'bg-green-100 text-green-700' : 
                                p.status === 'DESEMBARCADO' ? 'bg-blue-100 text-blue-700' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                                {p.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}