const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

// Importar rutas
const productosRoutes = require('./routes/productos');
const clientesRoutes = require('./routes/clientes');
const pedidosRoutes = require('./routes/pedidos');
const reportesRoutes = require('./routes/reportes');
const logsRoutes = require('./routes/logs');
const resenasRoutes = require('./routes/resenas');
const adminRoutes = require('./routes/admin');
const sucursalesRoutes = require('./routes/sucursales');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(bodyParser.json({ charset: 'utf-8' }));
app.use(bodyParser.urlencoded({ extended: true, charset: 'utf-8' }));

// Middleware para asegurar UTF-8 en las respuestas
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
});

// Rutas de la API
app.use('/api/productos', productosRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/pedidos', pedidosRoutes);
app.use('/api/reportes', reportesRoutes);
app.use('/api/logs', logsRoutes);
app.use('/api/resenas', resenasRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/sucursales', sucursalesRoutes);

// Ruta principal
app.get('/', (req, res) => {
  res.json({
    mensaje: 'Bienvenido a la API de Cafetería B&B',
    version: '2.0.0',
    endpoints: {
      productos: '/api/productos',
      clientes: '/api/clientes',
      pedidos: '/api/pedidos',
      reportes: '/api/reportes',
      logs: '/api/logs (MongoDB)',
      resenas: '/api/resenas (MongoDB)'
    }
  });
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Error interno del servidor', detalle: err.message });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor Cafetería B&B corriendo en puerto ${PORT}`);
  console.log(`📦 MySQL: ${process.env.DB_HOST}:3306`);
  console.log(`🍃 MongoDB: mongodb://mongodb:27017`);
});
