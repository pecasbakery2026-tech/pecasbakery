import { createContext, useContext, useState, useEffect } from 'react';
import type { User, Role } from '../types';

interface AuthContextType {
  user: User | null;
  login: (username: string, name: string, role: Role) => void;
  logout: () => void;
  toggleDemoRole: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check localStorage on mount
    const saved = localStorage.getItem('pecas_auth');
    if (saved) {
      setUser(JSON.parse(saved));
    } else {
      // Set default demo user
      setUser({ id: '1', name: 'Admin User', email: 'admin@pecas.com', role: 'ADMIN' });
    }
  }, []);

  const login = (username: string, name: string, role: Role) => {
    const newUser: User = {
      id: Math.random().toString(36).substring(7),
      name: name,
      email: username, // repurpose email field as username for now to avoid refactoring User type everywhere
      role,
    };
    setUser(newUser);
    localStorage.setItem('pecas_auth', JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('pecas_auth');
  };

  const toggleDemoRole = () => {
    if (!user) return;
    const newRole: Role = user.role === 'ADMIN' ? 'EMPLOYEE' : 'ADMIN';
    const updatedUser = { ...user, role: newRole, name: newRole === 'ADMIN' ? 'Admin User' : 'Vendedor' };
    setUser(updatedUser);
    localStorage.setItem('pecas_auth', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, toggleDemoRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
