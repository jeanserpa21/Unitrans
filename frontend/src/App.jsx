import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './pages/auth/LoginPage';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.papel)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const PassengerDashboard = () => {
  const { user, logout } = useAuth();
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Dashboard do Passageiro</h1>
          <button onClick={logout} className="btn btn-secondary">Sair</button>
        </div>
        <div className="card">
          <h2 className="text-xl font-semibold mb-2">Olá, {user.nome}! 👋</h2>
          <p className="text-gray-600">Bem-vindo ao painel do passageiro.</p>
        </div>
      </div>
    </div>
  );
};

const DriverDashboard = () => {
  const { user, logout } = useAuth();
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Dashboard do Motorista</h1>
          <button onClick={logout} className="btn btn-secondary">Sair</button>
        </div>
        <div className="card">
          <h2 className="text-xl font-semibold mb-2">Olá, {user.nome}! 🚗</h2>
          <p className="text-gray-600">Bem-vindo ao painel do motorista.</p>
        </div>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Dashboard do Admin</h1>
          <button onClick={logout} className="btn btn-secondary">Sair</button>
        </div>
        <div className="card">
          <h2 className="text-xl font-semibold mb-2">Olá, {user.nome}! 👨‍💼</h2>
          <p className="text-gray-600">Bem-vindo ao painel administrativo.</p>
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          
          <Route
            path="/passageiro"
            element={
              <ProtectedRoute allowedRoles={['PASSAGEIRO']}>
                <PassengerDashboard />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/motorista"
            element={
              <ProtectedRoute allowedRoles={['MOTORISTA']}>
                <DriverDashboard />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['ADM']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;