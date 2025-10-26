import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import * as driverService from '../../services/driverService';
import Sidebar from '../../components/driver/Sidebar';

export default function SendMessage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [titulo, setTitulo] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [sending, setSending] = useState(false);

  // Templates rápidos
  const templates = [
    {
      titulo: '🚌 Veículo em rota',
      corpo: 'O ônibus está a caminho! Aguarde no ponto de embarque.'
    },
    {
      titulo: '⏰ Atraso previsto',
      corpo: 'Prezados passageiros, haverá um atraso de aproximadamente 15 minutos. Pedimos desculpas pelo transtorno.'
    },
    {
      titulo: '✅ Chegando ao ponto',
      corpo: 'Estamos chegando ao seu ponto de embarque. Por favor, estejam prontos.'
    },
    {
      titulo: '🚦 Trânsito intenso',
      corpo: 'Atenção: trânsito intenso na rota. Pode haver pequenos atrasos.'
    },
    {
      titulo: '⚠️ Mudança de itinerário',
      corpo: 'Atenção passageiros: devido a imprevistos, houve alteração no itinerário da viagem.'
    }
  ];

  const handleUseTemplate = (template) => {
    setTitulo(template.titulo);
    setMensagem(template.corpo);
  };

  const handleSend = async () => {
    if (!titulo.trim() || !mensagem.trim()) {
      alert('⚠️ Preencha título e mensagem!');
      return;
    }

    if (!confirm('Enviar esta mensagem para todos os passageiros?')) return;

    try {
      setSending(true);
      await driverService.sendMessage(titulo, mensagem);
      alert('✅ Mensagem enviada com sucesso!');
      setTitulo('');
      setMensagem('');
    } catch (err) {
      alert(err.response?.data?.error || 'Erro ao enviar mensagem');
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-green-50">
      <Sidebar />

      {/* Header com Badge */}
      <div className="fixed top-4 right-4 z-30">
        <div className="bg-green-700 text-white rounded-full px-6 py-3 shadow-lg flex items-center space-x-3">
          <div>
            <p className="text-sm font-semibold">{user?.nome || 'Motorista'}</p>
            <p className="text-xs text-green-200">Enviar Mensagem</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-green-700 font-bold">
            {user?.nome?.charAt(0) || 'M'}
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto space-y-6">
          
          {/* Título da Página */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">💬 Enviar Mensagem</h1>
            <p className="text-gray-600 mt-2">Notifique todos os passageiros da viagem</p>
          </div>

          {/* Templates Rápidos */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="font-bold text-lg mb-4 text-gray-800">⚡ Mensagens Rápidas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {templates.map((template, idx) => (
                <button
                  key={idx}
                  onClick={() => handleUseTemplate(template)}
                  className="p-4 bg-green-50 hover:bg-green-100 rounded-lg text-left transition border-2 border-transparent hover:border-green-600"
                >
                  <p className="font-semibold text-gray-800">{template.titulo}</p>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{template.corpo}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Formulário de Mensagem */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="font-bold text-lg mb-4 text-gray-800">✏️ Mensagem Personalizada</h3>
            
            {/* Título */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Título da Mensagem
              </label>
              <input
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ex: Veículo em rota"
                maxLength={100}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-600 focus:outline-none transition"
              />
              <p className="text-xs text-gray-500 mt-1">{titulo.length}/100 caracteres</p>
            </div>

            {/* Mensagem */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Conteúdo da Mensagem
              </label>
              <textarea
                value={mensagem}
                onChange={(e) => setMensagem(e.target.value)}
                placeholder="Digite a mensagem aqui..."
                rows={6}
                maxLength={500}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-600 focus:outline-none transition resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">{mensagem.length}/500 caracteres</p>
            </div>

            {/* Preview */}
            {(titulo || mensagem) && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
                <p className="text-xs text-gray-500 mb-2">📱 Preview da Notificação:</p>
                <div className="bg-white p-4 rounded-lg shadow">
                  <p className="font-bold text-gray-800">{titulo || 'Título da mensagem'}</p>
                  <p className="text-sm text-gray-600 mt-1">{mensagem || 'Conteúdo da mensagem'}</p>
                </div>
              </div>
            )}

            {/* Botões */}
            <div className="flex space-x-3">
              <button
                onClick={() => navigate('/motorista')}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-4 rounded-lg transition"
              >
                ← Voltar
              </button>
              
              <button
                onClick={handleSend}
                disabled={sending || !titulo.trim() || !mensagem.trim()}
                className="flex-1 bg-green-700 hover:bg-green-600 text-white font-bold py-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sending ? '📤 Enviando...' : '📤 Enviar Mensagem'}
              </button>
            </div>
          </div>

          {/* Informações */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
            <p className="text-blue-800 text-sm">
              <strong>💡 Dica:</strong> As mensagens são enviadas como notificações push para todos os passageiros da viagem atual.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}