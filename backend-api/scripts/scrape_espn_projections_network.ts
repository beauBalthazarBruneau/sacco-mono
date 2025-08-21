// Run:
//   npx tsx backend-api/scripts/scrape_espn_projections_network.ts --season 2025 --scoring ppr
//
// Outputs:
//   backend-api/data/espn_projections_<season>_<scoring>.json
//   backend-api/data/espn_projections_<season>_<scoring>.csv
//
// Approach:
// - Use Playwright to scrape the ESPN projections table directly from the UI
// - Extract player data from the HTML table rows
// - Parse ESPN player IDs from player links
// - Join with Sleeper data for sleeper_id mapping
// - Write JSON + CSV to backend-api/data/

import { chromium, Page } from "playwright";
import * as fs from "fs";
import * as path from "path";

type Scoring = "standard" | "ppr" | "half";
const SCORING_LABEL: Record<Scoring, string> = {
  standard: "Standard",
  ppr: "PPR",
  half: "Half PPR",
};

type EspnPlayer = {
  id: number;               // ESPN athlete id
  fullName?: string;
  firstName?: string;
  lastName?: string;
  proTeamId?: number;
  defaultPositionId?: number; // 1=QB,2=RB,3=WR,4=TE,5=K,16=D/ST (ESPN codes)
  stats?: any[];
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
  stats_json: string;        // ESPN stat-id keyed map (JSON string)
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

async function fetchSleeperMap(): Promise<Record<string, string>> {
  const resp = await fetch("https://api.sleeper.app/v1/players/nfl");
  if (!resp.ok) throw new Error(`Sleeper fetch failed: ${resp.status}`);
  const data = (await resp.json()) as Record<string, { player_id: string; espn_id?: string | number }>;
  const map: Record<string, string> = {};
  for (const p of Object.values(data)) {
    if (p.espn_id != null) map[String(p.espn_id)] = p.player_id;
  }
  return map;
}

async function setSeason(page: Page, season: number) {
  const base = "https://fantasy.espn.com/football/players/projections";
  const url = `${base}?seasonId=${season}`;
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60_000 });
  await page.waitForLoadState("networkidle", { timeout: 60_000 }).catch(() => {});
}

async function setScoring(page: Page, scoring: Scoring) {
  // Best effort: some builds expose a scoring dropdown. If not found, we still scrape from JSON directly.
  const label = SCORING_LABEL[scoring];
  try {
    const scoringButton = page.locator('button:has-text("Scoring")');
    if (await scoringButton.count()) {
      await scoringButton.first().click().catch(() => {});
      const opt = page.locator(`role=menuitem[name="${label}"]`);
      if (await opt.count()) {
        await opt.first().click().catch(() => {});
        await page.waitForTimeout(500);
      }
    } else {
      const direct = page.locator(`text="${label}"`);
      if (await direct.count()) {
        await direct.first().click().catch(() => {});
        await page.waitForTimeout(500);
      }
    }
  } catch {
    // ignore; we'll still scrape the table
  }
}

async function clickPositionTab(page: Page, pos: string) {
  // Click the position filter tab (e.g., QB, RB, WR, TE, K, D/ST)
  try {
    const tab = page.locator(`role=tab[name="${pos}"]`);
    if (await tab.count()) {
      await tab.click();
      await page.waitForTimeout(500);
      return;
    }
    const fallback = page.locator(`text="${pos}"`);
    if (await fallback.count()) {
      await fallback.first().click();
      await page.waitForTimeout(500);
    }
  } catch {
    // ignore
  }
}

async function readTableOnce(page: Page): Promise<{ headers: string[]; rows: any[] }> {
  // Find the main projections table and wait for it to have actual data
  const table = page.locator("table");
  await table.first().waitFor({ state: "visible", timeout: 20_000 });

  // Wait for the table to have more than just header rows
  let attempts = 0;
  let maxAttempts = 30; // Wait up to 30 seconds for data to load
  
  while (attempts < maxAttempts) {
    const rowCount = await table.first().locator("tr").count();
    if (rowCount > 2) { // More than just header rows
      break;
    }
    console.log(`Waiting for table data to load... (attempt ${attempts + 1}/${maxAttempts})`);
    await page.waitForTimeout(1000);
    attempts++;
  }

  // Read headers
  const headerCells = table.first().locator("thead tr th");
  const headers: string[] = [];
  const hCount = await headerCells.count();
  for (let i = 0; i < hCount; i++) {
    const txt = (await headerCells.nth(i).innerText()).trim();
    headers.push(txt || `COL_${i}`);
  }

  // Read body rows
  const bodyRows = table.first().locator("tbody tr");
  const count = await bodyRows.count();
  const rows: any[] = [];

  for (let r = 0; r < count; r++) {
    const row: any = {};
    const cells = bodyRows.nth(r).locator("td");
    const cCount = await cells.count();

    for (let c = 0; c < cCount; c++) {
      const header = headers[c] ?? `COL_${c}`;
      let text = (await cells.nth(c).innerText()).trim();

      // Clean multiple spaces and line breaks
      text = text.replace(/\s+/g, " ");

      row[header] = text;
    }

    rows.push(row);
  }

  return { headers, rows };
}

function parsePlayerCell(cell: string): { full_name: string | null; team: string | null; position: string | null } {
  // ESPN often formats like: "Josh Allen BUF • QB"
  // We'll split by the bullet or by last token.
  const parts = cell.split("•").map((s) => s.trim());
  if (parts.length === 2) {
    const nameTeam = parts[0]; // "Josh Allen BUF"
    const pos = parts[1] || null; // "QB"
    const nt = nameTeam.split(" ");
    const team = nt.length ? nt[nt.length - 1] : null;
    const full_name = nt.slice(0, -1).join(" ") || null;
    return { full_name, team, position: pos };
  }
  // Fallback: leave everything null except full name
  return { full_name: cell || null, team: null, position: null };
}

async function extractEspnIdFromRow(page: Page, rowIndex: number): Promise<string | null> {
  // Try to find the anchor link inside the first cell and parse /id/<id>/
  try {
    const table = page.locator("table").first();
    const link = table.locator(`tbody tr:nth-child(${rowIndex + 1}) td a`).first();
    if (await link.count()) {
      const href = await link.getAttribute("href");
      if (href) {
        const m = href.match(/\/id\/(\d+)\//);
        if (m) return m[1];
      }
    }
  } catch {
    // ignore
  }
  return null;
}

function parsePositionId(position: string | null): number | null {
  if (!position) return null;
  const pos = position.toUpperCase();
  if (pos === "QB") return 1;
  if (pos === "RB") return 2;
  if (pos === "WR") return 3;
  if (pos === "TE") return 4;
  if (pos === "K") return 5;
  if (pos === "D/ST") return 16;
  return null;
}

function parseTeamId(team: string | null): number | null {
  // ESPN uses numeric team IDs, but we'll just return null for now
  // This could be enhanced with a team mapping if needed
  return null;
}

function parseNumber(value: string | null): number | null {
  if (!value) return null;
  const cleaned = value.replace(/,/g, "").trim();
  if (cleaned === "" || cleaned === "-") return null;
  const num = Number(cleaned);
  return Number.isFinite(num) ? num : null;
}

(async () => {
  const { season, scoring } = parseArgs();
  const fetched_at = new Date().toISOString();

  const espnToSleeper = await fetchSleeperMap();

  const browser = await chromium.launch({ 
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu'
    ]
  });
  
  const page = await browser.newPage({
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Safari/605.1.15",
    extraHTTPHeaders: {
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Accept-Encoding': 'gzip, deflate, br',
      'DNT': '1',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
    }
  });

  console.log(`Opening ESPN… season=${season}, scoring=${scoring}`);
  await setSeason(page, season);
  await setScoring(page, scoring);

  // Wait longer for the page to fully load and for dynamic content to populate
  console.log("Waiting for page to load...");
  await page.waitForTimeout(5000);
  
  // Debug: Let's see what's actually on the page
  const pageContent = await page.content();
  console.log(`Page title: ${await page.title()}`);
  console.log(`Page URL: ${page.url()}`);
  
  // Look for tables on the page
  const tableCount = await page.locator("table").count();
  console.log(`Found ${tableCount} tables on the page`);
  
  // Try to find any table with player data
  for (let i = 0; i < tableCount; i++) {
    const table = page.locator("table").nth(i);
    const rowCount = await table.locator("tr").count();
    console.log(`Table ${i}: ${rowCount} rows`);
    
    if (rowCount > 1) {
      // This table has data rows
      const firstRow = table.locator("tr").first();
      const firstRowText = await firstRow.innerText();
      console.log(`Table ${i} first row: "${firstRowText}"`);
    }
  }

  // Define positions to scrape
  const positions = ["QB", "RB", "WR", "TE", "K", "D/ST"];
  const allPlayers: any[] = [];

  // Scrape each position tab
  for (const pos of positions) {
    try {
      console.log(`Scraping ${pos} position...`);
      
      // Click the position tab
      await clickPositionTab(page, pos);
      await page.waitForTimeout(1000);

      // Read the table
      const { headers, rows } = await readTableOnce(page);
      console.log(`  Table headers: ${headers.join(', ')}`);
      console.log(`  Found ${rows.length} rows`);
      
      // Process each row
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const playerCell = row[headers[0]] || ""; // First column usually has player info
        
        console.log(`  Row ${i}: Player cell = "${playerCell}"`);
        
        if (playerCell && playerCell.trim()) {
          const { full_name, team, position } = parsePlayerCell(playerCell);
          console.log(`    Parsed: name="${full_name}", team="${team}", pos="${position}"`);
          
          const espn_id = await extractEspnIdFromRow(page, i);
          console.log(`    ESPN ID: ${espn_id}`);
          
          if (espn_id && full_name) {
            // Extract stats from the row
            const stats: Record<string, number> = {};
            let espn_points: number | null = null;
            
            for (const [header, value] of Object.entries(row)) {
              if (header !== headers[0]) { // Skip player name column
                const numValue = parseNumber(value as string);
                if (numValue !== null) {
                  stats[header] = numValue;
                  // Look for points column
                  if (header.toLowerCase().includes("pts") || header.toLowerCase().includes("points")) {
                    espn_points = numValue;
                  }
                }
              }
            }

            console.log(`    Stats: ${JSON.stringify(stats)}`);
            console.log(`    Points: ${espn_points}`);

            allPlayers.push({
              espn_player_id: parseInt(espn_id),
              full_name,
              team,
              position,
              stats,
              espn_points
            });
            
            console.log(`    ✓ Added player: ${full_name} (ID: ${espn_id})`);
          } else {
            console.log(`    ✗ Skipping: missing ESPN ID or name`);
          }
        } else {
          console.log(`    ✗ Skipping: empty player cell`);
        }
      }
      
      console.log(`  Found ${rows.length} ${pos} players, captured ${allPlayers.length} total so far`);
      
    } catch (error) {
      console.warn(`Error scraping ${pos}:`, error);
    }
  }

  await browser.close();

  // Build output rows
  const rows: OutputRow[] = [];
  for (const p of allPlayers) {
    rows.push({
      source: "ESPN",
      season,
      scoring,
      espn_player_id: p.espn_player_id,
      sleeper_id: espnToSleeper[String(p.espn_player_id)] ?? null,
      full_name: p.full_name,
      position_id: parsePositionId(p.position),
      team_id: parseTeamId(p.team),
      stats_json: JSON.stringify(p.stats),
      espn_points: p.espn_points,
      fetched_at,
    });
  }

  // Ensure output dir
  const outDir = path.join("backend-api", "data");
  fs.mkdirSync(outDir, { recursive: true });
  const base = path.join(outDir, `espn_projections_${season}_${scoring}`);

  // Write JSON
  fs.writeFileSync(`${base}.json`, JSON.stringify(rows, null, 2));

  // Write CSV
  const headers = [
    "source","season","scoring","espn_player_id","sleeper_id",
    "full_name","position_id","team_id","stats_json","espn_points","fetched_at"
  ];
  const lines = [
    headers.join(","),
    ...rows.map(r =>
      headers.map(h => {
        const v = (r as any)[h];
        const s = v === null || v === undefined ? "" : String(v);
        return `"${s.replace(/"/g, '""')}"`;
      }).join(",")
    )
  ];
  fs.writeFileSync(`${base}.csv`, lines.join("\n"), "utf8");

  console.log(`Captured ${rows.length} players`);
  console.log(`→ JSON: ${base}.json`);
  console.log(`→ CSV : ${base}.csv`);
})().catch(err => {
  console.error(err);
  process.exit(1);
});
