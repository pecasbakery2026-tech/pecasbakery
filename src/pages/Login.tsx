import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Cookie, Lock } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isDemo, setIsDemo] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isDemo) {
      // In demo mode, email determines role for simplicity
      const role = email.includes('admin') ? 'ADMIN' : 'EMPLOYEE';
      login(email || (role === 'ADMIN' ? 'admin@pecas.com' : 'vendedor@pecas.com'), role);
      navigate('/');
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-primary)', alignItems: 'center', justifyContent: 'center' }}>
      <div className="card" style={{ maxWidth: '400px', width: '100%', padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', padding: '0', backgroundColor: 'transparent', borderRadius: '50%', marginBottom: '1rem', width: '80px', height: '80px', overflow: 'hidden' }}>
            <img src="/logo.jpg" alt="Pecas Bakery Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <h1 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Pecas Bakery</h1>
          <p style={{ color: 'var(--text-muted)' }}>Sistema de Gestión</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem' }}>Correo Electrónico</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@pecas.com o user@pecas.com"
              style={{ width: '100%' }}
              required={!isDemo}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem' }}>Contraseña</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{ width: '100%' }}
              required={!isDemo}
            />
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.875rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input type="checkbox" checked={isDemo} onChange={() => setIsDemo(!isDemo)} />
              Modo Demo (Login rápido)
            </label>
            <a href="#" style={{ color: 'var(--accent-primary)' }}>¿Olvidaste tu contraseña?</a>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem', padding: '0.75rem' }}>
            <Lock size={18} />
            Iniciar Sesión
          </button>
        </form>

        {isDemo && (
          <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', fontSize: '0.875rem' }}>
            <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Accesos de prueba:</p>
            <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-secondary)' }}>
              <li><strong>Admin:</strong> admin@pecas.com</li>
              <li><strong>Vendedor:</strong> vendedor@pecas.com</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
