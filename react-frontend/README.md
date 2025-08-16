# Fantasy Football Draft Assistant - React Frontend

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase project configured

### Installation
```bash
npm install
```

### Environment Setup
1. Copy the environment template:
   ```bash
   cp env.example .env.local
   ```

2. Add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=https://sjmljrgabepxdfhefyxo.supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_key_here
   ```

### Development
```bash
npm run dev
```

Visit `http://localhost:5174` to see the application.

## 🔐 Authentication

This app uses **Magic Link Authentication** with Supabase:

### How it works:
1. User enters their email address
2. Magic link is sent to their email
3. User clicks the link to sign in
4. Automatic redirect to dashboard

### Features:
- ✅ **No passwords required** - Just email
- ✅ **Secure JWT tokens** - Automatic refresh
- ✅ **Session persistence** - Stays logged in
- ✅ **Protected routes** - Secure dashboard access

## 📁 Project Structure

```
src/
├── components/
│   ├── MagicLinkAuth.tsx    # Sign-in form
│   ├── AuthCallback.tsx     # Magic link handler
│   └── Dashboard.tsx        # Protected dashboard
├── contexts/
│   └── AuthContext.tsx      # Global auth state
├── lib/
│   └── supabase.ts          # Supabase client
├── App.tsx                  # Main app with routing
└── index.css               # Tailwind CSS
```

## 🎯 Testing the Authentication

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Visit the app:**
   - Go to `http://localhost:5174`
   - You should see the sign-in form

3. **Test magic link:**
   - Enter your email address
   - Click "Send magic link"
   - Check your email for the link
   - Click the link to sign in
   - You should be redirected to the dashboard

## 🔧 Configuration

### Supabase Settings
Make sure your Supabase project has the following configured:

1. **Authentication Settings:**
   - Magic link authentication enabled
   - Email confirmations disabled
   - Site URL: `http://localhost:5174`
   - Redirect URLs: `http://localhost:5174/auth/callback`

2. **Database:**
   - User profiles table created
   - Row Level Security enabled
   - Automatic user setup triggers

## 🚀 Production Deployment

### Environment Variables
For production, update your environment variables:

```env
VITE_SUPABASE_URL=https://sjmljrgabepxdfhefyxo.supabase.co
VITE_SUPABASE_ANON_KEY=your_production_anon_key
```

### Build
```bash
npm run build
```

### Deploy
The built files in `dist/` can be deployed to:
- Vercel
- Netlify
- AWS S3
- Any static hosting service

## 🔒 Security Notes

- ✅ **HTTPS required** for production
- ✅ **Secure redirect URLs** configured
- ✅ **JWT token validation** on all requests
- ✅ **Row Level Security** in database
- ✅ **Rate limiting** on magic link requests

## 🎉 Ready for Development!

Your React frontend is now ready for:
- ✅ **User authentication** with magic links
- ✅ **Dashboard development** with user data
- ✅ **Chrome extension integration**
- ✅ **Backend API integration**

---

**Happy coding! 🏈**
