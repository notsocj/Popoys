const SUPABASE_URL = 'https://uvzgsdcolxlfzgktafrr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV2emdzZGNvbHhsZnpna3RhZnJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU2NzkyNTcsImV4cCI6MjA2MTI1NTI1N30.ZKWB_dOkrGbwBYG78wIGB_p2cevkO-jTHaZiRL-UOjs';

// Initialize Supabase client
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// User roles and order status constants
const ROLE = {
    OWNER: 'Owner',
    STAFF: 'Staff'
};

const ORDER_STATUS = {
    COMPLETED: 'Completed',
    VOIDED: 'Voided'
};

// Database connection status
let connectionStatus = {
    initialized: true,
    lastChecked: new Date(),
    error: null
};

// User session management
const session = {
    getCurrentUser: async () => {
        const { data } = await supabaseClient.auth.getSession();
        return data.session?.user;
    },
    getUserRole: async () => {
        const user = await session.getCurrentUser();
        if (!user) return null;
        
        const { data } = await supabaseClient
            .from('users')
            .select('role')
            .eq('user_id', user.id)
            .single();
            
        return data?.role;
    },
    getUsername: async () => {
        const user = await session.getCurrentUser();
        if (!user) return null;
        
        const { data } = await supabaseClient
            .from('users')
            .select('username')
            .eq('user_id', user.id)
            .single();
            
        return data?.username;
    }
};

// Authentication operations
const auth = {
    login: async (email, password) => {
        try {
            // Sign in with Supabase Auth using email
            const { data, error } = await supabaseClient.auth.signInWithPassword({
                email,
                password
            });
            
            if (error) throw { message: 'Invalid email or password', code: 'auth/invalid-credential' };
            
            // Get user info from our users table by matching auth_id instead of user_id
            const { data: userData, error: userError } = await supabaseClient
                .from('users')
                .select('user_id, username, role')
                .eq('auth_id', data.user.id)
                .single();
        
            if (userError) throw { message: 'User data not found', code: 'auth/user-not-found' };
            
            // Store user data in local storage for access control
            localStorage.setItem('userRole', userData.role);
            localStorage.setItem('userId', userData.user_id);
            localStorage.setItem('username', userData.username);
            
            return {
                success: true,
                user: {
                    id: userData.user_id,
                    username: userData.username,
                    email: data.user.email,
                    role: userData.role
                }
            };
        } catch (error) {
            console.error('Login error:', error);
            return {
                success: false,
                error: error.message || 'Login failed'
            };
        }
    },
    
    register: async (username, email, password, role = 'Staff') => {
        try {
            // First check if username already exists
            const { data: existingUserByUsername, error: usernameError } = await supabaseClient
                .from('users')
                .select('user_id')
                .eq('username', username)
                .single();
                
            if (existingUserByUsername) throw { message: 'Username already exists', code: 'auth/username-exists' };
            
            // Create auth user for login
            const { data: authData, error: authError } = await supabaseClient.auth.signUp({
                email,
                password
            });
            
            if (authError) throw authError;
            
            // Create user in our custom table - REMOVE user_id completely from the insert
            const { data, error } = await supabaseClient
                .from('users')
                .insert([{
                    username,
                    email,
                    password_hash: password,
                    role
                    // Remove the user_id field - let the database auto-generate it
                }])
                .select();
                
            if (error) throw error;
            
            // After creating the user, update it with the auth_id
            const userId = data[0].user_id;
            const { error: updateError } = await supabaseClient
                .from('users')
                .update({ auth_id: authData.user.id })
                .eq('user_id', userId);
                
            if (updateError) throw updateError;
            
            return {
                success: true,
                user: {
                    id: data[0].user_id,
                    username: data[0].username,
                    email: data[0].email,
                    role: data[0].role
                }
            };
        } catch (error) {
            console.error('Registration error:', error);
            return {
                success: false,
                error: error.message || 'Registration failed'
            };
        }
    },
    
    logout: async () => {
        try {
            await supabaseClient.auth.signOut();
            localStorage.removeItem('userRole');
            localStorage.removeItem('userId');
            localStorage.removeItem('username');
            return { success: true };
        } catch (error) {
            console.error('Logout error:', error);
            return {
                success: false,
                error: error.message || 'Logout failed'
            };
        }
    },
    
    changePassword: async (userId, newPassword) => {
        try {
            // Update the password in auth
            const { error: authError } = await supabaseClient.auth.admin.updateUserById(
                userId,
                { password: newPassword }
            );
            
            if (authError) {
                // Fallback if admin operations aren't enabled
                const { error } = await supabaseClient
                    .from('users')
                    .update({ password_hash: newPassword })
                    .eq('user_id', userId);
                    
                if (error) throw error;
            }
            
            return { success: true };
        } catch (error) {
            console.error('Password change error:', error);
            return {
                success: false,
                error: error.message || 'Password change failed'
            };
        }
    }
};

// User operations
const users = {
    getAll: async () => {
        try {
            const { data, error } = await supabaseClient
                .from('users')
                .select('*')
                .order('username');
                
            if (error) throw error;
            
            return {
                success: true,
                data
            };
        } catch (error) {
            console.error('Error fetching users:', error);
            return {
                success: false,
                error: error.message || 'Failed to fetch users'
            };
        }
    },
    
    getById: async (id) => {
        try {
            const { data, error } = await supabaseClient
                .from('users')
                .select('*')
                .eq('user_id', id)
                .single();
                
            if (error) throw error;
            
            return {
                success: true,
                data
            };
        } catch (error) {
            console.error('Error fetching user:', error);
            return {
                success: false,
                error: error.message || 'Failed to fetch user'
            };
        }
    },
    
    update: async (id, userData) => {
        try {
            const { error } = await supabaseClient
                .from('users')
                .update(userData)
                .eq('user_id', id);
                
            if (error) throw error;
            
            return { success: true };
        } catch (error) {
            console.error('Error updating user:', error);
            return {
                success: false,
                error: error.message || 'Failed to update user'
            };
        }
    },
    
    delete: async (id) => {
        try {
            // Delete from users table
            const { error } = await supabaseClient
                .from('users')
                .delete()
                .eq('user_id', id);
                
            if (error) throw error;
            
            // Attempt to delete from auth
            try {
                await supabaseClient.auth.admin.deleteUser(id);
            } catch (authError) {
                console.log('Auth deletion requires admin rights:', authError);
                // This can fail silently as we've already removed from our users table
            }
            
            return { success: true };
        } catch (error) {
            console.error('Error deleting user:', error);
            return {
                success: false,
                error: error.message || 'Failed to delete user'
            };
        }
    }
};

// Orders operations
const orders = {
    create: async (orderData, orderItems) => {
        try {
            // Insert the order
            const { data: orderResult, error: orderError } = await supabaseClient
                .from('orders')
                .insert([orderData])
                .select();
                
            if (orderError) throw orderError;
            
            const orderId = orderResult[0].order_id;
            
            // Insert order details
            const orderDetails = orderItems.map(item => ({
                order_id: orderId,
                product_id: item.id,
                quantity: item.quantity,
                price_each: item.price
            }));
            
            const { error: detailsError } = await supabaseClient
                .from('order_details')
                .insert(orderDetails);
                
            if (detailsError) throw detailsError;
            
            // Update inventory for each item
            for (const item of orderItems) {
                await inventory.updateForProduct(item.id, item.quantity);
            }
            
            return {
                success: true,
                orderId,
                order: orderResult[0]
            };
        } catch (error) {
            console.error('Error creating order:', error);
            return {
                success: false,
                error: error.message || 'Failed to create order'
            };
        }
    }
};

// Inventory operations
const inventory = {
    updateForProduct: async (productId, quantity) => {
        try {
            // Get ingredients for this product
            const { data: ingredients, error: ingredientsError } = await supabaseClient
                .from('product_ingredients')
                .select('ingredient_id, quantity_needed')
                .eq('product_id', productId);
                
            if (ingredientsError) throw ingredientsError;
            
            // Update each ingredient's stock
            for (const ingredient of ingredients) {
                const totalUsed = ingredient.quantity_needed * quantity;
                
                const { error: updateError } = await supabaseClient.rpc('decrement_ingredient_stock', {
                    ing_id: ingredient.ingredient_id,
                    used_amount: totalUsed
                });
                
                if (updateError) throw updateError;
            }
            
            return { success: true };
        } catch (error) {
            console.error('Error updating inventory:', error);
            return {
                success: false,
                error: error.message || 'Failed to update inventory'
            };
        }
    }
};

// Initialize stored procedures (formerly in supabase-init.js)
async function setupSupabaseFunctions() {
    try {
        // Create function to get best selling product
        await supabaseClient.rpc('create_function_get_best_selling_product');
        
        // Create function to get top selling products
        await supabaseClient.rpc('create_function_get_top_selling_products');
        
        // Create function to decrement ingredient stock
        await supabaseClient.rpc('create_function_decrement_ingredient_stock');
        
        // Create function to increment ingredient stock
        await supabaseClient.rpc('create_function_increment_ingredient_stock');
        
        console.log('Supabase functions initialized successfully');
    } catch (error) {
        console.error('Error setting up Supabase functions:', error);
        // Non-fatal error, functions might already exist
    }
}

// Export the connection and functions
window.db = {
    client: supabaseClient,
    setupFunctions: setupSupabaseFunctions,
    session,
    auth,
    users,
    orders,
    inventory,
    constants: {
        ROLE,
        ORDER_STATUS
    }
};

// Call setupSupabaseFunctions when appropriate (admin only)
document.addEventListener('DOMContentLoaded', () => {
    // Only administrators should be able to create functions
    const isAdmin = localStorage.getItem('userRole') === ROLE.OWNER;
    if (isAdmin) {
        setupSupabaseFunctions().catch(console.error);
    }
});
