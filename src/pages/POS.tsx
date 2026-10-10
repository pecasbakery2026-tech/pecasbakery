import { useState } from 'react';
import { useAppData } from '../context/AppDataContext';
import type { Product, SaleItem } from '../types';
import { ShoppingCart, Plus, Minus, Trash2, CheckCircle2 } from 'lucide-react';

import { useAuth } from '../context/AuthContext';
const POS = () => {
  const { products, addSale } = useAppData();
  const { user } = useAuth();
  const isVendor = user?.role === 'EMPLOYEE';
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'Efectivo' | 'Transferencia' | 'Tarjeta'>('Efectivo');
  const [customerType, setCustomerType] = useState<'Mostrador' | 'Pedido especial' | 'Evento'>('Mostrador');
  const [showSuccess, setShowSuccess] = useState(false);

  const getDisplayStock = (p: Product) => isVendor ? (p.vendorStock || 0) : p.stock;
  const availableProducts = products.filter(p => getDisplayStock(p) > 0);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id);
      if (existing) {
        if (existing.quantity >= getDisplayStock(product)) return prev; // Cannot exceed stock
        return prev.map(item => 
          item.productId === product.id 
            ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * item.unitPrice }
            : item
        );
      }
      return [...prev, { productId: product.id, quantity: 1, unitPrice: product.price, subtotal: product.price }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.productId === productId) {
        const product = products.find(p => p.id === productId);
        const maxStock = product ? getDisplayStock(product) : 1;
        const newQ = Math.max(1, Math.min(item.quantity + delta, maxStock));
        return { ...item, quantity: newQ, subtotal: newQ * item.unitPrice };
      }
      return item;
    }));
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.productId !== productId));
  };

  const total = cart.reduce((sum, item) => sum + item.subtotal, 0);
  const totalCost = cart.reduce((sum, item) => {
    const p = products.find(prod => prod.id === item.productId);
    return sum + (p?.estimatedCost || 0) * item.quantity;
  }, 0);

  const handleCheckout = () => {
    if (cart.length === 0) return;
    
    addSale({
      items: cart,
      total,
      totalCost,
      paymentMethod,
      customerType
    }, isVendor);
    
    setCart([]);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="pos-container" style={{ display: 'flex', gap: '2rem', height: '100%', flexDirection: 'row' }}>
      
      {/* Products Grid */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ marginBottom: '1.5rem' }}>Productos Disponibles</h3>
        <div className="grid-cards" style={{ overflowY: 'auto', paddingRight: '0.5rem', alignContent: 'start' }}>
          {availableProducts.map(p => (
            <div 
              key={p.id} 
              className="card" 
              style={{ cursor: 'pointer', transition: 'var(--transition)' }}
              onClick={() => addToCart(p)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span className="badge badge-success" style={{ fontSize: '0.75rem' }}>{p.category}</span>
                <span style={{ fontWeight: 600, color: 'var(--accent-primary)' }}>${p.price.toFixed(2)}</span>
              </div>
              <h4 style={{ marginBottom: '0.5rem' }}>{p.name}</h4>
              <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)' }}>Stock: {getDisplayStock(p)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Cart Sidebar */}
      <div className="card pos-cart" style={{ width: '380px', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 150px)', position: 'sticky', top: 0 }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1rem' }}>
          <ShoppingCart size={20} />
          Pedido Actual
        </h3>

        {showSuccess ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--status-success)', textAlign: 'center' }}>
            <CheckCircle2 size={64} style={{ marginBottom: '1rem' }} />
            <h3>¡Venta Completada!</h3>
            <p>El inventario ha sido actualizado.</p>
          </div>
        ) : (
          <>
            <div style={{ flex: 1, overflowY: 'auto', marginBottom: '1rem' }}>
              {cart.length === 0 ? (
                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                  Selecciona productos para comenzar
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {cart.map(item => {
                    const product = products.find(p => p.id === item.productId);
                    return (
                      <div key={item.productId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px dashed var(--border-color)', paddingBottom: '1rem' }}>
                        <div style={{ flex: 1 }}>
                          <h5 style={{ margin: '0 0 0.25rem 0' }}>{product?.name}</h5>
                          <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>${item.unitPrice.toFixed(2)} c/u</span>
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
                            <button onClick={() => updateQuantity(item.productId, -1)} style={{ padding: '0.25rem' }}><Minus size={14} /></button>
                            <span style={{ width: '24px', textAlign: 'center', fontSize: '0.875rem', fontWeight: 600 }}>{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.productId, 1)} style={{ padding: '0.25rem' }}><Plus size={14} /></button>
                          </div>
                          <strong style={{ width: '60px', textAlign: 'right' }}>${item.subtotal.toFixed(2)}</strong>
                          <button onClick={() => removeFromCart(item.productId)} style={{ color: 'var(--status-danger)', padding: '0.25rem' }}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 500 }}>Total</span>
                <span style={{ fontWeight: 'bold', fontSize: '1.25rem', color: 'var(--accent-primary)' }}>${total.toFixed(2)}</span>
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Método de Pago</label>
                <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value as any)} style={{ width: '100%' }}>
                  <option value="Efectivo">Efectivo</option>
                  <option value="Tarjeta">Tarjeta</option>
                  <option value="Transferencia">Transferencia</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Tipo de Venta</label>
                <select value={customerType} onChange={e => setCustomerType(e.target.value as any)} style={{ width: '100%' }}>
                  <option value="Mostrador">Mostrador</option>
                  <option value="Pedido especial">Pedido especial</option>
                  <option value="Evento">Evento</option>
                </select>
              </div>

              <button 
                className="btn btn-primary" 
                style={{ width: '100%', padding: '1rem', fontSize: '1rem' }}
                onClick={handleCheckout}
                disabled={cart.length === 0}
              >
                Cobrar Pedido
              </button>
            </div>
          </>
        )}
      </div>

    </div>
  );
};

export default POS;
