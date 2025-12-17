import React, { useState, useEffect } from 'react';
import { Star, Plus, X, ThumbsUp } from 'lucide-react';
import { resenasAPI, productosAPI } from '../services/api';

function Resenas() {
  const [productos, setProductos] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [resenas, setResenas] = useState([]);
  const [estadisticas, setEstadisticas] = useState(null);
  const [mejoresProductos, setMejoresProductos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ productoId: '', calificacion: 5, comentario: '', nombreCliente: '' });
  const [mensaje, setMensaje] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [prodRes, statsRes, mejoresRes] = await Promise.all([
        productosAPI.getAll(),
        resenasAPI.getEstadisticas(),
        resenasAPI.getMejoresProductos(10)
      ]);
      setProductos(prodRes.data);
      setEstadisticas(statsRes.data);
      setMejoresProductos(mejoresRes.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const cargarResenas = async (productoId, nombreProducto) => {
    try {
      const res = await resenasAPI.getByProducto(productoId);
      setResenas(res.data.resenas || []);
      setProductoSeleccionado({ id: productoId, nombre: nombreProducto, promedio: res.data.promedio_calificacion, total: res.data.total_resenas });
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const producto = productos.find(p => p.id === parseInt(formData.productoId));
      await resenasAPI.create({
        ...formData,
        productoId: parseInt(formData.productoId),
        nombreProducto: producto?.nombre || 'Producto',
        calificacion: parseInt(formData.calificacion)
      });
      setMensaje({ tipo: 'success', texto: 'Reseña agregada exitosamente' });
      setShowModal(false);
      setFormData({ productoId: '', calificacion: 5, comentario: '', nombreCliente: '' });
      loadData();
      if (productoSeleccionado) cargarResenas(productoSeleccionado.id, productoSeleccionado.nombre);
    } catch (error) {
      setMensaje({ tipo: 'danger', texto: 'Error al agregar reseña' });
    }
  };

  const renderStars = (rating, size = 16) => {
    return [...Array(5)].map((_, i) => (
      <Star key={i} size={size} fill={i < rating ? '#ffc107' : 'none'} color={i < rating ? '#ffc107' : '#dee2e6'} />
    ));
  };

  if (loading) return <div className="loading">Cargando reseñas...</div>;

  return (
    <div>
      <div className="page-header">
        <h2><Star size={28} /> Reseñas de Productos (MongoDB)</h2>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} /> Nueva Reseña
        </button>
      </div>

      <div className="alert alert-info">
        <strong>📦 NoSQL en Acción:</strong> Las reseñas se almacenan en MongoDB, ideal para datos con estructura flexible y alto volumen de escritura.
      </div>

      {mensaje && (
        <div className={`alert alert-${mensaje.tipo}`}>
          {mensaje.texto}
          <button onClick={() => setMensaje(null)} style={{ float: 'right', background: 'none', border: 'none', cursor: 'pointer' }}>×</button>
        </div>
      )}

      <div className="grid-2">
        {/* Estadísticas */}
        <div className="card">
          <div className="card-header"><h3>📊 Estadísticas Generales</h3></div>
          <div className="card-body">
            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
              <div className="stat-card">
                <div className="stat-info">
                  <h4>Total Reseñas</h4>
                  <p>{estadisticas?.total_resenas || 0}</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-info">
                  <h4>Promedio General</h4>
                  <p>{estadisticas?.promedio_general || 0} ⭐</p>
                </div>
              </div>
            </div>
            <h4 style={{ marginTop: '20px' }}>Distribución de Calificaciones</h4>
            {estadisticas?.distribucion_calificaciones?.map(d => (
              <div key={d._id} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px' }}>
                <span style={{ width: '60px' }}>{renderStars(d._id)}</span>
                <div style={{ flex: 1, background: '#e9ecef', borderRadius: '4px', height: '20px' }}>
                  <div style={{ width: `${(d.total / estadisticas.total_resenas) * 100}%`, background: '#ffc107', borderRadius: '4px', height: '100%' }}></div>
                </div>
                <span>{d.total}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Productos mejor calificados */}
        <div className="card">
          <div className="card-header"><h3>🏆 Productos Mejor Calificados</h3></div>
          <div className="card-body">
            <table>
              <thead><tr><th>Producto</th><th>Promedio</th><th>Reseñas</th><th></th></tr></thead>
              <tbody>
                {mejoresProductos.map((p, idx) => (
                  <tr key={idx}>
                    <td>{p.nombre_producto || `Producto #${p._id}`}</td>
                    <td>{renderStars(Math.round(p.promedio))} {p.promedio?.toFixed(1)}</td>
                    <td>{p.total_resenas}</td>
                    <td><button className="btn btn-sm btn-secondary" onClick={() => cargarResenas(p._id, p.nombre_producto)}>Ver</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Reseñas del producto seleccionado */}
      {productoSeleccionado && (
        <div className="card" style={{ marginTop: '20px' }}>
          <div className="card-header">
            <h3>Reseñas de: {productoSeleccionado.nombre}</h3>
            <div>{renderStars(Math.round(productoSeleccionado.promedio))} ({productoSeleccionado.promedio}) - {productoSeleccionado.total} reseñas</div>
          </div>
          <div className="card-body">
            {resenas.length === 0 ? (
              <p>No hay reseñas para este producto.</p>
            ) : (
              resenas.map((r, idx) => (
                <div key={idx} style={{ borderBottom: '1px solid #e9ecef', paddingBottom: '15px', marginBottom: '15px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div>
                      <strong>{r.nombreCliente}</strong>
                      {r.verificado && <span className="badge badge-success" style={{ marginLeft: '8px' }}>✓ Verificado</span>}
                    </div>
                    <div>{renderStars(r.calificacion)}</div>
                  </div>
                  <p style={{ color: '#666' }}>{r.comentario}</p>
                  <small style={{ color: '#999' }}>
                    {new Date(r.fecha).toLocaleDateString('es-CR')}
                    {r.util && <span style={{ marginLeft: '15px' }}><ThumbsUp size={12} /> {r.util} personas encontraron útil esta reseña</span>}
                  </small>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Modal Nueva Reseña */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Nueva Reseña</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Producto</label>
                  <select className="form-control" value={formData.productoId} onChange={e => setFormData({...formData, productoId: e.target.value})} required>
                    <option value="">Seleccionar producto...</option>
                    {productos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Tu Nombre</label>
                  <input type="text" className="form-control" value={formData.nombreCliente} onChange={e => setFormData({...formData, nombreCliente: e.target.value})} placeholder="Anónimo si se deja vacío" />
                </div>
                <div className="form-group">
                  <label>Calificación</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {[1,2,3,4,5].map(n => (
                      <button key={n} type="button" onClick={() => setFormData({...formData, calificacion: n})} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                        <Star size={32} fill={n <= formData.calificacion ? '#ffc107' : 'none'} color={n <= formData.calificacion ? '#ffc107' : '#dee2e6'} />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <label>Comentario</label>
                  <textarea className="form-control" value={formData.comentario} onChange={e => setFormData({...formData, comentario: e.target.value})} rows="4" placeholder="Comparte tu experiencia con este producto..." />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Publicar Reseña</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Resenas;
