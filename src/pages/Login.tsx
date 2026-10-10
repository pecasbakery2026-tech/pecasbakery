import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAppData } from '../context/AppDataContext';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const { employees, loading } = useAppData();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (loading) {
      setError('Conectando a la base de datos... intenta en unos segundos.');
      return;
    }

    const searchUsername = username.trim().toLowerCase();
    const emp = employees.find(e => (e.username || '').trim().toLowerCase() === searchUsername && e.password === password);
    
    if (emp) {
      login(emp.username || emp.name, emp.name, emp.role as any);
      navigate('/');
    } else if (searchUsername === 'admin' && password === 'qazwsxedc') {
      // Admin fallback
      login('admin', 'Administrador Principal', 'ADMIN');
      navigate('/');
    } else {
      setError('Usuario o contraseña incorrectos');
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-primary)', alignItems: 'center', justifyContent: 'center' }}>
      <div className="card" style={{ maxWidth: '400px', width: '100%', padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', padding: '0', backgroundColor: 'transparent', borderRadius: '50%', marginBottom: '1rem', width: '80px', height: '80px', overflow: 'hidden' }}>
            <img src={`${import.meta.env.BASE_URL}logo.jpg`} alt="Pecas Bakery Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
              required
            />
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', fontSize: '0.875rem' }}>
            <a href="#" style={{ color: 'var(--accent-primary)' }}>¿Olvidaste tu contraseña?</a>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem', padding: '0.75rem' }}>
            <Lock size={18} />
            Iniciar Sesión
          </button>
        </form>

      </div>
    </div>
  );
};

export default Login;
