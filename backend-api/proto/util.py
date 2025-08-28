# util.py
import pandas as pd
import re

VALID_POS = {"QB","RB","WR","TE"}

def normalize_player_name(name: str) -> str:
    """Normalize player names by removing common suffixes for consistent matching."""
    if not isinstance(name, str):
        return ""
    
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

def _norm_name(s: str) -> str:
    """Normalize player names for matching (lowercase, strip punctuation/whitespace)."""
    if not isinstance(s, str):
        return ""
    s = s.lower()
    s = re.sub(r"[^a-z0-9]+", "", s)  # drop spaces, apostrophes, dots, hyphens
    return s

def load_players(csv_path: str) -> pd.DataFrame:
    df = pd.read_csv(csv_path)
    df = df[df['position'].isin(VALID_POS)].copy()
    
    # choose PPG
    if 'ppr_points_per_game' in df and df['ppr_points_per_game'].notna().any():
        df['ppg'] = df['ppr_points_per_game']
    else:
        # fallback: use ppr_points if you have a 'games' column; else just dropna
        df['ppg'] = df['ppr_points_per_game'].fillna(0.0)
    
    # global rank by ADP if present; else by -ppg
    if 'nfc_adp' in df.columns and df['nfc_adp'].notna().any():
        df['global_rank'] = df['nfc_adp'].rank(method='min')
    else:
        df['global_rank'] = (-df['ppg']).rank(method='min')
    
    # stable ordering
    df.sort_values(['position','ppg','global_rank'], ascending=[True,False,True], inplace=True)

    # Handle exp_games_missed column if it exists
    if 'exp_games_missed' in df.columns:
        df['exp_games_missed'] = df['exp_games_missed'].fillna(0)
    else:
        df['exp_games_missed'] = 0

    df.reset_index(drop=True, inplace=True)
    return df

def positional_lists(df: pd.DataFrame) -> dict[str, list[int]]:
    pos_to_ix = {}
    for pos in sorted(df['position'].unique()):
        pos_to_ix[pos] = list(df.index[df['position']==pos])
    return pos_to_ix

def load_adp(adp_csv_path: str) -> pd.DataFrame:
    """Load ADP data with improved name matching."""
    adp = pd.read_csv(adp_csv_path)
    
    # Create multiple name keys for better matching
    adp['name_key'] = adp['Player'].map(_norm_name)
    adp['normalized_name'] = adp['Player'].map(normalize_player_name)
    adp['normalized_name_key'] = adp['normalized_name'].map(_norm_name)
    
    # Keep only necessary columns
    adp = adp[['name_key', 'normalized_name', 'normalized_name_key', 'AVG', 'Player', 'Team']]
    return adp

def load_espn_ranks(espn_csv_path: str) -> pd.DataFrame:
    """
    Load ESPN default board with improved name matching.
    Expected columns: rank (or 'ank'), player_name, position
    Returns a DataFrame with columns: ['espn_rank','player_name','position','name_key','normalized_name','normalized_name_key'].
    """
    espn = pd.read_csv(espn_csv_path)

    # Basic column checks
    required = {'rank','player_name','position'}
    missing = required - set(espn.columns)
    if missing:
        raise ValueError(f"ESPN CSV missing required columns: {missing}")

    espn = espn.copy()
    espn['espn_rank'] = espn['rank'].astype(int)
    espn['player_name'] = espn['player_name'].astype(str)
    espn['position'] = espn['position'].astype(str).str.upper()
    
    # Create multiple name keys for better matching
    espn['name_key'] = espn['player_name'].map(_norm_name)
    espn['normalized_name'] = espn['player_name'].map(normalize_player_name)
    espn['normalized_name_key'] = espn['normalized_name'].map(_norm_name)
    
    espn = espn[['espn_rank','player_name','position','name_key','normalized_name','normalized_name_key']]
    return espn

def attach_espn_ranks_inplace(df_players: pd.DataFrame, espn: pd.DataFrame) -> None:
    """
    Left-merge ESPN ranks into your players df using improved matching strategies.
    Adds/overwrites df_players['espn_rank'].
    """
    players = df_players.copy()
    
    # Create multiple matching keys for players
    players['name_key'] = players['player_name'].map(_norm_name)
    players['normalized_name'] = players['player_name'].map(normalize_player_name)
    players['normalized_name_key'] = players['normalized_name'].map(_norm_name)
    players['position'] = players['position'].astype(str).str.upper()

    # Try multiple matching strategies
    merged = None
    
    # Strategy 1: Try exact name + position match first
    if 'position' in espn.columns:
        merged = players.merge(
            espn[['espn_rank','name_key','position']],
            on=['name_key','position'],
            how='left'
        )
    
    # Strategy 2: If no position column or many unmatched, try normalized name + position
    if merged is None or merged['espn_rank'].isna().sum() > len(players) * 0.3:
        merged = players.merge(
            espn[['espn_rank','normalized_name_key','position']],
            left_on=['normalized_name_key','position'],
            right_on=['normalized_name_key','position'],
            how='left'
        )
    
    # Strategy 3: Fallback to name-only matching
    if merged is None or merged['espn_rank'].isna().sum() > len(players) * 0.5:
        merged = players.merge(
            espn[['espn_rank','name_key']],
            on=['name_key'],
            how='left'
        )
    
    # Strategy 4: Final fallback to normalized name-only matching
    if merged is None or merged['espn_rank'].isna().sum() > len(players) * 0.7:
        merged = players.merge(
            espn[['espn_rank','normalized_name_key']],
            left_on=['normalized_name_key'],
            right_on=['normalized_name_key'],
            how='left'
        )
    
    if merged is not None:
        df_players['espn_rank'] = merged['espn_rank'].values  # set in-place
    
    # Clean up temporary columns
    df_players.drop(columns=[c for c in ['name_key', 'normalized_name', 'normalized_name_key'] if c in df_players.columns], inplace=True, errors='ignore')

def attach_adp_inplace(df_players: pd.DataFrame, adp: pd.DataFrame) -> None:
    """Attach ADP data using improved matching strategies."""
    players = df_players.copy() 
    
    # Create multiple matching keys for players
    players['name_key'] = players['player_name'].map(_norm_name)
    players['normalized_name'] = players['player_name'].map(normalize_player_name)
    players['normalized_name_key'] = players['normalized_name'].map(_norm_name)

    # Try multiple matching strategies
    merged = None
    
    # Strategy 1: Try exact name match first
    merged = players.merge(
        adp[['name_key','AVG']],
        on=['name_key'],
        how='left'
    )
    
    # Strategy 2: If many unmatched, try normalized name matching
    if merged['AVG'].isna().sum() > len(players) * 0.3:
        merged = players.merge(
            adp[['normalized_name_key','AVG']],
            left_on=['normalized_name_key'],
            right_on=['normalized_name_key'],
            how='left'
        )
    
    # Strategy 3: Try team-based matching for remaining unmatched
    if merged['AVG'].isna().sum() > len(players) * 0.5:
        # Create team-based matching
        team_merged = players.merge(
            adp[['normalized_name_key','AVG','Team']],
            left_on=['normalized_name_key'],
            right_on=['normalized_name_key'],
            how='left'
        )
        
        # Only use team matches where team also matches
        team_mask = (team_merged['team'] == team_merged['Team']) & (merged['AVG'].isna())
        merged.loc[team_mask, 'AVG'] = team_merged.loc[team_mask, 'AVG']
    
    if merged is not None:
        df_players['adp'] = merged['AVG'].values  # set in-place
    
    # Clean up temporary columns
    df_players.drop(columns=[c for c in ['name_key', 'normalized_name', 'normalized_name_key'] if c in df_players.columns], inplace=True, errors='ignore')

def report_espn_match_coverage(df_players: pd.DataFrame) -> None:
    """Report ESPN matching coverage with detailed analysis."""
    total = len(df_players)
    matched = df_players['espn_rank'].notna().sum() if 'espn_rank' in df_players else 0
    print(f"[ESPN merge] matched {matched}/{total} players ({matched/total:.1%}).")
    
    if matched < total:
        # Show a few misses to fix manually if needed
        misses = df_players[df_players['espn_rank'].isna()][['player_name','position']].head(15)
        print("[ESPN merge] Example unmatched rows:")
        print(misses.to_string(index=False))
        
        # Show some successful matches for comparison
        matches = df_players[df_players['espn_rank'].notna()][['player_name','position','espn_rank']].head(10)
        print("\n[ESPN merge] Example successful matches:")
        print(matches.to_string(index=False))

def report_adp_match_coverage(df_players: pd.DataFrame) -> None:
    """Report ADP matching coverage with detailed analysis."""
    total = len(df_players)
    matched = df_players['adp'].notna().sum() if 'adp' in df_players else 0
    print(f"[ADP merge] matched {matched}/{total} players ({matched/total:.1%}).")
    
    if matched < total:
        # Show a few misses to fix manually if needed
        misses = df_players[df_players['adp'].isna()][['player_name','position']].head(15)
        print("[ADP merge] Example unmatched rows:")
        print(misses.to_string(index=False))
        
        # Show some successful matches for comparison
        matches = df_players[df_players['adp'].notna()][['player_name','position','adp']].head(10)
        print("\n[ADP merge] Example successful matches:")
        print(matches.to_string(index=False))

def create_player_id_mapping(df_players: pd.DataFrame) -> dict:
    """Create a mapping from player names to player IDs for external linking."""
    mapping = {}
    
    for _, row in df_players.iterrows():
        player_name = row['player_name']
        player_id = row.get('player_id', None)
        team = row.get('team', None)
        position = row.get('position', None)
        
        if player_id:
            # Create multiple keys for flexible matching
            mapping[f"{player_name}_{team}"] = player_id
            mapping[f"{normalize_player_name(player_name)}_{team}"] = player_id
            mapping[f"{_norm_name(player_name)}_{team}"] = player_id
            
            # Also add position-based keys
            if position:
                mapping[f"{player_name}_{team}_{position}"] = player_id
                mapping[f"{normalize_player_name(player_name)}_{team}_{position}"] = player_id
    
    return mapping
