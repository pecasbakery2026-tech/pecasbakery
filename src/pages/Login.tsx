import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAppData } from '../context/AppDataContext';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const { employees } = useAppData();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isDemo, setIsDemo] = useState(true);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isDemo) {
      const role = username.includes('admin') ? 'ADMIN' : 'EMPLOYEE';
      login(username || 'admin', role === 'ADMIN' ? 'Admin User' : 'Vendedor', role);
      navigate('/');
    } else {
      const emp = employees.find(e => e.username === username && e.password === password);
      if (emp) {
        login(emp.username || emp.name, emp.name, emp.role as any);
        navigate('/');
      } else {
        setError('Usuario o contraseña incorrectos');
      }
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
          {error && (
            <div style={{ padding: '0.75rem', backgroundColor: 'rgba(244, 67, 54, 0.1)', color: 'var(--status-danger)', borderRadius: 'var(--radius-sm)', fontSize: '0.875rem', textAlign: 'center' }}>
              {error}
            </div>
          )}
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem' }}>Nombre de Usuario</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="vendedor1"
              style={{ width: '100%' }}
              required
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
              <li><strong>Admin:</strong> admin</li>
              <li><strong>Vendedor:</strong> vendedor</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
