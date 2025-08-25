# Supabase - AI Assistant Guide

This is the Supabase configuration and database component of the Sacco Fantasy Football Assistant, providing the primary backend infrastructure.

## 🎯 Component Overview

Supabase serves as the complete backend-as-a-service for the Sacco Fantasy Football Assistant, providing:
- PostgreSQL database with custom schema
- Authentication and user management
- Real-time subscriptions for live updates
- Row Level Security (RLS) for data protection
- File storage capabilities
- Edge functions (future use)

## 🛠️ Technology Stack

### Database
- **PostgreSQL 15** - Primary database engine
- **UUID Extensions** - Unique identifier generation
- **Custom Enums** - Type-safe data constraints
- **JSONB** - Flexible data storage
- **Triggers** - Automatic data updates

### Backend Services
- **Supabase Auth** - User authentication and sessions
- **Real-time** - WebSocket connections for live data
- **Storage** - File upload and management
- **Edge Functions** - Serverless compute (planned)
- **PostgREST** - Auto-generated REST API

### Development Tools
- **Supabase CLI** - Local development and migrations
- **Supabase Studio** - Database administration UI
- **Migration System** - Version-controlled schema changes

## 📁 Project Structure

```
supabase/
├── config.toml                        # Supabase configuration
├── migrations/
│   └── 20241201000000_initial_schema.sql  # Initial database schema
├── seed.sql                           # Development seed data
├── types.ts                           # Generated TypeScript types
├── .temp/                             # Temporary CLI files
├── README.md                          # User documentation
└── CLAUDE.md                          # This AI guide
```

## 🗄️ Database Schema

### Core Tables

#### User Management
```sql
-- User profiles (extends auth.users)
user_profiles (
    id UUID PRIMARY KEY,           -- References auth.users(id)
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE,
    subscription_tier subscription_tier DEFAULT 'free',
    subscription_expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)

-- User preferences and settings
user_preferences (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id),
    league_type league_type DEFAULT 'PPR',
    team_count INTEGER DEFAULT 12,
    draft_position INTEGER,
    preferred_strategy draft_strategy DEFAULT 'Best Available',
    auto_pick_enabled BOOLEAN DEFAULT FALSE,
    notifications_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
```

#### Draft Management
```sql
-- Draft sessions
draft_sessions (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id),
    league_name TEXT NOT NULL,
    platform TEXT NOT NULL,      -- 'ESPN', 'Yahoo', 'Sleeper'
    draft_date TIMESTAMP WITH TIME ZONE,
    team_count INTEGER NOT NULL,
    draft_position INTEGER NOT NULL,
    status draft_status DEFAULT 'active',
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)

-- Individual draft picks
draft_picks (
    id UUID PRIMARY KEY,
    draft_session_id UUID REFERENCES draft_sessions(id),
    round INTEGER NOT NULL,
    pick_number INTEGER NOT NULL,
    player_name TEXT NOT NULL,
    position player_position NOT NULL,
    team TEXT,
    recommended BOOLEAN DEFAULT FALSE,
    recommendation_reason TEXT,
    picked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
```

#### Player Data
```sql
-- Current player rankings and projections
player_rankings (
    id UUID PRIMARY KEY,
    player_name TEXT NOT NULL,
    position player_position NOT NULL,
    team TEXT,
    rank INTEGER NOT NULL,
    tier TEXT,
    adp REAL,                    -- Average Draft Position
    ppr_points REAL,
    standard_points REAL,
    half_ppr_points REAL,
    injury_status TEXT,
    news TEXT,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)

-- Historical player statistics
player_stats (
    id UUID PRIMARY KEY,
    player_name TEXT NOT NULL,
    position player_position NOT NULL,
    team TEXT,
    season INTEGER NOT NULL,
    games_played INTEGER,
    -- Position-specific stats
    passing_yards INTEGER,
    passing_tds INTEGER,
    rushing_yards INTEGER,
    rushing_tds INTEGER,
    receiving_yards INTEGER,
    receiving_tds INTEGER,
    receptions INTEGER,
    -- Fantasy points by scoring system
    fantasy_points_ppr REAL,
    fantasy_points_standard REAL,
    fantasy_points_half_ppr REAL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
```

#### Analytics & Payments
```sql
-- User performance analytics
user_analytics (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id),
    draft_session_id UUID REFERENCES draft_sessions(id),
    total_drafts INTEGER DEFAULT 0,
    successful_picks INTEGER DEFAULT 0,
    total_picks INTEGER DEFAULT 0,
    average_pick_quality REAL DEFAULT 0,
    preferred_positions JSONB DEFAULT '[]',
    strategy_effectiveness JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)

-- Payment and subscription history
payment_history (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id),
    stripe_payment_intent_id TEXT,
    amount INTEGER NOT NULL,     -- Amount in cents
    currency TEXT DEFAULT 'usd',
    subscription_tier subscription_tier NOT NULL,
    status TEXT NOT NULL,        -- 'pending', 'succeeded', 'failed'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
```

### Custom Types (Enums)

```sql
-- Subscription tiers
subscription_tier AS ENUM ('free', 'basic', 'premium')

-- League scoring systems
league_type AS ENUM ('PPR', 'Standard', 'Half-PPR', 'Superflex')

-- Draft strategies
draft_strategy AS ENUM (
    'Best Available', 'Position Need', 'Zero RB', 
    'Hero RB', 'Late Round QB', 'Streaming'
)

-- Draft session status
draft_status AS ENUM ('active', 'completed', 'cancelled')

-- Player positions
player_position AS ENUM ('QB', 'RB', 'WR', 'TE', 'K', 'DEF', 'DST')
```

## 🔐 Row Level Security (RLS)

### Security Model
All tables have RLS enabled with comprehensive policies:

#### User Data Policies
```sql
-- Users can only access their own profiles
CREATE POLICY "Users can view own profile" 
ON user_profiles FOR SELECT 
USING (auth.uid() = id);

-- Users can only modify their own preferences
CREATE POLICY "Users can update own preferences" 
ON user_preferences FOR UPDATE 
USING (auth.uid() = user_id);
```

#### Draft Data Policies
```sql
-- Users can only see their own draft sessions
CREATE POLICY "Users can view own draft sessions" 
ON draft_sessions FOR SELECT 
USING (auth.uid() = user_id);

-- Users can only see picks from their own sessions
CREATE POLICY "Users can view picks from own sessions" 
ON draft_picks FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM draft_sessions 
        WHERE draft_sessions.id = draft_picks.draft_session_id 
        AND draft_sessions.user_id = auth.uid()
    )
);
```

#### Public Data Policies
```sql
-- Player rankings are publicly readable
CREATE POLICY "Anyone can view player rankings" 
ON player_rankings FOR SELECT 
USING (true);

-- Player stats are publicly readable
CREATE POLICY "Anyone can view player stats" 
ON player_stats FOR SELECT 
USING (true);
```

## 🚀 Development Commands

### Local Development Setup
```bash
# Install Supabase CLI (if not installed)
npm install -g supabase

# Initialize project (if needed)
supabase init

# Start local development stack
supabase start

# Reset database with latest migrations
supabase db reset

# Stop local development stack
supabase stop
```

### Database Operations
```bash
# Create new migration
supabase migration new migration_name

# Apply migrations to local database
supabase db reset

# Push local changes to remote database
supabase db push

# Pull remote changes to local
supabase db pull

# Generate TypeScript types
supabase gen types typescript --local > types.ts
```

### Edge Functions (Future)
```bash
# Create new edge function
supabase functions new function_name

# Serve functions locally
supabase functions serve

# Deploy functions to remote
supabase functions deploy function_name
```

## ⚙️ Configuration

### Local Development (`config.toml`)
```toml
project_id = "sacco-fantasy-football"

[api]
port = 54321
schemas = ["public", "storage", "graphql_public"]
max_rows = 1000

[db]
port = 54322
major_version = 15

[auth]
site_url = "http://localhost:3000"
additional_redirect_urls = ["https://localhost:3000"]
enable_signup = true

[auth.email]
enable_signup = true
enable_confirmations = false  # Magic links don't require confirmation
```

### Authentication Settings
- **Magic Link Auth**: Primary authentication method
- **Email Confirmations**: Disabled for smoother UX
- **JWT Expiry**: 3600 seconds (1 hour)
- **Refresh Tokens**: Enabled with rotation

### Storage Configuration
- **File Size Limit**: 50MiB
- **Public Buckets**: For player images, logos
- **Private Buckets**: For user documents

## 🔄 Data Flow & Integration

### Authentication Flow
1. **User Registration**: Magic link sent to email
2. **Profile Creation**: Automatic user_profiles record
3. **Default Preferences**: Auto-created user_preferences
4. **Analytics Setup**: Initial user_analytics record

### Real-time Features
```typescript
// Example real-time subscription
const subscription = supabase
  .channel('draft_updates')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'draft_picks',
    filter: `draft_session_id=eq.${sessionId}`
  }, (payload) => {
    // Handle new draft pick
    updateDraftBoard(payload.new)
  })
  .subscribe()
```

### Data Synchronization
- **Frontend ↔ Supabase**: Direct client connections
- **Extension ↔ Supabase**: Shared authentication state
- **Backend ↔ Supabase**: Service role for admin operations
- **Real-time Updates**: Live draft picks, rankings updates

## 📊 Performance Optimization

### Database Indexes
```sql
-- Optimized indexes for common queries
CREATE INDEX idx_user_profiles_email ON user_profiles(email);
CREATE INDEX idx_draft_sessions_user_id ON draft_sessions(user_id);
CREATE INDEX idx_player_rankings_position_rank ON player_rankings(position, rank);
CREATE INDEX idx_player_rankings_adp ON player_rankings(adp);
```

### Connection Pooling
- **Pool Mode**: Transaction-level pooling
- **Default Pool Size**: 15 connections per user/database
- **Max Client Connections**: 100 concurrent connections

### Query Optimization
- **Selective Loading**: Only fetch required columns
- **Pagination**: Limit large result sets
- **Caching**: Cache frequently accessed data
- **Batch Operations**: Group related database operations

## 🧪 Development Guidelines

### Migration Best Practices
1. **Incremental Changes**: Small, focused migrations
2. **Rollback Safety**: Ensure migrations can be safely undone
3. **Data Preservation**: Never drop columns with data
4. **Index Management**: Add indexes for new query patterns
5. **RLS Updates**: Update policies when schema changes

### Type Generation
```bash
# Generate types after schema changes
supabase gen types typescript --local > types.ts

# Copy to components that need them
cp types.ts ../backend-api/src/types/supabase.ts
cp types.ts ../react-frontend/src/types/supabase.ts
```

### Seed Data Management
- **Development Seeds**: Representative test data
- **Player Data**: Current season rankings and projections
- **Test Users**: Sample user accounts with different tiers
- **Draft Examples**: Complete draft scenarios for testing

## 🔍 Monitoring & Debugging

### Database Monitoring
- **Supabase Dashboard**: Real-time metrics and logs
- **Query Performance**: Slow query identification
- **Connection Usage**: Monitor connection pool health
- **Storage Usage**: Track file storage consumption

### Common Debugging Scenarios
```sql
-- Check RLS policy effectiveness
SET ROLE TO authenticated;
SET request.jwt.claim.sub TO 'user-uuid-here';
SELECT * FROM user_profiles; -- Should only return user's profile

-- Verify foreign key relationships
SELECT 
    conname,
    pg_catalog.pg_get_constraintdef(r.oid, true) as condef
FROM pg_catalog.pg_constraint r
WHERE r.conrelid = 'user_preferences'::regclass
AND r.contype = 'f';
```

### Performance Troubleshooting
- **EXPLAIN ANALYZE**: Query execution plans
- **pg_stat_statements**: Query performance statistics
- **Connection Monitoring**: Track connection pool usage
- **Index Usage**: Monitor index effectiveness

## 🚀 Production Deployment

### Remote Database Setup
```bash
# Create new Supabase project
supabase projects create --name "sacco-fantasy-football"

# Link local project to remote
supabase link --project-ref your_project_ref

# Deploy schema to production
supabase db push

# Deploy edge functions (if any)
supabase functions deploy
```

### Environment Configuration
```env
# Production environment variables
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_key

# Database connection (for backend services)
DATABASE_URL=postgresql://postgres:[password]@db.your-project.supabase.co:5432/postgres
```

### Security Considerations
- **Service Role Key**: Only use server-side, never in client code
- **RLS Policies**: Thoroughly test all security policies
- **API Limits**: Configure rate limiting for production
- **Backup Strategy**: Regular database backups
- **SSL/TLS**: Enforce encrypted connections

## 🤖 AI Assistant Notes

### Schema Understanding
1. **User-Centric Design**: All data is tied to authenticated users
2. **Draft Workflow**: Sessions → Picks workflow with analytics
3. **Player Data**: Cached rankings with historical stats
4. **Subscription Model**: Tiered access with payment tracking
5. **Real-time Ready**: Optimized for live draft updates

### Common Operations
```typescript
// Create new draft session
const { data: session } = await supabase
  .from('draft_sessions')
  .insert({
    user_id: user.id,
    league_name: 'My League',
    platform: 'ESPN',
    team_count: 12,
    draft_position: 5
  })
  .select()
  .single()

// Record draft pick
const { data: pick } = await supabase
  .from('draft_picks')
  .insert({
    draft_session_id: session.id,
    round: 1,
    pick_number: 5,
    player_name: 'Christian McCaffrey',
    position: 'RB',
    team: 'SF',
    recommended: true,
    recommendation_reason: 'Top-tier RB1 with high floor/ceiling'
  })

// Get player rankings
const { data: rankings } = await supabase
  .from('player_rankings')
  .select('*')
  .eq('position', 'RB')
  .order('rank')
  .limit(50)
```

### Development Workflow
1. **Local First**: Always develop with local Supabase stack
2. **Migration Driven**: Schema changes through migrations only
3. **Type Generation**: Regenerate types after schema changes
4. **RLS Testing**: Test security policies thoroughly
5. **Performance Monitoring**: Watch query performance closely

### Integration Patterns
- **Direct Client Access**: Frontend/extension use anon key
- **Service Role**: Backend API uses service role key
- **Real-time Subscriptions**: Live updates for draft data
- **Batch Operations**: Efficient bulk data operations
- **Error Handling**: Graceful handling of database errors

---

*This Supabase configuration provides a robust, scalable backend for the Sacco Fantasy Football Assistant with comprehensive security and real-time capabilities.*
