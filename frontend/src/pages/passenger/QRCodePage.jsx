import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import QRCodeScanner from '../../components/QRCodeScanner';
import {
  QrCode,
  Camera,
  ArrowLeft,
  Check,
  X,
  Bus,
  User,
  Clock,
  AlertCircle
} from 'lucide-react';

const QRCodePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [viagemHoje, setViagemHoje] = useState(null);
  const [scanMode, setScanMode] = useState(false);
  const [processando, setProcessando] = useState(false);
  const [resultado, setResultado] = useState(null);

  useEffect(() => {
    buscarViagemHoje();
  }, []);

  // =========================
  // 1️⃣ Buscar viagem do dia
  // =========================
  const buscarViagemHoje = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/viagens/minhas', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const hoje = new Date().toISOString().split('T')[0];

        const viagemDeHoje = data.viagens?.find(v =>
          v.data?.split('T')[0] === hoje && v.viagem_status !== 'FINALIZADA'
        );

        setViagemHoje(viagemDeHoje || null);
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

  // ==============================
  // Obter localização do usuário
  // ==============================
  const getCurrentPosition = () => {
    return new Promise((resolve) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            });
          },
          (error) => {
            console.warn('Erro ao obter localização:', error);
            resolve(null);
          }
        );
      } else {
        resolve(null);
      }
    });
  };

  // ===========================================
  // 2️⃣ Processar Check-in ou Check-out via QR
  // ===========================================
  const processarCheckInOut = async (qrToken) => {
    if (!viagemHoje) {
      alert('Nenhuma viagem ativa encontrada');
      return;
    }

    if (!qrToken) {
      alert('Token do QR Code não fornecido');
      return;
    }

    setProcessando(true);

    try {
      const position = await getCurrentPosition();
      const token = localStorage.getItem('token');

      const isCheckIn = viagemHoje.meu_status === 'AGUARDANDO';
      const endpoint = isCheckIn
        ? 'http://localhost:3000/api/viagens/checkin'
        : 'http://localhost:3000/api/viagens/checkout';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          token: qrToken,
          latitude: position?.latitude,
          longitude: position?.longitude
        })
      });

      const data = await response.json();

      if (response.ok) {
        setResultado({
          sucesso: true,
          tipo: isCheckIn ? 'check-in' : 'check-out',
          mensagem: data.message,
          horario: data.horario
        });

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
          setScanMode(false);
        }, 3000);
      }
    } catch (error) {
      console.error('Erro:', error);
      setResultado({
        sucesso: false,
        mensagem: error?.message || 'Erro ao processar check-in/out'
      });

      setTimeout(() => {
        setResultado(null);
        setScanMode(false);
      }, 3000);
    } finally {
      setProcessando(false);
    }
  };

  // ====================================
  // 3️⃣ Simular leitura manual de token
  // ====================================
  const simularScan = async () => {
    const qrToken = prompt('Cole o TOKEN do QR Code aqui (para teste):');
    if (!qrToken) {
      alert('Token não fornecido');
      return;
    }
    setScanMode(true);
    await processarCheckInOut(qrToken);
  };

  // ====================================
  // Handlers do componente QRCodeScanner
  // ====================================
  const handleScanSuccess = (text) => {
    if (!text || processando) return;
    setScanMode(true);
    processarCheckInOut(String(text).trim());
  };

  const handleScanError = (err) => {
    console.warn('QR scan error:', err?.message || err);
  };

  // ====================================
  // 4️⃣ Layout
  // ====================================
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-900 to-green-700 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white"></div>
      </div>
    );
  }

  if (resultado) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-900 to-green-700 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
          <div
            className={`rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6 ${
              resultado.sucesso ? 'bg-green-100' : 'bg-red-100'
            }`}
          >
            {resultado.sucesso ? (
              <Check className="text-green-600" size={48} />
            ) : (
              <X className="text-red-600" size={48} />
            )}
          </div>

          <h2
            className={`text-2xl font-bold mb-4 ${
              resultado.sucesso ? 'text-green-700' : 'text-red-700'
            }`}
          >
            {resultado.sucesso ? 'Sucesso!' : 'Erro'}
          </h2>

          <p className="text-gray-700 text-lg mb-2">{resultado.mensagem}</p>

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

        {/* Info da Viagem */}
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
        {/* Status da Viagem */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800">Status da Viagem</h3>
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
              Em andamento
            </span>
          </div>

          <div className="space-y-3">
            {viagemHoje.meu_status === 'EMBARCADO' ||
            viagemHoje.meu_status === 'DESEMBARCADO' ? (
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <Check className="text-green-600" size={20} />
                <div className="flex-1">
                  <p className="font-semibold text-green-700">Check-in realizado</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Clock className="text-gray-400" size={20} />
                <div className="flex-1">
                  <p className="font-semibold text-gray-700">Aguardando check-in</p>
                  <p className="text-sm text-gray-500">
                    Escaneie o QR Code para embarcar
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 📷 QR Code Scanner */}
        {viagemHoje.meu_status !== 'DESEMBARCADO' && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                {viagemHoje.meu_status === 'EMBARCADO'
                  ? 'Escanear para Desembarcar'
                  : 'Escanear para Embarcar'}
              </h3>
              <p className="text-gray-600 mb-6">
                Aponte a câmera para o QR Code do motorista
              </p>
            </div>

            {/* Componente do Scanner */}
            <QRCodeScanner
              onScan={handleScanSuccess}
              onError={handleScanError}
              isActive={scanMode && !processando}
            />

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setScanMode((v) => !v)}
                disabled={processando}
                className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition shadow-lg disabled:opacity-50"
              >
                {scanMode ? 'Parar câmera' : 'Ativar câmera'}
              </button>

              <button
                onClick={simularScan}
                disabled={processando}
                className="w-full bg-gray-200 text-gray-800 py-3 rounded-xl font-semibold hover:bg-gray-300 transition disabled:opacity-50"
              >
                Usar token (simulação)
              </button>
            </div>

            <p className="text-center text-sm text-gray-500 mt-4">
              🎥 O scanner precisa de permissão de câmera (HTTPS ou http://localhost)
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default QRCodePage;
