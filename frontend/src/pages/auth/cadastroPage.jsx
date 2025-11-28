import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, CreditCard, BookOpen, Lock, Upload, Check, ArrowRight, ArrowLeft } from 'lucide-react';

const CadastroPage = () => {
  const navigate = useNavigate();
  const [etapa, setEtapa] = useState(1);
  const [loading, setLoading] = useState(false);
  const [universidades, setUniversidades] = useState([]);
  const [sucesso, setSucesso] = useState(false);
  
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    email: '',
    telefone: '',
    universidade_id: '',
    curso: '',
    dias_transporte: [],
    senha: '',
    confirmarSenha: '',
    documento_identidade: null,
    comprovante_matricula: null,
    foto_3x4: null
  });
  
  const [erros, setErros] = useState({});
  
  const diasSemana = [
    { value: 'SEG', label: 'Segunda' },
    { value: 'TER', label: 'Terça' },
    { value: 'QUA', label: 'Quarta' },
    { value: 'QUI', label: 'Quinta' },
    { value: 'SEX', label: 'Sexta' }
  ];
  
  useEffect(() => {
    buscarUniversidades();
  }, []);
  
  const buscarUniversidades = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/auth/universidades');
      const data = await response.json();
      setUniversidades(data.universidades || []);
    } catch (error) {
      console.error('Erro ao buscar universidades:', error);
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErros(prev => ({ ...prev, [name]: '' }));
  };
  
  const handleDiaToggle = (dia) => {
    setFormData(prev => {
      const dias = prev.dias_transporte.includes(dia)
        ? prev.dias_transporte.filter(d => d !== dia)
        : [...prev.dias_transporte, dia];
      return { ...prev, dias_transporte: dias };
    });
  };
  
  const handleFileChange = (e, campo) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, [campo]: reader.result }));
        setErros(prev => ({ ...prev, [campo]: '' }));
      };
      reader.readAsDataURL(file);
    }
  };
  
  const validarEtapa1 = () => {
    const novosErros = {};
    
    if (!formData.nome.trim()) novosErros.nome = 'Nome é obrigatório';
    if (!formData.cpf.trim()) novosErros.cpf = 'CPF é obrigatório';
    if (formData.cpf.replace(/\D/g, '').length !== 11) novosErros.cpf = 'CPF inválido';
    if (!formData.email.trim()) novosErros.email = 'Email é obrigatório';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) novosErros.email = 'Email inválido';
    if (!formData.telefone.trim()) novosErros.telefone = 'Telefone é obrigatório';
    
    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };
  
  const validarEtapa2 = () => {
    const novosErros = {};
    
    if (!formData.universidade_id) novosErros.universidade_id = 'Selecione uma universidade';
    if (!formData.curso.trim()) novosErros.curso = 'Curso é obrigatório';
    if (formData.dias_transporte.length === 0) novosErros.dias_transporte = 'Selecione pelo menos um dia';
    
    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };
  
  const validarEtapa3 = () => {
    const novosErros = {};
    
    if (!formData.senha) novosErros.senha = 'Senha é obrigatória';
    if (formData.senha.length < 6) novosErros.senha = 'Senha deve ter no mínimo 6 caracteres';
    if (formData.senha !== formData.confirmarSenha) novosErros.confirmarSenha = 'Senhas não conferem';
    
    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };
  
  const validarEtapa4 = () => {
    const novosErros = {};
    
    if (!formData.documento_identidade) novosErros.documento_identidade = 'Documento obrigatório';
    if (!formData.comprovante_matricula) novosErros.comprovante_matricula = 'Comprovante obrigatório';
    if (!formData.foto_3x4) novosErros.foto_3x4 = 'Foto obrigatória';
    
    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };
  
  const avancarEtapa = () => {
    let valido = false;
    
    if (etapa === 1) valido = validarEtapa1();
    else if (etapa === 2) valido = validarEtapa2();
    else if (etapa === 3) valido = validarEtapa3();
    
    if (valido) {
      setEtapa(prev => prev + 1);
    }
  };
  
  const finalizarCadastro = async () => {
    if (!validarEtapa4()) return;
    
    setLoading(true);
    
    try {
      const response = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSucesso(true);
      } else {
        alert(data.error || 'Erro ao realizar cadastro');
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao realizar cadastro');
    } finally {
      setLoading(false);
    }
  };
  
  const formatarCPF = (value) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };
  
  const formatarTelefone = (value) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1');
  };
  
  if (sucesso) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-900 to-green-700 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <Check className="text-green-600" size={40} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Cadastro Realizado!</h2>
          <p className="text-gray-600 mb-6">
            Seu cadastro foi enviado com sucesso. Aguarde a aprovação do administrador para começar a usar o UniTrans.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="bg-green-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-green-700 transition"
          >
            Ir para Login
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-900 to-green-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-lg w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-green-700">UniTrans</h1>
          <p className="text-gray-600 text-sm mt-2">Cadastro de Passageiro</p>
        </div>
        
        <div className="flex justify-between mb-8">
          {[1, 2, 3, 4].map(num => (
            <div key={num} className="flex flex-col items-center flex-1">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                etapa >= num ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                {num}
              </div>
              <span className="text-xs mt-1 text-gray-600">
                {num === 1 ? 'Dados' : num === 2 ? 'Acadêmico' : num === 3 ? 'Senha' : 'Docs'}
              </span>
            </div>
          ))}
        </div>
        
        {etapa === 1 && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Dados Pessoais</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
              <div className="relative">
                <User className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="text"
                  name="nome"
                  value={formData.nome}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="João da Silva"
                />
              </div>
              {erros.nome && <p className="text-red-500 text-sm mt-1">{erros.nome}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CPF</label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="text"
                  name="cpf"
                  value={formData.cpf}
                  onChange={(e) => handleInputChange({ target: { name: 'cpf', value: formatarCPF(e.target.value) }})}
                  maxLength={14}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="000.000.000-00"
                />
              </div>
              {erros.cpf && <p className="text-red-500 text-sm mt-1">{erros.cpf}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="seu@email.com"
                />
              </div>
              {erros.email && <p className="text-red-500 text-sm mt-1">{erros.email}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="tel"
                  name="telefone"
                  value={formData.telefone}
                  onChange={(e) => handleInputChange({ target: { name: 'telefone', value: formatarTelefone(e.target.value) }})}
                  maxLength={15}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="(00) 00000-0000"
                />
              </div>
              {erros.telefone && <p className="text-red-500 text-sm mt-1">{erros.telefone}</p>}
            </div>
            
            <button
              onClick={avancarEtapa}
              className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2 mt-6"
            >
              Próximo <ArrowRight size={20} />
            </button>
          </div>
        )}
        
        {etapa === 2 && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Informações Acadêmicas</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Universidade</label>
              <select
                name="universidade_id"
                value={formData.universidade_id}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Selecione...</option>
                {universidades.map(uni => (
                  <option key={uni.id} value={uni.id}>{uni.nome} - {uni.cidade}</option>
                ))}
              </select>
              {erros.universidade_id && <p className="text-red-500 text-sm mt-1">{erros.universidade_id}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Curso</label>
              <div className="relative">
                <BookOpen className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="text"
                  name="curso"
                  value={formData.curso}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Ex: Engenharia de Software"
                />
              </div>
              {erros.curso && <p className="text-red-500 text-sm mt-1">{erros.curso}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Dias de Transporte</label>
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
              {erros.dias_transporte && <p className="text-red-500 text-sm mt-1">{erros.dias_transporte}</p>}
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setEtapa(1)}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300 transition flex items-center justify-center gap-2"
              >
                <ArrowLeft size={20} /> Voltar
              </button>
              <button
                onClick={avancarEtapa}
                className="flex-1 bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2"
              >
                Próximo <ArrowRight size={20} />
              </button>
            </div>
          </div>
        )}
        
        {etapa === 3 && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Criar Senha</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="password"
                  name="senha"
                  value={formData.senha}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
              {erros.senha && <p className="text-red-500 text-sm mt-1">{erros.senha}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="password"
                  name="confirmarSenha"
                  value={formData.confirmarSenha}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Digite a senha novamente"
                />
              </div>
              {erros.confirmarSenha && <p className="text-red-500 text-sm mt-1">{erros.confirmarSenha}</p>}
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setEtapa(2)}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300 transition flex items-center justify-center gap-2"
              >
                <ArrowLeft size={20} /> Voltar
              </button>
              <button
                onClick={avancarEtapa}
                className="flex-1 bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2"
              >
                Próximo <ArrowRight size={20} />
              </button>
            </div>
          </div>
        )}
        
        {etapa === 4 && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Documentos</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Documento de Identidade</label>
              <label className="flex items-center justify-center w-full py-4 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-green-500 transition">
                <div className="text-center">
                  <Upload className="mx-auto text-gray-400 mb-2" size={24} />
                  <span className="text-sm text-gray-600">
                    {formData.documento_identidade ? '✓ Arquivo enviado' : 'Clique para enviar'}
                  </span>
                </div>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => handleFileChange(e, 'documento_identidade')}
                  className="hidden"
                />
              </label>
              {erros.documento_identidade && <p className="text-red-500 text-sm mt-1">{erros.documento_identidade}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Comprovante de Matrícula</label>
              <label className="flex items-center justify-center w-full py-4 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-green-500 transition">
                <div className="text-center">
                  <Upload className="mx-auto text-gray-400 mb-2" size={24} />
                  <span className="text-sm text-gray-600">
                    {formData.comprovante_matricula ? '✓ Arquivo enviado' : 'Clique para enviar'}
                  </span>
                </div>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => handleFileChange(e, 'comprovante_matricula')}
                  className="hidden"
                />
              </label>
              {erros.comprovante_matricula && <p className="text-red-500 text-sm mt-1">{erros.comprovante_matricula}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Foto 3x4</label>
              <label className="flex items-center justify-center w-full py-4 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-green-500 transition">
                <div className="text-center">
                  <Upload className="mx-auto text-gray-400 mb-2" size={24} />
                  <span className="text-sm text-gray-600">
                    {formData.foto_3x4 ? '✓ Arquivo enviado' : 'Clique para enviar'}
                  </span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'foto_3x4')}
                  className="hidden"
                />
              </label>
              {erros.foto_3x4 && <p className="text-red-500 text-sm mt-1">{erros.foto_3x4}</p>}
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setEtapa(3)}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300 transition flex items-center justify-center gap-2"
              >
                <ArrowLeft size={20} /> Voltar
              </button>
              <button
                onClick={finalizarCadastro}
                disabled={loading}
                className="flex-1 bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? 'Enviando...' : 'Finalizar'} <Check size={20} />
              </button>
            </div>
          </div>
        )}
        
        <p className="text-center text-sm text-gray-500 mt-6">
          Facilidade para quem estuda, pontualidade para quem precisa!
        </p>
        
        <p className="text-center text-sm text-gray-600 mt-4">
          Já tem conta?{' '}
          <button
            onClick={() => navigate('/login')}
            className="text-green-600 font-semibold hover:underline"
          >
            Fazer login
          </button>
        </p>
      </div>
    </div>
  );
};

export default CadastroPage;