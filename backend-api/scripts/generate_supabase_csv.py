#!/usr/bin/env python3
"""
Fantasy Football Data CSV Generator for Supabase

This script reads the global_player_pool.csv file and generates a CSV that matches
the format expected by the Supabase player_rankings table.

Usage:
    python generate_supabase_csv.py

Output:
    - supabase_player_rankings.csv (ready for import to Supabase)
"""

import csv
import os
import re
from pathlib import Path
from typing import Dict, List, Tuple
from datetime import datetime

def normalize_player_name(name: str) -> str:
    """Normalize player names by removing common suffixes for consistent matching."""
    # Remove quotes and trim
    normalized = name.replace('"', '').strip()
    
    # Remove common suffixes (case insensitive)
    suffixes = [
        r' Jr\.?$',
        r' Sr\.?$',
        r' II$',
        r' III$',
        r' IV$',
        r' V$',
        r' VI$',
        r' VII$',
        r' VIII$',
        r' IX$',
        r' X$'
    ]
    
    for suffix in suffixes:
        normalized = re.sub(suffix, '', normalized, flags=re.IGNORECASE)
    
    return normalized.strip()

def load_exp_games_missed_mapping() -> Dict[str, int]:
    """Load the exp_games_missed mapping from the existing player_rankings.csv file."""
    mapping = {}
    
    # Try to load from proto/data/player_rankings.csv first
    proto_file = Path(__file__).parent.parent / 'proto' / 'data' / 'player_rankings.csv'
    
    if proto_file.exists():
        try:
            with open(proto_file, 'r', encoding='utf-8') as file:
                lines = file.read().strip().split('\n')
                
                # Skip header line
                for line in lines[1:]:
                    if line.strip():
                        values = line.split(',')
                        if len(values) >= 12:  # Ensure we have the exp_games_missed column
                            player_name = values[0].replace('"', '').strip()
                            team = values[2].replace('"', '').strip()
                            exp_games_missed = int(values[11]) if values[11] else 0
                            
                            # Create a key using player name and team
                            key = f"{player_name}_{team}"
                            mapping[key] = exp_games_missed
                            
                            # Also create a normalized key for matching
                            normalized_name = normalize_player_name(player_name)
                            normalized_key = f"{normalized_name}_{team}"
                            mapping[normalized_key] = exp_games_missed
                            
            print(f"✅ Loaded {len(mapping)} exp_games_missed mappings from {proto_file}")
        except Exception as e:
            print(f"⚠️  Warning: Could not load exp_games_missed data: {e}")
    
    return mapping

def calculate_ppr_points(player_data: Dict[str, float]) -> float:
    """Calculate PPR fantasy points for a player."""
    points = 0.0
    
    # Passing points (4 pts per TD, 1 pt per 25 yards, -2 pts per INT)
    points += (player_data['PTD'] * 4) + (player_data['PYds'] / 25) - (player_data['INT'] * 2)
    
    # Rushing points (6 pts per TD, 1 pt per 10 yards)
    points += (player_data['RuTD'] * 6) + (player_data['RuYds'] / 10)
    
    # Receiving points (6 pts per TD, 1 pt per 10 yards, 1 pt per reception)
    points += (player_data['ReTD'] * 6) + (player_data['ReYds'] / 10) + player_data['Rec']
    
    # Fumble points (-2 pts per fumble lost)
    points -= (player_data['FumLost'] * 2)
    
    return round(points, 2)

def calculate_standard_points(player_data: Dict[str, float]) -> float:
    """Calculate standard fantasy points for a player."""
    points = 0.0
    
    # Passing points (4 pts per TD, 1 pt per 25 yards, -2 pts per INT)
    points += (player_data['PTD'] * 4) + (player_data['PYds'] / 25) - (player_data['INT'] * 2)
    
    # Rushing points (6 pts per TD, 1 pt per 10 yards)
    points += (player_data['RuTD'] * 6) + (player_data['RuYds'] / 10)
    
    # Receiving points (6 pts per TD, 1 pt per 10 yards, NO PPR)
    points += (player_data['ReTD'] * 6) + (player_data['ReYds'] / 10)
    
    # Fumble points (-2 pts per fumble lost)
    points -= (player_data['FumLost'] * 2)
    
    return round(points, 2)

def calculate_half_ppr_points(player_data: Dict[str, float]) -> float:
    """Calculate half-PPR fantasy points for a player."""
    points = 0.0
    
    # Passing points (4 pts per TD, 1 pt per 25 yards, -2 pts per INT)
    points += (player_data['PTD'] * 4) + (player_data['PYds'] / 25) - (player_data['INT'] * 2)
    
    # Rushing points (6 pts per TD, 1 pt per 10 yards)
    points += (player_data['RuTD'] * 6) + (player_data['RuYds'] / 10)
    
    # Receiving points (6 pts per TD, 1 pt per 10 yards, 0.5 pt per reception)
    points += (player_data['ReTD'] * 6) + (player_data['ReYds'] / 10) + (player_data['Rec'] * 0.5)
    
    # Fumble points (-2 pts per fumble lost)
    points -= (player_data['FumLost'] * 2)
    
    return round(points, 2)

def parse_csv_line(line: str) -> List[str]:
    """Parse a CSV line handling quoted values properly."""
    parsed_values = []
    current_value = ""
    in_quotes = False
    
    for char in line:
        if char == '"':
            in_quotes = not in_quotes
        elif char == ',' and not in_quotes:
            parsed_values.append(current_value.strip())
            current_value = ""
        else:
            current_value += char
    
    parsed_values.append(current_value.strip())
    return parsed_values

def read_global_player_pool(csv_path: str) -> List[Dict[str, any]]:
    """Read and parse the global player pool CSV file."""
    players = []
    
    with open(csv_path, 'r', encoding='utf-8') as file:
        lines = file.read().strip().split('\n')
        
        # Skip header line
        for i, line in enumerate(lines[1:], 1):
            try:
                values = parse_csv_line(line)
                
                if len(values) >= 17:  # Ensure we have all expected columns
                    player = {
                        'player_id': values[0].replace('"', ''),
                        'player_name': values[1].replace('"', ''),
                        'team': values[2].replace('"', ''),
                        'pos': values[3].replace('"', ''),
                        'sources': values[4].replace('"', ''),
                        'G': float(values[5]) if values[5] else 0,
                        'Carries': float(values[6]) if values[6] else 0,
                        'RuYds': float(values[7]) if values[7] else 0,
                        'RuTD': float(values[8]) if values[8] else 0,
                        'Rec': float(values[9]) if values[9] else 0,
                        'ReYds': float(values[10]) if values[10] else 0,
                        'ReTD': float(values[11]) if values[11] else 0,
                        'FumLost': float(values[12]) if values[12] else 0,
                        'PYds': float(values[13]) if values[13] else 0,
                        'PTD': float(values[14]) if values[14] else 0,
                        'INT': float(values[15]) if values[15] else 0,
                        'NFC_ADP': float(values[16]) if values[16] else 0
                    }
                    players.append(player)
                else:
                    print(f"Warning: Line {i+1} has insufficient columns ({len(values)}), skipping")
                    
            except Exception as e:
                print(f"Error parsing line {i+1}: {e}")
                continue
    
    return players

def generate_supabase_csv(players: List[Dict[str, any]], output_path: str, exp_games_missed_mapping: Dict[str, int]):
    """Generate CSV file matching Supabase player_rankings table format."""
    
    # Define the columns for the Supabase table - now with player_id as first column and exp_games_missed as last
    fieldnames = [
        'player_id',
        'player_name',
        'position', 
        'team',
        'adp',
        'ppr_points',
        'standard_points',
        'half_ppr_points',
        'ppr_points_per_game',
        'standard_points_per_game',
        'half_ppr_points_per_game',
        'last_updated',
        'exp_games_missed'
    ]
    
    with open(output_path, 'w', newline='', encoding='utf-8') as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        
        for player in players:
            # Calculate fantasy points
            ppr_total = calculate_ppr_points(player)
            standard_total = calculate_standard_points(player)
            half_ppr_total = calculate_half_ppr_points(player)
            
            # Calculate fantasy points per game
            games = player['G']
            ppr_per_game = round(ppr_total / games, 2) if games > 0 else 0
            standard_per_game = round(standard_total / games, 2) if games > 0 else 0
            half_ppr_per_game = round(half_ppr_total / games, 2) if games > 0 else 0
            
            # Get exp_games_missed value
            player_name = player['player_name']
            team = player['team']
            
            # Try to find exp_games_missed using multiple keys
            exp_games_missed = 0
            keys_to_try = [
                f"{player_name}_{team}",
                f"{normalize_player_name(player_name)}_{team}"
            ]
            
            for key in keys_to_try:
                if key in exp_games_missed_mapping:
                    exp_games_missed = exp_games_missed_mapping[key]
                    break
            
            # Create row for Supabase - now including player_id and exp_games_missed
            row = {
                'player_id': player['player_id'],
                'player_name': player['player_name'],
                'position': player['pos'].upper(),
                'team': player['team'],
                'adp': player['NFC_ADP'],
                'ppr_points': ppr_total,
                'standard_points': standard_total,
                'half_ppr_points': half_ppr_total,
                'ppr_points_per_game': ppr_per_game,
                'standard_points_per_game': standard_per_game,
                'half_ppr_points_per_game': half_ppr_per_game,
                'last_updated': datetime.now().strftime('%Y-%m-%dT%H:%M:%SZ'),  # Current timestamp
                'exp_games_missed': exp_games_missed
            }
            
            writer.writerow(row)
    
    print(f"✅ Generated Supabase CSV: {output_path}")

def main():
    """Main function to process the CSV files."""
    
    # Define file paths
    script_dir = Path(__file__).parent
    data_dir = script_dir.parent / 'data'
    input_file = data_dir / 'global_player_pool.csv'
    output_file = data_dir / 'supabase_player_rankings.csv'
    
    # Check if input file exists
    if not input_file.exists():
        print(f"❌ Input file not found: {input_file}")
        print("Please ensure global_player_pool.csv exists in the data directory")
        return
    
    print(f"📖 Reading input file: {input_file}")
    
    try:
        # Load exp_games_missed mapping
        exp_games_missed_mapping = load_exp_games_missed_mapping()
        
        # Read and parse the global player pool
        players = read_global_player_pool(str(input_file))
        print(f"✅ Parsed {len(players)} players from CSV")
        
        # Show sample calculations
        print("\n📊 Sample Fantasy Points Per Game Calculations:")
        for i, player in enumerate(players[:5]):
            ppr_total = calculate_ppr_points(player)
            ppr_per_game = round(ppr_total / player['G'], 2) if player['G'] > 0 else 0
            print(f"  {player['player_name']} ({player['pos']}): {ppr_total:.1f} total PPR / {player['G']} games = {ppr_per_game:.2f} PPR per game")
        
        # Generate the Supabase CSV
        print(f"\n📝 Generating Supabase CSV: {output_file}")
        generate_supabase_csv(players, str(output_file), exp_games_missed_mapping)
        
        print(f"\n🎉 Success! Generated {len(players)} player records")
        print(f"📁 Output file: {output_file}")
        print("\n💡 Next steps:")
        print("  1. Review the generated CSV file")
        print("  2. Import to Supabase using the upload script or dashboard")
        print("  3. Verify data integrity in your database")
        
    except Exception as e:
        print(f"❌ Error processing CSV: {e}")
        return

if __name__ == "__main__":
    main() 