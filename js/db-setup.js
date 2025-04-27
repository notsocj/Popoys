// Utility script to help set up product categories and sample products

async function createSampleProducts() {
    try {
        // Use the appropriate Supabase client reference
        const supabaseClient = window.db ? window.db.client : supabase;
        
        // Check if there are any products already
        const { data: existingProducts, error: checkError } = await supabaseClient
            .from('products')
            .select('product_id')
            .limit(1);
            
        if (checkError) throw checkError;
        
        // Only add sample products if none exist
        if (existingProducts && existingProducts.length > 0) {
            console.log('Products already exist in the database');
            return { success: true, message: 'Products already exist in the database' };
        }
        
        const sampleProducts = [
            // Hot Coffee
            { product_name: 'Hot Americano (16oz)', price: 85.00, category: 'Hot Coffee' },
            { product_name: 'Hot Latte (16oz)', price: 95.00, category: 'Hot Coffee' },
            { product_name: 'Hot Cappuccino (16oz)', price: 95.00, category: 'Hot Coffee' },
            { product_name: 'Espresso Shot', price: 75.00, category: 'Hot Coffee' },
            
            // Iced Coffee
            { product_name: 'Iced Americano (16oz)', price: 90.00, category: 'Iced Coffee' },
            { product_name: 'Iced Americano (22oz)', price: 105.00, category: 'Iced Coffee' },
            { product_name: 'Iced Latte (16oz)', price: 100.00, category: 'Iced Coffee' },
            { product_name: 'Iced Latte (22oz)', price: 115.00, category: 'Iced Coffee' },
            { product_name: 'Cold Brew (16oz)', price: 95.00, category: 'Iced Coffee' },
            { product_name: 'Cold Brew (22oz)', price: 110.00, category: 'Iced Coffee' },
            
            // Frappe
            { product_name: 'Caramel Frappe (16oz)', price: 110.00, category: 'Frappe' },
            { product_name: 'Caramel Frappe (22oz)', price: 125.00, category: 'Frappe' },
            { product_name: 'Mocha Frappe (16oz)', price: 110.00, category: 'Frappe' },
            { product_name: 'Mocha Frappe (22oz)', price: 125.00, category: 'Frappe' },
            { product_name: 'Vanilla Frappe (16oz)', price: 110.00, category: 'Frappe' },
            { product_name: 'Vanilla Frappe (22oz)', price: 125.00, category: 'Frappe' },
            
            // Coffee-Based
            { product_name: 'Caramel Macchiato (16oz)', price: 105.00, category: 'Coffee-Based' },
            { product_name: 'Caramel Macchiato (22oz)', price: 120.00, category: 'Coffee-Based' },
            { product_name: 'Vanilla Latte (16oz)', price: 105.00, category: 'Coffee-Based' },
            { product_name: 'Vanilla Latte (22oz)', price: 120.00, category: 'Coffee-Based' },
            
            // Snacks
            { product_name: 'Chocolate Chip Cookie', price: 45.00, category: 'Snacks' },
            { product_name: 'Blueberry Muffin', price: 55.00, category: 'Snacks' },
            { product_name: 'Cinnamon Roll', price: 60.00, category: 'Snacks' },
            { product_name: 'Chicken Sandwich', price: 75.00, category: 'Snacks' },
            { product_name: 'Cheesecake Slice', price: 85.00, category: 'Snacks' }
        ];
        
        // Insert products into database
        const { error } = await supabaseClient
            .from('products')
            .insert(sampleProducts);
            
        if (error) throw error;
        
        console.log('Sample products added successfully!');
        return { success: true, message: 'Sample products added successfully!' };
    } catch (error) {
        console.error('Error adding sample products:', error);
        return { success: false, error: error.message || 'Error adding sample products' };
    }
}

// Add function to check database connection
async function checkDatabaseConnection() {
    try {
        const supabaseClient = window.db ? window.db.client : supabase;
        
        // Try a simple query to check connection
        const { data, error } = await supabaseClient
            .from('products')
            .select('count', { count: 'exact', head: true });
            
        if (error) throw error;
        
        return {
            success: true,
            message: 'Database connection successful',
            productCount: data
        };
    } catch (error) {
        console.error('Database connection error:', error);
        return {
            success: false,
            error: error.message || 'Could not connect to database'
        };
    }
}

// Make functions available in the browser console for testing
window.dbSetup = {
    createSampleProducts,
    checkDatabaseConnection
};

// Log a message to help users know these functions are available
console.log('Database setup utilities available. Use window.dbSetup.checkDatabaseConnection() to test connection or window.dbSetup.createSampleProducts() to add sample data.');
