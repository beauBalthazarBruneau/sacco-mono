# Setting Up Supabase API Key for Chrome Extension

## Issue
The Chrome extension is showing "Invalid API key" error because it needs the correct Supabase anon key.

## Solution

### Step 1: Get Your Supabase Anon Key
1. Go to your Supabase project dashboard: https://supabase.com/dashboard
2. Navigate to your project
3. Go to Settings → API
4. Copy the "anon public" key (it starts with `eyJ...`)

### Step 2: Update the Configuration
1. Open `chrome-extension/config/supabase.ts`
2. Replace `'YOUR_ACTUAL_ANON_KEY_HERE'` with your actual anon key
3. Save the file

Example:
```typescript
export const SUPABASE_CONFIG = {
  url: 'https://sjmljrgabepxdfhefyxo.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNqbWxqcmdhYmVweGRmaGVmeXhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM5NzE5NzQsImV4cCI6MjA0OTU0Nzk3NH0.YOUR_ACTUAL_KEY_HERE'
}
```

### Step 3: Restart the Development Server
1. Stop the current dev server (Ctrl+C)
2. Run `npm run dev` again
3. Reload the extension in Chrome

### Step 4: Test
1. Open the extension side panel
2. Try logging in with your email
3. You should no longer see the "Invalid API key" error

## Security Note
- The anon key is safe to use in client-side code
- It only has access to public data and authenticated user data
- Never use the service_role key in client-side code
