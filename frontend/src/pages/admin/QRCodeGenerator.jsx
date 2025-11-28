import * as adminService from '../../services/adminService';
import { useState, useEffect } from 'react';

export default function QRCodeGenerator() {
  const [linhas, setLinhas] = useState([]);
  const [linhaId, setLinhaId] = useState('');
  const [data, setData] = useState(new Date().toISOString().split('T')[0]);
  const [qrCodeData, setQrCodeData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Carregar linhas ao montar o componente
  useEffect(() => {
    loadLinhas();
  }, []);

  const loadLinhas = async () => {
    try {
      const result = await adminService.getLines();

      // ✅ Aceita 'value', 'linhas' ou array direto; fallback seguro
      const raw =
        (result && (result.value || result.linhas)) ||
        (Array.isArray(result) ? result : []);

      // Ordena por nome se houver
      const linhasData = Array.isArray(raw)
        ? [...raw].sort((a, b) => (a?.nome || '').localeCompare(b?.nome || ''))
        : [];

      console.log('📋 Linhas carregadas:', linhasData);
      setLinhas(linhasData);
    } catch (error) {
      console.error('❌ Erro ao carregar linhas:', error);
      setLinhas([]);
      alert('Não foi possível carregar as linhas.');
    }
  };

  const gerarQRCode = async () => {
    if (!linhaId) {
      alert('⚠️ Selecione uma linha');
      return;
    }

    try {
      setLoading(true);
      const result = await adminService.gerarQRCodeViagem(parseInt(linhaId, 10), data);
      setQrCodeData(result);
    } catch (error) {
      console.error('Erro ao gerar QR Code:', error);
      alert('❌ Erro ao gerar QR Code');
    } finally {
      setLoading(false);
    }
  };

  const imprimir = () => {
    const w = window.open('', '_blank');
    if (!w) {
      alert('Bloqueador de pop-up ativo. Permita pop-ups para imprimir.');
      return;
    }

    const linhaNome = linhas.find(l => l.id === parseInt(linhaId, 10))?.nome || 'Linha';

    w.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>QR Code - ${linhaNome}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              padding: 20px;
              background: #f9fafb;
            }
            .container {
              text-align: center;
              border: 3px solid #166534;
              padding: 40px;
              border-radius: 20px;
              background: white;
            }
            h1 {
              color: #166534;
              margin-bottom: 10px;
              font-size: 32px;
            }
            h2 {
              color: #16a34a;
              margin-bottom: 20px;
              font-size: 24px;
            }
            .date {
              color: #666;
              font-size: 20px;
              margin-bottom: 30px;
            }
            img {
              max-width: 400px;
              max-height: 400px;
              border: 2px solid #e5e7eb;
              padding: 10px;
              border-radius: 10px;
              display: block;
              margin: 0 auto;
            }
            .instructions {
              margin-top: 30px;
              font-size: 18px;
              color: #374151;
              max-width: 500px;
            }
            @media print {
              body {
                margin: 0;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              .container {
                border: 3px solid #166534;
                page-break-inside: avoid;
              }
              img {
                page-break-inside: avoid;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>🚌 UniTrans</h1>
            <h2>${linhaNome}</h2>
            <p class="date">📅 ${new Date('${data}T00:00:00').toLocaleDateString('pt-BR')}</p>
            <img 
              src="${qrCodeData?.qrcode || ''}" 
              alt="QR Code"
              id="qrcode-img"
            />
            <div class="instructions">
              <p><strong>Instruções:</strong></p>
              <p>Abra o app UniTrans e scaneie este QR Code ao embarcar e desembarcar do ônibus.</p>
            </div>
          </div>
          <script>
            const img = document.getElementById('qrcode-img');
            if (img && !img.complete) {
              img.onload = () => window.print();
            } else {
              window.print();
            }
          </script>
        </body>
      </html>
    `);

    w.document.close();

    // Fallback extra em 1s
    setTimeout(() => {
      try {
        w.print();
      } catch {}
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-green-800">📱 Gerar QR Code</h1>
          <button
            onClick={() => (window.location.href = '/admin/dashboard')}
            className="flex items-center space-x-2 px-6 py-3 bg-green-700 hover:bg-green-800 text-white font-bold rounded-full transition shadow-lg"
          >
            <span className="text-xl">↩</span>
            <span>Voltar</span>
          </button>
        </div>

        {/* Formulário */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Selecionar Linha */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Linha
              </label>
              <select
                value={linhaId}
                onChange={(e) => setLinhaId(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Selecione uma linha</option>
                {linhas.map((linha) => (
                  <option key={linha.id} value={linha.id}>
                    {linha.nome}
                  </option>
                ))}
              </select>
            </div>

            {/* Data */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data
              </label>
              <input
                type="date"
                value={data}
                onChange={(e) => setData(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Botão Gerar */}
          <div className="mt-6">
            <button
              onClick={gerarQRCode}
              disabled={loading || !linhaId || !data}
              className="w-full px-6 py-4 bg-green-700 hover:bg-green-800 text-white font-bold text-lg rounded-lg transition shadow-lg disabled:opacity-50"
            >
              {loading ? 'Gerando...' : '🎯 Gerar QR Code'}
            </button>
          </div>
        </div>

        {/* Resultado */}
        {qrCodeData && (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-green-800 mb-6">
              QR Code Gerado com Sucesso! ✅
            </h2>

            {/* QR Code */}
            <div className="mb-6">
              <img
                src={qrCodeData.qrcode}
                alt="QR Code"
                className="mx-auto border-4 border-green-700 rounded-lg shadow-lg"
                style={{ maxWidth: '400px' }}
              />
            </div>

            {/* Informações */}
            <div className="bg-green-50 rounded-lg p-4 mb-6 text-left">
              <p className="text-sm text-gray-700 mb-2">
                <strong>Linha:</strong>{' '}
                {linhas.find((l) => l.id === parseInt(linhaId, 10))?.nome}
              </p>
              <p className="text-sm text-gray-700 mb-2">
                <strong>Data:</strong>{' '}
                {new Date(`${data}T00:00:00`).toLocaleDateString('pt-BR')}
              </p>
              <p className="text-sm text-gray-700">
                <strong>Viagem ID:</strong> {qrCodeData.viagem_id}
              </p>
            </div>

            {/* Botões */}
            <div className="flex gap-4">
              <button
                onClick={imprimir}
                className="flex-1 px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition shadow-lg"
              >
                🖨️ Imprimir
              </button>

              <button
                onClick={() => setQrCodeData(null)}
                className="flex-1 px-6 py-4 bg-gray-600 hover:bg-gray-700 text-white font-bold rounded-lg transition shadow-lg"
              >
                🔄 Gerar Novo
              </button>
            </div>

            {/* Instruções */}
            <div className="mt-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
              <p className="text-sm text-yellow-800">
                <strong>📌 Importante:</strong> Imprima este QR Code e cole na
                porta do ônibus. Os passageiros deverão scanneá-lo ao embarcar e
                desembarcar.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
