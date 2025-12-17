-- =====================================================
-- FASE 6: TRANSACCIONES Y CONTROL DE CONCURRENCIA (10%)
-- Archivo: 06_transacciones.sql
-- Cafetería B&B - Proyecto 2
-- =====================================================
-- INSTRUCCIONES PARA EL ESTUDIANTE:
-- Complete los procedimientos con transacciones
-- =====================================================

USE cafeteria_bb;

DELIMITER //

-- =====================================================
-- EJERCICIO 6.1: SP_TRANSFERIR_STOCK_EJEMPLO (5 puntos)
--
-- Demuestre el uso de transacciones creando un procedimiento
-- que simula una transferencia de stock
--
-- Debe incluir:
-- 1. START TRANSACTION
-- 2. Handler para ROLLBACK en caso de error
-- 3. Validaciones con SIGNAL
-- 4. SELECT ... FOR UPDATE para bloquear registros
-- 5. COMMIT al final
-- =====================================================

-- TODO: Descomente y complete el procedimiento
-- DROP PROCEDURE IF EXISTS SP_TRANSFERIR_STOCK_EJEMPLO//
--
-- CREATE PROCEDURE SP_TRANSFERIR_STOCK_EJEMPLO(
--     IN p_producto_id INT,
--     IN p_cantidad INT,
--     IN p_notas VARCHAR(255)
-- )
-- BEGIN
--     DECLARE v_stock_actual INT;
--     DECLARE v_nombre_producto VARCHAR(150);
--
--     DECLARE EXIT HANDLER FOR SQLEXCEPTION
--     BEGIN
--         ROLLBACK;
--         RESIGNAL;
--     END;
--
--     START TRANSACTION;
--
--     -- TODO: Obtener stock con SELECT ... FOR UPDATE
--
--     -- TODO: Validar producto y stock
--
--     -- TODO: Registrar en auditoría
--
--     COMMIT;
--
--     SELECT 'Transferencia completada exitosamente' AS mensaje;
-- END//


-- =====================================================
-- EJERCICIO 6.2: SP_CIERRE_CAJA (5 puntos)
--
-- Crea un cierre de caja diario para una sucursal
-- usando transacción para garantizar atomicidad
--
-- Debe:
-- 1. Calcular totales por método de pago del día
-- 2. Insertar registro en CIERRE_CAJA
-- 3. Todo dentro de una transacción
-- =====================================================

-- TODO: Descomente y complete el procedimiento
-- DROP PROCEDURE IF EXISTS SP_CIERRE_CAJA//
--
-- CREATE PROCEDURE SP_CIERRE_CAJA(
--     IN p_sucursal_id INT,
--     IN p_usuario VARCHAR(100),
--     IN p_observaciones TEXT
-- )
-- BEGIN
--     DECLARE v_total_efectivo DECIMAL(10,2) DEFAULT 0;
--     DECLARE v_total_tarjeta DECIMAL(10,2) DEFAULT 0;
--     DECLARE v_total_general DECIMAL(10,2) DEFAULT 0;
--
--     DECLARE EXIT HANDLER FOR SQLEXCEPTION
--     BEGIN
--         ROLLBACK;
--         RESIGNAL;
--     END;
--
--     START TRANSACTION;
--
--     -- TODO: Calcular totales por método de pago
--
--     -- TODO: Insertar en CIERRE_CAJA
--
--     COMMIT;
-- END//


DELIMITER ;

COMMIT;
