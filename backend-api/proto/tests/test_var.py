import pandas as pd
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from var import replacement_ppg_by_pos


def test_replacement_ppg_by_pos_basic():
    # Create a tiny player table
    df = pd.DataFrame({
        'player_name': ['A','B','C','D','E','F'],
        'position':    ['RB','RB','WR','WR','QB','TE'],
        'ppg':         [18.0, 12.0, 16.0, 10.0, 20.0, 9.0]
    })
    # Index is 0..5
    pos_lists = {
        'QB': [4],
        'RB': [0,1],
        'WR': [2,3],
        'TE': [5]
    }
    available_ix = [0,1,2,3,4,5]

    # Replacement ranks for 12 teams default lineup QB1,RB2,WR2,TE1,FLEX1/3
    repl_idx_map = {
        'QB': 1,
        'RB': 2,
        'WR': 2,
        'TE': 1
    }

    repl = replacement_ppg_by_pos(df, pos_lists, available_ix, repl_idx_map)
    assert repl['QB'] == 20.0
    assert repl['RB'] == 12.0  # 2nd best RB
    assert repl['WR'] == 10.0  # 2nd best WR
    assert repl['TE'] == 9.0
