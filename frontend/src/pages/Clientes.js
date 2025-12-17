import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Users, X, Award } from 'lucide-react';
import { clientesAPI } from '../services/api';

function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [formData, setFormData] = useState({ nombre: '', email: '', telefono: '', direccion: '' });
  const [mensaje, setMensaje] = useState(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const res = await clientesAPI.getAll();
      setClientes(res.data);
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
        await clientesAPI.update(editando, formData);
        setMensaje({ tipo: 'success', texto: 'Cliente actualizado exitosamente' });
      } else {
        await clientesAPI.create(formData);
        setMensaje({ tipo: 'success', texto: 'Cliente creado exitosamente' });
      }
      setShowModal(false);
      setEditando(null);
      setFormData({ nombre: '', email: '', telefono: '', direccion: '' });
      loadData();
    } catch (error) {
      setMensaje({ tipo: 'danger', texto: error.response?.data?.error || 'Error al guardar' });
    }
  };

  const handleEdit = (cliente) => {
    setEditando(cliente.id);
    setFormData({ nombre: cliente.nombre, email: cliente.email || '', telefono: cliente.telefono || '', direccion: cliente.direccion || '' });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de desactivar este cliente?')) {
      try {
        await clientesAPI.delete(id);
        setMensaje({ tipo: 'success', texto: 'Cliente desactivado' });
        loadData();
      } catch (error) {
        setMensaje({ tipo: 'danger', texto: 'Error al desactivar' });
      }
    }
  };

  const getCategoriaBadge = (puntos) => {
    if (puntos >= 500) return <span className="badge badge-warning">🏆 Platino</span>;
    if (puntos >= 300) return <span className="badge badge-warning">🥇 Oro</span>;
    if (puntos >= 100) return <span className="badge badge-info">🥈 Plata</span>;
    return <span className="badge badge-secondary">🥉 Bronce</span>;
  };

  if (loading) return <div className="loading">Cargando clientes...</div>;

  return (
    <div>
      <div className="page-header">
        <h2><Users size={28} /> Clientes</h2>
        <button className="btn btn-primary" onClick={() => { setShowModal(true); setEditando(null); setFormData({ nombre: '', email: '', telefono: '', direccion: '' }); }}>
          <Plus size={18} /> Nuevo Cliente
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
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Teléfono</th>
                  <th>Puntos</th>
                  <th>Categoría</th>
                  <th>Pedidos</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {clientes.map(c => (
                  <tr key={c.id}>
                    <td>{c.id}</td>
                    <td><strong>{c.nombre}</strong></td>
                    <td>{c.email}</td>
                    <td>{c.telefono}</td>
                    <td><Award size={14} /> {c.puntos_fidelidad || 0}</td>
                    <td>{getCategoriaBadge(c.puntos_fidelidad || 0)}</td>
                    <td>{c.total_pedidos || 0}</td>
                    <td>
                      <button className="btn btn-sm btn-secondary" onClick={() => handleEdit(c)}><Edit size={14} /></button>{' '}
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(c.id)}><Trash2 size={14} /></button>
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
              <h3>{editando ? 'Editar Cliente' : 'Nuevo Cliente'}</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Nombre Completo</label>
                  <input type="text" className="form-control" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" className="form-control" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Teléfono</label>
                  <input type="text" className="form-control" value={formData.telefono} onChange={e => setFormData({...formData, telefono: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Dirección</label>
                  <textarea className="form-control" value={formData.direccion} onChange={e => setFormData({...formData, direccion: e.target.value})} />
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

export default Clientes;
