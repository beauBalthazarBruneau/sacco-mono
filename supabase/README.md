# Supabase Configuration

This directory contains all Supabase-related configuration, migrations, and functions for the Fantasy Football Draft Assistant.

## 📁 Directory Structure

```
supabase/
├── config.toml          # Main Supabase configuration
├── migrations/          # Database migration files
│   └── 20241201000000_initial_schema.sql
├── seed/               # Seed data for development
│   └── seed_data.sql
├── functions/          # Edge functions (future use)
└── README.md          # This file
```

## 🚀 Getting Started

### Prerequisites
- [Supabase CLI](https://supabase.com/docs/guides/cli) installed
- Node.js and npm installed

### Initial Setup

1. **Install Supabase CLI** (if not already installed):
   ```bash
   npm install -g supabase
   ```

2. **Login to Supabase**:
   ```bash
   supabase login
   ```

3. **Initialize the project** (if not already done):
   ```bash
   supabase init
   ```

4. **Start local development**:
   ```bash
   supabase start
   ```

5. **Apply migrations**:
   ```bash
   supabase db reset
   ```

### Database Schema

The database includes the following main tables:

- **`user_profiles`** - Extended user information
- **`user_preferences`** - User draft preferences and settings
- **`draft_sessions`** - Active and completed draft sessions
- **`draft_picks`** - Individual picks made during drafts
- **`player_rankings`** - Current player rankings and ADP
- **`player_stats`** - Historical player statistics
- **`user_analytics`** - User performance analytics
- **`payment_history`** - Payment and subscription history

### Key Features

#### 🔐 Row Level Security (RLS)
All tables have RLS enabled with appropriate policies:
- Users can only access their own data
- Player rankings and stats are publicly readable
- Payment information is securely protected

#### 🎯 Automatic User Setup
When a user signs up through Supabase Auth:
1. A `user_profiles` record is automatically created
2. Default `user_preferences` are set up
3. An `user_analytics` record is initialized

#### 📊 Custom Types
The schema includes custom PostgreSQL types for:
- `subscription_tier` - Free, Basic, Premium
- `league_type` - PPR, Standard, Half-PPR, Superflex
- `draft_strategy` - Best Available, Zero RB, Hero RB, etc.
- `draft_status` - Active, Completed, Cancelled
- `player_position` - QB, RB, WR, TE, K, DEF, DST

## 🔧 Development Commands

### Database Operations

```bash
# Start local Supabase
supabase start

# Stop local Supabase
supabase stop

# Reset database (applies all migrations and seed data)
supabase db reset

# Create new migration
supabase migration new migration_name

# Apply migrations to remote database
supabase db push

# Pull remote schema changes
supabase db pull

# Generate TypeScript types
supabase gen types typescript --local > ../backend-api/src/types/supabase.ts
```

### Edge Functions (Future)

```bash
# Create new edge function
supabase functions new function_name

# Deploy edge function
supabase functions deploy function_name

# Invoke edge function locally
supabase functions serve
```

## 🌐 Environment Variables

Create a `.env` file in the root directory with:

```env
# Supabase
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Local Development
SUPABASE_DB_URL=postgresql://postgres:postgres@localhost:54322/postgres
```

## 📊 Seed Data

The `seed/seed_data.sql` file includes:
- Top 50 player rankings for 2024
- Sample player statistics from 2023
- Test user preferences and draft sessions
- Sample draft picks for testing

## 🔒 Security Considerations

1. **RLS Policies**: All tables have appropriate RLS policies
2. **Authentication**: Uses Supabase Auth with JWT tokens
3. **API Security**: Service role key should only be used server-side
4. **Data Validation**: Input validation should be implemented in the API layer

## 📈 Performance Optimization

1. **Indexes**: Strategic indexes on frequently queried columns
2. **Connection Pooling**: Configured in `config.toml`
3. **Caching**: Player rankings are cached in the `player_rankings` table
4. **Partitioning**: Consider partitioning `player_stats` by season for large datasets

## 🚀 Deployment

### Production Setup

1. **Create Supabase Project**:
   ```bash
   supabase projects create --name "sacco-fantasy-football"
   ```

2. **Link to Remote**:
   ```bash
   supabase link --project-ref your_project_ref
   ```

3. **Deploy Schema**:
   ```bash
   supabase db push
   ```

4. **Deploy Edge Functions** (if any):
   ```bash
   supabase functions deploy
   ```

### Environment Configuration

Update the following in your production environment:
- `SUPABASE_URL` - Your production project URL
- `SUPABASE_ANON_KEY` - Your production anon key
- `SUPABASE_SERVICE_ROLE_KEY` - Your production service role key

## 🔍 Monitoring

### Database Monitoring
- Use Supabase Dashboard for real-time monitoring
- Set up alerts for high query times
- Monitor connection pool usage

### Performance Monitoring
- Track query performance in Supabase Dashboard
- Monitor RLS policy effectiveness
- Watch for slow queries and optimize indexes

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Database Design Best Practices](https://supabase.com/docs/guides/database/best-practices)

## 🤝 Contributing

When making database changes:

1. Create a new migration file
2. Test locally with `supabase db reset`
3. Update this README if schema changes
4. Update TypeScript types if needed
5. Test with the application before deploying

---

*This configuration supports the Fantasy Football Draft Assistant with secure, scalable database architecture.*
