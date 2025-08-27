from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional, Any
import pandas as pd
import numpy as np

# Import your existing modules
from models import DraftState, Team, LINEUP
from draft import show_recs, load_players, load_espn_ranks, attach_espn_ranks_inplace
from util import load_adp, attach_adp_inplace
from var import davar_esbn_deficit_weighted, remaining_var_budget_by_pos, accrued_var_by_pos
from demand import _pos_need_multipliers

app = FastAPI(
    title="Fantasy Football Draft API",
    description="API for computing draft recommendations using DAVAR methodology",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure this appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global data loading
print("Loading player data...")
try:
    PLAYER_DF = load_players("data/player_rankings.csv")
    
    # Load and attach ADP data FIRST (before any slicing operations)
    adp = load_adp("data/ppr_adp_new.csv")
    attach_adp_inplace(PLAYER_DF, adp)
    
    # Then load and attach ESPN data
    espn = load_espn_ranks("data/espn_rankings_final.csv")
    attach_espn_ranks_inplace(PLAYER_DF, espn)
    
    print("Data loaded successfully!")
except Exception as e:
    print(f"Warning: Could not load ESPN or ADP data: {e}")
    PLAYER_DF = load_players("data/player_rankings.csv")

# Pydantic models for API requests/responses
class PlayerPick(BaseModel):
    player_name: str
    position: str
    team: Optional[str] = None

class TeamState(BaseModel):
    picks: List[PlayerPick]
    need: Dict[str, int] = LINEUP.copy()
    bench_total: int = 0

class DraftRequest(BaseModel):
    n_teams: int = 12
    rounds: int = 15
    user_team_ix: int = 0
    current_pick: int = 1
    teams: List[TeamState]
    taken_players: List[str]  # List of player names that have been drafted

class Recommendation(BaseModel):
    player_name: str
    position: str
    espn_rank: Optional[int]
    ppg: float
    survival_percent: str
    adp_tag: str
    opportunity_cost: float
    davar_score: float
    player_index: int

class DraftResponse(BaseModel):
    recommendations: List[Recommendation]
    hazards: Dict[str, float]
    expected_drain: Dict[str, float]
    predicted_next_pick: Optional[str]
    top_recommendation: Optional[str]

def convert_team_state_to_team(team_state: TeamState, player_df: pd.DataFrame) -> Team:
    """Convert API TeamState to internal Team model"""
    team = Team()
    team.bench_total = team_state.bench_total
    team.need = team_state.need.copy()
    
    # Convert player names to indices
    for pick in team_state.picks:
        # Find player in dataframe
        matches = player_df[player_df['player_name'].str.lower() == pick.player_name.lower()]
        if not matches.empty:
            player_idx = matches.index[0]
            team.picks.append(player_idx)
            # Update team needs
            team.add_player(pick.position)
    
    return team

def convert_team_to_team_state(team: Team, player_df: pd.DataFrame) -> TeamState:
    """Convert internal Team model to API TeamState"""
    picks = []
    for idx in team.picks:
        player = player_df.loc[idx]
        picks.append(PlayerPick(
            player_name=player['player_name'],
            position=player['position'],
            team=player.get('team', None)
        ))
    
    return TeamState(
        picks=picks,
        need=team.need.copy(),
        bench_total=team.bench_total
    )

@app.get("/")
async def root():
    return {"message": "Fantasy Football Draft API", "status": "running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "players_loaded": len(PLAYER_DF)}

@app.post("/api/draft/recommendations", response_model=DraftResponse)
async def get_draft_recommendations(request: DraftRequest):
    """Get draft recommendations for the current state"""
    try:
        # Convert API request to internal models
        teams = []
        for team_state in request.teams:
            team = convert_team_state_to_team(team_state, PLAYER_DF)
            teams.append(team)
        
        # Create draft state
        draft = DraftState(
            n_teams=request.n_teams,
            rounds=request.rounds,
            user_team_ix=request.user_team_ix,
            current_pick=request.current_pick
        )
        draft.teams = teams
        
        # Convert taken player names to indices
        taken_indices = set()
        for player_name in request.taken_players:
            matches = PLAYER_DF[PLAYER_DF['player_name'].str.lower() == player_name.lower()]
            if not matches.empty:
                taken_indices.add(matches.index[0])
        draft.taken = taken_indices
        
        # Get recommendations using your existing logic
        rows, hazards, E_drain, pred_ix = show_recs(
            PLAYER_DF, draft, topN=20, alpha=0.9, beta=0.6
        )
        
        # Convert hazards from list of dicts to single dict for API
        # hazards is a list like [{player1: prob1}, {player2: prob2}, ...]
        # Convert to single dict: {player1: prob1, player2: prob2, ...}
        api_hazards = {}
        if isinstance(hazards, list):
            for step_hazards in hazards:
                if isinstance(step_hazards, dict):
                    # Convert integer keys to strings for API compatibility
                    for key, value in step_hazards.items():
                        api_hazards[str(key)] = value
        else:
            # Convert integer keys to strings if it's already a dict
            if isinstance(hazards, dict):
                api_hazards = {str(k): v for k, v in hazards.items()}
            else:
                api_hazards = hazards  # fallback
        
        # Convert rows to recommendations
        recommendations = []
        if rows:  # Only process if we have recommendations
            for row in rows:
                if len(row) >= 9:  # Ensure we have all expected fields
                    recommendations.append(Recommendation(
                        player_name=row[0],
                        position=row[1],
                        espn_rank=row[2],
                        ppg=row[3],
                        survival_percent=row[4],
                        adp_tag=row[5],
                        opportunity_cost=row[6],
                        davar_score=row[7],
                        player_index=row[8]
                    ))
        
        # Get predicted next pick
        predicted_next_pick = None
        if pred_ix is not None:
            predicted_next_pick = PLAYER_DF.loc[pred_ix, 'player_name']
        
        # Get top recommendation
        top_recommendation = None
        if recommendations:
            top_rec = recommendations[0]
            top_recommendation = f"{top_rec.player_name} ({top_rec.position}) - DAVAR: {top_rec.davar_score:.2f}"
        
        return DraftResponse(
            recommendations=recommendations,
            hazards=api_hazards,
            expected_drain=E_drain,
            predicted_next_pick=predicted_next_pick,
            top_recommendation=top_recommendation
        )
        
    except Exception as e:
        import traceback
        print(f"Error details: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Error computing recommendations: {str(e)}")

@app.get("/api/players/search")
async def search_players(query: str, limit: int = 10):
    """Search for players by name"""
    try:
        matches = PLAYER_DF[PLAYER_DF['player_name'].str.lower().str.contains(query.lower())]
        results = []
        for idx, row in matches.head(limit).iterrows():
            results.append({
                "player_name": row['player_name'],
                "position": row['position'],
                "team": row.get('team', ''),
                "ppg": float(row['ppg']),
                "adp": row.get('nfc_adp', None),
                "index": int(idx)
            })
        return {"players": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error searching players: {str(e)}")

@app.get("/api/players/{player_name}")
async def get_player(player_name: str):
    """Get detailed information about a specific player"""
    try:
        matches = PLAYER_DF[PLAYER_DF['player_name'].str.lower() == player_name.lower()]
        if matches.empty:
            raise HTTPException(status_code=404, detail="Player not found")
        
        player = matches.iloc[0]
        return {
            "player_name": player['player_name'],
            "position": player['position'],
            "team": player.get('team', ''),
            "ppg": float(player['ppg']),
            "adp": player.get('nfc_adp', None),
            "espn_rank": player.get('espn_rank', None),
            "index": int(player.name)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving player: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
