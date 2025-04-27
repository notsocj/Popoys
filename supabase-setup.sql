-- Database setup script for Popoy's Café POS System

-- Users table
CREATE TABLE users (
  user_id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) CHECK (role IN ('Owner', 'Staff')) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Products table
CREATE TABLE products (
  product_id SERIAL PRIMARY KEY,
  product_name VARCHAR(255) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  category VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Ingredients table
CREATE TABLE ingredients (
  ingredient_id SERIAL PRIMARY KEY,
  ingredient_name VARCHAR(255) NOT NULL,
  quantity_in_stock DECIMAL(10,2) DEFAULT 0,
  unit VARCHAR(50) NOT NULL,
  reorder_level DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Product ingredients relationship table
CREATE TABLE product_ingredients (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(product_id) ON DELETE CASCADE,
  ingredient_id INTEGER REFERENCES ingredients(ingredient_id) ON DELETE CASCADE,
  quantity_needed DECIMAL(10,2) NOT NULL
);

-- Orders table
CREATE TABLE orders (
  order_id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(100) NOT NULL,
  order_status VARCHAR(50) CHECK (order_status IN ('Completed', 'Voided')) NOT NULL DEFAULT 'Completed',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Order details table
CREATE TABLE order_details (
  order_detail_id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(order_id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(product_id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  price_each DECIMAL(10,2) NOT NULL
);

-- Voided sales table
CREATE TABLE voided_sales (
  void_id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(order_id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
  reason TEXT,
  voided_at TIMESTAMP DEFAULT NOW()
);

-- Function to get best selling product
CREATE OR REPLACE FUNCTION get_best_selling_product()
RETURNS TABLE (
    product_id INTEGER,
    product_name TEXT,
    total_quantity BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT p.product_id, p.product_name, SUM(od.quantity)::BIGINT as total_quantity
    FROM products p
    JOIN order_details od ON p.product_id = od.product_id
    JOIN orders o ON od.order_id = o.order_id
    WHERE o.order_status = 'Completed'
    GROUP BY p.product_id, p.product_name
    ORDER BY total_quantity DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Function to get top selling products
CREATE OR REPLACE FUNCTION get_top_selling_products(limit_count INTEGER DEFAULT 5)
RETURNS TABLE (
    product_id INTEGER,
    product_name TEXT,
    total_quantity BIGINT,
    total_sales DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.product_id, 
        p.product_name, 
        SUM(od.quantity)::BIGINT as total_quantity,
        SUM(od.quantity * od.price_each) as total_sales
    FROM products p
    JOIN order_details od ON p.product_id = od.product_id
    JOIN orders o ON od.order_id = o.order_id
    WHERE o.order_status = 'Completed'
    GROUP BY p.product_id, p.product_name
    ORDER BY total_quantity DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Function to decrement ingredient stock
CREATE OR REPLACE FUNCTION decrement_ingredient_stock(ing_id INTEGER, used_amount DECIMAL)
RETURNS void AS $$
BEGIN
    UPDATE ingredients
    SET quantity_in_stock = quantity_in_stock - used_amount
    WHERE ingredient_id = ing_id;
END;
$$ LANGUAGE plpgsql;

-- Function to increment ingredient stock
CREATE OR REPLACE FUNCTION increment_ingredient_stock(ing_id INTEGER, add_amount DECIMAL)
RETURNS void AS $$
BEGIN
    UPDATE ingredients
    SET quantity_in_stock = quantity_in_stock + add_amount
    WHERE ingredient_id = ing_id;
END;
$$ LANGUAGE plpgsql;

-- Insert default owner account
INSERT INTO users (username, password_hash, role)
VALUES ('admin', 'admin123', 'Owner');

-- Insert sample products
INSERT INTO products (product_name, price, category) VALUES
('Espresso', 90.00, 'Coffee'),
('Americano', 110.00, 'Coffee'),
('Cappuccino', 130.00, 'Coffee'),
('Latte', 140.00, 'Coffee'),
('Mocha', 150.00, 'Coffee'),
('Chocolate Croissant', 95.00, 'Pastry'),
('Cinnamon Roll', 85.00, 'Pastry'),
('Blueberry Muffin', 75.00, 'Pastry'),
('Cheesecake', 160.00, 'Pastry'),
('Chocolate Cake', 180.00, 'Pastry');

-- Insert sample ingredients
INSERT INTO ingredients (ingredient_name, quantity_in_stock, unit, reorder_level) VALUES
('Coffee Beans', 5000.00, 'g', 1000.00),
('Milk', 10000.00, 'ml', 2000.00),
('Sugar', 3000.00, 'g', 500.00),
('Chocolate Syrup', 2000.00, 'ml', 400.00),
('Flour', 10000.00, 'g', 2000.00),
('Butter', 3000.00, 'g', 500.00),
('Eggs', 50.00, 'pcs', 10.00),
('Vanilla Extract', 500.00, 'ml', 100.00),
('Cream Cheese', 2000.00, 'g', 400.00),
('Blueberries', 1000.00, 'g', 200.00),
('Cinnamon', 500.00, 'g', 100.00),
('Chocolate Chips', 2000.00, 'g', 400.00);

-- Link products with ingredients (sample relationships)
-- Espresso
INSERT INTO product_ingredients (product_id, ingredient_id, quantity_needed) VALUES
(1, 1, 18.00),  -- Coffee Beans
(1, 3, 5.00);   -- Sugar

-- Americano
INSERT INTO product_ingredients (product_id, ingredient_id, quantity_needed) VALUES
(2, 1, 18.00),  -- Coffee Beans
(2, 3, 5.00);   -- Sugar

-- Cappuccino
INSERT INTO product_ingredients (product_id, ingredient_id, quantity_needed) VALUES
(3, 1, 18.00),  -- Coffee Beans
(3, 2, 100.00), -- Milk
(3, 3, 10.00);  -- Sugar

-- Latte
INSERT INTO product_ingredients (product_id, ingredient_id, quantity_needed) VALUES
(4, 1, 18.00),  -- Coffee Beans
(4, 2, 150.00), -- Milk
(4, 3, 10.00);  -- Sugar

-- Mocha
INSERT INTO product_ingredients (product_id, ingredient_id, quantity_needed) VALUES
(5, 1, 18.00),    -- Coffee Beans
(5, 2, 150.00),   -- Milk
(5, 3, 10.00),    -- Sugar
(5, 4, 30.00);    -- Chocolate Syrup

-- Chocolate Croissant
INSERT INTO product_ingredients (product_id, ingredient_id, quantity_needed) VALUES
(6, 5, 50.00),    -- Flour
(6, 6, 30.00),    -- Butter
(6, 12, 20.00);   -- Chocolate Chips

-- Cinnamon Roll
INSERT INTO product_ingredients (product_id, ingredient_id, quantity_needed) VALUES
(7, 5, 50.00),    -- Flour
(7, 6, 25.00),    -- Butter
(7, 3, 15.00),    -- Sugar
(7, 11, 5.00);    -- Cinnamon

-- Blueberry Muffin
INSERT INTO product_ingredients (product_id, ingredient_id, quantity_needed) VALUES
(8, 5, 40.00),    -- Flour
(8, 6, 20.00),    -- Butter
(8, 7, 1.00),     -- Eggs
(8, 3, 20.00),    -- Sugar
(8, 10, 30.00);   -- Blueberries

-- Cheesecake
INSERT INTO product_ingredients (product_id, ingredient_id, quantity_needed) VALUES
(9, 9, 100.00),   -- Cream Cheese
(9, 3, 30.00),    -- Sugar
(9, 7, 2.00),     -- Eggs
(9, 8, 5.00);     -- Vanilla Extract

-- Chocolate Cake
INSERT INTO product_ingredients (product_id, ingredient_id, quantity_needed) VALUES
(10, 5, 60.00),   -- Flour
(10, 6, 50.00),   -- Butter
(10, 3, 40.00),   -- Sugar
(10, 7, 2.00),    -- Eggs
(10, 4, 30.00),   -- Chocolate Syrup
(10, 12, 40.00);  -- Chocolate Chips
