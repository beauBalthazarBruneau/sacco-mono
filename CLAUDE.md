# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Essential Development Commands

### Monorepo Operations
```bash
# Install all dependencies
npm run install:all

# Development (all services)
npm run dev                    # Runs frontend + extension + backend concurrently

# Individual services
npm run dev:frontend          # React app on http://localhost:5174
npm run dev:extension         # Chrome extension development
npm run dev:backend           # Express API server

# Build operations
npm run build                 # Build all workspaces
npm run build:frontend        # Build React frontend only
npm run build:extension       # Build Chrome extension only

# Quality checks
npm run precommit:frontend    # Full frontend pipeline (type-check + lint + test + build)
npm run precommit             # Currently runs frontend precommit only
```

### Supabase Operations
```bash
# Local development
supabase start                # Start local Supabase stack
supabase stop                 # Stop local stack
supabase db reset             # Reset DB with latest migrations

# Schema management
supabase migration new name   # Create new migration
supabase db push              # Push local schema to remote
supabase db pull              # Pull remote changes to local

# Type generation
supabase gen types typescript --local > supabase/types.ts
```

## Architecture Overview

The Sacco Fantasy Football Assistant is a monorepo with three active components:

### React Frontend (`react-frontend/`)
- **Stack**: React 19 + TypeScript + Vite + Mantine UI
- **Auth**: Magic link authentication via Supabase
- **Architecture**: Direct Supabase client integration with AuthContext
- **Dev Server**: http://localhost:5174
- **Testing**: Vitest with React Testing Library

### Supabase (`supabase/`)
- **Role**: Primary backend service providing database, auth, real-time features
- **Database**: PostgreSQL 15 with comprehensive schema for fantasy football data
- **Security**: Row Level Security (RLS) policies on all user data
- **Key Tables**: `user_profiles`, `draft_sessions`, `draft_picks`, `player_rankings`
- **Local Dev**: Full local stack with Studio UI on http://localhost:54323

### GitHub Actions (`.github/`)
- **CI/CD Pipeline**: Automated testing and building on push/PR
- **Claude PR Review**: Automated code review using Claude API
- **Frontend Focus**: Current automation primarily tests React frontend

## Key Architectural Patterns

### Authentication Flow
1. **Magic Link**: User enters email → Supabase sends magic link → redirect to `/auth/callback`
2. **Global State**: `AuthContext` provides user session across React app
3. **Protected Routes**: `ProtectedRoute` component wraps authenticated pages
4. **RLS Security**: Database-level security ensures users only access their own data

### Data Architecture
```typescript
// Direct Supabase client pattern used throughout
const { data, error } = await supabase
  .from('draft_sessions')
  .select('*')
  .eq('user_id', user.id)
```

### Real-time Features
```typescript
// Live draft updates pattern
const subscription = supabase
  .channel('draft_updates')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'draft_picks'
  }, handleNewPick)
  .subscribe()
```

## Database Schema (Supabase)

### Core Entity Relationships
- `auth.users` (Supabase) → `user_profiles` → `user_preferences`
- `user_profiles` → `draft_sessions` → `draft_picks`
- `player_rankings` (public data for all users)
- `payment_history` (Stripe integration tracking)

### Key Enums
```sql
subscription_tier: 'free' | 'basic' | 'premium'
league_type: 'PPR' | 'Standard' | 'Half-PPR' | 'Superflex'
player_position: 'QB' | 'RB' | 'WR' | 'TE' | 'K' | 'DEF' | 'DST'
draft_status: 'active' | 'completed' | 'cancelled'
```

### Security Model
- **User Data**: RLS policies ensure `auth.uid() = user_id` for all personal data
- **Public Data**: Player rankings and stats readable by all authenticated users
- **Service Role**: Backend operations use service role key (never in client code)

## CI/CD Pipeline (.github/)

### Automated Testing (`ci.yml`)
```yaml
# Triggers: Push/PR to main/staging branches
# Pipeline: Install → Lint → Type Check → Test → Build
# Components: React frontend focus (extension build separate job)
# Node Version: 20.x with npm caching
```

### Claude PR Review (`claude-pr-review.yml`)
```yaml
# Triggers: PR opened/updated to main/staging
# Process: Get changed files → Send to Claude API → Post review comment
# Focus Areas: Security, code quality, best practices
# Model: claude-3-5-sonnet-20241022
```

## Environment Configuration

### Required Environment Variables
```env
# Supabase (both local and production)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here

# Claude API (for PR reviews)
ANTHROPIC_API_KEY=your_anthropic_key
```

### Local Development Setup
1. Install dependencies: `npm run install:all`
2. Start Supabase: `supabase start`
3. Start frontend: `npm run dev:frontend`
4. Access app: http://localhost:5174
5. Access DB Studio: http://localhost:54323

## Development Workflow Patterns

### Adding New Features
1. **Database Changes**: Create Supabase migration first
2. **Type Generation**: Run `supabase gen types` after schema changes
3. **Component Development**: Follow existing patterns in `react-frontend/src/components/`
4. **Testing**: Add tests in `__tests__` directories
5. **Quality Checks**: Run `npm run precommit:frontend` before commit

### Component Architecture Patterns
- **Shared Components**: `components/shared/` for auth and utilities
- **App Components**: `components/app/` for authenticated user features
- **Landing Components**: `components/landing/` for marketing site
- **Protected Routes**: Wrap authenticated pages with `<ProtectedRoute>`

### Data Fetching Patterns
```typescript
// Standard pattern for data operations
const { data: players, error } = await supabase
  .from('player_rankings')
  .select('*')
  .eq('position', position)
  .order('rank')
  .range(offset, offset + limit - 1)
```

## Common Development Tasks

### Schema Changes
```bash
# Create migration
supabase migration new add_new_table

# Edit migration file in supabase/migrations/
# Apply locally
supabase db reset

# Generate new types
supabase gen types typescript --local > supabase/types.ts
```

### Testing Authentication
1. Start local stack: `supabase start`
2. Check email UI: http://localhost:54324 (Inbucket)
3. Test magic link flow through the app
4. Verify RLS policies work correctly

### Deployment
- **Frontend**: Static build deployed to hosting service
- **Database**: Migrations pushed via `supabase db push`
- **CI/CD**: GitHub Actions handle automated testing and building

## Integration Points

### React Frontend ↔ Supabase
- Direct client connections using anon key
- Real-time subscriptions for live updates
- RLS policies provide security layer
- TypeScript types generated from schema

### Chrome Extension Integration (Future)
- Shared authentication state via Supabase
- Same database schema and RLS policies
- Real-time sync between extension and web app

The architecture emphasizes simplicity with direct database integration rather than complex API layers, leveraging Supabase's built-in security and real-time capabilities.