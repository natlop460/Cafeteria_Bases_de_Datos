const express = require('express');
const router = express.Router();
const { executeQuery, callProcedure } = require('../config/database');

// GET - Resumen de ventas mensuales (usa vista)
router.get('/ventas-mensuales', async (req, res) => {
  try {
    const resumen = await executeQuery('SELECT * FROM VW_RESUMEN_VENTAS_MENSUALES ORDER BY anio DESC, mes DESC');
    res.json(resumen);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET - Top 10 productos más vendidos
router.get('/top-productos', async (req, res) => {
  try {
    const { criterio = 'unidades' } = req.query;
    
    let orderBy = 'unidades_vendidas DESC';
    if (criterio === 'monto') {
      orderBy = 'monto_total DESC';
    }
    
    const productos = await executeQuery(`
      SELECT 
        pr.id,
        pr.nombre,
        pr.sku,
        c.nombre AS categoria,
        SUM(ip.cantidad) AS unidades_vendidas,
        SUM(ip.cantidad * ip.precio_unitario) AS monto_total
      FROM PRODUCTO pr
      INNER JOIN ITEM_PEDIDO ip ON pr.id = ip.producto_id
      INNER JOIN PEDIDO p ON ip.pedido_id = p.id
      LEFT JOIN CATEGORIA c ON pr.categoria_id = c.id
      WHERE p.estado != 'CANCELADO'
      GROUP BY pr.id, pr.nombre, pr.sku, c.nombre
      ORDER BY ${orderBy}
      LIMIT 10
    `);
    res.json(productos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET - Costo promedio de pedido por mes
router.get('/promedio-pedido-mes', async (req, res) => {
  try {
    const promedios = await executeQuery(`
      SELECT 
        YEAR(fecha_pedido) AS anio,
        MONTH(fecha_pedido) AS mes,
        COUNT(*) AS cantidad_pedidos,
        AVG(total) AS promedio_pedido,
        SUM(total) AS total_mes
      FROM PEDIDO
      WHERE estado != 'CANCELADO'
      GROUP BY YEAR(fecha_pedido), MONTH(fecha_pedido)
      ORDER BY anio DESC, mes DESC
    `);
    res.json(promedios);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET - Reporte de ventas por período (usa procedimiento)
router.get('/ventas-periodo', async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin } = req.query;
    
    if (!fecha_inicio || !fecha_fin) {
      return res.status(400).json({ error: 'Se requieren fecha_inicio y fecha_fin' });
    }
    
    const result = await callProcedure('SP_REPORTE_VENTAS_PERIODO', [fecha_inicio, fecha_fin]);
    res.json(result[0] || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET - Auditoría de pedidos
router.get('/auditoria-pedidos', async (req, res) => {
  try {
    const limite = parseInt(req.query.limite || 50);
    const auditoria = await executeQuery(`
      SELECT * FROM AUDITORIA_PEDIDOS
      ORDER BY fecha_accion DESC
      LIMIT ${limite}
    `);
    res.json(auditoria);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET - Estadísticas generales del dashboard
router.get('/dashboard', async (req, res) => {
  try {
    // Total de clientes activos
    const [clientesResult] = await executeQuery('SELECT COUNT(*) AS total FROM CLIENTE WHERE activo = 1');
    
    // Total de productos activos
    const [productosResult] = await executeQuery('SELECT COUNT(*) AS total FROM PRODUCTO WHERE activo = 1');
    
    // Pedidos del día
    const [pedidosHoy] = await executeQuery(`
      SELECT COUNT(*) AS total, COALESCE(SUM(total), 0) AS monto 
      FROM PEDIDO 
      WHERE DATE(fecha_pedido) = CURDATE() AND estado != 'CANCELADO'
    `);
    
    // Pedidos del mes
    const [pedidosMes] = await executeQuery(`
      SELECT COUNT(*) AS total, COALESCE(SUM(total), 0) AS monto 
      FROM PEDIDO 
      WHERE MONTH(fecha_pedido) = MONTH(CURDATE()) 
        AND YEAR(fecha_pedido) = YEAR(CURDATE())
        AND estado != 'CANCELADO'
    `);
    
    // Productos con bajo stock
    const [bajoStock] = await executeQuery(`
      SELECT COUNT(*) AS total 
      FROM PRODUCTO 
      WHERE stock <= stock_minimo AND activo = 1
    `);
    
    res.json({
      clientes_activos: clientesResult.total,
      productos_activos: productosResult.total,
      pedidos_hoy: pedidosHoy,
      pedidos_mes: pedidosMes,
      productos_bajo_stock: bajoStock.total
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
