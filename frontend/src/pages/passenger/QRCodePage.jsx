import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  QrCode, 
  Camera, 
  ArrowLeft, 
  Check, 
  X,
  Bus,
  User,
  Clock,
  MapPin,
  AlertCircle
} from 'lucide-react';

const QRCodePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [viagemHoje, setViagemHoje] = useState(null);
  const [scanMode, setScanMode] = useState(false);
  const [qrCodeInput, setQrCodeInput] = useState('');
  const [processando, setProcessando] = useState(false);
  const [resultado, setResultado] = useState(null);

  useEffect(() => {
    buscarViagemHoje();
  }, []);

  const buscarViagemHoje = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/passageiros/viagem-hoje', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setViagemHoje(data);
      } else {
        setViagemHoje(null);
      }
    } catch (error) {
      console.error('Erro ao buscar viagem:', error);
      setViagemHoje(null);
    } finally {
      setLoading(false);
    }
  };

  const processarCheckInOut = async () => {
    if (!viagemHoje) {
      alert('Nenhuma viagem ativa encontrada');
      return;
    }

    setProcessando(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/passageiros/check-in-out', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          viagem_id: viagemHoje.id
        })
      });

      const data = await response.json();

      if (response.ok) {
        setResultado({
          sucesso: true,
          tipo: data.tipo,
          mensagem: data.mensagem,
          horario: data.horario
        });

        // Atualizar viagem após 2 segundos
        setTimeout(() => {
          buscarViagemHoje();
          setResultado(null);
          setScanMode(false);
        }, 3000);
      } else {
        setResultado({
          sucesso: false,
          mensagem: data.error || 'Erro ao processar'
        });

        setTimeout(() => {
          setResultado(null);
        }, 3000);
      }
    } catch (error) {
      console.error('Erro:', error);
      setResultado({
        sucesso: false,
        mensagem: 'Erro ao processar check-in/out'
      });

      setTimeout(() => {
        setResultado(null);
      }, 3000);
    } finally {
      setProcessando(false);
    }
  };

  const simularScan = () => {
    // Simula a leitura de um QR Code
    setScanMode(true);
    setTimeout(() => {
      processarCheckInOut();
    }, 1000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-900 to-green-700 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white"></div>
      </div>
    );
  }

  // Tela de Resultado
  if (resultado) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-900 to-green-700 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className={`rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6 ${
            resultado.sucesso ? 'bg-green-100' : 'bg-red-100'
          }`}>
            {resultado.sucesso ? (
              <Check className="text-green-600" size={48} />
            ) : (
              <X className="text-red-600" size={48} />
            )}
          </div>
          
          <h2 className={`text-2xl font-bold mb-4 ${
            resultado.sucesso ? 'text-green-700' : 'text-red-700'
          }`}>
            {resultado.sucesso ? 'Sucesso!' : 'Erro'}
          </h2>
          
          <p className="text-gray-700 text-lg mb-2">
            {resultado.mensagem}
          </p>
          
          {resultado.sucesso && resultado.horario && (
            <p className="text-gray-500 text-sm">
              {new Date(resultado.horario).toLocaleString('pt-BR')}
            </p>
          )}
          
          <div className="mt-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
            <p className="text-sm text-gray-500 mt-2">Redirecionando...</p>
          </div>
        </div>
      </div>
    );
  }

  // Sem viagem ativa
  if (!viagemHoje) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-900 to-green-700">
        <header className="bg-green-800 shadow-lg">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <button
              onClick={() => navigate('/passageiro')}
              className="text-white p-2 hover:bg-green-700 rounded-lg transition"
            >
              <ArrowLeft size={28} />
            </button>
            <h1 className="text-xl font-bold text-white">QR Code</h1>
            <div className="w-10"></div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-3xl shadow-2xl p-8 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="text-gray-400" size={40} />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              Nenhuma viagem ativa
            </h2>
            <p className="text-gray-600 mb-6">
              Você não tem viagens em andamento no momento
            </p>
            <button
              onClick={() => navigate('/passageiro')}
              className="bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 transition"
            >
              Voltar ao Início
            </button>
          </div>
        </main>
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
          <h1 className="text-xl font-bold text-white">QR Code</h1>
          <div className="w-10"></div>
        </div>

        {/* Info da Viagem no Header */}
        <div className="bg-green-700 px-4 py-3">
          <div className="container mx-auto flex items-center justify-between text-white text-sm">
            <div className="flex items-center gap-2">
              <User size={16} />
              <span>{viagemHoje.motorista_nome || 'Motorista'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Bus size={16} />
              <span>{viagemHoje.linha_nome}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Status Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800">Status da Viagem</h3>
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
              Em andamento
            </span>
          </div>

          <div className="space-y-3">
            {viagemHoje.embarque_feito ? (
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <Check className="text-green-600" size={20} />
                <div className="flex-1">
                  <p className="font-semibold text-green-700">Check-in realizado</p>
                  <p className="text-sm text-green-600">
                    às {new Date(viagemHoje.horario_embarque).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Clock className="text-gray-400" size={20} />
                <div className="flex-1">
                  <p className="font-semibold text-gray-700">Aguardando check-in</p>
                  <p className="text-sm text-gray-500">Escaneie o QR Code para embarcar</p>
                </div>
              </div>
            )}

            {viagemHoje.desembarque_feito ? (
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <Check className="text-blue-600" size={20} />
                <div className="flex-1">
                  <p className="font-semibold text-blue-700">Check-out realizado</p>
                  <p className="text-sm text-blue-600">
                    às {new Date(viagemHoje.horario_desembarque).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ) : viagemHoje.embarque_feito ? (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Clock className="text-gray-400" size={20} />
                <div className="flex-1">
                  <p className="font-semibold text-gray-700">Aguardando check-out</p>
                  <p className="text-sm text-gray-500">Escaneie ao desembarcar</p>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* QR Code Scanner */}
        {!viagemHoje.desembarque_feito && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {!scanMode ? (
              <>
                <div className="text-center mb-6">
                  <div className="w-48 h-48 bg-gradient-to-br from-green-100 to-green-200 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                    <QrCode className="text-green-600" size={120} />
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    {viagemHoje.embarque_feito ? 'Escanear para Desembarcar' : 'Escanear para Embarcar'}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Aponte a câmera para o QR Code do motorista
                  </p>
                </div>

                <button
                  onClick={simularScan}
                  disabled={processando}
                  className="w-full bg-green-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-green-700 transition flex items-center justify-center gap-3 shadow-lg disabled:opacity-50"
                >
                  <Camera size={24} />
                  {processando ? 'Processando...' : 'Escanear QR Code'}
                </button>

                <p className="text-center text-sm text-gray-500 mt-4">
                  🎥 Certifique-se de ter permissão para usar a câmera
                </p>
              </>
            ) : (
              <div className="text-center">
                <div className="w-48 h-48 bg-green-100 rounded-3xl flex items-center justify-center mx-auto mb-6 relative overflow-hidden">
                  <div className="absolute inset-0 bg-green-200 animate-pulse"></div>
                  <Camera className="text-green-600 z-10" size={80} />
                </div>
                <p className="text-lg font-semibold text-gray-700">
                  Escaneando...
                </p>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mt-4"></div>
              </div>
            )}
          </div>
        )}

        {/* Informações Importantes */}
        <div className="mt-6 bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
          <p className="text-blue-800 text-sm font-medium flex items-start gap-2">
            <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
            <span>
              Você deve escanear o QR Code apresentado pelo motorista no momento do embarque e desembarque.
            </span>
          </p>
        </div>
      </main>
    </div>
  );
};

export default QRCodePage;