import { X } from 'lucide-react';
import type { Sale } from '../types';
import { useAppData } from '../context/AppDataContext';

interface SaleDetailsModalProps {
  sale: Sale;
  onClose: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

const SaleDetailsModal = ({ sale, onClose, onEdit, onDelete }: SaleDetailsModalProps) => {
  const { products } = useAppData();

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div className="card" style={{ width: '500px', maxWidth: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
          <h3 style={{ margin: 0 }}>Detalles de la Venta</h3>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {onEdit && (
              <button className="btn btn-secondary" onClick={onEdit} style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}>Editar</button>
            )}
            {onDelete && (
              <button className="btn btn-secondary" onClick={onDelete} style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem', color: 'var(--status-danger)', borderColor: 'var(--status-danger)' }}>Eliminar</button>
            )}
            <button className="btn" onClick={onClose} style={{ padding: '0.25rem' }}><X size={18} /></button>
          </div>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)' }}>Fecha</p>
              <p style={{ margin: 0, fontWeight: 500 }}>{new Date(sale.date).toLocaleDateString()} {new Date(sale.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)' }}>Vendedor</p>
              <p style={{ margin: 0, fontWeight: 500 }}>{sale.sellerName || 'Admin'}</p>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)' }}>Método de Pago</p>
              <p style={{ margin: 0, fontWeight: 500 }}>{sale.paymentMethod}</p>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)' }}>Tipo de Cliente</p>
              <p style={{ margin: 0, fontWeight: 500 }}>{sale.customerType}</p>
            </div>
          </div>

          <div style={{ marginTop: '1rem' }}>
            <h4 style={{ marginBottom: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Artículos Vendidos</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {sale.items.map((item, idx) => {
                const p = products.find(prod => prod.id === item.productId);
                return (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)' }}>
                    <div>
                      <p style={{ margin: 0, fontWeight: 500 }}>{p?.name || 'Producto Desconocido'}</p>
                      <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)' }}>{item.quantity} x ${item.unitPrice.toFixed(2)}</p>
                    </div>
                    <strong style={{ color: 'var(--accent-primary)' }}>${item.subtotal.toFixed(2)}</strong>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Total Costo:</span>
              <span style={{ color: 'var(--status-danger)' }}>${sale.totalCost.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Total Ingreso:</span>
              <span style={{ color: 'var(--status-success)', fontWeight: 600 }}>${sale.total.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.125rem', marginTop: '0.5rem' }}>
              <span style={{ fontWeight: 600 }}>Utilidad Neta:</span>
              <strong style={{ color: 'var(--text-primary)' }}>${(sale.total - sale.totalCost).toFixed(2)}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SaleDetailsModal;
