# Sacco Draft API

A production-ready FastAPI service that provides AI-powered fantasy football draft recommendations using the DAVAR (Demand-Adjusted Value Above Replacement) methodology. Deployed on Fly.io for high availability and scalability.

## 🚀 **Live API**

Your API is now live and accessible at:
- **Base URL**: `https://sacco-draft-api.fly.dev/`
- **Health Check**: `https://sacco-draft-api.fly.dev/health`
- **Interactive Docs**: `https://sacco-draft-api.fly.dev/docs` (Swagger UI)

## 📊 **API Endpoints**

### 1. **Health Check**
**GET** `/health`

Check if the API is running and get basic stats.

**Response:**
```json
{
  "status": "healthy",
  "players_loaded": 399
}
```

### 2. **API Status**
**GET** `/`

Get basic API information.

**Response:**
```json
{
  "message": "Fantasy Football Draft API",
  "status": "running"
}
```

### 3. **Player Search**
**GET** `/api/players/search?query={name}&limit={n}`

Search for players by name.

**Parameters:**
- `query` (string, required): Player name to search for
- `limit` (integer, optional): Maximum number of results (default: 10)

**Example Request:**
```bash
curl "https://sacco-draft-api.fly.dev/api/players/search?query=Mahomes&limit=3"
```

**Response:**
```json
{
  "players": [
    {
      "player_name": "Patrick Mahomes",
      "position": "QB",
      "team": "KC",
      "ppg": 19.44,
      "adp": 60,
      "index": 6
    }
  ]
}
```

### 4. **Player Details**
**GET** `/api/players/{player_name}`

Get detailed information about a specific player.

**Parameters:**
- `player_name` (path parameter): Exact player name

**Example Request:**
```bash
curl "https://sacco-draft-api.fly.dev/api/players/Patrick%20Mahomes"
```

**Response:**
```json
{
  "player_name": "Patrick Mahomes",
  "position": "QB",
  "team": "KC",
  "ppg": 19.44,
  "adp": 60,
  "espn_rank": 60,
  "index": 6
}
```

### 5. **Draft Recommendations** ⭐ **MAIN FEATURE**
**POST** `/api/draft/recommendations`

Get AI-powered draft recommendations based on current draft state, team needs, and available players.

**Request Body:**
```json
{
  "n_teams": 12,
  "rounds": 15,
  "user_team_ix": 0,
  "current_pick": 1,
  "teams": [
    {
      "picks": [],
      "need": {
        "QB": 1,
        "RB": 2,
        "WR": 2,
        "TE": 1,
        "FLEX": 1
      },
      "bench_total": 8
    }
    // ... repeat for all 12 teams
  ],
  "taken_players": []
}
```

**Request Fields:**
- `n_teams` (integer): Number of teams in the draft (typically 12)
- `rounds` (integer): Total rounds in the draft (typically 15)
- `user_team_ix` (integer): Your team's index (0-based)
- `current_pick` (integer): Current pick number in the draft
- `teams` (array): Array of team objects (must have exactly `n_teams` elements)
  - `picks` (array): Array of player names already drafted by this team
  - `need` (object): Remaining roster needs by position
  - `bench_total` (integer): Total bench slots for this team
- `taken_players` (array): Array of all player names already drafted

**Example Request:**
```bash
curl -X POST "https://sacco-draft-api.fly.dev/api/draft/recommendations" \
  -H "Content-Type: application/json" \
  -d '{
    "n_teams": 12,
    "rounds": 15,
    "user_team_ix": 0,
    "current_pick": 1,
    "teams": [
      {"picks": [], "need": {"QB": 1, "RB": 2, "WR": 2, "TE": 1, "FLEX": 1}, "bench_total": 8},
      {"picks": [], "need": {"QB": 1, "RB": 2, "WR": 2, "TE": 1, "FLEX": 1}, "bench_total": 8},
      {"picks": [], "need": {"QB": 1, "RB": 2, "WR": 2, "TE": 1, "FLEX": 1}, "bench_total": 8},
      {"picks": [], "need": {"QB": 1, "RB": 2, "WR": 2, "TE": 1, "FLEX": 1}, "bench_total": 8},
      {"picks": [], "need": {"QB": 1, "RB": 2, "WR": 2, "TE": 1, "FLEX": 1}, "bench_total": 8},
      {"picks": [], "need": {"QB": 1, "RB": 2, "WR": 2, "TE": 1, "FLEX": 1}, "bench_total": 8},
      {"picks": [], "need": {"QB": 1, "RB": 2, "WR": 2, "TE": 1, "FLEX": 1}, "bench_total": 8},
      {"picks": [], "need": {"QB": 1, "RB": 2, "WR": 2, "TE": 1, "FLEX": 1}, "bench_total": 8},
      {"picks": [], "need": {"QB": 1, "RB": 2, "WR": 2, "TE": 1, "FLEX": 1}, "bench_total": 8},
      {"picks": [], "need": {"QB": 1, "RB": 2, "WR": 2, "TE": 1, "FLEX": 1}, "bench_total": 8},
      {"picks": [], "need": {"QB": 1, "RB": 2, "WR": 2, "TE": 1, "FLEX": 1}, "bench_total": 8},
      {"picks": [], "need": {"QB": 1, "RB": 2, "WR": 2, "TE": 1, "FLEX": 1}, "bench_total": 8}
    ],
    "taken_players": []
  }'
```

**Response:**
```json
{
  "recommendations": [
    {
      "player_name": "Bijan Robinson",
      "position": "RB",
      "espn_rank": 2,
      "ppg": 20.04,
      "survival_percent": "4%",
      "adp_tag": "reach 2",
      "opportunity_cost": -3.74,
      "davar_score": 8.2,
      "player_index": 70
    }
    // ... more recommendations
  ],
  "hazards": {
    "249": 0.018438718696454373,
    "70": 0.01650887088624195,
    "250": 0.008550425860443453
    // ... player risk probabilities
  },
  "expected_drain": {
    "WR": 10.58722662176943,
    "RB": 10.667928468984089,
    "TE": 0.74484490924647
  },
  "predicted_next_pick": "Ja'Marr Chase",
  "top_recommendation": "Bijan Robinson (RB) - DAVAR: 8.20"
}
```

**Response Fields:**
- `recommendations` (array): Array of player recommendations sorted by DAVAR score
  - `player_name` (string): Player's full name
  - `position` (string): Player's position (QB, RB, WR, TE)
  - `espn_rank` (integer): ESPN's ranking of the player
  - `ppg` (float): Points per game projection
  - `survival_percent` (string): Probability player survives to your next pick
  - `adp_tag` (string): ADP analysis (e.g., "reach 2", "value +5", "at ADP")
  - `opportunity_cost` (float): Cost of waiting to draft this position
  - `davar_score` (float): **DAVAR score** - the main recommendation metric
  - `player_index` (integer): Internal player index
- `hazards` (object): Player risk probabilities (keys are string player indices)
- `expected_drain` (object): Expected players taken by position before your next pick
- `predicted_next_pick` (string): Model's prediction for the next pick
- `top_recommendation` (string): Summary of the top recommendation

## 🔧 **Local Development**

### Prerequisites
- Python 3.11+
- pip

### Setup
1. **Clone and navigate to the project:**
```bash
cd /path/to/your/project
```

2. **Create and activate virtual environment:**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies:**
```bash
pip install -r requirements.txt
```

4. **Run locally:**
```bash
python app.py
```

The API will be available at `http://localhost:8000`

### Local Testing
```bash
# Health check
curl http://localhost:8000/health

# Player search
curl "http://localhost:8000/api/players/search?query=Mahomes&limit=3"

# Draft recommendations (use the same JSON payload as above)
curl -X POST "http://localhost:8000/api/draft/recommendations" \
  -H "Content-Type: application/json" \
  -d '{"n_teams":12,"rounds":15,"user_team_ix":0,"current_pick":1,"teams":[...],"taken_players":[]}'
```

## 🚀 **Deployment**

### Fly.io Deployment
The API is automatically deployed to Fly.io. To update:

```bash
# Deploy changes
fly deploy

# Check status
fly status

# View logs
fly logs
```

### Environment Variables
- `PORT`: Server port (default: 8000)
- All other configuration is handled in `fly.toml`

## 📈 **Understanding DAVAR Scores**

The **DAVAR (Demand-Adjusted Value Above Replacement)** score is the core metric:

- **Higher scores** = Better picks
- **Positive scores** = Value above replacement
- **Negative scores** = Below replacement level
- **Factors considered**:
  - Player PPG projections
  - Position scarcity
  - Team needs
  - Opportunity cost of waiting
  - Player survival probability

## 🎯 **Usage Examples**

### 1. **First Pick of the Draft**
```json
{
  "n_teams": 12,
  "rounds": 15,
  "user_team_ix": 0,
  "current_pick": 1,
  "teams": [/* 12 empty teams */],
  "taken_players": []
}
```

### 2. **Mid-Draft with Some Players Taken**
```json
{
  "n_teams": 12,
  "rounds": 15,
  "user_team_ix": 5,
  "current_pick": 48,
  "teams": [
    {"picks": ["Christian McCaffrey", "Tyreek Hill"], "need": {"QB": 1, "RB": 1, "WR": 1, "TE": 1, "FLEX": 1}, "bench_total": 8},
    // ... other teams
  ],
  "taken_players": ["Christian McCaffrey", "Tyreek Hill", "Travis Kelce", "Saquon Barkley"]
}
```

### 3. **Late Draft with Specific Team Needs**
```json
{
  "n_teams": 12,
  "rounds": 15,
  "user_team_ix": 0,
  "current_pick": 120,
  "teams": [
    {"picks": ["QB1", "RB1", "RB2", "WR1", "WR2", "TE1"], "need": {"QB": 0, "RB": 0, "WR": 0, "TE": 0, "FLEX": 0}, "bench_total": 8},
    // ... other teams
  ],
  "taken_players": [/* all drafted players */]
}
```

## 🔍 **Troubleshooting**

### Common Issues

1. **"list index out of range"**
   - Ensure you provide exactly `n_teams` team objects
   - All teams must have the same structure

2. **"KeyError: 'adp'"**
   - This was fixed in the latest deployment
   - If you see this, redeploy with `fly deploy`

3. **Validation errors**
   - Check that all required fields are present
   - Ensure data types match the schema (integers vs strings)

### Getting Help

- **Check logs**: `fly logs`
- **Health check**: `GET /health`
- **API docs**: `GET /docs` (Swagger UI)

## 📚 **Data Sources**

The API uses these data files:
- `data/player_rankings.csv` - Player projections and rankings
- `data/espn_rankings_final.csv` - ESPN default board rankings
- `data/ppr_adp_new.csv` - Average Draft Position data

## 🏆 **Success!**

Your Fantasy Football Draft API is now:
- ✅ **Live and accessible** at `https://sacco-draft-api.fly.dev/`
- ✅ **Fully functional** with all endpoints working
- ✅ **Production-ready** with proper error handling
- ✅ **Scalable** on Fly.io infrastructure
- ✅ **Well-documented** with comprehensive examples

Start building your draft tools and applications! 🏈
