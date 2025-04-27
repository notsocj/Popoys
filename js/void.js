document.addEventListener('DOMContentLoaded', () => {
    const voidsSection = document.getElementById('voids-section');
    if (voidsSection) {
        setupVoidsInterface(voidsSection);
    }
});

function setupVoidsInterface(container) {
    container.innerHTML = `
        <h2 class="text-2xl font-bold text-coffee-dark mb-6">Voided Sales</h2>
        
        <div class="bg-white rounded-lg shadow-md p-4 mb-6">
            <div class="flex flex-wrap items-end gap-4">
                <div>
                    <label for="void-search-order" class="block text-sm font-medium text-gray-700 mb-1">Search Order ID</label>
                    <input type="text" id="void-search-order" placeholder="Enter order ID" class="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-coffee focus:border-coffee">
                </div>
                
                <div>
                    <label for="void-date-filter" class="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                    <select id="void-date-filter" class="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-coffee focus:border-coffee">
                        <option value="all">All Time</option>
                        <option value="today" selected>Today</option>
                        <option value="week">This Week</option>
                        <option value="month">This Month</option>
                        <option value="custom">Custom Range</option>
                    </select>
                </div>
                
                <div id="void-custom-date-range" class="hidden flex items-center gap-2">
                    <div>
                        <label for="void-start-date" class="block text-sm font-medium text-gray-700 mb-1">From</label>
                        <input type="date" id="void-start-date" class="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-coffee focus:border-coffee">
                    </div>
                    
                    <div>
                        <label for="void-end-date" class="block text-sm font-medium text-gray-700 mb-1">To</label>
                        <input type="date" id="void-end-date" class="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-coffee focus:border-coffee">
                    </div>
                </div>
                
                <button id="void-filter-btn" class="px-4 py-2 bg-coffee text-white rounded-md hover:bg-coffee-dark transition-colors">
                    Apply Filter
                </button>
            </div>
        </div>
        
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div class="bg-white rounded-lg shadow-md p-4">
                <h3 class="text-lg font-semibold text-coffee-dark mb-2">Total Voided Orders</h3>
                <p id="void-total-count" class="text-3xl font-bold text-coffee">0</p>
            </div>
            
            <div class="bg-white rounded-lg shadow-md p-4">
                <h3 class="text-lg font-semibold text-coffee-dark mb-2">Total Amount Voided</h3>
                <p id="void-total-amount" class="text-3xl font-bold text-coffee">₱0.00</p>
            </div>
            
            <div class="bg-white rounded-lg shadow-md p-4">
                <h3 class="text-lg font-semibold text-coffee-dark mb-2">Most Common Void Reason</h3>
                <p id="void-common-reason" class="text-xl font-bold text-coffee">-</p>
            </div>
        </div>
        
        <div class="bg-white rounded-lg shadow-md overflow-hidden">
            <div class="flex justify-between items-center p-4 border-b">
                <h3 class="text-lg font-semibold text-coffee-dark">Voided Orders</h3>
                <button id="void-new-order-btn" class="px-4 py-2 bg-coffee text-white rounded-md hover:bg-coffee-dark transition-colors">
                    <i class="fas fa-ban mr-1"></i> Void New Order
                </button>
            </div>
            
            <div class="overflow-x-auto">
                <table class="min-w-full">
                    <thead class="bg-coffee-light text-white">
                        <tr>
                            <th class="py-3 px-4 text-left">Order ID</th>
                            <th class="py-3 px-4 text-left">Original Date</th>
                            <th class="py-3 px-4 text-left">Voided Date</th>
                            <th class="py-3 px-4 text-left">User</th>
                            <th class="py-3 px-4 text-left">Amount</th>
                            <th class="py-3 px-4 text-left">Reason</th>
                            <th class="py-3 px-4 text-left">Actions</th>
                        </tr>
                    </thead>
                    <tbody id="voided-orders-table">
                        <!-- Voided orders will be loaded here -->
                        <tr>
                            <td colspan="7" class="py-8 text-center text-gray-500">Loading voided orders...</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
        
        <!-- Void Order Modal -->
        <div id="void-order-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden">
            <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
                <h3 class="text-xl font-bold text-coffee-dark mb-4">Void an Order</h3>
                
                <div class="mb-4">
                    <label for="void-order-id" class="block text-sm font-medium text-gray-700 mb-1">Order ID</label>
                    <input type="number" id="void-order-id" class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-coffee focus:border-coffee">
                </div>
                
                <div id="order-details-container" class="mb-4 p-3 bg-gray-50 rounded-md hidden">
                    <h4 class="font-medium mb-2">Order Details</h4>
                    <div id="order-details-content"></div>
                </div>
                
                <div class="mb-4">
                    <label for="void-reason" class="block text-sm font-medium text-gray-700 mb-1">Reason for Voiding</label>
                    <textarea id="void-reason" rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-coffee focus:border-coffee"></textarea>
                </div>
                
                <div class="flex justify-end gap-4">
                    <button id="lookup-order-btn" class="px-4 py-2 bg-coffee-light text-white rounded-md hover:bg-coffee transition-colors">
                        Lookup Order
                    </button>
                    <button id="cancel-void-btn" class="px-4 py-2 text-coffee-dark border border-coffee-dark rounded-md hover:bg-coffee-light hover:text-white transition-colors">
                        Cancel
                    </button>
                    <button id="confirm-void-btn" class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">
                        Void Order
                    </button>
                </div>
            </div>
        </div>
        
        <!-- View Void Details Modal -->
        <div id="view-void-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden">
            <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
                <h3 class="text-xl font-bold text-coffee-dark mb-4">Void Details</h3>
                
                <div id="void-details-content" class="mb-6"></div>
                
                <div class="flex justify-end">
                    <button id="close-void-details-btn" class="px-4 py-2 bg-coffee text-white rounded-md hover:bg-coffee-dark transition-colors">
                        Close
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Set default dates for custom filter
    setDefaultVoidDates();
    
    // Load initial data
    loadVoidedOrders('today');
    
    // Setup event listeners
    setupVoidEventListeners();
}

function setDefaultVoidDates() {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - 7);
    
    document.getElementById('void-start-date').valueAsDate = startOfWeek;
    document.getElementById('void-end-date').valueAsDate = today;
}

function setupVoidEventListeners() {
    // Date filter change
    document.getElementById('void-date-filter').addEventListener('change', (e) => {
        const customDateRange = document.getElementById('void-custom-date-range');
        if (e.target.value === 'custom') {
            customDateRange.classList.remove('hidden');
        } else {
            customDateRange.classList.add('hidden');
        }
    });
    
    // Apply filter button
    document.getElementById('void-filter-btn').addEventListener('click', () => {
        const filterType = document.getElementById('void-date-filter').value;
        loadVoidedOrders(filterType);
    });
    
    // Order search input
    document.getElementById('void-search-order').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const orderId = e.target.value.trim();
            if (orderId) {
                searchVoidedOrder(orderId);
            } else {
                loadVoidedOrders(document.getElementById('void-date-filter').value);
            }
        }
    });
    
    // New void order button
    document.getElementById('void-new-order-btn').addEventListener('click', showVoidOrderModal);
    
    // Lookup order button
    document.getElementById('lookup-order-btn').addEventListener('click', lookupOrder);
    
    // Cancel void button
    document.getElementById('cancel-void-btn').addEventListener('click', hideVoidOrderModal);
    
    // Confirm void button
    document.getElementById('confirm-void-btn').addEventListener('click', confirmVoidOrder);
    
    // Close void details button
    document.getElementById('close-void-details-btn').addEventListener('click', hideVoidDetailsModal);
    
    // View void details (using event delegation)
    document.getElementById('voided-orders-table').addEventListener('click', (e) => {
        if (e.target.closest('.view-void-btn')) {
            const voidId = e.target.closest('.view-void-btn').dataset.id;
            showVoidDetails(voidId);
        }
    });
}

async function loadVoidedOrders(filterType) {
    try {
        const voidedOrdersTable = document.getElementById('voided-orders-table');
        voidedOrdersTable.innerHTML = '<tr><td colspan="7" class="py-8 text-center text-gray-500">Loading voided orders...</td></tr>';
        
        // Prepare date filter
        let startDate, endDate;
        
        switch (filterType) {
            case 'today':
                startDate = new Date();
                startDate.setHours(0, 0, 0, 0);
                endDate = new Date();
                endDate.setHours(23, 59, 59, 999);
                break;
                
            case 'week':
                startDate = new Date();
                startDate.setDate(startDate.getDate() - startDate.getDay()); // Start of week (Sunday)
                startDate.setHours(0, 0, 0, 0);
                endDate = new Date();
                break;
                
            case 'month':
                startDate = new Date();
                startDate.setDate(1); // Start of month
                startDate.setHours(0, 0, 0, 0);
                endDate = new Date();
                break;
                
            case 'custom':
                startDate = new Date(document.getElementById('void-start-date').value);
                startDate.setHours(0, 0, 0, 0);
                endDate = new Date(document.getElementById('void-end-date').value);
                endDate.setHours(23, 59, 59, 999);
                break;
                
            default: // all
                startDate = null;
                endDate = null;
        }
        
        // Query voided orders
        let query = supabase
            .from('voided_sales')
            .select(`
                void_id,
                order_id,
                user_id,
                reason,
                voided_at,
                users(username),
                orders(created_at, total_amount)
            `)
            .order('voided_at', { ascending: false });
            
        if (startDate && endDate) {
            query = query.gte('voided_at', startDate.toISOString()).lte('voided_at', endDate.toISOString());
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        
        // Update summary statistics
        updateVoidSummary(data);
        
        // Display voided orders
        if (data.length === 0) {
            voidedOrdersTable.innerHTML = '<tr><td colspan="7" class="py-8 text-center text-gray-500">No voided orders found</td></tr>';
            return;
        }
        
        voidedOrdersTable.innerHTML = data.map(void_entry => {
            const originalDate = new Date(void_entry.orders.created_at).toLocaleString();
            const voidedDate = new Date(void_entry.voided_at).toLocaleString();
            const username = void_entry.users?.username || 'Unknown';
            const amount = parseFloat(void_entry.orders.total_amount).toFixed(2);
            const reason = void_entry.reason || 'No reason provided';
            
            return `
                <tr class="border-b hover:bg-gray-50">
                    <td class="py-3 px-4">${void_entry.order_id}</td>
                    <td class="py-3 px-4">${originalDate}</td>
                    <td class="py-3 px-4">${voidedDate}</td>
                    <td class="py-3 px-4">${username}</td>
                    <td class="py-3 px-4">₱${amount}</td>
                    <td class="py-3 px-4">
                        <span class="truncate block max-w-xs" title="${reason}">${reason.length > 30 ? reason.substring(0, 30) + '...' : reason}</span>
                    </td>
                    <td class="py-3 px-4">
                        <button class="view-void-btn text-coffee hover:text-coffee-dark" data-id="${void_entry.void_id}">
                            <i class="fas fa-eye"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
        
    } catch (error) {
        console.error('Error loading voided orders:', error);
        document.getElementById('voided-orders-table').innerHTML = 
            '<tr><td colspan="7" class="py-8 text-center text-red-500">Error loading voided orders</td></tr>';
    }
}

function updateVoidSummary(voidData) {
    const totalCount = voidData.length;
    const totalAmount = voidData.reduce((sum, item) => sum + parseFloat(item.orders.total_amount), 0);
    
    // Find most common reason
    const reasonCounts = {};
    voidData.forEach(item => {
        const reason = item.reason || 'No reason provided';
        reasonCounts[reason] = (reasonCounts[reason] || 0) + 1;
    });
    
    let mostCommonReason = 'None';
    let maxCount = 0;
    
    Object.entries(reasonCounts).forEach(([reason, count]) => {
        if (count > maxCount) {
            mostCommonReason = reason;
            maxCount = count;
        }
    });
    
    // If reason is too long, truncate it
    if (mostCommonReason.length > 30) {
        mostCommonReason = mostCommonReason.substring(0, 30) + '...';
    }
    
    // Update UI
    document.getElementById('void-total-count').textContent = totalCount;
    document.getElementById('void-total-amount').textContent = `₱${totalAmount.toFixed(2)}`;
    document.getElementById('void-common-reason').textContent = mostCommonReason || '-';
}

async function searchVoidedOrder(orderId) {
    try {
        const { data, error } = await supabase
            .from('voided_sales')
            .select(`
                void_id,
                order_id,
                user_id,
                reason,
                voided_at,
                users(username),
                orders(created_at, total_amount)
            `)
            .eq('order_id', orderId);
            
        if (error) throw error;
        
        // Update table with search results
        const tableBody = document.getElementById('voided-orders-table');
        
        if (data.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="7" class="py-8 text-center text-gray-500">No voided order found with that ID</td></tr>';
            return;
        }
        
        // Use the same display logic as loadVoidedOrders
        updateVoidSummary(data);
        
        tableBody.innerHTML = data.map(void_entry => {
            const originalDate = new Date(void_entry.orders.created_at).toLocaleString();
            const voidedDate = new Date(void_entry.voided_at).toLocaleString();
            const username = void_entry.users?.username || 'Unknown';
            const amount = parseFloat(void_entry.orders.total_amount).toFixed(2);
            const reason = void_entry.reason || 'No reason provided';
            
            return `
                <tr class="border-b hover:bg-gray-50">
                    <td class="py-3 px-4">${void_entry.order_id}</td>
                    <td class="py-3 px-4">${originalDate}</td>
                    <td class="py-3 px-4">${voidedDate}</td>
                    <td class="py-3 px-4">${username}</td>
                    <td class="py-3 px-4">₱${amount}</td>
                    <td class="py-3 px-4">
                        <span class="truncate block max-w-xs" title="${reason}">${reason.length > 30 ? reason.substring(0, 30) + '...' : reason}</span>
                    </td>
                    <td class="py-3 px-4">
                        <button class="view-void-btn text-coffee hover:text-coffee-dark" data-id="${void_entry.void_id}">
                            <i class="fas fa-eye"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
        
    } catch (error) {
        console.error('Error searching voided order:', error);
    }
}

function showVoidOrderModal() {
    document.getElementById('void-order-id').value = '';
    document.getElementById('void-reason').value = '';
    document.getElementById('order-details-container').classList.add('hidden');
    document.getElementById('order-details-content').innerHTML = '';
    document.getElementById('confirm-void-btn').disabled = true;
    
    document.getElementById('void-order-modal').classList.remove('hidden');
}

function hideVoidOrderModal() {
    document.getElementById('void-order-modal').classList.add('hidden');
}

async function lookupOrder() {
    const orderId = document.getElementById('void-order-id').value;
    if (!orderId) {
        alert('Please enter an order ID');
        return;
    }
    
    try {
        // Check if order exists and is not already voided
        const { data: orderData, error: orderError } = await supabase
            .from('orders')
            .select(`
                order_id,
                user_id,
                total_amount,
                payment_method,
                order_status,
                created_at,
                users(username)
            `)
            .eq('order_id', orderId)
            .single();
            
        if (orderError) {
            alert('Order not found');
            return;
        }
        
        if (orderData.order_status === ORDER_STATUS.VOIDED) {
            alert('This order has already been voided');
            return;
        }
        
        // Get order details
        const { data: orderDetails, error: detailsError } = await supabase
            .from('order_details')
            .select(`
                quantity,
                price_each,
                products(product_name)
            `)
            .eq('order_id', orderId);
            
        if (detailsError) throw detailsError;
        
        // Display order details
        const orderDate = new Date(orderData.created_at).toLocaleString();
        const username = orderData.users?.username || 'Unknown';
        
        let itemsList = orderDetails.map(detail => 
            `${detail.quantity} x ${detail.products.product_name} (₱${parseFloat(detail.price_each).toFixed(2)} each)`
        ).join('<br>');
        
        document.getElementById('order-details-content').innerHTML = `
            <div class="text-sm">
                <p><strong>Date:</strong> ${orderDate}</p>
                <p><strong>Cashier:</strong> ${username}</p>
                <p><strong>Total Amount:</strong> ₱${parseFloat(orderData.total_amount).toFixed(2)}</p>
                <p><strong>Payment Method:</strong> ${orderData.payment_method}</p>
                <p><strong>Items:</strong></p>
                <div class="pl-4 mt-1">${itemsList}</div>
            </div>
        `;
        
        document.getElementById('order-details-container').classList.remove('hidden');
        document.getElementById('confirm-void-btn').disabled = false;
        
    } catch (error) {
        console.error('Error looking up order:', error);
        alert('Error looking up order details');
    }
}

async function confirmVoidOrder() {
    const orderId = document.getElementById('void-order-id').value;
    const reason = document.getElementById('void-reason').value;
    
    if (!orderId) {
        alert('Please enter an order ID');
        return;
    }
    
    if (!reason) {
        alert('Please provide a reason for voiding this order');
        return;
    }
    
    try {
        const userId = localStorage.getItem('userId');
        
        // Start a transaction
        // 1. Update order status
        const { error: updateError } = await supabase
            .from('orders')
            .update({ order_status: ORDER_STATUS.VOIDED })
            .eq('order_id', orderId);
            
        if (updateError) throw updateError;
        
        // 2. Record void
        const { error: voidError } = await supabase
            .from('voided_sales')
            .insert([{
                order_id: orderId,
                user_id: userId,
                reason: reason
            }]);
            
        if (voidError) throw voidError;
        
        // 3. Return used ingredients to inventory
        await returnIngredientsToInventory(orderId);
        
        alert('Order successfully voided');
        hideVoidOrderModal();
        
        // Refresh the list
        loadVoidedOrders(document.getElementById('void-date-filter').value);
        
    } catch (error) {
        console.error('Error voiding order:', error);
        alert('Error voiding order: ' + error.message);
    }
}

async function returnIngredientsToInventory(orderId) {
    try {
        // Get the order details
        const { data: orderDetails, error: detailsError } = await supabase
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
            const { data: productIngredients, error: ingredientsError } = await supabase
                .from('product_ingredients')
                .select('ingredient_id, quantity_needed')
                .eq('product_id', detail.product_id);
                
            if (ingredientsError) throw ingredientsError;
            
            // Add back each ingredient to inventory
            for (const ingredient of productIngredients) {
                const totalAmount = parseFloat(ingredient.quantity_needed) * detail.quantity;
                
                // Update ingredient stock
                const { error: updateError } = await supabase.rpc('increment_ingredient_stock', {
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

async function showVoidDetails(voidId) {
    try {
        const { data, error } = await supabase
            .from('voided_sales')
            .select(`
                void_id,
                order_id,
                user_id,
                reason,
                voided_at,
                users(username),
                orders(
                    total_amount, 
                    payment_method, 
                    created_at,
                    user_id,
                    users(username)
                )
            `)
            .eq('void_id', voidId)
            .single();
            
        if (error) throw error;
        
        // Get order details
        const { data: orderDetails, error: detailsError } = await supabase
            .from('order_details')
            .select(`
                quantity,
                price_each,
                products(product_name)
            `)
            .eq('order_id', data.order_id);
            
        if (detailsError) throw detailsError;
        
        // Format dates
        const orderDate = new Date(data.orders.created_at).toLocaleString();
        const voidDate = new Date(data.voided_at).toLocaleString();
        
        // Format order items
        let itemsList = orderDetails.map(detail => 
            `<div class="flex justify-between">
                <span>${detail.quantity} x ${detail.products.product_name}</span>
                <span>₱${(parseFloat(detail.price_each) * detail.quantity).toFixed(2)}</span>
            </div>`
        ).join('');
        
        // Display void details
        document.getElementById('void-details-content').innerHTML = `
            <div class="space-y-4">
                <div class="bg-gray-50 p-3 rounded-md">
                    <h4 class="font-semibold text-coffee-dark">Void Information</h4>
                    <div class="grid grid-cols-2 gap-2 mt-2 text-sm">
                        <div>
                            <p><strong>Void ID:</strong> ${data.void_id}</p>
                            <p><strong>Order ID:</strong> ${data.order_id}</p>
                            <p><strong>Voided By:</strong> ${data.users?.username || 'Unknown'}</p>
                        </div>
                        <div>
                            <p><strong>Void Date:</strong> ${voidDate}</p>
                            <p><strong>Original Date:</strong> ${orderDate}</p>
                            <p><strong>Original Cashier:</strong> ${data.orders.users?.username || 'Unknown'}</p>
                        </div>
                    </div>
                </div>
                
                <div>
                    <h4 class="font-semibold text-coffee-dark">Void Reason</h4>
                    <p class="mt-1 bg-gray-50 p-2 rounded text-sm">${data.reason || 'No reason provided'}</p>
                </div>
                
                <div>
                    <h4 class="font-semibold text-coffee-dark">Order Items</h4>
                    <div class="mt-1 bg-gray-50 p-3 rounded text-sm">
                        ${itemsList}
                        <div class="border-t mt-2 pt-2 font-semibold flex justify-between">
                            <span>Total:</span>
                            <span>₱${parseFloat(data.orders.total_amount).toFixed(2)}</span>
                        </div>
                        <div class="text-sm text-gray-600 flex justify-between">
                            <span>Payment Method:</span>
                            <span>${data.orders.payment_method}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('view-void-modal').classList.remove('hidden');
        
    } catch (error) {
        console.error('Error loading void details:', error);
        alert('Error loading void details');
    }
}

function hideVoidDetailsModal() {
    document.getElementById('view-void-modal').classList.add('hidden');
}
