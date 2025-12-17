-- =====================================================
-- FASE 1: GESTIÓN DE OBJETOS DE BASE DE DATOS (20%)
-- Archivo: 01_gestion_objetos.sql
-- Cafetería B&B - Proyecto 2
-- =====================================================
-- INSTRUCCIONES PARA EL ESTUDIANTE:
-- Complete las secciones marcadas con TODO
-- Cada sección tiene comentarios explicativos
-- Pruebe cada objeto creado antes de continuar
-- =====================================================

USE cafeteria_bb;

-- =====================================================
-- EJERCICIO 1.1: VISTA VW_RESUMEN_VENTAS_MENSUALES (5 puntos)
-- 
-- Cree una vista que muestre el resumen de ventas agrupado
-- por año y mes. La vista debe incluir:
-- - anio: Año del pedido (usar YEAR())
-- - mes: Número del mes (usar MONTH())
-- - nombre_mes: Nombre del mes (usar MONTHNAME())
-- - cantidad_pedidos: Total de pedidos del mes
-- - monto_total: Suma de todos los totales
-- - ticket_promedio: Promedio por pedido (redondeado a 2 decimales)
-- - subtotal_total: Suma de subtotales
-- - impuestos_total: Suma de impuestos
--
-- IMPORTANTE: 
-- - Filtrar solo pedidos que NO estén cancelados
-- - Agrupar por año y mes
-- - Ordenar por año y mes descendente
-- =====================================================

-- TODO: Complete la vista descomentando y completando el código
-- CREATE OR REPLACE VIEW VW_RESUMEN_VENTAS_MENSUALES AS
-- SELECT
--     TODO: Extraer el año de fecha_pedido
--     TODO: Extraer el mes de fecha_pedido
--     TODO: Obtener nombre del mes
--     TODO: Contar cantidad de pedidos
--     TODO: Sumar total de ventas
--     TODO: Calcular promedio por pedido (usar ROUND)
--     TODO: Sumar subtotales
--     TODO: Sumar impuestos
-- FROM PEDIDO p
-- WHERE p.estado != 'CANCELADO'
-- GROUP BY YEAR(p.fecha_pedido), MONTH(p.fecha_pedido), MONTHNAME(p.fecha_pedido)
-- ORDER BY anio DESC, mes DESC;


-- =====================================================
-- EJERCICIO 1.2: VISTA VW_PRODUCTOS_BAJO_STOCK (5 puntos)
-- 
-- Cree una vista que muestre productos con stock bajo.
-- La vista debe incluir:
-- - id, sku, nombre del producto
-- - stock_actual: stock actual del producto
-- - stock_minimo: stock mínimo configurado
-- - unidades_faltantes: cuántas unidades faltan (stock_minimo - stock)
-- - categoria: nombre de la categoría (usar JOIN)
-- - nivel_urgencia: clasificación según el nivel de stock
--   * 'AGOTADO' si stock = 0
--   * 'CRÍTICO' si stock <= stock_minimo * 0.5
--   * 'BAJO' en cualquier otro caso
--
-- IMPORTANTE:
-- - Solo mostrar productos activos
-- - Solo mostrar productos donde stock <= stock_minimo
-- - Ordenar por nivel de urgencia y unidades faltantes
-- =====================================================

-- TODO: Complete la vista descomentando y completando el código
-- CREATE OR REPLACE VIEW VW_PRODUCTOS_BAJO_STOCK AS
-- SELECT
--     p.id,
--     p.sku,
--     p.nombre,
--     TODO: Agregar stock_actual (el campo stock de PRODUCTO)
--     TODO: Agregar stock_minimo
--     TODO: Calcular unidades_faltantes = stock_minimo - stock
--     TODO: Agregar c.nombre AS categoria
--     CASE
--         TODO: Implementar lógica de nivel_urgencia
--         WHEN p.stock = 0 THEN 'AGOTADO'
--         WHEN p.stock <= p.stock_minimo * 0.5 THEN 'CRÍTICO'
--         ELSE 'BAJO'
--     END AS nivel_urgencia
-- FROM PRODUCTO p
-- LEFT JOIN CATEGORIA c ON p.categoria_id = c.id
-- WHERE p.stock <= p.stock_minimo AND p.activo = 1
-- ORDER BY nivel_urgencia DESC, unidades_faltantes DESC;


-- =====================================================
-- EJERCICIO 1.3: ALTER TABLE - Agregar columna (3 puntos)
-- 
-- Agregue una nueva columna 'nivel_cliente' a la tabla CLIENTE
-- 
-- En Clientes.js:99, la columna de "Categoría" muestra un badge 
-- con categorías calculadas dinámicamente en el frontend 
-- basándose en los puntos de fidelidad
--
-- Esta categoría se calcula cada vez en tiempo real pero 
-- no se almacena en la base de datos
-- - Tipo: VARCHAR(20)
-- - Valor por defecto: 'BRONCE'
-- =====================================================

-- TODO: Escriba el ALTER TABLE para agregar la columna
-- Sintaxis: ALTER TABLE nombre_tabla ADD COLUMN nombre_columna TIPO DEFAULT valor;



-- =====================================================
-- EJERCICIO 1.4: CONSTRAINT CHECK (3 puntos)
-- 
-- Agregue una restricción CHECK a la tabla PRODUCTO
-- para asegurar que el stock nunca sea negativo
-- Nombre sugerido: CK_PRODUCTO_STOCK_POSITIVO
-- =====================================================

-- TODO: Escriba el ALTER TABLE para agregar el CHECK constraint
-- Sintaxis: ALTER TABLE nombre_tabla ADD CONSTRAINT nombre_constraint CHECK (condicion);



-- =====================================================
-- EJERCICIO 1.5: ELIMINACIÓN SEGURA (4 puntos)
-- 
-- Demuestre cómo eliminar objetos de forma segura:
-- 1. Primero cree una tabla temporal TEMP_PRODUCTOS_OBSOLETOS
--    con columnas: id (INT, PK, AUTO_INCREMENT), producto_id (INT), 
--    fecha_marcado (DATETIME DEFAULT CURRENT_TIMESTAMP), motivo (VARCHAR(255))
-- 2. Cree una vista VW_OBSOLETA_DEMO que seleccione de CATEGORIA
--    donde activo = 0
-- 3. Elimine ambos objetos de forma segura usando IF EXISTS
-- =====================================================

-- TODO: Crear tabla temporal



-- TODO: Crear vista de demostración



-- TODO: Eliminar vista de forma segura (DROP VIEW IF EXISTS ...)



-- TODO: Eliminar tabla de forma segura (DROP TABLE IF EXISTS ...)



-- =====================================================
-- EJERCICIO EXTRA: VISTA VW_CLIENTES_ESTADISTICAS (+5 puntos extra)
-- 
-- Cree una vista avanzada que muestre estadísticas por cliente:
-- - id, nombre, email, puntos_fidelidad
-- - total_pedidos: cantidad de pedidos realizados
-- - total_gastado: suma de todos sus pedidos (usar COALESCE para NULL)
-- - promedio_pedido: promedio por pedido
-- - ultimo_pedido: fecha del último pedido (usar MAX)
-- - dias_sin_pedido: días desde el último pedido (usar DATEDIFF)
-- - categoria_cliente: PLATINO (500+), ORO (300-499), 
--                      PLATA (100-299), BRONCE (<100) basado en puntos
--
-- IMPORTANTE: 
-- - Usar LEFT JOIN para incluir clientes sin pedidos
-- - Filtrar solo clientes activos
-- - Excluir pedidos cancelados del cálculo
-- =====================================================

-- TODO (OPCIONAL): Complete la vista para puntos extra
-- CREATE OR REPLACE VIEW VW_CLIENTES_ESTADISTICAS AS
-- SELECT 
--     c.id,
--     c.nombre,
--     c.email,
--     c.puntos_fidelidad,
--     COUNT(p.id) AS total_pedidos,
--     COALESCE(SUM(p.total), 0) AS total_gastado,
--     ... continuar ...
-- FROM CLIENTE c
-- LEFT JOIN PEDIDO p ON c.id = p.cliente_id AND p.estado != 'CANCELADO'
-- WHERE c.activo = 1
-- GROUP BY c.id, c.nombre, c.email, c.puntos_fidelidad;


COMMIT;
