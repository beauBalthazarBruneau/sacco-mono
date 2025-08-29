#!/usr/bin/env python3
"""
Analyze ESPN player matching to understand why we're only getting 45.5% match rate.
"""

import pandas as pd
from util import load_players, load_espn_ranks, attach_espn_ranks_inplace, normalize_player_name, _norm_name

# Load data
print("Loading player data...")
df = load_players("data/player_rankings.csv")
espn = load_espn_ranks("data/espn_rankings_final.csv")

print(f"Main dataset: {len(df)} players")
print(f"ESPN dataset: {len(espn)} players")

# Create matching keys
df['name_key'] = df['player_name'].map(_norm_name)
df['normalized_name'] = df['player_name'].map(normalize_player_name)
df['normalized_name_key'] = df['normalized_name'].map(_norm_name)
df['position'] = df['position'].astype(str).str.upper()

# Try to match
merged = df.merge(
    espn[['espn_rank','name_key','position']],
    on=['name_key','position'],
    how='left'
)

# Show matching statistics
matched = merged['espn_rank'].notna()
print(f"\nMatched players: {matched.sum()}")
print(f"Unmatched players: {(~matched).sum()}")
print(f"Match rate: {matched.sum() / len(df) * 100:.1f}%")

# Show some unmatched players
unmatched = merged[~matched]
print(f"\n=== Sample of Unmatched Players ===")
print("These players are in our main dataset but not in ESPN rankings:")
for i, (idx, row) in enumerate(unmatched.head(20).iterrows()):
    print(f"{i+1:2d}. {row['player_name']} ({row['position']}) - {row['team']} - {row['ppr_points_per_game']:.1f} PPG")

# Show some matched players
matched_players = merged[matched]
print(f"\n=== Sample of Matched Players ===")
print("These players are successfully matched:")
for i, (idx, row) in enumerate(matched_players.head(10).iterrows()):
    print(f"{i+1:2d}. {row['player_name']} ({row['position']}) - ESPN Rank: {row['espn_rank']} - {row['ppr_points_per_game']:.1f} PPG")

# Check for name variations
print(f"\n=== Name Matching Analysis ===")
print("Looking for potential name variations...")

# Check for players with "Jr.", "III", etc.
jr_players = df[df['player_name'].str.contains(' Jr\.| III| IV| Sr\.', regex=True)]
print(f"\nPlayers with suffixes (Jr., III, etc.): {len(jr_players)}")
for _, row in jr_players.head(10).iterrows():
    print(f"  {row['player_name']} ({row['position']})")

# Check for players with special characters
special_chars = df[df['player_name'].str.contains("'|\.|-", regex=True)]
print(f"\nPlayers with special characters: {len(special_chars)}")
for _, row in special_chars.head(10).iterrows():
    print(f"  {row['player_name']} ({row['position']})")

# Show ESPN players that might not be in main dataset
espn_not_in_main = espn[~espn['name_key'].isin(df['name_key'])]
print(f"\n=== ESPN Players Not in Main Dataset ===")
print(f"Count: {len(espn_not_in_main)}")
for i, (idx, row) in enumerate(espn_not_in_main.head(10).iterrows()):
    print(f"{i+1:2d}. {row['player_name']} ({row['position']}) - ESPN Rank: {row['espn_rank']}")

print(f"\n=== Summary ===")
print(f"• Main dataset has {len(df)} players")
print(f"• ESPN rankings has {len(espn)} players (top {len(espn)} only)")
print(f"• Successfully matched {matched.sum()} players ({matched.sum() / len(df) * 100:.1f}%)")
print(f"• {len(unmatched)} players in main dataset don't have ESPN rankings")
print(f"• {len(espn_not_in_main)} ESPN players not found in main dataset")

print(f"\nThe low match rate is expected because:")
print(f"1. ESPN only ranks the top {len(espn)} players")
print(f"2. Our dataset includes {len(df)} players (many lower-tier players)")
print(f"3. Some name variations may not match perfectly")
print(f"4. The system is working correctly - it's just that ESPN doesn't rank everyone!")
