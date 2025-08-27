#!/usr/bin/env python3
"""
Test script for the Fantasy Football Draft API
Run this after starting the API locally to test the endpoints
"""

import requests
import json

BASE_URL = "http://localhost:8000"

def test_health():
    """Test the health endpoint"""
    print("Testing health endpoint...")
    response = requests.get(f"{BASE_URL}/health")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    print()

def test_search_players():
    """Test player search"""
    print("Testing player search...")
    response = requests.get(f"{BASE_URL}/api/players/search", params={"query": "Mahomes", "limit": 5})
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    print()

def test_get_player():
    """Test getting a specific player"""
    print("Testing get player...")
    response = requests.get(f"{BASE_URL}/api/players/Patrick Mahomes")
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    print()

def test_draft_recommendations():
    """Test draft recommendations"""
    print("Testing draft recommendations...")
    
    # Create a sample draft state
    draft_request = {
        "n_teams": 12,
        "rounds": 15,
        "user_team_ix": 0,
        "current_pick": 1,
        "teams": [
            {
                "picks": [],
                "need": {"QB": 1, "RB": 2, "WR": 2, "TE": 1, "FLEX": 1},
                "bench_total": 8
            }
        ] * 12,  # 12 teams
        "taken_players": []
    }
    
    response = requests.post(
        f"{BASE_URL}/api/draft/recommendations",
        json=draft_request,
        headers={"Content-Type": "application/json"}
    )
    
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"Top 3 recommendations:")
        for i, rec in enumerate(data["recommendations"][:3]):
            print(f"  {i+1}. {rec['player_name']} ({rec['position']}) - DAVAR: {rec['davar_score']:.2f}")
        print(f"Expected drain: {data['expected_drain']}")
    else:
        print(f"Error: {response.text}")
    print()

def main():
    """Run all tests"""
    print("=== Fantasy Football Draft API Test ===\n")
    
    try:
        test_health()
        test_search_players()
        test_get_player()
        test_draft_recommendations()
        
        print("All tests completed!")
        
    except requests.exceptions.ConnectionError:
        print("Error: Could not connect to the API. Make sure it's running on localhost:8000")
        print("Start the API with: python app.py")
    except Exception as e:
        print(f"Error during testing: {e}")

if __name__ == "__main__":
    main()
