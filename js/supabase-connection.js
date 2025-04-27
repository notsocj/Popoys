// Initialize Supabase client
const supabaseUrl = 'https://uvzgsdcolxlfzgktafrr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV2emdzZGNvbHhsZnpna3RhZnJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU2NzkyNTcsImV4cCI6MjA2MTI1NTI1N30.ZKWB_dOkrGbwBYG78wIGB_p2cevkO-jTHaZiRL-UOjs';

// Create Supabase client - fixed to use the global createClient method
const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);

// Make it globally available
window.supabaseClient = supabaseClient;
