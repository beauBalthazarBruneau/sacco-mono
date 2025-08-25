import * as fs from 'fs';
import * as path from 'path';

interface AdpPlayer {
  PlayerID: string;
  Player: string;
  Team: string;
  Position: string;
  ADP: string;
}

interface StandardizedPlayer {
  player_id: string;
  player_name: string;
  team: string;
  G: string;
  Carries: string;
  RuYds: string;
  RuTD: string;
  Rec: string;
  ReYds: string;
  ReTD: string;
  FumLost: string;
  PYds: string;
  PTD: string;
  INT: string;
  NFC_ADP: string;
}

function loadAdpData(position: string): Map<string, AdpPlayer> {
  const adpFile = path.join(process.cwd(), 'data', `nfc_${position}_adp.csv`);
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

function fixPlayerIds(sourceFile: string, position: string): void {
  console.log(`Fixing player IDs in ${sourceFile}...`);
  
  const adpData = loadAdpData(position);
  const content = fs.readFileSync(sourceFile, 'utf-8');
  const lines = content.split('\n');
  const header = lines[0];
  const dataLines = lines.slice(1);
  
  const fixedLines = [header];
  
  for (const line of dataLines) {
    if (line.trim()) {
      const fields = line.split(',');
      if (fields.length >= 3) {
        const playerName = fields[1].replace(/"/g, '').trim();
        const team = fields[2].trim();
        
        // Create the key for matching
        const key = `${playerName}_${team}`;
        
        // Look up the player in ADP data
        const adpPlayer = adpData.get(key);
        
        if (adpPlayer) {
          // Use the actual PlayerID from ADP data
          fields[0] = adpPlayer.PlayerID;
          console.log(`  Fixed ${playerName} (${team}): ${fields[0]} -> ${adpPlayer.PlayerID}`);
        } else {
          console.log(`  Warning: Could not find ADP data for ${playerName} (${team})`);
          // Keep the existing player_id if no match found
        }
        
        fixedLines.push(fields.join(','));
      } else {
        fixedLines.push(line);
      }
    }
  }
  
  // Write the fixed file
  fs.writeFileSync(sourceFile, fixedLines.join('\n'));
  console.log(`Fixed ${sourceFile}`);
}

function main() {
  const positions = ['qb', 'rb', 'wr', 'te'];
  const sources = ['clay', 'cbs', 'nfl'];
  
  for (const source of sources) {
    for (const position of positions) {
      const sourceFile = path.join(process.cwd(), 'data', `${source}_${position}_projections_standardized.csv`);
      if (fs.existsSync(sourceFile)) {
        fixPlayerIds(sourceFile, position);
      } else {
        console.log(`File not found: ${sourceFile}`);
      }
    }
  }
  
  console.log('Player ID fixing complete!');
}

// Run the script
main(); 