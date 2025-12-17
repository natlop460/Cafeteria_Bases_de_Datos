const express = require('express');
const router = express.Router();
const { insertLog, getLogs, getProductosMasVisitados } = require('../config/mongodb');

// GET - Obtener todos los logs
router.get('/', async (req, res) => {
  try {
    const { accion, usuario, limite = 100 } = req.query;
    
    const filter = {};
    if (accion) filter.accion = accion;
    if (usuario) filter.usuario = usuario;
    
    const logs = await getLogs(filter, { limit: parseInt(limite) });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET - Productos más visitados
router.get('/productos-populares', async (req, res) => {
  try {
    const { limite = 10 } = req.query;
    const productos = await getProductosMasVisitados(parseInt(limite));
    res.json(productos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET - Estadísticas de actividad
router.get('/estadisticas', async (req, res) => {
  try {
    const { getLogsCollection } = require('../config/mongodb');
    const collection = getLogsCollection();
    
    // Acciones por tipo
    const accionesPorTipo = await collection.aggregate([
      { $group: { _id: '$accion', total: { $sum: 1 } } },
      { $sort: { total: -1 } }
    ]).toArray();
    
    // Actividad por hora (últimas 24 horas)
    const hace24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const actividadPorHora = await collection.aggregate([
      { $match: { timestamp: { $gte: hace24h } } },
      { $group: { 
        _id: { $hour: '$timestamp' }, 
        total: { $sum: 1 } 
      }},
      { $sort: { _id: 1 } }
    ]).toArray();
    
    res.json({
      acciones_por_tipo: accionesPorTipo,
      actividad_24h: actividadPorHora
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST - Registrar log manualmente
router.post('/', async (req, res) => {
  try {
    const { accion, usuario, detalles } = req.body;
    
    if (!accion) {
      return res.status(400).json({ error: 'La acción es requerida' });
    }
    
    const result = await insertLog({
      accion,
      usuario: usuario || 'sistema',
      detalles: detalles || {}
    });
    
    res.status(201).json({ 
      mensaje: 'Log registrado exitosamente',
      id: result.insertedId
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
