-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
CREATE TYPE subscription_tier AS ENUM ('free', 'basic', 'premium');
CREATE TYPE league_type AS ENUM ('PPR', 'Standard', 'Half-PPR', 'Superflex');
CREATE TYPE draft_strategy AS ENUM ('Best Available', 'Position Need', 'Zero RB', 'Hero RB', 'Late Round QB', 'Streaming');
CREATE TYPE draft_status AS ENUM ('active', 'completed', 'cancelled');
CREATE TYPE player_position AS ENUM ('QB', 'RB', 'WR', 'TE', 'K', 'DEF', 'DST');

-- Users table (extends Supabase auth.users)
CREATE TABLE user_profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE,
    subscription_tier subscription_tier DEFAULT 'free',
    subscription_expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User preferences
CREATE TABLE user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
    league_type league_type DEFAULT 'PPR',
    team_count INTEGER DEFAULT 12,
    draft_position INTEGER,
    preferred_strategy draft_strategy DEFAULT 'Best Available',
    auto_pick_enabled BOOLEAN DEFAULT FALSE,
    notifications_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Draft sessions
CREATE TABLE draft_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
    league_name TEXT NOT NULL,
    platform TEXT NOT NULL, -- 'ESPN', 'Yahoo', 'Sleeper'
    draft_date TIMESTAMP WITH TIME ZONE,
    team_count INTEGER NOT NULL,
    draft_position INTEGER NOT NULL,
    status draft_status DEFAULT 'active',
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Draft picks
CREATE TABLE draft_picks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    draft_session_id UUID REFERENCES draft_sessions(id) ON DELETE CASCADE NOT NULL,
    round INTEGER NOT NULL,
    pick_number INTEGER NOT NULL,
    player_name TEXT NOT NULL,
    position player_position NOT NULL,
    team TEXT,
    recommended BOOLEAN DEFAULT FALSE,
    recommendation_reason TEXT,
    picked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(draft_session_id, round, pick_number)
);

-- Player rankings cache
CREATE TABLE player_rankings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_name TEXT NOT NULL,
    position player_position NOT NULL,
    team TEXT,
    rank INTEGER NOT NULL,
    tier TEXT,
    adp REAL, -- Average Draft Position
    ppr_points REAL,
    standard_points REAL,
    half_ppr_points REAL,
    injury_status TEXT,
    news TEXT,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(player_name, position)
);

-- Player stats (for historical data)
CREATE TABLE player_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_name TEXT NOT NULL,
    position player_position NOT NULL,
    team TEXT,
    season INTEGER NOT NULL,
    games_played INTEGER,
    passing_yards INTEGER,
    passing_tds INTEGER,
    passing_ints INTEGER,
    rushing_yards INTEGER,
    rushing_tds INTEGER,
    receiving_yards INTEGER,
    receiving_tds INTEGER,
    receptions INTEGER,
    fantasy_points_ppr REAL,
    fantasy_points_standard REAL,
    fantasy_points_half_ppr REAL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(player_name, position, season)
);

-- User draft analytics
CREATE TABLE user_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
    draft_session_id UUID REFERENCES draft_sessions(id) ON DELETE CASCADE,
    total_drafts INTEGER DEFAULT 0,
    successful_picks INTEGER DEFAULT 0,
    total_picks INTEGER DEFAULT 0,
    average_pick_quality REAL DEFAULT 0,
    preferred_positions JSONB DEFAULT '[]',
    strategy_effectiveness JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Payment history
CREATE TABLE payment_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
    stripe_payment_intent_id TEXT,
    amount INTEGER NOT NULL, -- Amount in cents
    currency TEXT DEFAULT 'usd',
    subscription_tier subscription_tier NOT NULL,
    status TEXT NOT NULL, -- 'pending', 'succeeded', 'failed'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_user_profiles_email ON user_profiles(email);
CREATE INDEX idx_user_profiles_subscription ON user_profiles(subscription_tier);
CREATE INDEX idx_draft_sessions_user_id ON draft_sessions(user_id);
CREATE INDEX idx_draft_sessions_status ON draft_sessions(status);
CREATE INDEX idx_draft_picks_session_id ON draft_picks(draft_session_id);
CREATE INDEX idx_draft_picks_round_pick ON draft_picks(round, pick_number);
CREATE INDEX idx_player_rankings_position_rank ON player_rankings(position, rank);
CREATE INDEX idx_player_rankings_adp ON player_rankings(adp);
CREATE INDEX idx_player_stats_season ON player_stats(season);
CREATE INDEX idx_player_stats_position ON player_stats(position);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_draft_sessions_updated_at BEFORE UPDATE ON draft_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_analytics_updated_at BEFORE UPDATE ON user_analytics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE draft_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE draft_picks ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_rankings ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;

-- User profiles policies
CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- User preferences policies
CREATE POLICY "Users can view own preferences" ON user_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own preferences" ON user_preferences FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own preferences" ON user_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Draft sessions policies
CREATE POLICY "Users can view own draft sessions" ON draft_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own draft sessions" ON draft_sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own draft sessions" ON draft_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own draft sessions" ON draft_sessions FOR DELETE USING (auth.uid() = user_id);

-- Draft picks policies
CREATE POLICY "Users can view picks from own sessions" ON draft_picks FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM draft_sessions 
        WHERE draft_sessions.id = draft_picks.draft_session_id 
        AND draft_sessions.user_id = auth.uid()
    )
);
CREATE POLICY "Users can insert picks to own sessions" ON draft_picks FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM draft_sessions 
        WHERE draft_sessions.id = draft_picks.draft_session_id 
        AND draft_sessions.user_id = auth.uid()
    )
);

-- Player rankings policies (public read access)
CREATE POLICY "Anyone can view player rankings" ON player_rankings FOR SELECT USING (true);

-- Player stats policies (public read access)
CREATE POLICY "Anyone can view player stats" ON player_stats FOR SELECT USING (true);

-- User analytics policies
CREATE POLICY "Users can view own analytics" ON user_analytics FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own analytics" ON user_analytics FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own analytics" ON user_analytics FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Payment history policies
CREATE POLICY "Users can view own payment history" ON payment_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own payment history" ON payment_history FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email)
    VALUES (NEW.id, NEW.email);
    
    INSERT INTO public.user_preferences (user_id)
    VALUES (NEW.id);
    
    INSERT INTO public.user_analytics (user_id)
    VALUES (NEW.id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create user profile on signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
