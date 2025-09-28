// backend-api/scripts/basketball/scrape_espn_basketball_projections.ts
// Run with:
//   npx tsx backend-api/scripts/basketball/scrape_espn_basketball_projections.ts --season 2025

import fetch from "node-fetch";
import * as fs from "fs";

type EspnBasketballStatLine = {
  id: string;
  statSourceId?: number;
  statSplitTypeId?: number;
  stats?: Record<string, number>;
  appliedTotal?: number;
};

type EspnBasketballPlayer = {
  id: number;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  proTeamId?: number;
  defaultPositionId?: number;
  stats?: EspnBasketballStatLine[];
  ownership?: {
    percentOwned?: number;
    percentChange?: number;
  };
};

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

// ESPN NBA position mappings
const NBA_POSITION_MAP: Record<number, string> = {
  1: "PG",  // Point Guard
  2: "SG",  // Shooting Guard
  3: "SF",  // Small Forward
  4: "PF",  // Power Forward
  5: "C",   // Center
};

// ESPN NBA team mappings (sample - would need full mapping)
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
  const season = Number(args[args.indexOf("--season") + 1] ?? new Date().getFullYear());
  return { season };
}

function isSeasonProjection(s: EspnBasketballStatLine, season: number) {
  if (typeof s.statSourceId === "number" && typeof s.statSplitTypeId === "number") {
    // statSourceId 1 = projections, statSplitTypeId 0 = full season
    return s.statSourceId === 1 && s.statSplitTypeId === 0;
  }
  return s.id === `10${season}`;
}

async function fetchEspnBasketballProjections(season: number): Promise<EspnBasketballPlayer[]> {
  // Try multiple potential API endpoints
  const endpoints = [
    `https://fantasy.espn.com/apis/v3/games/fba/seasons/${season}/segments/0/leaguedefaults/1?view=kona_player_info`,
    `https://fantasy.espn.com/apis/v3/games/fba/seasons/${season}/segments/0/leaguedefaults/3?view=kona_player_info`,
    `https://fantasy.espn.com/apis/v3/games/fba/seasons/2024/segments/0/leaguedefaults/1?view=kona_player_info`,
    // Try without the view parameter
    `https://fantasy.espn.com/apis/v3/games/fba/seasons/${season}/segments/0/leaguedefaults/1`,
    // Try with different view
    `https://fantasy.espn.com/apis/v3/games/fba/seasons/${season}/segments/0/leaguedefaults/1?view=players_wl`,
  ];

  const fantasyFilter = {
    players: {
      limit: 500,
      sortPercOwned: { sortPriority: 1, sortAsc: false },
      filterStatus: { value: ["FREEAGENT", "ONTEAM", "WAIVERS"] }
    }
  };

  // Try each endpoint until one works
  for (const url of endpoints) {
    console.log(`Trying endpoint: ${url}`);

    const headers = {
      "Accept": "application/json, text/plain, */*",
      "Accept-Language": "en-US,en;q=0.9",
      "Cache-Control": "no-cache",
      "Origin": "https://fantasy.espn.com",
      "Referer": "https://fantasy.espn.com/basketball/players/projections",
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "X-Fantasy-Filter": JSON.stringify(fantasyFilter),
      "x-fantasy-platform": "kona-PROD-fba",
    };

    try {
      const resp = await fetch(url, { headers });

      // Handle non-JSON responses
      const ct = resp.headers.get("content-type") || "";
      if (!ct.includes("application/json")) {
        const text = await resp.text();
        const sample = text.slice(0, 300).replace(/\s+/g, " ");
        console.log(`❌ Non-JSON response from ${url}: ${resp.status} ${resp.statusText}, Content-Type: ${ct}`);
        console.log(`Sample: ${sample}`);
        continue; // Try next endpoint
      }

      const body = (await resp.json()) as any;
      console.log(`✅ Got JSON response from ${url}`);
      console.log(`Raw response keys: ${Object.keys(body)}`);

      // Normalize to EspnBasketballPlayer[]
      let players: EspnBasketballPlayer[] = [];
      if (Array.isArray(body.players)) {
        if (body.players.length && Object.prototype.hasOwnProperty.call(body.players[0], "player")) {
          players = body.players.map((p: any) => p.player);
        } else {
          players = body.players;
        }
      }

      console.log(`Found ${players.length} basketball players from ${url}`);
      if (players.length > 0) {
        return players; // Return immediately if we got players
      }

    } catch (error) {
      console.log(`❌ Error fetching from ${url}:`, error);
      continue; // Try next endpoint
    }
  }

  // If we get here, all endpoints failed
  throw new Error("Failed to fetch basketball data from all ESPN endpoints");
}

function extractBasketballStats(statsObj: Record<string, number>) {
  // ESPN Basketball stat IDs (these would need to be confirmed via API exploration)
  return {
    points: statsObj["0"] || null,           // Points
    rebounds: statsObj["1"] || null,         // Total Rebounds
    assists: statsObj["2"] || null,          // Assists
    steals: statsObj["3"] || null,           // Steals
    blocks: statsObj["4"] || null,           // Blocks
    turnovers: statsObj["5"] || null,        // Turnovers
    field_goals_made: statsObj["6"] || null, // Field Goals Made
    field_goals_attempted: statsObj["7"] || null, // Field Goals Attempted
    three_pointers_made: statsObj["8"] || null,   // 3-Pointers Made
    three_pointers_attempted: statsObj["9"] || null, // 3-Pointers Attempted
    free_throws_made: statsObj["10"] || null,     // Free Throws Made
    free_throws_attempted: statsObj["11"] || null, // Free Throws Attempted
    minutes: statsObj["12"] || null,              // Minutes Played
    games: statsObj["13"] || null,                // Games Played
  };
}

function toBasketballRows(players: EspnBasketballPlayer[], season: number): BasketballOutputRow[] {
  const fetched_at = new Date().toISOString();
  const rows: BasketballOutputRow[] = [];

  for (const p of players) {
    const stat = (p.stats || []).find((s) => isSeasonProjection(s, season));
    const statsObj = stat?.stats ?? {};
    const basketballStats = extractBasketballStats(statsObj);

    const nameCandidate = p.fullName ?? [p.firstName, p.lastName].filter(Boolean).join(" ");
    const fullName = nameCandidate ? nameCandidate : null;

    rows.push({
      source: "ESPN",
      season,
      espn_player_id: p.id,
      full_name: fullName,
      position_id: p.defaultPositionId ?? null,
      team_id: p.proTeamId ?? null,
      stats_json: JSON.stringify(statsObj),
      projected_points: basketballStats.points,
      projected_rebounds: basketballStats.rebounds,
      projected_assists: basketballStats.assists,
      projected_steals: basketballStats.steals,
      projected_blocks: basketballStats.blocks,
      projected_turnovers: basketballStats.turnovers,
      projected_field_goals_made: basketballStats.field_goals_made,
      projected_field_goals_attempted: basketballStats.field_goals_attempted,
      projected_three_pointers_made: basketballStats.three_pointers_made,
      projected_three_pointers_attempted: basketballStats.three_pointers_attempted,
      projected_free_throws_made: basketballStats.free_throws_made,
      projected_free_throws_attempted: basketballStats.free_throws_attempted,
      projected_minutes: basketballStats.minutes,
      projected_games: basketballStats.games,
      espn_fantasy_points: stat?.appliedTotal ?? null,
      fetched_at,
    });
  }

  return rows;
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

  console.log(`Wrote ${rows.length} basketball player rows`);
  console.log(`→ JSON: ${jsonPath}`);
  console.log(`→ CSV : ${csvPath}`);

  // Log sample data
  if (rows.length > 0) {
    console.log("\nSample players:");
    rows.slice(0, 5).forEach(row => {
      console.log(`${row.full_name} (${NBA_POSITION_MAP[row.position_id || 0] || 'Unknown'}): ${row.projected_points} pts, ${row.projected_rebounds} reb, ${row.projected_assists} ast`);
    });
  }
}

(async function main() {
  const { season } = parseArgs();
  console.log(`Scraping ESPN basketball projections for ${season}...`);

  try {
    const espnPlayers = await fetchEspnBasketballProjections(season);
    const rows = toBasketballRows(espnPlayers, season).filter((r) => r.full_name);
    writeBasketballOutputs(rows, season);

    console.log(`\n✅ Successfully scraped ${rows.length} basketball players`);
  } catch (error) {
    console.error("❌ Error scraping basketball projections:", error);
    process.exit(1);
  }
})();