import React, { useState, useEffect } from 'react';
import { Activity, Filter, Eye, TrendingUp, Clock } from 'lucide-react';
import { logsAPI } from '../services/api';

function Logs() {
  const [logs, setLogs] = useState([]);
  const [estadisticas, setEstadisticas] = useState(null);
  const [productosPopulares, setProductosPopulares] = useState([]);
  const [filtros, setFiltros] = useState({ accion: '', usuario: '', limite: '50' });
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [logsRes, statsRes, popularesRes] = await Promise.all([
        logsAPI.getAll(filtros),
        logsAPI.getEstadisticas(),
        logsAPI.getProductosPopulares(10)
      ]);
      setLogs(logsRes.data);
      setEstadisticas(statsRes.data);
      setProductosPopulares(popularesRes.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const aplicarFiltros = async () => {
    setLoading(true);
    try {
      const res = await logsAPI.getAll(filtros);
      setLogs(res.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAccionBadge = (accion) => {
    const colores = {
      'login': 'success',
      'login_fallido': 'danger',
      'logout': 'info',
      'ver_producto': 'primary',
      'agregar_carrito': 'warning',
      'crear_pedido': 'success',
      'procesar_pago': 'success',
      'cancelar_pedido': 'danger'
    };
    return <span className={`badge badge-${colores[accion] || 'secondary'}`}>{accion}</span>;
  };

  const formatDate = (date) => new Date(date).toLocaleString('es-CR');

  if (loading) return <div className="loading">Cargando logs...</div>;

  return (
    <div>
      <div className="page-header">
        <h2><Activity size={28} /> Logs de Actividad (MongoDB)</h2>
      </div>

      <div className="alert alert-info">
        <strong>📦 NoSQL en Acción:</strong> Los logs se almacenan en MongoDB porque tienen estructura variable (cada tipo de acción tiene diferentes campos) y alto volumen de escritura.
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon primary"><Activity size={28} /></div>
          <div className="stat-info">
            <h4>Total de Logs</h4>
            <p>{logs.length}+</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon success"><Eye size={28} /></div>
          <div className="stat-info">
            <h4>Tipos de Acciones</h4>
            <p>{estadisticas?.acciones_por_tipo?.length || 0}</p>
          </div>
        </div>
      </div>

      <div className="grid-2">
        {/* Acciones por tipo */}
        <div className="card">
          <div className="card-header"><h3>📊 Acciones por Tipo</h3></div>
          <div className="card-body">
            <table>
              <thead><tr><th>Acción</th><th>Cantidad</th></tr></thead>
              <tbody>
                {estadisticas?.acciones_por_tipo?.map((a, idx) => (
                  <tr key={idx}>
                    <td>{getAccionBadge(a._id)}</td>
                    <td><strong>{a.total}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Productos más visitados */}
        <div className="card">
          <div className="card-header"><h3><TrendingUp size={18} /> Productos Más Visitados</h3></div>
          <div className="card-body">
            <table>
              <thead><tr><th>Producto</th><th>Visitas</th><th>Usuarios</th></tr></thead>
              <tbody>
                {productosPopulares.map((p, idx) => (
                  <tr key={idx}>
                    <td>{p.nombreProducto || `Producto #${p._id}`}</td>
                    <td><span className="badge badge-primary">{p.visitas}</span></td>
                    <td>{p.usuarios_unicos}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Filtros y lista de logs */}
      <div className="card" style={{ marginTop: '20px' }}>
        <div className="card-header">
          <h3><Clock size={18} /> Logs Recientes</h3>
          <div className="filters" style={{ display: 'flex', gap: '10px' }}>
            <select className="form-control" value={filtros.accion} onChange={e => setFiltros({...filtros, accion: e.target.value})} style={{ width: '150px' }}>
              <option value="">Todas las acciones</option>
              <option value="login">Login</option>
              <option value="logout">Logout</option>
              <option value="ver_producto">Ver producto</option>
              <option value="agregar_carrito">Agregar carrito</option>
              <option value="crear_pedido">Crear pedido</option>
            </select>
            <input type="text" className="form-control" placeholder="Usuario..." value={filtros.usuario} onChange={e => setFiltros({...filtros, usuario: e.target.value})} style={{ width: '150px' }} />
            <button className="btn btn-primary btn-sm" onClick={aplicarFiltros}><Filter size={14} /> Filtrar</button>
          </div>
        </div>
        <div className="card-body">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Fecha/Hora</th>
                  <th>Acción</th>
                  <th>Usuario</th>
                  <th>Detalles</th>
                </tr>
              </thead>
              <tbody>
                {logs.slice(0, 50).map((log, idx) => (
                  <tr key={idx}>
                    <td>{formatDate(log.timestamp)}</td>
                    <td>{getAccionBadge(log.accion)}</td>
                    <td>{log.usuario || 'Sistema'}</td>
                    <td>
                      {log.productoId && <span>Producto #{log.productoId} </span>}
                      {log.nombreProducto && <span>({log.nombreProducto}) </span>}
                      {log.detalles && (
                        <code style={{ fontSize: '11px', background: '#f5f5f5', padding: '2px 6px', borderRadius: '3px' }}>
                          {JSON.stringify(log.detalles).substring(0, 60)}...
                        </code>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Comparativa SQL vs NoSQL */}
      <div className="card" style={{ marginTop: '20px' }}>
        <div className="card-header"><h3>🔍 ¿Por qué MongoDB para Logs?</h3></div>
        <div className="card-body">
          <div className="grid-2">
            <div>
              <h4>❌ Problema con SQL:</h4>
              <ul style={{ paddingLeft: '20px', lineHeight: '1.8' }}>
                <li>Cada tipo de log tiene diferentes campos</li>
                <li>Necesitaríamos muchas columnas NULL</li>
                <li>O múltiples tablas con JOINs costosos</li>
                <li>ALTER TABLE cada vez que agregamos nuevo tipo de log</li>
                <li>Alto volumen de escritura puede ser lento</li>
              </ul>
            </div>
            <div>
              <h4>✅ Ventajas de MongoDB:</h4>
              <ul style={{ paddingLeft: '20px', lineHeight: '1.8' }}>
                <li>Documentos con estructura flexible</li>
                <li>Cada log solo tiene los campos que necesita</li>
                <li>No hay esquema rígido</li>
                <li>Agregar nuevos tipos es instantáneo</li>
                <li>Optimizado para alto volumen de escritura</li>
                <li>Agregaciones naturales para analytics</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Logs;
