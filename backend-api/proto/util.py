# util.py
import pandas as pd
import re

VALID_POS = {"QB","RB","WR","TE"}

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
    df['global_rank'] = df['nfc_adp'].rank(method='min') if df['nfc_adp'].notna().any() else (-df['ppg']).rank(method='min')
    # stable ordering

    df.sort_values(['position','ppg','global_rank'], ascending=[True,False,True], inplace=True)

    df['exp_games_missed'] = df['exp_games_missed'].fillna(0)

    df.reset_index(drop=True, inplace=True)
    return df

def positional_lists(df: pd.DataFrame) -> dict[str, list[int]]:
    pos_to_ix = {}
    for pos in sorted(df['position'].unique()):
        pos_to_ix[pos] = list(df.index[df['position']==pos])
    return pos_to_ix

def _norm_name(s: str) -> str:
    """Normalize player names for matching (lowercase, strip punctuation/whitespace)."""
    if not isinstance(s, str):
        return ""
    s = s.lower()
    s = re.sub(r"[^a-z0-9]+", "", s)  # drop spaces, apostrophes, dots, hyphens
    return s

def load_adp(adp_csv_path: str) -> pd.DataFrame:
    adp = pd.read_csv(adp_csv_path)
    adp['name_key'] = adp['Player'].map(_norm_name)
    adp = adp[['name_key','AVG']]
    return adp

def load_espn_ranks(espn_csv_path: str) -> pd.DataFrame:
    """
    Load ESPN default board. Handles the 'ank' header typo by renaming to 'rank'.
    Expected columns: rank (or 'ank'), player_name, position
    Returns a DataFrame with columns: ['espn_rank','player_name','position','name_key'].
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
    espn['name_key'] = espn['player_name'].map(_norm_name)
    espn = espn[['espn_rank','player_name','position','name_key']]
    return espn

def attach_espn_ranks_inplace(df_players: pd.DataFrame, espn: pd.DataFrame) -> None:
    """
    Left-merge ESPN ranks into your players df on (normalized name, position).
    Adds/overwrites df_players['espn_rank'].
    """
    players = df_players.copy()
    players['name_key'] = players['player_name'].map(_norm_name)
    players['position'] = players['position'].astype(str).str.upper()

    merged = players.merge(
        espn[['espn_rank','name_key','position']],
        on=['name_key','position'],
        how='left'
    )
    df_players['espn_rank'] = merged['espn_rank'].values  # set in-place
    df_players.drop(columns=[c for c in ['name_key'] if c in df_players.columns], inplace=True, errors='ignore')

def attach_adp_inplace(df_players: pd.DataFrame, adp: pd.DataFrame) -> None:
    players = df_players.copy() 
    players['name_key'] = players['player_name'].map(_norm_name)


    merged = players.merge(
        adp[['name_key','AVG']],
        on=['name_key'],
        how='left'
    )
    df_players['adp'] = merged['AVG'].values  # set in-place
    df_players.drop(columns=[c for c in ['name_key'] if c in df_players.columns], inplace=True, errors='ignore')

def report_espn_match_coverage(df_players: pd.DataFrame) -> None:
    total = len(df_players)
    matched = df_players['espn_rank'].notna().sum() if 'espn_rank' in df_players else 0
    print(f"[ESPN merge] matched {matched}/{total} players ({matched/total:.1%}).")
    if matched < total:
        # Show a few misses to fix manually if needed
        misses = df_players[df_players['espn_rank'].isna()][['player_name','position']].head(15)
        print("[ESPN merge] Example unmatched rows:")
        print(misses.to_string(index=False))
