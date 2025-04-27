# Database Instructions for POS System

## General Rules
- Use `SERIAL` for auto-increment primary keys.
- Use `TIMESTAMP DEFAULT NOW()` for created timestamps.
- Use `DECIMAL(10,2)` for prices and quantities.
- Use `VARCHAR` fields appropriately with `NOT NULL` and `UNIQUE` if needed.
- Enforce foreign key relationships with `ON DELETE` rules.
- Apply `CHECK` constraints to fields with limited choices (e.g., roles, status).

## Tables

```sql
CREATE TABLE users (
  user_id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) CHECK (role IN ('Owner', 'Staff')) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE products (
  product_id SERIAL PRIMARY KEY,
  product_name VARCHAR(255) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
  category VARCHAR(100) NOT NULL DEFAULT 'Uncategorized';
);

CREATE TABLE ingredients (
  ingredient_id SERIAL PRIMARY KEY,
  ingredient_name VARCHAR(255) NOT NULL,
  quantity_in_stock DECIMAL(10,2) DEFAULT 0,
  unit VARCHAR(50) NOT NULL,
  reorder_level DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);


CREATE TABLE product_ingredients (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(product_id) ON DELETE CASCADE,
  ingredient_id INTEGER REFERENCES ingredients(ingredient_id) ON DELETE CASCADE,
  quantity_needed DECIMAL(10,2) NOT NULL
);


CREATE TABLE orders (
  order_id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(100) NOT NULL,
  order_status VARCHAR(50) CHECK (order_status IN ('Completed', 'Voided')) NOT NULL DEFAULT 'Completed',
  created_at TIMESTAMP DEFAULT NOW()
);


CREATE TABLE order_details (
  order_detail_id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(order_id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(product_id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  price_each DECIMAL(10,2) NOT NULL
);


CREATE TABLE voided_sales (
  void_id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(order_id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
  reason TEXT,
  voided_at TIMESTAMP DEFAULT NOW()
);
