-- =====================================================
-- FASE 4: TRIGGERS (15%)
-- Archivo: 04_triggers.sql
-- Cafetería B&B - Proyecto 2
-- =====================================================
-- INSTRUCCIONES PARA EL ESTUDIANTE:
-- Complete los triggers marcados con TODO
-- Los triggers se ejecutan automáticamente ante eventos
-- Use NEW para valores nuevos y OLD para valores anteriores
-- =====================================================

USE cafeteria_bb;

DELIMITER //

-- =====================================================
-- EJERCICIO 4.1: TRG_AUDITORIA_PEDIDOS_INSERT (3 puntos)
--
-- Registra en AUDITORIA_PEDIDOS cada vez que se inserta
-- un nuevo pedido
--
-- Tipo: AFTER INSERT
-- Tabla: PEDIDO
--
-- Debe guardar:
-- - pedido_id: ID del nuevo pedido (usar NEW.id)
-- - accion: 'INSERT'
-- - datos_anteriores: NULL (no hay datos previos)
-- - datos_nuevos: JSON con cliente_id, sucursal_id, estado, canal_venta, total
-- - usuario: CURRENT_USER()
-- - fecha_accion: NOW()
--
-- Usar JSON_OBJECT() para crear el JSON
-- =====================================================

-- TODO: Descomente y complete el trigger
-- DROP TRIGGER IF EXISTS TRG_AUDITORIA_PEDIDOS_INSERT//
--
-- CREATE TRIGGER TRG_AUDITORIA_PEDIDOS_INSERT
-- AFTER INSERT ON PEDIDO
-- FOR EACH ROW
-- BEGIN
--     -- TODO: Insertar registro en AUDITORIA_PEDIDOS
-- END//


-- =====================================================
-- EJERCICIO 4.2: TRG_AUDITORIA_PEDIDOS_UPDATE (4 puntos)
--
-- Registra en AUDITORIA_PEDIDOS cada UPDATE en PEDIDO
--
-- Tipo: AFTER UPDATE
-- Tabla: PEDIDO
--
-- Debe guardar:
-- - pedido_id: ID del pedido (NEW.id)
-- - accion: 'UPDATE'
-- - datos_anteriores: JSON con estado, total, fecha_entrega ANTERIORES (OLD)
-- - datos_nuevos: JSON con estado, total, fecha_entrega NUEVOS (NEW)
-- - usuario: CURRENT_USER()
-- - fecha_accion: NOW()
-- =====================================================

-- TODO: Descomente y complete el trigger
-- DROP TRIGGER IF EXISTS TRG_AUDITORIA_PEDIDOS_UPDATE//
--
-- CREATE TRIGGER TRG_AUDITORIA_PEDIDOS_UPDATE
-- AFTER UPDATE ON PEDIDO
-- FOR EACH ROW
-- BEGIN
--     -- TODO: Insertar registro en AUDITORIA_PEDIDOS
--     -- Usar OLD para datos anteriores y NEW para datos nuevos
-- END//


-- =====================================================
-- EJERCICIO 4.3: TRG_VALIDAR_STOCK (4 puntos)
--
-- Previene la inserción de un item si no hay stock suficiente
--
-- Tipo: BEFORE INSERT
-- Tabla: ITEM_PEDIDO
--
-- Debe:
-- 1. Obtener el stock actual del producto
-- 2. Si stock < cantidad solicitada (NEW.cantidad):
--    - Lanzar error con SIGNAL SQLSTATE '45000'
--    - MESSAGE_TEXT: 'Stock insuficiente para completar el pedido'
-- =====================================================

-- TODO: Descomente y complete el trigger
-- DROP TRIGGER IF EXISTS TRG_VALIDAR_STOCK//
--
-- CREATE TRIGGER TRG_VALIDAR_STOCK
-- BEFORE INSERT ON ITEM_PEDIDO
-- FOR EACH ROW
-- BEGIN
--     DECLARE v_stock_actual INT;
--
--     -- TODO: Obtener stock actual del producto
--
--     -- TODO: Validar stock disponible
--
-- END//


-- =====================================================
-- EJERCICIO 4.4: TRG_CALCULAR_PUNTOS (4 puntos)
--
-- Calcula y asigna puntos de fidelidad cuando un pedido
-- cambia a estado 'ENTREGADO'
--
-- Tipo: AFTER UPDATE
-- Tabla: PEDIDO
--
-- SOLO procesar cuando:
-- - NEW.estado = 'ENTREGADO'
-- - AND OLD.estado != 'ENTREGADO' (el estado cambió)
--
-- Puntos = FLOOR(total / 1000)
-- Es decir, 1 punto por cada 1000 colones
--
-- BONUS: Si se cancela un pedido que ya estaba ENTREGADO,
-- restar los puntos (usar GREATEST para no quedar negativo)
-- =====================================================

-- TODO: Descomente y complete el trigger
-- DROP TRIGGER IF EXISTS TRG_CALCULAR_PUNTOS//
--
-- CREATE TRIGGER TRG_CALCULAR_PUNTOS
-- AFTER UPDATE ON PEDIDO
-- FOR EACH ROW
-- BEGIN
--     DECLARE v_puntos_ganados INT;
--
--     -- TODO: Verificar si el estado cambió a ENTREGADO
--
--     -- TODO (BONUS): Si se cancela un pedido que ya estaba entregado, restar puntos
--
-- END//


-- =====================================================
-- EJERCICIO EXTRA: TRG_CALCULAR_SUBTOTAL_ITEM (+3 puntos extra)
--
-- Calcula automáticamente el subtotal de un item
-- antes de insertar
--
-- Tipo: BEFORE INSERT
-- Tabla: ITEM_PEDIDO
--
-- Si precio_unitario es NULL o 0, obtenerlo del producto
-- Calcular subtotal = precio_unitario * cantidad * (1 - descuento/100)
-- =====================================================

-- TODO: Descomente y complete el trigger (OPCIONAL)
-- DROP TRIGGER IF EXISTS TRG_CALCULAR_SUBTOTAL_ITEM//
--
-- CREATE TRIGGER TRG_CALCULAR_SUBTOTAL_ITEM
-- BEFORE INSERT ON ITEM_PEDIDO
-- FOR EACH ROW
-- BEGIN
--     -- TODO: Implementar para puntos extra
-- END//


DELIMITER ;

COMMIT;
