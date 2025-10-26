import { useState, useEffect } from 'react';

export default function VehicleModal({ isOpen, onClose, vehicle, onSave }) {
  const [formData, setFormData] = useState({
    modelo: '',
    marca: '',
    cor: '',
    acentos: '',
    placa: '',
    tipo: 'Van'
  });

  useEffect(() => {
    if (vehicle) {
      setFormData({
        modelo: vehicle.modelo || '',
        marca: vehicle.marca || '',
        cor: vehicle.cor || '',
        acentos: vehicle.acentos || '',
        placa: vehicle.placa || '',
        tipo: vehicle.tipo || 'Van'
      });
    } else {
      setFormData({
        modelo: '',
        marca: '',
        cor: '',
        acentos: '',
        placa: '',
        tipo: 'Van'
      });
    }
  }, [vehicle]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = () => {
    if (!formData.modelo || !formData.placa) {
      alert('⚠️ Preencha os campos obrigatórios!');
      return;
    }
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
      <div className="w-full max-w-4xl bg-gradient-to-br from-green-800 to-green-700 rounded-3xl shadow-2xl p-12">
        
        <h1 className="text-4xl font-bold text-white text-center mb-8">
          Editar Veículo
        </h1>

        <div className="grid grid-cols-2 gap-6 mb-8">
          {/* Coluna Esquerda */}
          <div className="space-y-4">
            <input
              type="text"
              name="modelo"
              placeholder="Modelo"
              value={formData.modelo}
              onChange={handleChange}
              className="w-full px-6 py-4 rounded-full bg-green-50 text-green-900 placeholder-gray-500 font-medium focus:outline-none focus:ring-2 focus:ring-white"
            />

            <input
              type="text"
              name="marca"
              placeholder="Marca"
              value={formData.marca}
              onChange={handleChange}
              className="w-full px-6 py-4 rounded-full bg-green-50 text-green-900 placeholder-gray-500 font-medium focus:outline-none focus:ring-2 focus:ring-white"
            />

            <input
              type="text"
              name="cor"
              placeholder="Cor"
              value={formData.cor}
              onChange={handleChange}
              className="w-full px-6 py-4 rounded-full bg-green-50 text-green-900 placeholder-gray-500 font-medium focus:outline-none focus:ring-2 focus:ring-white"
            />
          </div>

          {/* Coluna Direita */}
          <div className="space-y-4">
            <input
              type="number"
              name="acentos"
              placeholder="Acentos"
              value={formData.acentos}
              onChange={handleChange}
              className="w-full px-6 py-4 rounded-full bg-green-50 text-green-900 placeholder-gray-500 font-medium focus:outline-none focus:ring-2 focus:ring-white"
            />

            <input
              type="text"
              name="placa"
              placeholder="Placa"
              value={formData.placa}
              onChange={handleChange}
              maxLength={8}
              className="w-full px-6 py-4 rounded-full bg-green-50 text-green-900 placeholder-gray-500 font-medium focus:outline-none focus:ring-2 focus:ring-white"
            />

            <select
              name="tipo"
              value={formData.tipo}
              onChange={handleChange}
              className="w-full px-6 py-4 rounded-full bg-green-50 text-green-900 font-medium focus:outline-none focus:ring-2 focus:ring-white"
            >
              <option value="Van">Van</option>
              <option value="Ônibus">Ônibus</option>
              <option value="Micro-ônibus">Micro-ônibus</option>
            </select>
          </div>
        </div>

        {/* Botões */}
        <div className="flex justify-center space-x-4">
          <button
            onClick={onClose}
            className="px-12 py-4 bg-green-50 hover:bg-white text-green-800 font-bold rounded-full transition shadow-lg"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="px-12 py-4 bg-green-50 hover:bg-white text-green-800 font-bold rounded-full transition shadow-lg"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}