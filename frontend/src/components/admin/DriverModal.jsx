import { useState, useEffect } from 'react';

export default function DriverModal({ isOpen, onClose, driver, onSave }) {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    cpf: '',
    cnh: '',
    tipo_habilitacao: 'B',
    senha: ''
  });

  useEffect(() => {
    if (driver) {
      setFormData({
        nome: driver.nome || '',
        email: driver.email || '',
        cpf: driver.cpf || '',
        cnh: driver.cnh || '',
        tipo_habilitacao: driver.tipo_habilitacao || 'B',
        senha: '' // Não preencher senha ao editar
      });
    } else {
      setFormData({
        nome: '',
        email: '',
        cpf: '',
        cnh: '',
        tipo_habilitacao: 'B',
        senha: ''
      });
    }
  }, [driver]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = () => {
    if (!formData.nome || !formData.email || !formData.cpf) {
      alert('⚠️ Preencha os campos obrigatórios!');
      return;
    }

    // Senha obrigatória apenas no cadastro
    if (!driver && !formData.senha) {
      alert('⚠️ A senha é obrigatória para novos motoristas!');
      return;
    }

    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
      <div className="w-full max-w-4xl bg-gradient-to-br from-green-800 to-green-700 rounded-3xl shadow-2xl p-12">
        <h1 className="text-4xl font-bold text-white text-center mb-8">
          {driver ? 'Editar motorista' : 'Cadastrar motorista'}
        </h1>

        <div className="grid grid-cols-2 gap-6 mb-8">
          {/* Coluna Esquerda */}
          <div className="space-y-4">
            <input
              type="text"
              name="nome"
              placeholder="Nome"
              value={formData.nome}
              onChange={handleChange}
              className="w-full px-6 py-4 rounded-full bg-green-50 text-green-900 placeholder-gray-500 font-medium focus:outline-none focus:ring-2 focus:ring-white"
            />

            <input
              type="email"
              name="email"
              placeholder="E-mail"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-6 py-4 rounded-full bg-green-50 text-green-900 placeholder-gray-500 font-medium focus:outline-none focus:ring-2 focus:ring-white"
            />

            <input
              type="text"
              name="cpf"
              placeholder="CPF"
              value={formData.cpf}
              onChange={handleChange}
              maxLength={14}
              className="w-full px-6 py-4 rounded-full bg-green-50 text-green-900 placeholder-gray-500 font-medium focus:outline-none focus:ring-2 focus:ring-white"
            />

            {/* NOVO CAMPO DE SENHA */}
            <input
              type="password"
              name="senha"
              placeholder={driver ? "Nova Senha (deixe em branco para manter)" : "Senha"}
              value={formData.senha}
              onChange={handleChange}
              className="w-full px-6 py-4 rounded-full bg-green-50 text-green-900 placeholder-gray-500 font-medium focus:outline-none focus:ring-2 focus:ring-white"
            />
          </div>

          {/* Coluna Direita */}
          <div className="space-y-4">
            <input
              type="text"
              name="cnh"
              placeholder="CNH"
              value={formData.cnh}
              onChange={handleChange}
              className="w-full px-6 py-4 rounded-full bg-green-50 text-green-900 placeholder-gray-500 font-medium focus:outline-none focus:ring-2 focus:ring-white"
            />

            <select
              name="tipo_habilitacao"
              value={formData.tipo_habilitacao}
              onChange={handleChange}
              className="w-full px-6 py-4 rounded-full bg-green-50 text-green-900 font-medium focus:outline-none focus:ring-2 focus:ring-white"
            >
              <option value="">Tipo Habilitação</option>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
              <option value="D">D</option>
              <option value="E">E</option>
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
