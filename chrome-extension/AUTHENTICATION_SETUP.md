# Chrome Extension Authentication Setup

## Overview
This Chrome extension uses Supabase for authentication with magic link sign-in. The authentication system is built using React, Mantine UI, and the Supabase JavaScript client.

## Architecture

### Components
- **AuthProvider** (`src/contexts/AuthContext.tsx`): Manages authentication state and provides auth methods
- **useAuth Hook** (`src/hooks/useAuth.ts`): Custom hook for accessing auth context
- **Login Component** (`src/components/Login.tsx`): Handles magic link sign-in flow
- **UserProfile Component** (`src/components/UserProfile.tsx`): Displays user info and sign-out option

### Key Features
- Magic link authentication (no passwords required)
- Session persistence using Chrome storage
- Automatic session refresh
- Clean UI with Mantine components

## Setup

### Dependencies
The following packages are required:
- `@supabase/supabase-js`: Supabase client
- `@mantine/core`: UI components
- `@mantine/hooks`: React hooks
- `@mantine/form`: Form handling
- `@mantine/notifications`: Notifications
- `@tabler/icons-react`: Icons

### Permissions
The extension requires the following permissions:
- `storage`: For session persistence
- `sidePanel`: For the extension interface
- `contextMenus`: For context menu integration

## Authentication Flow

1. **Initial Load**: Extension checks for existing session in Chrome storage
2. **Login**: User enters email and receives magic link
3. **Email Verification**: User clicks magic link in email
4. **Session Creation**: Supabase creates session and stores in Chrome storage
5. **Auto-refresh**: Session automatically refreshes when needed

## Usage

### In Components
```tsx
import { useAuth } from '../hooks/useAuth'

function MyComponent() {
  const { user, loading, signOut } = useAuth()
  
  if (loading) return <div>Loading...</div>
  if (!user) return <div>Please sign in</div>
  
  return <div>Welcome, {user.email}!</div>
}
```

### Auth Methods
- `signInWithMagicLink(email)`: Send magic link to email
- `signOut()`: Sign out current user
- `user`: Current user object (null if not authenticated)
- `session`: Current session object
- `loading`: Loading state

## Security Considerations

- Sessions are stored securely in Chrome's local storage
- Magic links expire automatically
- No passwords are stored locally
- All communication with Supabase is over HTTPS

## Development

### Running the Extension
```bash
npm run dev    # Development mode
npm run build  # Production build
npm run package # Create distributable package
```

### Testing Authentication
1. Start the development server
2. Load the extension in Chrome
3. Enter your email in the login form
4. Check your email for the magic link
5. Click the magic link to authenticate

## Troubleshooting

### Common Issues
- **Session not persisting**: Check that storage permission is enabled
- **Magic link not working**: Verify Supabase URL and redirect configuration
- **UI not loading**: Ensure all Mantine dependencies are installed

### Debug Mode
Enable debug logging by checking the browser console for auth state changes and errors.
