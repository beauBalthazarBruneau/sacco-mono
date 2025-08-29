import pandas as pd
from backend_api.proto.demand import survival_probs, expected_position_drain_from_hazards


def test_survival_probs_simple():
    # hazards for two upcoming picks
    hazards = [
        {1: 0.3, 2: 0.1},  # first pick
        {1: 0.5}           # second pick
    ]
    surv = survival_probs(hazards, [1, 2, 3])
    assert round(surv[1], 4) == round((1-0.3) * (1-0.5), 4)  # 0.7 * 0.5 = 0.35
    assert round(surv[2], 4) == round((1-0.1) * 1.0, 4)      # 0.9
    assert surv[3] == 1.0


def test_expected_position_drain_from_hazards():
    # Build a small DF mapping indices to positions
    df = pd.DataFrame({
        'position': ['QB', 'RB', 'WR', 'TE']
    }, index=[1, 2, 3, 4])

    hazards = [
        {1: 0.2, 2: 0.3},  # QB, RB
        {3: 0.4}           # WR
    ]

    from backend_api.proto.demand import expected_position_drain_from_hazards
    E = expected_position_drain_from_hazards(hazards, df)
    assert round(E['QB'], 3) == 0.2
    assert round(E['RB'], 3) == 0.3
    assert round(E['WR'], 3) == 0.4
    assert E.get('TE', 0.0) == 0.0
