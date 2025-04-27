document.addEventListener('DOMContentLoaded', () => {
    const dailySalesSection = document.getElementById('daily-sales-section');
    if (dailySalesSection) {
        setupDailySalesInterface(dailySalesSection);
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

function setupDailySalesInterface(container) {
    container.innerHTML = `
        <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-bold text-coffee-dark">Daily Sales</h2>
            <div class="flex gap-4">
                <input type="date" id="sales-date" class="px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-coffee focus:border-coffee">
                <button id="load-sales-btn" class="bg-coffee text-white px-4 py-2 rounded-md hover:bg-coffee-dark transition-colors">
                    <i class="fas fa-search mr-2"></i> View Sales
                </button>
                <button id="export-daily-sales-btn" class="px-4 py-2 bg-coffee-dark text-white rounded-md hover:opacity-90 transition-colors">
                    <i class="fas fa-file-export mr-2"></i> Export
                </button>
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div class="bg-white rounded-lg shadow-md p-6">
                <h3 class="text-lg font-semibold text-coffee-dark mb-4">Summary</h3>
                <div id="daily-sales-summary" class="space-y-4">
                    <div class="flex justify-between pb-2 border-b">
                        <span class="text-gray-600">Total Orders</span>
                        <span class="font-medium" id="total-orders">0</span>
                    </div>
                    <div class="flex justify-between pb-2 border-b">
                        <span class="text-gray-600">Total Sales</span>
                        <span class="font-medium" id="total-sales">₱0.00</span>
                    </div>
                    <div class="flex justify-between pb-2 border-b">
                        <span class="text-gray-600">Average Order Value</span>
                        <span class="font-medium" id="average-order">₱0.00</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-600">Most Popular Payment Method</span>
                        <span class="font-medium" id="popular-payment">-</span>
                    </div>
                </div>
            </div>

            <div class="bg-white rounded-lg shadow-md p-6">
                <h3 class="text-lg font-semibold text-coffee-dark mb-4">Best Selling Items</h3>
                <div id="best-selling-items" class="space-y-2">
                    <p class="text-center text-gray-500 py-8">Select a date to view best selling items</p>
                </div>
            </div>
        </div>

        <div class="bg-white rounded-lg shadow-md overflow-hidden">
            <div class="px-6 py-4 border-b">
                <h3 class="text-lg font-semibold text-coffee-dark">Order Details</h3>
            </div>
            <div class="overflow-x-auto">
                <table class="min-w-full">
                    <thead class="bg-coffee-light text-white">
                        <tr>
                            <th class="py-3 px-4 text-left">Order ID</th>
                            <th class="py-3 px-4 text-left">Time</th>
                            <th class="py-3 px-4 text-left">Items</th>
                            <th class="py-3 px-4 text-left">Payment</th>
                            <th class="py-3 px-4 text-left">Status</th>
                            <th class="py-3 px-4 text-left">Total</th>
                            <th class="py-3 px-4 text-left">Actions</th>
                        </tr>
                    </thead>
                    <tbody id="daily-orders-table">
                        <tr>
                            <td colspan="7" class="py-8 text-center text-gray-500">Select a date to view orders</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Edit Order Modal -->
        <div id="edit-sales-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden">
            <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                <h3 class="text-xl font-bold text-coffee-dark mb-4">Edit Order Status</h3>
                
                <div class="mb-6">
                    <div class="flex items-center justify-between mb-2">
                        <span class="text-gray-700">Order ID:</span>
                        <span id="edit-sales-id" class="font-semibold"></span>
                    </div>
                    <div class="flex items-center justify-between mb-2">
                        <span class="text-gray-700">Time:</span>
                        <span id="edit-sales-time" class="font-semibold"></span>
                    </div>
                    <div class="flex items-center justify-between">
                        <span class="text-gray-700">Amount:</span>
                        <span id="edit-sales-amount" class="font-semibold"></span>
                    </div>
                </div>
                
                <div class="mb-6">
                    <label class="block text-sm font-medium text-gray-700 mb-1">Order Status</label>
                    <div class="flex gap-6">
                        <label class="flex items-center">
                            <input type="radio" name="sales-status" value="Completed" class="mr-2">
                            <span>Completed</span>
                        </label>
                        <label class="flex items-center">
                            <input type="radio" name="sales-status" value="Voided" class="mr-2">
                            <span>Voided</span>
                        </label>
                    </div>
                </div>
                
                <div id="sales-void-reason-container" class="mb-6 hidden">
                    <label for="sales-void-reason" class="block text-sm font-medium text-gray-700 mb-1">Reason for Voiding</label>
                    <textarea id="sales-void-reason" rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-coffee focus:border-coffee"></textarea>
                </div>
                
                <div class="flex justify-end gap-4">
                    <button type="button" id="cancel-sales-edit-btn" class="px-4 py-2 text-coffee-dark border border-coffee-dark rounded-md hover:bg-coffee-light hover:text-white transition-colors">
                        Cancel
                    </button>
                    <button type="button" id="save-sales-btn" class="px-4 py-2 bg-coffee text-white rounded-md hover:bg-coffee-dark transition-colors">
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    `;

    // Set default date to today
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    document.getElementById('sales-date').value = `${yyyy}-${mm}-${dd}`;
    
    // Add event listeners
    setupDailySalesEventListeners();
    
    // Load today's sales automatically
    loadDailySales();
}

function setupDailySalesEventListeners() {
    document.getElementById('load-sales-btn').addEventListener('click', loadDailySales);
    document.getElementById('export-daily-sales-btn').addEventListener('click', exportDailySales);
    
    // Order status radio buttons
    const statusRadios = document.querySelectorAll('input[name="sales-status"]');
    statusRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            const voidReasonContainer = document.getElementById('sales-void-reason-container');
            if (radio.value === 'Voided') {
                voidReasonContainer.classList.remove('hidden');
            } else {
                voidReasonContainer.classList.add('hidden');
            }
        });
    });
    
    // Modal buttons
    document.getElementById('cancel-sales-edit-btn').addEventListener('click', hideEditSalesModal);
    document.getElementById('save-sales-btn').addEventListener('click', saveOrderStatusChanges);
    
    // Event delegation for edit buttons
    document.getElementById('daily-orders-table').addEventListener('click', e => {
        if (e.target.closest('.edit-sales-btn')) {
            const orderId = e.target.closest('.edit-sales-btn').dataset.id;
            showEditSalesModal(orderId);
        }
    });
}

async function loadDailySales() {
    try {
        const selectedDate = document.getElementById('sales-date').value;
        const startDate = new Date(selectedDate);
        startDate.setHours(0, 0, 0, 0);
        
        const endDate = new Date(selectedDate);
        endDate.setHours(23, 59, 59, 999);
        
        // Show loading state
        document.getElementById('daily-orders-table').innerHTML = 
            '<tr><td colspan="7" class="py-8 text-center text-gray-500"><i class="fas fa-spinner fa-spin mr-2"></i>Loading orders...</td></tr>';
        
        // Keep the structure intact while showing loading state
        document.getElementById('daily-sales-summary').innerHTML = `
            <div class="flex justify-between pb-2 border-b">
                <span class="text-gray-600">Total Orders</span>
                <span class="font-medium" id="total-orders"><i class="fas fa-spinner fa-spin text-sm"></i></span>
            </div>
            <div class="flex justify-between pb-2 border-b">
                <span class="text-gray-600">Total Sales</span>
                <span class="font-medium" id="total-sales"><i class="fas fa-spinner fa-spin text-sm"></i></span>
            </div>
            <div class="flex justify-between pb-2 border-b">
                <span class="text-gray-600">Average Order Value</span>
                <span class="font-medium" id="average-order"><i class="fas fa-spinner fa-spin text-sm"></i></span>
            </div>
            <div class="flex justify-between">
                <span class="text-gray-600">Most Popular Payment Method</span>
                <span class="font-medium" id="popular-payment"><i class="fas fa-spinner fa-spin text-sm"></i></span>
            </div>
        `;
        
        document.getElementById('best-selling-items').innerHTML = `
            <div class="flex justify-center py-4">
                <i class="fas fa-spinner fa-spin mr-2"></i> Loading best sellers...
            </div>
        `;
        
        // Get Supabase client safely
        const supabaseClient = getSupabaseClient();
        if (!supabaseClient) {
            throw new Error('Supabase client is not available');
        }
        
        // Load orders using the safely obtained client
        const { data: orders, error } = await supabaseClient
            .from('orders')
            .select('*')
            .gte('created_at', startDate.toISOString())
            .lt('created_at', endDate.toISOString())
            .order('created_at', { ascending: false });
            
        if (error) throw error;
        
        if (!orders) {
            throw new Error('No data returned from database');
        }
        
        // Update the UI with the retrieved data
        updateSalesSummary(orders);
        await loadBestSellingItems(startDate, endDate);
        await displayOrderDetails(orders);
        
    } catch (error) {
        console.error('Error loading daily sales:', error);
        // Clear any previous content
        const ordersTable = document.getElementById('daily-orders-table');
        if (ordersTable) {
            ordersTable.innerHTML = 
                `<tr><td colspan="7" class="py-8 text-center text-red-500">Error loading sales: ${error.message || 'Unknown error'}</td></tr>`;
        }
        
        const summarySection = document.getElementById('daily-sales-summary');
        if (summarySection) {
            // Don't completely replace the summary section - this preserves the child elements
            // Instead, add error message at the top
            summarySection.innerHTML = `
                <div class="py-4 text-red-500 mb-4">
                    <p>Error loading sales data. Please check your connection and try again.</p>
                    <p class="text-xs mt-2">Details: ${error.message || 'Unknown error'}</p>
                </div>
                <div class="flex justify-between pb-2 border-b">
                    <span class="text-gray-600">Total Orders</span>
                    <span class="font-medium" id="total-orders">0</span>
                </div>
                <div class="flex justify-between pb-2 border-b">
                    <span class="text-gray-600">Total Sales</span>
                    <span class="font-medium" id="total-sales">₱0.00</span>
                </div>
                <div class="flex justify-between pb-2 border-b">
                    <span class="text-gray-600">Average Order Value</span>
                    <span class="font-medium" id="average-order">₱0.00</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-gray-600">Most Popular Payment Method</span>
                    <span class="font-medium" id="popular-payment">-</span>
                </div>
            `;
        }
        
        const bestSellingItems = document.getElementById('best-selling-items');
        if (bestSellingItems) {
            bestSellingItems.innerHTML = 
                '<p class="text-center text-red-500 py-8">Error loading sales data</p>';
        }
    }
}

function updateSalesSummary(orders) {
    // Filter completed orders for sales calculations
    const completedOrders = orders.filter(order => order.order_status === 'Completed');
    
    // Calculate totals
    const totalOrders = orders.length;
    const totalSales = completedOrders.reduce((sum, order) => sum + parseFloat(order.total_amount), 0);
    const avgOrderValue = completedOrders.length > 0 ? totalSales / completedOrders.length : 0;
    
    // Find most popular payment method
    const paymentMethods = {};
    completedOrders.forEach(order => {
        paymentMethods[order.payment_method] = (paymentMethods[order.payment_method] || 0) + 1;
    });
    
    let popularPayment = '-';
    let maxCount = 0;
    
    Object.entries(paymentMethods).forEach(([method, count]) => {
        if (count > maxCount) {
            maxCount = count;
            popularPayment = method;
        }
    });
    
    // Update the summary section - add null checks before updating elements
    const totalOrdersElement = document.getElementById('total-orders');
    if (totalOrdersElement) {
        totalOrdersElement.textContent = `${completedOrders.length} / ${totalOrders}`;
    }
    
    const totalSalesElement = document.getElementById('total-sales');
    if (totalSalesElement) {
        totalSalesElement.textContent = `₱${totalSales.toFixed(2)}`;
    }
    
    const averageOrderElement = document.getElementById('average-order');
    if (averageOrderElement) {
        averageOrderElement.textContent = `₱${avgOrderValue.toFixed(2)}`;
    }
    
    const popularPaymentElement = document.getElementById('popular-payment');
    if (popularPaymentElement) {
        popularPaymentElement.textContent = popularPayment;
    }
}

async function loadBestSellingItems(startDate, endDate) {
    try {
        // Get Supabase client safely
        const supabaseClient = getSupabaseClient();
        if (!supabaseClient) {
            throw new Error('Supabase client is not available');
        }
        
        let data = null;
        let error = null;
        
        try {
            // First try the RPC method
            const result = await supabaseClient.rpc('get_best_selling_products', {
                start_date: startDate.toISOString(),
                end_date: endDate.toISOString(),
                limit_count: 5
            });
            
            data = result.data;
            error = result.error;
            
            if (error || !data) {
                throw new Error('RPC method failed');
            }
        } catch (rpcError) {
            console.warn('RPC call failed, using fallback query', rpcError);
            
            // Fallback to direct query if RPC isn't available
            const { data: queryData, error: queryError } = await supabaseClient
                .from('order_details')
                .select(`
                    product_id,
                    products (
                        product_id,
                        product_name
                    ),
                    quantity,
                    price_each,
                    orders!inner (
                        order_status,
                        created_at
                    )
                `)
                .eq('orders.order_status', 'Completed')
                .gte('orders.created_at', startDate.toISOString())
                .lt('orders.created_at', endDate.toISOString());
                
            if (queryError) throw queryError;
            
            // Process the data similarly to what the RPC would return
            const productSales = {};
            
            if (queryData && queryData.length > 0) {
                queryData.forEach(detail => {
                    const productId = detail.product_id;
                    const productName = detail.products?.product_name;
                    const quantity = detail.quantity;
                    const sales = detail.quantity * detail.price_each;
                    
                    if (!productSales[productId]) {
                        productSales[productId] = {
                            product_id: productId,
                            product_name: productName || 'Unknown Product',
                            total_quantity: 0,
                            total_sales: 0
                        };
                    }
                    
                    productSales[productId].total_quantity += quantity;
                    productSales[productId].total_sales += sales;
                });
                
                // Convert to array and sort
                data = Object.values(productSales).sort((a, b) => b.total_quantity - a.total_quantity).slice(0, 5);
            } else {
                data = [];
            }
        }
        
        const bestSellingContainer = document.getElementById('best-selling-items');
        
        if (!data || data.length === 0) {
            bestSellingContainer.innerHTML = '<p class="text-center text-gray-500 py-8">No sales data available for this date</p>';
            return;
        }
        
        let content = '';
        data.forEach((item, index) => {
            content += `
                <div class="flex justify-between items-center pb-2 ${index < data.length - 1 ? 'border-b' : ''}">
                    <div>
                        <span class="font-medium">${item.product_name}</span>
                        <div class="text-sm text-gray-600">${item.total_quantity} sold</div>
                    </div>
                    <span class="font-medium">₱${parseFloat(item.total_sales).toFixed(2)}</span>
                </div>
            `;
        });
        
        bestSellingContainer.innerHTML = content;
        
    } catch (error) {
        console.error('Error loading best selling items:', error);
        document.getElementById('best-selling-items').innerHTML = 
            `<p class="text-center text-red-500 py-8">Error loading best selling items: ${error.message || 'Unknown error'}</p>`;
    }
}

async function displayOrderDetails(orders) {
    try {
        const tableBody = document.getElementById('daily-orders-table');
        
        if (orders.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="7" class="py-8 text-center text-gray-500">No orders found for this date</td></tr>';
            return;
        }
        
        let tableContent = '';
        
        // Get Supabase client safely
        const supabaseClient = getSupabaseClient();
        if (!supabaseClient) {
            throw new Error('Supabase client is not available');
        }
        
        for (const order of orders) {
            try {
                // Fetch order details using direct supabase access
                const { data: details, error: detailsError } = await supabaseClient
                    .from('order_details')
                    .select(`
                        quantity,
                        products (
                            product_name
                        )
                    `)
                    .eq('order_id', order.order_id);
                    
                if (detailsError) throw detailsError;
                
                const orderTime = new Date(order.created_at).toLocaleTimeString();
                const itemsSummary = details && details.length > 0 
                    ? details.map(d => `${d.quantity} x ${d.products?.product_name || 'Unknown Product'}`).join(', ')
                    : 'No items';
                
                const statusClass = order.order_status === 'Completed' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800';
                
                tableContent += `
                    <tr class="border-b hover:bg-gray-50">
                        <td class="py-3 px-4">${order.order_id}</td>
                        <td class="py-3 px-4">${orderTime}</td>
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
                        <td class="py-3 px-4">
                            <button class="edit-sales-btn text-coffee hover:text-coffee-dark" data-id="${order.order_id}">
                                <i class="fas fa-edit"></i>
                            </button>
                        </td>
                    </tr>
                `;
            } catch (itemError) {
                console.error(`Error processing order ${order.order_id}:`, itemError);
                // Skip this order if there's an error, but don't fail the entire function
                continue;
            }
        }
        
        if (!tableContent) {
            tableBody.innerHTML = '<tr><td colspan="7" class="py-8 text-center text-gray-500">Could not retrieve order details</td></tr>';
        } else {
            tableBody.innerHTML = tableContent;
        }
        
    } catch (error) {
        console.error('Error displaying order details:', error);
        document.getElementById('daily-orders-table').innerHTML = 
            `<tr><td colspan="7" class="py-8 text-center text-red-500">Error loading order details: ${error.message || 'Unknown error'}</td></tr>`;
    }
}

async function showEditSalesModal(orderId) {
    try {
        // Get Supabase client safely
        const supabaseClient = getSupabaseClient();
        if (!supabaseClient) {
            throw new Error('Supabase client is not available');
        }
        
        const { data: order, error } = await supabaseClient
            .from('orders')
            .select('*')
            .eq('order_id', orderId)
            .single();
            
        if (error) throw error;
        
        // Get void reason if the order is voided
        let voidReason = '';
        if (order.order_status === 'Voided') {
            const { data: voidData, error: voidError } = await supabaseClient
                .from('voided_sales')
                .select('reason')
                .eq('order_id', orderId)
                .single();
                
            if (!voidError && voidData) {
                voidReason = voidData.reason;
            }
        }
        
        // Populate the modal
        document.getElementById('edit-sales-id').textContent = order.order_id;
        document.getElementById('edit-sales-time').textContent = new Date(order.created_at).toLocaleString();
        document.getElementById('edit-sales-amount').textContent = `₱${parseFloat(order.total_amount).toFixed(2)}`;
        
        // Set the current status
        const statusRadios = document.querySelectorAll('input[name="sales-status"]');
        statusRadios.forEach(radio => {
            if (radio.value === order.order_status) {
                radio.checked = true;
            }
        });
        
        // Show/hide void reason container
        const voidReasonContainer = document.getElementById('sales-void-reason-container');
        if (order.order_status === 'Voided') {
            voidReasonContainer.classList.remove('hidden');
        } else {
            voidReasonContainer.classList.add('hidden');
        }
        
        // Set void reason if available
        document.getElementById('sales-void-reason').value = voidReason;
        
        // Show the modal
        document.getElementById('edit-sales-modal').classList.remove('hidden');
        
    } catch (error) {
        console.error('Error fetching order details:', error);
        alert('Error fetching order details: ' + (error.message || 'Unknown error'));
    }
}

function hideEditSalesModal() {
    document.getElementById('edit-sales-modal').classList.add('hidden');
}

async function saveOrderStatusChanges() {
    try {
        const orderId = document.getElementById('edit-sales-id').textContent;
        const newStatus = document.querySelector('input[name="sales-status"]:checked').value;
        const userId = localStorage.getItem('userId');
        
        // Get Supabase client safely
        const supabaseClient = getSupabaseClient();
        if (!supabaseClient) {
            throw new Error('Supabase client is not available');
        }
        
        // Get current order status
        const { data: currentOrder, error: orderError } = await supabaseClient
            .from('orders')
            .select('order_status')
            .eq('order_id', orderId)
            .single();
            
        if (orderError) throw orderError;
        
        // If status hasn't changed, just close the modal
        if (currentOrder.order_status === newStatus) {
            hideEditSalesModal();
            return;
        }
        
        // Update order status
        const { error: updateError } = await supabaseClient
            .from('orders')
            .update({ order_status: newStatus })
            .eq('order_id', orderId);
            
        if (updateError) throw updateError;
        
        // Handle inventory and void records
        if (newStatus === 'Voided' && currentOrder.order_status === 'Completed') {
            // Order changed from Completed to Voided
            
            // Get reason
            const voidReason = document.getElementById('sales-void-reason').value;
            if (!voidReason) {
                alert('Please provide a reason for voiding this order');
                return;
            }
            
            // Add void record
            const { error: voidError } = await supabaseClient
                .from('voided_sales')
                .insert([{
                    order_id: orderId,
                    user_id: userId,
                    reason: voidReason
                }]);
                
            if (voidError) throw voidError;
            
            // Return ingredients to inventory
            await returnIngredientsToInventory(orderId);
            
        } else if (newStatus === 'Completed' && currentOrder.order_status === 'Voided') {
            // Order changed from Voided to Completed
            
            // Delete void record
            const { error: deleteVoidError } = await supabaseClient
                .from('voided_sales')
                .delete()
                .eq('order_id', orderId);
                
            if (deleteVoidError) throw deleteVoidError;
            
            // Deduct ingredients from inventory again
            await deductIngredientsFromInventory(orderId);
        }
        
        // Hide modal and refresh the sales data
        hideEditSalesModal();
        await loadDailySales();
        
        alert(`Order #${orderId} has been updated to "${newStatus}" status`);
        
    } catch (error) {
        console.error('Error updating order:', error);
        alert(`Error updating order: ${error.message || 'Unknown error'}`);
    }
}

async function returnIngredientsToInventory(orderId) {
    try {
        // Get Supabase client safely
        const supabaseClient = getSupabaseClient();
        if (!supabaseClient) {
            throw new Error('Supabase client is not available');
        }
        
        // Get the order details
        const { data: orderDetails, error: detailsError } = await supabaseClient
            .from('order_details')
            .select(`
                product_id,
                quantity
            `)
            .eq('order_id', orderId);
            
        if (detailsError) throw detailsError;
        
        // For each product in the order
        for (const detail of orderDetails) {
            // Get ingredients for this product
            const { data: productIngredients, error: ingredientsError } = await supabaseClient
                .from('product_ingredients')
                .select('ingredient_id, quantity_needed')
                .eq('product_id', detail.product_id);
                
            if (ingredientsError) throw ingredientsError;
            
            // Add back each ingredient to inventory
            for (const ingredient of productIngredients) {
                const totalAmount = parseFloat(ingredient.quantity_needed) * detail.quantity;
                
                // Update ingredient stock
                const { error: updateError } = await supabaseClient.rpc('increment_ingredient_stock', {
                    ing_id: ingredient.ingredient_id,
                    add_amount: totalAmount
                });
                
                if (updateError) throw updateError;
            }
        }
    } catch (error) {
        console.error('Error returning ingredients to inventory:', error);
        throw error;
    }
}

async function deductIngredientsFromInventory(orderId) {
    try {
        // Get Supabase client safely
        const supabaseClient = getSupabaseClient();
        if (!supabaseClient) {
            throw new Error('Supabase client is not available');
        }
        
        // Get the order details
        const { data: orderDetails, error: detailsError } = await supabaseClient
            .from('order_details')
            .select(`
                product_id,
                quantity
            `)
            .eq('order_id', orderId);
            
        if (detailsError) throw detailsError;
        
        // For each product in the order
        for (const detail of orderDetails) {
            // Get ingredients for this product
            const { data: productIngredients, error: ingredientsError } = await supabaseClient
                .from('product_ingredients')
                .select('ingredient_id, quantity_needed')
                .eq('product_id', detail.product_id);
                
            if (ingredientsError) throw ingredientsError;
            
            // Deduct each ingredient from inventory
            for (const ingredient of productIngredients) {
                const totalAmount = parseFloat(ingredient.quantity_needed) * detail.quantity;
                
                // Update ingredient stock
                const { error: updateError } = await supabaseClient.rpc('decrement_ingredient_stock', {
                    ing_id: ingredient.ingredient_id,
                    used_amount: totalAmount
                });
                
                if (updateError) throw updateError;
            }
        }
    } catch (error) {
        console.error('Error deducting ingredients from inventory:', error);
        throw error;
    }
}

function exportDailySales() {
    const selectedDate = document.getElementById('sales-date').value;
    const dateString = new Date(selectedDate).toLocaleDateString();
    
    // Get table data
    const table = document.getElementById('daily-orders-table');
    const rows = table.querySelectorAll('tr');
    
    if (rows.length === 0 || (rows.length === 1 && rows[0].querySelector('td').colSpan)) {
        alert('No data to export');
        return;
    }
    
    // Create CSV content
    let csvContent = 'Order ID,Time,Items,Payment Method,Status,Total Amount\n';
    
    rows.forEach(row => {
        if (!row.querySelector('td') || !row.querySelector('td').colSpan) {
            const columns = row.querySelectorAll('td');
            if (columns.length >= 6) {
                csvContent += `"${columns[0].textContent}",`; // Order ID
                csvContent += `"${columns[1].textContent}",`; // Time
                csvContent += `"${columns[2].textContent.replace(/"/g, '""')}",`; // Items
                csvContent += `"${columns[3].textContent}",`; // Payment Method
                csvContent += `"${columns[4].textContent.trim()}",`; // Status
                csvContent += `"${columns[5].textContent}"\n`; // Total
            }
        }
    });
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `sales_report_${selectedDate}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
