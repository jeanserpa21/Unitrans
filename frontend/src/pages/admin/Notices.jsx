import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as adminService from '../../services/adminService';

export default function NoticesPage() {
  const navigate = useNavigate();
  const [linhas, setLinhas] = useState([]);
  const [selectedLinhas, setSelectedLinhas] = useState([]);
  const [titulo, setTitulo] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLinhas();
  }, []);

  const loadLinhas = async () => {
    try {
      const data = await adminService.getDashboard();
      setLinhas(data.linhas || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleLinha = (linhaId) => {
    setSelectedLinhas(prev => 
      prev.includes(linhaId)
        ? prev.filter(id => id !== linhaId)
        : [...prev, linhaId]
    );
  };

  const handleEnviar = async () => {
    if (!titulo.trim() || !mensagem.trim()) {
      alert('⚠️ Preencha título e mensagem!');
      return;
    }

    if (selectedLinhas.length === 0) {
      alert('⚠️ Selecione pelo menos uma linha!');
      return;
    }

    alert(`✅ Aviso enviado para ${selectedLinhas.length} linha(s)!`);
    setTitulo('');
    setMensagem('');
    setSelectedLinhas([]);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center p-6">
      <div className="w-full max-w-4xl bg-gradient-to-br from-green-800 to-green-700 rounded-3xl shadow-2xl p-12">
        
        {/* Botão Voltar */}
        <button 
          onClick={() => navigate('/admin')}
          className="text-white text-4xl hover:opacity-80 transition mb-6"
        >
          ↩
        </button>

        <h1 className="text-4xl font-bold text-white text-center mb-8">Avisos</h1>

        <div className="grid grid-cols-2 gap-8">
          
          {/* Coluna Esquerda - Seleção de Linhas */}
          <div className="space-y-4">
            <h3 className="text-white font-bold text-lg mb-4">Selecione a Linha</h3>
            {linhas.map((linha) => (
              <label
                key={linha.id}
                className="flex items-center space-x-3 text-white cursor-pointer hover:bg-white/10 p-2 rounded transition"
              >
                <input
                  type="checkbox"
                  checked={selectedLinhas.includes(linha.id)}
                  onChange={() => toggleLinha(linha.id)}
                  className="w-5 h-5 rounded border-2 border-white"
                />
                <span>Linha {linha.id}</span>
              </label>
            ))}
          </div>

          {/* Coluna Direita - Formulário */}
          <div className="space-y-4">
            {/* Título */}
            <input
              type="text"
              placeholder="Título"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="w-full px-6 py-4 rounded-full bg-green-50 text-green-900 placeholder-gray-500 font-medium focus:outline-none focus:ring-2 focus:ring-white"
            />

            {/* Mensagem */}
            <textarea
              placeholder="Mensagem"
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
              rows={8}
              className="w-full px-6 py-4 rounded-3xl bg-green-50 text-green-900 placeholder-gray-500 font-medium focus:outline-none focus:ring-2 focus:ring-white resize-none"
            />

            {/* Botão Enviar */}
            <button
              onClick={handleEnviar}
              className="w-full bg-green-50 hover:bg-white text-green-800 font-bold py-4 rounded-full transition shadow-lg"
            >
              Enviar
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}