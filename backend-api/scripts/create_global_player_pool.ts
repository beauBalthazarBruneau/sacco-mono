import * as fs from 'fs';
import * as path from 'path';

interface PlayerRecord {
  player_id: string;
  player_name: string;
  team: string;
  sources: string;
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
  pos: string;
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

function loadPositionFile(position: string): PlayerRecord[] {
  const filePath = path.join(process.cwd(), 'data', `${position}_projections_merged.csv`);
  
  if (!fs.existsSync(filePath)) {
    console.log(`  Warning: ${filePath} not found`);
    return [];
  }
  
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').filter(line => line.trim());
  const records: PlayerRecord[] = [];
  
  // Skip header
  for (let i = 1; i < lines.length; i++) {
    const fields = parseCSVLine(lines[i]);
    if (fields.length >= 16) {
      const record: PlayerRecord = {
        player_id: fields[0].trim(),
        player_name: fields[1].replace(/"/g, '').trim(),
        team: fields[2].trim(),
        sources: fields[3].trim(),
        G: parseFloat(fields[4]) || 0,
        Carries: parseFloat(fields[5]) || 0,
        RuYds: parseFloat(fields[6]) || 0,
        RuTD: parseFloat(fields[7]) || 0,
        Rec: parseFloat(fields[8]) || 0,
        ReYds: parseFloat(fields[9]) || 0,
        ReTD: parseFloat(fields[10]) || 0,
        FumLost: parseFloat(fields[11]) || 0,
        PYds: parseFloat(fields[12]) || 0,
        PTD: parseFloat(fields[13]) || 0,
        INT: parseFloat(fields[14]) || 0,
        NFC_ADP: parseFloat(fields[15]) || 0,
        pos: position
      };
      
      records.push(record);
    }
  }
  
  return records;
}

function formatNumber(num: number): string {
  // Round to 1 decimal place, but show integers without decimal
  const rounded = Math.round(num * 10) / 10;
  return rounded % 1 === 0 ? rounded.toString() : rounded.toFixed(1);
}

function createGlobalPlayerPool(): void {
  console.log('Creating global player pool...\n');
  
  const positions = ['qb', 'rb', 'wr', 'te'];
  const allPlayers: PlayerRecord[] = [];
  
  for (const position of positions) {
    console.log(`Loading ${position.toUpperCase()} players...`);
    const players = loadPositionFile(position);
    allPlayers.push(...players);
    console.log(`  Added ${players.length} players`);
  }
  
  // Sort by NFC_ADP (ascending, with 0s at the end)
  allPlayers.sort((a, b) => {
    const aADP = a.NFC_ADP || 999;
    const bADP = b.NFC_ADP || 999;
    if (aADP === 0 && bADP === 0) return 0;
    if (aADP === 0) return 1;
    if (bADP === 0) return -1;
    return aADP - bADP;
  });
  
  // Generate output
  const outputLines = ['player_id,player_name,team,pos,sources,G,Carries,RuYds,RuTD,Rec,ReYds,ReTD,FumLost,PYds,PTD,INT,NFC_ADP'];
  
  for (const player of allPlayers) {
    const line = [
      player.player_id,
      `"${player.player_name}"`,
      player.team,
      player.pos,
      player.sources,
      formatNumber(player.G),
      formatNumber(player.Carries),
      formatNumber(player.RuYds),
      formatNumber(player.RuTD),
      formatNumber(player.Rec),
      formatNumber(player.ReYds),
      formatNumber(player.ReTD),
      formatNumber(player.FumLost),
      formatNumber(player.PYds),
      formatNumber(player.PTD),
      formatNumber(player.INT),
      formatNumber(player.NFC_ADP)
    ].join(',');
    
    outputLines.push(line);
  }
  
  // Write output file
  const outputPath = path.join(process.cwd(), 'data', 'global_player_pool.csv');
  fs.writeFileSync(outputPath, outputLines.join('\n'));
  
  console.log(`\nGenerated ${outputPath} with ${allPlayers.length} total players`);
  
  // Show position breakdown
  const positionCounts = positions.reduce((acc, pos) => {
    acc[pos] = allPlayers.filter(p => p.pos === pos).length;
    return acc;
  }, {} as Record<string, number>);
  
  console.log('Position breakdown:');
  for (const [pos, count] of Object.entries(positionCounts)) {
    console.log(`  ${pos.toUpperCase()}: ${count} players`);
  }
  
  // Show top 10 players by ADP
  const top10 = allPlayers.filter(p => p.NFC_ADP > 0).slice(0, 10);
  console.log('\nTop 10 players by ADP:');
  for (const player of top10) {
    console.log(`  ${player.NFC_ADP.toFixed(1)} - ${player.player_name} (${player.pos.toUpperCase()}) - ${player.team}`);
  }
}

function main(): void {
  createGlobalPlayerPool();
}

// Run the script
main();