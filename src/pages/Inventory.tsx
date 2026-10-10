import { useState } from 'react';
import { useAppData } from '../context/AppDataContext';
import { useAuth } from '../context/AuthContext';
import { Search, Plus, Edit2, Trash2, X } from 'lucide-react';
import type { RawMaterial, Unit } from '../types';

const Inventory = () => {
  const { rawMaterials, products, addRawMaterial, updateRawMaterial, deleteRawMaterial } = useAppData();
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  
  const [activeTab, setActiveTab] = useState<'products' | 'rawMaterials'>('products');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRM, setEditingRM] = useState<RawMaterial | null>(null);
  const [formData, setFormData] = useState({ name: '', unit: 'kg' as Unit, stock: 0, minStockAlert: 0, unitCost: 0 });

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredRM = rawMaterials.filter(rm => rm.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const tabStyle = (isActive: boolean) => ({
    padding: '0.75rem 1.5rem',
    borderBottom: isActive ? '2px solid var(--accent-primary)' : '2px solid transparent',
    color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
    fontWeight: isActive ? 600 : 500,
    cursor: 'pointer',
    backgroundColor: 'transparent',
    borderTop: 'none',
    borderLeft: 'none',
    borderRight: 'none',
  });

  const openModal = (rm: RawMaterial | null = null) => {
    if (rm) {
      setEditingRM(rm);
      setFormData({ name: rm.name, unit: rm.unit, stock: rm.stock, minStockAlert: rm.minStockAlert, unitCost: rm.unitCost });
    } else {
      setEditingRM(null);
      setFormData({ name: '', unit: 'kg', stock: 0, minStockAlert: 0, unitCost: 0 });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (activeTab !== 'rawMaterials') {
      alert('Agregar productos se habilitará próximamente.');
      setIsModalOpen(false);
      return;
    }
    if (editingRM) {
      await updateRawMaterial(editingRM.id, formData);
    } else {
      await addRawMaterial(formData);
    }
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Seguro que deseas eliminar esta materia prima?')) {
      await deleteRawMaterial(id);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button style={tabStyle(activeTab === 'products')} onClick={() => setActiveTab('products')}>
            Productos Terminados
          </button>
          <button style={tabStyle(activeTab === 'rawMaterials')} onClick={() => setActiveTab('rawMaterials')}>
            Materia Prima
          </button>
        </div>

        <div style={{ display: 'flex', gap: '1rem', flex: 1, justifyContent: 'flex-end' }}>
          <div style={{ position: 'relative', maxWidth: '300px', width: '100%' }}>
            <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Buscar..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '2.5rem', width: '100%' }}
            />
          </div>
          
          {isAdmin && (
            <button className="btn btn-primary" onClick={() => openModal()}>
              <Plus size={18} />
              Agregar
            </button>
          )}
        </div>
      </div>

      <div className="table-container">
        {activeTab === 'products' ? (
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Categoría</th>
                <th>Precio</th>
                {isAdmin && <th>Costo Est.</th>}
                <th>Stock</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(p => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 500 }}>{p.name}</td>
                  <td>{p.category}</td>
                  <td>${p.price.toFixed(2)}</td>
                  {isAdmin && <td>${p.estimatedCost.toFixed(2)}</td>}
                  <td>
                    <span style={{ fontWeight: 600, color: p.stock <= 10 ? 'var(--status-danger)' : 'inherit' }}>
                      {p.stock}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${p.stock > 0 ? 'badge-success' : 'badge-danger'}`}>
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={isAdmin ? 6 : 5} style={{ textAlign: 'center', padding: '2rem' }}>No se encontraron productos.</td>
                </tr>
              )}
            </tbody>
          </table>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Unidad</th>
                <th>Stock Actual</th>
                <th>Stock Mínimo</th>
                {isAdmin && <th>Costo Unitario</th>}
                {isAdmin && <th>Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {filteredRM.map(rm => (
                <tr key={rm.id}>
                  <td style={{ fontWeight: 500 }}>{rm.name}</td>
                  <td>{rm.unit}</td>
                  <td>
                    <span style={{ fontWeight: 600, color: rm.stock <= rm.minStockAlert ? 'var(--status-warning)' : 'inherit' }}>
                      {rm.stock} {rm.unit}
                    </span>
                  </td>
                  <td>{rm.minStockAlert} {rm.unit}</td>
                  {isAdmin && <td>${rm.unitCost.toFixed(2)}</td>}
                  {isAdmin && (
                    <td>
                      <button className="btn" style={{ padding: '0.25rem', marginRight: '0.5rem' }} onClick={() => openModal(rm)}>
                        <Edit2 size={16} />
                      </button>
                      <button className="btn" style={{ padding: '0.25rem', color: 'var(--status-danger)' }} onClick={() => handleDelete(rm.id)}>
                        <Trash2 size={16} />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
              {filteredRM.length === 0 && (
                <tr>
                  <td colSpan={isAdmin ? 6 : 4} style={{ textAlign: 'center', padding: '2rem' }}>No se encontró materia prima.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '400px', maxWidth: '90%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0 }}>{editingRM ? 'Editar' : 'Agregar'} {activeTab === 'rawMaterials' ? 'Materia Prima' : 'Producto'}</h3>
              <button className="btn" onClick={() => setIsModalOpen(false)} style={{ padding: '0.25rem' }}><X size={18} /></button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Nombre</label>
                <input type="text" style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              
              {activeTab === 'rawMaterials' && (
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Unidad</label>
                    <select style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }} value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value as Unit})}>
                      <option value="kg">kg</option>
                      <option value="g">g</option>
                      <option value="l">l</option>
                      <option value="ml">ml</option>
                      <option value="pzas">pzas</option>
                    </select>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Costo Unitario ($)</label>
                    <input type="number" step="0.01" style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }} value={formData.unitCost} onChange={e => setFormData({...formData, unitCost: parseFloat(e.target.value) || 0})} />
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Stock Actual</label>
                  <input type="number" style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }} value={formData.stock} onChange={e => setFormData({...formData, stock: parseFloat(e.target.value) || 0})} />
                </div>
                {activeTab === 'rawMaterials' && (
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Stock Mínimo (Alerta)</label>
                    <input type="number" style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }} value={formData.minStockAlert} onChange={e => setFormData({...formData, minStockAlert: parseFloat(e.target.value) || 0})} />
                  </div>
                )}
              </div>

              <button className="btn btn-primary" style={{ width: '100%', marginTop: '1rem', padding: '0.75rem', justifyContent: 'center' }} onClick={handleSave}>
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Inventory;
