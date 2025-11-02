import { useState, useEffect } from 'react';
import {
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import * as adminService from '../../services/adminService';

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    passageirosAtivos: 0,
    totalFaltas: 0,
    taxaOcupacaoMedia: 0,
  });
  const [presencaPorLinha, setPresencaPorLinha] = useState([]);
  const [faltasPorLinha, setFaltasPorLinha] = useState([]);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);

      // Período: últimos 30 dias (sem mutar a data original)
      const hoje = new Date();
      const dataFim = hoje.toISOString().split('T')[0];
      const trintaDiasAtras = new Date(hoje.getTime() - 30 * 24 * 60 * 60 * 1000);
      const dataInicio = trintaDiasAtras.toISOString().split('T')[0];

      // Buscar dados paralelamente
      const [passageiros, presenca, faltas] = await Promise.all([
        adminService.getActivePassengersReport(),
        adminService.getAttendanceReport(dataInicio, dataFim),
        adminService.getAbsenceReport(dataInicio, dataFim),
      ]);

      // Estatísticas gerais
      const taxaOcupacaoMedia =
        presenca?.length > 0
          ? (
              presenca.reduce((acc, l) => acc + Number(l.taxa_presenca || 0), 0) /
              presenca.length
            ).toFixed(1)
          : 0;

      setStats({
        passageirosAtivos: Array.isArray(passageiros) ? passageiros.length : Number(passageiros?.total || 0),
        totalFaltas: Array.isArray(faltas) ? faltas.length : Number(faltas?.total || 0),
        taxaOcupacaoMedia: Number(taxaOcupacaoMedia),
      });

      // Dados para gráficos
      setPresencaPorLinha(
        (presenca || []).map((l) => ({
          linha: l.linha,
          presente: Number(l.total_presente || 0),
          faltas: Number(l.total_faltas || 0),
          taxa: Number(l.taxa_presenca || 0),
        }))
      );

      // Agrupar faltas por linha
      const faltasMap = {};
      (faltas || []).forEach((f) => {
        const key = f.linha || 'Sem Linha';
        faltasMap[key] = (faltasMap[key] || 0) + 1;
      });
      setFaltasPorLinha(
        Object.entries(faltasMap).map(([linha, total]) => ({ linha, faltas: total }))
      );
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#0ea5e9'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-700 mx-auto mb-4"></div>
          <p className="text-green-700 font-medium">Carregando relatórios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 p-8">
      <div className="max-w-7xl mx-auto">

        {/* Cabeçalho com Botão Voltar */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-green-800">📊 Relatórios e Estatísticas</h1>

          <button
            onClick={() => (window.location.href = '/admin')}
            className="flex items-center space-x-2 px-6 py-3 bg-green-700 hover:bg-green-800 text-white font-bold rounded-full transition shadow-lg"
          >
            <span className="text-xl">↩</span>
            <span>Voltar</span>
          </button>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total de Passageiros */}
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
            <div className="w-32 h-32 bg-green-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-5xl font-bold text-white">{stats.passageirosAtivos}</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-800">Total de Passageiros</h3>
            <p className="text-gray-600 text-sm">Ativos no sistema</p>
          </div>

          {/* Total de Faltas */}
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
            <div className="w-32 h-32 bg-green-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-5xl font-bold text-white">{stats.totalFaltas}</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-800">Total de Faltas</h3>
            <p className="text-gray-600 text-sm">Últimos 30 dias</p>
          </div>

          {/* Taxa de Ocupação Média */}
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
            <div className="relative w-32 h-32 mx-auto mb-4">
              <svg className="transform -rotate-90 w-32 h-32">
                <circle cx="64" cy="64" r="56" stroke="#e5e7eb" strokeWidth="12" fill="none" />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="#10b981"
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 56 * (stats.taxaOcupacaoMedia / 100)} ${2 * Math.PI * 56}`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl font-bold text-green-700">{stats.taxaOcupacaoMedia}%</span>
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-800">Taxa de Ocupação Média</h3>
            <p className="text-gray-600 text-sm">do Ônibus</p>
          </div>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Gráfico de Taxa de Presença por Linha */}
          {presencaPorLinha.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Taxa de Presença por Linha</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={presencaPorLinha}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="linha" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="taxa" fill="#10b981" name="Taxa (%)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Gráfico de Faltas por Linha */}
          {faltasPorLinha.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Faltas por Linha (Últimos 30 dias)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={faltasPorLinha}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="linha" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="faltas" fill="#ef4444" name="Faltas" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Presentes vs Faltas por Linha */}
          {presencaPorLinha.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-6 lg:col-span-2">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Presentes vs Faltas por Linha</h3>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={presencaPorLinha}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="linha" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="presente" fill="#10b981" name="Presente" />
                  <Bar dataKey="faltas" fill="#ef4444" name="Faltas" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Gráfico de Pizza - Distribuição de Passageiros por Linha */}
          {presencaPorLinha.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-6 lg:col-span-2">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Distribuição de Passageiros por Linha</h3>
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={presencaPorLinha}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.linha}`}
                    outerRadius={110}
                    dataKey="presente"
                  >
                    {presencaPorLinha.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
