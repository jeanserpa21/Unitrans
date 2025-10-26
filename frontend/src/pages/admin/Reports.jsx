import { useAuth } from '../../contexts/AuthContext';
import AdminSidebar from '../../components/admin/Sidebar';

export default function ReportsPage() {
  const { user } = useAuth();

  // Dados fictícios para os gráficos
  const qrValidados = [
    { hospital: 'Hospital A', total: 250 },
    { hospital: 'Hospital B', total: 180 },
    { hospital: 'Hospital C', total: 150 },
  ];

  const qrNaoValidados = [
    { hospital: 'Hospital A', total: 200 },
    { hospital: 'Hospital B', total: 160 },
    { hospital: 'Hospital C', total: 120 },
  ];

  const maxValue = 250;

  return (
    <div className="min-h-screen bg-green-50">
      <AdminSidebar />

      <div className="ml-48 min-h-screen">
        {/* Header Badge */}
        <div className="fixed top-4 right-4 z-30">
          <div className="bg-green-700 text-white rounded-full px-6 py-3 shadow-lg flex items-center space-x-3">
            <div>
              <p className="text-sm font-semibold">User</p>
              <p className="text-xs text-green-200">Cod: {user?.id || '?'}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-green-700 font-bold">
              {user?.nome?.charAt(0) || 'A'}
            </div>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="p-12 pt-20 space-y-8">
          {/* Grid de Gráficos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Gráfico Pizza - Ocupação Média */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-xl font-bold text-gray-800 text-center mb-6">
                Taxa de Ocupação Média do Ônibus
              </h3>
              <div className="flex justify-center">
                <div className="relative w-64 h-64">
                  {/* Pizza Chart Simplificado */}
                  <svg viewBox="0 0 100 100" className="transform -rotate-90">
                    {/* Base */}
                    <circle cx="50" cy="50" r="40" fill="#60D394" />
                    {/* Arco 1 */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      strokeDasharray="75 25"
                      strokeDashoffset="0"
                      stroke="#FFD97D"
                      strokeWidth="80"
                      strokeLinecap="butt"
                      fill="none"
                    />
                    {/* Arco 2 */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      strokeDasharray="50 50"
                      strokeDashoffset="-25"
                      stroke="#5DADE2"
                      strokeWidth="80"
                      strokeLinecap="butt"
                      fill="none"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* QR Codes Validados */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-xl font-bold text-gray-800 text-center mb-6">
                Quantidade de QR Codes validados
              </h3>
              <div className="space-y-4">
                {qrValidados.map((item, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">{item.hospital}</span>
                      <span className="font-semibold">{item.total}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-8">
                      <div
                        className="bg-blue-500 h-8 rounded-full transition-all"
                        style={{ width: `${(item.total / maxValue) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Total de Alunos que Não Voltam */}
            <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center justify-center">
              <h3 className="text-xl font-bold text-gray-800 text-center mb-6">
                Total de alunos que não voltam
              </h3>
              <div className="w-48 h-48 rounded-full bg-gradient-to-br from-green-700 to-green-600 flex items-center justify-center shadow-2xl">
                <span className="text-7xl font-bold text-white">20</span>
              </div>
            </div>

            {/* Total de Passageiros */}
            <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center justify-center">
              <h3 className="text-xl font-bold text-gray-800 text-center mb-6">
                Total de Passageiros
              </h3>
              <div className="w-48 h-48 rounded-full bg-gradient-to-br from-green-700 to-green-600 flex items-center justify-center shadow-2xl">
                <span className="text-7xl font-bold text-white">280</span>
              </div>
            </div>

            {/* QR Codes NÃO Validados */}
            <div className="bg-white rounded-2xl shadow-lg p-8 md:col-span-2">
              <h3 className="text-xl font-bold text-gray-800 text-center mb-6">
                Quantidade de QR Codes Não validados
              </h3>
              <div className="space-y-4 max-w-2xl mx-auto">
                {qrNaoValidados.map((item, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">{item.hospital}</span>
                      <span className="font-semibold">{item.total}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-8">
                      <div
                        className="bg-blue-500 h-8 rounded-full transition-all"
                        style={{ width: `${(item.total / maxValue) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
