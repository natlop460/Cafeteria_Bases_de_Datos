import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Clock, AlertTriangle } from 'lucide-react';
import { reportesAPI, pedidosAPI, clientesAPI } from '../services/api';

function Reportes() {
  const [activeTab, setActiveTab] = useState('ventas');
  const [ventasMensuales, setVentasMensuales] = useState([]);
  const [topProductos, setTopProductos] = useState([]);
  const [promedioMes, setPromedioMes] = useState([]);
  const [distribucion, setDistribucion] = useState([]);
  const [fueraTiempo, setFueraTiempo] = useState([]);
  const [mejoresClientes, setMejoresClientes] = useState([]);
  const [auditoria, setAuditoria] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [ventasRes, topRes, promedioRes, distRes, fueraRes, auditRes] = await Promise.all([
        reportesAPI.getVentasMensuales(),
        reportesAPI.getTopProductos('unidades'),
        reportesAPI.getPromedioPedidoMes(),
        pedidosAPI.getDistribucion(),
        pedidosAPI.getFueraDeTiempo(),
        reportesAPI.getAuditoria(20)
      ]);
      setVentasMensuales(ventasRes.data || []);
      setTopProductos(topRes.data || []);
      setPromedioMes(promedioRes.data || []);
      setDistribucion(distRes.data || []);
      setFueraTiempo(fueraRes.data || []);
      setAuditoria(auditRes.data || []);

      // Mejores clientes del mes actual
      const mesActual = new Date().getMonth() + 1;
      const anioActual = new Date().getFullYear();
      const mejoresRes = await clientesAPI.getMejoresPorMes(mesActual, anioActual);
      setMejoresClientes(mejoresRes.data || []);

      console.log('✅ Datos cargados:', {
        ventas: ventasRes.data?.length || 0,
        productos: topRes.data?.length || 0,
        promedios: promedioRes.data?.length || 0,
        distribucion: distRes.data?.length || 0,
        clientes: mejoresRes.data?.length || 0
      });
    } catch (error) {
      console.error('❌ Error cargando reportes:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatMoney = (amount) => new Intl.NumberFormat('es-CR', { style: 'currency', currency: 'CRC', minimumFractionDigits: 0 }).format(amount || 0);
  const formatDate = (date) => new Date(date).toLocaleString('es-CR');

  if (loading) return <div className="loading">Cargando reportes...</div>;

  return (
    <div>
      <div className="page-header">
        <h2><BarChart3 size={28} /> Reportes y Análisis</h2>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        {['ventas', 'productos', 'clientes', 'operaciones', 'auditoria'].map(tab => (
          <button key={tab} className={`btn ${activeTab === tab ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab(tab)}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Ventas */}
      {activeTab === 'ventas' && (
        <div className="grid-2">
          <div className="card">
            <div className="card-header"><h3><TrendingUp size={18} /> Ventas Mensuales</h3></div>
            <div className="card-body">
              {ventasMensuales.length === 0 ? (
                <p className="alert alert-info">No hay datos de ventas mensuales</p>
              ) : (
                <table>
                  <thead><tr><th>Mes</th><th>Pedidos</th><th>Total</th><th>Promedio</th></tr></thead>
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
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-header"><h3>Promedio por Pedido (Mensual)</h3></div>
            <div className="card-body">
              {promedioMes.length === 0 ? (
                <p className="alert alert-info">No hay datos de promedios</p>
              ) : (
                <table>
                  <thead><tr><th>Período</th><th>Pedidos</th><th>Promedio</th><th>Total</th></tr></thead>
                  <tbody>
                    {promedioMes.slice(0, 6).map((p, idx) => (
                      <tr key={idx}>
                        <td>{p.mes}/{p.anio}</td>
                        <td>{p.cantidad_pedidos}</td>
                        <td>{formatMoney(p.promedio_pedido)}</td>
                        <td>{formatMoney(p.total_mes)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Productos */}
      {activeTab === 'productos' && (
        <div className="card">
          <div className="card-header"><h3>Top 10 Productos Más Vendidos</h3></div>
          <div className="card-body">
            {topProductos.length === 0 ? (
              <p className="alert alert-info">No hay datos de productos vendidos</p>
            ) : (
              <table>
                <thead><tr><th>#</th><th>SKU</th><th>Producto</th><th>Categoría</th><th>Unidades</th><th>Monto Total</th></tr></thead>
                <tbody>
                  {topProductos.map((p, idx) => (
                    <tr key={idx}>
                      <td><strong>#{idx + 1}</strong></td>
                      <td><code>{p.sku}</code></td>
                      <td>{p.nombre}</td>
                      <td>{p.categoria}</td>
                      <td><span className="badge badge-primary">{p.unidades_vendidas}</span></td>
                      <td>{formatMoney(p.monto_total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Clientes */}
      {activeTab === 'clientes' && (
        <div className="card">
          <div className="card-header"><h3>🏆 Mejores Clientes del Mes</h3></div>
          <div className="card-body">
            {mejoresClientes.length === 0 ? (
              <p className="alert alert-info">No hay datos de clientes este mes</p>
            ) : (
              <table>
                <thead><tr><th>Posición</th><th>Cliente</th><th>Email</th><th>Pedidos</th><th>Total Compras</th></tr></thead>
                <tbody>
                  {mejoresClientes.map((c, idx) => (
                    <tr key={idx}>
                      <td>{idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}</td>
                      <td><strong>{c.nombre}</strong></td>
                      <td>{c.email}</td>
                      <td>{c.cantidad_pedidos}</td>
                      <td>{formatMoney(c.total_compras)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Operaciones */}
      {activeTab === 'operaciones' && (
        <div className="grid-2">
          <div className="card">
            <div className="card-header"><h3>Distribución por Canal y Sucursal</h3></div>
            <div className="card-body">
              {distribucion.length === 0 ? (
                <p className="alert alert-info">No hay datos de distribución</p>
              ) : (
                <table>
                  <thead><tr><th>Sucursal</th><th>Canal</th><th>Pedidos</th><th>Ventas</th></tr></thead>
                  <tbody>
                    {distribucion.map((d, idx) => (
                      <tr key={idx}>
                        <td>{d.sucursal}</td>
                        <td><span className="badge badge-info">{d.canal_venta}</span></td>
                        <td>{d.cantidad_pedidos}</td>
                        <td>{formatMoney(d.total_ventas)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-header"><h3><AlertTriangle size={18} /> Delivery Fuera de Tiempo</h3></div>
            <div className="card-body">
              {fueraTiempo.length === 0 ? (
                <p className="alert alert-success">✅ No hay pedidos fuera de tiempo</p>
              ) : (
                <table>
                  <thead><tr><th>Pedido</th><th>Cliente</th><th>Estimado</th><th>Real</th></tr></thead>
                  <tbody>
                    {fueraTiempo.slice(0, 10).map((p, idx) => (
                      <tr key={idx}>
                        <td>#{p.id}</td>
                        <td>{p.cliente_nombre}</td>
                        <td>{p.tiempo_estimado_minutos} min</td>
                        <td><span className="badge badge-danger">{p.minutos_entrega} min</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Auditoría */}
      {activeTab === 'auditoria' && (
        <div className="card">
          <div className="card-header"><h3><Clock size={18} /> Auditoría de Pedidos</h3></div>
          <div className="card-body">
            {auditoria.length === 0 ? (
              <p className="alert alert-info">No hay registros de auditoría disponibles</p>
            ) : (
              <table>
                <thead><tr><th>Fecha</th><th>Pedido</th><th>Acción</th><th>Usuario</th><th>Detalles</th></tr></thead>
                <tbody>
                  {auditoria.map((a, idx) => (
                    <tr key={idx}>
                      <td>{formatDate(a.fecha_accion)}</td>
                      <td>#{a.pedido_id}</td>
                      <td><span className={`badge badge-${a.accion === 'INSERT' ? 'success' : a.accion === 'UPDATE' ? 'info' : 'danger'}`}>{a.accion}</span></td>
                      <td>{a.usuario}</td>
                      <td><code style={{ fontSize: '10px' }}>{JSON.stringify(a.datos_nuevos || a.datos_anteriores)?.substring(0, 50)}...</code></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Reportes;
