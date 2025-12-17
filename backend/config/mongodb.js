const { MongoClient } = require('mongodb');

const uri = process.env.MONGO_URI || 'mongodb://admin:admin123@localhost:27017/cafeteria_nosql?authSource=admin';
const client = new MongoClient(uri);

let db = null;

// Conectar a MongoDB
const connectMongo = async () => {
  try {
    await client.connect();
    db = client.db('cafeteria_nosql');
    console.log('✅ Conectado a MongoDB');
    return db;
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error);
    throw error;
  }
};

// Obtener la base de datos
const getDb = () => {
  if (!db) {
    throw new Error('MongoDB no está conectado. Llame a connectMongo() primero.');
  }
  return db;
};

// Obtener colección de logs
const getLogsCollection = () => {
  return getDb().collection('activity_logs');
};

// Obtener colección de reseñas
const getResenasCollection = () => {
  return getDb().collection('resenas_productos');
};

// Insertar log de actividad
const insertLog = async (logData) => {
  const collection = getLogsCollection();
  const log = {
    ...logData,
    timestamp: new Date(),
    createdAt: new Date()
  };
  return await collection.insertOne(log);
};

// Obtener logs con filtros
const getLogs = async (filter = {}, options = {}) => {
  const collection = getLogsCollection();
  return await collection.find(filter, options).sort({ timestamp: -1 }).toArray();
};

// Insertar reseña
const insertResena = async (resenaData) => {
  const collection = getResenasCollection();
  const resena = {
    ...resenaData,
    fecha: new Date(),
    createdAt: new Date()
  };
  return await collection.insertOne(resena);
};

// Obtener reseñas de un producto
const getResenasByProducto = async (productoId) => {
  const collection = getResenasCollection();
  return await collection.find({ productoId: parseInt(productoId) }).sort({ fecha: -1 }).toArray();
};

// Obtener promedio de calificaciones por producto
const getPromedioCalificaciones = async (productoId) => {
  const collection = getResenasCollection();
  const result = await collection.aggregate([
    { $match: { productoId: parseInt(productoId) } },
    { $group: { 
      _id: '$productoId', 
      promedio: { $avg: '$calificacion' },
      total: { $sum: 1 }
    }}
  ]).toArray();
  return result[0] || { promedio: 0, total: 0 };
};

// Productos más visitados (del log)
const getProductosMasVisitados = async (limite = 10) => {
  const collection = getLogsCollection();
  return await collection.aggregate([
    { $match: { accion: 'ver_producto' } },
    { $group: { 
      _id: '$productoId', 
      visitas: { $sum: 1 },
      nombreProducto: { $first: '$nombreProducto' }
    }},
    { $sort: { visitas: -1 } },
    { $limit: limite }
  ]).toArray();
};

// Inicializar conexión
connectMongo().catch(console.error);

module.exports = {
  connectMongo,
  getDb,
  getLogsCollection,
  getResenasCollection,
  insertLog,
  getLogs,
  insertResena,
  getResenasByProducto,
  getPromedioCalificaciones,
  getProductosMasVisitados
};
