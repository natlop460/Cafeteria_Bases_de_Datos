# Guía Práctica de Trabajo - Proyecto 2
## Cafetería B&B - Base de Datos SQL y NoSQL

---

## Índice

1. [Introducción](#introducción)
2. [Parte 1: Trabajando con MySQL (SQL)](#parte-1-trabajando-con-mysql-sql)
3. [Parte 2: Trabajando con MongoDB (NoSQL)](#parte-2-trabajando-con-mongodb-nosql)
4. [Verificación en el Frontend](#verificación-en-el-frontend)
5. [Comparación SQL vs NoSQL](#comparación-sql-vs-nosql)
6. [Consejos y Mejores Prácticas](#consejos-y-mejores-prácticas)
7. [Solución de Problemas Comunes](#solución-de-problemas-comunes)

---

## Introducción

Esta guía proporciona instrucciones detalladas para completar el Proyecto 2 del curso de Bases de Datos. El proyecto está dividido en dos partes principales:

- **SQL (Fases 1-6):** 90% del proyecto - Base de datos relacional con MySQL
- **NoSQL (Fase 7):** 10% del proyecto - Base de datos documental con MongoDB

### Arquitectura de Base de Datos Híbrida

En aplicaciones reales modernas, es común utilizar ambas tecnologías según las necesidades específicas:

| Característica | MySQL (SQL) | MongoDB (NoSQL) |
|---------------|-------------|-----------------|
| **Estructura** | Tablas con columnas fijas | Documentos JSON flexibles |
| **Uso ideal** | Datos estructurados, transacciones | Logs, eventos, datos variables |
| **Ejemplo** | Pedidos, clientes, productos | Logs de actividad, reseñas |
| **Integridad** | ACID garantizado | Eventual consistency |

---

## Parte 1: Trabajando con MySQL (SQL)

### Herramientas Disponibles

Para trabajar con MySQL se tienen tres opciones disponibles:

#### Opción 1: phpMyAdmin (Recomendado - Interfaz Visual)

**Credenciales de acceso:**
- URL: http://localhost:8080
- Usuario: `root`
- Contraseña: `cafeteria2025`

**Procedimiento para ejecutar código SQL:**

1. **Iniciar los servicios de Docker:**
   ```bash
   docker-compose up -d
   ```

2. **Acceder a phpMyAdmin:**
   - Abrir http://localhost:8080 en el navegador
   - Iniciar sesión con las credenciales proporcionadas

3. **Seleccionar la base de datos:**
   - En el panel izquierdo, hacer clic en `cafeteria_bb`

4. **Ejecutar el código SQL:**
   - Hacer clic en la pestaña **SQL** en la parte superior
   - Copiar y pegar el código SQL correspondiente
   - Para procedimientos, funciones y triggers:
     - Cambiar el delimitador a `//` en el menú desplegable inferior
     - Ejecutar el código
     - Regresar el delimitador a `;`
   - Hacer clic en **Continuar**

5. **Verificar los resultados:**
   - Para vistas: Aparecerán en el panel izquierdo bajo la sección "Vistas"
   - Para procedimientos: Navegar a "Procedimientos" en el panel izquierdo
   - En caso de errores: Se mostrarán en color rojo con una descripción detallada

#### Opción 2: MySQL Workbench (Alternativa para herramientas desktop)

1. Descargar e instalar MySQL Workbench desde https://dev.mysql.com/downloads/workbench/
2. Crear una nueva conexión con los siguientes parámetros:
   - Host: `localhost`
   - Puerto: `3306`
   - Usuario: `root`
   - Contraseña: `cafeteria2025`
3. Ejecutar el código SQL directamente en el editor

#### Opción 3: Terminal/Línea de comandos (Nivel avanzado)

```bash
# Conectarse al contenedor MySQL
docker exec -it cafeteria_mysql mysql -u root -pcafeteria2025 cafeteria_bb

# Ejecutar comandos SQL directamente
# Para salir: exit
```

---

### Flujo de Trabajo para cada Fase SQL

#### **Fase 1: Gestión de Objetos (20%)**
Archivo: `database/procedures/01_gestion_objetos.sql`

**Objetivos:**
1. Crear vista `VW_RESUMEN_VENTAS_MENSUALES` para análisis de ventas
2. Crear vista `VW_PRODUCTOS_BAJO_STOCK` para control de inventario
3. Modificar tabla CLIENTE con `ALTER TABLE` para agregar columna `nivel_cliente`
4. Agregar restricción `CHECK` para validar que el stock sea positivo
5. Demostrar eliminación segura de objetos con `DROP IF EXISTS`

**Metodología de trabajo:**
```sql
-- 1. Abrir el archivo 01_gestion_objetos.sql
-- 2. Localizar las secciones marcadas con TODO
-- 3. Descomentar el código y completar las partes faltantes
-- 4. Copiar el contenido completo del archivo
-- 5. Ejecutarlo en phpMyAdmin (pestaña SQL)
-- 6. Verificar que las vistas aparezcan en el panel izquierdo
```

**Criterios de verificación:**
- Las vistas deben aparecer listadas en phpMyAdmin bajo la sección "Vistas"
- Ejecutar `SELECT * FROM VW_RESUMEN_VENTAS_MENSUALES;` debe retornar resultados
- La columna `nivel_cliente` debe estar visible en la estructura de la tabla CLIENTE

---

#### **Fase 2: Procedimientos Almacenados (20%)**
Archivo: `database/procedures/02_procedimientos.sql`

**Objetivos:**
1. Implementar `SP_CREAR_PEDIDO` para crear pedidos con items y actualizar stock
2. Implementar `SP_PROCESAR_PAGO` para registrar pagos y asignar puntos de fidelidad
3. Implementar `SP_CANCELAR_PEDIDO` para cancelar pedidos y restaurar stock
4. Implementar `SP_REPORTE_VENTAS_PERIODO` para generar reportes analíticos

**Consideración importante sobre delimitadores:**
```sql
-- Antes de ejecutar procedimientos, establecer delimitador:
DELIMITER //

-- Código del procedimiento
CREATE PROCEDURE SP_CREAR_PEDIDO(...)
BEGIN
  -- lógica del procedimiento
END//

-- Restaurar delimitador original:
DELIMITER ;
```

**Configuración en phpMyAdmin:**
- Cambiar el delimitador en el menú desplegable inferior a `//`
- Ejecutar el código
- Cambiar nuevamente a `;`

**Criterios de verificación:**
- Navegar a la pestaña "Procedimientos" en phpMyAdmin
- El procedimiento debe aparecer en la lista
- Probar ejecución con: `CALL SP_CREAR_PEDIDO(...);`

---

#### **Fase 3: Funciones (15%)**
Archivo: `database/procedures/03_funciones.sql`

**Objetivos:**
1. Implementar `FN_CALCULAR_SUBTOTAL` para calcular subtotales con descuentos
2. Implementar `FN_CALCULAR_IMPUESTO` para calcular el IVA (13%)
3. Implementar `FN_OBTENER_CATEGORIA_CLIENTE` para clasificar clientes según puntos
4. Implementar `FN_DIAS_DESDE_ULTIMO_PEDIDO` para calcular inactividad del cliente

**Diferencia conceptual entre funciones y procedimientos:**
- Las funciones retornan un valor único mediante la cláusula `RETURNS`
- Se utilizan dentro de consultas SELECT: `SELECT FN_CALCULAR_IMPUESTO(1000);`
- Los procedimientos se invocan con `CALL` y pueden no retornar valores

**Criterios de verificación:**
```sql
-- Probar función de impuesto:
SELECT FN_CALCULAR_IMPUESTO(1000) AS impuesto;
-- Debe retornar 130.00

-- Probar categorización de cliente:
SELECT FN_OBTENER_CATEGORIA_CLIENTE(1) AS categoria;
-- Debe retornar BRONCE, PLATA, ORO o PLATINO
```

---

#### **Fase 4: Triggers (15%)**
Archivo: `database/procedures/04_triggers.sql`

**Objetivos:**
1. Implementar `TRG_AUDITORIA_PEDIDOS` para auditar INSERT/UPDATE en PEDIDO
2. Implementar `TRG_VALIDAR_STOCK` para prevenir ventas sin inventario disponible
3. Implementar `TRG_CALCULAR_PUNTOS` para asignar puntos automáticamente

**Conceptos fundamentales:**
- Los triggers se ejecutan automáticamente ante eventos específicos
- `BEFORE INSERT` se ejecuta antes de insertar un registro
- `AFTER UPDATE` se ejecuta después de actualizar un registro
- Utilizar `NEW` para acceder a valores nuevos y `OLD` para valores anteriores

**Criterios de verificación:**
```sql
-- 1. Crear el trigger
-- 2. Ejecutar la acción que lo dispara (INSERT, UPDATE, etc.)
-- 3. Verificar que se ejecutó correctamente:
SELECT * FROM AUDITORIA_PEDIDOS ORDER BY fecha_accion DESC LIMIT 5;
```

---

#### **Fase 5: Índices y Optimización (10%)**
Archivo: `database/procedures/05_indices.sql`

**Objetivos:**
1. Crear índice `IDX_PEDIDO_FECHA` para optimizar búsquedas por fecha
2. Crear índice `IDX_CLIENTE_EMAIL` para optimizar búsqueda de clientes
3. Crear índice compuesto para optimizar operaciones JOIN
4. Documentar la justificación de cada índice

**Importancia de los índices:**
- Aceleran consultas que utilizan `WHERE`, `JOIN` y `ORDER BY`
- Funcionan como un índice de libro, permitiendo acceso rápido sin lectura secuencial

**Criterios de verificación:**
```sql
-- Visualizar índices creados:
SHOW INDEX FROM PEDIDO;
SHOW INDEX FROM CLIENTE;

-- Analizar mejora de rendimiento:
EXPLAIN SELECT * FROM PEDIDO WHERE fecha_pedido BETWEEN '2024-01-01' AND '2024-12-31';
-- La columna "key" debe mostrar que utiliza el índice creado
```

---

#### **Fase 6: Transacciones y ACID (10%)**
Archivo: `database/procedures/06_transacciones.sql`

**Objetivos:**
1. Implementar transacción para transferencia de stock entre sucursales
2. Implementar transacción para cierre de caja
3. Implementar manejo de errores con `ROLLBACK`
4. Documentar las propiedades ACID en el código

**Propiedades ACID:**
- **Atomicidad:** Todas las operaciones se ejecutan o ninguna
- **Consistencia:** La base de datos pasa de un estado válido a otro estado válido
- **Aislamiento:** Las transacciones concurrentes no interfieren entre sí
- **Durabilidad:** Los cambios confirmados persisten permanentemente

**Estructura básica de una transacción:**
```sql
START TRANSACTION;
  -- Operaciones de la transacción
  -- En caso de error: ROLLBACK
COMMIT;
```

**Criterios de verificación:**
- Verificar que ante un error, ningún cambio se persista (ROLLBACK funciona)
- Confirmar que todas las operaciones se completen atómicamente

---

## Parte 2: Trabajando con MongoDB (NoSQL)

### Herramientas Disponibles

#### Opción 1: Mongo Express (Recomendado - Interfaz Visual)

**Credenciales de acceso:**
- URL: http://localhost:8081
- Usuario: `admin`
- Contraseña: `admin123`

**Procedimiento para ejecutar código MongoDB:**

1. **Iniciar los servicios de Docker:**
   ```bash
   docker-compose up -d
   ```

2. **Acceder a Mongo Express:**
   - Abrir http://localhost:8081 en el navegador
   - Iniciar sesión con las credenciales proporcionadas

3. **Seleccionar la base de datos:**
   - Hacer clic en `cafeteria_nosql`
   - Se visualizarán dos colecciones: `activity_logs` y `resenas_productos`

4. **Ejecutar comandos:**
   - Hacer clic en cualquier colección (por ejemplo, `activity_logs`)
   - Seleccionar la pestaña **"Execute"** en la parte superior
   - Copiar y pegar el código JavaScript
   - Hacer clic en **"Execute"**
   - Los resultados se mostrarán inmediatamente

5. **Visualizar documentos:**
   - Hacer clic en la colección deseada
   - Seleccionar la pestaña **"View"**
   - Se mostrarán todos los documentos JSON insertados
   - Es posible editar, eliminar o agregar documentos desde esta interfaz

**Nota importante:** Se recomienda ejecutar cada ejercicio por separado, no todo el archivo completo de una sola vez.

#### Opción 2: Terminal mongosh (Nivel avanzado)

```bash
# Conectarse al contenedor MongoDB
docker exec -it cafeteria_mongodb mongosh

# Autenticarse
use admin
db.auth('admin', 'admin123')

# Cambiar a la base de datos del proyecto
use cafeteria_nosql

# Ejecutar comandos MongoDB
db.activity_logs.find()
```

---

### Flujo de Trabajo para Fase 7 (NoSQL)

#### **Fase 7: MongoDB (10%)**
Archivo: `database/procedures/07_nosql_mongodb.js`

##### **Ejercicio 7.1 - Insertar Logs de Actividad (3 puntos)**

Insertar al menos 5 documentos de logs con diferentes tipos de acciones.

**Ejemplo de estructura:**

```javascript
db.activity_logs.insertMany([
  {
    accion: "login",
    usuario: "jperez@email.com",
    timestamp: new Date(),
    detalles: { ip: "192.168.1.50", dispositivo: "Chrome/MacOS", exitoso: true }
  },
  {
    accion: "ver_producto",
    usuario: "mgarcia@email.com",
    productoId: 3,
    nombreProducto: "Cappuccino",
    timestamp: new Date(),
    detalles: { desde: "menu", tiempo_vista: 45 }
  }
  // Agregar al menos 3 documentos adicionales con diferentes acciones
]);
```

**Tipos de acciones sugeridas:**
- `login`, `logout`
- `ver_producto`, `buscar_producto`
- `crear_pedido`, `cancelar_pedido`
- `actualizar_perfil`

**Criterios de verificación:**
- En Mongo Express, navegar a `activity_logs` y seleccionar la pestaña View
- Deben visualizarse los 5 o más logs insertados

---

##### **Ejercicio 7.2 - Insertar Reseñas de Productos (3 puntos)**

Insertar al menos 5 reseñas para diferentes productos.

**Ejemplo de estructura:**

```javascript
db.resenas_productos.insertMany([
  {
    productoId: 1,
    nombreProducto: "Espresso",
    clienteId: 2,
    nombreCliente: "María García",
    calificacion: 5,
    comentario: "Excelente café, muy aromático y bien preparado.",
    fecha: new Date(),
    verificado: true,
    util: 8
  }
  // Agregar al menos 4 reseñas adicionales para diferentes productos
]);
```

**Criterios de verificación:**
- En Mongo Express, navegar a `resenas_productos` y seleccionar la pestaña View
- Deben visualizarse las 5 o más reseñas insertadas

---

##### **Ejercicio 7.3 - Consultas de Agregación (4 puntos)**

**7.3a - Promedio de calificaciones por producto (1 punto):**

```javascript
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
```

**Explicación del pipeline:**
- `$group`: Agrupa documentos por `productoId` (equivalente a `GROUP BY` en SQL)
- `$avg`: Calcula el promedio de la calificación
- `$sum: 1`: Cuenta el número de documentos (equivalente a `COUNT(*)`)
- `$sort`: Ordena los resultados por promedio en orden descendente

---

**7.3b - Productos más visitados (1 punto):**

```javascript
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
```

**Explicación del pipeline:**
- `$match`: Filtra únicamente logs con acción "ver_producto" (equivalente a `WHERE` en SQL)
- `$group`: Agrupa y cuenta visitas por producto
- `$limit`: Limita los resultados a los 10 productos más visitados

---

**7.3c - Acciones por tipo (1 punto):**

```javascript
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
```

**Explicación del pipeline:**
- Agrupa logs por tipo de acción
- Cuenta la cantidad de ocurrencias de cada tipo
- Ordena por cantidad en orden descendente

---

**7.3d - Usuarios más activos (1 punto):**

```javascript
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
```

**Explicación del pipeline:**
- `$ne`: Operador "not equal" para excluir usuarios anónimos
- `$addToSet`: Crea un array de acciones únicas sin duplicados
- Limita los resultados a los 5 usuarios más activos

---

##### **Ejercicio 7.4 - Crear Índices (2 puntos)**

```javascript
// Índice en timestamp (descendente) para consultas de logs recientes
db.activity_logs.createIndex({ timestamp: -1 });

// Índice en acción para filtrado por tipo
db.activity_logs.createIndex({ accion: 1 });

// Índice en productoId para búsquedas de reseñas
db.resenas_productos.createIndex({ productoId: 1 });

// Índice en calificación para ordenamiento
db.resenas_productos.createIndex({ calificacion: -1 });
```

**Criterios de verificación:**
```javascript
// Visualizar índices creados
db.activity_logs.getIndexes()
db.resenas_productos.getIndexes()
```

---

## Verificación en el Frontend

### Procedimiento para probar la integración completa

**1. Iniciar el sistema:**
```bash
docker-compose up -d
```

**2. Acceder al frontend:**
- URL: http://localhost:3000
- El Dashboard se abre automáticamente

**3. Verificación por fase:**

#### Fase 1 (Vistas):
- Dashboard: Verificar visualización del resumen de ventas mensuales
- Admin: Verificar lista de productos bajo stock

#### Fase 2 (Procedimientos):
- Pedidos: Crear nuevo pedido (utiliza `SP_CREAR_PEDIDO`)
- Pedidos: Procesar pago (utiliza `SP_PROCESAR_PAGO`)
- Pedidos: Cancelar pedido (utiliza `SP_CANCELAR_PEDIDO`)

#### Fase 3 (Funciones):
- Al crear un pedido, verificar que subtotales e impuestos se calculen correctamente
- En la sección Clientes, verificar que las categorías por puntos se muestren correctamente

#### Fase 4 (Triggers):
- Crear un pedido y verificar que el stock se actualice automáticamente
- Intentar vender un producto sin stock suficiente y verificar que se genere un error
- Marcar un pedido como entregado y verificar que se asignen puntos automáticamente

#### Fase 7 (MongoDB):
- Sección Logs: Verificar que se muestren todos los logs de actividad insertados
- Sección Reseñas: Verificar que se visualicen las reseñas de productos
- Los gráficos y estadísticas deben utilizar las agregaciones implementadas

---

## Comparación SQL vs NoSQL

### Equivalencia de Sintaxis

| Operación | SQL (MySQL) | NoSQL (MongoDB) |
|-----------|-------------|-----------------|
| **Crear estructura** | `CREATE TABLE productos (...)` | `db.createCollection('productos')` |
| **Insertar uno** | `INSERT INTO productos VALUES (...)` | `db.productos.insertOne({...})` |
| **Insertar varios** | `INSERT INTO productos VALUES (...), (...)` | `db.productos.insertMany([{...}, {...}])` |
| **Consultar todos** | `SELECT * FROM productos` | `db.productos.find()` |
| **Consultar con filtro** | `SELECT * FROM productos WHERE precio > 1000` | `db.productos.find({ precio: { $gt: 1000 } })` |
| **Actualizar** | `UPDATE productos SET precio = 1500 WHERE id = 1` | `db.productos.updateOne({ _id: 1 }, { $set: { precio: 1500 } })` |
| **Eliminar** | `DELETE FROM productos WHERE id = 1` | `db.productos.deleteOne({ _id: 1 })` |
| **Contar** | `SELECT COUNT(*) FROM productos` | `db.productos.countDocuments()` |
| **Agrupar** | `SELECT categoria, COUNT(*) FROM productos GROUP BY categoria` | `db.productos.aggregate([{ $group: { _id: "$categoria", total: { $sum: 1 } } }])` |
| **Ordenar** | `SELECT * FROM productos ORDER BY precio DESC` | `db.productos.find().sort({ precio: -1 })` |
| **Limitar** | `SELECT * FROM productos LIMIT 10` | `db.productos.find().limit(10)` |

### Operadores de Comparación en MongoDB

| SQL | MongoDB | Descripción |
|-----|---------|-------------|
| `=` | `{ campo: valor }` | Igualdad |
| `>` | `{ campo: { $gt: valor } }` | Mayor que |
| `>=` | `{ campo: { $gte: valor } }` | Mayor o igual que |
| `<` | `{ campo: { $lt: valor } }` | Menor que |
| `<=` | `{ campo: { $lte: valor } }` | Menor o igual que |
| `!=` | `{ campo: { $ne: valor } }` | Diferente de |
| `IN` | `{ campo: { $in: [v1, v2] } }` | En lista de valores |
| `NOT IN` | `{ campo: { $nin: [v1, v2] } }` | No en lista de valores |
| `AND` | `{ $and: [{...}, {...}] }` | Conjunción lógica |
| `OR` | `{ $or: [{...}, {...}] }` | Disyunción lógica |
| `LIKE '%texto%'` | `{ campo: /texto/i }` | Contiene texto (expresión regular) |

---

## Consejos y Mejores Prácticas

### Para SQL:

1. **Transacciones:** Utilizar siempre transacciones para operaciones que modifiquen múltiples tablas
2. **Validación de datos:** Validar datos antes de insertar, ya sea mediante triggers o procedimientos
3. **Índices estratégicos:** Crear índices en columnas utilizadas frecuentemente en cláusulas `WHERE` y `JOIN`
4. **Convenciones de nomenclatura:** Utilizar prefijos descriptivos como `SP_` para procedimientos, `FN_` para funciones, `TRG_` para triggers
5. **Documentación:** Comentar el código para explicar la lógica compleja
6. **Pruebas con datos reales:** Probar exhaustivamente con datos reales antes de considerar completa una implementación

### Para MongoDB:

1. **Ejecución incremental:** Ejecutar cada sección del código por separado en Mongo Express, no todo el archivo completo
2. **Verificación inmediata:** Verificar los resultados después de cada operación
3. **Timestamps:** Utilizar `new Date()` para timestamps, no cadenas de texto
4. **Aprovechamiento de flexibilidad:** Utilizar arrays y objetos embebidos para aprovechar la flexibilidad de MongoDB
5. **Optimización:** Los índices también son importantes en MongoDB para el rendimiento

### Generales:

1. Trabajar en orden secuencial (Fase 1, 2, 3, etc.) ya que algunas fases dependen de las anteriores
2. Guardar el trabajo frecuentemente
3. Probar en el frontend para verificar la integración completa
4. Leer cuidadosamente los comentarios en los archivos, ya que contienen información útil
5. En caso de problemas, revisar los logs de Docker: `docker-compose logs -f`

---

## Solución de Problemas Comunes

### Problemas con Docker

**Error: "Cannot connect to Docker daemon"**
```bash
# Solución: Iniciar Docker Desktop
# Verificar que el ícono de Docker esté activo en la barra de tareas/sistema
```

**Error: "Port already in use"**
```bash
# Solución: Detener contenedores existentes
docker-compose down

# Si el problema persiste, identificar el proceso que utiliza el puerto:
# Windows:
netstat -ano | findstr :3306

# Mac/Linux:
lsof -i :3306

# Detener el proceso si es necesario
```

**Error: "No space left on device"**
```bash
# Solución: Limpiar recursos de Docker
docker system prune -a --volumes
# ADVERTENCIA: Este comando elimina todos los datos. Realizar respaldo previo.
```

---

### Problemas con MySQL

**Error: "Syntax error near DELIMITER"**
```sql
-- Solución: Configurar el delimitador en phpMyAdmin:
-- 1. Localizar el menú desplegable debajo del área de texto
-- 2. Cambiar el delimitador de ; a //
-- 3. Ejecutar el código
-- 4. Cambiar el delimitador nuevamente a ;
```

**Error: "Table doesn't exist"**
```bash
# Solución: Verificar que el schema se haya cargado correctamente
docker-compose logs mysql | grep "schema.sql"

# Si no se cargó, reiniciar con eliminación de volúmenes:
docker-compose down -v
docker-compose up --build
```

**Error: "Cannot add foreign key constraint"**
```sql
-- Solución: Verificar los siguientes aspectos:
-- 1. La tabla referenciada debe existir
-- 2. La columna referenciada debe existir
-- 3. Los tipos de datos deben coincidir exactamente
-- 4. La columna referenciada debe ser PRIMARY KEY o tener restricción UNIQUE
```

**Error: "Procedure already exists"**
```sql
-- Solución: Eliminar el procedimiento antes de crearlo nuevamente
DROP PROCEDURE IF EXISTS SP_CREAR_PEDIDO;
-- Posteriormente crear el procedimiento
```

---

### Problemas con MongoDB

**Error: "Authentication failed"**
```javascript
// Solución: Verificar las credenciales en Mongo Express
// Usuario: admin
// Contraseña: admin123

// Si se utiliza mongosh:
use admin
db.auth('admin', 'admin123')
```

**Error: "Collection doesn't exist"**
```javascript
// Solución: Las colecciones se crean automáticamente al insertar documentos
// Si se desea crear explícitamente:
db.createCollection('activity_logs')
```

**Error: "Invalid JSON"**
```javascript
// Problema común: Uso incorrecto de comillas en JSON
// Incorrecto:
{ 'nombre': 'Juan' }

// Correcto en JSON estándar:
{ "nombre": "Juan" }

// En MongoDB shell, se pueden omitir las comillas:
{ nombre: "Juan" }
```

**Error en pipeline de agregación**
```javascript
// Solución: Verificar los siguientes aspectos:
// 1. Los stages deben estar en el orden correcto
// 2. Los nombres de campos deben tener $ cuando son referencias: "$productoId"
// 3. Los operadores deben tener $ cuando son operadores: $avg, $sum, $group
```

---

### Problemas con el Frontend

**Error: "Cannot connect to backend"**
```bash
# Solución 1: Esperar tiempo adicional
# El backend puede tardar entre 30 y 60 segundos en inicializarse

# Solución 2: Verificar que el backend esté en ejecución
docker-compose ps

# Solución 3: Reiniciar el servicio backend
docker-compose restart backend

# Visualizar logs del backend para identificar errores:
docker-compose logs -f backend
```

**Problema: "Los cambios SQL no se reflejan en el frontend"**
```bash
# Nota importante: Los archivos SQL NO se ejecutan automáticamente
# Es necesario ejecutarlos manualmente en phpMyAdmin

# Los únicos archivos que se ejecutan automáticamente son los especificados
# en docker-compose.yml bajo volumes de MySQL
# (y únicamente durante la primera creación del contenedor)
```

**Problema: "Los cambios MongoDB no se reflejan"**
```bash
# Solución: Verificar que los datos se hayan insertado correctamente
# 1. Acceder a Mongo Express y navegar a View
# 2. Si los datos están presentes pero no aparecen en el frontend, recargar la página (F5)
# 3. Si no están en Mongo Express, ejecutar nuevamente la operación de inserción
```

---

### Problemas de Rendimiento

**Problema: "Las consultas son muy lentas"**
```sql
-- Solución: Verificar la existencia de índices
SHOW INDEX FROM PEDIDO;

-- Analizar el plan de ejecución de la consulta:
EXPLAIN SELECT * FROM PEDIDO WHERE fecha_pedido > '2024-01-01';

-- Si no utiliza índice, crear uno apropiado:
CREATE INDEX IDX_PEDIDO_FECHA ON PEDIDO(fecha_pedido);
```

**Problema: "Docker consume mucha memoria RAM"**
```bash
# Solución: Ajustar los recursos asignados en Docker Desktop
# Settings → Resources → Memory
# Asignar al menos 4GB pero no exceder la RAM disponible del sistema

# Alternativa: Detener servicios no utilizados temporalmente:
docker-compose stop frontend  # Si solo se está trabajando con bases de datos
```

---

## Recursos Adicionales

### Documentación Oficial

- **MySQL:** https://dev.mysql.com/doc/
- **MongoDB:** https://docs.mongodb.com/
- **Docker:** https://docs.docker.com/

### Referencias Rápidas

- **SQL Cheat Sheet:** https://www.sqltutorial.org/sql-cheat-sheet/
- **MongoDB Cheat Sheet:** https://www.mongodb.com/developer/products/mongodb/cheat-sheet/

### Tutoriales Recomendados

- **MySQL Procedures & Functions:** https://www.mysqltutorial.org/mysql-stored-procedure/
- **MongoDB Aggregation Framework:** https://docs.mongodb.com/manual/aggregation/


---

## Soporte

**Antes de realizar una consulta:**
1. Revisar esta guía completa, la especificación del proyecto 2, la documentación oficial de cada aplicación o el archivo README
2. Consultar la sección de "Solución de Problemas Comunes"
3. Revisar los logs de Docker: `docker-compose logs -f`
4. Consultar con compañeros del curso

**Al reportar un problema, incluir:**
- Descripción clara y detallada del error
- Mensaje de error completo (captura de pantalla si es posible)
- Archivo que se estaba modificando
- Pasos exactos seguidos antes de encontrar el error
- Logs relevantes de Docker

---

## Conclusión

Este proyecto integra conceptos fundamentales de bases de datos relacionales y no relacionales, reflejando prácticas utilizadas en aplicaciones empresariales modernas. Se recomienda:

- Comenzar con anticipación suficiente
- Trabajar progresivamente fase por fase
- Probar constantemente durante el desarrollo
- Solicitar ayuda cuando sea necesario

---

*Versión del documento: 1.0*
