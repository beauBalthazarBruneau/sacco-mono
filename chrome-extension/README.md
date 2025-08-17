# Sacco Chrome Extension

A Chrome extension for Sacco that handles authentication with Supabase and will eventually read ESPN fantasy football pages.

## Features

- ✅ **Authentication Status Display** - Shows whether user is authenticated with Supabase
- ✅ **Magic Link Authentication** - Sign in with email magic link
- 🔄 **Future: ESPN Page Reading** - Read ESPN fantasy football pages (with user permission)

## Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Supabase
Edit `lib/supabase.ts` and replace the placeholder values with your actual Supabase credentials:
```typescript
const supabaseUrl = 'YOUR_SUPABASE_URL'
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY'
```

### 3. Development
```bash
npm run dev
```

### 4. Build for Production
```bash
npm run build
```

### 5. Load Extension in Chrome
1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `build/chrome-mv3-dev` folder (after running `npm run dev`)

## Project Structure

```
├── popup.tsx          # Main popup interface
├── background.ts      # Background script for auth management
├── content.ts         # Content script for page reading
├── lib/
│   └── supabase.ts    # Supabase client configuration
└── assets/            # Extension icons and assets
```

## Development

- **Plasmo Framework** - React-based Chrome extension framework
- **TypeScript** - Type-safe development
- **Supabase** - Authentication and backend
- **Hot Reload** - Automatic reloading during development

## Future Features

- ESPN fantasy football page data extraction
- User permission management for page reading
- Data synchronization with backend
- Advanced fantasy football analytics

## Troubleshooting

- Make sure your Supabase URL and anon key are correctly configured
- Check the browser console for any error messages
- Ensure the extension has the necessary permissions in Chrome
