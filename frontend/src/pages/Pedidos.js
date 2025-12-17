import React, { useState, useEffect } from 'react';
import { ShoppingCart, Eye, X, CreditCard, XCircle, CheckCircle, Plus, Trash2, PlusCircle, Filter } from 'lucide-react';
import { pedidosAPI, productosAPI, clientesAPI, sucursalesAPI } from '../services/api';

function Pedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [pedidosFiltrados, setPedidosFiltrados] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDetalle, setShowDetalle] = useState(null);
  const [showPago, setShowPago] = useState(null);
  const [showNuevo, setShowNuevo] = useState(false);
  const [pagoData, setPagoData] = useState({ monto: '', metodo_pago: 'EFECTIVO', referencia: '' });
  const [mensaje, setMensaje] = useState(null);

  // Filtros
  const [filtros, setFiltros] = useState({
    sucursal_id: '',
    estado: '',
    canal_venta: ''
  });

  // Estado del formulario de nuevo pedido
  const [nuevoPedido, setNuevoPedido] = useState({
    cliente_id: '',
    sucursal_id: '1',
    canal_venta: 'MOSTRADOR',
    direccion_entrega: '',
    items: []
  });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [pedidosRes, clientesRes, productosRes, sucursalesRes] = await Promise.all([
        pedidosAPI.getAll(),
        clientesAPI.getActivos(),
        productosAPI.getAll(),
        sucursalesAPI.getAll()
      ]);
      setPedidos(pedidosRes.data);
      setPedidosFiltrados(pedidosRes.data);
      setClientes(clientesRes.data);
      setProductos(productosRes.data);
      setSucursales(sucursalesRes.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Aplicar filtros
  useEffect(() => {
    let resultado = [...pedidos];

    if (filtros.sucursal_id) {
      resultado = resultado.filter(p => p.sucursal_id === parseInt(filtros.sucursal_id));
    }

    if (filtros.estado) {
      resultado = resultado.filter(p => p.estado === filtros.estado);
    }

    if (filtros.canal_venta) {
      resultado = resultado.filter(p => p.canal_venta === filtros.canal_venta);
    }

    setPedidosFiltrados(resultado);
  }, [filtros, pedidos]);

  const limpiarFiltros = () => {
    setFiltros({ sucursal_id: '', estado: '', canal_venta: '' });
  };

  const abrirNuevoPedido = () => {
    setNuevoPedido({
      cliente_id: '',
      sucursal_id: '1',
      canal_venta: 'MOSTRADOR',
      direccion_entrega: '',
      items: []
    });
    setShowNuevo(true);
  };

  const agregarItem = () => {
    setNuevoPedido({
      ...nuevoPedido,
      items: [...nuevoPedido.items, { producto_id: '', cantidad: 1 }]
    });
  };

  const actualizarItem = (index, campo, valor) => {
    const itemsActualizados = [...nuevoPedido.items];
    itemsActualizados[index][campo] = valor;
    setNuevoPedido({ ...nuevoPedido, items: itemsActualizados });
  };

  const eliminarItem = (index) => {
    const itemsActualizados = nuevoPedido.items.filter((_, i) => i !== index);
    setNuevoPedido({ ...nuevoPedido, items: itemsActualizados });
  };

  const calcularTotales = () => {
    let subtotal = 0;
    nuevoPedido.items.forEach(item => {
      const producto = productos.find(p => p.id === parseInt(item.producto_id));
      if (producto) {
        subtotal += producto.precio * item.cantidad;
      }
    });
    const impuesto = subtotal * 0.13;
    const total = subtotal + impuesto;
    return { subtotal, impuesto, total };
  };

  const crearPedido = async (e) => {
    e.preventDefault();

    if (nuevoPedido.items.length === 0) {
      setMensaje({ tipo: 'danger', texto: 'Debe agregar al menos un producto' });
      return;
    }

    try {
      await pedidosAPI.create(nuevoPedido);
      setMensaje({ tipo: 'success', texto: 'Pedido creado exitosamente' });
      setShowNuevo(false);
      loadData();
    } catch (error) {
      setMensaje({ tipo: 'danger', texto: error.response?.data?.error || 'Error al crear pedido' });
    }
  };

  const verDetalle = async (id) => {
    try {
      const res = await pedidosAPI.getById(id);
      setShowDetalle(res.data);
    } catch (error) {
      setMensaje({ tipo: 'danger', texto: 'Error al cargar detalle' });
    }
  };

  const procesarPago = async (e) => {
    e.preventDefault();
    try {
      await pedidosAPI.procesarPago(showPago, pagoData);
      setMensaje({ tipo: 'success', texto: 'Pago procesado exitosamente' });
      setShowPago(null);
      setPagoData({ monto: '', metodo_pago: 'EFECTIVO', referencia: '' });
      loadData();
    } catch (error) {
      setMensaje({ tipo: 'danger', texto: error.response?.data?.error || 'Error al procesar pago' });
    }
  };

  const cancelarPedido = async (id) => {
    const motivo = window.prompt('Ingrese el motivo de cancelación:');
    if (motivo) {
      try {
        await pedidosAPI.cancelar(id, motivo);
        setMensaje({ tipo: 'success', texto: 'Pedido cancelado' });
        loadData();
      } catch (error) {
        setMensaje({ tipo: 'danger', texto: error.response?.data?.error || 'Error al cancelar' });
      }
    }
  };

  const cambiarEstado = async (id, nuevoEstado) => {
    try {
      await pedidosAPI.updateEstado(id, nuevoEstado);
      setMensaje({ tipo: 'success', texto: 'Estado actualizado' });
      loadData();
    } catch (error) {
      setMensaje({ tipo: 'danger', texto: 'Error al actualizar estado' });
    }
  };

  // Determinar siguiente estado válido basado en estado actual y canal
  const getSiguienteEstado = (pedido) => {
    const { estado, canal_venta } = pedido;

    // Estados terminales
    if (estado === 'ENTREGADO' || estado === 'CANCELADO') {
      return null;
    }

    // PENDIENTE solo avanza si ya fue pagado (asumimos que PREPARANDO significa pagado)
    // En el flujo actual, PENDIENTE → se paga → PREPARANDO

    // Flujos según canal
    switch (estado) {
      case 'PREPARANDO':
        return { estado: 'LISTO', label: 'Marcar Listo', icon: CheckCircle, color: 'primary' };

      case 'LISTO':
        if (canal_venta === 'DELIVERY') {
          return { estado: 'EN_CAMINO', label: 'En Camino', icon: CheckCircle, color: 'info' };
        } else {
          // MOSTRADOR o PICKUP van directo a ENTREGADO
          return { estado: 'ENTREGADO', label: 'Entregar', icon: CheckCircle, color: 'success' };
        }

      case 'EN_CAMINO':
        // Solo DELIVERY llega a EN_CAMINO
        return { estado: 'ENTREGADO', label: 'Entregado', icon: CheckCircle, color: 'success' };

      default:
        return null;
    }
  };

  const getEstadoBadge = (estado) => {
    const badges = {
      'PENDIENTE': 'badge-warning',
      'PREPARANDO': 'badge-info',
      'LISTO': 'badge-primary',
      'EN_CAMINO': 'badge-info',
      'ENTREGADO': 'badge-success',
      'CANCELADO': 'badge-danger'
    };
    return <span className={`badge ${badges[estado] || 'badge-secondary'}`}>{estado}</span>;
  };

  const formatMoney = (amount) => new Intl.NumberFormat('es-CR', { style: 'currency', currency: 'CRC', minimumFractionDigits: 0 }).format(amount);
  const formatDate = (date) => new Date(date).toLocaleString('es-CR');

  if (loading) return <div className="loading">Cargando pedidos...</div>;

  return (
    <div>
      <div className="page-header">
        <h2><ShoppingCart size={28} /> Pedidos</h2>
        <button className="btn btn-primary" onClick={abrirNuevoPedido}>
          <Plus size={18} /> Nuevo Pedido
        </button>
      </div>

      {mensaje && (
        <div className={`alert alert-${mensaje.tipo}`}>
          {mensaje.texto}
          <button onClick={() => setMensaje(null)} style={{ float: 'right', background: 'none', border: 'none', cursor: 'pointer' }}>×</button>
        </div>
      )}

      {/* Filtros */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="card-header">
          <h3><Filter size={18} /> Filtros</h3>
        </div>
        <div className="card-body">
          <div className="filters">
            <select
              className="form-control"
              value={filtros.sucursal_id}
              onChange={e => setFiltros({...filtros, sucursal_id: e.target.value})}
            >
              <option value="">Todas las sucursales</option>
              {sucursales.map(s => (
                <option key={s.id} value={s.id}>{s.nombre}</option>
              ))}
            </select>

            <select
              className="form-control"
              value={filtros.estado}
              onChange={e => setFiltros({...filtros, estado: e.target.value})}
            >
              <option value="">Todos los estados</option>
              <option value="PENDIENTE">Pendiente</option>
              <option value="PREPARANDO">Preparando</option>
              <option value="LISTO">Listo</option>
              <option value="EN_CAMINO">En Camino</option>
              <option value="ENTREGADO">Entregado</option>
              <option value="CANCELADO">Cancelado</option>
            </select>

            <select
              className="form-control"
              value={filtros.canal_venta}
              onChange={e => setFiltros({...filtros, canal_venta: e.target.value})}
            >
              <option value="">Todos los canales</option>
              <option value="MOSTRADOR">Mostrador</option>
              <option value="PICKUP">Pickup</option>
              <option value="DELIVERY">Delivery</option>
            </select>

            <button className="btn btn-secondary" onClick={limpiarFiltros}>
              Limpiar Filtros
            </button>
          </div>
          <div style={{ marginTop: '10px', fontSize: '0.875rem', color: '#6c757d' }}>
            Mostrando {pedidosFiltrados.length} de {pedidos.length} pedidos
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Cliente</th>
                  <th>Sucursal</th>
                  <th>Canal</th>
                  <th>Estado</th>
                  <th>Total</th>
                  <th>Fecha</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {pedidosFiltrados.map(p => (
                  <tr key={p.id}>
                    <td>#{p.id}</td>
                    <td><strong>{p.cliente_nombre}</strong></td>
                    <td>{p.sucursal_nombre}</td>
                    <td><span className="badge badge-info">{p.canal_venta}</span></td>
                    <td>{getEstadoBadge(p.estado)}</td>
                    <td>{formatMoney(p.total)}</td>
                    <td>{formatDate(p.fecha_pedido)}</td>
                    <td>
                      <button className="btn btn-sm btn-secondary" onClick={() => verDetalle(p.id)} title="Ver detalle"><Eye size={14} /></button>{' '}

                      {/* Botón de pago solo para pedidos PENDIENTE */}
                      {p.estado === 'PENDIENTE' && (
                        <>
                          <button className="btn btn-sm btn-success" onClick={() => setShowPago(p.id)} title="Procesar pago"><CreditCard size={14} /></button>{' '}
                          <button className="btn btn-sm btn-danger" onClick={() => cancelarPedido(p.id)} title="Cancelar"><XCircle size={14} /></button>
                        </>
                      )}

                      {/* Botón para avanzar estado según flujo del canal */}
                      {(() => {
                        const siguienteEstado = getSiguienteEstado(p);
                        if (siguienteEstado) {
                          const IconComponent = siguienteEstado.icon;
                          return (
                            <button
                              className={`btn btn-sm btn-${siguienteEstado.color}`}
                              onClick={() => cambiarEstado(p.id, siguienteEstado.estado)}
                              title={siguienteEstado.label}
                            >
                              <IconComponent size={14} />
                            </button>
                          );
                        }
                        return null;
                      })()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Detalle */}
      {showDetalle && (
        <div className="modal-overlay" onClick={() => setShowDetalle(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3>Pedido #{showDetalle.id}</h3>
              <button onClick={() => setShowDetalle(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <p><strong>Cliente:</strong> {showDetalle.cliente_nombre}</p>
              <p><strong>Sucursal:</strong> {showDetalle.sucursal_nombre}</p>
              <p><strong>Canal:</strong> {showDetalle.canal_venta}</p>
              <p><strong>Estado:</strong> {getEstadoBadge(showDetalle.estado)}</p>
              <p><strong>Fecha:</strong> {formatDate(showDetalle.fecha_pedido)}</p>
              
              <h4 style={{ marginTop: '20px', marginBottom: '10px' }}>Items</h4>
              <table>
                <thead>
                  <tr><th>Producto</th><th>Cant.</th><th>Precio</th><th>Subtotal</th></tr>
                </thead>
                <tbody>
                  {showDetalle.items?.map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.producto_nombre}</td>
                      <td>{item.cantidad}</td>
                      <td>{formatMoney(item.precio_unitario)}</td>
                      <td>{formatMoney(item.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ marginTop: '20px', textAlign: 'right' }}>
                <p>Subtotal: {formatMoney(showDetalle.subtotal)}</p>
                <p>Impuesto (13%): {formatMoney(showDetalle.impuesto)}</p>
                <p><strong>Total: {formatMoney(showDetalle.total)}</strong></p>
              </div>

              {showDetalle.pagos?.length > 0 && (
                <>
                  <h4 style={{ marginTop: '20px', marginBottom: '10px' }}>Pagos</h4>
                  {showDetalle.pagos.map((pago, idx) => (
                    <p key={idx}>{pago.metodo_pago}: {formatMoney(pago.monto)} - {pago.estado}</p>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Pago */}
      {showPago && (
        <div className="modal-overlay" onClick={() => setShowPago(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Procesar Pago - Pedido #{showPago}</h3>
              <button onClick={() => setShowPago(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <form onSubmit={procesarPago}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Monto (₡)</label>
                  <input type="number" step="0.01" className="form-control" value={pagoData.monto} onChange={e => setPagoData({...pagoData, monto: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Método de Pago</label>
                  <select className="form-control" value={pagoData.metodo_pago} onChange={e => setPagoData({...pagoData, metodo_pago: e.target.value})}>
                    <option value="EFECTIVO">Efectivo</option>
                    <option value="TARJETA">Tarjeta</option>
                    <option value="SINPE">SINPE Móvil</option>
                    <option value="TRANSFERENCIA">Transferencia</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Referencia (opcional)</label>
                  <input type="text" className="form-control" value={pagoData.referencia} onChange={e => setPagoData({...pagoData, referencia: e.target.value})} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowPago(null)}>Cancelar</button>
                <button type="submit" className="btn btn-success">Procesar Pago</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Nuevo Pedido */}
      {showNuevo && (
        <div className="modal-overlay" onClick={() => setShowNuevo(false)}>
          <div className="modal modal-large" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Nuevo Pedido</h3>
              <button onClick={() => setShowNuevo(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            <form onSubmit={crearPedido}>
              <div className="modal-body">
                <div className="grid-2">
                  <div className="form-group">
                    <label>Cliente *</label>
                    <select
                      className="form-control"
                      value={nuevoPedido.cliente_id}
                      onChange={e => setNuevoPedido({...nuevoPedido, cliente_id: e.target.value})}
                      required
                    >
                      <option value="">Seleccionar cliente...</option>
                      {clientes.map(c => (
                        <option key={c.id} value={c.id}>{c.nombre} - {c.email}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Sucursal *</label>
                    <select
                      className="form-control"
                      value={nuevoPedido.sucursal_id}
                      onChange={e => setNuevoPedido({...nuevoPedido, sucursal_id: e.target.value})}
                      required
                    >
                      {sucursales.map(s => (
                        <option key={s.id} value={s.id}>{s.nombre}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Canal de Venta *</label>
                  <select
                    className="form-control"
                    value={nuevoPedido.canal_venta}
                    onChange={e => setNuevoPedido({...nuevoPedido, canal_venta: e.target.value})}
                    required
                  >
                    <option value="MOSTRADOR">Mostrador</option>
                    <option value="PICKUP">Pickup (Recoger)</option>
                    <option value="DELIVERY">Delivery</option>
                  </select>
                </div>

                {nuevoPedido.canal_venta === 'DELIVERY' && (
                  <div className="form-group">
                    <label>Dirección de Entrega *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={nuevoPedido.direccion_entrega}
                      onChange={e => setNuevoPedido({...nuevoPedido, direccion_entrega: e.target.value})}
                      placeholder="Ingrese la dirección completa"
                      required={nuevoPedido.canal_venta === 'DELIVERY'}
                    />
                  </div>
                )}

                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <label style={{ margin: 0 }}>Productos *</label>
                    <button type="button" className="btn btn-sm btn-primary" onClick={agregarItem}>
                      <PlusCircle size={14} /> Agregar Producto
                    </button>
                  </div>

                  {nuevoPedido.items.length === 0 ? (
                    <div className="alert alert-info">
                      No hay productos agregados. Haga clic en "Agregar Producto" para comenzar.
                    </div>
                  ) : (
                    <div className="order-items-list">
                      {nuevoPedido.items.map((item, index) => {
                        const producto = productos.find(p => p.id === parseInt(item.producto_id));
                        const subtotalItem = producto ? producto.precio * item.cantidad : 0;

                        return (
                          <div key={index} className="order-item">
                            <div className="order-item-fields">
                              <select
                                className="form-control"
                                value={item.producto_id}
                                onChange={e => actualizarItem(index, 'producto_id', e.target.value)}
                                required
                              >
                                <option value="">Seleccionar producto...</option>
                                {productos.map(p => (
                                  <option key={p.id} value={p.id}>
                                    {p.nombre} - {formatMoney(p.precio)} (Stock: {p.stock})
                                  </option>
                                ))}
                              </select>

                              <input
                                type="number"
                                className="form-control"
                                style={{ width: '100px' }}
                                value={item.cantidad}
                                onChange={e => actualizarItem(index, 'cantidad', parseInt(e.target.value) || 1)}
                                min="1"
                                max={producto?.stock || 999}
                                required
                              />

                              <div className="order-item-subtotal">
                                {formatMoney(subtotalItem)}
                              </div>

                              <button
                                type="button"
                                className="btn btn-sm btn-danger"
                                onClick={() => eliminarItem(index)}
                                title="Eliminar producto"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {nuevoPedido.items.length > 0 && (() => {
                  const totales = calcularTotales();
                  return (
                    <div className="order-totals">
                      <div className="order-total-row">
                        <span>Subtotal:</span>
                        <strong>{formatMoney(totales.subtotal)}</strong>
                      </div>
                      <div className="order-total-row">
                        <span>Impuesto (13%):</span>
                        <strong>{formatMoney(totales.impuesto)}</strong>
                      </div>
                      <div className="order-total-row order-total-final">
                        <span>Total:</span>
                        <strong>{formatMoney(totales.total)}</strong>
                      </div>
                    </div>
                  );
                })()}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowNuevo(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={nuevoPedido.items.length === 0}>
                  Crear Pedido
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Pedidos;
