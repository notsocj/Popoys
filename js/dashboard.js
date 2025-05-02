document.addEventListener('DOMContentLoaded', () => {
    // Check authentication
    checkAuthStatus();
    
    // Initialize dashboard section
    setupDashboardInterface();
    
    // Setup navigation
    setupNavigation();
    
    // Initialize dashboard data
    loadDashboardData();
    
    // Setup logout button
    document.getElementById('logoutBtn').addEventListener('click', logout);
});

function checkAuthStatus() {
    // Use the helper function instead of direct reference
    const supabaseClient = getSupabaseClient();
    if (!supabaseClient) {
        console.error('Supabase client not available');
        return;
    }
    
    // Check if user is logged in
    supabaseClient.auth.getSession().then(({ data: { session } }) => {
        if (!session) {
            window.location.href = 'index.html';
            return;
        }
        
        // Get and display user name
        const userName = document.getElementById('userName');
        if (userName) {
            userName.textContent = session.user.email.split('@')[0];
        }
        
        // Apply role-based permissions
        applyRolePermissions();
    }).catch(error => {
        console.error('Error checking session:', error);
        // Consider redirecting to login page if session check fails
    });
}

function setupDashboardInterface() {
    const dashboardSection = document.getElementById('dashboard-section');
    if (!dashboardSection) return;
    
    dashboardSection.innerHTML = `
        <h2 class="text-2xl font-bold text-coffee-dark mb-6">Dashboard</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <!-- Summary Cards -->
            <div class="bg-white rounded-lg shadow-md p-6">
                <h3 class="text-sm text-gray-600 mb-1">Today's Sales</h3>
                <div class="text-2xl font-bold text-coffee-dark" id="salesTodayAmount">₱0.00</div>
                <div class="flex items-center mt-2 text-sm text-gray-500">
                    <span id="ordersTodayCount">0 </span> orders today
                </div>
            </div>
            
            <div class="bg-white rounded-lg shadow-md p-6">
                <h3 class="text-sm text-gray-600 mb-1">Low Stock Items</h3>
                <div class="text-2xl font-bold text-coffee-dark" id="lowStockCount">0</div>
                <div class="flex items-center mt-2 text-sm text-gray-500">
                    <span>Items need restocking</span>
                </div>
            </div>
            
            <div class="bg-white rounded-lg shadow-md p-6">
                <h3 class="text-sm text-gray-600 mb-1">Best Selling Product</h3>
                <div class="text-lg font-bold text-coffee-dark truncate" id="bestSellerProduct">-</div>
                <div class="flex items-center mt-2 text-sm text-gray-500">
                    <span>Most popular item</span>
                </div>
            </div>
            
            <div class="bg-white rounded-lg shadow-md p-6">
                <h3 class="text-sm text-gray-600 mb-1">Monthly Sales</h3>
                <div class="text-2xl font-bold text-coffee-dark" id="monthlySales">₱0.00</div>
                <div class="flex items-center mt-2 text-sm text-gray-500">
                    <span>This month</span>
                </div>
            </div>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Sales Trend Chart -->
            <div class="bg-white rounded-lg shadow-md p-6">
                <h3 class="text-lg font-semibold text-coffee-dark mb-4">Sales Trend (Last 7 Days)</h3>
                <div class="h-64 relative">
                    <canvas id="salesTrendChart"></canvas>
                    <div id="salesTrendError" class="absolute inset-0 flex items-center justify-center hidden">
                        <div class="text-red-500 text-center p-4">
                            <i class="fas fa-exclamation-circle text-3xl mb-2"></i>
                            <p>Error loading sales data</p>
                        </div>
                    </div>
                    <div id="salesTrendLoading" class="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80">
                        <div class="text-center text-coffee">
                            <i class="fas fa-spinner fa-spin text-3xl mb-2"></i>
                            <p>Loading data...</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Top Products Chart -->
            <div class="bg-white rounded-lg shadow-md p-6">
                <h3 class="text-lg font-semibold text-coffee-dark mb-4">Top Selling Products</h3>
                <div class="h-64 relative">
                    <canvas id="topProductsChart"></canvas>
                    <div id="topProductsError" class="absolute inset-0 flex items-center justify-center hidden">
                        <div class="text-red-500 text-center p-4">
                            <i class="fas fa-exclamation-circle text-3xl mb-2"></i>
                            <p>Error loading product data</p>
                        </div>
                    </div>
                    <div id="topProductsLoading" class="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80">
                        <div class="text-center text-coffee">
                            <i class="fas fa-spinner fa-spin text-3xl mb-2"></i>
                            <p>Loading data...</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function applyRolePermissions() {
    const userRole = localStorage.getItem('userRole');
    const ownerOnlyElements = document.querySelectorAll('.owner-only');
    
    ownerOnlyElements.forEach(element => {
        if (userRole !== 'Owner') {
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

// Chart instance tracking variables
let salesTrendChartInstance = null;
let topProductsChartInstance = null;

async function loadDashboardData() {
    try {
        // Get Supabase client safely instead of using direct reference
        const supabaseClient = getSupabaseClient();
        if (!supabaseClient) {
            throw new Error('Supabase client is not available');
        }

        // Set a timeout to ensure loading states don't get stuck forever
        const loadingTimeout = setTimeout(() => {
            // Hide all loading indicators if they're still visible after timeout
            document.querySelectorAll('[id$="Loading"]').forEach(element => {
                element.classList.add('hidden');
            });
        }, 10000); // 10 second timeout

        // Get proper today's start and end timestamps
        const now = new Date();
        
        // Start of today (00:00:00)
        const todayStart = new Date(now);
        todayStart.setHours(0, 0, 0, 0);
        
        // End of today (23:59:59)
        const todayEnd = new Date(now);
        todayEnd.setHours(23, 59, 59, 999);
        
        // Get sales for today (properly filtered for just today)
        const { data: todaySales, error: salesError } = await supabaseClient
            .from('orders')
            .select('total_amount')
            .eq('order_status', 'Completed')
            .gte('created_at', todayStart.toISOString())
            .lte('created_at', todayEnd.toISOString());
        
        if (salesError) throw salesError;
        
        // Calculate and display total sales
        const totalSalesAmount = todaySales.reduce((sum, order) => sum + parseFloat(order.total_amount || 0), 0);
        updateElementText('salesTodayAmount', `₱${totalSalesAmount.toFixed(2)}`);
        updateElementText('ordersTodayCount', todaySales.length);
        
        // Get first day of current month
        const firstDayOfMonth = new Date();
        firstDayOfMonth.setDate(1);
        firstDayOfMonth.setHours(0, 0, 0, 0);
        
        const monthStart = firstDayOfMonth.toISOString().split('T')[0];
        
        // Get monthly sales
        try {
            const { data: monthlySales, error: monthlyError } = await supabaseClient
                .from('orders')
                .select('total_amount')
                .eq('order_status', 'Completed')
                .gte('created_at', monthStart);
                
            if (monthlyError) throw monthlyError;
            
            const totalMonthlyAmount = monthlySales.reduce((sum, order) => sum + parseFloat(order.total_amount || 0), 0);
            updateElementText('monthlySales', `₱${totalMonthlyAmount.toFixed(2)}`);
        } catch (monthlyError) {
            console.error('Error loading monthly sales:', monthlyError);
            updateElementText('monthlySales', 'Error');
        }
        
        // Check for low stock items
        try {
            // First try with reorder_level if it exists
            const { data: lowStockItems, error: stockError } = await supabaseClient
                .from('ingredients')
                .select('*')
                .lt('quantity_in_stock', 5); // Using a fixed value as fallback
                
            if (stockError) throw stockError;
            updateElementText('lowStockCount', lowStockItems.length);
        } catch (stockError) {
            console.error('Error loading low stock items:', stockError);
            updateElementText('lowStockCount', '!');
        }
        
        // Try to get best selling product
        try {
            // Try direct query immediately instead of failed RPC
            const { data: orderDetails, error: queryError } = await supabaseClient
                .from('order_details')
                .select(`
                    product_id,
                    quantity,
                    products (product_name)
                `)
                .order('quantity', { ascending: false })
                .limit(1);
                
            if (queryError) {
                console.error('Error in product query:', queryError);
                throw queryError;
            }
            
            if (orderDetails && orderDetails.length > 0 && orderDetails[0].products) {
                updateElementText('bestSellerProduct', orderDetails[0].products.product_name);
            } else {
                updateElementText('bestSellerProduct', 'No data');
            }
        } catch (bestSellerError) {
            console.error('Error loading best seller:', bestSellerError);
            updateElementText('bestSellerProduct', 'Error loading data');
        }
        
        // Load charts
        try {
            await loadSalesTrendChart(supabaseClient);
        } catch (chartError) {
            console.error('Error loading sales trend chart:', chartError);
            document.getElementById('salesTrendLoading').classList.add('hidden');
            document.getElementById('salesTrendError').classList.remove('hidden');
        }
        
        try {
            await loadTopProductsChart(supabaseClient);
        } catch (chartError) {
            console.error('Error loading top products chart:', chartError);
            document.getElementById('topProductsLoading')?.classList.add('hidden');
            document.getElementById('topProductsError')?.classList.remove('hidden');
        }
        
        // Clear the timeout since everything loaded
        clearTimeout(loadingTimeout);
        
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        
        // Ensure loading indicators are hidden in case of error
        document.getElementById('salesTrendLoading')?.classList.add('hidden');
        document.getElementById('topProductsLoading')?.classList.add('hidden');
        
        // Show error message in UI
        const dashboardSection = document.getElementById('dashboard-section');
        if (dashboardSection) {
            const errorAlert = document.createElement('div');
            errorAlert.className = 'bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6';
            errorAlert.innerHTML = `
                <p class="font-bold">Error Loading Dashboard</p>
                <p>${error.message || 'Unknown error'}</p>
            `;
            dashboardSection.insertBefore(errorAlert, dashboardSection.firstChild);
        }
    }
}

// Helper function to safely update element text content
function updateElementText(elementId, text) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = text;
    }
}

async function loadSalesTrendChart(supabaseClient) {
    try {
        // Show loading state
        const loadingElement = document.getElementById('salesTrendLoading');
        if (loadingElement) {
            loadingElement.classList.remove('hidden');
        }
        
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
            
            const { data, error } = await supabaseClient
                .from('orders')
                .select('total_amount')
                .eq('order_status', 'Completed')
                .gte('created_at', date)
                .lt('created_at', nextDay.toISOString().split('T')[0]);
                
            if (error) throw error;
            
            const totalForDay = data.reduce((sum, order) => sum + parseFloat(order.total_amount || 0), 0);
            dailySales.push(totalForDay);
        }
        
        // Format dates for display
        const formattedDates = dates.map(date => {
            const d = new Date(date);
            return d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
        });
        
        // Always hide loading state, regardless of outcome
        if (loadingElement) {
            loadingElement.classList.add('hidden');
        }
        
        // Create chart
        const chartCanvas = document.getElementById('salesTrendChart');
        if (!chartCanvas) {
            throw new Error('Sales trend chart canvas not found');
        }
        
        // Check if Chart.js is available
        if (typeof Chart === 'undefined') {
            console.error('Chart.js is not loaded');
            throw new Error('Chart.js library not found');
        }
        
        // Destroy previous chart instance if it exists
        if (salesTrendChartInstance) {
            salesTrendChartInstance.destroy();
        }
        
        // Create new chart
        salesTrendChartInstance = new Chart(chartCanvas.getContext('2d'), {
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
        
        // Hide loading state and show error state
        const loadingElement = document.getElementById('salesTrendLoading');
        const errorElement = document.getElementById('salesTrendError');
        
        if (loadingElement) {
            loadingElement.classList.add('hidden');
        }
        
        if (errorElement) {
            errorElement.classList.remove('hidden');
        }
    }
}

async function loadTopProductsChart(supabaseClient) {
    try {
        // Show loading state
        const loadingElement = document.getElementById('topProductsLoading');
        if (loadingElement) {
            loadingElement.classList.remove('hidden');
        }
        
        // Skip the RPC call that's failing and go straight to the direct query
        const { data, error } = await supabaseClient
            .from('order_details')
            .select(`
                product_id,
                quantity,
                products (product_name)
            `)
            .order('quantity', { ascending: false })
            .limit(5);
            
        if (error) throw error;
        
        // Always hide loading state, regardless of outcome
        if (loadingElement) {
            loadingElement.classList.add('hidden');
        }
        
        if (!data || data.length === 0) {
            throw new Error('No product data available');
        }
        
        // Transform the data to match the expected format
        const productData = data.map(item => ({
            product_name: item.products?.product_name || 'Unknown Product',
            total_quantity: item.quantity
        }));
        
        const productNames = productData.map(item => item.product_name);
        const salesCounts = productData.map(item => item.total_quantity);
        
        // Create chart
        const chartCanvas = document.getElementById('topProductsChart');
        if (!chartCanvas) {
            throw new Error('Top products chart canvas not found');
        }
        
        // Check if Chart.js is available
        if (typeof Chart === 'undefined') {
            console.error('Chart.js is not loaded');
            throw new Error('Chart.js library not found');
        }
        
        // Destroy previous chart instance if it exists
        if (topProductsChartInstance) {
            topProductsChartInstance.destroy();
        }
        
        // Create new chart
        topProductsChartInstance = new Chart(chartCanvas.getContext('2d'), {
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
    } catch (error) {
        console.error('Error loading top products chart:', error);
        
        // Always hide loading state and show error state
        const loadingElement = document.getElementById('topProductsLoading');
        const errorElement = document.getElementById('topProductsError');
        
        if (loadingElement) {
            loadingElement.classList.add('hidden');
        }
        
        if (errorElement) {
            errorElement.classList.remove('hidden');
        }
        
        // Try to show an empty chart as fallback
        try {
            const chartCanvas = document.getElementById('topProductsChart');
            if (chartCanvas) {
                if (topProductsChartInstance) {
                    topProductsChartInstance.destroy();
                }
                
                // Draw an empty chart as fallback
                topProductsChartInstance = new Chart(chartCanvas.getContext('2d'), {
                    type: 'bar',
                    data: {
                        labels: ['No Data Available'],
                        datasets: [{
                            data: [0],
                            backgroundColor: '#D3D3D3'
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                display: false
                            }
                        }
                    }
                });
            }
        } catch (fallbackError) {
            console.error('Error creating fallback chart:', fallbackError);
        }
    }
}

// Helper function to safely get the Supabase client (copied from other files for consistency)
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

// Placeholder functions for other sections - these should be implemented in their respective files
function initializePOS() {
    if (typeof window.initializePOS === 'function') {
        window.initializePOS();
    } else {
        console.warn('POS initialization function not found');
    }
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
