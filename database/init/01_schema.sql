-- =====================================================
-- CAFETERÍA B&B - SCRIPT DE INICIALIZACIÓN
-- Proyecto 2: TPA-3002 Bases de Datos
-- =====================================================

-- Configurar charset UTF-8 para la sesión
SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;
SET CHARACTER SET utf8mb4;

USE cafeteria_bb;

-- Configurar charset UTF-8 para la base de datos
ALTER DATABASE cafeteria_bb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Tabla de Provincias
CREATE TABLE IF NOT EXISTS PROVINCIA (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL UNIQUE
);

-- Tabla de Cantones
CREATE TABLE IF NOT EXISTS CANTON (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    provincia_id INT NOT NULL,
    CONSTRAINT FK_CANTON_PROVINCIA FOREIGN KEY (provincia_id) REFERENCES PROVINCIA(id)
);

-- Tabla de Distritos
CREATE TABLE IF NOT EXISTS DISTRITO (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    canton_id INT NOT NULL,
    CONSTRAINT FK_DISTRITO_CANTON FOREIGN KEY (canton_id) REFERENCES CANTON(id)
);

-- Tabla de Categorías de Productos
CREATE TABLE IF NOT EXISTS CATEGORIA (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    activo TINYINT(1) DEFAULT 1
);

-- Tabla de Sucursales
CREATE TABLE IF NOT EXISTS SUCURSAL (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    direccion VARCHAR(255),
    telefono VARCHAR(20),
    distrito_id INT,
    activo TINYINT(1) DEFAULT 1,
    CONSTRAINT FK_SUCURSAL_DISTRITO FOREIGN KEY (distrito_id) REFERENCES DISTRITO(id)
);

-- Tabla de Clientes
CREATE TABLE IF NOT EXISTS CLIENTE (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(150) NOT NULL,
    email VARCHAR(100) UNIQUE,
    telefono VARCHAR(20),
    direccion VARCHAR(255),
    distrito_id INT,
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
    activo TINYINT(1) DEFAULT 1,
    puntos_fidelidad INT DEFAULT 0,
    CONSTRAINT FK_CLIENTE_DISTRITO FOREIGN KEY (distrito_id) REFERENCES DISTRITO(id)
);

-- Tabla de Productos
CREATE TABLE IF NOT EXISTS PRODUCTO (
    id INT PRIMARY KEY AUTO_INCREMENT,
    sku VARCHAR(50) UNIQUE,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10,2) NOT NULL,
    stock INT DEFAULT 0,
    stock_minimo INT DEFAULT 10,
    categoria_id INT,
    activo TINYINT(1) DEFAULT 1,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT FK_PRODUCTO_CATEGORIA FOREIGN KEY (categoria_id) REFERENCES CATEGORIA(id),
    CONSTRAINT CK_PRODUCTO_PRECIO CHECK (precio > 0)
);

-- Tabla de Proveedores
CREATE TABLE IF NOT EXISTS PROVEEDOR (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(150) NOT NULL,
    contacto VARCHAR(150),
    telefono VARCHAR(20),
    email VARCHAR(100),
    direccion VARCHAR(255),
    activo TINYINT(1) DEFAULT 1
);

-- Tabla de relación Producto-Proveedor
CREATE TABLE IF NOT EXISTS PRODUCTO_PROVEEDOR (
    id INT PRIMARY KEY AUTO_INCREMENT,
    producto_id INT NOT NULL,
    proveedor_id INT NOT NULL,
    precio_compra DECIMAL(10,2),
    tiempo_entrega_dias INT,
    es_principal TINYINT(1) DEFAULT 0,
    CONSTRAINT FK_PP_PRODUCTO FOREIGN KEY (producto_id) REFERENCES PRODUCTO(id),
    CONSTRAINT FK_PP_PROVEEDOR FOREIGN KEY (proveedor_id) REFERENCES PROVEEDOR(id),
    CONSTRAINT UQ_PRODUCTO_PROVEEDOR UNIQUE (producto_id, proveedor_id)
);

-- Tabla de Pedidos
CREATE TABLE IF NOT EXISTS PEDIDO (
    id INT PRIMARY KEY AUTO_INCREMENT,
    cliente_id INT NOT NULL,
    sucursal_id INT NOT NULL,
    fecha_pedido DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_preparacion_inicio DATETIME,
    fecha_preparacion_fin DATETIME,
    fecha_despacho DATETIME,
    fecha_entrega DATETIME,
    estado VARCHAR(20) DEFAULT 'PENDIENTE',
    canal_venta VARCHAR(20) NOT NULL,
    subtotal DECIMAL(10,2) DEFAULT 0,
    impuesto DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) DEFAULT 0,
    direccion_entrega VARCHAR(255),
    tiempo_estimado_minutos INT DEFAULT 30,
    notas TEXT,
    CONSTRAINT FK_PEDIDO_CLIENTE FOREIGN KEY (cliente_id) REFERENCES CLIENTE(id),
    CONSTRAINT FK_PEDIDO_SUCURSAL FOREIGN KEY (sucursal_id) REFERENCES SUCURSAL(id),
    CONSTRAINT CK_PEDIDO_ESTADO CHECK (estado IN ('PENDIENTE', 'PREPARANDO', 'LISTO', 'EN_CAMINO', 'ENTREGADO', 'CANCELADO')),
    CONSTRAINT CK_PEDIDO_CANAL CHECK (canal_venta IN ('MOSTRADOR', 'PICKUP', 'DELIVERY'))
);

-- Tabla de Items de Pedido
CREATE TABLE IF NOT EXISTS ITEM_PEDIDO (
    id INT PRIMARY KEY AUTO_INCREMENT,
    pedido_id INT NOT NULL,
    producto_id INT NOT NULL,
    cantidad INT NOT NULL DEFAULT 1,
    precio_unitario DECIMAL(10,2) NOT NULL,
    descuento DECIMAL(5,2) DEFAULT 0,
    subtotal DECIMAL(10,2),
    notas VARCHAR(255),
    CONSTRAINT FK_ITEM_PEDIDO FOREIGN KEY (pedido_id) REFERENCES PEDIDO(id) ON DELETE CASCADE,
    CONSTRAINT FK_ITEM_PRODUCTO FOREIGN KEY (producto_id) REFERENCES PRODUCTO(id),
    CONSTRAINT CK_ITEM_CANTIDAD CHECK (cantidad > 0)
);

-- Tabla de Pagos
CREATE TABLE IF NOT EXISTS PAGO (
    id INT PRIMARY KEY AUTO_INCREMENT,
    pedido_id INT NOT NULL,
    monto DECIMAL(10,2) NOT NULL,
    metodo_pago VARCHAR(30) NOT NULL,
    referencia VARCHAR(100),
    fecha_pago DATETIME DEFAULT CURRENT_TIMESTAMP,
    estado VARCHAR(20) DEFAULT 'COMPLETADO',
    CONSTRAINT FK_PAGO_PEDIDO FOREIGN KEY (pedido_id) REFERENCES PEDIDO(id),
    CONSTRAINT CK_PAGO_METODO CHECK (metodo_pago IN ('EFECTIVO', 'TARJETA', 'SINPE', 'TRANSFERENCIA'))
);

-- Tabla de Reembolsos
CREATE TABLE IF NOT EXISTS REEMBOLSO (
    id INT PRIMARY KEY AUTO_INCREMENT,
    pago_id INT NOT NULL,
    monto DECIMAL(10,2) NOT NULL,
    motivo VARCHAR(255),
    fecha_reembolso DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT FK_REEMBOLSO_PAGO FOREIGN KEY (pago_id) REFERENCES PAGO(id)
);

-- Tabla de Repartidores
CREATE TABLE IF NOT EXISTS REPARTIDOR (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(150) NOT NULL,
    telefono VARCHAR(20),
    tipo VARCHAR(20) DEFAULT 'PROPIO',
    activo TINYINT(1) DEFAULT 1,
    CONSTRAINT CK_REPARTIDOR_TIPO CHECK (tipo IN ('PROPIO', 'EXTERNO'))
);

-- Tabla de Envíos
CREATE TABLE IF NOT EXISTS ENVIO (
    id INT PRIMARY KEY AUTO_INCREMENT,
    pedido_id INT NOT NULL UNIQUE,
    repartidor_id INT,
    proveedor_externo VARCHAR(50),
    id_envio_externo VARCHAR(100),
    estado VARCHAR(20) DEFAULT 'PENDIENTE',
    fecha_asignacion DATETIME,
    fecha_entrega DATETIME,
    CONSTRAINT FK_ENVIO_PEDIDO FOREIGN KEY (pedido_id) REFERENCES PEDIDO(id),
    CONSTRAINT FK_ENVIO_REPARTIDOR FOREIGN KEY (repartidor_id) REFERENCES REPARTIDOR(id)
);

-- Tabla de Auditoría de Pedidos
CREATE TABLE IF NOT EXISTS AUDITORIA_PEDIDOS (
    id INT PRIMARY KEY AUTO_INCREMENT,
    pedido_id INT,
    accion VARCHAR(20) NOT NULL,
    datos_anteriores JSON,
    datos_nuevos JSON,
    usuario VARCHAR(100),
    fecha_accion DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabla temporal para cierres de caja
CREATE TABLE IF NOT EXISTS CIERRE_CAJA (
    id INT PRIMARY KEY AUTO_INCREMENT,
    sucursal_id INT NOT NULL,
    fecha_cierre DATETIME DEFAULT CURRENT_TIMESTAMP,
    total_efectivo DECIMAL(10,2) DEFAULT 0,
    total_tarjeta DECIMAL(10,2) DEFAULT 0,
    total_sinpe DECIMAL(10,2) DEFAULT 0,
    total_transferencia DECIMAL(10,2) DEFAULT 0,
    total_general DECIMAL(10,2) DEFAULT 0,
    cantidad_pedidos INT DEFAULT 0,
    usuario VARCHAR(100),
    observaciones TEXT,
    CONSTRAINT FK_CIERRE_SUCURSAL FOREIGN KEY (sucursal_id) REFERENCES SUCURSAL(id)
);

-- =====================================================
-- DATOS INICIALES
-- =====================================================

-- Provincias de Costa Rica
INSERT INTO PROVINCIA (nombre) VALUES 
('San José'), ('Alajuela'), ('Cartago'), ('Heredia'), 
('Guanacaste'), ('Puntarenas'), ('Limón');

-- Cantones (muestra)
INSERT INTO CANTON (nombre, provincia_id) VALUES 
('San José', 1), ('Escazú', 1), ('Desamparados', 1), ('Alajuela', 2),
('San Carlos', 2), ('Cartago', 3), ('Heredia', 4), ('Liberia', 5);

-- Distritos (muestra)
INSERT INTO DISTRITO (nombre, canton_id) VALUES 
('Carmen', 1), ('Merced', 1), ('Hospital', 1), ('Escazú', 2),
('San Rafael', 2), ('Desamparados', 3), ('Alajuela', 4), ('San Carlos', 5),
('Oriental', 6), ('Heredia', 7), ('Liberia', 8);

-- Categorías
INSERT INTO CATEGORIA (nombre, descripcion) VALUES 
('Café Caliente', 'Bebidas de café caliente'),
('Café Frío', 'Bebidas de café frías y heladas'),
('Té', 'Variedad de tés calientes y fríos'),
('Pastelería', 'Pasteles, galletas y repostería'),
('Snacks', 'Bocadillos y comidas ligeras'),
('Bebidas Frías', 'Jugos, refrescos y batidos');

-- Sucursales
INSERT INTO SUCURSAL (nombre, direccion, telefono, distrito_id) VALUES 
('B&B Escazú', 'Centro Comercial Multiplaza, Local 25', '2201-1234', 4),
('B&B San José Centro', 'Avenida Central, Calle 5', '2222-5678', 1),
('B&B Heredia', 'Mall Oxígeno, Local 101', '2260-9012', 10),
('B&B Cartago', 'Centro Comercial Paseo Metrópoli', '2591-3456', 9);

-- Productos
INSERT INTO PRODUCTO (sku, nombre, descripcion, precio, stock, stock_minimo, categoria_id) VALUES 
('CAF001', 'Espresso', 'Espresso tradicional italiano', 1500.00, 100, 20, 1),
('CAF002', 'Americano', 'Espresso con agua caliente', 1800.00, 100, 20, 1),
('CAF003', 'Cappuccino', 'Espresso con leche espumada', 2200.00, 100, 20, 1),
('CAF004', 'Latte', 'Espresso con leche cremosa', 2400.00, 100, 20, 1),
('CAF005', 'Mocha', 'Espresso con chocolate y leche', 2600.00, 100, 20, 1),
('FRI001', 'Cold Brew', 'Café frío preparado en frío', 2800.00, 50, 15, 2),
('FRI002', 'Frappé Mocha', 'Bebida helada de café y chocolate', 3200.00, 50, 15, 2),
('FRI003', 'Iced Latte', 'Latte con hielo', 2600.00, 50, 15, 2),
('TE001', 'Té Verde', 'Té verde premium', 1600.00, 80, 20, 3),
('TE002', 'Té Chai', 'Té con especias tradicional', 2000.00, 80, 20, 3),
('PAS001', 'Croissant', 'Croissant de mantequilla', 1800.00, 30, 10, 4),
('PAS002', 'Muffin Chocolate', 'Muffin con chips de chocolate', 1500.00, 40, 10, 4),
('PAS003', 'Cheesecake', 'Cheesecake New York', 3500.00, 20, 5, 4),
('PAS004', 'Brownie', 'Brownie con nueces', 2000.00, 35, 10, 4),
('SNK001', 'Sandwich Jamón y Queso', 'Pan artesanal con jamón y queso', 3000.00, 25, 8, 5),
('SNK002', 'Wrap de Pollo', 'Wrap con pollo y vegetales', 3500.00, 20, 8, 5),
('BEB001', 'Jugo de Naranja', 'Jugo natural de naranja', 2000.00, 40, 15, 6),
('BEB002', 'Smoothie Frutas', 'Batido de frutas tropicales', 2800.00, 30, 10, 6);

-- Proveedores
INSERT INTO PROVEEDOR (nombre, contacto, telefono, email) VALUES 
('Café Britt', 'Juan Pérez', '2277-1234', 'ventas@cafebritt.cr'),
('Panadería Musmanni', 'María López', '2222-3456', 'pedidos@musmanni.cr'),
('Distribuidora Del Valle', 'Carlos Rojas', '2233-5678', 'ventas@delvalle.cr'),
('Lácteos Coronado', 'Ana Sánchez', '2229-9012', 'info@lacteoscoronado.cr');

-- Producto-Proveedor
INSERT INTO PRODUCTO_PROVEEDOR (producto_id, proveedor_id, precio_compra, tiempo_entrega_dias, es_principal) VALUES 
(1, 1, 800.00, 2, 1), (2, 1, 900.00, 2, 1), (3, 1, 1100.00, 2, 1),
(11, 2, 900.00, 1, 1), (12, 2, 750.00, 1, 1), (13, 2, 1800.00, 1, 1),
(17, 3, 1000.00, 1, 1), (18, 3, 1400.00, 1, 1);

-- Clientes de ejemplo
INSERT INTO CLIENTE (nombre, email, telefono, direccion, distrito_id, puntos_fidelidad) VALUES 
('Juan Carlos Mora', 'jcmora@email.com', '8888-1111', 'San José, Barrio Amón', 1, 150),
('María Fernanda López', 'mflopez@email.com', '8888-2222', 'Escazú, San Rafael', 5, 320),
('Carlos Alberto Sánchez', 'casanchez@email.com', '8888-3333', 'Heredia Centro', 10, 75),
('Ana Patricia Jiménez', 'apjimenez@email.com', '8888-4444', 'Cartago, Oriental', 9, 200),
('Roberto Méndez Castro', 'rmendez@email.com', '8888-5555', 'Desamparados', 6, 50),
('Laura Cristina Vargas', 'lcvargas@email.com', '8888-6666', 'Alajuela Centro', 7, 180),
('Diego Alejandro Rojas', 'darojas@email.com', '8888-7777', 'San José, Merced', 2, 95),
('Sofía Elena Castillo', 'secastillo@email.com', '8888-8888', 'Escazú Centro', 4, 420),
('Andrés Felipe Mora', 'afmora@email.com', '8888-9999', 'Heredia, Mercedes', 10, 30),
('Valentina Rodríguez', 'vrodriguez@email.com', '8877-1111', 'San José, Hospital', 3, 280);

-- Repartidores
INSERT INTO REPARTIDOR (nombre, telefono, tipo) VALUES 
('Pedro Martínez', '7777-1111', 'PROPIO'),
('Luis Hernández', '7777-2222', 'PROPIO'),
('Uber Eats', 'N/A', 'EXTERNO'),
('Rappi', 'N/A', 'EXTERNO');

-- Pedidos de ejemplo
INSERT INTO PEDIDO (cliente_id, sucursal_id, fecha_pedido, estado, canal_venta, subtotal, impuesto, total, tiempo_estimado_minutos) VALUES 
(1, 1, DATE_SUB(NOW(), INTERVAL 30 DAY), 'ENTREGADO', 'MOSTRADOR', 5400.00, 702.00, 6102.00, 15),
(2, 1, DATE_SUB(NOW(), INTERVAL 28 DAY), 'ENTREGADO', 'DELIVERY', 8200.00, 1066.00, 9266.00, 45),
(3, 2, DATE_SUB(NOW(), INTERVAL 25 DAY), 'ENTREGADO', 'PICKUP', 3600.00, 468.00, 4068.00, 20),
(4, 3, DATE_SUB(NOW(), INTERVAL 20 DAY), 'ENTREGADO', 'MOSTRADOR', 4800.00, 624.00, 5424.00, 10),
(5, 2, DATE_SUB(NOW(), INTERVAL 15 DAY), 'ENTREGADO', 'DELIVERY', 6500.00, 845.00, 7345.00, 40),
(1, 1, DATE_SUB(NOW(), INTERVAL 10 DAY), 'ENTREGADO', 'MOSTRADOR', 2200.00, 286.00, 2486.00, 10),
(2, 3, DATE_SUB(NOW(), INTERVAL 7 DAY), 'ENTREGADO', 'PICKUP', 7800.00, 1014.00, 8814.00, 25),
(6, 4, DATE_SUB(NOW(), INTERVAL 5 DAY), 'ENTREGADO', 'MOSTRADOR', 5000.00, 650.00, 5650.00, 15),
(7, 1, DATE_SUB(NOW(), INTERVAL 3 DAY), 'LISTO', 'PICKUP', 4400.00, 572.00, 4972.00, 20),
(8, 2, DATE_SUB(NOW(), INTERVAL 1 DAY), 'PREPARANDO', 'DELIVERY', 9200.00, 1196.00, 10396.00, 50),
(1, 1, NOW(), 'PENDIENTE', 'MOSTRADOR', 3200.00, 416.00, 3616.00, 10),
(3, 3, NOW(), 'PENDIENTE', 'DELIVERY', 5600.00, 728.00, 6328.00, 45);

-- Items de pedido
INSERT INTO ITEM_PEDIDO (pedido_id, producto_id, cantidad, precio_unitario, subtotal) VALUES 
(1, 3, 2, 2200.00, 4400.00), (1, 11, 1, 1800.00, 1800.00),
(2, 1, 3, 1500.00, 4500.00), (2, 13, 1, 3500.00, 3500.00),
(3, 4, 1, 2400.00, 2400.00), (3, 12, 1, 1500.00, 1500.00),
(4, 5, 2, 2600.00, 5200.00),
(5, 6, 2, 2800.00, 5600.00), (5, 14, 1, 2000.00, 2000.00),
(6, 2, 1, 1800.00, 1800.00),
(7, 7, 2, 3200.00, 6400.00), (7, 11, 1, 1800.00, 1800.00),
(8, 15, 1, 3000.00, 3000.00), (8, 3, 1, 2200.00, 2200.00),
(9, 4, 2, 2400.00, 4800.00),
(10, 8, 3, 2600.00, 7800.00), (10, 13, 1, 3500.00, 3500.00),
(11, 1, 2, 1500.00, 3000.00),
(12, 16, 1, 3500.00, 3500.00), (12, 17, 1, 2000.00, 2000.00);

-- Pagos
INSERT INTO PAGO (pedido_id, monto, metodo_pago, fecha_pago) VALUES 
(1, 6102.00, 'TARJETA', DATE_SUB(NOW(), INTERVAL 30 DAY)),
(2, 9266.00, 'SINPE', DATE_SUB(NOW(), INTERVAL 28 DAY)),
(3, 4068.00, 'EFECTIVO', DATE_SUB(NOW(), INTERVAL 25 DAY)),
(4, 5424.00, 'TARJETA', DATE_SUB(NOW(), INTERVAL 20 DAY)),
(5, 7345.00, 'SINPE', DATE_SUB(NOW(), INTERVAL 15 DAY)),
(6, 2486.00, 'EFECTIVO', DATE_SUB(NOW(), INTERVAL 10 DAY)),
(7, 8814.00, 'TARJETA', DATE_SUB(NOW(), INTERVAL 7 DAY)),
(8, 5650.00, 'EFECTIVO', DATE_SUB(NOW(), INTERVAL 5 DAY));

-- Envíos para pedidos delivery
INSERT INTO ENVIO (pedido_id, repartidor_id, estado, fecha_asignacion, fecha_entrega) VALUES 
(2, 1, 'ENTREGADO', DATE_SUB(NOW(), INTERVAL 28 DAY), DATE_SUB(NOW(), INTERVAL 28 DAY)),
(5, 2, 'ENTREGADO', DATE_SUB(NOW(), INTERVAL 15 DAY), DATE_SUB(NOW(), INTERVAL 15 DAY)),
(10, 1, 'EN_CAMINO', DATE_SUB(NOW(), INTERVAL 1 DAY), NULL),
(12, NULL, 'PENDIENTE', NULL, NULL);

-- Actualizar fechas de entrega para pedidos entregados
UPDATE PEDIDO SET fecha_entrega = DATE_ADD(fecha_pedido, INTERVAL tiempo_estimado_minutos MINUTE) 
WHERE estado = 'ENTREGADO';

-- Crear algunos pedidos fuera de tiempo (para el reporte)
UPDATE PEDIDO SET fecha_entrega = DATE_ADD(fecha_pedido, INTERVAL (tiempo_estimado_minutos + 20) MINUTE) 
WHERE id IN (2, 5);

COMMIT;
