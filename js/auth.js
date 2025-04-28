document.addEventListener('DOMContentLoaded', () => {
    // Check if user is already logged in
    checkSession();

    // Handle login form submission
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
});

async function checkSession() {
    try {
        // Get Supabase client safely
        const supabaseClient = getSupabaseClient();
        if (!supabaseClient) {
            throw new Error('Supabase client is not available');
        }

        // Check the current session
        const { data: { session }, error } = await supabaseClient.auth.getSession();
        
        if (error) throw error;
        
        if (session) {
            // Get user data from the users table to check role
            const { data: userData, error: userError } = await supabaseClient
                .from('users')
                .select('role, user_id')
                .eq('email', session.user.email)
                .single();
                
            if (userError) throw userError;
            
            if (userData) {
                localStorage.setItem('userRole', userData.role);
                localStorage.setItem('userId', userData.user_id);
                
                // If on login page, redirect to dashboard
                if (window.location.pathname.includes('index.html') || 
                    window.location.pathname.endsWith('/')) {
                    window.location.href = 'dashboard.html';
                }
            }
        }
    } catch (error) {
        console.error('Session check error:', error);
    }
}

// Helper function to safely get the Supabase client
function getSupabaseClient() {
    if (window.supabaseClient) {
        return window.supabaseClient;
    }
    
    if (window.db && window.db.client) {
        return window.db.client;
    }
    
    if (window.supabase) {
        return window.supabase;
    }
    
    console.error('Supabase client not found');
    return null;
}

async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('error-message');
    
    if (!email || !password) {
        errorMessage.textContent = 'Please enter both email and password';
        errorMessage.classList.remove('hidden');
        return;
    }
    
    // Show loading state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<svg class="animate-spin h-5 w-5 text-white mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                           <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                           <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>`;
    
    try {
        // Get Supabase client safely
        const supabaseClient = getSupabaseClient();
        if (!supabaseClient) {
            throw new Error('Supabase client is not available');
        }
        
        // Sign in with email and password
        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email,
            password
        });
        
        if (error) throw error;
        
        if (data && data.user) {
            // Get user role from users table
            const { data: userData, error: userError } = await supabaseClient
                .from('users')
                .select('role, user_id')
                .eq('email', data.user.email)
                .single();
                
            if (userError) throw userError;
            
            // Store user info in localStorage
            localStorage.setItem('userRole', userData.role);
            localStorage.setItem('userId', userData.user_id);
            
            // Redirect to dashboard
            window.location.href = 'dashboard.html';
        } else {
            throw new Error('Login successful but user data not found');
        }
    } catch (error) {
        console.error('Login error:', error);
        
        // Show error message
        errorMessage.textContent = error.message || 'Invalid email or password';
        errorMessage.classList.remove('hidden');
    } finally {
        // Reset button state
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
    }
}

async function logout() {
    try {
        // Get Supabase client safely
        const supabaseClient = getSupabaseClient();
        if (!supabaseClient) {
            throw new Error('Supabase client is not available');
        }
        
        // Sign out
        await supabaseClient.auth.signOut();
        
        // Clear localStorage
        localStorage.removeItem('userRole');
        localStorage.removeItem('userId');
        
        // Redirect to login page
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Logout error:', error);
        alert('Error during logout: ' + error.message);
    }
}

// Make logout function globally available
window.logout = logout;
