// Supabase initialization and stored procedures setup

// Initialize Supabase
const supabase = supabase.createClient(
    'https://uvzgsdcolxlfzgktafrr.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV2emdzZGNvbHhsZnpna3RhZnJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU2NzkyNTcsImV4cCI6MjA2MTI1NTI1N30.ZKWB_dOkrGbwBYG78wIGB_p2cevkO-jTHaZiRL-UOjs'
);

// Create necessary Supabase stored procedures
async function setupSupabaseFunctions() {
    try {
        // Create function to get best selling product
        await supabase.rpc('create_function_get_best_selling_product', {}, {
            headers: {
                'Authorization': 'Bearer YOUR_SERVICE_ROLE_KEY'
            }
        });
        
        // Create function to get top selling products
        await supabase.rpc('create_function_get_top_selling_products', {}, {
            headers: {
                'Authorization': 'Bearer YOUR_SERVICE_ROLE_KEY'
            }
        });
        
        // Create function to decrement ingredient stock
        await supabase.rpc('create_function_decrement_ingredient_stock', {}, {
            headers: {
                'Authorization': 'Bearer YOUR_SERVICE_ROLE_KEY'
            }
        });
        
        // Create function to increment ingredient stock
        await supabase.rpc('create_function_increment_ingredient_stock', {}, {
            headers: {
                'Authorization': 'Bearer YOUR_SERVICE_ROLE_KEY'
            }
        });
        
        console.log('Supabase functions initialized successfully');
    } catch (error) {
        console.error('Error setting up Supabase functions:', error);
    }
}

// SQL functions to run on Supabase
/*
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
*/
