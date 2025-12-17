const mysql = require('mysql2/promise');

// Pool de conexiones a MySQL con configuración UTF-8 correcta
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'cafeteria_user',
  password: process.env.DB_PASSWORD || 'cafeteria_pass',
  database: process.env.DB_NAME || 'cafeteria_bb',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4',
  timezone: 'Z'
});

// Configurar UTF-8 al obtener conexión
pool.on('connection', (connection) => {
  connection.query("SET NAMES 'utf8mb4' COLLATE 'utf8mb4_unicode_ci'");
});

// Función para ejecutar queries
const executeQuery = async (sql, params = []) => {
  try {
    const [rows] = await pool.execute(sql, params);
    return rows;
  } catch (error) {
    console.error('Error ejecutando query:', error);
    throw error;
  }
};

// Función para ejecutar procedimientos almacenados
const callProcedure = async (procedureName, params = []) => {
  try {
    const placeholders = params.map(() => '?').join(', ');
    const sql = `CALL ${procedureName}(${placeholders})`;
    const [rows] = await pool.execute(sql, params);
    return rows;
  } catch (error) {
    console.error(`Error ejecutando procedimiento ${procedureName}:`, error);
    throw error;
  }
};

// Función para ejecutar funciones
const callFunction = async (functionName, params = []) => {
  try {
    const placeholders = params.map(() => '?').join(', ');
    const sql = `SELECT ${functionName}(${placeholders}) AS resultado`;
    const [rows] = await pool.execute(sql, params);
    return rows[0]?.resultado;
  } catch (error) {
    console.error(`Error ejecutando función ${functionName}:`, error);
    throw error;
  }
};

// Función para transacciones
const executeTransaction = async (queries) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    const results = [];
    for (const { sql, params } of queries) {
      const [rows] = await connection.execute(sql, params || []);
      results.push(rows);
    }
    
    await connection.commit();
    return results;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

module.exports = {
  pool,
  executeQuery,
  callProcedure,
  callFunction,
  executeTransaction
};
