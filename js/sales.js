document.addEventListener('DOMContentLoaded', () => {
    const salesSection = document.getElementById('sales-section');
    if (salesSection) {
        setupSalesInterface(salesSection);
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

function setupSalesInterface(container) {
    // Get current date for default values
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    const todayStr = formatDateForInput(today);
    const firstDayOfMonthStr = formatDateForInput(firstDayOfMonth);
    
    container.innerHTML = `
        <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-bold text-coffee-dark">Sales Reports</h2>
            <div>
                <button id="export-sales-btn" class="px-4 py-2 bg-coffee-dark text-white rounded-md hover:opacity-90 transition-colors">
                    <i class="fas fa-file-export mr-2"></i> Export Report
                </button>
            </div>
        </div>

        <div class="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 class="text-lg font-semibold text-coffee-dark mb-4">Report Options</h3>
            <div class="flex flex-wrap gap-6">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
                    <select id="report-type" class="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-coffee focus:border-coffee">
                        <option value="daily">Daily Report</option>
                        <option value="weekly">Weekly Report</option>
                        <option value="monthly">Monthly Report</option>
                        <option value="custom">Custom Date Range</option>
                    </select>
                </div>
                
                <div id="single-date-container">
                    <label class="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <input type="date" id="report-date" value="${todayStr}" class="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-coffee focus:border-coffee">
                </div>
                
                <div id="date-range-container" class="hidden">
                    <div class="flex gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">From</label>
                            <input type="date" id="start-date" value="${firstDayOfMonthStr}" class="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-coffee focus:border-coffee">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">To</label>
                            <input type="date" id="end-date" value="${todayStr}" class="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-coffee focus:border-coffee">
                        </div>
                    </div>
                </div>
                
                <div class="flex items-end">
                    <button id="generate-report-btn" class="px-4 py-2 bg-coffee text-white rounded-md hover:bg-coffee-dark transition-colors">
                        Generate Report
                    </button>
                </div>
            </div>
        </div>

        <div class="bg-white rounded-lg shadow-md overflow-hidden">
            <div class="px-6 py-4 border-b flex justify-between items-center">
                <h3 class="text-lg font-semibold text-coffee-dark">Detailed Sales</h3>
                <div class="flex gap-2">
                    <input type="text" id="sales-search" placeholder="Search orders..." class="px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-coffee focus:border-coffee">
                </div>
            </div>
            <div class="overflow-x-auto">
                <table class="min-w-full">
                    <thead class="bg-coffee-light text-white">
                        <tr>
                            <th class="py-3 px-4 text-left">Order ID</th>
                            <th class="py-3 px-4 text-left">Date/Time</th>
                            <th class="py-3 px-4 text-left">Items</th>
                            <th class="py-3 px-4 text-left">Payment Method</th>
                            <th class="py-3 px-4 text-left">Status</th>
                            <th class="py-3 px-4 text-left">Total</th>
                        </tr>
                    </thead>
                    <tbody id="sales-table-body">
                        <tr>
                            <td colspan="6" class="py-8 text-center text-gray-500">
                                Generate a report to see detailed sales data
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div id="pagination" class="flex justify-between items-center px-6 py-4 border-t">
                <div class="text-sm text-gray-700">
                    Showing <span id="showing-range">0-0</span> of <span id="total-records">0</span> orders
                </div>
                <div class="flex gap-2">
                    <button id="prev-page" class="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50">
                        Previous
                    </button>
                    <button id="next-page" class="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50">
                        Next
                    </button>
                </div>
            </div>
        </div>
    `;

    // Setup event listeners
    setupSalesEventListeners();
    
    // Default to daily report for today
    generateReport('daily', todayStr);
}

function setupSalesEventListeners() {
    // Report type change
    document.getElementById('report-type').addEventListener('change', function() {
        const singleDateContainer = document.getElementById('single-date-container');
        const dateRangeContainer = document.getElementById('date-range-container');
        
        if (this.value === 'custom') {
            singleDateContainer.classList.add('hidden');
            dateRangeContainer.classList.remove('hidden');
        } else {
            singleDateContainer.classList.remove('hidden');
            dateRangeContainer.classList.add('hidden');
        }
    });
    
    // Generate report button
    document.getElementById('generate-report-btn').addEventListener('click', function() {
        const reportType = document.getElementById('report-type').value;
        
        if (reportType === 'custom') {
            const startDate = document.getElementById('start-date').value;
            const endDate = document.getElementById('end-date').value;
            generateReport('custom', null, startDate, endDate);
        } else {
            const reportDate = document.getElementById('report-date').value;
            generateReport(reportType, reportDate);
        }
    });
    
    // Export report button
    document.getElementById('export-sales-btn').addEventListener('click', exportSalesReport);
    
    // Search functionality
    document.getElementById('sales-search').addEventListener('input', function() {
        filterSalesTable(this.value.toLowerCase());
    });
    
    // Pagination
    document.getElementById('prev-page').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            displayPageData();
        }
    });
    
    document.getElementById('next-page').addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            displayPageData();
        }
    });
}

// Global variables for pagination and data
let allSalesData = [];
let filteredSalesData = [];
let currentPage = 1;
let totalPages = 1;
const itemsPerPage = 10;

// Function to handle report generation
async function generateReport(reportType, dateStr, startDateStr = null, endDateStr = null) {
    try {
        // Show loading states
        document.getElementById('sales-table-body').innerHTML = `
            <tr>
                <td colspan="6" class="py-8 text-center text-gray-500">
                    <i class="fas fa-spinner fa-spin mr-2"></i> Loading sales data...
                </td>
            </tr>
        `;

        // Calculate date ranges based on report type
        let startDate, endDate;
        
        switch (reportType) {
            case 'daily':
                startDate = new Date(dateStr);
                startDate.setHours(0, 0, 0, 0);
                
                endDate = new Date(dateStr);
                endDate.setHours(23, 59, 59, 999);
                break;
                
            case 'weekly':
                startDate = new Date(dateStr);
                const day = startDate.getDay();
                startDate.setDate(startDate.getDate() - day);
                startDate.setHours(0, 0, 0, 0);
                
                endDate = new Date(startDate);
                endDate.setDate(endDate.getDate() + 6);
                endDate.setHours(23, 59, 59, 999);
                break;
                
            case 'monthly':
                startDate = new Date(dateStr);
                startDate.setDate(1);
                startDate.setHours(0, 0, 0, 0);
                
                endDate = new Date(startDate);
                endDate.setMonth(endDate.getMonth() + 1);
                endDate.setDate(0);
                endDate.setHours(23, 59, 59, 999);
                break;
                
            case 'custom':
                startDate = new Date(startDateStr);
                startDate.setHours(0, 0, 0, 0);
                
                endDate = new Date(endDateStr);
                endDate.setHours(23, 59, 59, 999);
                break;
        }
        
        const supabaseClient = getSupabaseClient();
        if (!supabaseClient) {
            throw new Error('Supabase client is not available');
        }
        
        const { data: orders, error } = await supabaseClient
            .from('orders')
            .select('*')
            .gte('created_at', startDate.toISOString())
            .lte('created_at', endDate.toISOString())
            .order('created_at', { ascending: false });
            
        if (error) throw error;
        
        allSalesData = orders;
        filteredSalesData = [...orders];
        currentPage = 1;
        
        updateSalesTable();
        
    } catch (error) {
        console.error('Error generating report:', error);
        
        document.getElementById('sales-table-body').innerHTML = `
            <tr>
                <td colspan="6" class="py-8 text-center text-red-500">
                    Error loading sales data: ${error.message || 'Unknown error'}
                </td>
            </tr>
        `;
    }
}

function updateSalesTable() {
    totalPages = Math.ceil(filteredSalesData.length / itemsPerPage);
    displayPageData();
    document.getElementById('total-records').textContent = filteredSalesData.length;
    updatePaginationButtons();
}

function displayPageData() {
    const tableBody = document.getElementById('sales-table-body');
    
    if (filteredSalesData.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="py-8 text-center text-gray-500">
                    No sales data found for the selected period
                </td>
            </tr>
        `;
        document.getElementById('showing-range').textContent = '0-0';
        return;
    }
    
    const start = (currentPage - 1) * itemsPerPage;
    const end = Math.min(start + itemsPerPage, filteredSalesData.length);
    document.getElementById('showing-range').textContent = `${start + 1}-${end}`;
    
    const pageItems = filteredSalesData.slice(start, end);
    
    tableBody.innerHTML = '';
    
    pageItems.forEach(async (order) => {
        const orderDate = new Date(order.created_at).toLocaleString();
        
        const statusClass = order.order_status === 'Completed' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800';
        
        const row = document.createElement('tr');
        row.className = 'border-b hover:bg-gray-50';
        
        row.dataset.orderId = order.order_id;
        row.dataset.date = orderDate;
        row.dataset.status = order.order_status;
        row.dataset.payment = order.payment_method;
        
        let itemsSummary = 'Loading items...';
        
        try {
            const supabaseClient = getSupabaseClient();
            const { data: details } = await supabaseClient
                .from('order_details')
                .select(`
                    quantity,
                    products (product_name)
                `)
                .eq('order_id', order.order_id);
                
            if (details && details.length > 0) {
                itemsSummary = details.map(d => 
                    `${d.quantity} × ${d.products?.product_name || 'Unknown'}`
                ).join(', ');
            } else {
                itemsSummary = 'No items';
            }
        } catch (error) {
            console.error(`Error fetching details for order ${order.order_id}:`, error);
            itemsSummary = 'Error loading items';
        }
        
        row.innerHTML = `
            <td class="py-3 px-4">${order.order_id}</td>
            <td class="py-3 px-4">${orderDate}</td>
            <td class="py-3 px-4">
                <div class="max-w-xs truncate" title="${itemsSummary}">
                    ${itemsSummary}
                </div>
            </td>
            <td class="py-3 px-4">${order.payment_method}</td>
            <td class="py-3 px-4">
                <span class="px-2 py-1 rounded-full text-xs font-medium ${statusClass}">
                    ${order.order_status}
                </span>
            </td>
            <td class="py-3 px-4">₱${parseFloat(order.total_amount).toFixed(2)}</td>
        `;
        
        tableBody.appendChild(row);
    });
}

function updatePaginationButtons() {
    const prevButton = document.getElementById('prev-page');
    const nextButton = document.getElementById('next-page');
    
    prevButton.disabled = currentPage === 1;
    nextButton.disabled = currentPage === totalPages || totalPages === 0;
}

function filterSalesTable(searchTerm) {
    if (!searchTerm) {
        filteredSalesData = [...allSalesData];
    } else {
        filteredSalesData = allSalesData.filter(order => {
            const orderId = order.order_id.toString().includes(searchTerm);
            const orderDate = new Date(order.created_at).toLocaleString().toLowerCase().includes(searchTerm);
            const orderStatus = order.order_status.toLowerCase().includes(searchTerm);
            const paymentMethod = order.payment_method.toLowerCase().includes(searchTerm);
            
            return orderId || orderDate || orderStatus || paymentMethod;
        });
    }
    
    currentPage = 1;
    updateSalesTable();
}

function exportSalesReport() {
    const reportType = document.getElementById('report-type').value;
    let title = 'Sales Report';
    
    switch (reportType) {
        case 'daily':
            const reportDate = document.getElementById('report-date').value;
            title = `Daily Sales Report - ${reportDate}`;
            break;
        case 'weekly':
            title = 'Weekly Sales Report';
            break;
        case 'monthly':
            title = 'Monthly Sales Report';
            break;
        case 'custom':
            const startDate = document.getElementById('start-date').value;
            const endDate = document.getElementById('end-date').value;
            title = `Sales Report (${startDate} to ${endDate})`;
            break;
    }
    
    let csvContent = 'Order ID,Date/Time,Payment Method,Status,Total\n';
    
    filteredSalesData.forEach(order => {
        const orderDate = new Date(order.created_at).toLocaleString();
        csvContent += `"${order.order_id}","${orderDate}","${order.payment_method}","${order.order_status}","${parseFloat(order.total_amount).toFixed(2)}"\n`;
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${title.replace(/\s+/g, '_')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    alert('Sales report exported successfully!');
}

function formatDateForInput(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}
