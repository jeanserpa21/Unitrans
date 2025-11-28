import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function AdminSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();

  const menuItems = [
    { icon: '🏠', label: 'Início', path: '/admin' },
    { icon: '🚌', label: 'Linhas', path: '/admin/linhas' },
    { icon: '🗓️', label: 'Viagens', path: '/admin/viagens' }, // ✅ NOVO
    { icon: '👨‍✈️', label: 'Motoristas', path: '/admin/motoristas' },
    { icon: '🚐', label: 'Veículos', path: '/admin/veiculos' },
    { icon: '📱', label: 'QR Code', path: '/admin/qrcode' },
    { icon: '📊', label: 'Relatórios', path: '/admin/relatorios' },
    { icon: '📋', label: 'Secretaria', path: '/admin/secretaria' },
    { icon: '❓', label: 'Ajuda', path: '/admin/ajuda' },
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    if (confirm('Deseja sair da conta?')) {
      logout();
      navigate('/login');
    }
  };

  return (
    <div className="fixed left-0 top-0 h-screen w-64 bg-gradient-to-b from-green-800 to-green-900 text-white shadow-2xl z-40">
      {/* Logo */}
      <div className="p-6 border-b border-green-700">
        <div className="border-2 border-white rounded px-3 py-2">
          <h1 className="text-xl font-bold">Unitrans</h1>
        </div>
      </div>

      {/* Menu */}
      <nav className="py-4 space-y-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 180px)' }}>
        {menuItems.map((item, idx) => (
          <Link
            key={idx}
            to={item.path}
            className={`flex items-center space-x-3 w-full px-6 py-3 text-left transition ${
              isActive(item.path)
                ? 'bg-white/20 border-l-4 border-white'
                : 'hover:bg-white/10'
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            <span className="text-sm font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Logout */}
      <div className="absolute bottom-6 left-0 right-0 px-6">
        <button
          onClick={handleLogout}
          className="w-full bg-red-600 hover:bg-red-700 py-3 rounded text-sm font-semibold transition shadow-lg"
        >
          🚪 Sair
        </button>
      </div>
    </div>
  );
}