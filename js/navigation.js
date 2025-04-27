document.addEventListener('DOMContentLoaded', () => {
    // Initialize the navigation system
    setupNavigation();
    
    // Setup logout functionality
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
    
    // Check authentication status and apply role-based permissions
    checkAuthStatus();
});

function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Remove active class from all links and sections
            navLinks.forEach(l => l.classList.remove('active', 'bg-coffee', 'text-white'));
            navLinks.forEach(l => l.classList.add('text-coffee-dark', 'hover:bg-coffee-light', 'hover:text-white'));
            document.querySelectorAll('.section').forEach(s => s.classList.add('hidden'));
            
            // Add active class to clicked link
            link.classList.remove('text-coffee-dark', 'hover:bg-coffee-light', 'hover:text-white');
            link.classList.add('active', 'bg-coffee', 'text-white');
            
            // Show corresponding section
            const sectionId = link.getAttribute('data-section') + '-section';
            const section = document.getElementById(sectionId);
            
            if (section) {
                section.classList.remove('hidden');
                loadSectionContent(link.getAttribute('data-section'));
            }
        });
    });
    
    // Set initial active section
    activateDefaultSection();
}

function activateDefaultSection() {
    // Get active link from URL hash or default to dashboard
    const hash = window.location.hash.substring(1) || 'dashboard';
    const activeLink = document.querySelector(`.nav-link[data-section="${hash}"]`);
    
    if (activeLink) {
        // Simulate click on the active link
        activeLink.click();
    } else {
        // Default to first nav link
        const firstLink = document.querySelector('.nav-link');
        if (firstLink) {
            firstLink.click();
        }
    }
}

function loadSectionContent(sectionName) {
    switch(sectionName) {
        case 'dashboard':
            loadDashboardData();
            break;
        case 'pos':
            initializePOS();
            break;
        case 'inventory':
            loadInventoryData();
            break;
        case 'sales':
            loadSalesReport();
            break;
        case 'voids':
            loadVoidedSales();
            break;
        case 'users':
            loadUserManagement();
            break;
    }
    
    // Update URL hash
    window.location.hash = sectionName;
}

function checkAuthStatus() {
    // Check if user is logged in
    db.session.getCurrentUser().then(user => {
        if (!user) {
            window.location.href = 'index.html';
            return;
        }
        
        // Get and display user name
        const userName = document.getElementById('userName');
        if (userName) {
            userName.textContent = user.email.split('@')[0];
        }
        
        // Apply role-based permissions
        applyRolePermissions();
    });
}

function applyRolePermissions() {
    const userRole = localStorage.getItem('userRole');
    const ownerOnlyElements = document.querySelectorAll('.owner-only');
    
    ownerOnlyElements.forEach(element => {
        if (userRole !== ROLE.OWNER) {
            element.classList.add('hidden');
        } else {
            element.classList.remove('hidden');
        }
    });
}

function logout() {
    db.auth.logout().then(() => {
        window.location.href = 'index.html';
    });
}
