-- ============================================================
-- DATABASE: product_inventory_db
-- Compatible con MySQL / MariaDB
-- Prueba técnica Frontend Vue.js + Spring Boot Backend
-- ============================================================

DROP DATABASE IF EXISTS product_inventory_db;
CREATE DATABASE product_inventory_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE product_inventory_db;

-- ============================================================
-- TABLE CLEANUP
-- ============================================================

DROP TABLE IF EXISTS purchase_items;
DROP TABLE IF EXISTS purchases;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS users;

-- ============================================================
-- TABLE: users
-- Uso: login mock / autenticación básica / JWT mock
-- ============================================================

CREATE TABLE users (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    username VARCHAR(80) NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(120) NOT NULL,
    role VARCHAR(30) NOT NULL DEFAULT 'USER',
    active TINYINT(1) NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_users_username (username)
);

-- ============================================================
-- TABLE: products
-- Uso:
--   Listado, búsqueda, filtros, ordenamiento, detalle e inventario.
--   El stock queda directamente en products para simplificar la prueba.
-- ============================================================

CREATE TABLE products (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    name VARCHAR(120) NOT NULL,
    description VARCHAR(500) NOT NULL,
    category VARCHAR(80) NOT NULL,
    price DECIMAL(12,2) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    minimum_stock INT NOT NULL DEFAULT 0,
    image_url VARCHAR(500) NULL,
    active TINYINT(1) NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_products_name (name),
    KEY idx_products_category (category),
    KEY idx_products_price (price),
    KEY idx_products_stock (stock),
    KEY idx_products_active (active)
);

-- ============================================================
-- TABLE: purchases
-- Uso: cabecera de compra
-- ============================================================

CREATE TABLE purchases (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id BIGINT UNSIGNED NOT NULL,
    total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    status VARCHAR(30) NOT NULL DEFAULT 'COMPLETED',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_purchases_user_id (user_id),
    KEY idx_purchases_status (status),
    KEY idx_purchases_created_at (created_at),
    CONSTRAINT fk_purchases_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);

-- ============================================================
-- TABLE: purchase_items
-- Uso: detalle de productos comprados
-- ============================================================

CREATE TABLE purchase_items (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    purchase_id BIGINT UNSIGNED NOT NULL,
    product_id BIGINT UNSIGNED NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(12,2) NOT NULL,
    subtotal DECIMAL(12,2) NOT NULL,
    PRIMARY KEY (id),
    KEY idx_purchase_items_purchase_id (purchase_id),
    KEY idx_purchase_items_product_id (product_id),
    CONSTRAINT fk_purchase_items_purchase
        FOREIGN KEY (purchase_id)
        REFERENCES purchases(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_purchase_items_product
        FOREIGN KEY (product_id)
        REFERENCES products(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);

-- ============================================================
-- DATA: users
-- Nota:
--   Contraseñas en texto plano solo para entorno local/mock.
-- ============================================================

INSERT INTO users (username, password, full_name, role, active) VALUES
('admin', 'admin123', 'Administrador del Sistema', 'ADMIN', 1),
('user', 'user123', 'Usuario Demo', 'USER', 1);

-- ============================================================
-- DATA: products
-- Algunos productos tienen bajo stock o stock 0 para probar error 409.
-- ============================================================

INSERT INTO products (name, description, category, price, stock, minimum_stock, image_url, active) VALUES
('Laptop Lenovo IdeaPad 3', 'Laptop de uso general con buen rendimiento para oficina, estudio y navegación.', 'Tecnología', 2450000.00, 8, 2, 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853', 1),
('Mouse Logitech M185', 'Mouse inalámbrico compacto, cómodo y funcional para trabajo diario.', 'Accesorios', 65000.00, 35, 5, 'https://images.unsplash.com/photo-1527814050087-3793815479db', 1),
('Teclado Mecánico Redragon', 'Teclado mecánico retroiluminado para productividad y gaming.', 'Accesorios', 210000.00, 14, 3, 'https://images.unsplash.com/photo-1587829741301-dc798b83add3', 1),
('Monitor Samsung 24 pulgadas', 'Monitor Full HD de 24 pulgadas ideal para oficina y multitarea.', 'Tecnología', 690000.00, 5, 2, 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf', 1),
('Audífonos Sony WH-CH520', 'Audífonos inalámbricos con buena autonomía y sonido claro.', 'Audio', 230000.00, 20, 4, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e', 1),
('Silla Ergonómica Oficina', 'Silla ergonómica con soporte lumbar para jornadas largas de trabajo.', 'Oficina', 580000.00, 3, 1, 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8', 1),
('Base Refrigerante Laptop', 'Base con ventiladores para mejorar la temperatura del portátil.', 'Accesorios', 95000.00, 0, 2, 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8', 1),
('Webcam Logitech C920', 'Cámara web Full HD para reuniones, clases y streaming.', 'Tecnología', 320000.00, 7, 2, 'https://images.unsplash.com/photo-1587826080692-f439cd0b70da', 1),
('Disco SSD Kingston 1TB', 'Unidad de estado sólido para mejorar velocidad de carga y almacenamiento.', 'Almacenamiento', 330000.00, 10, 2, 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b', 1),
('Memoria RAM 16GB DDR4', 'Memoria RAM DDR4 de 16GB para mejorar rendimiento en equipos compatibles.', 'Componentes', 280000.00, 4, 2, 'https://images.unsplash.com/photo-1562976540-1502c2145186', 1),
('Tablet Samsung Galaxy Tab', 'Tablet práctica para estudio, entretenimiento y productividad ligera.', 'Tecnología', 890000.00, 6, 2, 'https://images.unsplash.com/photo-1561154464-82e9adf32764', 1),
('Impresora HP Ink Tank', 'Impresora multifuncional con sistema de tanque de tinta.', 'Oficina', 750000.00, 2, 1, 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6', 1);

-- ============================================================
-- DATA: purchase example
-- ============================================================

INSERT INTO purchases (user_id, total_amount, status) VALUES
(2, 65000.00, 'COMPLETED');

INSERT INTO purchase_items (purchase_id, product_id, quantity, unit_price, subtotal) VALUES
(1, 2, 1, 65000.00, 65000.00);

-- Opcional: reflejar el stock de la compra inicial
UPDATE products
SET stock = stock - 1
WHERE id = 2 AND stock > 0;

-- ============================================================
-- VERIFY
-- ============================================================

SELECT 'Database created successfully' AS message;
SELECT COUNT(*) AS total_users FROM users;
SELECT COUNT(*) AS total_products FROM products;
SELECT COUNT(*) AS total_purchases FROM purchases;
SELECT COUNT(*) AS total_purchase_items FROM purchase_items;
