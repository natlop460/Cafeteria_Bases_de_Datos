-- =====================================================
-- FASE 5: ÍNDICES Y OPTIMIZACIÓN (10%)
-- Archivo: 05_indices.sql
-- Cafetería B&B - Proyecto 2
-- =====================================================
-- INSTRUCCIONES PARA EL ESTUDIANTE:
-- Cree los índices solicitados
-- =====================================================

USE cafeteria_bb;

-- =====================================================
-- EJERCICIO 5.1: IDX_PEDIDO_FECHA (3 puntos)
-- 
-- Cree un índice en la columna fecha_pedido de la tabla PEDIDO
-- 
-- Sintaxis: CREATE INDEX nombre_indice ON tabla (columna);
-- =====================================================

CREATE INDEX IDX_PEDIDO_FECHA
ON PEDIDO (fecha_pedido);



-- =====================================================
-- EJERCICIO 5.2: IDX_PEDIDO_ESTADO_FECHA (3 puntos)
-- 
-- Cree un índice COMPUESTO en las columnas estado y fecha_pedido
-- El orden importa: primero estado, luego fecha_pedido
-- 
-- Sintaxis: CREATE INDEX nombre ON tabla (columna1, columna2);
-- =====================================================

CREATE INDEX IDX_PEDIDO_ESTADO_FECHA
ON PEDIDO (estado, fecha_pedido);



-- =====================================================
-- EJERCICIO 5.3: IDX_ITEM_PEDIDO_PRODUCTO (4 puntos)
-- 
-- Cree un índice compuesto en ITEM_PEDIDO para optimizar
-- JOINs entre items y productos
-- Columnas: pedido_id, producto_id
-- =====================================================

CREATE INDEX IDX_ITEM_PEDIDO_PRODUCTO
ON ITEM_PEDIDO (pedido_id, producto_id);





-- =====================================================
-- DOCUMENTACIÓN DE REFERENCIA (NO MODIFICAR)
-- =====================================================

-- Comandos útiles para verificar índices:

-- Ver todos los índices de una tabla:
-- SHOW INDEX FROM PEDIDO;

-- Ver el plan de ejecución de una consulta:
-- EXPLAIN SELECT * FROM PEDIDO WHERE fecha_pedido > '2025-01-01';

-- Ver estadísticas de uso de índices:
-- SHOW STATUS LIKE 'Handler_read%';

COMMIT;
