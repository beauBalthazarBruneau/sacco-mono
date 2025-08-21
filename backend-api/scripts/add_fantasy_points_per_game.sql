-- Migration: Add fantasy points per game fields to player_rankings and player_stats tables
-- Run this in your Supabase SQL editor or via migrations

-- Add fantasy points per game fields to player_rankings table
ALTER TABLE player_rankings 
ADD COLUMN IF NOT EXISTS ppr_points_per_game DECIMAL(6,2),
ADD COLUMN IF NOT EXISTS standard_points_per_game DECIMAL(6,2),
ADD COLUMN IF NOT EXISTS half_ppr_points_per_game DECIMAL(6,2);

-- Add fantasy points per game fields to player_stats table
ALTER TABLE player_stats 
ADD COLUMN IF NOT EXISTS ppr_points_per_game DECIMAL(6,2),
ADD COLUMN IF NOT EXISTS standard_points_per_game DECIMAL(6,2),
ADD COLUMN IF NOT EXISTS half_ppr_points_per_game DECIMAL(6,2);

-- Add comments to document the new fields
COMMENT ON COLUMN player_rankings.ppr_points_per_game IS 'PPR fantasy points divided by projected games played';
COMMENT ON COLUMN player_rankings.standard_points_per_game IS 'Standard fantasy points divided by projected games played';
COMMENT ON COLUMN player_rankings.half_ppr_points_per_game IS 'Half-PPR fantasy points divided by projected games played';

COMMENT ON COLUMN player_stats.ppr_points_per_game IS 'PPR fantasy points divided by projected games played';
COMMENT ON COLUMN player_stats.standard_points_per_game IS 'Standard fantasy points divided by projected games played';
COMMENT ON COLUMN player_stats.half_ppr_points_per_game IS 'Half-PPR fantasy points divided by projected games played';

-- Verify the changes
SELECT 
    table_name, 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name IN ('player_rankings', 'player_stats') 
    AND column_name LIKE '%points_per_game%'
ORDER BY table_name, column_name; 