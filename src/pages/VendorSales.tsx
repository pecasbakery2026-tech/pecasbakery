import { useState } from 'react';
import { useAppData } from '../context/AppDataContext';
import { useAuth } from '../context/AuthContext';
import SaleDetailsModal from '../components/SaleDetailsModal';
import type { Sale } from '../types';
import { ClipboardList } from 'lucide-react';

const VendorSales = () => {
  const { sales } = useAppData();
  const { user } = useAuth();
  
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

  // Filter sales for this vendor specifically
  const mySales = sales.filter(s => s.sellerName === user?.name || (!s.sellerName && user?.name === 'Admin')).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalSold = mySales.reduce((sum, s) => sum + s.total, 0);
  const totalItems = mySales.reduce((sum, s) => sum + s.items.reduce((acc, i) => acc + i.quantity, 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      <div className="grid-cards">
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ backgroundColor: 'rgba(76, 175, 80, 0.1)', color: 'var(--status-success)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
            <ClipboardList size={24} />
          </div>
          <div>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.875rem' }}>Mis Ventas Registradas</p>
            <h3 style={{ margin: 0, fontSize: '1.5rem' }}>{mySales.length}</h3>
          </div>
        </div>
        
        <div className="card">
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.875rem' }}>Artículos Vendidos</p>
          <h3 style={{ margin: '0.5rem 0 0 0', fontSize: '1.5rem' }}>{totalItems}</h3>
        </div>

        <div className="card">
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.875rem' }}>Ingresos Generados</p>
          <h3 style={{ margin: '0.5rem 0 0 0', fontSize: '1.5rem', color: 'var(--status-success)' }}>${totalSold.toFixed(2)}</h3>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
          <h3 style={{ margin: 0 }}>Historial de mis ventas</h3>
        </div>
        <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Método de Pago</th>
                <th>Artículos</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {mySales.map(s => (
                <tr key={s.id} onClick={() => setSelectedSale(s)} style={{ cursor: 'pointer' }}>
                  <td>{new Date(s.date).toLocaleDateString()} {new Date(s.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                  <td>
                    <span className="badge" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
                      {s.paymentMethod}
                    </span>
                  </td>
                  <td>{s.items.reduce((acc, i) => acc + i.quantity, 0)} unidades</td>
                  <td style={{ color: 'var(--status-success)', fontWeight: 600 }}>${s.total.toFixed(2)}</td>
                </tr>
              ))}
              {mySales.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '2rem' }}>Aún no has registrado ninguna venta.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedSale && (
        <SaleDetailsModal sale={selectedSale} onClose={() => setSelectedSale(null)} />
      )}
    </div>
  );
};

export default VendorSales;
