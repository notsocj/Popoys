document.addEventListener('DOMContentLoaded', () => {
    // Check authentication
    checkAuthStatus();
    
    // Setup navigation
    setupNavigation();
    
    // Initialize dashboard data
    loadDashboardData();
    
    // Setup logout button
    document.getElementById('logoutBtn').addEventListener('click', logout);
});

function checkAuthStatus() {
    // Check if user is logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
        if (!session) {
            window.location.href = 'index.html';
            return;
        }
        
        // Get and display user name
        const userName = document.getElementById('userName');
        userName.textContent = session.user.email.split('@')[0];
        
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

function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Remove active class from all links and sections
            navLinks.forEach(l => l.classList.remove('active'));
            document.querySelectorAll('.section').forEach(s => s.classList.add('hidden'));
            
            // Add active class to clicked link
            link.classList.add('active');
            
            // Show corresponding section
            const sectionId = link.getAttribute('data-section') + '-section';
            document.getElementById(sectionId).classList.remove('hidden');
            
            // Load section-specific data
            if (link.getAttribute('data-section') === 'dashboard') {
                loadDashboardData();
            } else if (link.getAttribute('data-section') === 'pos') {
                initializePOS();
            } else if (link.getAttribute('data-section') === 'inventory') {
                loadInventoryData();
            } else if (link.getAttribute('data-section') === 'sales') {
                loadSalesReport();
            } else if (link.getAttribute('data-section') === 'voids') {
                loadVoidedSales();
            } else if (link.getAttribute('data-section') === 'users') {
                loadUserManagement();
            }
        });
    });
}

async function loadDashboardData() {
    try {
        // Get today's date in YYYY-MM-DD format
        const today = new Date().toISOString().split('T')[0];
        
        // Get sales for today
        const { data: todaySales, error: salesError } = await supabase
            .from('orders')
            .select('total_amount')
            .eq('order_status', ORDER_STATUS.COMPLETED)
            .gte('created_at', today);
        
        if (salesError) throw salesError;
        
        // Calculate and display total sales
        const totalSalesAmount = todaySales.reduce((sum, order) => sum + parseFloat(order.total_amount), 0);
        document.getElementById('salesTodayAmount').textContent = `₱${totalSalesAmount.toFixed(2)}`;
        document.getElementById('ordersTodayCount').textContent = todaySales.length;
        
        // Check for low stock items
        const { data: lowStockItems, error: stockError } = await supabase
            .from('ingredients')
            .select('*')
            .lt('quantity_in_stock', supabase.raw('reorder_level'));
        
        if (stockError) throw stockError;
        document.getElementById('lowStockCount').textContent = lowStockItems.length;
        
        // Get best selling product
        const { data: bestSeller, error: bestSellerError } = await supabase
            .rpc('get_best_selling_product');
            
        if (bestSellerError) throw bestSellerError;
        
        if (bestSeller && bestSeller.length > 0) {
            document.getElementById('bestSellerProduct').textContent = bestSeller[0].product_name;
        }
        
        // Load charts
        loadSalesTrendChart();
        loadTopProductsChart();
        
    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
}

async function loadSalesTrendChart() {
    try {
        // Get last 7 days dates
        const dates = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            dates.push(date.toISOString().split('T')[0]);
        }
        
        // Get sales data for each date
        const dailySales = [];
        
        for (const date of dates) {
            const nextDay = new Date(date);
            nextDay.setDate(nextDay.getDate() + 1);
            
            const { data, error } = await supabase
                .from('orders')
                .select('total_amount')
                .eq('order_status', ORDER_STATUS.COMPLETED)
                .gte('created_at', date)
                .lt('created_at', nextDay.toISOString().split('T')[0]);
                
            if (error) throw error;
            
            const totalForDay = data.reduce((sum, order) => sum + parseFloat(order.total_amount), 0);
            dailySales.push(totalForDay);
        }
        
        // Format dates for display
        const formattedDates = dates.map(date => {
            const d = new Date(date);
            return d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
        });
        
        // Create chart
        const ctx = document.getElementById('salesTrendChart').getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: formattedDates,
                datasets: [{
                    label: 'Daily Sales',
                    data: dailySales,
                    borderColor: '#8B4513',
                    backgroundColor: 'rgba(139, 69, 19, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '₱' + value;
                            }
                        }
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error loading sales trend chart:', error);
    }
}

async function loadTopProductsChart() {
    try {
        // Get top 5 selling products
        const { data, error } = await supabase.rpc('get_top_selling_products', { limit_count: 5 });
        
        if (error) throw error;
        
        if (data && data.length > 0) {
            const productNames = data.map(item => item.product_name);
            const salesCounts = data.map(item => item.total_quantity);
            
            // Create chart
            const ctx = document.getElementById('topProductsChart').getContext('2d');
            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: productNames,
                    datasets: [{
                        label: 'Units Sold',
                        data: salesCounts,
                        backgroundColor: [
                            '#8B4513',
                            '#A0522D',
                            '#D2691E',
                            '#CD853F',
                            '#DEB887'
                        ],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                precision: 0
                            }
                        }
                    }
                }
            });
        }
    } catch (error) {
        console.error('Error loading top products chart:', error);
    }
}

// Placeholder functions for other sections
function initializePOS() {
    // This will be implemented in another file
}

function loadInventoryData() {
    // This will be implemented in another file
}

function loadSalesReport() {
    // This will be implemented in another file
}

function loadVoidedSales() {
    // This will be implemented in another file
}

function loadUserManagement() {
    // This will be implemented in another file
}
