-- Add category column to products table
ALTER TABLE products ADD COLUMN category VARCHAR(100) NOT NULL DEFAULT 'Uncategorized';

-- Update existing products with categories (you can run these commands in Supabase SQL editor)
-- Examples:
-- UPDATE products SET category = 'Hot Coffee' WHERE product_name LIKE '%Hot%' OR product_name LIKE '%Americano%' OR product_name LIKE '%Espresso%';
-- UPDATE products SET category = 'Iced Coffee' WHERE product_name LIKE '%Iced%';
-- UPDATE products SET category = 'Frappe' WHERE product_name LIKE '%Frappe%';
-- UPDATE products SET category = 'Coffee-Based' WHERE product_name LIKE '%Latte%' OR product_name LIKE '%Cappuccino%';
-- UPDATE products SET category = 'Snacks' WHERE product_name LIKE '%Cake%' OR product_name LIKE '%Pastry%' OR product_name LIKE '%Bread%';
