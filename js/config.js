const SUPABASE_URL = 'https://uvzgsdcolxlfzgktafrr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV2emdzZGNvbHhsZnpna3RhZnJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU2NzkyNTcsImV4cCI6MjA2MTI1NTI1N30.ZKWB_dOkrGbwBYG78wIGB_p2cevkO-jTHaZiRL-UOjs';

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
