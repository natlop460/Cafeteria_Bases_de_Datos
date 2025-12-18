// =====================================================
// FASE 7: INTEGRACIÓN NoSQL CON MONGODB (10%)
// Archivo: 07_nosql_mongodb.js
// Cafetería B&B - Proyecto 2
// =====================================================
//
// ==================== GUÍA PRÁCTICA ====================
//
// Esta fase es una introducción práctica a MongoDB. A diferencia de SQL
// (que vimos en las fases anteriores), MongoDB es una base de datos NoSQL
// orientada a documentos JSON.
//
// ¿POR QUÉ USAR MONGODB ADEMÁS DE MYSQL?
// ---------------------------------------
// En este proyecto usamos AMBAS bases de datos:
//
// MySQL (SQL) para:
//    - Pedidos, productos, clientes (datos estructurados)
//    - Transacciones financieras (ACID crítico)
//    - Relaciones complejas entre tablas
//
// MongoDB (NoSQL) para:
//    - Logs de actividad (estructura variable)
//    - Reseñas de productos (campos flexibles)
//    - Alto volumen de escritura sin afectar MySQL
//
// CÓMO EJECUTAR ESTE ARCHIVO:
// ----------------------------
// Opción 1 - Mongo Express (RECOMENDADO):
//    1. Asegúrese que Docker esté corriendo: docker-compose up -d
//    2. Abra su navegador en: http://localhost:8081
//    3. Login: admin / admin123
//    4. Seleccione la base de datos: cafeteria_nosql
//    5. En la parte superior, verá las colecciones: activity_logs y resenas_productos
//    6. Para cada ejercicio:
//       a) Copie el código que completó (descomente los TODO)
//       b) Click en cualquier colección → pestaña "Execute" (arriba)
//       c) Pegue su código en el área de texto
//       d) Click en "Execute" para ver resultados inmediatos
//    7. IMPORTANTE: Ejecute cada sección POR SEPARADO (no todo junto)
//
// Opción 2 - Terminal (Avanzado):
//    1. Conéctese al contenedor: docker exec -it cafeteria_mongodb mongosh
//    2. Login: use admin
//                db.auth('admin', 'admin123')
//    3. Cambie a la BD: use cafeteria_nosql
//    4. Copie y pegue cada sección del archivo
//
// CÓMO VERIFICAR SUS RESULTADOS:
// -------------------------------
// 1. En Mongo Express, navegue a la colección correspondiente
//    - Para logs: Click en "activity_logs" → "View" → verá sus documentos
//    - Para reseñas: Click en "resenas_productos" → "View"
//
// 2. BONUS - Ver en el Frontend:
//    a) Abra la aplicación: http://localhost:3000
//    b) Vaya a "Logs" (menú lateral) → verá los logs que insertó
//    c) Vaya a "Reseñas" (menú lateral) → verá las reseñas
//    d) Los datos aparecen automáticamente porque el backend
//       está conectado a MongoDB en tiempo real
//
// DIFERENCIAS CLAVE CON SQL:
// --------------------------
// SQL (MySQL):                    NoSQL (MongoDB):
// ---------------                 ------------------
// CREATE TABLE producto (...)     db.createCollection('productos')
// INSERT INTO producto VALUES     db.productos.insertOne({...})
// SELECT * FROM producto          db.productos.find()
// UPDATE producto SET...          db.productos.updateOne(...)
// DELETE FROM producto            db.productos.deleteOne(...)
//
// GROUP BY con agregaciones  →    aggregate([{$group: ...}])
// Esquema fijo (columnas)    →    Esquema flexible (documentos JSON)
// Relaciones con FOREIGN KEY →    Documentos embebidos o referencias
//
// INSTRUCCIONES FINALES:
// ----------------------
// 1. Complete las secciones marcadas con TODO
// 2. Ejecute cada sección por separado en Mongo Express
// 3. Verifique los resultados en Mongo Express y el frontend
// 4. Responda las preguntas de análisis (Ejercicio 7.5)
// 5. Compare lo que hizo aquí con los procedimientos SQL
//
// ¡Disfrute la experiencia de trabajar con documentos JSON!
// =====================================================

// Seleccionar la base de datos
db = db.getSiblingDB('cafeteria_nosql');

// =====================================================
// EJERCICIO 7.1: INSERTAR LOGS DE ACTIVIDAD (3 puntos)
// 
// Inserte al menos 5 documentos de logs con diferentes acciones
// 
// Cada log debe tener:
// - accion: tipo de acción (login, ver_producto, crear_pedido, logout, etc.)
// - usuario: email del usuario
// - timestamp: fecha y hora (usar new Date())
// - detalles: objeto con información adicional variable
//
// EJEMPLO de estructura:
// {
//   accion: "login",
//   usuario: "correo@email.com",
//   timestamp: new Date(),
//   detalles: { ip: "192.168.1.100", dispositivo: "Chrome/Windows", exitoso: true }
// }
// =====================================================

db.activity_logs.insertMany([
  {
    accion: "login",
    usuario: "ana@cafeteriabb.com",
    timestamp: new Date(),
    detalles: {
      ip: "192.168.1.10",
      dispositivo: "Chrome / Windows",
      exitoso: true
    }
  },
  {
    accion: "ver_producto",
    usuario: "ana@cafeteriabb.com",
    productoId: 1,
    nombreProducto: "Espresso",
    timestamp: new Date(),
    detalles: {
      origen: "home",
      duracion_segundos: 45
    }
  },
  {
    accion: "ver_producto",
    usuario: "carlos@cafeteriabb.com",
    productoId: 2,
    nombreProducto: "Capuccino",
    timestamp: new Date(),
    detalles: {
      origen: "busqueda",
      duracion_segundos: 30
    }
  },
  {
    accion: "crear_pedido",
    usuario: "carlos@cafeteriabb.com",
    timestamp: new Date(),
    detalles: {
      pedidoId: 15,
      total: 8.50,
      metodo_pago: "tarjeta"
    }
  },
  {
    accion: "logout",
    usuario: "ana@cafeteriabb.com",
    timestamp: new Date(),
    detalles: {
      motivo: "cierre_manual"
    }
  }
]);





// =====================================================
// EJERCICIO 7.2: INSERTAR RESEÑAS DE PRODUCTOS (3 puntos)
// 
// Inserte al menos 5 reseñas para diferentes productos
// 
// Cada reseña debe tener:
// - productoId: ID del producto (número entero)
// - nombreProducto: nombre del producto
// - clienteId: ID del cliente (puede ser null para anónimos)
// - nombreCliente: nombre del cliente
// - calificacion: número del 1 al 5
// - comentario: texto de la reseña
// - fecha: fecha de la reseña
// - verificado: boolean (si el cliente realmente compró)
// - util: número de personas que encontraron útil la reseña
//
// EJEMPLO:
// {
//   productoId: 1,
//   nombreProducto: "Espresso",
//   clienteId: 1,
//   nombreCliente: "Juan Pérez",
//   calificacion: 5,
//   comentario: "Excelente café",
//   fecha: new Date(),
//   verificado: true,
//   util: 10
// }
// =====================================================

db.resenas_productos.insertMany([
  {
    productoId: 1,
    nombreProducto: "Espresso",
    clienteId: 1,
    nombreCliente: "Ana Gómez",
    calificacion: 5,
    comentario: "Excelente sabor y aroma",
    fecha: new Date(),
    verificado: true,
    util: 12
  },
  {
    productoId: 1,
    nombreProducto: "Espresso",
    clienteId: 2,
    nombreCliente: "Carlos Ruiz",
    calificacion: 4,
    comentario: "Muy bueno, un poco fuerte",
    fecha: new Date(),
    verificado: true,
    util: 5
  },
  {
    productoId: 2,
    nombreProducto: "Capuccino",
    clienteId: 3,
    nombreCliente: "María López",
    calificacion: 5,
    comentario: "Perfecta combinación de café y leche",
    fecha: new Date(),
    verificado: true,
    util: 20
  },
  {
    productoId: 3,
    nombreProducto: "Latte",
    clienteId: null,
    nombreCliente: "Cliente Anónimo",
    calificacion: 3,
    comentario: "Está bien, nada especial",
    fecha: new Date(),
    verificado: false,
    util: 2
  },
  {
    productoId: 2,
    nombreProducto: "Capuccino",
    clienteId: 4,
    nombreCliente: "Luis Fernández",
    calificacion: 4,
    comentario: "Muy cremoso",
    fecha: new Date(),
    verificado: true,
    util: 7
  }
]);





// =====================================================
// EJERCICIO 7.3: CONSULTAS DE AGREGACIÓN (4 puntos)
// =====================================================

// 7.3a: Promedio de calificaciones por producto (1 punto)
// Complete la agregación para obtener:
// - _id: productoId
// - nombreProducto
// - promedio: promedio de calificaciones
// - total_resenas: cantidad de reseñas

db.resenas_productos.aggregate([
  {
    $group: {
      _id: "$productoId",
      nombreProducto: { $first: "$nombreProducto" },
      promedio: { $avg: "$calificacion" },
      total_resenas: { $sum: 1 }
    }
  },
  {
    $sort: { promedio: -1 }
  }
]);





// 7.3b: Productos más visitados (1 punto)
// Agregación sobre activity_logs para encontrar productos más vistos

db.activity_logs.aggregate([
  {
    $match: { accion: "ver_producto" }
  },
  {
    $group: {
      _id: "$productoId",
      nombreProducto: { $first: "$nombreProducto" },
      visitas: { $sum: 1 }
    }
  },
  {
    $sort: { visitas: -1 }
  },
  {
    $limit: 10
  }
]);





// 7.3c: Acciones por tipo (1 punto)
// Agrupar logs por tipo de acción y contar

db.activity_logs.aggregate([
  {
    $group: {
      _id: "$accion",
      cantidad: { $sum: 1 }
    }
  },
  {
    $sort: { cantidad: -1 }
  }
]);


// 7.3d: Usuarios más activos (1 punto)
// Encontrar los 5 usuarios con más acciones registradas

db.activity_logs.aggregate([
  {
    $match: { usuario: { $ne: "anonimo" } }
  },
  {
    $group: {
      _id: "$usuario",
      total_acciones: { $sum: 1 },
      acciones: { $addToSet: "$accion" }
    }
  },
  {
    $sort: { total_acciones: -1 }
  },
  {
    $limit: 5
  }
]);








// =====================================================
// REFERENCIA: COMPARATIVA SQL vs NoSQL
// (Esta sección es informativa, no requiere completar)
// =====================================================

/*
CASO 1: LOGS DE ACTIVIDAD

En SQL necesitaríamos:
-----------------------
CREATE TABLE LOG_ACTIVIDAD (
    id INT PRIMARY KEY,
    accion VARCHAR(50),
    usuario VARCHAR(100),
    timestamp DATETIME,
    -- Y luego columnas para cada tipo de detalle...
    ip VARCHAR(50) NULL,
    dispositivo VARCHAR(100) NULL,
    producto_id INT NULL,
    pedido_id INT NULL,
    monto DECIMAL(10,2) NULL,
    -- etc... muchas columnas NULL
);

Problemas con SQL:
- Muchas columnas NULL desperdiciadas
- ALTER TABLE cada vez que se agrega nuevo tipo de log
- O necesitamos múltiples tablas con UNIONs

En MongoDB:
- Cada documento tiene solo los campos necesarios
- Agregar nuevos tipos de log es instantáneo
- No hay columnas NULL desperdiciadas


CASO 2: RESEÑAS DE PRODUCTOS

SQL sería viable pero requeriría:
- Tabla de reseñas
- Tabla de fotos adjuntas
- Tabla de tags
- Múltiples JOINs para cada consulta

MongoDB:
- Todo en un documento
- Arrays embebidos para tags, fotos
- Agregaciones más naturales


CUÁNDO USAR SQL:
- Datos con estructura fija (productos, clientes, pedidos)
- Transacciones ACID críticas (pagos, inventario)
- Relaciones complejas con integridad referencial
- Reportes con múltiples JOINs

CUÁNDO USAR NoSQL:
- Datos con estructura variable (logs, eventos)
- Alto volumen de escritura
- Documentos auto-contenidos
- Escalabilidad horizontal
*/

print('Script MongoDB ejecutado correctamente');
