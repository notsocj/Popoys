document.addEventListener('DOMContentLoaded', () => {
    const usersSection = document.getElementById('users-section');
    if (usersSection) {
        setupUsersInterface(usersSection);
    }
});

function setupUsersInterface(container) {
    container.innerHTML = `
        <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-bold text-coffee-dark">User Management</h2>
            <button id="add-user-btn" class="bg-coffee text-white px-4 py-2 rounded-md hover:bg-coffee-dark transition-colors">
                <i class="fas fa-user-plus mr-2"></i> Add User
            </button>
        </div>
        
        <div class="bg-white rounded-lg shadow-md overflow-hidden">
            <table class="min-w-full">
                <thead class="bg-coffee-light text-white">
                    <tr>
                        <th class="py-3 px-4 text-left">Username</th>
                        <th class="py-3 px-4 text-left">Role</th>
                        <th class="py-3 px-4 text-left">Created At</th>
                        <th class="py-3 px-4 text-left">Actions</th>
                    </tr>
                </thead>
                <tbody id="users-table-body">
                    <!-- Users will be loaded here -->
                    <tr>
                        <td colspan="4" class="py-8 text-center text-gray-500">Loading users...</td>
                    </tr>
                </tbody>
            </table>
        </div>
        
        <!-- Add/Edit User Modal -->
        <div id="user-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden">
            <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                <h3 id="user-modal-title" class="text-xl font-bold text-coffee-dark mb-4">Add User</h3>
                
                <form id="user-form" class="space-y-4">
                    <input type="hidden" id="user-id">
                    
                    <div>
                        <label for="username-input" class="block text-sm font-medium text-gray-700 mb-1">Username</label>
                        <input type="text" id="username-input" class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-coffee focus:border-coffee">
                    </div>

                    <div>
                        <label for="email-input" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input type="email" id="email-input" class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-coffee focus:border-coffee">
                    </div>
                    
                    <div id="password-field">
                        <label for="password-input" class="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input type="password" id="password-input" class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-coffee focus:border-coffee">
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Role</label>
                        <div class="flex gap-4">
                            <label class="flex items-center">
                                <input type="radio" name="user-role" value="Owner" class="text-coffee">
                                <span class="ml-2">Owner</span>
                            </label>
                            <label class="flex items-center">
                                <input type="radio" name="user-role" value="Staff" class="text-coffee" checked>
                                <span class="ml-2">Staff</span>
                            </label>
                        </div>
                    </div>
                    
                    <div class="flex justify-end gap-4 pt-2">
                        <button type="button" id="cancel-user-btn" class="px-4 py-2 text-coffee-dark border border-coffee-dark rounded-md hover:bg-coffee-light hover:text-white transition-colors">
                            Cancel
                        </button>
                        <button type="submit" class="px-4 py-2 bg-coffee text-white rounded-md hover:bg-coffee-dark transition-colors">
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
        
        <!-- Change Password Modal -->
        <div id="change-password-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden">
            <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                <h3 class="text-xl font-bold text-coffee-dark mb-4">Change Password</h3>
                
                <form id="password-form" class="space-y-4">
                    <input type="hidden" id="password-user-id">
                    
                    <p id="password-username" class="font-medium mb-4"></p>
                    
                    <div>
                        <label for="new-password" class="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                        <input type="password" id="new-password" class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-coffee focus:border-coffee">
                    </div>
                    
                    <div>
                        <label for="confirm-password" class="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                        <input type="password" id="confirm-password" class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-coffee focus:border-coffee">
                    </div>
                    
                    <div class="flex justify-end gap-4 pt-2">
                        <button type="button" id="cancel-password-btn" class="px-4 py-2 text-coffee-dark border border-coffee-dark rounded-md hover:bg-coffee-light hover:text-white transition-colors">
                            Cancel
                        </button>
                        <button type="submit" class="px-4 py-2 bg-coffee text-white rounded-md hover:bg-coffee-dark transition-colors">
                            Update Password
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    // Load users
    loadUsers();
    
    // Setup event listeners
    setupUserEventListeners();
}

async function loadUsers() {
    try {
        const result = await db.users.getAll();
        
        if (!result.success) throw new Error(result.error);
        
        const data = result.data;
        const tableBody = document.getElementById('users-table-body');
        
        if (data.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="4" class="py-8 text-center text-gray-500">No users found</td></tr>';
            return;
        }
        
        tableBody.innerHTML = data.map(user => {
            const createdAt = new Date(user.created_at).toLocaleString();
            const currentUserId = localStorage.getItem('userId');
            const isSelf = currentUserId == user.user_id;
            
            return `
                <tr class="border-b hover:bg-gray-50">
                    <td class="py-3 px-4">${user.username}</td>
                    <td class="py-3 px-4">
                        <span class="px-2 py-1 rounded-full text-xs font-medium 
                            ${user.role === 'Owner' ? 'bg-coffee-light text-white' : 'bg-gray-200 text-coffee-dark'}">
                            ${user.role}
                        </span>
                    </td>
                    <td class="py-3 px-4">${createdAt}</td>
                    <td class="py-3 px-4">
                        <div class="flex space-x-2">
                            <button class="change-password-btn text-blue-600 hover:text-blue-800" data-id="${user.user_id}" data-username="${user.username}">
                                <i class="fas fa-key"></i>
                            </button>
                            <button class="edit-user-btn text-green-600 hover:text-green-800" data-id="${user.user_id}">
                                <i class="fas fa-edit"></i>
                            </button>
                            ${!isSelf ? `
                                <button class="delete-user-btn text-red-600 hover:text-red-800" data-id="${user.user_id}">
                                    <i class="fas fa-trash"></i>
                                </button>
                            ` : ''}
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
        
    } catch (error) {
        console.error('Error loading users:', error);
        document.getElementById('users-table-body').innerHTML = 
            '<tr><td colspan="4" class="py-8 text-center text-red-500">Error loading users</td></tr>';
    }
}

function setupUserEventListeners() {
    // Add user button
    document.getElementById('add-user-btn').addEventListener('click', showAddUserModal);
    
    // Cancel user modal button
    document.getElementById('cancel-user-btn').addEventListener('click', hideUserModal);
    
    // Cancel password modal button
    document.getElementById('cancel-password-btn').addEventListener('click', hidePasswordModal);
    
    // User form submit
    document.getElementById('user-form').addEventListener('submit', handleUserFormSubmit);
    
    // Password form submit
    document.getElementById('password-form').addEventListener('submit', handlePasswordFormSubmit);
    
    // Table row action buttons (using event delegation)
    document.getElementById('users-table-body').addEventListener('click', (e) => {
        if (e.target.closest('.edit-user-btn')) {
            const id = e.target.closest('.edit-user-btn').dataset.id;
            showEditUserModal(id);
        } else if (e.target.closest('.delete-user-btn')) {
            const id = e.target.closest('.delete-user-btn').dataset.id;
            confirmDeleteUser(id);
        } else if (e.target.closest('.change-password-btn')) {
            const id = e.target.closest('.change-password-btn').dataset.id;
            const username = e.target.closest('.change-password-btn').dataset.username;
            showChangePasswordModal(id, username);
        }
    });
}

function showAddUserModal() {
    document.getElementById('user-modal-title').textContent = 'Add User';
    document.getElementById('user-id').value = '';
    document.getElementById('username-input').value = '';
    document.getElementById('email-input').value = '';
    document.getElementById('password-input').value = '';
    document.getElementById('password-field').classList.remove('hidden');
    document.querySelector('input[name="user-role"][value="Staff"]').checked = true;
    
    document.getElementById('user-modal').classList.remove('hidden');
}

async function showEditUserModal(id) {
    try {
        const result = await db.users.getById(id);
        
        if (!result.success) throw new Error(result.error);
        
        const data = result.data;
        
        document.getElementById('user-modal-title').textContent = 'Edit User';
        document.getElementById('user-id').value = data.user_id;
        document.getElementById('username-input').value = data.username;
        document.getElementById('email-input').value = data.email;
        document.getElementById('password-field').classList.add('hidden');
        document.querySelector(`input[name="user-role"][value="${data.role}"]`).checked = true;
        
        document.getElementById('user-modal').classList.remove('hidden');
        
    } catch (error) {
        console.error('Error fetching user:', error);
    }
}

function hideUserModal() {
    document.getElementById('user-modal').classList.add('hidden');
}

function showChangePasswordModal(id, username) {
    document.getElementById('password-user-id').value = id;
    document.getElementById('password-username').textContent = `Change password for: ${username}`;
    document.getElementById('new-password').value = '';
    document.getElementById('confirm-password').value = '';
    
    document.getElementById('change-password-modal').classList.remove('hidden');
}

function hidePasswordModal() {
    document.getElementById('change-password-modal').classList.add('hidden');
}

async function handleUserFormSubmit(e) {
    e.preventDefault();
    
    const id = document.getElementById('user-id').value;
    const username = document.getElementById('username-input').value;
    const email = document.getElementById('email-input').value;
    const password = document.getElementById('password-input').value;
    const role = document.querySelector('input[name="user-role"]:checked').value;
    
    if (!username || !email) {
        alert('Username and email are required');
        return;
    }
    
    if (!id && !password) {
        alert('Password is required for new users');
        return;
    }
    
    try {
        let result;
        
        if (id) {
            // Update existing user
            result = await db.users.update(id, { username, email, role });
        } else {
            // Create new user
            result = await db.auth.register(username, email, password, role);
        }
        
        if (!result.success) throw new Error(result.error);
        
        hideUserModal();
        loadUsers();
        
    } catch (error) {
        console.error('Error saving user:', error);
        alert(error.message || 'Error saving user');
    }
}

async function handlePasswordFormSubmit(e) {
    e.preventDefault();
    
    const id = document.getElementById('password-user-id').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    
    if (!newPassword) {
        alert('New password is required');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }
    
    try {
        const result = await db.auth.changePassword(id, newPassword);
        
        if (!result.success) throw new Error(result.error);
        
        hidePasswordModal();
        alert('Password updated successfully');
        
    } catch (error) {
        console.error('Error updating password:', error);
        alert(error.message || 'Error updating password');
    }
}

async function confirmDeleteUser(id) {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
        try {
            const result = await db.users.delete(id);
            
            if (!result.success) throw new Error(result.error);
            
            loadUsers();
            
        } catch (error) {
            console.error('Error deleting user:', error);
            alert('Error deleting user: ' + error.message);
        }
    }
}
