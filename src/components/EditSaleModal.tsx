import { useState } from 'react';
import { X, Plus, Minus, Trash2 } from 'lucide-react';
import type { Sale, SaleItem } from '../types';
import { useAppData } from '../context/AppDataContext';

interface EditSaleModalProps {
  sale: Sale;
  onClose: () => void;
}

const EditSaleModal = ({ sale, onClose }: EditSaleModalProps) => {
  const { products, updateSale } = useAppData();
  
  const [cart, setCart] = useState<SaleItem[]>(sale.items);
  const [paymentMethod, setPaymentMethod] = useState(sale.paymentMethod);
  const [customerType, setCustomerType] = useState(sale.customerType);
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  
  const total = cart.reduce((sum, item) => sum + item.subtotal, 0);
  const totalCost = cart.reduce((sum, item) => {
    const p = products.find(prod => prod.id === item.productId);
    return sum + (p?.estimatedCost || 0) * item.quantity;
  }, 0);

  const getStockForProduct = (productId: string) => {
    const p = products.find(prod => prod.id === productId);
    if (!p) return 0;
    // For admin editing, we can consider the total global stock, 
    // but if the sale was made by a vendor, maybe we should restrict by vendor stock?
    // Usually admin has power to overwrite. We'll just use global stock + whatever was already in the cart.
    const itemInSale = sale.items.find(i => i.productId === productId);
    return p.stock + (itemInSale ? itemInSale.quantity : 0);
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.productId === productId) {
        const maxStock = getStockForProduct(productId);
        const newQ = Math.max(1, Math.min(item.quantity + delta, maxStock));
        return { ...item, quantity: newQ, subtotal: newQ * item.unitPrice };
      }
      return item;
    }));
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.productId !== productId));
  };

  const handleAddProduct = () => {
    if (!selectedProduct) return;
    const p = products.find(prod => prod.id === selectedProduct);
    if (!p) return;

    setCart(prev => {
      const existing = prev.find(item => item.productId === p.id);
      if (existing) {
        return prev.map(item => 
          item.productId === p.id 
            ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * item.unitPrice }
            : item
        );
      }
      return [...prev, { productId: p.id, quantity: 1, unitPrice: p.price, subtotal: p.price }];
    });
    setSelectedProduct('');
  };

  const handleSave = async () => {
    if (cart.length === 0) {
      alert("La venta debe tener al menos un artículo.");
      return;
    }
    await updateSale(sale.id, {
      ...sale,
      items: cart,
      total,
      totalCost,
      paymentMethod,
      customerType
    });
    onClose();
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div className="card" style={{ width: '600px', maxWidth: '90%', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
          <h3 style={{ margin: 0 }}>Editar Venta {sale.id.substring(0,8)}</h3>
          <button className="btn" onClick={onClose} style={{ padding: '0.25rem' }}><X size={18} /></button>
        </div>
        
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', paddingRight: '0.5rem' }}>
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Método de Pago</label>
              <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value as any)} style={{ width: '100%' }}>
                <option value="Efectivo">Efectivo</option>
                <option value="Tarjeta">Tarjeta</option>
                <option value="Transferencia">Transferencia</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Tipo de Venta</label>
              <select value={customerType} onChange={e => setCustomerType(e.target.value as any)} style={{ width: '100%' }}>
                <option value="Mostrador">Mostrador</option>
                <option value="Pedido especial">Pedido especial</option>
                <option value="Evento">Evento</option>
              </select>
            </div>
          </div>

          <div style={{ marginTop: '1rem' }}>
            <h4 style={{ marginBottom: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Artículos</h4>
            
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <select value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)} style={{ flex: 1 }}>
                <option value="">Añadir producto...</option>
                {products.filter(p => getStockForProduct(p.id) > 0).map(p => (
                  <option key={p.id} value={p.id}>{p.name} (${p.price})</option>
                ))}
              </select>
              <button className="btn btn-secondary" onClick={handleAddProduct}>Añadir</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {cart.map((item) => {
                const p = products.find(prod => prod.id === item.productId);
                return (
                  <div key={item.productId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontWeight: 500 }}>{p?.name || 'Producto Desconocido'}</p>
                      <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)' }}>${item.unitPrice.toFixed(2)} c/u</p>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-card)' }}>
                        <button onClick={() => updateQuantity(item.productId, -1)} style={{ padding: '0.25rem' }}><Minus size={14} /></button>
                        <span style={{ width: '24px', textAlign: 'center', fontSize: '0.875rem', fontWeight: 600 }}>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.productId, 1)} style={{ padding: '0.25rem' }}><Plus size={14} /></button>
                      </div>
                      <strong style={{ width: '60px', textAlign: 'right', color: 'var(--accent-primary)' }}>${item.subtotal.toFixed(2)}</strong>
                      <button onClick={() => removeFromCart(item.productId)} style={{ color: 'var(--status-danger)', padding: '0.25rem' }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem' }}>
            <span style={{ fontWeight: 500 }}>Nuevo Total:</span>
            <strong style={{ color: 'var(--status-success)' }}>${total.toFixed(2)}</strong>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="btn btn-secondary" style={{ flex: 1, padding: '0.75rem' }} onClick={onClose}>
              Cancelar
            </button>
            <button className="btn btn-primary" style={{ flex: 1, padding: '0.75rem' }} onClick={handleSave}>
              Guardar Cambios
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditSaleModal;
