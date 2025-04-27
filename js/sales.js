document.addEventListener('DOMContentLoaded', () => {
    const salesSection = document.getElementById('sales-section');
    if (salesSection) {
        setupSalesInterface(salesSection);
    }
});

function setupSalesInterface(container) {
    container.innerHTML = `
        <h2 class="text-2xl font-bold text-coffee-dark mb-6">Sales Reports</h2>
        
        <div class="mb-6 bg-white rounded-lg shadow-md p-4">
            <div class="flex flex-wrap gap-4 items-end">
                <div>
                    <label for="report-type" class="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
                    <select id="report-type" class="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-coffee focus:border-coffee">
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="yearly">Yearly</option>
                        <option value="product">Product Sales</option>
                        <option value="ingredient">Ingredient Usage</option>
                    </select>
                </div>
                
                <div id="date-range-container" class="flex gap-4">
                    <div>
                        <label for="start-date" class="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                        <input type="date" id="start-date" class="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-coffee focus:border-coffee">
                    </div>
                    
                    <div>
                        <label for="end-date" class="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                        <input type="date" id="end-date" class="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-coffee focus:border-coffee">
                    </div>
                </div>
                
                <div id="period-container" class="hidden">
                    <label for="period-select" class="block text-sm font-medium text-gray-700 mb-1">Period</label>
                    <select id="period-select" class="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-coffee focus:border-coffee">
                        <!-- Options will be dynamically populated -->
                    </select>
                </div>
                
                <button id="generate-report-btn" class="px-4 py-2 bg-coffee text-white rounded-md hover:bg-coffee-dark transition-colors">
                    Generate Report
                </button>
            </div>
        </div>
        
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div class="bg-white rounded-lg shadow-md p-4">
                <h3 class="text-lg font-semibold text-coffee-dark mb-4">Summary</h3>
                <div id="report-summary" class="space-y-3">
                    <!-- Summary will be loaded here -->
                    <p class="text-gray-500 text-center py-8">Generate a report to see summary data</p>
                </div>
            </div>
            
            <div class="bg-white rounded-lg shadow-md p-4">
                <h3 class="text-lg font-semibold text-coffee-dark mb-4">
                    <span id="chart-title">Sales Trend</span>
                </h3>
                <div class="h-80">
                    <canvas id="sales-chart"></canvas>
                </div>
            </div>
        </div>
        
        <div class="bg-white rounded-lg shadow-md overflow-hidden">
            <div class="flex justify-between items-center p-4 border-b">
                <h3 class="text-lg font-semibold text-coffee-dark" id="details-title">Order Details</h3>
                <button id="export-report-btn" class="px-3 py-1 bg-coffee text-white rounded-md hover:bg-coffee-dark transition-colors">
                    <i class="fas fa-file-export mr-1"></i> Export
                </button>
            </div>
            
            <div class="overflow-x-auto">
                <table class="min-w-full">
                    <thead class="bg-coffee-light text-white">
                        <tr id="report-table-header">
                            <!-- Table header will be dynamically generated -->
                        </tr>
                    </thead>
                    <tbody id="report-table-body">
                        <!-- Report data will be loaded here -->
                        <tr>
                            <td colspan="6" class="py-8 text-center text-gray-500">Generate a report to see detailed data</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;
    
    // Set default dates
    setDefaultDates();
    
    // Setup event listeners
    setupSalesEventListeners();
}

function setDefaultDates() {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - 7);
    
    document.getElementById('start-date').valueAsDate = startOfWeek;
    document.getElementById('end-date').valueAsDate = today;
}

function setupSalesEventListeners() {
    const reportType = document.getElementById('report-type');
    const dateRangeContainer = document.getElementById('date-range-container');
    const periodContainer = document.getElementById('period-container');
    const generateReportBtn = document.getElementById('generate-report-btn');
    const exportReportBtn = document.getElementById('export-report-btn');
    
    reportType.addEventListener('change', () => {
        const selectedType = reportType.value;
        
        if (selectedType === 'weekly' || selectedType === 'monthly' || selectedType === 'yearly') {
            dateRangeContainer.classList.add('hidden');
            periodContainer.classList.remove('hidden');
            
            populatePeriodOptions(selectedType);
        } else {
            dateRangeContainer.classList.remove('hidden');
            periodContainer.classList.add('hidden');
        }
    });
    
    generateReportBtn.addEventListener('click', generateReport);
    exportReportBtn.addEventListener('click', exportReport);
}

function populatePeriodOptions(reportType) {
    const periodSelect = document.getElementById('period-select');
    periodSelect.innerHTML = '';
    
    const today = new Date();
    
    if (reportType === 'weekly') {
        // Generate last 12 weeks
        for (let i = 0; i < 12; i++) {
            const endDate = new Date(today);
            endDate.setDate(today.getDate() - (i * 7));
            
            const startDate = new Date(endDate);
            startDate.setDate(endDate.getDate() - 6);
            
            const option = document.createElement('option');
            option.value = `${startDate.toISOString().split('T')[0]},${endDate.toISOString().split('T')[0]}`;
            option.textContent = `Week ${12-i}: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
            periodSelect.appendChild(option);
        }
    } else if (reportType === 'monthly') {
        // Generate last 12 months
        for (let i = 0; i < 12; i++) {
            const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
            
            const option = document.createElement('option');
            option.value = `${date.toISOString().split('T')[0]},${endDate.toISOString().split('T')[0]}`;
            option.textContent = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
            periodSelect.appendChild(option);
        }
    } else if (reportType === 'yearly') {
        // Generate last 5 years
        const currentYear = today.getFullYear();
        for (let i = 0; i < 5; i++) {
            const year = currentYear - i;
            const option = document.createElement('option');
            option.value = `${year}-01-01,${year}-12-31`;
            option.textContent = year.toString();
            periodSelect.appendChild(option);
        }
    }
}

async function generateReport() {
    const reportType = document.getElementById('report-type').value;
    let startDate, endDate;
    
    if (reportType === 'weekly' || reportType === 'monthly' || reportType === 'yearly') {
        const periodRange = document.getElementById('period-select').value.split(',');
        startDate = periodRange[0];
        endDate = periodRange[1];
    } else {
        startDate = document.getElementById('start-date').value;
        endDate = document.getElementById('end-date').value;
    }
    
    // Add one day to end date for inclusive results
    const adjustedEndDate = new Date(endDate);
    adjustedEndDate.setDate(adjustedEndDate.getDate() + 1);
    const endDateForQuery = adjustedEndDate.toISOString().split('T')[0];
    
    // Clear previous chart
    const chartCanvas = document.getElementById('sales-chart');
    if (window.salesChart) {
        window.salesChart.destroy();
    }
    
    try {
        switch (reportType) {
            case 'daily':
            case 'weekly':
            case 'monthly':
            case 'yearly':
                await generateSalesReport(reportType, startDate, endDateForQuery);
                break;
            case 'product':
                await generateProductSalesReport(startDate, endDateForQuery);
                break;
            case 'ingredient':
                await generateIngredientUsageReport(startDate, endDateForQuery);
                break;
        }
    } catch (error) {
        console.error('Error generating report:', error);
        alert('There was an error generating the report. Please try again.');
    }
}

async function generateSalesReport(reportType, startDate, endDate) {
    try {
        // Fetch orders within date range
        const { data: orders, error } = await supabase
            .from('orders')
            .select('*')
            .eq('order_status', ORDER_STATUS.COMPLETED)
            .gte('created_at', startDate)
            .lt('created_at', endDate)
            .order('created_at');
            
        if (error) throw error;
        
        // Update details title
        document.getElementById('details-title').textContent = 'Order Details';
        document.getElementById('chart-title').textContent = 'Sales Trend';
        
        // Prepare summary data
        const totalSales = orders.reduce((sum, order) => sum + parseFloat(order.total_amount), 0);
        const averageOrderValue = orders.length > 0 ? totalSales / orders.length : 0;
        const salesByPaymentMethod = orders.reduce((acc, order) => {
            acc[order.payment_method] = (acc[order.payment_method] || 0) + parseFloat(order.total_amount);
            return acc;
        }, {});
        
        // Update summary
        const reportSummary = document.getElementById('report-summary');
        reportSummary.innerHTML = `
            <div class="grid grid-cols-2 gap-4">
                <div class="p-3 bg-coffee-cream rounded-lg">
                    <p class="text-sm text-gray-600">Total Orders</p>
                    <p class="text-xl font-bold text-coffee-dark">${orders.length}</p>
                </div>
                <div class="p-3 bg-coffee-cream rounded-lg">
                    <p class="text-sm text-gray-600">Total Sales</p>
                    <p class="text-xl font-bold text-coffee-dark">₱${totalSales.toFixed(2)}</p>
                </div>
                <div class="p-3 bg-coffee-cream rounded-lg">
                    <p class="text-sm text-gray-600">Average Order Value</p>
                    <p class="text-xl font-bold text-coffee-dark">₱${averageOrderValue.toFixed(2)}</p>
                </div>
                <div class="p-3 bg-coffee-cream rounded-lg">
                    <p class="text-sm text-gray-600">Most Used Payment</p>
                    <p class="text-xl font-bold text-coffee-dark">${getMostCommonPayment(orders)}</p>
                </div>
            </div>
            
            <div class="mt-4">
                <h4 class="font-medium mb-2">Payment Methods</h4>
                <div class="space-y-2">
                    ${Object.entries(salesByPaymentMethod).map(([method, amount]) => `
                        <div class="flex justify-between items-center">
                            <span>${method}</span>
                            <span class="font-medium">₱${amount.toFixed(2)}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        // Prepare data for chart based on report type
        let chartData;
        if (reportType === 'daily') {
            chartData = prepareDailySalesData(orders, startDate, endDate);
        } else if (reportType === 'weekly') {
            chartData = prepareWeeklySalesData(orders);
        } else if (reportType === 'monthly') {
            chartData = prepareYearlySalesData(orders, 'month');
        } else if (reportType === 'yearly') {
            chartData = prepareYearlySalesData(orders, 'year');
        }
        
        // Create chart
        createSalesChart(chartData.labels, chartData.data);
        
        // Update table headers
        document.getElementById('report-table-header').innerHTML = `
            <th class="py-3 px-4 text-left">Order ID</th>
            <th class="py-3 px-4 text-left">Date</th>
            <th class="py-3 px-4 text-left">User</th>
            <th class="py-3 px-4 text-left">Items</th>
            <th class="py-3 px-4 text-left">Payment</th>
            <th class="py-3 px-4 text-left">Total</th>
        `;
        
        // Update table body with orders
        const tableBody = document.getElementById('report-table-body');
        
        if (orders.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="6" class="py-8 text-center text-gray-500">No orders found in this date range</td></tr>';
            return;
        }
        
        // Get order details and user information for each order
        let tableContent = '';
        for (const order of orders) {
            // Fetch order details
            const { data: details, error: detailsError } = await supabase
                .from('order_details')
                .select(`
                    quantity,
                    products (
                        product_name
                    )
                `)
                .eq('order_id', order.order_id);
                
            if (detailsError) throw detailsError;
            
            // Fetch user
            const { data: userData, error: userError } = await supabase
                .from('users')
                .select('username')
                .eq('user_id', order.user_id)
                .single();
                
            if (userError && userError.code !== 'PGRST116') throw userError; // PGRST116 is for no rows returned
            
            const username = userData ? userData.username : 'Unknown';
            const orderDate = new Date(order.created_at).toLocaleString();
            const itemsSummary = details.map(d => `${d.quantity} x ${d.products.product_name}`).join(', ');
            
            tableContent += `
                <tr class="border-b hover:bg-gray-50">
                    <td class="py-3 px-4">${order.order_id}</td>
                    <td class="py-3 px-4">${orderDate}</td>
                    <td class="py-3 px-4">${username}</td>
                    <td class="py-3 px-4">${itemsSummary}</td>
                    <td class="py-3 px-4">${order.payment_method}</td>
                    <td class="py-3 px-4">₱${parseFloat(order.total_amount).toFixed(2)}</td>
                </tr>
            `;
        }
        
        tableBody.innerHTML = tableContent;
        
    } catch (error) {
        console.error('Error generating sales report:', error);
        throw error;
    }
}

async function generateProductSalesReport(startDate, endDate) {
    try {
        // Fetch order details with product information within date range
        const { data, error } = await supabase
            .from('orders')
            .select(`
                order_id,
                created_at,
                order_details (
                    quantity,
                    price_each,
                    products (
                        product_id,
                        product_name
                    )
                )
            `)
            .eq('order_status', ORDER_STATUS.COMPLETED)
            .gte('created_at', startDate)
            .lt('created_at', endDate)
            .order('created_at');
            
        if (error) throw error;
        
        // Update titles
        document.getElementById('details-title').textContent = 'Product Sales Details';
        document.getElementById('chart-title').textContent = 'Top Selling Products';
        
        // Aggregate product sales
        const productSales = {};
        let totalQuantitySold = 0;
        let totalRevenue = 0;
        
        data.forEach(order => {
            order.order_details.forEach(detail => {
                const productId = detail.products.product_id;
                const productName = detail.products.product_name;
                const quantity = detail.quantity;
                const subtotal = parseFloat(detail.price_each) * quantity;
                
                if (!productSales[productId]) {
                    productSales[productId] = {
                        name: productName,
                        quantity: 0,
                        revenue: 0
                    };
                }
                
                productSales[productId].quantity += quantity;
                productSales[productId].revenue += subtotal;
                totalQuantitySold += quantity;
                totalRevenue += subtotal;
            });
        });
        
        // Convert to array and sort by quantity
        const productArray = Object.entries(productSales).map(([id, data]) => ({
            id,
            name: data.name,
            quantity: data.quantity,
            revenue: data.revenue
        })).sort((a, b) => b.quantity - a.quantity);
        
        // Prepare chart data (top 5 products)
        const topProducts = productArray.slice(0, 5);
        const chartLabels = topProducts.map(p => p.name);
        const chartData = topProducts.map(p => p.quantity);
        
        // Create chart
        createProductSalesChart(chartLabels, chartData);
        
        // Update summary
        const reportSummary = document.getElementById('report-summary');
        reportSummary.innerHTML = `
            <div class="grid grid-cols-2 gap-4">
                <div class="p-3 bg-coffee-cream rounded-lg">
                    <p class="text-sm text-gray-600">Total Products Sold</p>
                    <p class="text-xl font-bold text-coffee-dark">${totalQuantitySold}</p>
                </div>
                <div class="p-3 bg-coffee-cream rounded-lg">
                    <p class="text-sm text-gray-600">Total Revenue</p>
                    <p class="text-xl font-bold text-coffee-dark">₱${totalRevenue.toFixed(2)}</p>
                </div>
                <div class="p-3 bg-coffee-cream rounded-lg">
                    <p class="text-sm text-gray-600">Unique Products Sold</p>
                    <p class="text-xl font-bold text-coffee-dark">${productArray.length}</p>
                </div>
                <div class="p-3 bg-coffee-cream rounded-lg">
                    <p class="text-sm text-gray-600">Best Selling Product</p>
                    <p class="text-xl font-bold text-coffee-dark">${productArray[0]?.name || 'N/A'}</p>
                </div>
            </div>
        `;
        
        // Update table headers
        document.getElementById('report-table-header').innerHTML = `
            <th class="py-3 px-4 text-left">Product Name</th>
            <th class="py-3 px-4 text-left">Quantity Sold</th>
            <th class="py-3 px-4 text-left">Revenue</th>
            <th class="py-3 px-4 text-left">% of Total Sales</th>
        `;
        
        // Update table body
        const tableBody = document.getElementById('report-table-body');
        
        if (productArray.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="4" class="py-8 text-center text-gray-500">No product sales found in this date range</td></tr>';
            return;
        }
        
        tableBody.innerHTML = productArray.map(product => {
            const percentOfSales = (product.revenue / totalRevenue * 100).toFixed(2);
            
            return `
                <tr class="border-b hover:bg-gray-50">
                    <td class="py-3 px-4">${product.name}</td>
                    <td class="py-3 px-4">${product.quantity}</td>
                    <td class="py-3 px-4">₱${product.revenue.toFixed(2)}</td>
                    <td class="py-3 px-4">${percentOfSales}%</td>
                </tr>
            `;
        }).join('');
        
    } catch (error) {
        console.error('Error generating product sales report:', error);
        throw error;
    }
}

async function generateIngredientUsageReport(startDate, endDate) {
    try {
        // Fetch all orders in date range
        const { data: orders, error: ordersError } = await supabase
            .from('orders')
            .select(`
                order_id,
                order_details (
                    quantity,
                    products (
                        product_id,
                        product_name
                    )
                )
            `)
            .eq('order_status', ORDER_STATUS.COMPLETED)
            .gte('created_at', startDate)
            .lt('created_at', endDate);
            
        if (ordersError) throw ordersError;
        
        // Get all product ingredients
        const { data: productIngredients, error: ingredientsError } = await supabase
            .from('product_ingredients')
            .select(`
                quantity_needed,
                products (
                    product_id
                ),
                ingredients (
                    ingredient_id,
                    ingredient_name,
                    unit
                )
            `);
            
        if (ingredientsError) throw ingredientsError;
        
        // Update titles
        document.getElementById('details-title').textContent = 'Ingredient Usage Details';
        document.getElementById('chart-title').textContent = 'Top Used Ingredients';
        
        // Calculate ingredient usage
        const ingredientUsage = {};
        
        orders.forEach(order => {
            order.order_details.forEach(detail => {
                const productId = detail.products.product_id;
                const orderQuantity = detail.quantity;
                
                const productIngs = productIngredients.filter(pi => 
                    pi.products.product_id === productId
                );
                
                productIngs.forEach(pi => {
                    const ingredientId = pi.ingredients.ingredient_id;
                    const ingredientName = pi.ingredients.ingredient_name;
                    const unit = pi.ingredients.unit;
                    const usageQuantity = parseFloat(pi.quantity_needed) * orderQuantity;
                    
                    if (!ingredientUsage[ingredientId]) {
                        ingredientUsage[ingredientId] = {
                            name: ingredientName,
                            unit: unit,
                            quantity: 0
                        };
                    }
                    
                    ingredientUsage[ingredientId].quantity += usageQuantity;
                });
            });
        });
        
        // Convert to array and sort by usage
        const ingredientArray = Object.entries(ingredientUsage).map(([id, data]) => ({
            id,
            name: data.name,
            unit: data.unit,
            quantity: data.quantity
        })).sort((a, b) => b.quantity - a.quantity);
        
        // Prepare chart data (top 5 ingredients)
        const topIngredients = ingredientArray.slice(0, 5);
        const chartLabels = topIngredients.map(i => i.name);
        const chartData = topIngredients.map(i => i.quantity);
        
        // Create chart
        createIngredientUsageChart(chartLabels, chartData);
        
        // Update summary
        const reportSummary = document.getElementById('report-summary');
        reportSummary.innerHTML = `
            <div class="grid grid-cols-2 gap-4">
                <div class="p-3 bg-coffee-cream rounded-lg">
                    <p class="text-sm text-gray-600">Total Ingredients Used</p>
                    <p class="text-xl font-bold text-coffee-dark">${ingredientArray.length}</p>
                </div>
                <div class="p-3 bg-coffee-cream rounded-lg">
                    <p class="text-sm text-gray-600">Most Used Ingredient</p>
                    <p class="text-xl font-bold text-coffee-dark">${ingredientArray[0]?.name || 'N/A'}</p>
                </div>
                <div class="p-3 bg-coffee-cream rounded-lg">
                    <p class="text-sm text-gray-600">Orders Analyzed</p>
                    <p class="text-xl font-bold text-coffee-dark">${orders.length}</p>
                </div>
                <div class="p-3 bg-coffee-cream rounded-lg">
                    <p class="text-sm text-gray-600">Date Range</p>
                    <p class="text-xl font-bold text-coffee-dark">${formatDateRange(startDate, endDate)}</p>
                </div>
            </div>
        `;
        
        // Update table headers
        document.getElementById('report-table-header').innerHTML = `
            <th class="py-3 px-4 text-left">Ingredient Name</th>
            <th class="py-3 px-4 text-left">Quantity Used</th>
            <th class="py-3 px-4 text-left">Unit</th>
        `;
        
        // Update table body
        const tableBody = document.getElementById('report-table-body');
        
        if (ingredientArray.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="3" class="py-8 text-center text-gray-500">No ingredient usage found in this date range</td></tr>';
            return;
        }
        
        tableBody.innerHTML = ingredientArray.map(ingredient => `
            <tr class="border-b hover:bg-gray-50">
                <td class="py-3 px-4">${ingredient.name}</td>
                <td class="py-3 px-4">${ingredient.quantity.toFixed(2)}</td>
                <td class="py-3 px-4">${ingredient.unit}</td>
            </tr>
        `).join('');
        
    } catch (error) {
        console.error('Error generating ingredient usage report:', error);
        throw error;
    }
}

function createSalesChart(labels, data) {
    const ctx = document.getElementById('sales-chart').getContext('2d');
    
    window.salesChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Sales Amount',
                data: data,
                borderColor: '#8B4513',
                backgroundColor: 'rgba(139, 69, 19, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: (value) => '₱' + value
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: (context) => '₱' + context.parsed.y.toFixed(2)
                    }
                }
            }
        }
    });
}

function createProductSalesChart(labels, data) {
    const ctx = document.getElementById('sales-chart').getContext('2d');
    
    window.salesChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Units Sold',
                data: data,
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

function createIngredientUsageChart(labels, data) {
    const ctx = document.getElementById('sales-chart').getContext('2d');
    
    window.salesChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: [
                    '#8B4513',
                    '#A0522D',
                    '#D2691E',
                    '#CD853F',
                    '#DEB887'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right'
                }
            }
        }
    });
}

function exportReport() {
    const reportType = document.getElementById('report-type').value;
    const tableHeader = document.getElementById('report-table-header');
    const tableBody = document.getElementById('report-table-body');
    
    let title;
    switch (reportType) {
        case 'daily':
            title = 'Daily Sales Report';
            break;
        case 'weekly':
            title = 'Weekly Sales Report';
            break;
        case 'monthly':
            title = 'Monthly Sales Report';
            break;
        case 'yearly':
            title = 'Yearly Sales Report';
            break;
        case 'product':
            title = 'Product Sales Report';
            break;
        case 'ingredient':
            title = 'Ingredient Usage Report';
            break;
    }
    
    let startDate, endDate;
    if (reportType === 'weekly' || reportType === 'monthly' || reportType === 'yearly') {
        const periodRange = document.getElementById('period-select').value.split(',');
        startDate = periodRange[0];
        endDate = periodRange[1];
    } else {
        startDate = document.getElementById('start-date').value;
        endDate = document.getElementById('end-date').value;
    }
    
    // Create CSV content
    let csvContent = `${title}\nDate Range: ${formatDateRange(startDate, endDate)}\n\n`;
    
    // Add header row
    const headers = Array.from(tableHeader.querySelectorAll('th')).map(th => th.textContent.trim());
    csvContent += headers.join(',') + '\n';
    
    // Add data rows
    const rows = Array.from(tableBody.querySelectorAll('tr'));
    rows.forEach(row => {
        const cells = Array.from(row.querySelectorAll('td'));
        if (cells.length === headers.length) { // Skip any special rows
            csvContent += cells.map(cell => `"${cell.textContent.trim()}"`).join(',') + '\n';
        }
    });
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `${title.replace(/\s+/g, '_')}_${startDate}_to_${endDate}.csv`);
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Helper functions for data processing and formatting
function getMostCommonPayment(orders) {
    const payments = {};
    orders.forEach(order => {
        payments[order.payment_method] = (payments[order.payment_method] || 0) + 1;
    });
    
    return Object.entries(payments).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None';
}

function prepareDailySalesData(orders, startDate, endDate) {
    // Create array of all days in range
    const dateLabels = [];
    const salesData = [];
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const dayDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    
    for (let i = 0; i < dayDiff; i++) {
        const currentDate = new Date(start);
        currentDate.setDate(start.getDate() + i);
        
        const dateString = currentDate.toISOString().split('T')[0];
        dateLabels.push(currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        
        // Calculate sales for this day
        const daySales = orders.filter(order => {
            const orderDate = new Date(order.created_at).toISOString().split('T')[0];
            return orderDate === dateString;
        }).reduce((sum, order) => sum + parseFloat(order.total_amount), 0);
        
        salesData.push(daySales);
    }
    
    return { labels: dateLabels, data: salesData };
}

function prepareWeeklySalesData(orders) {
    // Group by week
    const salesByWeek = {};
    
    orders.forEach(order => {
        const orderDate = new Date(order.created_at);
        const weekStart = new Date(orderDate);
        weekStart.setDate(orderDate.getDate() - orderDate.getDay()); // Sunday
        
        const weekKey = weekStart.toISOString().split('T')[0];
        const weekLabel = `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
        
        if (!salesByWeek[weekKey]) {
            salesByWeek[weekKey] = {
                label: weekLabel,
                amount: 0
            };
        }
        
        salesByWeek[weekKey].amount += parseFloat(order.total_amount);
    });
    
    // Sort by date
    const sortedWeeks = Object.entries(salesByWeek)
        .sort(([dateA], [dateB]) => new Date(dateA) - new Date(dateB));
    
    return {
        labels: sortedWeeks.map(([_, data]) => data.label),
        data: sortedWeeks.map(([_, data]) => data.amount)
    };
}

function prepareYearlySalesData(orders, periodType = 'month') {
    const salesByPeriod = {};
    
    orders.forEach(order => {
        const orderDate = new Date(order.created_at);
        let periodKey, periodLabel;
        
        if (periodType === 'month') {
            periodKey = `${orderDate.getFullYear()}-${orderDate.getMonth() + 1}`;
            periodLabel = orderDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        } else {
            periodKey = orderDate.getFullYear().toString();
            periodLabel = periodKey;
        }
        
        if (!salesByPeriod[periodKey]) {
            salesByPeriod[periodKey] = {
                label: periodLabel,
                amount: 0
            };
        }
        
        salesByPeriod[periodKey].amount += parseFloat(order.total_amount);
    });
    
    // Sort by date
    const sortedPeriods = Object.entries(salesByPeriod)
        .sort(([keyA], [keyB]) => keyA.localeCompare(keyB));
    
    return {
        labels: sortedPeriods.map(([_, data]) => data.label),
        data: sortedPeriods.map(([_, data]) => data.amount)
    };
}

function formatDateRange(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
}
