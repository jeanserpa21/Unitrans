import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';

import LoginPage from './pages/auth/LoginPage';
import CadastroPage from './pages/auth/cadastroPage';

// Páginas do Passageiro
import PassengerDashboardPage from './pages/passenger/DashboardPage';
import QRCodePage from './pages/passenger/QRCodePage';
import ProfilePage from './pages/passenger/ProfilePage';
import SolicitarCaronaPage from './pages/passenger/SolicitarCaronaPage';

// Páginas do Motorista
import DriverDashboard from './pages/driver/Dashboard';
import PassengersPage from './pages/driver/Passengers';
import RoutePointsPage from './pages/driver/RoutePoints';
import HistoryPage from './pages/driver/History';
import DriverProfilePage from './pages/driver/Profile';
import DashboardNew from './pages/driver/DashboardNew';
import TripInProgress from './pages/driver/TripInProgress';
import SendMessage from './pages/driver/SendMessage';

// Páginas do Admin
import AdminDashboard from './pages/admin/Dashboard';
import LinesPage from './pages/admin/Lines';
import SecretaryPage from './pages/admin/Secretary';
import DriversPage from './pages/admin/Drivers';
import VehiclesPage from './pages/admin/Vehicles';
import ReportsPage from './pages/admin/Reports';
import NoticesPage from './pages/admin/Notices'; // <-- NOVO

// Componentes do Admin
import AdminSidebar from './components/admin/Sidebar';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.papel)) return <Navigate to="/" replace />;

  return children;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* ==================== ROTAS PÚBLICAS ==================== */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/cadastro" element={<CadastroPage />} />

          {/* ==================== ROTAS DO PASSAGEIRO ==================== */}
          <Route
            path="/passageiro"
            element={
              <ProtectedRoute allowedRoles={['PASSAGEIRO']}>
                <PassengerDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/passageiro/solicitar-carona"
            element={
              <ProtectedRoute allowedRoles={['PASSAGEIRO']}>
                <SolicitarCaronaPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/passageiro/qrcode"
            element={
              <ProtectedRoute allowedRoles={['PASSAGEIRO']}>
                <QRCodePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/passageiro/perfil"
            element={
              <ProtectedRoute allowedRoles={['PASSAGEIRO']}>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          {/* ==================== ROTAS DO MOTORISTA ==================== */}
          <Route
            path="/motorista"
            element={
              <ProtectedRoute allowedRoles={['MOTORISTA']}>
                <DashboardNew />
              </ProtectedRoute>
            }
          />
          <Route
            path="/motorista/viagem-andamento"
            element={
              <ProtectedRoute allowedRoles={['MOTORISTA']}>
                <TripInProgress />
              </ProtectedRoute>
            }
          />
          <Route
            path="/motorista/dashboard"
            element={
              <ProtectedRoute allowedRoles={['MOTORISTA']}>
                <DriverDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/motorista/passageiros"
            element={
              <ProtectedRoute allowedRoles={['MOTORISTA']}>
                <PassengersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/motorista/pontos"
            element={
              <ProtectedRoute allowedRoles={['MOTORISTA']}>
                <RoutePointsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/motorista/historico"
            element={
              <ProtectedRoute allowedRoles={['MOTORISTA']}>
                <HistoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/motorista/perfil"
            element={
              <ProtectedRoute allowedRoles={['MOTORISTA']}>
                <DriverProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/motorista/mensagem"
            element={
              <ProtectedRoute allowedRoles={['MOTORISTA']}>
                <SendMessage />
              </ProtectedRoute>
            }
          />

          {/* ==================== ROTAS DO ADMINISTRADOR ==================== */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['ADM']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/linhas"
            element={
              <ProtectedRoute allowedRoles={['ADM']}>
                <LinesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/secretaria"
            element={
              <ProtectedRoute allowedRoles={['ADM']}>
                <SecretaryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/motoristas"
            element={
              <ProtectedRoute allowedRoles={['ADM']}>
                <DriversPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/veiculos"
            element={
              <ProtectedRoute allowedRoles={['ADM']}>
                <VehiclesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/relatorios"
            element={
              <ProtectedRoute allowedRoles={['ADM']}>
                <ReportsPage />
              </ProtectedRoute>
            }
          />
          {/* Avisos (fora de qualquer layout com sidebar) */}
          <Route
            path="/admin/avisos"
            element={
              <ProtectedRoute allowedRoles={['ADM']}>
                <NoticesPage />
              </ProtectedRoute>
            }
          />

          {/* ==================== REDIRECIONAMENTO PADRÃO ==================== */}
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
