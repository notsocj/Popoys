document.addEventListener('DOMContentLoaded', () => {
    const inventorySection = document.getElementById('inventory-section');
    if (inventorySection) {
        setupInventoryInterface(inventorySection);
    }
});

// Also listen for navigation events to handle tab switching
document.addEventListener('sectionChanged', (e) => {
    if (e.detail.section === 'inventory') {
        const inventorySection = document.getElementById('inventory-section');
        if (inventorySection) {
            setupInventoryInterface(inventorySection);
        }
    }
});

function setupInventoryInterface(container) {
    // Get user role from localStorage
    const userRole = localStorage.getItem('userRole');
    const isOwner = userRole === 'Owner';
    
    container.innerHTML = `
        <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-bold text-coffee-dark">Inventory Management</h2>
            ${isOwner ? `
            <button id="add-ingredient-btn" class="bg-coffee text-white px-4 py-2 rounded-md hover:bg-coffee-dark transition-colors">
                <i class="fas fa-plus mr-2"></i> Add Ingredient
            </button>
            ` : ''}
        </div>
        
        <div class="bg-white rounded-lg shadow-md p-4 mb-6">
            <div class="flex flex-wrap gap-4 items-end">
                <div class="flex-1">
                    <label for="ingredient-search" class="block text-sm font-medium text-gray-700 mb-1">Search Ingredients</label>
                    <input type="text" id="ingredient-search" placeholder="Search by name..." class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-coffee focus:border-coffee">
                </div>
                
                <div>
                    <label for="stock-filter" class="block text-sm font-medium text-gray-700 mb-1">Filter by Stock</label>
                    <select id="stock-filter" class="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-coffee focus:border-coffee">
                        <option value="all">All Ingredients</option>
                        <option value="low">Low Stock</option>
                        <option value="out">Out of Stock</option>
                    </select>
                </div>
            </div>
        </div>
        
        <div class="bg-white rounded-lg shadow-md overflow-hidden">
            <div class="overflow-x-auto">
                <table class="min-w-full">
                    <thead class="bg-coffee-light text-white">
                        <tr>
                            <th class="py-3 px-4 text-left">Ingredient Name</th>
                            <th class="py-3 px-4 text-left">Quantity in Stock</th>
                            <th class="py-3 px-4 text-left">Unit</th>
                            <th class="py-3 px-4 text-left">Status</th>
                            ${isOwner ? `<th class="py-3 px-4 text-left">Actions</th>` : ''}
                        </tr>
                    </thead>
                    <tbody id="ingredients-table-body">
                        <tr>
                            <td colspan="${isOwner ? '5' : '4'}" class="py-8 text-center text-gray-500">Loading ingredients...</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
        
        ${isOwner ? `
        <!-- Add/Edit Ingredient Modal -->
        <div id="ingredient-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden">
            <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                <h3 id="modal-title" class="text-xl font-bold text-coffee-dark mb-4">Add Ingredient</h3>
                
                <form id="ingredient-form" class="space-y-4">
                    <input type="hidden" id="ingredient-id">
                    
                    <div>
                        <label for="ingredient-name" class="block text-sm font-medium text-gray-700 mb-1">Ingredient Name</label>
                        <input type="text" id="ingredient-name" class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-coffee focus:border-coffee" required>
                    </div>
                    
                    <div>
                        <label for="quantity-in-stock" class="block text-sm font-medium text-gray-700 mb-1">Quantity in Stock</label>
                        <input type="number" id="quantity-in-stock" step="0.01" min="0" class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-coffee focus:border-coffee" required>
                    </div>
                    
                    <div>
                        <label for="unit" class="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                        <input type="text" id="unit" class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-coffee focus:border-coffee" required>
                    </div>
                    
                    <div>
                        <label for="reorder-level" class="block text-sm font-medium text-gray-700 mb-1">Reorder Level</label>
                        <input type="number" id="reorder-level" step="0.01" min="0" class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-coffee focus:border-coffee" required>
                    </div>
                    
                    <div class="flex justify-end gap-4 pt-2">
                        <button type="button" id="cancel-ingredient-btn" class="px-4 py-2 text-coffee-dark border border-coffee-dark rounded-md hover:bg-coffee-light hover:text-white transition-colors">
                            Cancel
                        </button>
                        <button type="submit" class="px-4 py-2 bg-coffee text-white rounded-md hover:bg-coffee-dark transition-colors">
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
        
        <!-- Adjust Inventory Modal -->
        <div id="adjust-inventory-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden">
            <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                <h3 class="text-xl font-bold text-coffee-dark mb-4">Adjust Inventory</h3>
                
                <input type="hidden" id="adjust-ingredient-id">
                
                <div class="mb-6">
                    <p class="text-lg font-medium text-coffee-dark" id="adjust-ingredient-name"></p>
                    <p class="text-gray-600" id="adjust-current-stock"></p>
                </div>
                
                <form id="adjust-inventory-form" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Adjustment Type</label>
                        <div class="flex gap-4">
                            <label class="flex items-center">
                                <input type="radio" name="adjustment-type" value="add" class="text-coffee mr-2" checked>
                                <span>Add Stock</span>
                            </label>
                            <label class="flex items-center">
                                <input type="radio" name="adjustment-type" value="remove" class="text-coffee mr-2">
                                <span>Remove Stock</span>
                            </label>
                        </div>
                    </div>
                    
                    <div>
                        <label for="adjustment-amount" class="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                        <input type="number" id="adjustment-amount" step="0.01" min="0.01" class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-coffee focus:border-coffee" required>
                    </div>
                    
                    <div>
                        <label for="adjustment-reason" class="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                        <textarea id="adjustment-reason" rows="2" class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-coffee focus:border-coffee" required></textarea>
                    </div>
                    
                    <div class="flex justify-end gap-4 pt-2">
                        <button type="button" id="cancel-adjustment-btn" class="px-4 py-2 text-coffee-dark border border-coffee-dark rounded-md hover:bg-coffee-light hover:text-white transition-colors">
                            Cancel
                        </button>
                        <button type="submit" class="px-4 py-2 bg-coffee text-white rounded-md hover:bg-coffee-dark transition-colors">
                            Save Adjustment
                        </button>
                    </div>
                </form>
            </div>
        </div>
        ` : ''}
    `;
    
    // Set up a debug message to check if this function is executing
    console.log('Setting up inventory interface');
    
    // Setup event listeners first
    setupInventoryEventListeners();
    
    // Then load ingredients
    loadIngredients('all');
}

function setupInventoryEventListeners() {
    // Get user role from localStorage
    const userRole = localStorage.getItem('userRole');
    const isOwner = userRole === 'Owner';
    
    // Search functionality (available for all roles)
    const searchInput = document.getElementById('ingredient-search');
    if (searchInput) {
        searchInput.addEventListener('input', handleIngredientSearch);
    } else {
        console.error('Ingredient search input not found');
    }
    
    // Stock filter (available for all roles)
    const stockFilter = document.getElementById('stock-filter');
    if (stockFilter) {
        stockFilter.addEventListener('change', (e) => {
            loadIngredients(e.target.value);
        });
    } else {
        console.error('Stock filter not found');
    }
    
    // Owner-only event listeners
    if (isOwner) {
        // Add ingredient button
        const addBtn = document.getElementById('add-ingredient-btn');
        if (addBtn) {
            addBtn.addEventListener('click', showAddIngredientModal);
        }
        
        // Ingredient form cancel button
        const cancelBtn = document.getElementById('cancel-ingredient-btn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', hideIngredientModal);
        }
        
        // Ingredient form submit
        const ingredientForm = document.getElementById('ingredient-form');
        if (ingredientForm) {
            ingredientForm.addEventListener('submit', handleIngredientFormSubmit);
        }
        
        // Adjust inventory modal cancel button
        const cancelAdjustBtn = document.getElementById('cancel-adjustment-btn');
        if (cancelAdjustBtn) {
            cancelAdjustBtn.addEventListener('click', hideAdjustInventoryModal);
        }
        
        // Adjust inventory form submit
        const adjustForm = document.getElementById('adjust-inventory-form');
        if (adjustForm) {
            adjustForm.addEventListener('submit', handleAdjustInventorySubmit);
        }
        
        // Table row action buttons (using event delegation)
        const tableBody = document.getElementById('ingredients-table-body');
        if (tableBody) {
            tableBody.addEventListener('click', (e) => {
                if (e.target.closest('.edit-ingredient-btn')) {
                    const id = e.target.closest('.edit-ingredient-btn').dataset.id;
                    showEditIngredientModal(id);
                } else if (e.target.closest('.delete-ingredient-btn')) {
                    const id = e.target.closest('.delete-ingredient-btn').dataset.id;
                    confirmDeleteIngredient(id);
                } else if (e.target.closest('.adjust-inventory-btn')) {
                    const id = e.target.closest('.adjust-inventory-btn').dataset.id;
                    showAdjustInventoryModal(id);
                }
            });
        }
    }
}

function handleIngredientSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    const tableRows = document.querySelectorAll('#ingredients-table-body tr');
    
    tableRows.forEach(row => {
        const firstCell = row.querySelector('td:first-child');
        if (firstCell) {
            const ingredientName = firstCell.textContent.toLowerCase();
            
            if (ingredientName.includes(searchTerm)) {
                row.classList.remove('hidden');
            } else {
                row.classList.add('hidden');
            }
        }
    });
}

async function loadIngredients(filterType) {
    try {
        console.log('Loading ingredients with filter:', filterType);
        const tableBody = document.getElementById('ingredients-table-body');
        if (!tableBody) {
            console.error('Ingredients table body not found');
            return;
        }
        
        const userRole = localStorage.getItem('userRole');
        const isOwner = userRole === 'Owner';
        
        // Show loading state
        tableBody.innerHTML = `<tr><td colspan="${isOwner ? '5' : '4'}" class="py-8 text-center text-gray-500"><i class="fas fa-spinner fa-spin mr-2"></i>Loading ingredients...</td></tr>`;
        
        // Get Supabase client safely
        const supabaseClient = getSupabaseClient();
        if (!supabaseClient) {
            throw new Error('Supabase client is not available');
        }
        
        // Get reorder level from ingredients_settings table
        let defaultReorderLevel = 10;
        try {
            const { data: settings, error: settingsError } = await supabaseClient
                .from('ingredients_settings')
                .select('*')
                .single();
                
            if (!settingsError && settings && settings.default_reorder_level) {
                defaultReorderLevel = settings.default_reorder_level;
            }
        } catch (settingsError) {
            console.log('Could not load settings, using default reorder level');
        }
        
        // Query ingredients
        let query = supabaseClient
            .from('ingredients')
            .select('*')
            .order('ingredient_name');
            
        // Apply filter if specified
        if (filterType === 'low') {
            query = query.lt('quantity_in_stock', defaultReorderLevel).gt('quantity_in_stock', 0);
        } else if (filterType === 'out') {
            query = query.lte('quantity_in_stock', 0);
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        
        console.log('Loaded ingredients:', data ? data.length : 0);
        
        if (!data || data.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="${isOwner ? '5' : '4'}" class="py-8 text-center text-gray-500">No ingredients found</td></tr>`;
            return;
        }
        
        // Display the ingredients in the table
        tableBody.innerHTML = data.map(ingredient => {
            const quantity = parseFloat(ingredient.quantity_in_stock);
            const reorderLevel = ingredient.reorder_level || defaultReorderLevel;
            
            // Determine status and apply appropriate styling
            let status, statusClass;
            if (quantity <= 0) {
                status = 'Out of Stock';
                statusClass = 'bg-red-100 text-red-800';
            } else if (quantity < reorderLevel) {
                status = 'Low Stock';
                statusClass = 'bg-yellow-100 text-yellow-800';
            } else {
                status = 'In Stock';
                statusClass = 'bg-green-100 text-green-800';
            }
            
            return `
                <tr class="border-b hover:bg-gray-50">
                    <td class="py-3 px-4">${ingredient.ingredient_name}</td>
                    <td class="py-3 px-4">${quantity.toFixed(2)}</td>
                    <td class="py-3 px-4">${ingredient.unit}</td>
                    <td class="py-3 px-4">
                        <span class="px-2 py-1 rounded-full text-xs font-medium ${statusClass}">
                            ${status}
                        </span>
                    </td>
                    ${isOwner ? `
                    <td class="py-3 px-4">
                        <div class="flex space-x-2">
                            <button class="adjust-inventory-btn text-blue-600 hover:text-blue-800" data-id="${ingredient.ingredient_id}" title="Adjust Inventory">
                                <i class="fas fa-balance-scale"></i>
                            </button>
                            <button class="edit-ingredient-btn text-green-600 hover:text-green-800" data-id="${ingredient.ingredient_id}" title="Edit Ingredient">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="delete-ingredient-btn text-red-600 hover:text-red-800" data-id="${ingredient.ingredient_id}" title="Delete Ingredient">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                    ` : ''}
                </tr>
            `;
        }).join('');
        
    } catch (error) {
        console.error('Error loading ingredients:', error);
        const tableBody = document.getElementById('ingredients-table-body');
        if (tableBody) {
            const userRole = localStorage.getItem('userRole');
            const isOwner = userRole === 'Owner';
            
            tableBody.innerHTML = `<tr><td colspan="${isOwner ? '5' : '4'}" class="py-8 text-center text-red-500">Error loading ingredients: ${error.message}</td></tr>`;
        }
    }
}

// The following functions are only used by Owners/Admins
function showAddIngredientModal() {
    // Check role first
    if (localStorage.getItem('userRole') !== 'Owner') return;
    
    const modalTitle = document.getElementById('modal-title');
    const ingredientId = document.getElementById('ingredient-id');
    const ingredientName = document.getElementById('ingredient-name');
    const quantityInStock = document.getElementById('quantity-in-stock');
    const unit = document.getElementById('unit');
    const reorderLevel = document.getElementById('reorder-level');
    const modal = document.getElementById('ingredient-modal');
    
    if (!modalTitle || !ingredientId || !ingredientName || !quantityInStock || !unit || !reorderLevel || !modal) {
        console.error('One or more modal elements not found');
        return;
    }
    
    modalTitle.textContent = 'Add Ingredient';
    ingredientId.value = '';
    ingredientName.value = '';
    quantityInStock.value = '0.00';
    unit.value = '';
    reorderLevel.value = '10.00';
    
    modal.classList.remove('hidden');
}

async function showEditIngredientModal(id) {
    // Check role first
    if (localStorage.getItem('userRole') !== 'Owner') return;
    
    try {
        const supabaseClient = getSupabaseClient();
        if (!supabaseClient) {
            throw new Error('Supabase client is not available');
        }
        
        const { data, error } = await supabaseClient
            .from('ingredients')
            .select('*')
            .eq('ingredient_id', id)
            .single();
            
        if (error) throw error;
        
        const modalTitle = document.getElementById('modal-title');
        const ingredientId = document.getElementById('ingredient-id');
        const ingredientName = document.getElementById('ingredient-name');
        const quantityInStock = document.getElementById('quantity-in-stock');
        const unit = document.getElementById('unit');
        const reorderLevel = document.getElementById('reorder-level');
        const modal = document.getElementById('ingredient-modal');
        
        if (!modalTitle || !ingredientId || !ingredientName || !quantityInStock || !unit || !reorderLevel || !modal) {
            throw new Error('One or more modal elements not found');
        }
        
        modalTitle.textContent = 'Edit Ingredient';
        ingredientId.value = data.ingredient_id;
        ingredientName.value = data.ingredient_name;
        quantityInStock.value = parseFloat(data.quantity_in_stock).toFixed(2);
        unit.value = data.unit;
        reorderLevel.value = parseFloat(data.reorder_level || 10).toFixed(2);
        
        modal.classList.remove('hidden');
        
    } catch (error) {
        console.error('Error fetching ingredient:', error);
        alert('Error fetching ingredient details. Please try again.');
    }
}

function hideIngredientModal() {
    // Check role first
    if (localStorage.getItem('userRole') !== 'Owner') return;
    
    const modal = document.getElementById('ingredient-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

async function handleIngredientFormSubmit(e) {
    e.preventDefault();
    
    // Check role first
    if (localStorage.getItem('userRole') !== 'Owner') return;
    
    const id = document.getElementById('ingredient-id').value;
    const name = document.getElementById('ingredient-name').value;
    const quantity = parseFloat(document.getElementById('quantity-in-stock').value);
    const unit = document.getElementById('unit').value;
    const reorderLevel = parseFloat(document.getElementById('reorder-level').value);
    
    if (!name || !unit) {
        alert('Please fill in all required fields');
        return;
    }
    
    try {
        const supabaseClient = getSupabaseClient();
        if (!supabaseClient) {
            throw new Error('Supabase client is not available');
        }
        
        let result;
        
        if (id) {
            // Update existing ingredient
            result = await supabaseClient
                .from('ingredients')
                .update({
                    ingredient_name: name,
                    quantity_in_stock: quantity,
                    unit: unit,
                    reorder_level: reorderLevel
                })
                .eq('ingredient_id', id);
        } else {
            // Add new ingredient
            result = await supabaseClient
                .from('ingredients')
                .insert([{
                    ingredient_name: name,
                    quantity_in_stock: quantity,
                    unit: unit,
                    reorder_level: reorderLevel
                }]);
        }
        
        if (result.error) throw result.error;
        
        hideIngredientModal();
        
        const filterSelect = document.getElementById('stock-filter');
        const currentFilter = filterSelect ? filterSelect.value : 'all';
        loadIngredients(currentFilter);
        
    } catch (error) {
        console.error('Error saving ingredient:', error);
        alert('There was an error saving the ingredient. Please try again.');
    }
}

async function confirmDeleteIngredient(id) {
    // Check role first
    if (localStorage.getItem('userRole') !== 'Owner') return;
    
    if (confirm('Are you sure you want to delete this ingredient? This action cannot be undone.')) {
        try {
            const supabaseClient = getSupabaseClient();
            if (!supabaseClient) {
                throw new Error('Supabase client is not available');
            }
            
            const { error } = await supabaseClient
                .from('ingredients')
                .delete()
                .eq('ingredient_id', id);
                
            if (error) throw error;
            
            const filterSelect = document.getElementById('stock-filter');
            const currentFilter = filterSelect ? filterSelect.value : 'all';
            loadIngredients(currentFilter);
            
        } catch (error) {
            console.error('Error deleting ingredient:', error);
            alert('There was an error deleting the ingredient. It may be in use by some products.');
        }
    }
}

async function showAdjustInventoryModal(id) {
    // Check role first
    if (localStorage.getItem('userRole') !== 'Owner') return;
    
    try {
        const supabaseClient = getSupabaseClient();
        if (!supabaseClient) {
            throw new Error('Supabase client is not available');
        }
        
        const { data, error } = await supabaseClient
            .from('ingredients')
            .select('*')
            .eq('ingredient_id', id)
            .single();
            
        if (error) throw error;
        
        const adjustId = document.getElementById('adjust-ingredient-id');
        const adjustName = document.getElementById('adjust-ingredient-name');
        const adjustStock = document.getElementById('adjust-current-stock');
        const adjustAmount = document.getElementById('adjustment-amount');
        const adjustReason = document.getElementById('adjustment-reason');
        const adjustModal = document.getElementById('adjust-inventory-modal');
        
        if (!adjustId || !adjustName || !adjustStock || !adjustAmount || !adjustReason || !adjustModal) {
            throw new Error('One or more adjustment modal elements not found');
        }
        
        adjustId.value = data.ingredient_id;
        adjustName.textContent = data.ingredient_name;
        adjustStock.textContent = `Current Stock: ${parseFloat(data.quantity_in_stock).toFixed(2)} ${data.unit}`;
        adjustAmount.value = '';
        adjustReason.value = '';
        
        // Set the default to "add"
        const addRadio = document.querySelector('input[name="adjustment-type"][value="add"]');
        if (addRadio) {
            addRadio.checked = true;
        }
        
        adjustModal.classList.remove('hidden');
        
    } catch (error) {
        console.error('Error fetching ingredient:', error);
        alert('Error fetching ingredient details. Please try again.');
    }
}

function hideAdjustInventoryModal() {
    // Check role first
    if (localStorage.getItem('userRole') !== 'Owner') return;
    
    const modal = document.getElementById('adjust-inventory-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

async function handleAdjustInventorySubmit(e) {
    e.preventDefault();
    
    // Check role first
    if (localStorage.getItem('userRole') !== 'Owner') return;
    
    const id = document.getElementById('adjust-ingredient-id').value;
    const amountField = document.getElementById('adjustment-amount');
    const adjustmentType = document.querySelector('input[name="adjustment-type"]:checked');
    const reasonField = document.getElementById('adjustment-reason');
    
    if (!amountField || !adjustmentType || !reasonField) {
        console.error('Form fields not found');
        return;
    }
    
    const amount = parseFloat(amountField.value);
    const reason = reasonField.value;
    
    if (!amount || isNaN(amount) || amount <= 0) {
        alert('Please enter a valid amount greater than zero');
        return;
    }
    
    if (!reason.trim()) {
        alert('Please enter a reason for the adjustment');
        return;
    }
    
    try {
        const supabaseClient = getSupabaseClient();
        if (!supabaseClient) {
            throw new Error('Supabase client is not available');
        }
        
        // First get current quantity
        const { data, error } = await supabaseClient
            .from('ingredients')
            .select('quantity_in_stock, unit')
            .eq('ingredient_id', id)
            .single();
            
        if (error) throw error;
        
        let newQuantity;
        const adjustType = adjustmentType.value;
        
        if (adjustType === 'add') {
            newQuantity = parseFloat(data.quantity_in_stock) + amount;
        } else {
            newQuantity = parseFloat(data.quantity_in_stock) - amount;
            if (newQuantity < 0) {
                alert(`Cannot remove more than available stock (${parseFloat(data.quantity_in_stock).toFixed(2)} ${data.unit})`);
                return;
            }
        }
        
        // Update the quantity
        const { error: updateError } = await supabaseClient
            .from('ingredients')
            .update({ quantity_in_stock: newQuantity })
            .eq('ingredient_id', id);
            
        if (updateError) throw updateError;
        
        // Log the inventory adjustment
        try {
            await supabaseClient
                .from('inventory_logs')
                .insert([{
                    ingredient_id: id,
                    adjustment_type: adjustType,
                    amount: amount,
                    reason: reason,
                    user_id: localStorage.getItem('userId') || null
                }]);
        } catch (logError) {
            console.error('Error logging inventory adjustment:', logError);
            // Continue even if logging fails
        }
        
        hideAdjustInventoryModal();
        
        const filterSelect = document.getElementById('stock-filter');
        const currentFilter = filterSelect ? filterSelect.value : 'all';
        loadIngredients(currentFilter);
        
    } catch (error) {
        console.error('Error adjusting inventory:', error);
        alert('There was an error adjusting the inventory. Please try again.');
    }
}

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

// Make a global function for initializing inventory
window.initializeInventory = function() {
    const inventorySection = document.getElementById('inventory-section');
    if (inventorySection) {
        setupInventoryInterface(inventorySection);
    }
};