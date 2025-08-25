# Sacco Monorepo - AI Assistant Guide

This is a comprehensive guide for AI assistants working with the Sacco Fantasy Football Assistant monorepo.

## 🏗️ Project Overview

**Sacco** is a comprehensive fantasy football draft assistant consisting of:
- **Chrome Extension**: Browser-based draft assistance tool
- **React Frontend**: Web application interface 
- **Backend API**: Express server (minimal implementation)
- **Supabase**: Database, authentication, and backend services

## 📁 Repository Structure

```
sacco-mono/
├── chrome-extension/         # Chrome extension (Plasmo + React)
├── react-frontend/          # React web app (Vite + TypeScript)
├── backend-api/             # Express API server (minimal)
├── supabase/               # Database schema & configuration
├── package.json            # Monorepo workspace configuration
├── README.md              # User documentation
├── CLAUDE.md              # This AI assistant guide
└── project_plan.md        # Project planning document
```

## 🛠️ Technology Stack

### Frontend Technologies
- **React 19.1.1** with TypeScript
- **Vite** for build tooling
- **Mantine UI** component library
- **Framer Motion** for animations
- **React Router** for navigation

### Chrome Extension
- **Plasmo Framework** for extension development
- **Manifest V3** specification
- **React** with TypeScript
- **Mantine UI** components

### Backend & Database
- **Express.js** with TypeScript (minimal implementation)
- **Supabase** for database, auth, and real-time features
- **PostgreSQL** database with Row Level Security

### Development Tools
- **npm workspaces** for monorepo management
- **concurrently** for running multiple services
- **ESLint** for code linting
- **TypeScript** throughout the stack

## 🚀 Quick Start Commands

```bash
# Clone and setup
cd /Users/beaubruneau/Documents/side_projects/sacco-mono
npm run install:all

# Development (all services)
npm run dev

# Individual services
npm run dev:extension    # Chrome extension
npm run dev:frontend     # React app on http://localhost:3000
npm run dev:backend      # Express server

# Build all components
npm run build

# Individual builds
npm run build:extension
npm run build:frontend
npm run build:backend
```

## 🧩 Component Details

### Chrome Extension (`chrome-extension/`)
- **Purpose**: Browser-based fantasy football draft assistance
- **Framework**: Plasmo with React components
- **Permissions**: Side panel, storage, context menus, host permissions
- **UI**: Mantine components with Tabler icons
- **Integration**: Supabase for data and authentication

### React Frontend (`react-frontend/`)
- **Purpose**: Web-based dashboard and management interface
- **Stack**: React 19 + TypeScript + Vite
- **UI**: Mantine Core with Emotion styling
- **Routing**: React Router DOM v7
- **Integration**: Supabase client for backend services

### Backend API (`backend-api/`)
- **Status**: Minimal implementation (placeholder scripts)
- **Planned**: Express.js with TypeScript
- **Purpose**: Custom API endpoints and business logic
- **Integration**: Will connect to Supabase

### Supabase (`supabase/`)
- **Purpose**: Primary backend services
- **Features**: Database, authentication, real-time subscriptions
- **Schema**: User profiles, preferences, draft sessions, player data
- **Security**: Row Level Security (RLS) policies
- **Development**: Local development with Supabase CLI

## 🔄 Development Workflow

1. **Start all services**: `npm run dev`
2. **Chrome extension**: Loads in development mode via Plasmo
3. **React frontend**: Available at http://localhost:3000 with hot reload
4. **Backend**: Currently placeholder (to be implemented)
5. **Database**: Use Supabase local development or cloud instance

## 🎯 Key Features

### Authentication & User Management
- Supabase Auth with magic link authentication
- User profiles and preferences storage
- Row-level security for data protection

### Draft Assistance
- Player rankings and ADP data
- Draft session tracking
- Real-time draft updates
- Custom user strategies

### Multi-Platform Access
- Chrome extension for in-browser drafting
- Web app for comprehensive management
- Shared data across platforms

## 🔧 Configuration Files

### Root Level
- `package.json`: Workspace and script configuration
- `.gitignore`: Git ignore patterns for all components

### Environment Variables
Each component has its own environment configuration:
- `chrome-extension/.env`: Extension settings
- `react-frontend/.env`: Frontend environment
- `backend-api/.env`: API configuration
- Root `.env`: Shared Supabase configuration

## 🧪 Testing Strategy

- **Frontend**: Component testing with React Testing Library
- **Extension**: Extension-specific testing with Plasmo
- **Backend**: API endpoint testing (to be implemented)
- **Integration**: End-to-end testing across components

## 📦 Build & Deployment

### Chrome Extension
- Build: `npm run build:extension`
- Package: Available in `chrome-extension/build/`
- Deploy: Chrome Web Store submission

### React Frontend
- Build: `npm run build:frontend`
- Output: `react-frontend/dist/`
- Deploy: Static hosting (Vercel, Netlify, etc.)

### Backend API
- Build: `npm run build:backend` (to be implemented)
- Deploy: Cloud hosting (Railway, Heroku, etc.)

### Supabase
- Migrations: `supabase db push`
- Functions: `supabase functions deploy`
- Config: Environment-specific settings

## 📋 Development Guidelines

### Code Organization
- Follow existing patterns within each component
- Maintain TypeScript strict mode compliance
- Use consistent naming conventions
- Document complex business logic

### Component Communication
- **Frontend ↔ Supabase**: Direct client connections
- **Extension ↔ Supabase**: Direct client connections  
- **Backend ↔ Supabase**: Service role connections
- **Inter-component**: Via Supabase real-time features

### Error Handling
- Implement graceful error boundaries in React
- Use Supabase error handling patterns
- Provide user-friendly error messages
- Log errors appropriately for debugging

## 🔍 Debugging Tips

### Chrome Extension
- Use Chrome DevTools in popup/sidepanel
- Check background script console
- Verify manifest permissions
- Test in incognito mode

### React Frontend
- Browser DevTools with React Developer Tools
- Network tab for API calls
- Console for runtime errors
- Vite dev server output

### Supabase
- Supabase Dashboard for database queries
- Network requests in browser DevTools
- Local Supabase logs with CLI
- Authentication state debugging

## 📚 Key Dependencies

### Shared Dependencies
- `@supabase/supabase-js`: Database and auth client
- `@mantine/core`: UI component library
- `@tabler/icons-react`: Icon library
- `react` & `react-dom`: UI framework

### Development Dependencies
- `typescript`: Type safety
- `eslint`: Code quality
- `vite`: Build tool
- `plasmo`: Extension framework

## 🔐 Security Considerations

- Environment variables for sensitive data
- Row Level Security in Supabase
- Chrome extension content security policies
- HTTPS for all production endpoints
- Token-based authentication

## 📈 Performance Guidelines

- Lazy load components where appropriate
- Optimize bundle sizes with tree shaking
- Use React.memo for expensive computations
- Cache frequently accessed data
- Monitor Supabase query performance

## 🤖 AI Assistant Notes

When working with this codebase:

1. **Respect the monorepo structure** - changes in one component may affect others
2. **Check existing patterns** - follow established conventions
3. **Consider all platforms** - changes may need to work across extension and web app
4. **Supabase integration** - most data operations go through Supabase
5. **TypeScript compliance** - maintain type safety throughout
6. **Test cross-component** - ensure changes work in both extension and frontend

## 🆘 Common Issues

### Build Issues
- Check Node.js version (>=18.0.0)
- Clear `node_modules` and reinstall
- Verify workspace dependencies

### Extension Issues
- Reload extension in Chrome
- Check manifest permissions
- Verify build output in `build/`

### Database Issues
- Check Supabase connection
- Verify RLS policies
- Reset local database if needed

---

*This guide is maintained for AI assistants to effectively work with the Sacco monorepo codebase.*
