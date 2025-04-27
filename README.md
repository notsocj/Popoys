# Popoy's Café POS System

## Overview
Popoy's Café POS System is a web-based point of sale and inventory management system designed specifically for Popoy's Café Pastry and Roastery.

## Technology Stack
- Frontend: HTML, Tailwind CSS
- JavaScript: Vanilla JS
- Backend/Database: Supabase

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

## Database Schema
The system uses a relational database with the following structure:
- users - Store user accounts and access roles
- products - Manage available products for sale
- ingredients - Track raw materials in inventory
- product_ingredients - Map which ingredients are used in each product
- orders - Record customer purchases
- order_details - Itemize products in each order
- voided_sales - Track cancelled orders with reasons

## Setup Instructions

### Database Setup
Run the following SQL in your Supabase SQL Editor to add the auth_id column:

```sql
-- Add auth_id column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_id UUID;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_auth_id ON users(auth_id);
```
