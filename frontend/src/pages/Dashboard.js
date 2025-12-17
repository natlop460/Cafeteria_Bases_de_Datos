import React, { useState, useEffect } from 'react';
import { Users, Package, ShoppingCart, AlertTriangle, DollarSign, TrendingUp } from 'lucide-react';
import { reportesAPI } from '../services/api';

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [ventasMensuales, setVentasMensuales] = useState([]);
  const [topProductos, setTopProductos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [dashboardRes, ventasRes, productosRes] = await Promise.all([
        reportesAPI.getDashboard(),
        reportesAPI.getVentasMensuales(),
        reportesAPI.getTopProductos('unidades')
      ]);
      setStats(dashboardRes.data);
      setVentasMensuales(ventasRes.data.slice(0, 6));
      setTopProductos(productosRes.data.slice(0, 5));
    } catch (error) {
      console.error('Error cargando dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatMoney = (amount) => {
    return new Intl.NumberFormat('es-CR', {
      style: 'currency',
      currency: 'CRC',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return <div className="loading">Cargando dashboard...</div>;
  }

  return (
    <div>
      <div className="page-header">
        <h2>Dashboard</h2>
        <span className="badge badge-info">Actualizado ahora</span>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon primary">
            <Users size={28} />
          </div>
          <div className="stat-info">
            <h4>Clientes Activos</h4>
            <p>{stats?.clientes_activos || 0}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon success">
            <Package size={28} />
          </div>
          <div className="stat-info">
            <h4>Productos Activos</h4>
            <p>{stats?.productos_activos || 0}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon info">
            <ShoppingCart size={28} />
          </div>
          <div className="stat-info">
            <h4>Pedidos Hoy</h4>
            <p>{stats?.pedidos_hoy?.total || 0}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon warning">
            <DollarSign size={28} />
          </div>
          <div className="stat-info">
            <h4>Ventas Hoy</h4>
            <p>{formatMoney(stats?.pedidos_hoy?.monto || 0)}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon primary">
            <TrendingUp size={28} />
          </div>
          <div className="stat-info">
            <h4>Ventas del Mes</h4>
            <p>{formatMoney(stats?.pedidos_mes?.monto || 0)}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon danger">
            <AlertTriangle size={28} />
          </div>
          <div className="stat-info">
            <h4>Bajo Stock</h4>
            <p>{stats?.productos_bajo_stock || 0}</p>
          </div>
        </div>
      </div>

      {/* Grid de 2 columnas */}
      <div className="grid-2">
        {/* Ventas Mensuales */}
        <div className="card">
          <div className="card-header">
            <h3>Ventas Mensuales</h3>
          </div>
          <div className="card-body">
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Mes</th>
                    <th>Pedidos</th>
                    <th>Total</th>
                    <th>Promedio</th>
                  </tr>
                </thead>
                <tbody>
                  {ventasMensuales.map((v, idx) => (
                    <tr key={idx}>
                      <td>{v.nombre_mes} {v.anio}</td>
                      <td>{v.cantidad_pedidos}</td>
                      <td>{formatMoney(v.monto_total)}</td>
                      <td>{formatMoney(v.ticket_promedio)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Top Productos */}
        <div className="card">
          <div className="card-header">
            <h3>Top 5 Productos Más Vendidos</h3>
          </div>
          <div className="card-body">
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Categoría</th>
                    <th>Unidades</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {topProductos.map((p, idx) => (
                    <tr key={idx}>
                      <td><strong>{p.nombre}</strong></td>
                      <td>{p.categoria}</td>
                      <td>{p.unidades_vendidas}</td>
                      <td>{formatMoney(p.monto_total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
