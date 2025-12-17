import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json; charset=utf-8'
  }
});

// =====================================================
// PRODUCTOS
// =====================================================
export const productosAPI = {
  getAll: () => api.get('/productos'),
  getById: (id) => api.get(`/productos/${id}`),
  create: (data) => api.post('/productos', data),
  update: (id, data) => api.put(`/productos/${id}`, data),
  delete: (id) => api.delete(`/productos/${id}`),
  getBajoStock: () => api.get('/productos/reportes/bajo-stock'),
  getCategorias: () => api.get('/productos/categorias/todas')
};

// =====================================================
// CLIENTES
// =====================================================
export const clientesAPI = {
  getAll: () => api.get('/clientes'),
  getActivos: () => api.get('/clientes/activos'),
  getById: (id) => api.get(`/clientes/${id}`),
  create: (data) => api.post('/clientes', data),
  update: (id, data) => api.put(`/clientes/${id}`, data),
  delete: (id) => api.delete(`/clientes/${id}`),
  getSinPedidos: () => api.get('/clientes/reportes/sin-pedidos'),
  getMejoresPorMes: (mes, anio) => api.get(`/clientes/reportes/mejores-por-mes?mes=${mes}&anio=${anio}`)
};

// =====================================================
// PEDIDOS
// =====================================================
export const pedidosAPI = {
  getAll: () => api.get('/pedidos'),
  getById: (id) => api.get(`/pedidos/${id}`),
  create: (data) => api.post('/pedidos', data),
  updateEstado: (id, estado) => api.put(`/pedidos/${id}/estado`, { estado }),
  procesarPago: (id, data) => api.post(`/pedidos/${id}/pagar`, data),
  cancelar: (id, motivo) => api.post(`/pedidos/${id}/cancelar`, { motivo }),
  getMuchosItems: (minItems) => api.get(`/pedidos/reportes/muchos-items?minItems=${minItems}`),
  getFueraDeTiempo: () => api.get('/pedidos/reportes/fuera-de-tiempo'),
  getDistribucion: () => api.get('/pedidos/reportes/distribucion')
};

// =====================================================
// REPORTES
// =====================================================
export const reportesAPI = {
  getVentasMensuales: () => api.get('/reportes/ventas-mensuales'),
  getTopProductos: (criterio) => api.get(`/reportes/top-productos?criterio=${criterio}`),
  getPromedioPedidoMes: () => api.get('/reportes/promedio-pedido-mes'),
  getVentasPeriodo: (fechaInicio, fechaFin) => 
    api.get(`/reportes/ventas-periodo?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`),
  getAuditoria: (limite) => api.get(`/reportes/auditoria-pedidos?limite=${limite}`),
  getDashboard: () => api.get('/reportes/dashboard')
};

// =====================================================
// LOGS (MongoDB)
// =====================================================
export const logsAPI = {
  getAll: (filtros) => {
    const params = new URLSearchParams(filtros).toString();
    return api.get(`/logs?${params}`);
  },
  getProductosPopulares: (limite) => api.get(`/logs/productos-populares?limite=${limite}`),
  getEstadisticas: () => api.get('/logs/estadisticas'),
  create: (data) => api.post('/logs', data)
};

// =====================================================
// RESEÑAS (MongoDB)
// =====================================================
export const resenasAPI = {
  getByProducto: (productoId) => api.get(`/resenas/producto/${productoId}`),
  getMejoresProductos: (limite) => api.get(`/resenas/mejores-productos?limite=${limite}`),
  getEstadisticas: () => api.get('/resenas/estadisticas'),
  create: (data) => api.post('/resenas', data),
  delete: (id) => api.delete(`/resenas/${id}`)
};

// =====================================================
// ADMIN
// =====================================================
export const adminAPI = {
  healthCheck: () => api.get('/admin/health'),
  getStats: () => api.get('/admin/stats'),
  getInfo: () => api.get('/admin/info')
};

// =====================================================
// SUCURSALES
// =====================================================
export const sucursalesAPI = {
  getAll: () => api.get('/sucursales'),
  getById: (id) => api.get(`/sucursales/${id}`)
};

export default api;
