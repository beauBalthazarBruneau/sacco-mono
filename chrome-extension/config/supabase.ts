// Supabase configuration for Chrome extension
// Replace these values with your actual Supabase project credentials

export const SUPABASE_CONFIG = {
  url: 'https://sjmljrgabepxdfhefyxo.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNqbWxqcmdhYmVweGRmaGVmeXhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzNjQ0NDEsImV4cCI6MjA3MDk0MDQ0MX0.lglW22_QDBWafedgXu2gt4EHk-UzU0hUHGHvgiLpXBI' // Replace with your actual anon key
}

// Validate configuration
if (!SUPABASE_CONFIG.url || !SUPABASE_CONFIG.anonKey || SUPABASE_CONFIG.anonKey === 'YOUR_ACTUAL_ANON_KEY_HERE') {
  console.error('❌ Invalid Supabase configuration. Please update config/supabase.ts with your actual credentials.')
  throw new Error('Missing or invalid Supabase configuration. Please check config/supabase.ts')
}
