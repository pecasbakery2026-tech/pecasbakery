import { useState } from 'react';
import { useAppData } from '../context/AppDataContext';
import { Download, Plus, Filter } from 'lucide-react';

const Finance = () => {
  const { sales, expenses } = useAppData();
  const [dateFilter, setDateFilter] = useState<'Hoy' | 'Semana' | 'Mes' | 'Todos'>('Todos');
  const [activeTab, setActiveTab] = useState<'sales' | 'expenses'>('sales');

  const filterByDate = (dateStr: string) => {
    if (dateFilter === 'Todos') return true;
    
    const d = new Date(dateStr);
    const today = new Date();
    
    if (dateFilter === 'Hoy') {
      return d.toDateString() === today.toDateString();
    }
    
    if (dateFilter === 'Semana') {
      const oneWeekAgo = new Date(today);
      oneWeekAgo.setDate(today.getDate() - 7);
      return d >= oneWeekAgo;
    }
    
    if (dateFilter === 'Mes') {
      return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
    }
    
    return true;
  };

  const filteredSales = sales.filter(s => filterByDate(s.date)).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const filteredExpenses = expenses.filter(e => filterByDate(e.date)).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalRevenue = filteredSales.reduce((sum, s) => sum + s.total, 0);
  const totalCost = filteredSales.reduce((sum, s) => sum + s.totalCost, 0);
  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  const realProfit = totalRevenue - totalCost - totalExpenses;

  const handleExport = () => {
    // Simulated export logic
    alert('Exportando reporte a CSV...');
  };

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
      
      {/* Financial Summary */}
      <div className="grid-cards">
        <div className="card">
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.875rem' }}>Ingresos por Ventas</p>
          <h3 style={{ margin: '0.5rem 0 0 0', fontSize: '1.5rem', color: 'var(--status-success)' }}>${totalRevenue.toFixed(2)}</h3>
        </div>
        <div className="card">
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.875rem' }}>Costo de Producción</p>
          <h3 style={{ margin: '0.5rem 0 0 0', fontSize: '1.5rem', color: 'var(--status-warning)' }}>${totalCost.toFixed(2)}</h3>
        </div>
        <div className="card">
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.875rem' }}>Gastos Operativos</p>
          <h3 style={{ margin: '0.5rem 0 0 0', fontSize: '1.5rem', color: 'var(--status-danger)' }}>${totalExpenses.toFixed(2)}</h3>
        </div>
        <div className="card" style={{ backgroundColor: 'var(--accent-primary)', color: 'white', borderColor: 'var(--accent-primary)' }}>
          <p style={{ margin: 0, opacity: 0.9, fontSize: '0.875rem' }}>Utilidad Real</p>
          <h3 style={{ margin: '0.5rem 0 0 0', fontSize: '1.5rem' }}>${realProfit.toFixed(2)}</h3>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button style={tabStyle(activeTab === 'sales')} onClick={() => setActiveTab('sales')}>
            Registro de Ventas
          </button>
          <button style={tabStyle(activeTab === 'expenses')} onClick={() => setActiveTab('expenses')}>
            Gastos Operativos
          </button>
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '0.25rem' }}>
            <Filter size={16} style={{ color: 'var(--text-muted)', marginLeft: '0.5rem' }} />
            <select 
              value={dateFilter} 
              onChange={e => setDateFilter(e.target.value as any)}
              style={{ border: 'none', backgroundColor: 'transparent', outline: 'none', padding: '0.25rem 0.5rem' }}
            >
              <option value="Todos">Histórico</option>
              <option value="Hoy">Hoy</option>
              <option value="Semana">Esta Semana</option>
              <option value="Mes">Este Mes</option>
            </select>
          </div>
          
          {activeTab === 'expenses' && (
            <button className="btn btn-primary">
              <Plus size={18} /> Nuevo Gasto
            </button>
          )}

          <button className="btn btn-secondary" onClick={handleExport}>
            <Download size={18} /> Exportar
          </button>
        </div>
      </div>

      <div className="table-container">
        {activeTab === 'sales' ? (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Fecha</th>
                <th>Método de Pago</th>
                <th>Artículos</th>
                <th>Costo</th>
                <th>Ingreso</th>
                <th>Utilidad Neta</th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.map(s => {
                const profit = s.total - s.totalCost;
                return (
                  <tr key={s.id}>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{s.id}</td>
                    <td>{new Date(s.date).toLocaleDateString()} {new Date(s.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                    <td>
                      <span className="badge" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
                        {s.paymentMethod}
                      </span>
                    </td>
                    <td>{s.items.reduce((acc, i) => acc + i.quantity, 0)} unidades</td>
                    <td style={{ color: 'var(--status-danger)' }}>${s.totalCost.toFixed(2)}</td>
                    <td style={{ color: 'var(--status-success)', fontWeight: 600 }}>${s.total.toFixed(2)}</td>
                    <td style={{ fontWeight: 'bold' }}>${profit.toFixed(2)}</td>
                  </tr>
                )
              })}
              {filteredSales.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}>No hay ventas registradas en este periodo.</td>
                </tr>
              )}
            </tbody>
          </table>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Categoría</th>
                <th>Descripción</th>
                <th>Monto</th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.map(e => (
                <tr key={e.id}>
                  <td>{new Date(e.date).toLocaleDateString()}</td>
                  <td>
                    <span className="badge" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
                      {e.category}
                    </span>
                  </td>
                  <td>{e.description}</td>
                  <td style={{ color: 'var(--status-danger)', fontWeight: 600 }}>${e.amount.toFixed(2)}</td>
                </tr>
              ))}
              {filteredExpenses.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '2rem' }}>No hay gastos registrados en este periodo.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
};

export default Finance;
