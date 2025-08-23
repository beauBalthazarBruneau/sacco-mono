import * as fs from 'fs';
import * as path from 'path';

interface AdpPlayer {
  PlayerID: string;
  Player: string;
  Team: string;
  Position: string;
  ADP: string;
}

function loadAdpData(position: string): Map<string, AdpPlayer> {
  const adpFile = path.join(process.cwd(), 'data', 'raw_player_data', `nfc_${position}_adp.csv`);
  const content = fs.readFileSync(adpFile, 'utf-8');
  const lines = content.split('\n').slice(1); // Skip header
  
  const playerMap = new Map<string, AdpPlayer>();
  
  for (const line of lines) {
    if (line.trim()) {
      const [Rank, PlayerID, Player, Team, Position, ADP, MinPick, MaxPick, Difference, NumPicks, TeamPick] = line.split(',');
      if (PlayerID && Player && Team) {
        // Create a key using player name and team for matching
        const key = `${Player.replace(/"/g, '')}_${Team}`;
        playerMap.set(key, {
          PlayerID: PlayerID.trim(),
          Player: Player.replace(/"/g, '').trim(),
          Team: Team.trim(),
          Position: Position.trim(),
          ADP: ADP.trim()
        });
      }
    }
  }
  return playerMap;
}

function createClayStandardized(position: string): void {
  console.log(`Creating standardized Clay ${position.toUpperCase()} projections...`);
  const adpData = loadAdpData(position);
  const sourceFile = path.join(process.cwd(), 'data', 'raw_player_data', `clay_${position}_projections.csv`);
  const outputFile = path.join(process.cwd(), 'data', 'raw_player_data', `clay_${position}_projections_standardized.csv`);
  
  if (!fs.existsSync(sourceFile)) {
    console.log(`  Source file not found: ${sourceFile}`);
    return;
  }
  
  const content = fs.readFileSync(sourceFile, 'utf-8');
  const lines = content.split('\n').filter(line => line.trim());
  const header = lines[0];
  const headers = header.split(',').map(h => h.trim());
  
  console.log(`  Clay ${position} headers: ${headers.join(', ')}`);
  
  const outputLines = ['player_id,player_name,team,G,Carries,RuYds,RuTD,Rec,ReYds,ReTD,FumLost,PYds,PTD,INT,NFC_ADP'];
  
  for (let i = 1; i < lines.length; i++) {
    const fields = lines[i].split(',').map(f => f.trim());
    if (fields.length >= headers.length) {
      let playerName = fields[headers.indexOf(position === 'qb' ? 'Quarterback' : position === 'rb' ? 'Running Back' : position === 'wr' ? 'Wide Receiver' : 'Tight End')].replace(/"/g, '');
      let team = fields[headers.indexOf('Team')];
      
      const key = `${playerName}_${team}`;
      const adpPlayer = adpData.get(key);
      
      if (adpPlayer) {
        let g = parseInt(fields[headers.indexOf('G')]) || 0;
        let carries = parseInt(fields[headers.indexOf('Carry')]) || 0;
        let ruYds = parseInt(fields[headers.indexOf('RuYds')]) || 0;
        let ruTD = parseInt(fields[headers.indexOf('RuTD')]) || 0;
        let rec = 0;
        let reYds = 0;
        let reTD = 0;
        let fumLost = 0; // Default to 0 for Clay data
        let pYds = 0;
        let pTD = 0;
        let int = 0;
        
        if (position === 'qb') {
          pYds = parseInt(fields[headers.indexOf('PYds')]) || 0;
          pTD = parseInt(fields[headers.indexOf('PTD')]) || 0;
          int = parseInt(fields[headers.indexOf('INT')]) || 0;
          // QBs don't receive, so rec stats stay 0
        } else {
          // For RB/WR/TE, get receiving stats
          rec = parseInt(fields[headers.indexOf('Rec')]) || 0;
          reYds = parseInt(fields[headers.indexOf('ReYd')]) || 0;
          reTD = parseInt(fields[headers.indexOf('ReTD')]) || 0;
          // Non-QBs don't pass, so passing stats stay 0
        }
        
        const nfcAdp = parseFloat(adpPlayer.ADP) || 0;
        const line = [
          adpPlayer.PlayerID,
          `"${playerName}"`,
          team,
          g,
          carries,
          ruYds,
          ruTD,
          rec,
          reYds,
          reTD,
          fumLost,
          pYds,
          pTD,
          int,
          nfcAdp
        ].join(',');
        outputLines.push(line);
      } else {
        console.log(`  Warning: Could not find ADP data for ${playerName} (${team})`);
      }
    }
  }
  
  fs.writeFileSync(outputFile, outputLines.join('\n'));
  console.log(`  Generated ${outputFile} with ${outputLines.length - 1} players`);
}

function createCbsStandardized(position: string): void {
  console.log(`Creating standardized CBS ${position.toUpperCase()} projections...`);
  const adpData = loadAdpData(position);
  const sourceFile = path.join(process.cwd(), 'data', 'raw_player_data', `cbs_${position}_projections.csv`);
  const outputFile = path.join(process.cwd(), 'data', 'raw_player_data', `cbs_${position}_projections_standardized.csv`);
  
  if (!fs.existsSync(sourceFile)) {
    console.log(`  Source file not found: ${sourceFile}`);
    return;
  }
  
  const content = fs.readFileSync(sourceFile, 'utf-8');
  const lines = content.split('\n').filter(line => line.trim());
  const header = lines[0];
  const headers = header.split(',').map(h => h.trim());
  
  console.log(`  CBS ${position} headers: ${headers.join(', ')}`);
  
  const outputLines = ['player_id,player_name,team,G,Carries,RuYds,RuTD,Rec,ReYds,ReTD,FumLost,PYds,PTD,INT,NFC_ADP'];
  
  for (let i = 1; i < lines.length; i++) {
    const fields = lines[i].split(',').map(f => f.trim());
    if (fields.length >= headers.length) {
      let playerName = fields[headers.indexOf('PLAYER')].replace(/"/g, '');
      let team = fields[headers.indexOf('TEAM')];
      
      const key = `${playerName}_${team}`;
      const adpPlayer = adpData.get(key);
      
      if (adpPlayer) {
        let g = parseInt(fields[headers.indexOf('GP')]) || 0;
        let carries = 0;
        let ruYds = 0;
        let ruTD = 0;
        let rec = 0;
        let reYds = 0;
        let reTD = 0;
        let fumLost = parseInt(fields[headers.indexOf('FL')]) || 0;
        let pYds = 0;
        let pTD = 0;
        let int = 0;
        
        if (position === 'qb') {
          carries = parseInt(fields[headers.indexOf('RuATT')]) || 0;
          ruYds = parseInt(fields[headers.indexOf('RuYDS')]) || 0;
          ruTD = parseInt(fields[headers.indexOf('RuTD')]) || 0;
          pYds = parseInt(fields[headers.indexOf('PYDS')]) || 0;
          pTD = parseInt(fields[headers.indexOf('PTD')]) || 0;
          int = parseInt(fields[headers.indexOf('INT')]) || 0;
          // QBs don't receive, so rec stats stay 0
        } else if (position === 'rb') {
          carries = parseInt(fields[headers.indexOf('RuATT')]) || 0;
          ruYds = parseInt(fields[headers.indexOf('RuYDS')]) || 0;
          ruTD = parseInt(fields[headers.indexOf('RuTD')]) || 0;
          rec = parseInt(fields[headers.indexOf('REC')]) || 0;
          reYds = parseInt(fields[headers.indexOf('ReYDS')]) || 0;
          reTD = parseInt(fields[headers.indexOf('ReTD')]) || 0;
          // Non-QBs don't pass, so passing stats stay 0
        } else if (position === 'wr') {
          // WRs don't rush much, so rushing stats stay 0
          rec = parseInt(fields[headers.indexOf('REC')]) || 0;
          reYds = parseInt(fields[headers.indexOf('ReYDS')]) || 0;
          reTD = parseInt(fields[headers.indexOf('ReTD')]) || 0;
          // Non-QBs don't pass, so passing stats stay 0
        } else if (position === 'te') {
          // TEs don't rush much, so rushing stats stay 0
          rec = parseInt(fields[headers.indexOf('REC')]) || 0;
          reYds = parseInt(fields[headers.indexOf('ReYDS')]) || 0;
          reTD = parseInt(fields[headers.indexOf('ReTD')]) || 0;
          // Non-QBs don't pass, so passing stats stay 0
        }
        
        const nfcAdp = parseFloat(adpPlayer.ADP) || 0;
        const line = [
          adpPlayer.PlayerID,
          `"${playerName}"`,
          team,
          g,
          carries,
          ruYds,
          ruTD,
          rec,
          reYds,
          reTD,
          fumLost,
          pYds,
          pTD,
          int,
          nfcAdp
        ].join(',');
        outputLines.push(line);
      } else {
        console.log(`  Warning: Could not find ADP data for ${playerName} (${team})`);
      }
    }
  }
  
  fs.writeFileSync(outputFile, outputLines.join('\n'));
  console.log(`  Generated ${outputFile} with ${outputLines.length - 1} players`);
}

function createNflStandardized(position: string): void {
  console.log(`Creating standardized NFL ${position.toUpperCase()} projections...`);
  const adpData = loadAdpData(position);
  const sourceFile = path.join(process.cwd(), 'data', 'raw_player_data', `nfl_${position}_projections.csv`);
  const outputFile = path.join(process.cwd(), 'data', 'raw_player_data', `nfl_${position}_projections_standardized.csv`);
  
  if (!fs.existsSync(sourceFile)) {
    console.log(`  Source file not found: ${sourceFile}`);
    return;
  }
  
  const content = fs.readFileSync(sourceFile, 'utf-8');
  const lines = content.split('\n').filter(line => line.trim());
  const header = lines[0];
  const headers = header.split(',').map(h => h.trim());
  
  console.log(`  NFL ${position} headers: ${headers.join(', ')}`);
  
  const outputLines = ['player_id,player_name,team,G,Carries,RuYds,RuTD,Rec,ReYds,ReTD,FumLost,PYds,PTD,INT,NFC_ADP'];
  
  for (let i = 1; i < lines.length; i++) {
    const fields = lines[i].split(',').map(f => f.trim());
    if (fields.length >= headers.length) {
      let playerName = fields[headers.indexOf('Player')].replace(/"/g, '');
      let team = fields[headers.indexOf('Team')];
      
      const key = `${playerName}_${team}`;
      const adpPlayer = adpData.get(key);
      
      if (adpPlayer) {
        let g = parseInt(fields[headers.indexOf('GP')]) || 0;
        let carries = 0; // NFL doesn't have carries column
        let ruYds = parseInt(fields[headers.indexOf('RuYds')]) || 0;
        let ruTD = parseInt(fields[headers.indexOf('RuTD')]) || 0;
        let rec = parseInt(fields[headers.indexOf('Rec')]) || 0;
        let reYds = parseInt(fields[headers.indexOf('ReYds')]) || 0;
        let reTD = parseInt(fields[headers.indexOf('ReTD')]) || 0;
        let fumLost = parseInt(fields[headers.indexOf('FumLost')]) || 0;
        let pYds = parseInt(fields[headers.indexOf('PYds')]) || 0;
        let pTD = parseInt(fields[headers.indexOf('PTD')]) || 0;
        let int = parseInt(fields[headers.indexOf('Int')]) || 0;
        
        const nfcAdp = parseFloat(adpPlayer.ADP) || 0;
        const line = [
          adpPlayer.PlayerID,
          `"${playerName}"`,
          team,
          g,
          carries,
          ruYds,
          ruTD,
          rec,
          reYds,
          reTD,
          fumLost,
          pYds,
          pTD,
          int,
          nfcAdp
        ].join(',');
        outputLines.push(line);
      } else {
        console.log(`  Warning: Could not find ADP data for ${playerName} (${team})`);
      }
    }
  }
  
  fs.writeFileSync(outputFile, outputLines.join('\n'));
  console.log(`  Generated ${outputFile} with ${outputLines.length - 1} players`);
}

function main(): void {
  console.log('Creating standardized projection files...\n');
  
  const positions = ['qb', 'rb', 'wr', 'te'];
  
  for (const position of positions) {
    console.log(`Processing ${position.toUpperCase()} position...`);
    createClayStandardized(position);
    createCbsStandardized(position);
    createNflStandardized(position);
    console.log('');
  }
  
  console.log('Standardization complete!');
}

main(); 