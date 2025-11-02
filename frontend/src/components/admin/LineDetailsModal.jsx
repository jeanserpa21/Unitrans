import { useState, useEffect } from 'react';
import axios from 'axios';

export default function LineDetailsModal({ isOpen, onClose, linha, onSave }) {
  console.log('🔧 LineDetailsModal renderizado!', { isOpen, linha });
  
  const [formData, setFormData] = useState({
    horario_inicio: '05:00',
    horario_fim: '16:30'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (linha && isOpen) {
      loadLineData();
    }
  }, [linha, isOpen]);

  const loadLineData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:3000/api/admin/linhas`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const linhaData = response.data.linhas?.find(l => l.id === linha.id);
      if (linhaData) {
        setFormData({
          horario_inicio: linhaData.horario_inicio || '05:00',
          horario_fim: linhaData.horario_fim || '16:30'
        });
      }
    } catch (error) {
      console.error('Erro ao carregar dados da linha:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      await axios.put(
        `http://localhost:3000/api/admin/linhas/${linha.id}/configuracao`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      alert('✅ Configurações salvas com sucesso!');
      if (onSave) onSave(formData);
      onClose();
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('❌ Erro ao salvar configurações');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-6">
      <div className="w-full max-w-3xl bg-gradient-to-br from-green-800 to-green-700 rounded-3xl shadow-2xl p-12">
        
        {/* Botão Voltar */}
        <button 
          onClick={onClose}
          className="text-white text-4xl hover:opacity-80 transition mb-4"
        >
          ↩
        </button>

        <h1 className="text-4xl font-bold text-white text-center mb-8">
          Configurações Linha {linha?.id}
        </h1>

        <div className="space-y-6">
          
          {/* Contato WhatsApp */}
          <div>
            <p className="text-white text-center mb-3">
              Contato WhatsApp da linha
            </p>
            <a
              href="https://wa.me/5547992502857?text=Olá,%20podem%20me%20ajudar?"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center bg-green-50 hover:bg-white rounded-full px-6 py-4 transition cursor-pointer group"
            >
              <span className="text-green-700 text-2xl mr-3">📱</span>
              <span className="flex-1 text-green-900 font-medium group-hover:text-green-700">
                (47) 99250-2857
              </span>
              <span className="text-green-700 text-sm">Clique para enviar mensagem →</span>
            </a>
          </div>

          {/* Horários */}
          <div>
            <p className="text-white text-center mb-3">
              Horários de início e fim da linha
            </p>
            <div className="flex space-x-4">
              <div className="flex-1 flex items-center bg-green-50 rounded-full px-6 py-4">
                <span className="text-green-700 text-2xl mr-3">🕐</span>
                <input
                  type="time"
                  name="horario_inicio"
                  value={formData.horario_inicio}
                  onChange={handleChange}
                  className="flex-1 bg-transparent text-green-900 font-medium focus:outline-none"
                />
              </div>

              <div className="flex-1 flex items-center bg-green-50 rounded-full px-6 py-4">
                <span className="text-green-700 text-2xl mr-3">🕐</span>
                <input
                  type="time"
                  name="horario_fim"
                  value={formData.horario_fim}
                  onChange={handleChange}
                  className="flex-1 bg-transparent text-green-900 font-medium focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Botão Salvar */}
          <div className="flex justify-center pt-4">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-16 py-4 bg-green-50 hover:bg-white text-green-800 font-bold rounded-full transition shadow-lg disabled:opacity-50"
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
