import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Package, ShoppingCart, DollarSign, LogOut, Menu, Settings as SettingsIcon, ClipboardList } from 'lucide-react';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  const isAdmin = user.role === 'ADMIN';

  const navItemStyle = (isActive: boolean) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem 1rem',
    borderRadius: 'var(--radius-md)',
    color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
    backgroundColor: isActive ? 'rgba(139, 90, 43, 0.1)' : 'transparent',
    fontWeight: isActive ? 600 : 500,
    transition: 'var(--transition)',
    marginBottom: '0.5rem',
    textDecoration: 'none'
  });

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className={`sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem', padding: '0 0.5rem' }}>
          <div style={{ backgroundColor: 'transparent', padding: '0', borderRadius: '50%', width: '40px', height: '40px', overflow: 'hidden' }}>
            <img src={`${import.meta.env.BASE_URL}logo.jpg`} alt="Pecas Bakery Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <h2 style={{ fontSize: '1.25rem', margin: 0, color: 'var(--text-primary)' }}>Pecas Bakery</h2>
        </div>

        <nav style={{ flex: 1 }}>
          <NavLink to="/" style={({ isActive }) => navItemStyle(isActive)} onClick={() => setIsMobileMenuOpen(false)}>
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </NavLink>
          
          <NavLink to="/pos" style={({ isActive }) => navItemStyle(isActive)} onClick={() => setIsMobileMenuOpen(false)}>
            <ShoppingCart size={20} />
            <span>Punto de Venta</span>
          </NavLink>
          
          <NavLink to="/inventory" style={({ isActive }) => navItemStyle(isActive)} onClick={() => setIsMobileMenuOpen(false)}>
            <Package size={20} />
            <span>Inventario</span>
          </NavLink>

          {isAdmin ? (
            <>
              <NavLink to="/finance" style={({ isActive }) => navItemStyle(isActive)} onClick={() => setIsMobileMenuOpen(false)}>
                <DollarSign size={20} />
                <span>Finanzas</span>
              </NavLink>
              <NavLink to="/settings" style={({ isActive }) => navItemStyle(isActive)} onClick={() => setIsMobileMenuOpen(false)}>
                <SettingsIcon size={20} />
                <span>Ajustes</span>
              </NavLink>
            </>
          ) : (
            <NavLink to="/vendor-sales" style={({ isActive }) => navItemStyle(isActive)} onClick={() => setIsMobileMenuOpen(false)}>
              <ClipboardList size={20} />
              <span>Mis Ventas</span>
            </NavLink>
          )}
        </nav>

        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', padding: '0 0.5rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'var(--accent-primary)' }}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem' }}>{user.name}</p>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {user.role === 'ADMIN' ? 'Administrador' : 'Vendedor'}
              </p>
            </div>
          </div>
          
          <button 
            onClick={handleLogout}
            className="btn" 
            style={{ width: '100%', justifyContent: 'flex-start', padding: '0.75rem 1rem', color: 'var(--text-secondary)' }}
          >
            <LogOut size={18} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      <div className="mobile-overlay" onClick={() => setIsMobileMenuOpen(false)}></div>

      {/* Main Content */}
      <main className="main-content">
        <header className="topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button className="menu-btn" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu size={24} />
            </button>
            <h2 style={{ fontSize: '1.25rem', margin: 0, fontWeight: 500 }}>
              Bienvenido(a), {user.name}
            </h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
             {/* Additional topbar items could go here */}
          </div>
        </header>
        
        <div className="page-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
