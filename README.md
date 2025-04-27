# Popoy's Café POS System

## Overview
Popoy's Café POS System is a web-based point of sale and inventory management system designed specifically for Popoy's Café Pastry and Roastery. The system provides complete functionality for managing sales, inventory, reporting, and user access control.

## Technology Stack
- Frontend: HTML, Tailwind CSS
- JavaScript: Vanilla JS
- Backend/Database: Supabase
- Charts: Chart.js

## Features and Functionality

### Authentication System
- User registration with email verification
- Secure login with session management
- Role-based access control (Owner/Staff)
- Password management and recovery

### Point of Sale (POS)
- Product selection by category
- Real-time order management
- Multiple payment methods (Cash, Card, GCash)
- Quantity adjustment for items
- Automated inventory deduction
- Receipt generation and printing
- Numeric keypad for payment entry

### Inventory Management
- Ingredient tracking and stock levels
- Low stock alerts
- Inventory adjustment (add/remove stock)
- Stock level monitoring
- Ingredient usage tracking

### Sales Reporting
- Daily sales summary
- Best-selling products identification
- Detailed order history
- Sales filtering by date range
- Sales reporting by product
- Payment method analysis
- Data export to CSV

### Order Management
- Order status tracking (Completed/Voided)
- Order modification capability
- Order voiding with reason tracking
- Order detail viewing
- Order history browsing

### User Management
- User creation and modification
- Role assignment (Owner/Staff)
- Password reset functionality
- User activity tracking

### Dashboard
- Sales performance visualization
- Top selling products charts
- Daily revenue tracking
- Low stock item alerts
- System status overview

## System Modules

### POS Module
- `setupPOSInterface()`: Creates the POS UI
- `loadProducts()`: Fetches products from database
- `addToOrder()`: Adds products to current order
- `updateOrderDisplay()`: Refreshes the order UI
- `completeOrder()`: Processes payment and saves order
- `updateInventory()`: Adjusts stock levels
- `generateReceipt()`: Creates printable receipt
- `printReceipt()`: Sends receipt to printer

### Inventory Module
- `loadIngredients()`: Retrieves ingredient data
- `showAdjustInventoryModal()`: Opens stock adjustment UI
- `handleAdjustInventorySubmit()`: Processes inventory changes
- `handleIngredientFormSubmit()`: Saves ingredient updates
- `confirmDeleteIngredient()`: Removes ingredients

### Sales Reports Module
- `generateSalesReport()`: Creates sales analysis
- `generateProductSalesReport()`: Analyzes product performance
- `generateIngredientUsageReport()`: Tracks ingredient consumption
- `createSalesChart()`: Visualizes sales data
- `exportReport()`: Exports data to CSV format

### Daily Sales Module
- `loadDailySales()`: Retrieves daily sales data
- `updateSalesSummary()`: Calculates sales metrics
- `loadBestSellingItems()`: Identifies top sellers
- `displayOrderDetails()`: Shows order information
- `exportDailySales()`: Exports daily data to CSV

### Void Management Module
- `loadVoidedOrders()`: Gets voided order history
- `showVoidOrderModal()`: Opens void interface
- `confirmVoidOrder()`: Processes order voiding
- `returnIngredientsToInventory()`: Restores stock levels

### User Management Module
- `loadUsers()`: Retrieves user data
- `handleUserFormSubmit()`: Processes user changes
- `showChangePasswordModal()`: Opens password UI
- `handlePasswordFormSubmit()`: Updates passwords

### Database Utilities
- `getSupabaseClient()`: Safely retrieves database connection
- `setupSupabaseFunctions()`: Initializes stored procedures
- `createSampleProducts()`: Adds demo products

## Database Schema
The system uses a relational database with the following structure:
- `users`: Store user accounts and access roles
- `products`: Manage available products for sale
- `ingredients`: Track raw materials in inventory
- `product_ingredients`: Map which ingredients are used in each product
- `orders`: Record customer purchases
- `order_details`: Itemize products in each order
- `voided_sales`: Track cancelled orders with reasons

## Recent Changes and Fixes

### Authentication System Fix (Email Integration)
- Added proper email field to registration form
- Updated login to use real email addresses instead of synthetic ones
- Modified user schema to handle emails properly

### UUID to SERIAL ID Mapping Fix
**Problem:** The system was experiencing an error during user registration:
```
invalid input syntax for type integer: "002fcc45-8fa9-4796-a319-d7b22005e759"
```

**Root Cause:** Supabase Auth uses UUIDs for user identification, but our database schema uses SERIAL integers for primary keys. The code was trying to insert UUID values into an integer field.

**Solution:**
1. Modified the registration process in `supabase-connection.js`:
   - Let the database auto-generate the integer `user_id` (SERIAL type)
   - Update the user record with the Supabase Auth UUID stored in a separate field 
   - Used a two-step process: create user first, then update with auth_id

2. Updated the login process:
   - Find users by matching auth_id instead of user_id

3. Database schema update:
   - Added auth_id column (UUID type) to users table
   - Created an index for faster lookups

### Files Consolidated
- Merged functionality from `supabase-init.js` into `supabase-connection.js`
- Made stored procedure creation optional and permission-based

## Setup Instructions

### Database Setup
Run the following SQL in your Supabase SQL Editor to add the auth_id column:

```sql
-- Add auth_id column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_id UUID;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_auth_id ON users(auth_id);
```
