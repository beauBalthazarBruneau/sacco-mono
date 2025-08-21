import * as fs from 'fs';
import * as path from 'path';

interface ProjectionRecord {
  player_id: string;
  player_name: string;
  team: string;
  G: number;
  Carries: number;
  RuYds: number;
  RuTD: number;
  Rec: number;
  ReYds: number;
  ReTD: number;
  FumLost: number;
  PYds: number;
  PTD: number;
  INT: number;
  NFC_ADP: number;
}

interface PlayerProjections {
  player_id: string;
  player_name: string;
  team: string;
  sources: string[];
  projections: {
    G: number[];
    Carries: number[];
    RuYds: number[];
    RuTD: number[];
    Rec: number[];
    ReYds: number[];
    ReTD: number[];
    FumLost: number[];
    PYds: number[];
    PTD: number[];
    INT: number[];
    NFC_ADP: number[];
  };
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"' && (i === 0 || line[i - 1] === ',')) {
      inQuotes = true;
    } else if (char === '"' && inQuotes && (i === line.length - 1 || line[i + 1] === ',')) {
      inQuotes = false;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
}

function loadProjectionFile(filePath: string, source: string): Map<string, ProjectionRecord> {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').filter(line => line.trim());
  const records = new Map<string, ProjectionRecord>();
  
  // Skip header
  for (let i = 1; i < lines.length; i++) {
    const fields = parseCSVLine(lines[i]);
    if (fields.length >= 15) {
      const record: ProjectionRecord = {
        player_id: fields[0].trim(),
        player_name: fields[1].replace(/"/g, '').trim(),
        team: fields[2].trim(),
        G: parseFloat(fields[3]) || 0,
        Carries: parseFloat(fields[4]) || 0,
        RuYds: parseFloat(fields[5]) || 0,
        RuTD: parseFloat(fields[6]) || 0,
        Rec: parseFloat(fields[7]) || 0,
        ReYds: parseFloat(fields[8]) || 0,
        ReTD: parseFloat(fields[9]) || 0,
        FumLost: parseFloat(fields[10]) || 0,
        PYds: parseFloat(fields[11]) || 0,
        PTD: parseFloat(fields[12]) || 0,
        INT: parseFloat(fields[13]) || 0,
        NFC_ADP: parseFloat(fields[14]) || 0
      };
      
      // Use player_id as the key for matching across sources
      records.set(record.player_id, record);
    }
  }
  
  return records;
}

function mergeProjectionsByPosition(position: string) {
  console.log(`\nMerging projections for ${position.toUpperCase()}...`);
  
  const playerProjections = new Map<string, PlayerProjections>();
  
  // Load data from all sources
  const sources = [
    { name: 'clay', path: `raw_player_data/clay_${position}_projections_standardized.csv` },
    { name: 'cbs', path: `raw_player_data/cbs_${position}_projections_standardized.csv` },
    { name: 'nfl', path: `raw_player_data/nfl_${position}_projections_standardized.csv` }
  ];
  
  for (const source of sources) {
    const filePath = path.join(process.cwd(), 'data', source.path);
    console.log(`  Loading ${source.name} data...`);
    
    if (fs.existsSync(filePath)) {
      const records = loadProjectionFile(filePath, source.name);
      
      for (const [playerId, record] of records) {
        if (!playerProjections.has(playerId)) {
          playerProjections.set(playerId, {
            player_id: playerId,
            player_name: record.player_name,
            team: record.team,
            sources: [],
            projections: {
              G: [],
              Carries: [],
              RuYds: [],
              RuTD: [],
              Rec: [],
              ReYds: [],
              ReTD: [],
              FumLost: [],
              PYds: [],
              PTD: [],
              INT: [],
              NFC_ADP: []
            }
          });
        }
        
        const player = playerProjections.get(playerId)!;
        player.sources.push(source.name);
        
        // For games played, only use NFL and Clay data (exclude CBS)
        if (source.name !== 'cbs') {
          player.projections.G.push(record.G);
        }
        
        player.projections.Carries.push(record.Carries);
        player.projections.RuYds.push(record.RuYds);
        player.projections.RuTD.push(record.RuTD);
        player.projections.Rec.push(record.Rec);
        player.projections.ReYds.push(record.ReYds);
        player.projections.ReTD.push(record.ReTD);
        player.projections.FumLost.push(record.FumLost);
        player.projections.PYds.push(record.PYds);
        player.projections.PTD.push(record.PTD);
        player.projections.INT.push(record.INT);
        player.projections.NFC_ADP.push(record.NFC_ADP);
      }
    } else {
      console.log(`  Warning: ${filePath} not found`);
    }
  }
  
  // Calculate averages and generate output
  const outputLines = ['player_id,player_name,team,sources,G,Carries,RuYds,RuTD,Rec,ReYds,ReTD,FumLost,PYds,PTD,INT,NFC_ADP'];
  
  // Sort players by NFC_ADP (ascending, with 0s at the end)
  const sortedPlayers = Array.from(playerProjections.values()).sort((a, b) => {
    const aADP = a.projections.NFC_ADP[0] || 999;
    const bADP = b.projections.NFC_ADP[0] || 999;
    if (aADP === 0 && bADP === 0) return 0;
    if (aADP === 0) return 1;
    if (bADP === 0) return -1;
    return aADP - bADP;
  });
  
  for (const player of sortedPlayers) {
    // Calculate average games played from CBS and Clay data only
    const clayCbsGames = player.projections.G.filter(g => g > 0);
    const avgGames = clayCbsGames.length > 0 ? average(clayCbsGames) : 0;
    
    const avgProjections = {
      G: avgGames,
      Carries: average(player.projections.Carries),
      RuYds: average(player.projections.RuYds),
      RuTD: average(player.projections.RuTD),
      Rec: average(player.projections.Rec),
      ReYds: average(player.projections.ReYds),
      ReTD: average(player.projections.ReTD),
      FumLost: average(player.projections.FumLost),
      PYds: average(player.projections.PYds),
      PTD: average(player.projections.PTD),
      INT: average(player.projections.INT),
      NFC_ADP: player.projections.NFC_ADP[0] || 0
    };
    
    const sourcesStr = player.sources.join('|');
    const line = [
      player.player_id,
      `"${player.player_name}"`,
      player.team,
      sourcesStr,
      formatNumber(avgProjections.G),
      formatNumber(avgProjections.Carries),
      formatNumber(avgProjections.RuYds),
      formatNumber(avgProjections.RuTD),
      formatNumber(avgProjections.Rec),
      formatNumber(avgProjections.ReYds),
      formatNumber(avgProjections.ReTD),
      formatNumber(avgProjections.FumLost),
      formatNumber(avgProjections.PYds),
      formatNumber(avgProjections.PTD),
      formatNumber(avgProjections.INT),
      formatNumber(avgProjections.NFC_ADP)
    ].join(',');
    
    outputLines.push(line);
  }
  
  // Write output file
  const outputPath = path.join(process.cwd(), 'data', `${position}_projections_merged.csv`);
  fs.writeFileSync(outputPath, outputLines.join('\n'));
  
  console.log(`  Generated ${outputPath} with ${sortedPlayers.length} players`);
  console.log(`  Sample players: ${sortedPlayers.slice(0, 3).map(p => p.player_name).join(', ')}`);
}

function average(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  const sum = numbers.reduce((a, b) => a + b, 0);
  return sum / numbers.length;
}

function formatNumber(num: number): string {
  // Round to 1 decimal place, but show integers without decimal
  const rounded = Math.round(num * 10) / 10;
  return rounded % 1 === 0 ? rounded.toString() : rounded.toFixed(1);
}

function main() {
  const positions = ['qb', 'rb', 'wr', 'te'];
  
  console.log('Merging projections by position...');
  
  for (const position of positions) {
    mergeProjectionsByPosition(position);
  }
  
  console.log('\nMerging complete! Generated merged files for all positions.');
}

// Run the script
main();