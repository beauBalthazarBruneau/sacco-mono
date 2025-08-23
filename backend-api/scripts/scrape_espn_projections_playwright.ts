// Run with:
//   npx tsx backend-api/scripts/scrape_espn_projections_playwright.ts --season 2025 --scoring ppr
//
// Outputs:
//   /tmp/espn_projections_<season>_<scoring>.json
//   /tmp/espn_projections_<season>_<scoring>.csv
//
// Notes:
// - Uses Playwright (headless Chromium) to render the ESPN projections table.
// - Scrapes all positions (QB/RB/WR/TE/K/DST) and paginates "Next" until done.
// - Extracts ESPN player id from the player link URL (…/id/<id>/…).
// - Joins Sleeper by espn_id → sleeper_id to align with your player spine.

import { chromium } from "playwright";
import fetch from "node-fetch";
import * as fs from "fs";

type Scoring = "standard" | "ppr" | "half";

// ESPN site uses a query string param seasonId to change season.
// Scoring is reflected in the columns, but not always by a simple param.
// We'll set scoring by clicking the scoring selector if present; otherwise we still scrape.
const POSITIONS = ["QB", "RB", "WR", "TE", "K", "D/ST"] as const;

type Row = Record<string, string | number | null>;

type OutputRow = {
  source: "ESPN";
  season: number;
  scoring: Scoring;
  position_tab: string; // UI position tab we scraped (QB/RB/WR/TE/K/DST)
  espn_player_id: string | null;
  sleeper_id: string | null;
  full_name: string | null;
  team: string | null;
  position: string | null;
  // Raw column map from the table (already normalized to numbers where possible):
  columns: Record<string, number | string | null>;
  espn_points: number | null; // if there is a "PTS" column we parse it here too
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
  const url = "https://api.sleeper.app/v1/players/nfl";
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`Sleeper fetch failed: ${resp.status}`);
  const data = (await resp.json()) as Record<
    string,
    { player_id: string; espn_id?: string | number }
  >;
  const byEspn: Record<string, string> = {};
  for (const p of Object.values(data)) {
    if (p.espn_id != null) byEspn[String(p.espn_id)] = p.player_id;
  }
  return byEspn;
}

function toNumberOrNull(s: string | null | undefined): number | null {
  if (s == null) return null;
  const trimmed = s.replace(/,/g, "").trim();
  if (trimmed === "" || trimmed === "-") return null;
  const n = Number(trimmed);
  return Number.isFinite(n) ? n : null;
}

async function setSeason(page: any, season: number) {
  // The page supports seasonId param; navigate with it first.
  const base = "https://fantasy.espn.com/football/players/projections";
  const url = `${base}?seasonId=${season}`;
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60_000 });

  // If the page has a season dropdown, try to set it (best effort, selectors can shift):
  try {
    // Look for a season selector; ESPN often uses a select or a labelled button.
    const seasonSel = page.locator('select, [role="combobox"]', { hasText: String(season) });
    if (await seasonSel.count()) {
      await seasonSel.selectOption(String(season)).catch(() => {});
      await page.waitForTimeout(500);
    }
  } catch (_) {}
}

async function setScoring(page: any, scoring: Scoring) {
  // Best-effort: sometimes there's a scoring dropdown: Standard / PPR / Half PPR
  // We'll try to find and click it. If not found, we still scrape.
  try {
    const label = scoring === "ppr" ? "PPR" : scoring === "half" ? "Half PPR" : "Standard";
    const scoringButton = page.locator('button:has-text("Scoring")');
    if (await scoringButton.count()) {
      await scoringButton.click();
      const opt = page.locator(`role=menuitem[name="${label}"]`);
      if (await opt.count()) {
        await opt.click();
        await page.waitForTimeout(500);
      }
    } else {
      // alternative: buttons or tabs labelled directly
      const direct = page.locator(`text="${label}"`);
      if (await direct.count()) {
        await direct.first().click();
        await page.waitForTimeout(500);
      }
    }
  } catch (_) {}
}

async function clickPositionTab(page: any, pos: string) {
  // Click the position filter tab (e.g., QB, RB, WR, TE, K, D/ST)
  // Tabs are often rendered as buttons or anchor-like controls.
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
}

async function readTableOnce(page: any): Promise<{ headers: string[]; rows: Row[] }> {
  // Find the main projections table
  const table = page.locator("table");
  await table.first().waitFor({ state: "visible", timeout: 20_000 });

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
  const rows: Row[] = [];

  for (let r = 0; r < count; r++) {
    const row: Row = {};
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

async function extractEspnIdFromRow(page: any, rowIndex: number): Promise<string | null> {
  // Try to find the anchor link inside the first cell and parse /id/<id>/
  const table = page.locator("table").first();
  const link = table.locator(`tbody tr:nth-child(${rowIndex + 1}) td a`).first();
  if (await link.count()) {
    const href = await link.getAttribute("href");
    if (href) {
      const m = href.match(/\/id\/(\d+)\//);
      if (m) return m[1];
    }
  }
  return null;
}

async function paginateAndCollect(page: any): Promise<{ headers: string[]; rows: Row[]; espnIds: (string | null)[] }> {
  const allRows: Row[] = [];
  const allEspnIds: (string | null)[] = [];
  let headers: string[] = [];

  // Loop pages until "Next" disabled/absent
  // Heuristics: a Next button or chevron; try common selectors
  while (true) {
    const { headers: h, rows } = await readTableOnce(page);
    if (!headers.length) headers = h;

    // collect espn ids alongside rows
    for (let i = 0; i < rows.length; i++) {
      const id = await extractEspnIdFromRow(page, i);
      allEspnIds.push(id);
    }
    allRows.push(...rows);

    // Try to click "Next" (may be "Next 50", chevron, or disabled at end)
    const nextButton = page.locator('button:has-text("Next")');
    const next50 = page.locator('button:has-text("Next 50")');
    const chevron = page.locator('button[aria-label*="Next"]');

    let clicked = false;
    for (const cand of [next50, nextButton, chevron]) {
      if (await cand.count()) {
        const disabled = await cand.isDisabled().catch(() => false);
        if (!disabled) {
          await cand.click();
          await page.waitForTimeout(800);
          clicked = true;
          break;
        }
      }
    }
    if (!clicked) break; // no more pages
  }

  return { headers, rows: allRows, espnIds: allEspnIds };
}

function coerceColumns(headers: string[], row: Row): { map: Record<string, number | string | null>; espnPoints: number | null } {
  const map: Record<string, number | string | null> = {};
  let pts: number | null = null;

  for (const h of headers) {
    const val = (row[h] as string) ?? "";
    // Some columns are numeric like "YDS", "TD", "REC", "FUM", "PTS"
    const numeric = toNumberOrNull(val);
    if (h.toUpperCase().includes("PTS")) {
      pts = numeric;
    }
    // Keep numbers where possible, else preserve original string
    map[h] = numeric ?? (val === "" ? null : val);
  }
  return { map, espnPoints: pts };
}

function toCSV(rows: OutputRow[], outPath: string) {
  const baseHeaders = [
    "source", "season", "scoring", "position_tab",
    "espn_player_id", "sleeper_id", "full_name", "team", "position",
    "espn_points", "fetched_at"
  ];

  // Collect all distinct column keys from `.columns`
  const extraCols = Array.from(new Set(rows.flatMap(r => Object.keys(r.columns)))).sort();

  const headers = [...baseHeaders, ...extraCols];
  const lines = [
    headers.join(","),
    ...rows.map(r => {
      const base = [
        r.source, r.season, r.scoring, r.position_tab,
        r.espn_player_id ?? "", r.sleeper_id ?? "", r.full_name ?? "", r.team ?? "", r.position ?? "",
        r.espn_points ?? "", r.fetched_at
      ].map(v => `"${String(v).replace(/"/g, '""')}"`);

      const extras = extraCols.map(k => {
        const v = r.columns[k];
        return `"${(v == null ? "" : String(v)).replace(/"/g, '""')}"`;
      });

      return [...base, ...extras].join(",");
    })
  ];

  fs.writeFileSync(outPath, lines.join("\n"), "utf8");
}

(async () => {
  const { season, scoring } = parseArgs();
  const fetched_at = new Date().toISOString();
  console.log(`Scraping ESPN projections (season=${season}, scoring=${scoring}) via headless browser...`);

  const espnToSleeper = await fetchSleeperMap();

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Safari/605.1.15",
  });

  await setSeason(page, season);
  await setScoring(page, scoring);

  const outRows: OutputRow[] = [];

  for (const pos of POSITIONS) {
    console.log(`→ Position: ${pos}`);
    await clickPositionTab(page, pos);

    const { headers, rows, espnIds } = await paginateAndCollect(page);
    if (!rows.length) {
      console.warn(`(no rows found for ${pos})`);
      continue;
    }

    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      const espnId = espnIds[i] ?? null;

      // Heuristic: first column is usually the Player cell.
      const firstHeader = headers[0] ?? "PLAYER";
      const playerCell = (r[firstHeader] as string) ?? "";
      const { full_name, team, position } = parsePlayerCell(playerCell);

      const { map: colMap, espnPoints } = coerceColumns(headers, r);

      outRows.push({
        source: "ESPN",
        season,
        scoring,
        position_tab: pos,
        espn_player_id: espnId,
        sleeper_id: espnId ? espnToSleeper[espnId] ?? null : null,
        full_name,
        team,
        position,
        columns: colMap,
        espn_points: espnPoints,
        fetched_at,
      });
    }
  }

  await browser.close();

  // Write outputs
  const base = `/tmp/espn_projections_${season}_${scoring}`;
  fs.writeFileSync(`${base}.json`, JSON.stringify(outRows, null, 2));
  toCSV(outRows, `${base}.csv`);

  console.log(`Wrote ${outRows.length} rows`);
  console.log(`→ JSON: ${base}.json`);
  console.log(`→ CSV : ${base}.csv`);
})().catch(err => {
  console.error(err);
  process.exit(1);
});
