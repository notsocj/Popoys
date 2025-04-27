// This will be included in POS section

// Initialize POS variables
let currentOrder = {
    items: [],
    total: 0
};

// Define ORDER_STATUS constant
const ORDER_STATUS = {
    COMPLETED: 'Completed',
    VOIDED: 'Voided'
};

// Make initializePOS available globally
window.initializePOS = function() {
    const posSection = document.getElementById('pos-section');
    if (posSection) {
        setupPOSInterface(posSection);
    } else {
        console.error('POS section element not found');
    }
};

document.addEventListener('DOMContentLoaded', () => {
    // Initialize POS if we're directly on the POS section
    if (document.querySelector('.nav-link[data-section="pos"].bg-coffee')) {
        window.initializePOS();
    }

    // Also listen for section changes directly
    document.addEventListener('sectionChanged', (e) => {
        if (e.detail.section === 'pos') {
            window.initializePOS();
        }
    });
});

function setupPOSInterface(container) {
    // Use a data attribute for tracking initialization instead of a child element
    if (container.getAttribute('data-pos-initialized') === 'true') {
        console.log('POS already initialized, skipping setup');
        return;
    }
    
    console.log('Setting up POS interface');
    
    // Mark as initialized before doing anything else
    container.setAttribute('data-pos-initialized', 'true');
    
    try {
        // Set up the POS interface HTML
        container.innerHTML = `
            <div class="flex flex-col lg:flex-row h-full gap-6">
                <!-- Products Panel -->
                <div class="lg:w-2/3 bg-white rounded-lg shadow-md p-4">
                    <h2 class="text-xl font-bold text-coffee-dark mb-4">Menu Items</h2>
                    
                    <!-- Search and category filters -->
                    <div class="flex gap-2 mb-4">
                        <input type="text" id="product-search" placeholder="Search products..." 
                            class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-coffee focus:border-coffee">
                        <div class="relative">
                            <button id="category-dropdown-btn" class="bg-coffee text-white px-4 py-2 rounded-md flex items-center">
                                <span id="selected-category">All Categories</span>
                                <i class="fas fa-chevron-down ml-2"></i>
                            </button>
                            <div id="category-dropdown" class="absolute right-0 mt-1 w-48 bg-white shadow-lg rounded-md py-1 z-10 hidden">
                                <a href="#" class="category-item block px-4 py-2 text-coffee-dark hover:bg-coffee-light hover:text-white" data-category="">All Categories</a>
                                <a href="#" class="category-item block px-4 py-2 text-coffee-dark hover:bg-coffee-light hover:text-white" data-category="Snacks">Snacks</a>
                                <a href="#" class="category-item block px-4 py-2 text-coffee-dark hover:bg-coffee-light hover:text-white" data-category="Coffee-Based">Coffee-Based</a>
                                <a href="#" class="category-item block px-4 py-2 text-coffee-dark hover:bg-coffee-light hover:text-white" data-category="Frappe">Frappe</a>
                                <a href="#" class="category-item block px-4 py-2 text-coffee-dark hover:bg-coffee-light hover:text-white" data-category="Iced Coffee">Iced Coffee</a>
                                <a href="#" class="category-item block px-4 py-2 text-coffee-dark hover:bg-coffee-light hover:text-white" data-category="Hot Coffee">Hot Coffee</a>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Products grid -->
                    <div id="products-container" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-[calc(100vh-320px)] overflow-y-auto">
                        <!-- Products will be loaded here dynamically -->
                        <div class="col-span-full text-center py-8 text-gray-500">
                            <i class="fas fa-spinner fa-spin text-2xl mb-3"></i>
                            <p>Loading products...</p>
                        </div>
                    </div>
                </div>
                
                <!-- Order Panel -->
                <div class="lg:w-1/3 flex flex-col">
                    <div class="bg-white rounded-lg shadow-md p-4 flex-1">
                        <h2 class="text-xl font-bold text-coffee-dark mb-4">Current Order</h2>
                        
                        <div id="order-items" class="max-h-[calc(100vh-440px)] overflow-y-auto mb-4">
                            <!-- Order items will appear here -->
                            <div class="text-center text-gray-500 py-8">No items in order</div>
                        </div>
                        
                        <div class="border-t pt-4">
                            <div class="flex justify-between mb-2">
                                <span class="font-semibold">Subtotal:</span>
                                <span id="subtotal-amount">₱0.00</span>
                            </div>
                            <div class="flex justify-between text-xl font-bold text-coffee-dark">
                                <span>Total:</span>
                                <span id="total-amount">₱0.00</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="bg-white rounded-lg shadow-md p-4 mt-6">
                        <div class="mb-4">
                            <label for="payment-method" class="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                            <select id="payment-method" class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-coffee focus:border-coffee">
                                <option value="cash">Cash</option>
                                <option value="card">Card</option>
                                <option value="gcash">GCash</option>
                            </select>
                        </div>
                        
                        <div class="grid grid-cols-2 gap-4">
                            <button id="clear-btn" class="px-4 py-2 text-coffee-dark border border-coffee-dark rounded-md hover:bg-coffee-light hover:text-white transition-colors">
                                Clear Order
                            </button>
                            <button id="checkout-btn" class="px-4 py-2 bg-coffee text-white rounded-md hover:bg-coffee-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                                Checkout
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Payment Modal -->
            <div id="payment-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden">
                <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                    <h3 class="text-xl font-bold text-coffee-dark mb-4">Complete Payment</h3>
                    
                    <div class="mb-4">
                        <div class="flex justify-between text-lg font-bold mb-2">
                            <span>Total Amount:</span>
                            <span id="modal-total">₱0.00</span>
                        </div>
                        
                        <div class="mb-4">
                            <label for="amount-received" class="block text-sm font-medium text-gray-700 mb-1">Amount Received</label>
                            <input type="number" id="amount-received" class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-coffee focus:border-coffee">
                            <p id="payment-error" class="mt-1 text-red-600 text-sm hidden">Amount received is less than total amount</p>
                        </div>
                        
                        <!-- Numeric Keypad -->
                        <div class="grid grid-cols-3 gap-2 mb-4">
                            <button type="button" class="numpad-btn bg-gray-200 py-2 rounded hover:bg-gray-300 transition-colors" data-value="7">7</button>
                            <button type="button" class="numpad-btn bg-gray-200 py-2 rounded hover:bg-gray-300 transition-colors" data-value="8">8</button>
                            <button type="button" class="numpad-btn bg-gray-200 py-2 rounded hover:bg-gray-300 transition-colors" data-value="9">9</button>
                            <button type="button" class="numpad-btn bg-gray-200 py-2 rounded hover:bg-gray-300 transition-colors" data-value="4">4</button>
                            <button type="button" class="numpad-btn bg-gray-200 py-2 rounded hover:bg-gray-300 transition-colors" data-value="5">5</button>
                            <button type="button" class="numpad-btn bg-gray-200 py-2 rounded hover:bg-gray-300 transition-colors" data-value="6">6</button>
                            <button type="button" class="numpad-btn bg-gray-200 py-2 rounded hover:bg-gray-300 transition-colors" data-value="1">1</button>
                            <button type="button" class="numpad-btn bg-gray-200 py-2 rounded hover:bg-gray-300 transition-colors" data-value="2">2</button>
                            <button type="button" class="numpad-btn bg-gray-200 py-2 rounded hover:bg-gray-300 transition-colors" data-value="3">3</button>
                            <button type="button" class="numpad-btn bg-gray-200 py-2 rounded hover:bg-gray-300 transition-colors" data-value="0">0</button>
                            <button type="button" class="numpad-btn bg-gray-200 py-2 rounded hover:bg-gray-300 transition-colors" data-value=".">.</button>
                            <button type="button" class="numpad-btn bg-red-100 text-red-700 py-2 rounded hover:bg-red-200 transition-colors" data-value="clear">C</button>
                            <button type="button" class="numpad-btn bg-yellow-100 text-yellow-700 py-2 rounded col-span-3 hover:bg-yellow-200 transition-colors" data-value="backspace">
                                <i class="fas fa-backspace"></i>
                            </button>
                        </div>
                        
                        <div class="flex justify-between text-lg">
                            <span>Change:</span>
                            <span id="change-amount">₱0.00</span>
                        </div>
                    </div>
                    
                    <div class="flex justify-end gap-4">
                        <button id="cancel-payment-btn" class="px-4 py-2 text-coffee-dark border border-coffee-dark rounded-md hover:bg-coffee-light hover:text-white transition-colors">
                            Cancel
                        </button>
                        <button id="complete-payment-btn" class="px-4 py-2 bg-coffee text-white rounded-md hover:bg-coffee-dark transition-colors">
                            Complete Payment
                        </button>
                    </div>
                </div>
            </div>
            
            <!-- Receipt Modal -->
            <div id="receipt-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden">
                <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                    <h3 class="text-xl font-bold text-coffee-dark mb-4">Receipt</h3>
                    
                    <div id="receipt-content" class="bg-gray-100 p-4 font-mono text-sm mb-4">
                        <!-- Receipt content will be generated here -->
                    </div>
                    
                    <div class="flex justify-end gap-4">
                        <button id="print-receipt-btn" class="px-4 py-2 text-coffee-dark border border-coffee-dark rounded-md hover:bg-coffee-light hover:text-white transition-colors">
                            Print Receipt
                        </button>
                        <button id="close-receipt-btn" class="px-4 py-2 bg-coffee text-white rounded-md hover:bg-coffee-dark transition-colors">
                            Close
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // Load products - using a setTimeout to ensure the DOM is ready
        setTimeout(() => {
            loadProducts();
            setupPOSEventListeners();
        }, 100);
        
    } catch (error) {
        console.error('Error setting up POS interface:', error);
        container.innerHTML = `
            <div class="bg-red-100 text-red-700 p-4 rounded-md">
                <h3 class="font-bold">Error Loading POS</h3>
                <p>${error.message || 'Unknown error occurred'}</p>
                <button id="retry-pos-btn" class="mt-4 px-4 py-2 bg-coffee text-white rounded-md">
                    Retry Loading POS
                </button>
            </div>
        `;
        
        // Add retry button listener
        const retryBtn = container.querySelector('#retry-pos-btn');
        if (retryBtn) {
            retryBtn.addEventListener('click', () => {
                container.removeAttribute('data-pos-initialized'); // Reset initialization flag
                setupPOSInterface(container); // Try again
            });
        }
    }
}

async function loadProducts(category = null) {
    try {
        const productsContainer = document.getElementById('products-container');
        productsContainer.innerHTML = `
            <div class="col-span-full text-center py-8 text-gray-500">
                <i class="fas fa-spinner fa-spin text-2xl mb-3"></i>
                <p>Loading products...</p>
            </div>
        `;
        
        // Get the Supabase client (safely)
        const supabaseClient = getSupabaseClient();
        if (!supabaseClient) {
            throw new Error('Supabase client is not available');
        }
        
        let query = supabaseClient.from('products').select('*');
        
        if (category) {
            query = query.eq('category', category);
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        
        productsContainer.innerHTML = '';
        
        if (!data || data.length === 0) {
            productsContainer.innerHTML = '<p class="col-span-full text-center py-8 text-gray-500">No products found</p>';
            return;
        }
        
        // Group products by category for better organization
        const productsByCategory = {};
        
        data.forEach(product => {
            const category = product.category || 'Uncategorized';
            if (!productsByCategory[category]) {
                productsByCategory[category] = [];
            }
            productsByCategory[category].push(product);
        });
        
        // Display products grouped by category
        Object.entries(productsByCategory).forEach(([category, products]) => {
            // Only add category header if we're not filtering by category
            if (document.getElementById('selected-category').textContent === 'All Categories') {
                productsContainer.innerHTML += `
                    <div class="col-span-full mt-4 mb-2">
                        <h3 class="text-lg font-bold text-coffee-dark">${category}</h3>
                    </div>
                `;
            }
            
            // Add products for this category
            products.forEach(product => {
                // Determine icon based on category
                let icon = 'fa-mug-hot'; // default icon
                
                if (product.category === 'Snacks') {
                    icon = 'fa-cookie-bite';
                } else if (product.category === 'Frappe') {
                    icon = 'fa-glass-whiskey';
                } else if (product.category === 'Iced Coffee') {
                    icon = 'fa-ice-cube';
                } else if (product.category === 'Hot Coffee') {
                    icon = 'fa-mug-hot';
                } else if (product.category === 'Coffee-Based') {
                    icon = 'fa-coffee';
                }
                
                const productCard = document.createElement('div');
                productCard.className = 'product-card bg-coffee-cream rounded-lg shadow cursor-pointer hover:shadow-md transition-shadow p-4 flex flex-col items-center';
                productCard.dataset.id = product.product_id;
                productCard.dataset.name = product.product_name;
                productCard.dataset.price = product.price;
                productCard.dataset.category = product.category || 'Uncategorized';
                
                productCard.innerHTML = `
                    <div class="w-16 h-16 bg-coffee-light rounded-full mb-2 flex items-center justify-center">
                        <i class="fas ${icon} text-white text-xl"></i>
                    </div>
                    <h3 class="text-sm font-semibold text-center text-coffee-dark">${product.product_name}</h3>
                    <p class="text-coffee">₱${parseFloat(product.price).toFixed(2)}</p>
                `;
                
                productsContainer.appendChild(productCard);
            });
        });
    } catch (error) {
        console.error('Error loading products:', error);
        const productsContainer = document.getElementById('products-container');
        productsContainer.innerHTML = `
            <div class="col-span-full text-center py-8 text-red-500">
                <i class="fas fa-exclamation-circle text-2xl mb-3"></i>
                <p>Error loading products: ${error.message || 'Please try again'}</p>
            </div>
        `;
    }
}

// Helper function to safely get the Supabase client
function getSupabaseClient() {
    // Try to get it from window.supabaseClient (safely)
    if (window.supabaseClient) {
        return window.supabaseClient;
    }
    
    // Fallback to check other possible locations
    if (window.db && window.db.client) {
        return window.db.client;
    }
    
    console.error('Supabase client not found. Make sure supabase-connection.js is loaded before pos.js');
    return null;
}

function setupPOSEventListeners() {
    // Product search
    const searchInput = document.getElementById('product-search');
    searchInput.addEventListener('input', handleProductSearch);
    
    // Category dropdown toggle
    document.getElementById('category-dropdown-btn').addEventListener('click', () => {
        document.getElementById('category-dropdown').classList.toggle('hidden');
    });
    
    // Hide dropdown when clicking elsewhere
    document.addEventListener('click', (e) => {
        if (!e.target.closest('#category-dropdown-btn') && !e.target.closest('#category-dropdown')) {
            document.getElementById('category-dropdown').classList.add('hidden');
        }
    });
    
    // Category selection
    document.querySelectorAll('.category-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const category = e.target.dataset.category;
            document.getElementById('selected-category').textContent = category || 'All Categories';
            document.getElementById('category-dropdown').classList.add('hidden');
            loadProducts(category || null);
        });
    });
    
    // Product selection (using event delegation)
    document.getElementById('products-container').addEventListener('click', (e) => {
        const productCard = e.target.closest('.product-card');
        if (productCard) {
            addToOrder(productCard);
        }
    });
    
    // Order actions
    document.getElementById('clear-btn').addEventListener('click', clearOrder);
    document.getElementById('checkout-btn').addEventListener('click', showPaymentModal);
    
    // Payment modal
    document.getElementById('amount-received').addEventListener('input', calculateChange);
    document.getElementById('cancel-payment-btn').addEventListener('click', hidePaymentModal);
    document.getElementById('complete-payment-btn').addEventListener('click', completeOrder);
    
    // Numeric keypad buttons
    document.querySelectorAll('.numpad-btn').forEach(button => {
        button.addEventListener('click', () => {
            const value = button.dataset.value;
            handleNumpadInput(value);
        });
    });
    
    // Receipt modal buttons
    document.getElementById('print-receipt-btn').addEventListener('click', printReceipt);
    document.getElementById('close-receipt-btn').addEventListener('click', closeReceiptModal);
    
    // Order items (event delegation for remove buttons)
    document.getElementById('order-items').addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-item-btn')) {
            removeOrderItem(e.target.dataset.id);
        }
    });
}

function handleProductSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    const productCards = document.querySelectorAll('.product-card');
    
    productCards.forEach(card => {
        const productName = card.dataset.name.toLowerCase();
        if (productName.includes(searchTerm)) {
            card.classList.remove('hidden');
        } else {
            card.classList.add('hidden');
        }
    });
}

function setCategoryActive(btnId) {
    const categoryBtns = document.querySelectorAll('.category-btn');
    categoryBtns.forEach(btn => {
        if (btn.id === btnId) {
            btn.classList.remove('bg-gray-200', 'text-coffee-dark');
            btn.classList.add('bg-coffee', 'text-white');
        } else {
            btn.classList.remove('bg-coffee', 'text-white');
            btn.classList.add('bg-gray-200', 'text-coffee-dark');
        }
    });
}

function addToOrder(productCard) {
    const id = productCard.dataset.id;
    const name = productCard.dataset.name;
    const price = parseFloat(productCard.dataset.price);
    
    // Check if product already in order
    const existingItem = currentOrder.items.find(item => item.id === id);
    
    if (existingItem) {
        existingItem.quantity += 1;
        existingItem.subtotal = existingItem.quantity * existingItem.price;
    } else {
        currentOrder.items.push({
            id,
            name,
            price,
            quantity: 1,
            subtotal: price
        });
    }
    
    updateOrderDisplay();
}

function removeOrderItem(id) {
    currentOrder.items = currentOrder.items.filter(item => item.id !== id);
    updateOrderDisplay();
}

function updateOrderDisplay() {
    const orderItemsContainer = document.getElementById('order-items');
    const subtotalDisplay = document.getElementById('subtotal-amount');
    const totalDisplay = document.getElementById('total-amount');
    const checkoutBtn = document.getElementById('checkout-btn');
    
    // Calculate total
    currentOrder.total = currentOrder.items.reduce((sum, item) => sum + item.subtotal, 0);
    
    // Update order items display
    if (currentOrder.items.length === 0) {
        orderItemsContainer.innerHTML = '<div class="text-center text-gray-500 py-8">No items in order</div>';
        checkoutBtn.disabled = true;
    } else {
        orderItemsContainer.innerHTML = currentOrder.items.map(item => `
            <div class="flex justify-between items-center mb-3 pb-2 border-b">
                <div class="flex-1">
                    <div class="flex justify-between">
                        <span class="font-medium">${item.name}</span>
                        <span>₱${item.price.toFixed(2)}</span>
                    </div>
                    <div class="flex items-center mt-1">
                        <button class="quantity-btn bg-gray-200 text-coffee-dark w-6 h-6 rounded-full flex items-center justify-center" onclick="updateItemQuantity('${item.id}', ${item.quantity - 1})">-</button>
                        <span class="mx-2">${item.quantity}</span>
                        <button class="quantity-btn bg-gray-200 text-coffee-dark w-6 h-6 rounded-full flex items-center justify-center" onclick="updateItemQuantity('${item.id}', ${item.quantity + 1})">+</button>
                        <span class="ml-auto">₱${item.subtotal.toFixed(2)}</span>
                        <button class="remove-item-btn ml-2 text-red-500" data-id="${item.id}">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
        
        checkoutBtn.disabled = false;
    }
    
    // Update totals
    subtotalDisplay.textContent = `₱${currentOrder.total.toFixed(2)}`;
    totalDisplay.textContent = `₱${currentOrder.total.toFixed(2)}`;
}

// Function to be called from the inline event handlers
window.updateItemQuantity = function(id, newQuantity) {
    if (newQuantity <= 0) {
        removeOrderItem(id);
        return;
    }
    
    const item = currentOrder.items.find(item => item.id === id);
    if (item) {
        item.quantity = newQuantity;
        item.subtotal = item.quantity * item.price;
        updateOrderDisplay();
    }
};

function clearOrder() {
    currentOrder.items = [];
    currentOrder.total = 0;
    updateOrderDisplay();
}

function showPaymentModal() {
    document.getElementById('modal-total').textContent = `₱${currentOrder.total.toFixed(2)}`;
    document.getElementById('amount-received').value = '';
    document.getElementById('change-amount').textContent = '₱0.00';
    document.getElementById('payment-modal').classList.remove('hidden');
}

function hidePaymentModal() {
    document.getElementById('payment-modal').classList.add('hidden');
    document.getElementById('payment-error').classList.add('hidden');
}

function calculateChange(e) {
    const amountReceived = parseFloat(e.target.value) || 0;
    const change = amountReceived - currentOrder.total;
    
    document.getElementById('change-amount').textContent = 
        change >= 0 ? `₱${change.toFixed(2)}` : `-₱${Math.abs(change).toFixed(2)}`;
    
    // Hide any previous error message when amount is modified
    document.getElementById('payment-error').classList.add('hidden');
}

async function completeOrder() {
    try {
        // Check if amount received is sufficient
        const amountReceived = parseFloat(document.getElementById('amount-received').value) || 0;
        if (amountReceived < currentOrder.total) {
            document.getElementById('payment-error').classList.remove('hidden');
            return;
        }
        
        // Show loading indicator
        const completePaymentBtn = document.getElementById('complete-payment-btn');
        const originalBtnText = completePaymentBtn.innerHTML;
        completePaymentBtn.innerHTML = `<i class="fas fa-spinner fa-spin mr-2"></i>Processing...`;
        completePaymentBtn.disabled = true;
        
        const userId = localStorage.getItem('userId');
        const paymentMethod = document.getElementById('payment-method').value;
        
        // Get Supabase client safely
        const supabaseClient = getSupabaseClient();
        if (!supabaseClient) {
            throw new Error('Supabase client is not available');
        }
        
        // Prepare the order data according to the schema
        const orderData = {
            user_id: userId,
            total_amount: currentOrder.total,
            payment_method: paymentMethod,
            order_status: ORDER_STATUS.COMPLETED
        };
        
        // Insert order into database
        const { data: orderResult, error: orderError } = await supabaseClient
            .from('orders')
            .insert([orderData])
            .select();
            
        if (orderError) throw orderError;
        
        // Get the new order ID
        const orderId = orderResult[0].order_id;
        
        // Prepare order details according to the schema
        const orderDetails = currentOrder.items.map(item => ({
            order_id: orderId,
            product_id: item.id,
            quantity: item.quantity,
            price_each: item.price
        }));
        
        // Insert order details
        const { error: detailsError } = await supabaseClient
            .from('order_details')
            .insert(orderDetails);
            
        if (detailsError) throw detailsError;
        
        // Update inventory
        await updateInventory(currentOrder.items);
        
        // Restore button state
        completePaymentBtn.innerHTML = originalBtnText;
        completePaymentBtn.disabled = false;
        
        // Hide payment modal
        hidePaymentModal();
        
        // Generate receipt
        generateReceipt(orderResult[0], currentOrder.items);
        
        // Clear current order
        clearOrder();
        
    } catch (error) {
        console.error('Error completing order:', error);
        
        // Restore button state in case of error
        const completePaymentBtn = document.getElementById('complete-payment-btn');
        completePaymentBtn.innerHTML = 'Complete Payment';
        completePaymentBtn.disabled = false;
        
        alert('There was an error processing your order. Please try again.');
    }
}

async function updateInventory(orderItems) {
    try {
        // Get Supabase client safely
        const supabaseClient = getSupabaseClient();
        if (!supabaseClient) {
            throw new Error('Supabase client is not available');
        }
        
        for (const item of orderItems) {
            // Get ingredients needed for this product
            const { data: ingredients, error: ingredientsError } = await supabaseClient
                .from('product_ingredients')
                .select('ingredient_id, quantity_needed')
                .eq('product_id', item.id);
                
            if (ingredientsError) throw ingredientsError;
            
            // Update each ingredient's stock
            for (const ingredient of ingredients) {
                const totalUsed = ingredient.quantity_needed * item.quantity;
                
                const { error: updateError } = await supabaseClient.rpc('decrement_ingredient_stock', {
                    ing_id: ingredient.ingredient_id,
                    used_amount: totalUsed
                });
                
                if (updateError) throw updateError;
            }
        }
    } catch (error) {
        console.error('Error updating inventory:', error);
    }
}

function generateReceipt(order, items) {
    const receiptContent = document.getElementById('receipt-content');
    const orderDate = new Date(order.created_at).toLocaleString();
    
    let receiptHTML = `
        <div class="text-center mb-4">
            <h4 class="font-bold">Popoy's Café</h4>
            <p>Pastry and Roastery</p>
            <p class="text-xs">Receipt #${order.order_id}</p>
            <p class="text-xs">${orderDate}</p>
        </div>
        
        <div class="mb-4">
            <div class="flex justify-between border-b pb-1">
                <span class="font-bold">Item</span>
                <span class="font-bold">Subtotal</span>
            </div>
    `;
    
    items.forEach(item => {
        receiptHTML += `
            <div class="flex justify-between py-1">
                <div>
                    <div>${item.name}</div>
                    <div class="text-xs">${item.quantity} x ₱${item.price.toFixed(2)}</div>
                </div>
                <span>₱${item.subtotal.toFixed(2)}</span>
            </div>
        `;
    });
    
    receiptHTML += `</div>
        
        <div class="border-t pt-2">
            <div class="flex justify-between font-bold">
                <span>Total</span>
                <span>₱${order.total_amount}</span>
            </div>
            <div class="flex justify-between">
                <span>Payment Method</span>
                <span>${order.payment_method}</span>
            </div>
        </div>
        
        <div class="text-center mt-4 text-xs">
            <p>Thank you for your purchase!</p>
            <p>Please come again.</p>
        </div>
    `;
    
    receiptContent.innerHTML = receiptHTML;
    document.getElementById('receipt-modal').classList.remove('hidden');
}

function printReceipt() {
    const receiptContent = document.getElementById('receipt-content').innerHTML;
    const printWindow = window.open('', '_blank');
    
    printWindow.document.write(`
        <html>
            <head>
                <title>Receipt</title>
                <style>
                    body { font-family: monospace; font-size: 12px; width: 300px; margin: 0 auto; }
                    .text-center { text-align: center; }
                    .flex { display: flex; }
                    .justify-between { justify-content: space-between; }
                    .text-xs { font-size: 10px; }
                    .font-bold { font-weight: bold; }
                    .border-t { border-top: 1px solid #ddd; }
                    .border-b { border-bottom: 1px solid #ddd; }
                    .pt-1 { padding-top: 4px; }
                    .pt-2 { padding-top: 8px; }
                    .pb-1 { padding-bottom: 4px; }
                    .py-1 { padding-top: 4px; padding-bottom: 4px; }
                    .mb-4 { margin-bottom: 16px; }
                    .mt-4 { margin-top: 16px; }
                </style>
            </head>
            <body>
                ${receiptContent}
            </body>
        </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
}

function closeReceiptModal() {
    document.getElementById('receipt-modal').classList.add('hidden');
}

// New function to handle numeric keypad input
function handleNumpadInput(value) {
    const amountInput = document.getElementById('amount-received');
    
    if (value === 'clear') {
        amountInput.value = '';
    } else if (value === 'backspace') {
        amountInput.value = amountInput.value.slice(0, -1);
    } else if (value === '.' && amountInput.value.includes('.')) {
        // Prevent multiple decimal points
        return;
    } else {
        amountInput.value += value;
    }
    
    // Trigger change event to calculate change
    amountInput.dispatchEvent(new Event('input'));
}
