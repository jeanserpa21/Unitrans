import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  ArrowLeft,
  User,
  Mail,
  Phone,
  CreditCard,
  BookOpen,
  MapPin,
  Calendar,
  Edit2,
  Save,
  X,
  Check,
  Building2,
  Clock
} from 'lucide-react';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [perfil, setPerfil] = useState(null);
  const [formData, setFormData] = useState({
    nome: '',
    telefone: '',
    curso: '',
    dias_transporte: []
  });

  const diasSemana = [
    { value: 'SEG', label: 'Segunda' },
    { value: 'TER', label: 'Terça' },
    { value: 'QUA', label: 'Quarta' },
    { value: 'QUI', label: 'Quinta' },
    { value: 'SEX', label: 'Sexta' }
  ];

  useEffect(() => {
    buscarPerfil();
  }, []);

  const buscarPerfil = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/passageiros/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPerfil(data.profile);
        setFormData({
          nome: data.profile.nome || '',
          telefone: data.profile.telefone || '',
          curso: data.profile.curso || '',
          dias_transporte: data.profile.dias_transporte || []
        });
      }
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDiaToggle = (dia) => {
    setFormData(prev => {
      const dias = prev.dias_transporte.includes(dia)
        ? prev.dias_transporte.filter(d => d !== dia)
        : [...prev.dias_transporte, dia];
      return { ...prev, dias_transporte: dias };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/passageiros/me', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        await buscarPerfil();
        setEditMode(false);
        alert('Perfil atualizado com sucesso!');
      } else {
        alert('Erro ao atualizar perfil');
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao atualizar perfil');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      nome: perfil.nome || '',
      telefone: perfil.telefone || '',
      curso: perfil.curso || '',
      dias_transporte: perfil.dias_transporte || []
    });
    setEditMode(false);
  };

  const formatarTelefone = (value) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-900 to-green-700 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-900 to-green-700">
      {/* Header */}
      <header className="bg-green-800 shadow-lg">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate('/passageiro')}
            className="text-white p-2 hover:bg-green-700 rounded-lg transition"
          >
            <ArrowLeft size={28} />
          </button>
          <h1 className="text-xl font-bold text-white">Meu Perfil</h1>
          {!editMode ? (
            <button
              onClick={() => setEditMode(true)}
              className="text-white p-2 hover:bg-green-700 rounded-lg transition"
            >
              <Edit2 size={24} />
            </button>
          ) : (
            <div className="w-10"></div>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Foto de Perfil */}
        <div className="text-center mb-6">
          <div className="w-32 h-32 bg-green-200 rounded-full mx-auto mb-4 flex items-center justify-center shadow-xl">
            {perfil?.foto_url ? (
              <img src={perfil.foto_url} alt="Perfil" className="w-full h-full rounded-full object-cover" />
            ) : (
              <User size={64} className="text-green-900" />
            )}
          </div>
          <h2 className="text-2xl font-bold text-white">{perfil?.nome}</h2>
          <p className="text-green-200">{perfil?.email}</p>
          
          {/* Status de Aprovação */}
          <div className="mt-4">
            {perfil?.aprovado ? (
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-full text-sm font-semibold">
                <Check size={16} />
                Conta Aprovada
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-full text-sm font-semibold">
                <Clock size={16} />
                Aguardando Aprovação
              </span>
            )}
          </div>
        </div>

        {/* Dados Pessoais */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <User className="text-green-600" size={20} />
            Dados Pessoais
          </h3>

          <div className="space-y-4">
            {/* Nome */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome Completo
              </label>
              {editMode ? (
                <input
                  type="text"
                  name="nome"
                  value={formData.nome}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-800 font-medium py-2">{perfil?.nome}</p>
              )}
            </div>

            {/* Email (não editável) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <Mail size={16} />
                Email
              </label>
              <p className="text-gray-600 py-2">{perfil?.email}</p>
            </div>

            {/* CPF (não editável) */}
            {perfil?.cpf && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                  <CreditCard size={16} />
                  CPF
                </label>
                <p className="text-gray-600 py-2">{perfil.cpf}</p>
              </div>
            )}

            {/* Telefone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <Phone size={16} />
                Telefone
              </label>
              {editMode ? (
                <input
                  type="tel"
                  name="telefone"
                  value={formData.telefone}
                  onChange={(e) => handleInputChange({ 
                    target: { 
                      name: 'telefone', 
                      value: formatarTelefone(e.target.value) 
                    }
                  })}
                  maxLength={15}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="(00) 00000-0000"
                />
              ) : (
                <p className="text-gray-800 font-medium py-2">{perfil?.telefone || 'Não informado'}</p>
              )}
            </div>
          </div>
        </div>

        {/* Dados Acadêmicos */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <BookOpen className="text-green-600" size={20} />
            Dados Acadêmicos
          </h3>

          <div className="space-y-4">
            {/* Universidade */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <Building2 size={16} />
                Universidade
              </label>
              <p className="text-gray-800 font-medium py-2">{perfil?.universidade || 'Não informado'}</p>
            </div>

            {/* Curso */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Curso
              </label>
              {editMode ? (
                <input
                  type="text"
                  name="curso"
                  value={formData.curso}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Ex: Engenharia de Software"
                />
              ) : (
                <p className="text-gray-800 font-medium py-2">{perfil?.curso || 'Não informado'}</p>
              )}
            </div>

            {/* Dias de Transporte */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Calendar size={16} />
                Dias de Transporte
              </label>
              {editMode ? (
                <div className="grid grid-cols-2 gap-3">
                  {diasSemana.map(dia => (
                    <button
                      key={dia.value}
                      type="button"
                      onClick={() => handleDiaToggle(dia.value)}
                      className={`py-3 rounded-xl font-semibold transition ${
                        formData.dias_transporte.includes(dia.value)
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {dia.label}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {perfil?.dias_transporte && perfil.dias_transporte.length > 0 ? (
                    diasSemana
                      .filter(dia => perfil.dias_transporte.includes(dia.value))
                      .map(dia => (
                        <span
                          key={dia.value}
                          className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold"
                        >
                          {dia.label}
                        </span>
                      ))
                  ) : (
                    <p className="text-gray-600">Não informado</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Informações de Transporte */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <MapPin className="text-green-600" size={20} />
            Transporte
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Linha
              </label>
              <p className="text-gray-800 font-medium py-2">{perfil?.linha || 'Não definida'}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ponto Padrão
              </label>
              <p className="text-gray-800 font-medium py-2">{perfil?.ponto_padrao || 'Não definido'}</p>
            </div>
          </div>
        </div>

        {/* Botões de Ação */}
        {editMode && (
          <div className="flex gap-3">
            <button
              onClick={handleCancel}
              className="flex-1 bg-gray-200 text-gray-700 py-4 rounded-xl font-bold hover:bg-gray-300 transition flex items-center justify-center gap-2"
            >
              <X size={20} />
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 bg-green-600 text-white py-4 rounded-xl font-bold hover:bg-green-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Save size={20} />
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        )}

        {/* Data de Cadastro */}
        <div className="mt-6 text-center">
          <p className="text-green-200 text-sm">
            Membro desde {perfil?.criado_em ? new Date(perfil.criado_em).toLocaleDateString('pt-BR') : 'N/A'}
          </p>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;