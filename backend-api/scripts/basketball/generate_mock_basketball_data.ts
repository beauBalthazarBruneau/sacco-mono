// backend-api/scripts/basketball/generate_mock_basketball_data.ts
// Generate mock basketball data for testing the upload pipeline
// Run with: npx tsx backend-api/scripts/basketball/generate_mock_basketball_data.ts --season 2025

import * as fs from "fs";

type BasketballOutputRow = {
  source: "ESPN";
  season: number;
  espn_player_id: number;
  full_name: string | null;
  position_id: number | null;
  team_id: number | null;
  stats_json: string;
  projected_points: number | null;
  projected_rebounds: number | null;
  projected_assists: number | null;
  projected_steals: number | null;
  projected_blocks: number | null;
  projected_turnovers: number | null;
  projected_field_goals_made: number | null;
  projected_field_goals_attempted: number | null;
  projected_three_pointers_made: number | null;
  projected_three_pointers_attempted: number | null;
  projected_free_throws_made: number | null;
  projected_free_throws_attempted: number | null;
  projected_minutes: number | null;
  projected_games: number | null;
  espn_fantasy_points: number | null;
  fetched_at: string;
};

// NBA position mappings
const NBA_POSITIONS = [1, 2, 3, 4, 5]; // PG, SG, SF, PF, C
const NBA_TEAMS = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
  16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30
];

// Mock star players with realistic stats
const STAR_PLAYERS = [
  { name: "Luka Doncic", position: 1, team: 7, pts: 28.5, reb: 8.2, ast: 8.8, stl: 1.2, blk: 0.5, tov: 4.1 },
  { name: "Nikola Jokic", position: 5, team: 8, pts: 26.4, reb: 12.4, ast: 9.0, stl: 1.3, blk: 0.7, tov: 3.8 },
  { name: "Giannis Antetokounmpo", position: 4, team: 17, pts: 30.4, reb: 11.5, ast: 6.5, stl: 1.2, blk: 1.1, tov: 3.4 },
  { name: "Jayson Tatum", position: 3, team: 2, pts: 27.0, reb: 8.1, ast: 4.9, stl: 1.0, blk: 0.6, tov: 2.5 },
  { name: "Shai Gilgeous-Alexander", position: 1, team: 21, pts: 30.1, reb: 5.5, ast: 6.2, stl: 2.0, blk: 0.9, tov: 2.8 },
  { name: "Anthony Davis", position: 4, team: 14, pts: 25.7, reb: 12.6, ast: 3.6, stl: 1.1, blk: 2.3, tov: 2.1 },
  { name: "Anthony Edwards", position: 2, team: 18, pts: 25.9, reb: 5.4, ast: 5.1, stl: 1.3, blk: 0.5, tov: 3.3 },
  { name: "Donovan Mitchell", position: 2, team: 6, pts: 26.6, reb: 5.1, ast: 6.1, stl: 1.8, blk: 0.4, tov: 2.7 },
  { name: "Joel Embiid", position: 5, team: 23, pts: 34.7, reb: 11.0, ast: 5.6, stl: 1.2, blk: 1.7, tov: 3.4 },
  { name: "Ja Morant", position: 1, team: 15, pts: 25.1, reb: 5.6, ast: 8.1, stl: 0.9, blk: 0.3, tov: 3.4 },
];

function generateMockPlayer(id: number, name?: string, position?: number, team?: number): BasketballOutputRow {
  const playerName = name || `Player ${id}`;
  const pos = position || NBA_POSITIONS[Math.floor(Math.random() * NBA_POSITIONS.length)];
  const teamId = team || NBA_TEAMS[Math.floor(Math.random() * NBA_TEAMS.length)];

  // Generate realistic stats based on position
  let basePoints = 12 + Math.random() * 20; // 12-32 points
  let baseRebounds = 4 + Math.random() * 10; // 4-14 rebounds
  let baseAssists = 2 + Math.random() * 8;   // 2-10 assists
  let baseSteals = 0.5 + Math.random() * 1.5; // 0.5-2.0 steals
  let baseBlocks = 0.2 + Math.random() * 1.5;  // 0.2-1.7 blocks
  let baseTurnovers = 1.5 + Math.random() * 3; // 1.5-4.5 turnovers

  // Adjust stats by position
  if (pos === 1) { // PG
    baseAssists += 3;
    baseSteals += 0.5;
    baseRebounds -= 2;
  } else if (pos === 5) { // C
    baseRebounds += 4;
    baseBlocks += 1;
    baseAssists -= 2;
    basePoints += 2;
  } else if (pos === 4) { // PF
    baseRebounds += 2;
    baseBlocks += 0.5;
    basePoints += 3;
  }

  const games = 75 + Math.floor(Math.random() * 7); // 75-82 games
  const minutes = 25 + Math.random() * 15; // 25-40 minutes per game

  // Calculate shooting stats
  const fgPct = 0.42 + Math.random() * 0.16; // 42-58% FG
  const ftPct = 0.70 + Math.random() * 0.25; // 70-95% FT
  const fg3Pct = 0.28 + Math.random() * 0.17; // 28-45% 3PT

  const fgAttempts = (basePoints * 0.7) / fgPct;
  const fgMade = fgAttempts * fgPct;
  const ftAttempts = basePoints * 0.25;
  const ftMade = ftAttempts * ftPct;
  const fg3Attempts = 3 + Math.random() * 8; // 3-11 attempts
  const fg3Made = fg3Attempts * fg3Pct;

  const statsObj = {
    "0": basePoints,
    "1": baseRebounds,
    "2": baseAssists,
    "3": baseSteals,
    "4": baseBlocks,
    "5": baseTurnovers,
    "6": fgMade,
    "7": fgAttempts,
    "8": fg3Made,
    "9": fg3Attempts,
    "10": ftMade,
    "11": ftAttempts,
    "12": minutes,
    "13": games,
  };

  return {
    source: "ESPN",
    season: new Date().getFullYear(),
    espn_player_id: id,
    full_name: playerName,
    position_id: pos,
    team_id: teamId,
    stats_json: JSON.stringify(statsObj),
    projected_points: Math.round(basePoints * 100) / 100,
    projected_rebounds: Math.round(baseRebounds * 100) / 100,
    projected_assists: Math.round(baseAssists * 100) / 100,
    projected_steals: Math.round(baseSteals * 100) / 100,
    projected_blocks: Math.round(baseBlocks * 100) / 100,
    projected_turnovers: Math.round(baseTurnovers * 100) / 100,
    projected_field_goals_made: Math.round(fgMade * 100) / 100,
    projected_field_goals_attempted: Math.round(fgAttempts * 100) / 100,
    projected_three_pointers_made: Math.round(fg3Made * 100) / 100,
    projected_three_pointers_attempted: Math.round(fg3Attempts * 100) / 100,
    projected_free_throws_made: Math.round(ftMade * 100) / 100,
    projected_free_throws_attempted: Math.round(ftAttempts * 100) / 100,
    projected_minutes: Math.round(minutes * 100) / 100,
    projected_games: games,
    espn_fantasy_points: Math.round((basePoints + baseRebounds * 1.2 + baseAssists * 1.5 + baseSteals * 3 + baseBlocks * 3 - baseTurnovers) * 100) / 100,
    fetched_at: new Date().toISOString(),
  };
}

function parseArgs() {
  const args = process.argv.slice(2);
  const season = Number(args[args.indexOf("--season") + 1] ?? new Date().getFullYear());
  return { season };
}

function writeBasketballOutputs(rows: BasketballOutputRow[], season: number) {
  const base = `/tmp/espn_basketball_projections_${season}`;
  const jsonPath = `${base}.json`;
  const csvPath = `${base}.csv`;

  fs.writeFileSync(jsonPath, JSON.stringify(rows, null, 2));

  const headers = Object.keys(rows[0]);
  const csvLines = [
    headers.join(","),
    ...rows.map((r) =>
      headers
        .map((h) => {
          const v = (r as any)[h];
          const s = v === null || v === undefined ? "" : String(v);
          return `"${s.replace(/"/g, '""')}"`;
        })
        .join(",")
    ),
  ];
  fs.writeFileSync(csvPath, csvLines.join("\n"), "utf8");

  console.log(`Generated ${rows.length} mock basketball player rows`);
  console.log(`→ JSON: ${jsonPath}`);
  console.log(`→ CSV : ${csvPath}`);

  // Log sample data
  if (rows.length > 0) {
    console.log("\nSample players:");
    const NBA_POSITION_MAP: Record<number, string> = {
      1: "PG", 2: "SG", 3: "SF", 4: "PF", 5: "C",
    };
    rows.slice(0, 10).forEach(row => {
      console.log(`${row.full_name} (${NBA_POSITION_MAP[row.position_id || 0] || 'Unknown'}): ${row.projected_points} pts, ${row.projected_rebounds} reb, ${row.projected_assists} ast`);
    });
  }
}

(async function main() {
  const { season } = parseArgs();
  console.log(`Generating mock basketball data for ${season}...`);

  try {
    const rows: BasketballOutputRow[] = [];

    // Add star players with realistic stats
    STAR_PLAYERS.forEach((star, index) => {
      const mockPlayer = generateMockPlayer(
        index + 1,
        star.name,
        star.position,
        star.team
      );
      // Override with star player stats
      mockPlayer.projected_points = star.pts;
      mockPlayer.projected_rebounds = star.reb;
      mockPlayer.projected_assists = star.ast;
      mockPlayer.projected_steals = star.stl;
      mockPlayer.projected_blocks = star.blk;
      mockPlayer.projected_turnovers = star.tov;
      mockPlayer.season = season;
      rows.push(mockPlayer);
    });

    // Add more random players
    for (let i = STAR_PLAYERS.length + 1; i <= 200; i++) {
      const mockPlayer = generateMockPlayer(i);
      mockPlayer.season = season;
      rows.push(mockPlayer);
    }

    writeBasketballOutputs(rows, season);
    console.log(`\n✅ Successfully generated ${rows.length} mock basketball players`);
  } catch (error) {
    console.error("❌ Error generating mock basketball data:", error);
    process.exit(1);
  }
})();