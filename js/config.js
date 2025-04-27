const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// User roles
const ROLE = {
    OWNER: 'Owner',
    STAFF: 'Staff'
};

// Order status
const ORDER_STATUS = {
    COMPLETED: 'Completed',
    VOIDED: 'Voided'
};
