const express = require('express');
const router = express.Router();
const { executeQuery, callFunction, callProcedure } = require('../config/database');

// GET - Obtener todos los clientes
router.get('/', async (req, res) => {
  try {
    const clientes = await executeQuery(`
      SELECT c.*, 
             (SELECT COUNT(*) FROM PEDIDO p WHERE p.cliente_id = c.id) AS total_pedidos
      FROM CLIENTE c 
      WHERE c.activo = 1
      ORDER BY c.fecha_registro DESC
    `);
    res.json(clientes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET - Clientes activos ordenados por fecha de registro
router.get('/activos', async (req, res) => {
  try {
    const clientes = await executeQuery(`
      SELECT * FROM CLIENTE 
      WHERE activo = 1 
      ORDER BY fecha_registro DESC
    `);
    res.json(clientes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET - Obtener cliente por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const clientes = await executeQuery('SELECT * FROM CLIENTE WHERE id = ?', [id]);
    
    if (clientes.length === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    
    // Obtener categoría del cliente usando función
    try {
      const categoria = await callFunction('FN_OBTENER_CATEGORIA_CLIENTE', [id]);
      clientes[0].categoria = categoria;
    } catch (e) {
      clientes[0].categoria = 'Sin categoría';
    }
    
    // Obtener días desde último pedido
    try {
      const dias = await callFunction('FN_DIAS_DESDE_ULTIMO_PEDIDO', [id]);
      clientes[0].dias_sin_pedido = dias;
    } catch (e) {
      clientes[0].dias_sin_pedido = null;
    }
    
    res.json(clientes[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET - Clientes sin pedidos (usando NOT EXISTS)
router.get('/reportes/sin-pedidos', async (req, res) => {
  try {
    const clientes = await executeQuery(`
      SELECT c.* 
      FROM CLIENTE c 
      WHERE NOT EXISTS (
        SELECT 1 FROM PEDIDO p WHERE p.cliente_id = c.id
      )
      ORDER BY c.nombre
    `);
    res.json(clientes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET - Mejores clientes por mes
router.get('/reportes/mejores-por-mes', async (req, res) => {
  try {
    const { mes, anio } = req.query;
    const clientes = await executeQuery(`
      SELECT 
        c.id,
        c.nombre,
        c.email,
        COUNT(p.id) AS cantidad_pedidos,
        SUM(p.total) AS total_compras
      FROM CLIENTE c
      INNER JOIN PEDIDO p ON c.id = p.cliente_id
      WHERE MONTH(p.fecha_pedido) = ? AND YEAR(p.fecha_pedido) = ?
        AND p.estado != 'CANCELADO'
      GROUP BY c.id, c.nombre, c.email
      ORDER BY total_compras DESC
      LIMIT 5
    `, [mes || new Date().getMonth() + 1, anio || new Date().getFullYear()]);
    res.json(clientes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST - Crear nuevo cliente
router.post('/', async (req, res) => {
  try {
    const { nombre, email, telefono, direccion } = req.body;
    
    const result = await executeQuery(
      'INSERT INTO CLIENTE (nombre, email, telefono, direccion, fecha_registro, activo, puntos_fidelidad) VALUES (?, ?, ?, ?, NOW(), 1, 0)',
      [nombre, email, telefono, direccion]
    );
    
    res.status(201).json({ 
      mensaje: 'Cliente creado exitosamente', 
      id: result.insertId 
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }
    res.status(500).json({ error: error.message });
  }
});

// PUT - Actualizar cliente
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, email, telefono, direccion } = req.body;
    
    await executeQuery(
      'UPDATE CLIENTE SET nombre = ?, email = ?, telefono = ?, direccion = ? WHERE id = ?',
      [nombre, email, telefono, direccion, id]
    );
    
    res.json({ mensaje: 'Cliente actualizado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE - Desactivar cliente (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await executeQuery('UPDATE CLIENTE SET activo = 0 WHERE id = ?', [id]);
    
    res.json({ mensaje: 'Cliente desactivado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
