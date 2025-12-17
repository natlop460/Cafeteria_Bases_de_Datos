const express = require('express');
const router = express.Router();
const { executeQuery, callFunction } = require('../config/database');
const { insertLog } = require('../config/mongodb');

// GET - Obtener todos los productos
router.get('/', async (req, res) => {
  try {
    const productos = await executeQuery(`
      SELECT p.*, c.nombre AS categoria_nombre 
      FROM PRODUCTO p 
      LEFT JOIN CATEGORIA c ON p.categoria_id = c.id 
      WHERE p.activo = 1
      ORDER BY p.nombre
    `);
    res.json(productos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET - Obtener producto por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const productos = await executeQuery(
      'SELECT p.*, c.nombre AS categoria_nombre FROM PRODUCTO p LEFT JOIN CATEGORIA c ON p.categoria_id = c.id WHERE p.id = ?',
      [id]
    );
    
    if (productos.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    
    // Registrar log de vista de producto (MongoDB)
    await insertLog({
      accion: 'ver_producto',
      productoId: parseInt(id),
      nombreProducto: productos[0].nombre,
      usuario: req.query.usuario || 'anonimo'
    });
    
    res.json(productos[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET - Productos con bajo stock (usa vista)
router.get('/reportes/bajo-stock', async (req, res) => {
  try {
    const productos = await executeQuery('SELECT * FROM VW_PRODUCTOS_BAJO_STOCK');
    res.json(productos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST - Crear nuevo producto
router.post('/', async (req, res) => {
  try {
    const { nombre, descripcion, precio, stock, stock_minimo, categoria_id, sku } = req.body;
    
    const result = await executeQuery(
      'INSERT INTO PRODUCTO (nombre, descripcion, precio, stock, stock_minimo, categoria_id, sku, activo) VALUES (?, ?, ?, ?, ?, ?, ?, 1)',
      [nombre, descripcion, precio, stock, stock_minimo || 10, categoria_id, sku]
    );
    
    res.status(201).json({ 
      mensaje: 'Producto creado exitosamente', 
      id: result.insertId 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT - Actualizar producto
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, precio, stock, stock_minimo, categoria_id, sku } = req.body;

    await executeQuery(
      'UPDATE PRODUCTO SET nombre = ?, descripcion = ?, precio = ?, stock = ?, stock_minimo = ?, categoria_id = ?, sku = ? WHERE id = ?',
      [nombre, descripcion, precio, stock, stock_minimo, categoria_id, sku, id]
    );

    res.json({ mensaje: 'Producto actualizado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE - Desactivar producto (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await executeQuery('UPDATE PRODUCTO SET activo = 0 WHERE id = ?', [id]);
    
    res.json({ mensaje: 'Producto desactivado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET - Categorías
router.get('/categorias/todas', async (req, res) => {
  try {
    const categorias = await executeQuery('SELECT * FROM CATEGORIA ORDER BY nombre');
    res.json(categorias);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
