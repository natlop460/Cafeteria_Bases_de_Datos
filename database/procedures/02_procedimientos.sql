-- =====================================================
-- FASE 2: PROCEDIMIENTOS ALMACENADOS (20%)
-- Archivo: 02_procedimientos.sql
-- Cafetería B&B - Proyecto 2
-- =====================================================
-- INSTRUCCIONES PARA EL ESTUDIANTE:
-- Complete los procedimientos almacenados marcados con TODO
-- Cada procedimiento tiene la estructura básica proporcionada
-- Debe implementar la lógica interna
-- =====================================================

USE cafeteria_bb;

DELIMITER //

-- =====================================================
-- EJERCICIO 2.1: SP_CREAR_PEDIDO (8 puntos)
-- 
-- Crea un nuevo pedido con sus items, actualiza stock
-- y calcula totales usando transacciones
-- 
-- Parámetros de entrada:
-- - p_cliente_id: ID del cliente
-- - p_sucursal_id: ID de la sucursal  
-- - p_canal_venta: Canal de venta (MOSTRADOR, PICKUP, DELIVERY)
-- - p_items_json: JSON con los items del pedido
--   Formato: [{"producto_id": 1, "cantidad": 2}, ...]
-- - p_direccion_entrega: Dirección para delivery (puede ser NULL)
--
-- El procedimiento debe:
-- 1. Validar que el cliente existe y está activo
-- 2. Validar que la sucursal existe y está activa
-- 3. Crear el pedido con estado 'PENDIENTE'
-- 4. Procesar cada item del JSON:
--    - Validar stock disponible
--    - Obtener precio del producto
--    - Insertar en ITEM_PEDIDO
--    - Actualizar stock del producto
-- 5. Calcular subtotal, impuesto (13%) y total
-- 6. Actualizar el pedido con los totales
-- 7. Usar transacción con ROLLBACK si hay error
-- =====================================================

DROP PROCEDURE IF EXISTS SP_CREAR_PEDIDO//

CREATE PROCEDURE SP_CREAR_PEDIDO(
    IN p_cliente_id INT,
    IN p_sucursal_id INT,
    IN p_canal_venta VARCHAR(20),
    IN p_items_json JSON,
    IN p_direccion_entrega VARCHAR(255)
)
BEGIN
    DECLARE v_pedido_id INT;
    DECLARE v_subtotal DECIMAL(10,2) DEFAULT 0;
    DECLARE v_impuesto DECIMAL(10,2) DEFAULT 0;
    DECLARE v_total DECIMAL(10,2) DEFAULT 0;

    DECLARE v_producto_id INT;
    DECLARE v_cantidad INT;
    DECLARE v_precio_unitario DECIMAL(10,2);
    DECLARE v_stock_actual INT;
    DECLARE v_index INT DEFAULT 0;
    DECLARE v_items_count INT;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

    -- 1️ Validar cliente
    IF NOT EXISTS (
        SELECT 1 FROM CLIENTE WHERE id = p_cliente_id AND activo = 1
    ) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Cliente no existe o no está activo';
    END IF;

    -- 2️ Validar sucursal
    IF NOT EXISTS (
        SELECT 1 FROM SUCURSAL WHERE id = p_sucursal_id AND activo = 1
    ) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Sucursal no existe o no está activa';
    END IF;

    -- 3️ Crear pedido inicial
    INSERT INTO PEDIDO (
        cliente_id, sucursal_id, canal_venta, estado, direccion_entrega, subtotal, impuesto, total
    ) VALUES (
        p_cliente_id, p_sucursal_id, p_canal_venta, 'PENDIENTE', p_direccion_entrega, 0, 0, 0
    );

    SET v_pedido_id = LAST_INSERT_ID();

    -- 4️ Procesar items del JSON
    SET v_items_count = JSON_LENGTH(p_items_json);

    WHILE v_index < v_items_count DO
        SET v_producto_id = JSON_UNQUOTE(JSON_EXTRACT(p_items_json, CONCAT('$[', v_index, '].producto_id')));
        SET v_cantidad = JSON_UNQUOTE(JSON_EXTRACT(p_items_json, CONCAT('$[', v_index, '].cantidad')));

        -- Obtener precio y stock
        SELECT precio, stock INTO v_precio_unitario, v_stock_actual
        FROM PRODUCTO
        WHERE id = v_producto_id AND activo = 1
        LIMIT 1;

        -- Validar stock suficiente
        IF v_stock_actual IS NULL THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = CONCAT('Producto ', v_producto_id, ' no existe o no está activo');
        END IF;

        IF v_cantidad > v_stock_actual THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = CONCAT('Stock insuficiente para producto ', v_producto_id);
        END IF;

        -- Insertar en ITEM_PEDIDO
        INSERT INTO ITEM_PEDIDO (pedido_id, producto_id, cantidad, precio_unitario, subtotal)
        VALUES (v_pedido_id, v_producto_id, v_cantidad, v_precio_unitario, v_precio_unitario * v_cantidad);

        -- Actualizar stock
        UPDATE PRODUCTO
        SET stock = stock - v_cantidad
        WHERE id = v_producto_id;

        -- Acumular subtotal
        SET v_subtotal = v_subtotal + (v_precio_unitario * v_cantidad);

        SET v_index = v_index + 1;
    END WHILE;

    -- 5️ Calcular impuesto (13%) y total
    SET v_impuesto = ROUND(v_subtotal * 0.13, 2);
    SET v_total = ROUND(v_subtotal + v_impuesto, 2);

    -- 6️ Actualizar totales del pedido
    UPDATE PEDIDO
    SET subtotal = v_subtotal,
        impuesto = v_impuesto,
        total = v_total
    WHERE id = v_pedido_id;

    COMMIT;

    -- 7️ Retornar ID y total
    SELECT v_pedido_id AS pedido_id, v_total AS total;

END



-- =====================================================
-- EJERCICIO 2.2: SP_PROCESAR_PAGO (5 puntos)
-- 
-- Registra un pago para un pedido, actualiza estado
-- y genera puntos de fidelidad
-- 
-- Parámetros:
-- - p_pedido_id: ID del pedido
-- - p_monto: Monto del pago
-- - p_metodo_pago: EFECTIVO, TARJETA, SINPE, TRANSFERENCIA
-- - p_referencia: Referencia del pago (puede ser NULL)
--
-- El procedimiento debe:
-- 1. Validar que el pedido existe
-- 2. Registrar el pago en tabla PAGO con estado 'COMPLETADO'
-- 3. Calcular total pagado hasta el momento
-- 4. Si el pago cubre el total:
--    - Cambiar estado del pedido a 'PREPARANDO'
--    - Calcular puntos (1 punto por cada 1000 colones)
--    - Actualizar puntos del cliente
-- =====================================================

DROP PROCEDURE IF EXISTS SP_PROCESAR_PAGO//

CREATE PROCEDURE SP_PROCESAR_PAGO(
    IN p_pedido_id INT,
    IN p_monto DECIMAL(10,2),
    IN p_metodo_pago VARCHAR(30),
    IN p_referencia VARCHAR(100)
)
BEGIN
    DECLARE v_pago_id INT;
    DECLARE v_cliente_id INT;
    DECLARE v_total_pedido DECIMAL(10,2);
    DECLARE v_total_pagado DECIMAL(10,2) DEFAULT 0;
    DECLARE v_puntos_ganados INT DEFAULT 0;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

    -- 1️ Obtener información del pedido
    SELECT cliente_id, total
    INTO v_cliente_id, v_total_pedido
    FROM PEDIDO
    WHERE id = p_pedido_id
    LIMIT 1;

    -- 2️ Validar que el pedido existe
    IF v_cliente_id IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Pedido no existe';
    END IF;

    -- 3️ Registrar el pago
    INSERT INTO PAGO (pedido_id, monto, metodo_pago, referencia, estado)
    VALUES (p_pedido_id, p_monto, p_metodo_pago, p_referencia, 'COMPLETADO');

    SET v_pago_id = LAST_INSERT_ID();

    -- 4️ Calcular total pagado hasta el momento
    SELECT IFNULL(SUM(monto), 0)
    INTO v_total_pagado
    FROM PAGO
    WHERE pedido_id = p_pedido_id
      AND estado = 'COMPLETADO';

    -- 5️ Si está completamente pagado, actualizar estado y dar puntos
    IF v_total_pagado >= v_total_pedido THEN
        -- Actualizar estado del pedido
        UPDATE PEDIDO
        SET estado = 'PREPARANDO'
        WHERE id = p_pedido_id;

        -- Calcular puntos: 1 punto por cada 1000 colones
        SET v_puntos_ganados = FLOOR(v_total_pedido / 1000);

        -- Actualizar puntos del cliente
        UPDATE CLIENTE
        SET puntos_fidelidad = puntos_fidelidad + v_puntos_ganados
        WHERE id = v_cliente_id;
    END IF;

    COMMIT;

    -- 6️ Retornar ID de pago y puntos ganados
    SELECT v_pago_id AS pago_id, v_puntos_ganados AS puntos_ganados;

END//



-- =====================================================
-- EJERCICIO 2.3: SP_CANCELAR_PEDIDO (5 puntos)
-- 
-- Cancela un pedido, restaura stock y procesa reembolsos
-- 
-- Parámetros:
-- - p_pedido_id: ID del pedido a cancelar
-- - p_motivo: Motivo de la cancelación
--
-- El procedimiento debe:
-- 1. Validar que el pedido existe
-- 2. Validar que no esté ya cancelado o entregado
-- 3. Restaurar stock de cada producto (usar cursor)
-- 4. Procesar reembolsos para pagos existentes
-- 5. Cambiar estado a 'CANCELADO' y guardar motivo
-- =====================================================

DROP PROCEDURE IF EXISTS SP_CANCELAR_PEDIDO//

CREATE PROCEDURE SP_CANCELAR_PEDIDO(
    IN p_pedido_id INT,
    IN p_motivo VARCHAR(255)
)
BEGIN
    DECLARE v_estado_actual VARCHAR(20);
    DECLARE done INT DEFAULT FALSE;
    DECLARE v_producto_id INT;
    DECLARE v_cantidad INT;
    DECLARE v_pago_id INT;
    DECLARE v_monto DECIMAL(10,2);

    -- Cursores
    DECLARE cur_items CURSOR FOR
        SELECT producto_id, cantidad FROM ITEM_PEDIDO WHERE pedido_id = p_pedido_id;

    DECLARE cur_pagos CURSOR FOR
        SELECT id, monto FROM PAGO WHERE pedido_id = p_pedido_id AND estado = 'COMPLETADO';

    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

    -- 1️ Obtener estado actual del pedido
    SELECT estado INTO v_estado_actual
    FROM PEDIDO
    WHERE id = p_pedido_id
    LIMIT 1;

    -- 2️ Validar que el pedido existe y no está cancelado o entregado
    IF v_estado_actual IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Pedido no existe';
    END IF;

    IF v_estado_actual IN ('CANCELADO','ENTREGADO') THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Pedido ya cancelado o entregado';
    END IF;

    -- 3️ Restaurar stock usando cursor
    OPEN cur_items;
    SET done = FALSE;
    read_items: LOOP
        FETCH cur_items INTO v_producto_id, v_cantidad;
        IF done THEN
            LEAVE read_items;
        END IF;
        UPDATE PRODUCTO
        SET stock = stock + v_cantidad
        WHERE id = v_producto_id;
    END LOOP;
    CLOSE cur_items;

    -- 4️ Procesar reembolsos usando cursor
    OPEN cur_pagos;
    SET done = FALSE;
    read_pagos: LOOP
        FETCH cur_pagos INTO v_pago_id, v_monto;
        IF done THEN
            LEAVE read_pagos;
        END IF;
        INSERT INTO REEMBOLSO (pago_id, monto, motivo)
        VALUES (v_pago_id, v_monto, p_motivo);
    END LOOP;
    CLOSE cur_pagos;

    -- 5️ Actualizar estado del pedido a CANCELADO y registrar motivo
    UPDATE PEDIDO
    SET estado = 'CANCELADO',
        notas = CONCAT(IFNULL(notas,''), ' Motivo cancelación: ', p_motivo)
    WHERE id = p_pedido_id;

    COMMIT;

    SELECT 'Pedido cancelado exitosamente' AS mensaje;

END



-- =====================================================
-- EJERCICIO 2.4: SP_REPORTE_VENTAS_PERIODO (2 puntos)
-- 
-- Genera un reporte de ventas entre dos fechas
-- agrupado por categoría de producto
-- 
-- Parámetros:
-- - p_fecha_inicio: Fecha inicial del período
-- - p_fecha_fin: Fecha final del período
--
-- Debe retornar por cada categoría:
-- - nombre de categoría
-- - cantidad_pedidos: pedidos distintos
-- - unidades_vendidas: suma de cantidades
-- - subtotal_ventas, impuestos, total_ventas
-- - precio_promedio
-- - productos_diferentes: cantidad de productos distintos vendidos
-- =====================================================

DROP PROCEDURE IF EXISTS SP_REPORTE_VENTAS_PERIODO//

CREATE PROCEDURE SP_REPORTE_VENTAS_PERIODO(
    IN p_fecha_inicio DATE,
    IN p_fecha_fin DATE
)
BEGIN
    SELECT 
        c.nombre AS categoria,
        COUNT(DISTINCT p.id) AS cantidad_pedidos,
        SUM(ip.cantidad) AS unidades_vendidas,
        SUM(ip.subtotal) AS subtotal_ventas,
        SUM(ip.subtotal * 0.13) AS impuestos,
        SUM(ip.subtotal * 1.13) AS total_ventas,
        ROUND(SUM(ip.subtotal)/SUM(ip.cantidad),2) AS precio_promedio,
        COUNT(DISTINCT ip.producto_id) AS productos_diferentes
    FROM PEDIDO p
    INNER JOIN ITEM_PEDIDO ip ON p.id = ip.pedido_id
    INNER JOIN PRODUCTO prod ON ip.producto_id = prod.id
    INNER JOIN CATEGORIA c ON prod.categoria_id = c.id
    WHERE p.estado != 'CANCELADO'
      AND p.fecha_pedido BETWEEN p_fecha_inicio AND p_fecha_fin
    GROUP BY c.id, c.nombre
    ORDER BY total_ventas DESC;
END



DELIMITER ;

COMMIT;
