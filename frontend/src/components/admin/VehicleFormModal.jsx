import { useState, useEffect } from 'react';

export default function VehicleFormModal({ isOpen, onClose, vehicle, onSave }) {
  const [formData, setFormData] = useState({
    placa: '',
    modelo: '',
    capacidade: '',
    marca: '',
    ano: '',
    cor: '',
    tipo: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (vehicle) {
      setFormData({
        placa: vehicle.placa || '',
        modelo: vehicle.modelo || '',
        capacidade: vehicle.capacidade || '',
        marca: vehicle.marca || '',
        ano: vehicle.ano || '',
        cor: vehicle.cor || '',
        tipo: vehicle.tipo || ''
      });
    } else {
      setFormData({
        placa: '',
        modelo: '',
        capacidade: '',
        marca: '',
        ano: '',
        cor: '',
        tipo: ''
      });
    }
  }, [vehicle, isOpen]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async () => {
    // Validações
    if (!formData.placa || !formData.capacidade) {
      alert('⚠️ Preencha os campos obrigatórios: Placa e Capacidade');
      return;
    }

    if (formData.capacidade < 1) {
      alert('⚠️ Capacidade deve ser maior que 0');
      return;
    }

    setLoading(true);
    await onSave(formData);
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
      <div className="w-full max-w-3xl bg-gradient-to-br from-green-800 to-green-700 rounded-3xl shadow-2xl p-12">
        
        {/* Botão Voltar */}
        <button 
          onClick={onClose}
          className="text-white text-4xl hover:opacity-80 transition mb-4"
        >
          ↩
        </button>

        <h1 className="text-4xl font-bold text-white text-center mb-8">
          {vehicle ? 'Editar Veículo' : 'Cadastrar Veículo'}
        </h1>

        <div className="grid grid-cols-2 gap-4">
          
          {/* Placa */}
          <div>
            <input
              type="text"
              name="placa"
              placeholder="Placa *"
              value={formData.placa}
              onChange={handleChange}
              maxLength={20}
              className="w-full px-6 py-4 rounded-full bg-green-50 text-green-900 font-medium placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
            />
          </div>

          {/* Modelo */}
          <div>
            <input
              type="text"
              name="modelo"
              placeholder="Modelo"
              value={formData.modelo}
              onChange={handleChange}
              maxLength={100}
              className="w-full px-6 py-4 rounded-full bg-green-50 text-green-900 font-medium placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
            />
          </div>

          {/* Marca */}
          <div>
            <input
              type="text"
              name="marca"
              placeholder="Marca"
              value={formData.marca}
              onChange={handleChange}
              maxLength={100}
              className="w-full px-6 py-4 rounded-full bg-green-50 text-green-900 font-medium placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
            />
          </div>

          {/* Capacidade */}
          <div>
            <input
              type="number"
              name="capacidade"
              placeholder="Capacidade *"
              value={formData.capacidade}
              onChange={handleChange}
              min="1"
              className="w-full px-6 py-4 rounded-full bg-green-50 text-green-900 font-medium placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
            />
          </div>

          {/* Ano */}
          <div>
            <input
              type="number"
              name="ano"
              placeholder="Ano"
              value={formData.ano}
              onChange={handleChange}
              min="1900"
              max="2100"
              className="w-full px-6 py-4 rounded-full bg-green-50 text-green-900 font-medium placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
            />
          </div>

          {/* Cor */}
          <div>
            <input
              type="text"
              name="cor"
              placeholder="Cor"
              value={formData.cor}
              onChange={handleChange}
              maxLength={50}
              className="w-full px-6 py-4 rounded-full bg-green-50 text-green-900 font-medium placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
            />
          </div>

          {/* Tipo */}
          <div className="col-span-2">
            <select
              name="tipo"
              value={formData.tipo}
              onChange={handleChange}
              className="w-full px-6 py-4 rounded-full bg-green-50 text-green-900 font-medium focus:outline-none focus:ring-2 focus:ring-white"
            >
              <option value="">Selecione o tipo</option>
              <option value="Ônibus">Ônibus</option>
              <option value="Van">Van</option>
              <option value="Micro-ônibus">Micro-ônibus</option>
            </select>
          </div>

        </div>

        {/* Botão Salvar */}
        <div className="flex justify-center mt-8">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-16 py-4 bg-green-50 hover:bg-white text-green-800 font-bold rounded-full transition shadow-lg disabled:opacity-50"
          >
            {loading ? 'Salvando...' : 'Salvar'}
          </button>
        </div>

        <p className="text-white text-center text-sm mt-4">
          * Campos obrigatórios
        </p>

      </div>
    </div>
  );
}