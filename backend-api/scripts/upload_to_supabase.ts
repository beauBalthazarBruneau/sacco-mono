import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'

// Load environment variables from .env file
dotenv.config()

/*
 * Fantasy Football Data Upload Script
 * 
 * This script uploads processed fantasy football projections to Supabase.
 * 
 * Key Features:
 * - Calculates total fantasy points for PPR, Standard, and Half-PPR scoring
 * - Calculates fantasy points PER GAME (divided by projected games played)
 * - Stores raw data without hardcoded tiers (tiers calculated dynamically by analytics)
 * - Handles CSV parsing with proper quoting
 * - Inserts into player_rankings and player_stats tables
 * 
 * Note: Tiers are intentionally NOT calculated here. The analytics backend
 * should handle tier creation based on fantasy points per game and natural
 * drop-offs by position, allowing for flexible league-specific tiering.
 */

// Load environment variables
const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables. Please set SUPABASE_URL and SUPABASE_ANON_KEY')
  process.exit(1)
}

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey)

interface GlobalPlayerData {
  player_id: string
  player_name: string
  team: string
  pos: string
  sources: string
  G: number
  Carries: number
  RuYds: number
  RuTD: number
  Rec: number
  ReYds: number
  ReTD: number
  FumLost: number
  PYds: number
  PTD: number
  INT: number
  NFC_ADP: number
}

async function uploadToSupabase() {
  try {
    console.log('Reading global player pool data...')
    
    // Read the CSV file
    const csvPath = path.join(process.cwd(), 'backend-api/data', 'global_player_pool.csv')
    const csvContent = fs.readFileSync(csvPath, 'utf-8')
    
    // Parse CSV (simple parsing for this format)
    const lines = csvContent.trim().split('\n')
    const headers = lines[0].split(',')
    const players: GlobalPlayerData[] = []
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i]
      const values = line.split(',')
      
      // Handle quoted values properly
      const parsedValues: string[] = []
      let currentValue = ''
      let inQuotes = false
      
      for (const char of line) {
        if (char === '"') {
          inQuotes = !inQuotes
        } else if (char === ',' && !inQuotes) {
          parsedValues.push(currentValue.trim())
          currentValue = ''
        } else {
          currentValue += char
        }
      }
      parsedValues.push(currentValue.trim())
      
      const player: GlobalPlayerData = {
        player_id: parsedValues[0].replace(/"/g, ''),
        player_name: parsedValues[1].replace(/"/g, ''),
        team: parsedValues[2].replace(/"/g, ''),
        pos: parsedValues[3].replace(/"/g, ''),
        sources: parsedValues[4].replace(/"/g, ''),
        G: parseFloat(parsedValues[5]) || 0,
        Carries: parseFloat(parsedValues[6]) || 0,
        RuYds: parseFloat(parsedValues[7]) || 0,
        RuTD: parseFloat(parsedValues[8]) || 0,
        Rec: parseFloat(parsedValues[9]) || 0,
        ReYds: parseFloat(parsedValues[10]) || 0,
        ReTD: parseFloat(parsedValues[11]) || 0,
        FumLost: parseFloat(parsedValues[12]) || 0,
        PYds: parseFloat(parsedValues[13]) || 0,
        PTD: parseFloat(parsedValues[14]) || 0,
        INT: parseFloat(parsedValues[15]) || 0,
        NFC_ADP: parseFloat(parsedValues[16]) || 0
      }
      
      players.push(player)
    }
    
    console.log(`Parsed ${players.length} players from CSV`)
    
    // Log some sample fantasy points per game calculations
    console.log('\nSample Fantasy Points Per Game Calculations:')
    const samplePlayers = players.slice(0, 5)
    samplePlayers.forEach(player => {
      const pprTotal = calculatePPRPoints(player)
      const pprPerGame = player.G > 0 ? pprTotal / player.G : 0
      console.log(`${player.player_name} (${player.pos}): ${pprTotal.toFixed(1)} total PPR / ${player.G} games = ${pprPerGame.toFixed(2)} PPR per game`)
    })
    
    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log('\nClearing existing player data...')
    await supabase.from('player_rankings').delete().neq('id', '')
    await supabase.from('player_stats').delete().neq('id', '')
    
    // Insert into player_rankings table
    console.log('Inserting into player_rankings table...')
    const rankingInserts = players.map(player => ({
      player_name: player.player_name,
      position: player.pos.toUpperCase() as 'QB' | 'RB' | 'WR' | 'TE',
      team: player.team,
      adp: player.NFC_ADP,
      ppr_points: calculatePPRPoints(player),
      standard_points: calculateStandardPoints(player),
      half_ppr_points: calculateHalfPPRPoints(player),
      ppr_points_per_game: player.G > 0 ? calculatePPRPoints(player) / player.G : 0,
      standard_points_per_game: player.G > 0 ? calculateStandardPoints(player) / player.G : 0,
      half_ppr_points_per_game: player.G > 0 ? calculateHalfPPRPoints(player) / player.G : 0,
      last_updated: new Date().toISOString()
    }))
    
    const { data: rankingData, error: rankingError } = await supabase
      .from('player_rankings')
      .insert(rankingInserts)
      .select()
    
    if (rankingError) {
      console.error('Error inserting into player_rankings:', rankingError)
      return
    }
    
    console.log(`Successfully inserted ${rankingData?.length || 0} players into player_rankings`)
    
  //   // Insert into player_stats table
  //   console.log('Inserting into player_stats table...')
  //   const statsInserts = players.map(player => ({
  //     player_name: player.player_name,
  //     position: player.pos.toUpperCase() as 'QB' | 'RB' | 'WR' | 'TE',
  //     team: player.team,
  //     season: 2025,
  //     games_played: player.G,
  //     passing_yards: player.PYds || null,
  //     passing_tds: player.PTD || null,
  //     passing_ints: player.INT || null,
  //     rushing_yards: player.RuYds || null,
  //     rushing_tds: player.RuTD || null,
  //     receiving_yards: player.ReYds || null,
  //     receiving_tds: player.ReTD || null,
  //     receptions: player.Rec || null,
  //     fantasy_points_ppr: calculatePPRPoints(player),
  //     fantasy_points_standard: calculateStandardPoints(player),
  //     fantasy_points_half_ppr: calculateHalfPPRPoints(player),
  //     ppr_points_per_game: player.G > 0 ? calculatePPRPoints(player) / player.G : 0,
  //     standard_points_per_game: player.G > 0 ? calculateStandardPoints(player) / player.G : 0,
  //     half_ppr_points_per_game: player.G > 0 ? calculateHalfPPRPoints(player) / player.G : 0,
  //     created_at: new Date().toISOString()
  //   }))
    
  //   const { data: statsData, error: statsError } = await supabase
  //     .from('player_stats')
  //     .insert(statsInserts)
  //     .select()
    
  //   if (statsError) {
  //     console.error('Error inserting into player_stats:', statsError)
  //     return
  //   }
    
  //   console.log(`Successfully inserted ${statsData?.length || 0} players into player_stats`)
  //   console.log('✅ Upload to Supabase completed successfully!')
    
  // } catch (error) {
  //   console.error('Error uploading to Supabase:', error)
  // }
}

// Note: Tiers are now calculated dynamically by the analytics backend
// based on fantasy points per game and natural drop-offs by position

// Helper function to calculate PPR fantasy points
function calculatePPRPoints(player: GlobalPlayerData): number {
  let points = 0
  
  // Passing points (4 pts per TD, 1 pt per 25 yards, -2 pts per INT)
  points += (player.PTD * 4) + (player.PYds / 25) - (player.INT * 2)
  
  // Rushing points (6 pts per TD, 1 pt per 10 yards)
  points += (player.RuTD * 6) + (player.RuYds / 10)
  
  // Receiving points (6 pts per TD, 1 pt per 10 yards, 1 pt per reception)
  points += (player.ReTD * 6) + (player.ReYds / 10) + player.Rec
  
  // Fumble points (-2 pts per fumble lost)
  points -= (player.FumLost * 2)
  
  return Math.round(points * 100) / 100 // Round to 2 decimal places
}

// Helper function to calculate standard fantasy points
function calculateStandardPoints(player: GlobalPlayerData): number {
  let points = 0
  
  // Passing points (4 pts per TD, 1 pt per 25 yards, -2 pts per INT)
  points += (player.PTD * 4) + (player.PYds / 25) - (player.INT * 2)
  
  // Rushing points (6 pts per TD, 1 pt per 10 yards)
  points += (player.RuTD * 6) + (player.RuYds / 10)
  
  // Receiving points (6 pts per TD, 1 pt per 10 yards, NO PPR)
  points += (player.ReTD * 6) + (player.ReYds / 10)
  
  // Fumble points (-2 pts per fumble lost)
  points -= (player.FumLost * 2)
  
  return Math.round(points * 100) / 100 // Round to 2 decimal places
}

// Helper function to calculate half-PPR fantasy points
function calculateHalfPPRPoints(player: GlobalPlayerData): number {
  let points = 0
  
  // Passing points (4 pts per TD, 1 pt per 25 yards, -2 pts per INT)
  points += (player.PTD * 4) + (player.PYds / 25) - (player.INT * 2)
  
  // Rushing points (6 pts per TD, 1 pt per 10 yards)
  points += (player.RuTD * 6) + (player.RuYds / 10)
  
  // Receiving points (6 pts per TD, 1 pt per 10 yards, 0.5 pt per reception)
  points += (player.ReTD * 6) + (player.ReYds / 10) + (player.Rec * 0.5)
  
  // Fumble points (-2 pts per fumble lost)
  points -= (player.FumLost * 2)
  
  return Math.round(points * 100) / 100 // Round to 2 decimal places
}

// Run the upload
uploadToSupabase() 