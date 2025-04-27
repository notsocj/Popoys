function setupInventoryEventListeners() {
    // Add ingredient button
    document.getElementById('add-ingredient-btn').addEventListener('click', showAddIngredientModal);
    
    // Search functionality
    document.getElementById('ingredient-search').addEventListener('input', handleIngredientSearch);
    
    // Stock filter
    document.getElementById('stock-filter').addEventListener('change', (e) => {
        loadIngredients(e.target.value);
    });
    
    // Ingredient form cancel button
    document.getElementById('cancel-ingredient-btn').addEventListener('click', hideIngredientModal);
    
    // Ingredient form submit
    document.getElementById('ingredient-form').addEventListener('submit', handleIngredientFormSubmit);
    
    // Adjust inventory modal cancel button
    document.getElementById('cancel-adjustment-btn').addEventListener('click', hideAdjustInventoryModal);
    
    // Adjust inventory form submit
    document.getElementById('adjust-inventory-form').addEventListener('submit', handleAdjustInventorySubmit);
    
    // Table row action buttons (using event delegation)
    document.getElementById('ingredients-table-body').addEventListener('click', (e) => {
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

function handleIngredientSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    const tableRows = document.querySelectorAll('#ingredients-table-body tr');
    
    tableRows.forEach(row => {
        const ingredientName = row.querySelector('td:first-child').textContent.toLowerCase();
        
        if (ingredientName.includes(searchTerm)) {
            row.classList.remove('hidden');
        } else {
            row.classList.add('hidden');
        }
    });
}

function showAddIngredientModal() {
    document.getElementById('modal-title').textContent = 'Add Ingredient';
    document.getElementById('ingredient-id').value = '';
    document.getElementById('ingredient-name').value = '';
    document.getElementById('quantity-in-stock').value = '0.00';
    document.getElementById('unit').value = '';
    document.getElementById('reorder-level').value = '0.00';
    
    document.getElementById('ingredient-modal').classList.remove('hidden');
}

async function showEditIngredientModal(id) {
    try {
        const { data, error } = await supabase
            .from('ingredients')
            .select('*')
            .eq('ingredient_id', id)
            .single();
            
        if (error) throw error;
        
        document.getElementById('modal-title').textContent = 'Edit Ingredient';
        document.getElementById('ingredient-id').value = data.ingredient_id;
        document.getElementById('ingredient-name').value = data.ingredient_name;
        document.getElementById('quantity-in-stock').value = parseFloat(data.quantity_in_stock).toFixed(2);
        document.getElementById('unit').value = data.unit;
        document.getElementById('reorder-level').value = parseFloat(data.reorder_level).toFixed(2);
        
        document.getElementById('ingredient-modal').classList.remove('hidden');
        
    } catch (error) {
        console.error('Error fetching ingredient:', error);
    }
}

function hideIngredientModal() {
    document.getElementById('ingredient-modal').classList.add('hidden');
}

async function handleIngredientFormSubmit(e) {
    e.preventDefault();
    
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
        let result;
        
        if (id) {
            // Update existing ingredient
            result = await supabase
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
            result = await supabase
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
        loadIngredients(document.getElementById('stock-filter').value);
        
    } catch (error) {
        console.error('Error saving ingredient:', error);
        alert('There was an error saving the ingredient. Please try again.');
    }
}

async function confirmDeleteIngredient(id) {
    if (confirm('Are you sure you want to delete this ingredient? This action cannot be undone.')) {
        try {
            const { error } = await supabase
                .from('ingredients')
                .delete()
                .eq('ingredient_id', id);
                
            if (error) throw error;
            
            loadIngredients(document.getElementById('stock-filter').value);
            
        } catch (error) {
            console.error('Error deleting ingredient:', error);
            alert('There was an error deleting the ingredient. It may be in use by some products.');
        }
    }
}

async function showAdjustInventoryModal(id) {
    try {
        const { data, error } = await supabase
            .from('ingredients')
            .select('*')
            .eq('ingredient_id', id)
            .single();
            
        if (error) throw error;
        
        document.getElementById('adjust-ingredient-id').value = data.ingredient_id;
        document.getElementById('adjust-ingredient-name').textContent = data.ingredient_name;
        document.getElementById('adjust-current-stock').textContent = 
            `Current Stock: ${parseFloat(data.quantity_in_stock).toFixed(2)} ${data.unit}`;
        document.getElementById('adjustment-amount').value = '';
        document.getElementById('adjustment-reason').value = '';
        
        document.getElementById('adjust-inventory-modal').classList.remove('hidden');
        
    } catch (error) {
        console.error('Error fetching ingredient:', error);
    }
}

function hideAdjustInventoryModal() {
    document.getElementById('adjust-inventory-modal').classList.add('hidden');
}

async function handleAdjustInventorySubmit(e) {
    e.preventDefault();
    
    const id = document.getElementById('adjust-ingredient-id').value;
    const amount = parseFloat(document.getElementById('adjustment-amount').value);
    const adjustmentType = document.querySelector('input[name="adjustment-type"]:checked').value;
    const reason = document.getElementById('adjustment-reason').value;
    
    if (!amount || isNaN(amount) || amount <= 0) {
        alert('Please enter a valid amount greater than zero');
        return;
    }
    
    try {
        // First get current quantity
        const { data, error } = await supabase
            .from('ingredients')
            .select('quantity_in_stock')
            .eq('ingredient_id', id)
            .single();
            
        if (error) throw error;
        
        let newQuantity;
        if (adjustmentType === 'add') {
            newQuantity = parseFloat(data.quantity_in_stock) + amount;
        } else {
            newQuantity = parseFloat(data.quantity_in_stock) - amount;
            if (newQuantity < 0) {
                alert('Cannot remove more than available stock');
                return;
            }
        }
        
        // Update the quantity
        const { error: updateError } = await supabase
            .from('ingredients')
            .update({ quantity_in_stock: newQuantity })
            .eq('ingredient_id', id);
            
        if (updateError) throw updateError;
        
        hideAdjustInventoryModal();
        loadIngredients(document.getElementById('stock-filter').value);
        
    } catch (error) {
        console.error('Error adjusting inventory:', error);
        alert('There was an error adjusting the inventory. Please try again.');
    }
}
