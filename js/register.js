document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
});

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

async function handleRegister(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const role = document.getElementById('role').value;
    const errorMessage = document.getElementById('error-message');
    
    // Validate inputs
    if (!username || !email || !password || !confirmPassword) {
        showError('All fields are required');
        return;
    }
    
    if (password !== confirmPassword) {
        showError('Passwords do not match');
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
        
        // Step 1: Sign up with email and password in Supabase Auth
        const { data, error } = await supabaseClient.auth.signUp({
            email,
            password
        });
        
        if (error) throw error;
        
        // Get the auth_id from the registered user
        const authId = data.user.id;
        
        // Step 2: Create user in users table with auth_id
        const { error: insertError } = await supabaseClient
            .from('users')
            .insert([{
                username,
                email,
                password_hash: password, // In real app this should be hashed
                role,
                auth_id: authId // Store the auth_id for reference
            }]);
            
        if (insertError) throw insertError;
        
        // Show success message and redirect
        alert('Registration successful! Please log in.');
        window.location.href = 'index.html?registered=true';
        
    } catch (error) {
        console.error('Registration error:', error);
        showError(error.message || 'Error during registration');
    } finally {
        // Reset button state
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
    }
}

function showError(message) {
    const errorMessage = document.getElementById('error-message');
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');
}
