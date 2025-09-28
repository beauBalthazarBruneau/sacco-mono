# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Essential Development Commands

```bash
# Development
npm run dev                    # Start development server (http://localhost:5174)

# Code Quality
npm run type-check            # Run TypeScript type checking
npm run lint                  # Run ESLint
npm run lint:fix              # Auto-fix ESLint issues

# Testing
npm run test                  # Run tests with Vitest in watch mode
npm run test:run              # Run tests once

# Build & Deploy
npm run build                 # Full production build (includes TypeScript compilation)
npm run preview               # Preview production build locally
npm run precommit             # Run all checks (type-check, lint:fix, test:run, build)
```

## Architecture Overview

This is a React 19 + TypeScript + Vite frontend for the Sacco Fantasy Football Assistant, part of a larger monorepo with a Chrome extension and backend API.

### Core Architectural Patterns

1. **Authentication Architecture**: Magic link-based auth via Supabase with global state management
   - `AuthContext` provides global auth state across the app
   - `ProtectedRoute` component wraps authenticated pages
   - All auth flows redirect through `/auth/callback`

2. **Component Organization**:
   - `components/shared/` - Reusable auth and utility components
   - `components/landing/` - Marketing site components
   - `components/app/` - Protected dashboard functionality
   - Index files provide clean imports from each directory

3. **Data Layer**: Direct Supabase client integration without additional state management
   - `lib/supabase.ts` exports configured client + helper functions
   - Player data accessed via `getPlayers()` function with built-in pagination/filtering
   - Authentication handled through Supabase auth methods

4. **UI Framework**: Mantine v8 with dark theme default and Tabler icons

### Critical Integration Points

- **Chrome Extension Sync**: Shared authentication state through Supabase database
- **Real-time Features**: Supabase subscriptions for draft updates
- **Billing Integration**: Stripe integration for subscription management
- **SEO**: Dynamic sitemap generation for blog content

### Key Configuration Files

- `vite.config.ts` - Basic React + Vite setup
- `eslint.config.js` - TypeScript ESLint with React hooks rules
- Environment variables require `VITE_` prefix for client-side access

### Testing Setup

- **Framework**: Vitest with React Testing Library
- **Setup**: `src/test/setup.ts` configures jsdom environment
- **Location**: Tests in `src/components/__tests__/` and `src/lib/__tests__/`

### Environment Variables Required

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

## Common Development Patterns

When adding new functionality:

1. **New Components**: Follow existing patterns in respective directories (shared/landing/app)
2. **Protected Routes**: Wrap in `<ProtectedRoute>` component in App.tsx
3. **Data Fetching**: Use Supabase client directly, follow patterns in `lib/supabase.ts`
4. **State Management**: Use React Context for global state, local state for component-specific data
5. **TypeScript**: All components use TypeScript with strict mode enabled

The codebase emphasizes simplicity and direct integration patterns rather than complex abstractions.