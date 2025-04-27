document.addEventListener('DOMContentLoaded', () => {
    // Get all nav links
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Add click event to each link
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Get the target section
            const targetSection = link.dataset.section;
            
            // Hide all sections
            document.querySelectorAll('.section').forEach(section => {
                section.classList.add('hidden');
            });
            
            // Show the target section
            document.getElementById(`${targetSection}-section`).classList.remove('hidden');
            
            // Update active state on navigation
            navLinks.forEach(navLink => {
                navLink.classList.remove('bg-coffee', 'text-white');
                navLink.classList.add('text-coffee-dark', 'hover:bg-coffee-light', 'hover:text-white');
            });
            
            // Set active state
            link.classList.remove('text-coffee-dark', 'hover:bg-coffee-light', 'hover:text-white');
            link.classList.add('bg-coffee', 'text-white');
            
            // Custom event to notify section change
            const event = new CustomEvent('sectionChanged', {
                detail: { section: targetSection }
            });
            document.dispatchEvent(event);
        });
    });
    
    // Set default section active (dashboard or from URL hash)
    const defaultSection = window.location.hash.substring(1) || 'dashboard';
    const defaultLink = document.querySelector(`.nav-link[data-section="${defaultSection}"]`);
    if (defaultLink) {
        defaultLink.click();
    } else {
        // Fallback to first nav link
        navLinks[0].click();
    }
    
    // Check user role and hide restricted sections
    const userRole = localStorage.getItem('userRole');
    if (userRole !== 'Owner') {
        document.querySelectorAll('.owner-only').forEach(element => {
            element.style.display = 'none';
        });
    }
});

// Listen for the custom sectionChanged event
document.addEventListener('sectionChanged', (e) => {
    const section = e.detail.section;
    
    // Initialize specific sections when they become active
    if (section === 'pos' && typeof initializePOS === 'function') {
        initializePOS();
    }
});
