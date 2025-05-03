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
    
    // After rendering the UI, attach event listeners and load ingredients
    attachInventoryEventListeners(isOwner);
    loadIngredients();
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

// Attach event listeners to the inventory UI elements
function attachInventoryEventListeners(isOwner) {
    // Search and filter
    const searchInput = document.getElementById('ingredient-search');
    if (searchInput) {
        searchInput.addEventListener('input', filterIngredients);
    }
    
    const stockFilter = document.getElementById('stock-filter');
    if (stockFilter) {
        stockFilter.addEventListener('change', filterIngredients);
    }
    
    if (isOwner) {
        // Add ingredient button
        const addIngredientBtn = document.getElementById('add-ingredient-btn');
        if (addIngredientBtn) {
            addIngredientBtn.addEventListener('click', showAddIngredientModal);
        }
        
        // Cancel button in ingredient modal
        const cancelIngredientBtn = document.getElementById('cancel-ingredient-btn');
        if (cancelIngredientBtn) {
            cancelIngredientBtn.addEventListener('click', hideIngredientModal);
        }
        
        // Cancel button in adjust inventory modal
        const cancelAdjustmentBtn = document.getElementById('cancel-adjustment-btn');
        if (cancelAdjustmentBtn) {
            cancelAdjustmentBtn.addEventListener('click', hideAdjustInventoryModal);
        }
        
        // Ingredient form submission
        const ingredientForm = document.getElementById('ingredient-form');
        if (ingredientForm) {
            ingredientForm.addEventListener('submit', handleIngredientFormSubmit);
        }
        
        // Adjust inventory form submission
        const adjustInventoryForm = document.getElementById('adjust-inventory-form');
        if (adjustInventoryForm) {
            adjustInventoryForm.addEventListener('submit', handleAdjustInventorySubmit);
        }
    }
    
    // Event delegation for ingredient table actions (edit, delete, adjust)
    const tableBody = document.getElementById('ingredients-table-body');
    if (tableBody) {
        tableBody.addEventListener('click', (e) => {
            // Edit button
            const editBtn = e.target.closest('.edit-ingredient-btn');
            if (editBtn && isOwner) {
                const ingredientId = editBtn.dataset.id;
                showEditIngredientModal(ingredientId);
            }
            
            // Delete button
            const deleteBtn = e.target.closest('.delete-ingredient-btn');
            if (deleteBtn && isOwner) {
                const ingredientId = deleteBtn.dataset.id;
                confirmDeleteIngredient(ingredientId);
            }
            
            // Adjust inventory button
            const adjustBtn = e.target.closest('.adjust-inventory-btn');
            if (adjustBtn && isOwner) {
                const ingredientId = adjustBtn.dataset.id;
                const ingredientName = adjustBtn.dataset.name;
                const currentStock = adjustBtn.dataset.stock;
                const unit = adjustBtn.dataset.unit;
                showAdjustInventoryModal(ingredientId, ingredientName, currentStock, unit);
            }
        });
    }
}

async function loadIngredients() {
    try {
        const tableBody = document.getElementById('ingredients-table-body');
        const userRole = localStorage.getItem('userRole');
        const isOwner = userRole === 'Owner';
        
        tableBody.innerHTML = `
            <tr>
                <td colspan="${isOwner ? '5' : '4'}" class="py-8 text-center text-gray-500">
                    <i class="fas fa-spinner fa-spin mr-2"></i> Loading ingredients...
                </td>
            </tr>
        `;
        
        const supabaseClient = getSupabaseClient();
        if (!supabaseClient) {
            throw new Error('Could not connect to the database');
        }
        
        const { data, error } = await supabaseClient
            .from('ingredients')
            .select('*')
            .order('ingredient_name');
            
        if (error) throw error;
        
        if (!data || data.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="${isOwner ? '5' : '4'}" class="py-8 text-center text-gray-500">
                        No ingredients found. Add some to get started.
                    </td>
                </tr>
            `;
            return;
        }
        
        // Render the ingredients
        tableBody.innerHTML = data.map(ingredient => {
            const quantityInStock = parseFloat(ingredient.quantity_in_stock);
            
            let statusClass, statusText;
            if (quantityInStock <= 0) {
                statusClass = 'bg-red-100 text-red-800';
                statusText = 'Out of Stock';
            } else if (quantityInStock <= 5) {
                statusClass = 'bg-yellow-100 text-yellow-800';
                statusText = 'Low Stock';
            } else {
                statusClass = 'bg-green-100 text-green-800';
                statusText = 'In Stock';
            }
            
            return `
                <tr class="border-b hover:bg-gray-50">
                    <td class="py-3 px-4">${ingredient.ingredient_name}</td>
                    <td class="py-3 px-4">${quantityInStock.toFixed(2)} ${ingredient.unit}</td>
                    <td class="py-3 px-4">${ingredient.unit}</td>
                    <td class="py-3 px-4">
                        <span class="px-2 py-1 rounded-full text-xs font-medium ${statusClass}">
                            ${statusText}
                        </span>
                    </td>
                    ${isOwner ? `
                    <td class="py-3 px-4">
                        <div class="flex space-x-2">
                            <button class="adjust-inventory-btn text-blue-600 hover:text-blue-800" 
                                data-id="${ingredient.ingredient_id}" 
                                data-name="${ingredient.ingredient_name}"
                                data-stock="${quantityInStock}"
                                data-unit="${ingredient.unit}">
                                <i class="fas fa-balance-scale"></i>
                            </button>
                            <button class="edit-ingredient-btn text-green-600 hover:text-green-800" data-id="${ingredient.ingredient_id}">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="delete-ingredient-btn text-red-600 hover:text-red-800" data-id="${ingredient.ingredient_id}">
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
        const userRole = localStorage.getItem('userRole');
        const isOwner = userRole === 'Owner';
        
        tableBody.innerHTML = `
            <tr>
                <td colspan="${isOwner ? '5' : '4'}" class="py-8 text-center text-red-500">
                    Error loading ingredients: ${error.message || 'Unknown error'}
                </td>
            </tr>
        `;
    }
}

function filterIngredients() {
    const searchTerm = document.getElementById('ingredient-search').value.toLowerCase();
    const stockFilter = document.getElementById('stock-filter').value;
    const rows = document.querySelectorAll('#ingredients-table-body tr');
    
    // Define stock thresholds - match the same values used in loadIngredients function
    const LOW_STOCK_THRESHOLD = 5;
    const OUT_OF_STOCK_THRESHOLD = 0;
    
    rows.forEach(row => {
        // Skip message rows (those with colspan)
        if (row.querySelector('td[colspan]')) return;
        
        const ingredientName = row.cells[0].textContent.toLowerCase();
        const stockCell = row.cells[1].textContent; // Format is "123.45 kg" or similar
        
        // Extract just the numeric part from cell text
        const stockValue = parseFloat(stockCell.split(' ')[0]);
        
        let showBySearch = ingredientName.includes(searchTerm);
        let showByStock = true;
        
        // Filter based on actual quantity value - using same thresholds as status display
        if (stockFilter === 'low') {
            showByStock = stockValue <= LOW_STOCK_THRESHOLD && stockValue > OUT_OF_STOCK_THRESHOLD;
        } else if (stockFilter === 'out') {
            showByStock = stockValue <= OUT_OF_STOCK_THRESHOLD;
        }
        
        if (showBySearch && showByStock) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
    
    // Check if there are any visible rows after filtering
    let hasVisibleRows = false;
    rows.forEach(row => {
        if (row.style.display !== 'none') {
            hasVisibleRows = true;
        }
    });
    
    // Show "no results" message if all rows are filtered out
    const tableBody = document.getElementById('ingredients-table-body');
    const userRole = localStorage.getItem('userRole');
    const isOwner = userRole === 'Owner';
    
    if (!hasVisibleRows) {
        const noResultsRow = document.createElement('tr');
        noResultsRow.classList.add('no-results-row');
        noResultsRow.innerHTML = `
            <td colspan="${isOwner ? '5' : '4'}" class="py-8 text-center text-gray-500">
                No ingredients match your search criteria
            </td>
        `;
        
        // Remove any existing "no results" row
        document.querySelectorAll('.no-results-row').forEach(el => el.remove());
        
        tableBody.appendChild(noResultsRow);
    } else {
        // Remove "no results" row if we have matches
        document.querySelectorAll('.no-results-row').forEach(el => el.remove());
    }
}

function showAddIngredientModal() {
    // Clear form fields
    document.getElementById('ingredient-id').value = '';
    document.getElementById('ingredient-name').value = '';
    document.getElementById('quantity-in-stock').value = '';
    document.getElementById('unit').value = '';
    
    // Update modal title
    document.getElementById('modal-title').textContent = 'Add Ingredient';
    
    // Show modal
    document.getElementById('ingredient-modal').classList.remove('hidden');
}

async function showEditIngredientModal(ingredientId) {
    try {
        // Show loading state
        document.getElementById('modal-title').textContent = 'Loading...';
        document.getElementById('ingredient-modal').classList.remove('hidden');
        
        const supabaseClient = getSupabaseClient();
        if (!supabaseClient) {
            throw new Error('Could not connect to the database');
        }
        
        const { data, error } = await supabaseClient
            .from('ingredients')
            .select('*')
            .eq('ingredient_id', ingredientId)
            .single();
            
        if (error) throw error;
        
        if (!data) {
            throw new Error('Ingredient not found');
        }
        
        // Populate form with ingredient data
        document.getElementById('ingredient-id').value = data.ingredient_id;
        document.getElementById('ingredient-name').value = data.ingredient_name;
        document.getElementById('quantity-in-stock').value = data.quantity_in_stock;
        document.getElementById('unit').value = data.unit;
        
        // Update modal title
        document.getElementById('modal-title').textContent = 'Edit Ingredient';
        
    } catch (error) {
        console.error('Error loading ingredient details:', error);
        alert('Error loading ingredient details: ' + (error.message || 'Unknown error'));
        hideIngredientModal();
    }
}

function hideIngredientModal() {
    document.getElementById('ingredient-modal').classList.add('hidden');
}

async function handleIngredientFormSubmit(e) {
    e.preventDefault();
    
    try {
        // Get form values
        const ingredientId = document.getElementById('ingredient-id').value;
        const ingredientName = document.getElementById('ingredient-name').value;
        const quantityInStock = parseFloat(document.getElementById('quantity-in-stock').value);
        const unit = document.getElementById('unit').value;
        
        // Validate form
        if (!ingredientName) {
            alert('Please enter an ingredient name');
            return;
        }
        
        if (isNaN(quantityInStock) || quantityInStock < 0) {
            alert('Please enter a valid quantity (must be 0 or greater)');
            return;
        }
        
        if (!unit) {
            alert('Please enter a unit of measurement');
            return;
        }
        
        const supabaseClient = getSupabaseClient();
        if (!supabaseClient) {
            throw new Error('Could not connect to the database');
        }
        
        // Prepare ingredient data - only include columns that exist in the database
        const ingredientData = {
            ingredient_name: ingredientName,
            quantity_in_stock: quantityInStock,
            unit
        };
        
        let result;
        
        // Insert or update based on whether we have an ID
        if (ingredientId) {
            // Update existing ingredient
            result = await supabaseClient
                .from('ingredients')
                .update(ingredientData)
                .eq('ingredient_id', ingredientId);
        } else {
            // Insert new ingredient
            result = await supabaseClient
                .from('ingredients')
                .insert([ingredientData]);
        }
        
        if (result.error) throw result.error;
        
        // Hide modal and reload ingredients
        hideIngredientModal();
        loadIngredients();
        
    } catch (error) {
        console.error('Error saving ingredient:', error);
        alert('There was an error saving the ingredient. Please try again.');
    }
}

function showAdjustInventoryModal(ingredientId, ingredientName, currentStock, unit) {
    document.getElementById('adjust-ingredient-id').value = ingredientId;
    document.getElementById('adjust-ingredient-name').textContent = ingredientName;
    document.getElementById('adjust-current-stock').textContent = `Current Stock: ${currentStock} ${unit}`;
    document.getElementById('adjustment-amount').value = '';
    document.getElementById('adjustment-reason').value = '';
    
    // Reset radio buttons to "Add Stock"
    document.querySelector('input[name="adjustment-type"][value="add"]').checked = true;
    
    document.getElementById('adjust-inventory-modal').classList.remove('hidden');
}

function hideAdjustInventoryModal() {
    document.getElementById('adjust-inventory-modal').classList.add('hidden');
}

async function handleAdjustInventorySubmit(e) {
    e.preventDefault();
    
    try {
        const ingredientId = document.getElementById('adjust-ingredient-id').value;
        const adjustmentType = document.querySelector('input[name="adjustment-type"]:checked').value;
        const adjustmentAmount = parseFloat(document.getElementById('adjustment-amount').value);
        const adjustmentReason = document.getElementById('adjustment-reason').value;
        
        // Validate input
        if (isNaN(adjustmentAmount) || adjustmentAmount <= 0) {
            alert('Please enter a valid adjustment amount (must be greater than 0)');
            return;
        }
        
        if (!adjustmentReason) {
            alert('Please provide a reason for this adjustment');
            return;
        }
        
        const supabaseClient = getSupabaseClient();
        if (!supabaseClient) {
            throw new Error('Could not connect to the database');
        }
        
        // Get current stock level
        const { data: currentData, error: fetchError } = await supabaseClient
            .from('ingredients')
            .select('quantity_in_stock')
            .eq('ingredient_id', ingredientId)
            .single();
            
        if (fetchError) throw fetchError;
        
        let newStock;
        if (adjustmentType === 'add') {
            // Add stock
            newStock = parseFloat(currentData.quantity_in_stock) + adjustmentAmount;
        } else {
            // Remove stock
            newStock = parseFloat(currentData.quantity_in_stock) - adjustmentAmount;
            
            // Prevent negative stock
            if (newStock < 0) {
                newStock = 0;
            }
        }
        
        // Update the inventory
        const { error: updateError } = await supabaseClient
            .from('ingredients')
            .update({ quantity_in_stock: newStock })
            .eq('ingredient_id', ingredientId);
            
        if (updateError) throw updateError;
        
        // Optional: Log the adjustment in a separate table for tracking
        // This would require an additional table in your database
        
        hideAdjustInventoryModal();
        loadIngredients();
        
    } catch (error) {
        console.error('Error adjusting inventory:', error);
        alert('There was an error adjusting the inventory. Please try again.');
    }
}

async function confirmDeleteIngredient(ingredientId) {
    if (confirm('Are you sure you want to delete this ingredient? This action cannot be undone.')) {
        try {
            const supabaseClient = getSupabaseClient();
            if (!supabaseClient) {
                throw new Error('Could not connect to the database');
            }
            
            // Check if this ingredient is used in any products
            const { data: usageData, error: usageError } = await supabaseClient
                .from('product_ingredients')
                .select('product_id')
                .eq('ingredient_id', ingredientId)
                .limit(1);
                
            if (usageError) throw usageError;
            
            if (usageData && usageData.length > 0) {
                alert('This ingredient cannot be deleted because it is used in one or more products.');
                return;
            }
            
            // Delete the ingredient
            const { error: deleteError } = await supabaseClient
                .from('ingredients')
                .delete()
                .eq('ingredient_id', ingredientId);
                
            if (deleteError) throw deleteError;
            
            loadIngredients();
            
        } catch (error) {
            console.error('Error deleting ingredient:', error);
            alert('There was an error deleting the ingredient. Please try again.');
        }
    }
}