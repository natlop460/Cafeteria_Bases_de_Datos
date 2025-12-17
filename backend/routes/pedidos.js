const express = require('express');
const router = express.Router();
const { executeQuery, callProcedure, executeTransaction } = require('../config/database');
const { insertLog } = require('../config/mongodb');

// GET - Obtener todos los pedidos
router.get('/', async (req, res) => {
  try {
    const pedidos = await executeQuery(`
      SELECT p.*, c.nombre AS cliente_nombre, c.email AS cliente_email,
             s.nombre AS sucursal_nombre
      FROM PEDIDO p
      LEFT JOIN CLIENTE c ON p.cliente_id = c.id
      LEFT JOIN SUCURSAL s ON p.sucursal_id = s.id
      ORDER BY p.fecha_pedido DESC
      LIMIT 100
    `);
    res.json(pedidos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET - Obtener pedido por ID con detalles
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Obtener pedido
    const pedidos = await executeQuery(`
      SELECT p.*, c.nombre AS cliente_nombre, c.email AS cliente_email,
             s.nombre AS sucursal_nombre
      FROM PEDIDO p
      LEFT JOIN CLIENTE c ON p.cliente_id = c.id
      LEFT JOIN SUCURSAL s ON p.sucursal_id = s.id
      WHERE p.id = ?
    `, [id]);
    
    if (pedidos.length === 0) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }
    
    // Obtener ítems del pedido
    const items = await executeQuery(`
      SELECT ip.*, pr.nombre AS producto_nombre, pr.sku
      FROM ITEM_PEDIDO ip
      INNER JOIN PRODUCTO pr ON ip.producto_id = pr.id
      WHERE ip.pedido_id = ?
    `, [id]);
    
    // Obtener pagos del pedido
    const pagos = await executeQuery(`
      SELECT * FROM PAGO WHERE pedido_id = ?
    `, [id]);
    
    res.json({
      ...pedidos[0],
      items,
      pagos
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET - Pedidos con más de N ítems
router.get('/reportes/muchos-items', async (req, res) => {
  try {
    const { minItems = 3 } = req.query;
    const pedidos = await executeQuery(`
      SELECT p.*, c.nombre AS cliente_nombre,
             COUNT(ip.id) AS cantidad_items
      FROM PEDIDO p
      INNER JOIN CLIENTE c ON p.cliente_id = c.id
      INNER JOIN ITEM_PEDIDO ip ON p.id = ip.pedido_id
      GROUP BY p.id
      HAVING cantidad_items > ?
      ORDER BY cantidad_items DESC
    `, [parseInt(minItems)]);
    res.json(pedidos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET - Pedidos delivery fuera de tiempo
router.get('/reportes/fuera-de-tiempo', async (req, res) => {
  try {
    const pedidos = await executeQuery(`
      SELECT p.*, c.nombre AS cliente_nombre,
             TIMESTAMPDIFF(MINUTE, p.fecha_pedido, p.fecha_entrega) AS minutos_entrega,
             p.tiempo_estimado_minutos
      FROM PEDIDO p
      INNER JOIN CLIENTE c ON p.cliente_id = c.id
      WHERE p.canal_venta = 'DELIVERY'
        AND p.fecha_entrega IS NOT NULL
        AND TIMESTAMPDIFF(MINUTE, p.fecha_pedido, p.fecha_entrega) > p.tiempo_estimado_minutos
      ORDER BY p.fecha_pedido DESC
    `);
    res.json(pedidos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET - Distribución por canal y sucursal
router.get('/reportes/distribucion', async (req, res) => {
  try {
    const distribucion = await executeQuery(`
      SELECT 
        s.nombre AS sucursal,
        p.canal_venta,
        COUNT(*) AS cantidad_pedidos,
        SUM(p.total) AS total_ventas
      FROM PEDIDO p
      INNER JOIN SUCURSAL s ON p.sucursal_id = s.id
      WHERE p.estado != 'CANCELADO'
      GROUP BY s.id, p.canal_venta
      ORDER BY s.nombre, p.canal_venta
    `);
    res.json(distribucion);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST - Crear nuevo pedido (usa procedimiento almacenado)
router.post('/', async (req, res) => {
  try {
    const { cliente_id, sucursal_id, canal_venta, items, direccion_entrega } = req.body;
    
    // Llamar al procedimiento almacenado
    const result = await callProcedure('SP_CREAR_PEDIDO', [
      cliente_id,
      sucursal_id,
      canal_venta,
      JSON.stringify(items),
      direccion_entrega || null
    ]);
    
    // Registrar log en MongoDB
    await insertLog({
      accion: 'crear_pedido',
      clienteId: cliente_id,
      sucursalId: sucursal_id,
      canalVenta: canal_venta,
      cantidadItems: items.length
    });
    
    res.status(201).json({ 
      mensaje: 'Pedido creado exitosamente',
      pedido_id: result[0]?.[0]?.pedido_id
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST - Procesar pago (usa procedimiento almacenado)
router.post('/:id/pagar', async (req, res) => {
  try {
    const { id } = req.params;
    const { monto, metodo_pago, referencia } = req.body;
    
    const result = await callProcedure('SP_PROCESAR_PAGO', [
      id,
      monto,
      metodo_pago,
      referencia || null
    ]);
    
    // Registrar log en MongoDB
    await insertLog({
      accion: 'procesar_pago',
      pedidoId: parseInt(id),
      monto,
      metodoPago: metodo_pago
    });
    
    res.json({ 
      mensaje: 'Pago procesado exitosamente',
      pago_id: result[0]?.[0]?.pago_id
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST - Cancelar pedido (usa procedimiento almacenado)
router.post('/:id/cancelar', async (req, res) => {
  try {
    const { id } = req.params;
    const { motivo } = req.body;
    
    await callProcedure('SP_CANCELAR_PEDIDO', [id, motivo || 'Sin especificar']);
    
    // Registrar log en MongoDB
    await insertLog({
      accion: 'cancelar_pedido',
      pedidoId: parseInt(id),
      motivo
    });
    
    res.json({ mensaje: 'Pedido cancelado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT - Actualizar estado del pedido
router.put('/:id/estado', async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;
    
    const estadosValidos = ['PENDIENTE', 'PREPARANDO', 'LISTO', 'EN_CAMINO', 'ENTREGADO', 'CANCELADO'];
    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({ error: 'Estado no válido' });
    }
    
    await executeQuery('UPDATE PEDIDO SET estado = ? WHERE id = ?', [estado, id]);
    
    // Si se entrega, registrar fecha de entrega
    if (estado === 'ENTREGADO') {
      await executeQuery('UPDATE PEDIDO SET fecha_entrega = NOW() WHERE id = ?', [id]);
    }
    
    res.json({ mensaje: 'Estado actualizado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
