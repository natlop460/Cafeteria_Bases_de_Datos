import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Package, X } from 'lucide-react';
import { productosAPI } from '../services/api';

function Productos() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '', descripcion: '', precio: '', stock: '', stock_minimo: '10', categoria_id: '', sku: ''
  });
  const [mensaje, setMensaje] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        productosAPI.getAll(),
        productosAPI.getCategorias()
      ]);
      setProductos(prodRes.data);
      setCategorias(catRes.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editando) {
        await productosAPI.update(editando, formData);
        setMensaje({ tipo: 'success', texto: 'Producto actualizado exitosamente' });
      } else {
        await productosAPI.create(formData);
        setMensaje({ tipo: 'success', texto: 'Producto creado exitosamente' });
      }
      setShowModal(false);
      setEditando(null);
      setFormData({ nombre: '', descripcion: '', precio: '', stock: '', stock_minimo: '10', categoria_id: '', sku: '' });
      loadData();
    } catch (error) {
      setMensaje({ tipo: 'danger', texto: error.response?.data?.error || 'Error al guardar' });
    }
  };

  const handleEdit = (producto) => {
    setEditando(producto.id);
    setFormData({
      nombre: producto.nombre,
      descripcion: producto.descripcion || '',
      precio: producto.precio,
      stock: producto.stock,
      stock_minimo: producto.stock_minimo,
      categoria_id: producto.categoria_id || '',
      sku: producto.sku || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de desactivar este producto?')) {
      try {
        await productosAPI.delete(id);
        setMensaje({ tipo: 'success', texto: 'Producto desactivado' });
        loadData();
      } catch (error) {
        setMensaje({ tipo: 'danger', texto: 'Error al desactivar' });
      }
    }
  };

  const formatMoney = (amount) => {
    return new Intl.NumberFormat('es-CR', { style: 'currency', currency: 'CRC', minimumFractionDigits: 0 }).format(amount);
  };

  if (loading) return <div className="loading">Cargando productos...</div>;

  return (
    <div>
      <div className="page-header">
        <h2><Package size={28} /> Productos</h2>
        <button className="btn btn-primary" onClick={() => { setShowModal(true); setEditando(null); setFormData({ nombre: '', descripcion: '', precio: '', stock: '', stock_minimo: '10', categoria_id: '', sku: '' }); }}>
          <Plus size={18} /> Nuevo Producto
        </button>
      </div>

      {mensaje && (
        <div className={`alert alert-${mensaje.tipo}`}>
          {mensaje.texto}
          <button onClick={() => setMensaje(null)} style={{ float: 'right', background: 'none', border: 'none', cursor: 'pointer' }}>×</button>
        </div>
      )}

      <div className="card">
        <div className="card-body">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Nombre</th>
                  <th>Categoría</th>
                  <th>Precio</th>
                  <th>Stock</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {productos.map(p => (
                  <tr key={p.id}>
                    <td><code>{p.sku}</code></td>
                    <td><strong>{p.nombre}</strong></td>
                    <td>{p.categoria_nombre}</td>
                    <td>{formatMoney(p.precio)}</td>
                    <td>
                      {p.stock <= p.stock_minimo ? (
                        <span className="badge badge-danger">{p.stock}</span>
                      ) : (
                        <span className="badge badge-success">{p.stock}</span>
                      )}
                    </td>
                    <td>
                      <span className={`badge badge-${p.activo ? 'success' : 'danger'}`}>
                        {p.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-sm btn-secondary" onClick={() => handleEdit(p)}><Edit size={14} /></button>{' '}
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(p.id)}><Trash2 size={14} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editando ? 'Editar Producto' : 'Nuevo Producto'}</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>SKU</label>
                  <input type="text" className="form-control" value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Nombre</label>
                  <input type="text" className="form-control" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Descripción</label>
                  <textarea className="form-control" value={formData.descripcion} onChange={e => setFormData({...formData, descripcion: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Categoría</label>
                  <select className="form-control" value={formData.categoria_id} onChange={e => setFormData({...formData, categoria_id: e.target.value})} required>
                    <option value="">Seleccionar...</option>
                    {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                  </select>
                </div>
                <div className="grid-2">
                  <div className="form-group">
                    <label>Precio (₡)</label>
                    <input type="number" step="0.01" className="form-control" value={formData.precio} onChange={e => setFormData({...formData, precio: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label>Stock</label>
                    <input type="number" className="form-control" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} required />
                  </div>
                </div>
                <div className="form-group">
                  <label>Stock Mínimo</label>
                  <input type="number" className="form-control" value={formData.stock_minimo} onChange={e => setFormData({...formData, stock_minimo: e.target.value})} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Productos;
