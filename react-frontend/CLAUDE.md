# React Frontend - AI Assistant Guide

This is the React frontend component of the Sacco Fantasy Football Assistant, providing the web-based user interface.

## 🎯 Component Overview

The React frontend serves as the primary web application interface for the Sacco Fantasy Football Assistant. It provides:
- User authentication with magic links
- Dashboard for draft management
- User preference configuration
- Integration with Chrome extension data

## 🛠️ Technology Stack

### Core Technologies
- **React 19.1.1** - Latest React with concurrent features
- **TypeScript** - Type-safe development
- **Vite 7.1.2** - Ultra-fast build tool and dev server
- **React Router DOM v7.8.1** - Client-side routing

### UI & Styling
- **Mantine Core 8.2.5** - Modern React components library
- **Mantine Hooks 8.2.5** - Utility hooks for UI interactions
- **Emotion React 11.14.0** - CSS-in-JS styling engine
- **Tabler Icons React 3.34.1** - Comprehensive icon library
- **Framer Motion 12.23.12** - Animation library

### Backend Integration
- **Supabase JS 2.55.0** - Database, auth, and real-time features

## 📁 Project Structure

```
react-frontend/
├── src/
│   ├── components/
│   │   ├── LandingPage.tsx      # Homepage component
│   │   ├── SignUp.tsx          # User registration
│   │   ├── MagicLinkAuth.tsx   # Authentication form
│   │   ├── AuthCallback.tsx    # Auth redirect handler
│   │   └── Dashboard.tsx       # Main app dashboard
│   ├── contexts/
│   │   └── AuthContext.tsx     # Global authentication state
│   ├── hooks/
│   │   └── useAuth.ts         # Authentication hook
│   ├── lib/
│   │   ├── supabase.ts        # Supabase client config
│   │   └── mantine.ts         # Mantine theme config
│   ├── App.tsx               # Main application component
│   ├── main.tsx              # React app entry point
│   └── vite-env.d.ts         # Vite type definitions
├── public/                   # Static assets
├── dist/                    # Build output (generated)
├── package.json            # Dependencies and scripts
├── vite.config.ts          # Vite configuration
├── tsconfig.*.json         # TypeScript configurations
├── eslint.config.js        # ESLint configuration
├── DESIGN_SYSTEM.md        # Design system documentation
├── README.md              # User documentation
└── CLAUDE.md              # This AI guide
```

## 🚀 Development Commands

```bash
# Install dependencies
npm install

# Start development server (http://localhost:5174)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Type checking
npm run type-check
```

## 🎨 Design System

The app uses a cohesive design system built on Mantine components:

### Theme Configuration
- **Color Scheme**: Dark mode by default
- **Primary Colors**: Custom brand colors
- **Typography**: Modern font stack
- **Spacing**: Consistent spacing scale
- **Animations**: Smooth transitions with Framer Motion

### Component Patterns
- Consistent use of Mantine components
- Responsive design principles
- Accessible UI patterns
- Modern card-based layouts

## 🔐 Authentication Architecture

### Magic Link Flow
1. **User Input**: Email address entry
2. **Magic Link Request**: Sent via Supabase Auth
3. **Email Delivery**: User receives secure link
4. **Authentication**: Click redirects to `/auth/callback`
5. **Session Creation**: JWT token stored locally
6. **Dashboard Access**: Protected routes available

### Authentication State Management
- **AuthContext**: Global auth state provider
- **useAuth Hook**: Simplified auth state access
- **Protected Routes**: Automatic redirect for unauthenticated users
- **Session Persistence**: Login state maintained across sessions

### Security Features
- Row Level Security (RLS) in Supabase
- Secure JWT token handling
- HTTPS enforcement in production
- Rate limiting on auth requests

## 🔗 Supabase Integration

### Client Configuration
```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### Data Operations
- **User Profiles**: Automatic creation on signup
- **User Preferences**: Draft settings and strategies
- **Draft Sessions**: Real-time draft tracking
- **Player Data**: Rankings and statistics

### Real-time Features
- Live draft updates
- Multi-user collaboration
- Real-time notifications
- Synchronization with Chrome extension

## 📱 Component Architecture

### Core Components

#### LandingPage.tsx
- Homepage with app introduction
- Feature highlights
- Sign-up call-to-action
- Responsive hero section

#### SignUp.tsx & MagicLinkAuth.tsx
- Email-based registration
- Magic link authentication
- Loading states and error handling
- Form validation

#### Dashboard.tsx
- Main application interface
- User profile display
- Draft management tools
- Settings and preferences

#### AuthCallback.tsx
- Handles OAuth redirects
- Processes authentication tokens
- Redirects to dashboard
- Error handling for failed auth

### Hooks & Utilities

#### useAuth.ts
- Simplified authentication state access
- Login/logout functionality
- User session management
- Loading and error states

#### AuthContext.tsx
- Global authentication state
- Provider for auth data
- Session persistence
- Authentication state changes

## 🎛️ Configuration

### Environment Variables
```env
# Required for production
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here

# Optional development settings
VITE_APP_URL=http://localhost:5174
```

### Vite Configuration
- React plugin enabled
- TypeScript support
- Hot module replacement
- Environment variable handling

### TypeScript Configuration
- Strict mode enabled
- Modern target (ES2020)
- Path mapping for clean imports
- Full type checking

## 🧪 Development Guidelines

### Code Organization
- Components in `/components` directory
- Hooks in `/hooks` directory
- Utilities in `/lib` directory
- Types in each component file or shared types file

### Naming Conventions
- PascalCase for components
- camelCase for functions and variables
- kebab-case for file names (where appropriate)
- Descriptive, self-documenting names

### State Management
- React Context for global state (auth)
- Local component state for UI state
- Supabase for persistent data
- No additional state management library needed

### Error Handling
- Try-catch blocks for async operations
- User-friendly error messages
- Console logging for debugging
- Graceful fallback UI states

## 🔍 Debugging Tips

### Development Tools
- React Developer Tools browser extension
- Browser DevTools Network tab for API calls
- Console logging for state debugging
- Vite dev server logs

### Common Issues
- **Authentication Errors**: Check Supabase project settings
- **Environment Variables**: Ensure proper VITE_ prefix
- **Build Errors**: Check TypeScript types and imports
- **Routing Issues**: Verify React Router configuration

### Performance Monitoring
- Vite dev server performance metrics
- React component render optimization
- Network request optimization
- Bundle size analysis

## 📦 Build & Deployment

### Production Build
```bash
# Create optimized build
npm run build

# Preview production build locally
npm run preview
```

### Deployment Targets
- **Vercel**: Zero-config deployment with `vercel.json`
- **Netlify**: Static site hosting
- **AWS S3 + CloudFront**: CDN deployment
- **GitHub Pages**: Free static hosting

### Build Optimization
- Tree shaking for reduced bundle size
- Code splitting for lazy loading
- Asset optimization
- TypeScript compilation

## 🤖 AI Assistant Notes

### Key Development Patterns
1. **Mantine Components**: Use Mantine UI components for consistency
2. **TypeScript First**: Maintain type safety throughout
3. **Responsive Design**: Mobile-first approach
4. **Supabase Integration**: Direct client connections for data
5. **Error Boundaries**: Implement for graceful error handling

### Common Tasks
- **Adding Components**: Follow existing component patterns
- **State Management**: Use Context for global state
- **API Calls**: Use Supabase client methods
- **Routing**: Add routes to App.tsx
- **Styling**: Use Mantine theme system

### Testing Considerations
- Component testing with React Testing Library
- User interaction testing
- Authentication flow testing
- Responsive design testing
- Cross-browser compatibility

## 🔗 Integration Points

### Chrome Extension
- Shared authentication state via Supabase
- Data synchronization through database
- Consistent UI components (Mantine)
- Real-time updates between platforms

### Backend API
- Future API endpoints for custom logic
- Express server integration planned
- Shared TypeScript interfaces
- Authentication via Supabase JWT

### Database (Supabase)
- Direct client connections for data operations
- Real-time subscriptions for live updates
- Row Level Security for data protection
- Automatic schema type generation

---

*This frontend provides a modern, responsive web interface for the Sacco Fantasy Football Assistant with seamless Chrome extension integration.*
