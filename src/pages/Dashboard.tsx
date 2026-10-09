import { useAuth } from '../context/AuthContext';
import { useAppData } from '../context/AppDataContext';
import { TrendingUp, DollarSign, ShoppingBag, AlertTriangle } from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

const Dashboard = () => {
  const { user } = useAuth();
  const { sales, products, rawMaterials } = useAppData();
  const isAdmin = user?.role === 'ADMIN';

  // KPIs calculations
  const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);
  const totalCost = sales.reduce((sum, sale) => sum + sale.totalCost, 0);
  const netProfit = totalRevenue - totalCost;
  const margin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : '0';

  // Chart data: Sales Trend (last 7 days)
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });

  const trendData = last7Days.map(dateStr => {
    const daySales = sales.filter(s => s.date.startsWith(dateStr));
    return {
      date: dateStr.substring(5), // MM-DD
      ventas: daySales.reduce((sum, s) => sum + s.total, 0),
      costos: daySales.reduce((sum, s) => sum + s.totalCost, 0),
    };
  });

  // Chart data: Category Distribution
  const categoryCount: Record<string, number> = {};
  sales.forEach(sale => {
    sale.items.forEach(item => {
      const product = products.find(p => p.id === item.productId);
      if (product) {
        categoryCount[product.category] = (categoryCount[product.category] || 0) + item.quantity;
      }
    });
  });

  const pieData = Object.entries(categoryCount).map(([name, value]) => ({ name, value }));
  const COLORS = ['#8B5A2B', '#D2B48C', '#E8A317'];

  // Alerts
  const lowStockProducts = products.filter(p => p.stock <= 10);
  const lowStockRM = rawMaterials.filter(rm => rm.stock <= rm.minStockAlert);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* KPIs Section */}
      <div className="grid-cards">
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ backgroundColor: 'rgba(76, 175, 80, 0.1)', color: 'var(--status-success)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
            <DollarSign size={24} />
          </div>
          <div>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.875rem' }}>Ingresos (Mes)</p>
            <h3 style={{ margin: 0, fontSize: '1.5rem' }}>${totalRevenue.toFixed(2)}</h3>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ backgroundColor: 'rgba(139, 90, 43, 0.1)', color: 'var(--accent-primary)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
            <ShoppingBag size={24} />
          </div>
          <div>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.875rem' }}>Ventas Registradas</p>
            <h3 style={{ margin: 0, fontSize: '1.5rem' }}>{sales.length}</h3>
          </div>
        </div>

        {isAdmin && (
          <>
            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ backgroundColor: 'rgba(232, 163, 23, 0.1)', color: 'var(--accent-highlight)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                <TrendingUp size={24} />
              </div>
              <div>
                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.875rem' }}>Utilidad Neta</p>
                <h3 style={{ margin: 0, fontSize: '1.5rem' }}>${netProfit.toFixed(2)}</h3>
              </div>
            </div>
            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontWeight: 'bold', fontSize: '1.25rem' }}>%</div>
              </div>
              <div>
                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.875rem' }}>Margen Promedio</p>
                <h3 style={{ margin: 0, fontSize: '1.5rem' }}>{margin}%</h3>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Charts Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
        
        {isAdmin && (
          <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '400px' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>Tendencia de Ventas (7 días)</h3>
            <div style={{ flex: 1 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--status-success)" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="var(--status-success)" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorCostos" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--status-danger)" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="var(--status-danger)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                  <RechartsTooltip />
                  <Area type="monotone" dataKey="ventas" stroke="var(--status-success)" fillOpacity={1} fill="url(#colorVentas)" name="Ventas ($)" />
                  <Area type="monotone" dataKey="costos" stroke="var(--status-danger)" fillOpacity={1} fill="url(#colorCostos)" name="Costos ($)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '400px' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>Distribución por Categoría</h3>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Alerts Section */}
      <div className="card">
        <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertTriangle color="var(--status-warning)" />
          Alertas de Stock
        </h3>
        
        {lowStockProducts.length === 0 && lowStockRM.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No hay alertas de stock por el momento.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {lowStockProducts.map(p => (
              <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', backgroundColor: 'rgba(244, 67, 54, 0.05)', borderLeft: '4px solid var(--status-danger)', borderRadius: '0 var(--radius-md) var(--radius-md) 0' }}>
                <div>
                  <strong style={{ display: 'block' }}>Producto: {p.name}</strong>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Stock actual: {p.stock} unidades</span>
                </div>
                <span className="badge badge-danger">Reabastecer</span>
              </div>
            ))}
            
            {lowStockRM.map(rm => (
              <div key={rm.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', backgroundColor: 'rgba(255, 152, 0, 0.05)', borderLeft: '4px solid var(--status-warning)', borderRadius: '0 var(--radius-md) var(--radius-md) 0' }}>
                <div>
                  <strong style={{ display: 'block' }}>Insumo: {rm.name}</strong>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Stock: {rm.stock} {rm.unit} (Mínimo: {rm.minStockAlert})</span>
                </div>
                <span className="badge badge-warning">Stock Bajo</span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default Dashboard;
