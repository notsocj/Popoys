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
    const user = await db.session.getCurrentUser();
    
    if (user) {
        // Get user role from custom table
        const role = await db.session.getUserRole();
        
        if (role) {
            localStorage.setItem('userRole', role);
            window.location.href = 'dashboard.html';
        }
    }
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
    
    const result = await db.auth.login(email, password);
    
    // Reset button state
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalBtnText;
    
    if (result.success) {
        // Redirect to dashboard
        window.location.href = 'dashboard.html';
    } else {
        errorMessage.textContent = result.error || 'Invalid email or password';
        errorMessage.classList.remove('hidden');
    }
}

function logout() {
    db.auth.logout().then(() => {
        window.location.href = 'index.html';
    });
}
