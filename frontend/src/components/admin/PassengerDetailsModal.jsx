export default function PassengerDetailsModal({ isOpen, onClose, passenger, onApprove, onReject }) {
  if (!isOpen || !passenger) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
      <div className="w-full max-w-4xl bg-gradient-to-br from-green-800 to-green-700 rounded-3xl shadow-2xl p-12">
        
        {/* Botão Voltar */}
        <button 
          onClick={onClose}
          className="text-white text-4xl hover:opacity-80 transition mb-6"
        >
          ↩
        </button>

        <h1 className="text-3xl font-bold text-white text-center mb-8">
          Aguardando Aprovação
        </h1>

        <div className="grid grid-cols-2 gap-6 mb-8">
          
          {/* Coluna Esquerda */}
          <div className="space-y-4">
            <input
              type="text"
              value={passenger.nome || ''}
              readOnly
              placeholder="Nome Completo"
              className="w-full px-6 py-4 rounded-full bg-green-50 text-green-900 font-medium"
            />

            <input
              type="text"
              value={passenger.telefone || 'Não informado'}
              readOnly
              placeholder="Telefone"
              className="w-full px-6 py-4 rounded-full bg-green-50 text-green-900 font-medium"
            />

            <input
              type="text"
              value={passenger.cpf || 'Não informado'}
              readOnly
              placeholder="Cpf"
              className="w-full px-6 py-4 rounded-full bg-green-50 text-green-900 font-medium"
            />

            <input
              type="text"
              value={passenger.email || ''}
              readOnly
              placeholder="E-mail"
              className="w-full px-6 py-4 rounded-full bg-green-50 text-green-900 font-medium"
            />

            <input
              type="text"
              value={passenger.dias_uso || 'seg,ter,qua,qui,sex'}
              readOnly
              placeholder="seg,ter,qua,qui,sex"
              className="w-full px-6 py-4 rounded-full bg-green-50 text-green-900 font-medium"
            />
          </div>

          {/* Coluna Direita */}
          <div className="space-y-4">
            <input
              type="text"
              value={passenger.universidade || 'FURB'}
              readOnly
              placeholder="Universidade"
              className="w-full px-6 py-4 rounded-full bg-green-50 text-green-900 font-medium"
            />

            <input
              type="text"
              value={passenger.curso || 'Não informado'}
              readOnly
              placeholder="Curso"
              className="w-full px-6 py-4 rounded-full bg-green-50 text-green-900 font-medium"
            />

            {/* Comprovante de Residência */}
            <div className="space-y-2">
              <div className="flex items-center justify-between bg-green-50 rounded-full px-6 py-4">
                <span className="text-green-900 font-medium">Comprovante de Residência</span>
                <button className="text-green-700 text-xl">📄</button>
              </div>

              {/* Comprovante de Matrícula */}
              <div className="flex items-center justify-between bg-green-50 rounded-full px-6 py-4">
                <span className="text-green-900 font-medium">Comprovante de Matrícula</span>
                <button className="text-green-700 text-xl">📄</button>
              </div>

              {/* Espelho de Matrícula */}
              <div className="flex items-center justify-between bg-green-50 rounded-full px-6 py-4">
                <span className="text-green-900 font-medium">Espelho de Matrícula</span>
                <button className="text-green-700 text-xl">📄</button>
              </div>
            </div>
          </div>

        </div>

        {/* Botões de Ação */}
        {!passenger.aprovado && (
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => onApprove(passenger.id)}
              className="px-12 py-4 bg-green-50 hover:bg-white text-green-800 font-bold rounded-full transition shadow-lg flex items-center space-x-2"
            >
              <span>Aprovar</span>
              <span>✅</span>
            </button>
            <button
              onClick={() => onReject(passenger.id)}
              className="px-12 py-4 bg-red-500 hover:bg-red-600 text-white font-bold rounded-full transition shadow-lg flex items-center space-x-2"
            >
              <span>Negar</span>
              <span>❌</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
}