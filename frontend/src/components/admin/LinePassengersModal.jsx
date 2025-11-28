import { useState, useEffect } from 'react';
import axios from 'axios';
import LineDetailsModal from './LineDetailsModal';

export default function LinePassengersModal({ isOpen, onClose, linha }) {
  const [passageiros, setPassageiros] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);

  useEffect(() => {
    if (isOpen && linha) {
      loadPassengers();
    }
  }, [isOpen, linha]);

  const loadPassengers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:3000/api/admin/linhas/${linha.id}/passageiros`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPassageiros(response.data.passageiros || []);
    } catch (error) {
      console.error('Erro ao carregar passageiros:', error);
      setPassageiros([]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <>
      {/* Modal de Passageiros */}
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
        <div className="w-full max-w-5xl bg-gradient-to-br from-green-800 to-green-700 rounded-3xl shadow-2xl p-12">
          
          <div className="flex items-center justify-between mb-8">
            <button 
              onClick={onClose}
              className="text-white text-4xl hover:opacity-80 transition"
            >
              ↩
            </button>

            <h1 className="text-4xl font-bold text-white text-center flex-1">
              Passageiros Linha {linha?.id}
            </h1>

            <button 
              onClick={() => {
                console.log('Abrindo configurações...');
                setShowConfigModal(true);
              }}
              className="text-white text-4xl hover:opacity-80 transition"
            >
              ⚙️
            </button>
          </div>

          <div className="bg-white/10 backdrop-blur rounded-2xl overflow-hidden">
            <table className="w-full text-white">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="px-6 py-4 text-left font-bold">Passageiro</th>
                  <th className="px-6 py-4 text-left font-bold">Ponto</th>
                  <th className="px-6 py-4 text-left font-bold">Universidade</th>
                  <th className="px-6 py-4 text-left font-bold">Curso</th>
                </tr>
              </thead>
              <tbody>
                {passageiros.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-12 text-green-200">
                      Nenhum passageiro aprovado nesta linha
                    </td>
                  </tr>
                ) : (
                  passageiros.map((p, idx) => (
                    <tr key={idx} className="border-b border-white/10 hover:bg-white/5">
                      <td className="px-6 py-4">{p.nome}</td>
                      <td className="px-6 py-4">{p.ponto_nome}</td>
                      <td className="px-6 py-4">{p.universidade || 'N/A'}</td>
                      <td className="px-6 py-4">{p.curso || 'N/A'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex justify-center mt-8">
            <button
              onClick={onClose}
              className="px-16 py-4 bg-green-50 hover:bg-white text-green-800 font-bold rounded-full transition shadow-lg"
            >
              OK
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Configuração */}
      {showConfigModal && (
        <LineDetailsModal
          isOpen={showConfigModal}
          onClose={() => setShowConfigModal(false)}
          linha={linha}
          onSave={(data) => {
            console.log('Configurações salvas:', data);
            setShowConfigModal(false);
          }}
        />
      )}
    </>
  );
}