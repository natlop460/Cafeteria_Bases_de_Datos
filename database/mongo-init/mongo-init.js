// Archivo: mongo-init.js
// Inicialización de MongoDB para Cafetería B&B

db = db.getSiblingDB('cafeteria_nosql');

// Crear colecciones
db.createCollection('activity_logs');
db.createCollection('resenas_productos');

// Crear índices
db.activity_logs.createIndex({ timestamp: -1 });
db.activity_logs.createIndex({ accion: 1 });
db.activity_logs.createIndex({ usuario: 1 });

db.resenas_productos.createIndex({ productoId: 1 });
db.resenas_productos.createIndex({ calificacion: -1 });

// Insertar datos de ejemplo
db.activity_logs.insertMany([
  { accion: 'login', usuario: 'jcmora@email.com', timestamp: new Date(), detalles: { ip: '192.168.1.100', dispositivo: 'Chrome/Windows', exitoso: true } },
  { accion: 'ver_producto', usuario: 'jcmora@email.com', productoId: 1, nombreProducto: 'Espresso', timestamp: new Date(), detalles: { desde: 'menu' } },
  { accion: 'ver_producto', usuario: 'mflopez@email.com', productoId: 3, nombreProducto: 'Cappuccino', timestamp: new Date(), detalles: { desde: 'busqueda' } },
  { accion: 'crear_pedido', usuario: 'mflopez@email.com', timestamp: new Date(), detalles: { pedidoId: 11, total: 3616, items: 2 } }
]);

db.resenas_productos.insertMany([
  { productoId: 1, nombreProducto: 'Espresso', clienteId: 1, nombreCliente: 'Juan Carlos Mora', calificacion: 5, comentario: 'Excelente espresso, muy bien preparado.', fecha: new Date(), verificado: true, util: 12 },
  { productoId: 3, nombreProducto: 'Cappuccino', clienteId: 8, nombreCliente: 'Sofía Elena Castillo', calificacion: 5, comentario: 'La espuma perfecta, cremoso y con el balance ideal.', fecha: new Date(), verificado: true, util: 20 },
  { productoId: 13, nombreProducto: 'Cheesecake', clienteId: 4, nombreCliente: 'Ana Patricia Jiménez', calificacion: 5, comentario: 'Increíble! El mejor cheesecake.', fecha: new Date(), verificado: true, util: 15 }
]);

print('MongoDB inicializado correctamente');
