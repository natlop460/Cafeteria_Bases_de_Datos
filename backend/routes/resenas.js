const express = require('express');
const router = express.Router();
const { insertResena, getResenasByProducto, getPromedioCalificaciones, getResenasCollection } = require('../config/mongodb');

// GET - Obtener reseñas de un producto
router.get('/producto/:productoId', async (req, res) => {
  try {
    const { productoId } = req.params;
    
    const resenas = await getResenasByProducto(productoId);
    const promedio = await getPromedioCalificaciones(productoId);
    
    res.json({
      producto_id: parseInt(productoId),
      promedio_calificacion: promedio.promedio ? promedio.promedio.toFixed(1) : 0,
      total_resenas: promedio.total,
      resenas
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET - Productos mejor calificados
router.get('/mejores-productos', async (req, res) => {
  try {
    const { limite = 10 } = req.query;
    const collection = getResenasCollection();
    
    const mejores = await collection.aggregate([
      { $group: { 
        _id: '$productoId', 
        promedio: { $avg: '$calificacion' },
        total_resenas: { $sum: 1 },
        nombre_producto: { $first: '$nombreProducto' }
      }},
      { $match: { total_resenas: { $gte: 1 } } },
      { $sort: { promedio: -1 } },
      { $limit: parseInt(limite) }
    ]).toArray();
    
    res.json(mejores);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET - Estadísticas de reseñas
router.get('/estadisticas', async (req, res) => {
  try {
    const collection = getResenasCollection();
    
    // Distribución de calificaciones
    const distribucion = await collection.aggregate([
      { $group: { _id: '$calificacion', total: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]).toArray();
    
    // Total de reseñas
    const totalResenas = await collection.countDocuments();
    
    // Promedio general
    const promedioGeneral = await collection.aggregate([
      { $group: { _id: null, promedio: { $avg: '$calificacion' } } }
    ]).toArray();
    
    res.json({
      total_resenas: totalResenas,
      promedio_general: promedioGeneral[0]?.promedio?.toFixed(2) || 0,
      distribucion_calificaciones: distribucion
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST - Crear nueva reseña
router.post('/', async (req, res) => {
  try {
    const { productoId, nombreProducto, clienteId, nombreCliente, calificacion, comentario } = req.body;
    
    if (!productoId || !calificacion) {
      return res.status(400).json({ error: 'productoId y calificacion son requeridos' });
    }
    
    if (calificacion < 1 || calificacion > 5) {
      return res.status(400).json({ error: 'La calificación debe estar entre 1 y 5' });
    }
    
    const result = await insertResena({
      productoId: parseInt(productoId),
      nombreProducto: nombreProducto || 'Producto',
      clienteId: clienteId ? parseInt(clienteId) : null,
      nombreCliente: nombreCliente || 'Anónimo',
      calificacion: parseInt(calificacion),
      comentario: comentario || ''
    });
    
    res.status(201).json({ 
      mensaje: 'Reseña creada exitosamente',
      id: result.insertedId
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE - Eliminar reseña
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { ObjectId } = require('mongodb');
    const collection = getResenasCollection();
    
    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Reseña no encontrada' });
    }
    
    res.json({ mensaje: 'Reseña eliminada exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
