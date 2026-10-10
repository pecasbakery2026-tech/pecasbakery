import { useState } from 'react';
import { useAppData } from '../context/AppDataContext';
import { Plus, Trash2, Edit2, X } from 'lucide-react';

const Settings = () => {
  const { categories, employees, addCategory, deleteCategory, addEmployee, updateEmployee, deleteEmployee } = useAppData();
  
  // Category Form
  const [catName, setCatName] = useState('');

  // Employee Form
  const [isEmpModalOpen, setIsEmpModalOpen] = useState(false);
  const [editingEmp, setEditingEmp] = useState<any>(null);
  const [empFormData, setEmpFormData] = useState({ name: '', role: 'EMPLOYEE' });

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;
    await addCategory({ name: catName });
    setCatName('');
  };

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!empFormData.name.trim()) return;
    
    if (editingEmp) {
      await updateEmployee(editingEmp.id, empFormData);
    } else {
      await addEmployee(empFormData);
    }
    setIsEmpModalOpen(false);
    setEditingEmp(null);
    setEmpFormData({ name: '', role: 'EMPLOYEE' });
  };

  const openEmpModal = (emp: any = null) => {
    if (emp) {
      setEditingEmp(emp);
      setEmpFormData({ name: emp.name, role: emp.role || 'EMPLOYEE' });
    } else {
      setEditingEmp(null);
      setEmpFormData({ name: '', role: 'EMPLOYEE' });
    }
    setIsEmpModalOpen(true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      <div className="grid-cards" style={{ gridTemplateColumns: '1fr 1fr' }}>
        
        {/* Categories Section */}
        <div className="card">
          <h3 style={{ marginBottom: '1rem' }}>Categorías de Productos</h3>
          <form onSubmit={handleAddCategory} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <input 
              type="text" 
              placeholder="Nueva categoría..." 
              value={catName}
              onChange={e => setCatName(e.target.value)}
              style={{ flex: 1, padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)' }}
            />
            <button type="submit" className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>
              <Plus size={18} />
              Agregar
            </button>
          </form>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {categories.map(cat => (
              <div key={cat.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                <span>{cat.name}</span>
                <button 
                  onClick={() => { if(confirm('¿Eliminar esta categoría?')) deleteCategory(cat.id) }} 
                  className="btn" 
                  style={{ color: 'var(--status-danger)', padding: '0.25rem' }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            {categories.length === 0 && (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', margin: '1rem 0' }}>No hay categorías registradas.</p>
            )}
          </div>
        </div>

        {/* Employees Section */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0 }}>Usuarios / Empleados</h3>
            <button className="btn btn-primary" onClick={() => openEmpModal()} style={{ padding: '0.5rem 1rem' }}>
              <Plus size={18} />
              Crear Usuario
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {employees.map(emp => (
              <div key={emp.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                <div>
                  <strong style={{ display: 'block' }}>{emp.name}</strong>
                  <span className="badge badge-success" style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>{emp.role}</span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => openEmpModal(emp)} className="btn" style={{ padding: '0.25rem' }}>
                    <Edit2 size={16} />
                  </button>
                  <button 
                    onClick={() => { if(confirm('¿Eliminar este usuario?')) deleteEmployee(emp.id) }} 
                    className="btn" 
                    style={{ color: 'var(--status-danger)', padding: '0.25rem' }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
            {employees.length === 0 && (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', margin: '1rem 0' }}>No hay usuarios registrados.</p>
            )}
          </div>
        </div>

      </div>

      {isEmpModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '400px', maxWidth: '90%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0 }}>{editingEmp ? 'Editar Usuario' : 'Nuevo Usuario'}</h3>
              <button className="btn" onClick={() => setIsEmpModalOpen(false)} style={{ padding: '0.25rem' }}><X size={18} /></button>
            </div>
            
            <form onSubmit={handleAddEmployee} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Nombre Completo</label>
                <input 
                  type="text" 
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }} 
                  value={empFormData.name} 
                  onChange={e => setEmpFormData({...empFormData, name: e.target.value})} 
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Rol</label>
                <select 
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }} 
                  value={empFormData.role} 
                  onChange={e => setEmpFormData({...empFormData, role: e.target.value})}
                >
                  <option value="EMPLOYEE">Vendedor / Empleado</option>
                  <option value="ADMIN">Administrador</option>
                </select>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                  Nota: Por ahora, este rol es solo informativo y para asignación de inventario. El inicio de sesión real sigue controlándose desde el menú lateral.
                </p>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem', padding: '0.75rem', justifyContent: 'center' }}>
                Guardar Usuario
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Settings;
