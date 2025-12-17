-- =====================================================
-- FASE 3: FUNCIONES (15%)
-- Archivo: 03_funciones.sql
-- Cafetería B&B - Proyecto 2
-- =====================================================
-- INSTRUCCIONES PARA EL ESTUDIANTE:
-- Complete las funciones marcadas con TODO
-- Las funciones deben ser DETERMINISTIC o READS SQL DATA
-- Pruebe cada función después de crearla
-- =====================================================

USE cafeteria_bb;

DELIMITER //

-- =====================================================
-- EJERCICIO 3.1: FN_CALCULAR_SUBTOTAL (4 puntos)
--
-- Calcula el subtotal de un ítem aplicando descuentos
--
-- Parámetros:
-- - p_precio: Precio unitario del producto (DECIMAL 10,2)
-- - p_cantidad: Cantidad de unidades (INT)
-- - p_descuento: Porcentaje de descuento 0-100 (DECIMAL 5,2)
--
-- Retorna: DECIMAL(10,2) - Subtotal con descuento aplicado
--
-- Fórmula: precio * cantidad * (1 - descuento/100)
-- Si descuento es NULL o 0, no aplicar descuento
-- Usar ROUND para redondear a 2 decimales
-- =====================================================

-- TODO: Descomente y complete la función
-- DROP FUNCTION IF EXISTS FN_CALCULAR_SUBTOTAL//
--
-- CREATE FUNCTION FN_CALCULAR_SUBTOTAL(
--     p_precio DECIMAL(10,2),
--     p_cantidad INT,
--     p_descuento DECIMAL(5,2)
-- )
-- RETURNS DECIMAL(10,2)
-- DETERMINISTIC
-- BEGIN
--     DECLARE v_subtotal DECIMAL(10,2);
--
--     -- TODO: Calcular subtotal con descuento
--
--     RETURN v_subtotal;
-- END//


-- =====================================================
-- EJERCICIO 3.2: FN_CALCULAR_IMPUESTO (3 puntos)
--
-- Calcula el IVA (13%) de un monto dado
--
-- Parámetros:
-- - p_monto: Monto base (DECIMAL 10,2)
--
-- Retorna: DECIMAL(10,2) - Monto del impuesto
--
-- Fórmula: monto * 0.13
-- Usar ROUND para redondear a 2 decimales
-- =====================================================

-- TODO: Descomente y complete la función
-- DROP FUNCTION IF EXISTS FN_CALCULAR_IMPUESTO//
--
-- CREATE FUNCTION FN_CALCULAR_IMPUESTO(
--     p_monto DECIMAL(10,2)
-- )
-- RETURNS DECIMAL(10,2)
-- DETERMINISTIC
-- BEGIN
--     -- TODO: Calcular y retornar el impuesto (13%)
--
--     RETURN 0;
-- END//


-- =====================================================
-- EJERCICIO 3.3: FN_OBTENER_CATEGORIA_CLIENTE (4 puntos)
--
-- Retorna la categoría del cliente según sus puntos de fidelidad
--
-- Parámetros:
-- - p_cliente_id: ID del cliente (INT)
--
-- Retorna: VARCHAR(20) - Categoría del cliente
--
-- Categorías según puntos:
-- - BRONCE: 0-99 puntos
-- - PLATA: 100-299 puntos
-- - ORO: 300-499 puntos
-- - PLATINO: 500+ puntos
--
-- Usar COALESCE para manejar puntos NULL
-- =====================================================

-- TODO: Descomente y complete la función
-- DROP FUNCTION IF EXISTS FN_OBTENER_CATEGORIA_CLIENTE//
--
-- CREATE FUNCTION FN_OBTENER_CATEGORIA_CLIENTE(
--     p_cliente_id INT
-- )
-- RETURNS VARCHAR(20)
-- READS SQL DATA
-- BEGIN
--     DECLARE v_puntos INT;
--     DECLARE v_categoria VARCHAR(20);
--
--     -- TODO: Obtener puntos del cliente
--
--     -- TODO: Determinar categoría según puntos
--
--     RETURN v_categoria;
-- END//


-- =====================================================
-- EJERCICIO 3.4: FN_DIAS_DESDE_ULTIMO_PEDIDO (4 puntos)
--
-- Calcula los días transcurridos desde el último pedido del cliente
--
-- Parámetros:
-- - p_cliente_id: ID del cliente (INT)
--
-- Retorna: INT - Número de días o NULL si no tiene pedidos
--
-- IMPORTANTE:
-- - Excluir pedidos cancelados
-- - Usar MAX() para obtener la fecha más reciente
-- - Usar DATEDIFF(NOW(), fecha) para calcular días
-- - Retornar NULL si el cliente no tiene pedidos
-- =====================================================

-- TODO: Descomente y complete la función
-- DROP FUNCTION IF EXISTS FN_DIAS_DESDE_ULTIMO_PEDIDO//
--
-- CREATE FUNCTION FN_DIAS_DESDE_ULTIMO_PEDIDO(
--     p_cliente_id INT
-- )
-- RETURNS INT
-- READS SQL DATA
-- BEGIN
--     DECLARE v_ultima_fecha DATETIME;
--     DECLARE v_dias INT;
--
--     -- TODO: Obtener fecha del último pedido no cancelado
--
--     -- TODO: Si no hay pedidos, retornar NULL
--
--     -- TODO: Calcular y retornar días transcurridos
--
--     RETURN v_dias;
-- END//


-- =====================================================
-- EJERCICIO EXTRA: FN_CALCULAR_TOTAL_PEDIDO (+3 puntos extra)
--
-- Calcula el total de un pedido incluyendo impuestos
--
-- Parámetros:
-- - p_pedido_id: ID del pedido (INT)
--
-- Retorna: DECIMAL(10,2) - Total del pedido
--
-- DEBE:
-- 1. Calcular subtotal sumando subtotales de ITEM_PEDIDO
-- 2. Calcular impuesto usando FN_CALCULAR_IMPUESTO
-- 3. Retornar subtotal + impuesto
-- =====================================================

-- TODO: Descomente y complete la función (OPCIONAL)
-- DROP FUNCTION IF EXISTS FN_CALCULAR_TOTAL_PEDIDO//
--
-- CREATE FUNCTION FN_CALCULAR_TOTAL_PEDIDO(
--     p_pedido_id INT
-- )
-- RETURNS DECIMAL(10,2)
-- READS SQL DATA
-- BEGIN
--     -- TODO: Implementar para puntos extra
--
--     RETURN 0;
-- END//


DELIMITER ;

COMMIT;
