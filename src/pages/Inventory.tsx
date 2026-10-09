import { useState } from 'react';
import { useAppData } from '../context/AppDataContext';
import { useAuth } from '../context/AuthContext';
import { Search, Plus } from 'lucide-react';

const Inventory = () => {
  const { rawMaterials, products } = useAppData();
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  
  const [activeTab, setActiveTab] = useState<'products' | 'rawMaterials'>('products');
  const [searchTerm, setSearchTerm] = useState('');

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
            <button className="btn btn-primary">
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
                </tr>
              ))}
              {filteredRM.length === 0 && (
                <tr>
                  <td colSpan={isAdmin ? 5 : 4} style={{ textAlign: 'center', padding: '2rem' }}>No se encontró materia prima.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
};

export default Inventory;
