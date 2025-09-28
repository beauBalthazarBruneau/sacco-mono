# Basketball Fantasy Data Scripts

This directory contains scripts for scraping and processing basketball fantasy data.

## Scripts Overview

### 1. `scrape_espn_basketball_projections.ts`
Scrapes basketball player projections from ESPN Fantasy Basketball API.

**Usage:**
```bash
npx tsx backend-api/scripts/basketball/scrape_espn_basketball_projections.ts --season 2025
```

**Output:**
- `/tmp/espn_basketball_projections_2025.json`
- `/tmp/espn_basketball_projections_2025.csv`

**Features:**
- Fetches NBA player projections for current season
- Extracts key basketball stats: points, rebounds, assists, steals, blocks, etc.
- Maps ESPN position IDs to basketball positions (PG, SG, SF, PF, C)
- Includes shooting percentages and advanced stats

### 2. `basketball_scoring.ts`
Fantasy basketball scoring calculations and utilities.

**Features:**
- **Points Leagues**: Calculate total fantasy points using customizable scoring settings
- **Categories Leagues**: Extract individual category values for roto/head-to-head
- **Multiple Scoring Systems**: Standard, Conservative, Aggressive point values
- **Per-Game Calculations**: Convert season totals to per-game averages
- **Double/Triple-Double Estimation**: Heuristic-based bonus calculations

**Scoring Systems:**
```typescript
// Standard points league (most common)
STANDARD_POINTS_SETTINGS = {
  points: 1.0,
  rebounds: 1.2,
  assists: 1.5,
  steals: 3.0,
  blocks: 3.0,
  turnovers: -1.0,
  // ... shooting bonuses/penalties
}
```

### 3. `upload_basketball_to_supabase.ts`
Uploads processed basketball data to the Supabase database.

**Usage:**
```bash
npx tsx backend-api/scripts/basketball/upload_basketball_to_supabase.ts --file /tmp/espn_basketball_projections_2025.json --season 2025
```

**Features:**
- Inserts data into `player_rankings` and `player_stats` tables
- Calculates fantasy points for multiple scoring systems
- Generates position-based rankings
- Stores both total season and per-game projections
- Uses new basketball database schema

## Complete Workflow

1. **Scrape Data:**
   ```bash
   npx tsx backend-api/scripts/basketball/scrape_espn_basketball_projections.ts --season 2025
   ```

2. **Upload to Database:**
   ```bash
   npx tsx backend-api/scripts/basketball/upload_basketball_to_supabase.ts --file /tmp/espn_basketball_projections_2025.json --season 2025
   ```

3. **Verify Results:**
   Check your Supabase dashboard to see the populated basketball data.

## Environment Variables

Make sure these are set in your `.env` file:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Database Schema

The scripts work with the updated basketball database schema:

### Positions
- `PG` (Point Guard)
- `SG` (Shooting Guard)
- `SF` (Small Forward)
- `PF` (Power Forward)
- `C` (Center)
- `G` (Guard - PG/SG eligible)
- `F` (Forward - SF/PF eligible)
- `UTIL` (Utility - any position)

### League Types
- `Points` - Fantasy points based on statistical production
- `Categories` - Win/lose in 8-10 statistical categories
- `Head2Head` - Weekly matchups based on categories
- `Roto` - Season-long rotisserie scoring

### Draft Strategies
- `Best Available` - Draft highest-ranked player
- `Position Need` - Fill roster needs first
- `Punt Strategy` - Ignore certain categories
- `Stars and Scrubs` - Draft elite players + cheap depth
- `Balanced Build` - Even distribution across categories
- `Category Focus` - Target specific statistical categories

## Troubleshooting

**ESPN API Issues:**
- The ESPN API occasionally blocks requests. Try changing User-Agent or adding delays between requests.
- Season parameter should match current NBA season (e.g., 2024-25 season = 2025).

**Database Errors:**
- Ensure your Supabase service role key has proper permissions.
- Check that the database schema matches the expected basketball format.

**Missing Data:**
- Some players may not have complete projections. The script filters out players with no projected points.
- Position mappings may need updates if ESPN changes their position ID system.