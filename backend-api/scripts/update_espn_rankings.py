#!/usr/bin/env python3
"""
ESPN Rankings CSV Formatter

This script updates the espn_rankings.csv file to:
1. Convert from tab-separated to comma-separated format
2. Ensure all player names match exactly with global_player_pool.csv
3. Add proper CSV headers and formatting

Usage:
    python update_espn_rankings.py

Output:
    - Updated espn_rankings.csv with proper CSV formatting
"""

import csv
import os
from pathlib import Path
from typing import Dict, List, Set

def read_global_player_pool(csv_path: str) -> Set[str]:
    """Read the global player pool and extract all player names for cross-referencing."""
    player_names = set()
    
    with open(csv_path, 'r', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        for row in reader:
            # Remove quotes and clean the name
            player_name = row['player_name'].replace('"', '').strip()
            player_names.add(player_name)
    
    return player_names

def read_espn_rankings(tsv_path: str) -> List[Dict[str, str]]:
    """Read the ESPN rankings TSV file."""
    rankings = []
    
    with open(tsv_path, 'r', encoding='utf-8') as file:
        # Read as TSV (tab-separated)
        reader = csv.reader(file, delimiter='\t')
        
        # Skip header if it exists
        header = next(reader, None)
        if header and len(header) >= 3:
            # If header exists, use it
            for row in reader:
                if len(row) >= 3:
                    rankings.append({
                        'rank': row[0].strip(),
                        'player': row[1].strip(),
                        'position': row[2].strip()
                    })
        else:
            # No header, assume first row is data
            file.seek(0)  # Reset file pointer
            reader = csv.reader(file, delimiter='\t')
            for row in reader:
                if len(row) >= 3:
                    rankings.append({
                        'rank': row[0].strip(),
                        'player': row[1].strip(),
                        'position': row[2].strip()
                    })
    
    return rankings

def find_name_matches(player_name: str, global_names: Set[str]) -> List[str]:
    """Find potential name matches in the global player pool."""
    matches = []
    player_lower = player_name.lower()
    
    for global_name in global_names:
        global_lower = global_name.lower()
        
        # Exact match
        if player_lower == global_lower:
            matches.append(global_name)
        # Contains match (for partial matches)
        elif player_lower in global_lower or global_lower in player_lower:
            matches.append(global_name)
    
    return matches

def update_espn_rankings(rankings: List[Dict[str, str]], global_names: Set[str], output_path: str):
    """Update ESPN rankings with proper CSV formatting and name validation."""
    
    # CSV field names
    fieldnames = ['rank', 'player_name', 'position', 'name_match_found', 'suggested_name']
    
    with open(output_path, 'w', newline='', encoding='utf-8') as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        
        for ranking in rankings:
            player_name = ranking['player']
            position = ranking['position']
            rank = ranking['rank']
            
            # Check if name exists in global player pool
            name_matches = find_name_matches(player_name, global_names)
            name_match_found = "YES" if name_matches else "NO"
            
            # Get suggested name (first match or original if no matches)
            suggested_name = name_matches[0] if name_matches else player_name
            
            row = {
                'rank': rank,
                'player_name': player_name,
                'position': position,
                'name_match_found': name_match_found,
                'suggested_name': suggested_name
            }
            
            writer.writerow(row)
    
    print(f"✅ Updated ESPN rankings CSV: {output_path}")

def generate_final_csv(rankings: List[Dict[str, str]], global_names: Set[str], output_path: str):
    """Generate the final, clean CSV with corrected names."""
    
    # CSV field names for final output
    fieldnames = ['rank', 'player_name', 'position']
    
    with open(output_path, 'w', newline='', encoding='utf-8') as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        
        for ranking in rankings:
            player_name = ranking['player']
            position = ranking['position']
            rank = ranking['rank']
            
            # Find the best name match
            name_matches = find_name_matches(player_name, global_names)
            
            # Use the matched name if found, otherwise keep original
            final_name = name_matches[0] if name_matches else player_name
            
            row = {
                'rank': rank,
                'player_name': final_name,
                'position': position
            }
            
            writer.writerow(row)
    
    print(f"✅ Generated final ESPN rankings CSV: {output_path}")

def main():
    """Main function to process the ESPN rankings file."""
    
    # Define file paths
    script_dir = Path(__file__).parent
    data_dir = script_dir.parent / 'data'
    proto_dir = script_dir.parent / 'proto' / 'data'
    
    global_player_pool_file = data_dir / 'global_player_pool.csv'
    espn_rankings_file = proto_dir / 'espn_rankings.csv'
    
    # Check if input files exist
    if not global_player_pool_file.exists():
        print(f"❌ Global player pool file not found: {global_player_pool_file}")
        return
    
    if not espn_rankings_file.exists():
        print(f"❌ ESPN rankings file not found: {espn_rankings_file}")
        return
    
    print(f"📖 Reading global player pool: {global_player_pool_file}")
    global_names = read_global_player_pool(str(global_player_pool_file))
    print(f"✅ Found {len(global_names)} unique player names in global pool")
    
    print(f"📖 Reading ESPN rankings: {espn_rankings_file}")
    rankings = read_espn_rankings(str(espn_rankings_file))
    print(f"✅ Found {len(rankings)} rankings")
    
    # Generate analysis CSV with name matching
    analysis_output = proto_dir / 'espn_rankings_analysis.csv'
    print(f"\n📊 Generating name matching analysis: {analysis_output}")
    update_espn_rankings(rankings, global_names, str(analysis_output))
    
    # Generate final, clean CSV
    final_output = proto_dir / 'espn_rankings_final.csv'
    print(f"📝 Generating final, clean CSV: {final_output}")
    generate_final_csv(rankings, global_names, str(final_output))
    
    # Show summary of name matching
    print(f"\n📈 Name Matching Summary:")
    exact_matches = 0
    partial_matches = 0
    no_matches = 0
    
    for ranking in rankings:
        player_name = ranking['player']
        name_matches = find_name_matches(player_name, global_names)
        
        if len(name_matches) == 1 and name_matches[0].lower() == player_name.lower():
            exact_matches += 1
        elif name_matches:
            partial_matches += 1
        else:
            no_matches += 1
    
    print(f"  ✅ Exact matches: {exact_matches}")
    print(f"  🔍 Partial matches: {partial_matches}")
    print(f"  ❌ No matches: {no_matches}")
    
    print(f"\n💡 Next steps:")
    print(f"  1. Review {analysis_output} for name matching details")
    print(f"  2. Use {final_output} as your clean ESPN rankings")
    print(f"  3. Verify all names match your global player pool")

if __name__ == "__main__":
    main() 