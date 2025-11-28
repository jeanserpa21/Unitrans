import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuth();

  const menuItems = [
    { icon: '🏠', label: 'Início', path: '/motorista' },
    { icon: '💬', label: 'Enviar Mensagem', path: '/motorista/mensagem' },
    { icon: '🔔', label: 'Notificações', path: '/motorista/notificacoes' },
    { icon: '💬', label: 'Falar com a empresa', path: '/motorista/contato' },
    { icon: '❓', label: 'Ajuda', path: '/motorista/ajuda' },
    { icon: '♿', label: 'Acessibilidade', path: '/motorista/acessibilidade' },
  ];

  const handleMenuClick = (path) => {
    // Permitir navegação para início e mensagem
    if (path === '/motorista' || path === '/motorista/mensagem') {
      navigate(path);
    } else {
      alert('Funcionalidade em desenvolvimento');
    }
    setIsOpen(false);
  };

  const handleLogout = () => {
    if (confirm('Deseja sair da conta?')) {
      logout();
      navigate('/login');
    }
    setIsOpen(false);
  };

  return (
    <>
      {/* Botão Hamburger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-6 left-6 z-50 flex flex-col space-y-1.5 bg-green-700 p-3 rounded-lg shadow-lg hover:bg-green-600 transition"
      >
        <span className="block w-8 h-1 bg-white rounded"></span>
        <span className="block w-8 h-1 bg-white rounded"></span>
        <span className="block w-8 h-1 bg-white rounded"></span>
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/50 z-40"
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-80 bg-gradient-to-b from-green-700 to-green-600 text-white shadow-2xl z-50 transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-8">
          {/* Logo/Title */}
          <div className="mb-12 mt-8">
            <h2 className="text-2xl font-bold">UniTrans</h2>
            <p className="text-green-100 text-sm mt-1">Dashboard do Motorista</p>
          </div>

          {/* Menu Items */}
          <nav className="space-y-2">
            {menuItems.map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleMenuClick(item.path)}
                className="w-full flex items-center space-x-4 p-4 rounded-lg hover:bg-white/10 transition text-left"
              >
                <span className="text-2xl">{item.icon}</span>
                <span className="text-lg">{item.label}</span>
              </button>
            ))}

            {/* Sair */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-4 p-4 rounded-lg hover:bg-red-500/20 transition text-left mt-8 border-t border-white/20 pt-6"
            >
              <span className="text-2xl">🚪</span>
              <span className="text-lg">Sair</span>
            </button>
          </nav>
        </div>
      </div>
    </>
  );
}