// backend-api/scripts/scrape_espn_projections.ts
// Run with:
//   npx tsx backend-api/scripts/scrape_espn_projections.ts --season 2025 --scoring ppr

import fetch from "node-fetch";
import * as fs from "fs";

type Scoring = "standard" | "ppr" | "half";
const PPR_MAP: Record<Scoring, number> = {
  standard: 1,
  ppr: 3,
  half: 4,
};

type EspnStatLine = {
  id: string;
  statSourceId?: number;
  statSplitTypeId?: number;
  stats?: Record<string, number>;
  appliedTotal?: number;
};

type EspnPlayer = {
  id: number;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  proTeamId?: number;
  defaultPositionId?: number;
  stats?: EspnStatLine[];
};

type SleeperPlayer = {
  player_id: string;
  full_name?: string;
  espn_id?: string | number;
};

type OutputRow = {
  source: "ESPN";
  season: number;
  scoring: Scoring;
  espn_player_id: number;
  sleeper_id: string | null;
  full_name: string | null;
  position_id: number | null;
  team_id: number | null;
  stats_json: string;
  espn_points: number | null;
  fetched_at: string;
};

function parseArgs() {
  const args = process.argv.slice(2);
  const season = Number(args[args.indexOf("--season") + 1] ?? new Date().getFullYear());
  const scoring = (args[args.indexOf("--scoring") + 1] ?? "ppr") as Scoring;
  if (!["standard", "ppr", "half"].includes(scoring)) {
    throw new Error("Use --scoring standard|ppr|half");
  }
  return { season, scoring };
}

async function fetchSleeperPlayers(): Promise<Record<string, string>> {
  const url = "https://api.sleeper.app/v1/players/nfl";
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`Sleeper fetch failed: ${resp.status}`);
  const data = (await resp.json()) as Record<string, SleeperPlayer>;
  const byEspn: Record<string, string> = {};
  for (const p of Object.values(data)) {
    const espnId = p.espn_id != null ? String(p.espn_id) : null;
    if (espnId) byEspn[espnId] = p.player_id;
  }
  return byEspn;
}

function isSeasonProjection(s: EspnStatLine, season: number) {
  if (typeof s.statSourceId === "number" && typeof s.statSplitTypeId === "number") {
    return s.statSourceId === 1 && s.statSplitTypeId === 0;
  }
  return s.id === `10${season}`;
}

async function fetchEspnProjections(season: number, scoring: Scoring): Promise<EspnPlayer[]> {
  const pprId = PPR_MAP[scoring];
  const url = `https://fantasy.espn.com/apis/v3/games/ffl/seasons/${season}/segments/0/leaguedefaults/${pprId}?view=kona_player_info`;

  const fantasyFilter = {
    players: {
      limit: 5000,
      sortPercOwned: { sortPriority: 1, sortAsc: false },
      // be liberal here; some responses omit "active" on projections-only pages
      filterStatus: { value: ["FREEAGENT", "ONTEAM", "WAIVERS", "INJUREDRESERVE"] }
    }
  };

  const headers = {
    // look like a real browser hitting the projections page
    "Accept": "application/json, text/plain, */*",
    "Accept-Language": "en-US,en;q=0.9",
    "Origin": "https://fantasy.espn.com",
    "Referer": "https://fantasy.espn.com/football/players/projections",
    "User-Agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Safari/605.1.15",
    "X-Fantasy-Filter": JSON.stringify(fantasyFilter),
    "x-fantasy-platform": "kona-PROD-ffl",
  };

  const resp = await fetch(url, { headers });

  // If ESPN serves HTML (bot wall, 404 page, etc.), show a useful error
  const ct = resp.headers.get("content-type") || "";
  if (!ct.includes("application/json")) {
    const text = await resp.text();
    const sample = text.slice(0, 300).replace(/\s+/g, " ");
    throw new Error(
      `ESPN returned non-JSON (${resp.status} ${resp.statusText}). ` +
      `Content-Type=${ct}. Sample: ${sample}`
    );
  }

  const body = (await resp.json()) as any;

  // Normalize to EspnPlayer[]
  let players: EspnPlayer[] = [];
  if (Array.isArray(body.players)) {
    if (body.players.length && Object.prototype.hasOwnProperty.call(body.players[0], "player")) {
      players = body.players.map((p: any) => p.player);
    } else {
      players = body.players;
    }
  }
  return players;
}


function toRows(players: EspnPlayer[], season: number, scoring: Scoring, espnToSleeper: Record<string, string>): OutputRow[] {
  const fetched_at = new Date().toISOString();
  const rows: OutputRow[] = [];

  for (const p of players) {
    const stat = (p.stats || []).find((s) => isSeasonProjection(s, season));
    const statsObj = stat?.stats ?? {};

    const nameCandidate = p.fullName ?? [p.firstName, p.lastName].filter(Boolean).join(" ");
    const fullName = nameCandidate ? nameCandidate : null;

    rows.push({
      source: "ESPN",
      season,
      scoring,
      espn_player_id: p.id,
      sleeper_id: espnToSleeper[String(p.id)] ?? null,
      full_name: fullName,
      position_id: p.defaultPositionId ?? null,
      team_id: p.proTeamId ?? null,
      stats_json: JSON.stringify(statsObj),
      espn_points: stat?.appliedTotal ?? null,
      fetched_at,
    });
  }
  return rows;
}


function writeOutputs(rows: OutputRow[], season: number, scoring: Scoring) {
  const base = `/tmp/espn_projections_${season}_${scoring}`;
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

  console.log(`Wrote ${rows.length} rows`);
  console.log(`→ JSON: ${jsonPath}`);
  console.log(`→ CSV : ${csvPath}`);
}

(async function main() {
  const { season, scoring } = parseArgs();
  console.log(`Scraping ESPN projections for ${season} (${scoring})...`);
  const [espnPlayers, espnToSleeper] = await Promise.all([
    fetchEspnProjections(season, scoring),
    fetchSleeperPlayers(),
  ]);
  const rows = toRows(espnPlayers, season, scoring, espnToSleeper).filter((r) => r.full_name);
  writeOutputs(rows, season, scoring);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
