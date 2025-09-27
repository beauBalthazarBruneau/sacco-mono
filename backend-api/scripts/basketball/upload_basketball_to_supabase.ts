// backend-api/scripts/basketball/upload_basketball_to_supabase.ts
import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'
import {
  calculatePointsLeagueScore,
  calculateCategoryScores,
  calculatePerGameStats,
  STANDARD_POINTS_SETTINGS,
  CONSERVATIVE_POINTS_SETTINGS,
  AGGRESSIVE_POINTS_SETTINGS,
  BasketballStats
} from './basketball_scoring'

// Load environment variables from .env file
dotenv.config()

/*
 * Basketball Fantasy Data Upload Script
 *
 * This script uploads processed basketball projections to Supabase.
 *
 * Key Features:
 * - Calculates fantasy points for Points leagues (multiple scoring systems)
 * - Calculates category values for Categories/Roto leagues
 * - Stores projected per-game statistics
 * - Uses the new basketball database schema (PG/SG/SF/PF/C positions)
 * - Inserts into player_rankings and player_stats tables
 */

// Load environment variables
const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey)

interface BasketballPlayerData {
  espn_player_id: number
  full_name: string
  position_id: number | null
  team_id: number | null
  projected_points: number
  projected_rebounds: number
  projected_assists: number
  projected_steals: number
  projected_blocks: number
  projected_turnovers: number
  projected_field_goals_made: number
  projected_field_goals_attempted: number
  projected_three_pointers_made: number
  projected_three_pointers_attempted: number
  projected_free_throws_made: number
  projected_free_throws_attempted: number
  projected_minutes: number
  projected_games: number
}

// NBA position mappings
const NBA_POSITION_MAP: Record<number, string> = {
  1: "PG", 2: "SG", 3: "SF", 4: "PF", 5: "C"
};

const NBA_TEAM_MAP: Record<number, string> = {
  1: "ATL", 2: "BOS", 3: "BKN", 4: "CHA", 5: "CHI",
  6: "CLE", 7: "DAL", 8: "DEN", 9: "DET", 10: "GSW",
  11: "HOU", 12: "IND", 13: "LAC", 14: "LAL", 15: "MEM",
  16: "MIA", 17: "MIL", 18: "MIN", 19: "NOP", 20: "NYK",
  21: "OKC", 22: "ORL", 23: "PHI", 24: "PHX", 25: "POR",
  26: "SAC", 27: "SAS", 28: "TOR", 29: "UTA", 30: "WAS"
};

function parseArgs() {
  const args = process.argv.slice(2);
  const inputFile = args[args.indexOf("--file") + 1];
  const season = Number(args[args.indexOf("--season") + 1] ?? new Date().getFullYear());

  if (!inputFile) {
    console.error('Please specify input file with --file');
    process.exit(1);
  }

  return { inputFile, season };
}

async function uploadBasketballToSupabase() {
  try {
    const { inputFile, season } = parseArgs();
    console.log(`Reading basketball data from ${inputFile}...`);

    // Read the JSON file (from ESPN scraper)
    const jsonPath = path.resolve(inputFile);
    if (!fs.existsSync(jsonPath)) {
      throw new Error(`File not found: ${jsonPath}`);
    }

    const jsonContent = fs.readFileSync(jsonPath, 'utf-8');
    const rawData = JSON.parse(jsonContent) as any[];

    console.log(`Loaded ${rawData.length} players from JSON`);

    // Convert to BasketballPlayerData format and filter out invalid entries
    const players: BasketballPlayerData[] = rawData
      .filter(p => p.full_name && p.projected_points > 0)
      .map(p => ({
        espn_player_id: p.espn_player_id,
        full_name: p.full_name,
        position_id: p.position_id,
        team_id: p.team_id,
        projected_points: p.projected_points || 0,
        projected_rebounds: p.projected_rebounds || 0,
        projected_assists: p.projected_assists || 0,
        projected_steals: p.projected_steals || 0,
        projected_blocks: p.projected_blocks || 0,
        projected_turnovers: p.projected_turnovers || 0,
        projected_field_goals_made: p.projected_field_goals_made || 0,
        projected_field_goals_attempted: p.projected_field_goals_attempted || 0,
        projected_three_pointers_made: p.projected_three_pointers_made || 0,
        projected_three_pointers_attempted: p.projected_three_pointers_attempted || 0,
        projected_free_throws_made: p.projected_free_throws_made || 0,
        projected_free_throws_attempted: p.projected_free_throws_attempted || 0,
        projected_minutes: p.projected_minutes || 0,
        projected_games: p.projected_games || 82
      }));

    console.log(`Processing ${players.length} valid basketball players`);

    // Log sample fantasy points calculations
    console.log('\nSample Basketball Fantasy Points Calculations:');
    const samplePlayers = players.slice(0, 5);
    samplePlayers.forEach(player => {
      const stats: BasketballStats = {
        points: player.projected_points,
        rebounds: player.projected_rebounds,
        assists: player.projected_assists,
        steals: player.projected_steals,
        blocks: player.projected_blocks,
        turnovers: player.projected_turnovers,
        field_goals_made: player.projected_field_goals_made,
        field_goals_attempted: player.projected_field_goals_attempted,
        three_pointers_made: player.projected_three_pointers_made,
        three_pointers_attempted: player.projected_three_pointers_attempted,
        free_throws_made: player.projected_free_throws_made,
        free_throws_attempted: player.projected_free_throws_attempted,
        minutes: player.projected_minutes,
        games: player.projected_games
      };

      const pointsScore = calculatePointsLeagueScore(stats);
      const pointsPerGame = player.projected_games > 0 ? pointsScore / player.projected_games : 0;
      const position = NBA_POSITION_MAP[player.position_id || 0] || 'UTIL';

      console.log(`${player.full_name} (${position}): ${pointsScore.toFixed(1)} total points / ${player.projected_games} games = ${pointsPerGame.toFixed(2)} pts/game`);
    });

    // Clear existing basketball data
    console.log('\nClearing existing basketball player data...');
    await supabase.from('player_rankings').delete().neq('id', '');
    await supabase.from('player_stats').delete().neq('id', '');

    // Insert into player_rankings table
    console.log('Inserting into player_rankings table...');
    const rankingInserts = players.map(player => {
      const stats: BasketballStats = {
        points: player.projected_points,
        rebounds: player.projected_rebounds,
        assists: player.projected_assists,
        steals: player.projected_steals,
        blocks: player.projected_blocks,
        turnovers: player.projected_turnovers,
        field_goals_made: player.projected_field_goals_made,
        field_goals_attempted: player.projected_field_goals_attempted,
        three_pointers_made: player.projected_three_pointers_made,
        three_pointers_attempted: player.projected_three_pointers_attempted,
        free_throws_made: player.projected_free_throws_made,
        free_throws_attempted: player.projected_free_throws_attempted,
        minutes: player.projected_minutes,
        games: player.projected_games
      };

      const pointsLeagueScore = calculatePointsLeagueScore(stats, STANDARD_POINTS_SETTINGS);
      const categoryScores = calculateCategoryScores(stats);

      return {
        player_name: player.full_name,
        position: NBA_POSITION_MAP[player.position_id || 0] || 'UTIL',
        team: NBA_TEAM_MAP[player.team_id || 0] || null,
        // Note: ADP would come from a different source, setting to null for now
        adp: null,
        // Points league scoring
        points_league_points: pointsLeagueScore,
        points_rank: null, // Will be calculated after insert based on points_league_points
        // Categories league values
        categories_points: categoryScores.points,
        categories_rank: null, // Will be calculated after insert
        // Projected stats
        projected_points: player.projected_points,
        projected_rebounds: player.projected_rebounds,
        projected_assists: player.projected_assists,
        projected_steals: player.projected_steals,
        projected_blocks: player.projected_blocks,
        last_updated: new Date().toISOString()
      };
    });

    const { data: rankingData, error: rankingError } = await supabase
      .from('player_rankings')
      .insert(rankingInserts)
      .select();

    if (rankingError) {
      console.error('Error inserting into player_rankings:', rankingError);
      return;
    }

    console.log(`Successfully inserted ${rankingData?.length || 0} players into player_rankings`);

    // Insert into player_stats table
    console.log('Inserting into player_stats table...');
    const statsInserts = players.map(player => ({
      player_name: player.full_name,
      position: NBA_POSITION_MAP[player.position_id || 0] || 'UTIL',
      team: NBA_TEAM_MAP[player.team_id || 0] || null,
      season: season,
      games_played: player.projected_games,
      // Basketball stats
      points: player.projected_points,
      rebounds: player.projected_rebounds,
      assists: player.projected_assists,
      steals: player.projected_steals,
      blocks: player.projected_blocks,
      turnovers: player.projected_turnovers,
      field_goals_made: player.projected_field_goals_made,
      field_goals_attempted: player.projected_field_goals_attempted,
      field_goal_percentage: player.projected_field_goals_attempted > 0
        ? (player.projected_field_goals_made / player.projected_field_goals_attempted) * 100
        : null,
      three_pointers_made: player.projected_three_pointers_made,
      three_pointers_attempted: player.projected_three_pointers_attempted,
      three_point_percentage: player.projected_three_pointers_attempted > 0
        ? (player.projected_three_pointers_made / player.projected_three_pointers_attempted) * 100
        : null,
      free_throws_made: player.projected_free_throws_made,
      free_throws_attempted: player.projected_free_throws_attempted,
      free_throw_percentage: player.projected_free_throws_attempted > 0
        ? (player.projected_free_throws_made / player.projected_free_throws_attempted) * 100
        : null,
      minutes_played: player.projected_minutes,
      // Fantasy points
      fantasy_points_points: calculatePointsLeagueScore({
        points: player.projected_points,
        rebounds: player.projected_rebounds,
        assists: player.projected_assists,
        steals: player.projected_steals,
        blocks: player.projected_blocks,
        turnovers: player.projected_turnovers,
        field_goals_made: player.projected_field_goals_made,
        field_goals_attempted: player.projected_field_goals_attempted,
        three_pointers_made: player.projected_three_pointers_made,
        three_pointers_attempted: player.projected_three_pointers_attempted,
        free_throws_made: player.projected_free_throws_made,
        free_throws_attempted: player.projected_free_throws_attempted,
        minutes: player.projected_minutes,
        games: player.projected_games
      }, STANDARD_POINTS_SETTINGS),
      fantasy_points_categories: null, // Categories leagues don't have a single score
      // Per game stats
      points_per_game: player.projected_games > 0 ? player.projected_points / player.projected_games : null,
      rebounds_per_game: player.projected_games > 0 ? player.projected_rebounds / player.projected_games : null,
      assists_per_game: player.projected_games > 0 ? player.projected_assists / player.projected_games : null,
      created_at: new Date().toISOString()
    }));

    const { data: statsData, error: statsError } = await supabase
      .from('player_stats')
      .insert(statsInserts)
      .select();

    if (statsError) {
      console.error('Error inserting into player_stats:', statsError);
      return;
    }

    console.log(`Successfully inserted ${statsData?.length || 0} players into player_stats`);

    // Update rankings based on fantasy points
    console.log('\nCalculating rankings...');
    await updateRankings();

    console.log('✅ Basketball data upload to Supabase completed successfully!');

  } catch (error) {
    console.error('Error uploading basketball data to Supabase:', error);
    process.exit(1);
  }
}

async function updateRankings() {
  try {
    // Update points league rankings
    const { data: pointsPlayers, error: pointsError } = await supabase
      .from('player_rankings')
      .select('id, points_league_points')
      .order('points_league_points', { ascending: false });

    if (pointsError) {
      console.error('Error fetching points rankings:', pointsError);
      return;
    }

    if (pointsPlayers) {
      for (let i = 0; i < pointsPlayers.length; i++) {
        await supabase
          .from('player_rankings')
          .update({ points_rank: i + 1 })
          .eq('id', pointsPlayers[i].id);
      }
    }

    // Update categories league rankings (based on projected points for simplicity)
    const { data: categoriesPlayers, error: categoriesError } = await supabase
      .from('player_rankings')
      .select('id, categories_points')
      .order('categories_points', { ascending: false });

    if (categoriesError) {
      console.error('Error fetching categories rankings:', categoriesError);
      return;
    }

    if (categoriesPlayers) {
      for (let i = 0; i < categoriesPlayers.length; i++) {
        await supabase
          .from('player_rankings')
          .update({ categories_rank: i + 1 })
          .eq('id', categoriesPlayers[i].id);
      }
    }

    console.log('Rankings updated successfully');
  } catch (error) {
    console.error('Error updating rankings:', error);
  }
}

// Run the upload
if (require.main === module) {
  uploadBasketballToSupabase();
}