const express = require('express');
const router = express.Router();
const { executeQuery } = require('../config/database');
const { getDb } = require('../config/mongodb');

// GET - Health check del sistema
router.get('/health', async (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    mysql: { status: 'disconnected' },
    mongodb: { status: 'disconnected' }
  };

  // Verificar conexión MySQL
  try {
    await executeQuery('SELECT 1 as test');
    const [dbInfo] = await executeQuery('SELECT DATABASE() as db_name');
    health.mysql = {
      status: 'connected',
      database: dbInfo.db_name
    };
  } catch (error) {
    health.mysql = {
      status: 'disconnected',
      error: error.message
    };
    health.status = 'degraded';
  }

  // Verificar conexión MongoDB
  try {
    const db = getDb();
    await db.admin().ping();
    const dbName = db.databaseName;
    health.mongodb = {
      status: 'connected',
      database: dbName
    };
  } catch (error) {
    health.mongodb = {
      status: 'disconnected',
      error: error.message
    };
    health.status = 'degraded';
  }

  // Determinar código de estado HTTP
  const statusCode = health.status === 'healthy' ? 200 : 503;
  res.status(statusCode).json(health);
});

// GET - Estadísticas del sistema
router.get('/stats', async (req, res) => {
  try {
    const stats = {};

    // Estadísticas MySQL
    const [productos] = await executeQuery('SELECT COUNT(*) as total FROM PRODUCTO WHERE activo = 1');
    const [clientes] = await executeQuery('SELECT COUNT(*) as total FROM CLIENTE WHERE activo = 1');
    const [pedidos] = await executeQuery('SELECT COUNT(*) as total FROM PEDIDO');
    const [ventas] = await executeQuery('SELECT COALESCE(SUM(total), 0) as total FROM PEDIDO WHERE estado != "CANCELADO"');

    stats.mysql = {
      productos: productos.total,
      clientes: clientes.total,
      pedidos: pedidos.total,
      ventasTotal: parseFloat(ventas.total)
    };

    // Estadísticas MongoDB
    const db = getDb();

    const logsCount = await db.collection('activity_logs').countDocuments();
    const resenasCount = await db.collection('resenas_productos').countDocuments();

    stats.mongodb = {
      logs: logsCount,
      resenas: resenasCount
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET - Información del servidor
router.get('/info', async (req, res) => {
  try {
    const info = {
      node: {
        version: process.version,
        platform: process.platform,
        arch: process.arch,
        uptime: process.uptime(),
        memory: {
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB',
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB'
        }
      },
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString()
    };

    res.json(info);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
