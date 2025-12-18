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

DROP PROCEDURE IF EXISTS SP_TRANSFERIR_STOCK_EJEMPLO//

CREATE PROCEDURE SP_TRANSFERIR_STOCK_EJEMPLO(
    IN p_producto_id INT,
    IN p_cantidad INT,
    IN p_notas VARCHAR(255)
)
BEGIN
    DECLARE v_stock_actual INT;
    DECLARE v_nombre_producto VARCHAR(150);

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

    -- 1️ Bloquear el producto y obtener stock actual
    SELECT stock, nombre
    INTO v_stock_actual, v_nombre_producto
    FROM PRODUCTO
    WHERE id = p_producto_id
    FOR UPDATE;

    -- 2️ Validar que el producto exista
    IF v_stock_actual IS NULL THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Producto no existe';
    END IF;

    -- 3️ Validar stock suficiente
    IF v_stock_actual < p_cantidad THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Stock insuficiente para la transferencia';
    END IF;

    -- 4️ Simular transferencia (descontar stock)
    UPDATE PRODUCTO
    SET stock = stock - p_cantidad
    WHERE id = p_producto_id;

    -- 5️ Registrar auditoría (uso de tabla existente)
    INSERT INTO AUDITORIA_PEDIDOS (
        pedido_id,
        accion,
        datos_anteriores,
        datos_nuevos,
        usuario,
        fecha_accion
    )
    VALUES (
        NULL,
        'TRANSFERENCIA_STOCK',
        JSON_OBJECT(
            'producto', v_nombre_producto,
            'stock_anterior', v_stock_actual
        ),
        JSON_OBJECT(
            'producto', v_nombre_producto,
            'cantidad_transferida', p_cantidad,
            'notas', p_notas
        ),
        CURRENT_USER(),
        NOW()
    );

    COMMIT;

    SELECT 'Transferencia completada exitosamente' AS mensaje;
END



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

DROP PROCEDURE IF EXISTS SP_CIERRE_CAJA//

CREATE PROCEDURE SP_CIERRE_CAJA(
    IN p_sucursal_id INT,
    IN p_usuario VARCHAR(100),
    IN p_observaciones TEXT
)
BEGIN
    DECLARE v_total_efectivo DECIMAL(10,2) DEFAULT 0;
    DECLARE v_total_tarjeta DECIMAL(10,2) DEFAULT 0;
    DECLARE v_total_sinpe DECIMAL(10,2) DEFAULT 0;
    DECLARE v_total_transferencia DECIMAL(10,2) DEFAULT 0;
    DECLARE v_total_general DECIMAL(10,2) DEFAULT 0;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

    -- 1️⃣ Calcular totales por método de pago del día
    SELECT 
        SUM(CASE WHEN metodo_pago = 'EFECTIVO' THEN monto ELSE 0 END),
        SUM(CASE WHEN metodo_pago = 'TARJETA' THEN monto ELSE 0 END),
        SUM(CASE WHEN metodo_pago = 'SINPE' THEN monto ELSE 0 END),
        SUM(CASE WHEN metodo_pago = 'TRANSFERENCIA' THEN monto ELSE 0 END)
    INTO 
        v_total_efectivo,
        v_total_tarjeta,
        v_total_sinpe,
        v_total_transferencia
    FROM PAGO p
    JOIN PEDIDO pe ON p.pedido_id = pe.id
    WHERE pe.sucursal_id = p_sucursal_id
      AND DATE(pe.fecha_pedido) = CURDATE()
      AND pe.estado != 'CANCELADO';

    -- 2️⃣ Calcular total general
    SET v_total_general = v_total_efectivo + v_total_tarjeta + v_total_sinpe + v_total_transferencia;

    -- 3️⃣ Insertar registro de cierre de caja
    INSERT INTO CIERRE_CAJA (
        sucursal_id,
        fecha,
        total_efectivo,
        total_tarjeta,
        total_sinpe,
        total_transferencia,
        total_general,
        usuario,
        observaciones
    ) VALUES (
        p_sucursal_id,
        NOW(),
        v_total_efectivo,
        v_total_tarjeta,
        v_total_sinpe,
        v_total_transferencia,
        v_total_general,
        p_usuario,
        p_observaciones
    );

    COMMIT;

    SELECT 'Cierre de caja registrado exitosamente' AS mensaje,
           v_total_general AS total_cierre;
END



DELIMITER ;

COMMIT;
