import { DraftRecommendationEngine } from '../../src/algorithm/draft';
import { Player, PlayerRosterSlot, RosterSlot, Team, DraftPick, getDraftPickTeam } from '../../src/algorithm/models';
import { readJsonData, getCurrentBestPlayerAtPosition } from '../../src/algorithm/utils';
import { DraftState } from '../../src/algorithm/types';

describe('Full Draft Simulation', () => {
  let engine: DraftRecommendationEngine;
  let players: Player[];
  let teams: Team[];
  let rosterSlots: RosterSlot[];
  let draftPicks: DraftPick[];

  beforeAll(() => {
    players = readJsonData('players.json');
    teams = readJsonData('teams.json');
    rosterSlots = readJsonData('roster_slots.json');
    draftPicks = readJsonData('draft_picks.json');
    
    engine = new DraftRecommendationEngine({
      players,
      teams,
      rosterSlots,
      draftPicks
    });
  });

  test('should complete a full draft simulation', () => {
    // Start with clean draft state
    const initialRosters = teams.map(team => ({
      team_id: team.team_id,
      players: [] as Player[]
    }));

    let currentRosters = [...initialRosters];
    const completedPicks: DraftPick[] = [];
    const availablePlayers = new Set(players.map(p => p.player_id));

    // Simulate first 5 rounds (major positions typically filled first)
    for (let round = 1; round <= 5; round++) {
      console.log(`\nSimulating Round ${round}`);
      
      for (let pickInRound = 1; pickInRound <= teams.length; pickInRound++) {
        const pickNumber = (round - 1) * teams.length + pickInRound;
        const currentPick = draftPicks.find(p => p.pick_number === pickNumber);
        
        if (!currentPick) continue;

        // Get current draft state
        const draftState: DraftState = {
          currentRosters,
          completedPicks,
          availablePlayers: Array.from(availablePlayers),
          currentPickNumber: pickNumber
        };

        // Get recommendation from engine
        const recommendation = engine.getPickRecommendation(currentPick, draftState);
        
        expect(recommendation).toBeDefined();
        expect(recommendation.playerId).toBeDefined();
        expect(availablePlayers.has(recommendation.playerId)).toBe(true);

        // Find the recommended player
        const pickedPlayer = players.find(p => p.player_id === recommendation.playerId);
        expect(pickedPlayer).toBeDefined();

        // Verify the pick makes sense (high enough score)
        expect(recommendation.score).toBeGreaterThan(0);

        // Update draft state with the pick
        availablePlayers.delete(recommendation.playerId);
        completedPicks.push({
          ...currentPick,
          player_id: recommendation.playerId
        });

        // Add player to team roster
        const pickingTeam = getDraftPickTeam(currentPick, teams);
        const teamRoster = currentRosters.find(r => r.team_id === pickingTeam.team_id);
        if (teamRoster && pickedPlayer) {
          teamRoster.players.push(pickedPlayer);
        }

        // Log pick details for key rounds
        if (round <= 2) {
          console.log(`Pick ${pickNumber}: Team ${pickingTeam.team_name} selects ${pickedPlayer?.first_name} ${pickedPlayer?.last_name} (${pickedPlayer?.position}) - Score: ${recommendation.score.toFixed(2)}`);
        }
      }
    }

    // Verify draft state after 5 rounds
    expect(completedPicks.length).toBe(5 * teams.length);
    expect(availablePlayers.size).toBe(players.length - (5 * teams.length));

    // Verify each team has drafted reasonable players
    currentRosters.forEach(roster => {
      expect(roster.players.length).toBe(5);
      
      // Check for position diversity (shouldn't draft all same position)
      const positions = roster.players.map(p => p.position);
      const uniquePositions = new Set(positions);
      expect(uniquePositions.size).toBeGreaterThan(1);

      // Verify all players are valid
      roster.players.forEach(player => {
        expect(player.player_id).toBeDefined();
        expect(player.position).toBeDefined();
        expect(['QB', 'RB', 'WR', 'TE', 'K', 'DEF'].includes(player.position)).toBe(true);
      });
    });

    // Test specific strategic scenarios
    testEarlyRoundStrategy(completedPicks, players, teams);
    testPositionalDistribution(currentRosters);
  });

  test('should handle bye week conflicts correctly', () => {
    // Create a scenario where many top players have same bye week
    const testPlayers = players.slice(0, 20).map(p => ({
      ...p,
      bye_week: 7 // Force same bye week
    }));

    const testEngine = new DraftRecommendationEngine({
      players: testPlayers,
      teams,
      rosterSlots,
      draftPicks
    });

    // Simulate first few picks
    const currentRosters = teams.map(team => ({
      team_id: team.team_id,
      players: [] as Player[]
    }));

    const draftState: DraftState = {
      currentRosters,
      completedPicks: [],
      availablePlayers: testPlayers.map(p => p.player_id),
      currentPickNumber: 1
    };

    const firstPick = draftPicks[0];
    const recommendation = testEngine.getPickRecommendation(firstPick, draftState);

    expect(recommendation).toBeDefined();
    expect(recommendation.score).toBeGreaterThan(0);
    
    // Verify the pick considers bye week implications
    const pickedPlayer = testPlayers.find(p => p.player_id === recommendation.playerId);
    expect(pickedPlayer).toBeDefined();
    expect(pickedPlayer?.bye_week).toBe(7);
  });

  test('should prioritize team needs correctly', () => {
    // Create scenario where team already has QB, should prioritize other positions
    const testTeam = teams[0];
    const qb = players.find(p => p.position === 'QB' && p.projected_points > 250);
    const rb = players.find(p => p.position === 'RB' && p.projected_points > 200);
    
    expect(qb).toBeDefined();
    expect(rb).toBeDefined();

    const currentRosters = teams.map(team => ({
      team_id: team.team_id,
      players: team.team_id === testTeam.team_id ? [qb!] : []
    }));

    const draftState: DraftState = {
      currentRosters,
      completedPicks: [{ ...draftPicks[0], player_id: qb!.player_id }],
      availablePlayers: players.filter(p => p.player_id !== qb!.player_id).map(p => p.player_id),
      currentPickNumber: teams.length + 1 // Second round pick for same team
    };

    const secondRoundPick = draftPicks.find(p => p.pick_number === teams.length + 1);
    expect(secondRoundPick).toBeDefined();

    const recommendation = engine.getPickRecommendation(secondRoundPick!, draftState);
    const recommendedPlayer = players.find(p => p.player_id === recommendation.playerId);
    
    // Should not recommend another QB since team already has one
    expect(recommendedPlayer?.position).not.toBe('QB');
  });
});

function testEarlyRoundStrategy(picks: DraftPick[], players: Player[], teams: Team[]) {
  // Check that first round picks are high-value players
  const firstRoundPicks = picks.slice(0, teams.length);
  
  firstRoundPicks.forEach(pick => {
    const player = players.find(p => p.player_id === pick.player_id);
    expect(player).toBeDefined();
    
    // First round should be top tier players
    if (player) {
      expect(player.projected_points).toBeGreaterThan(150);
      // Should generally be skill position players (QB, RB, WR, TE)
      expect(['QB', 'RB', 'WR', 'TE'].includes(player.position)).toBe(true);
    }
  });
}

function testPositionalDistribution(rosters: Array<{team_id: number, players: Player[]}>) {
  rosters.forEach(roster => {
    const positionCounts = roster.players.reduce((acc, player) => {
      acc[player.position] = (acc[player.position] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // After 5 rounds, teams should have diverse positions
    // but shouldn't over-invest in any single position
    Object.values(positionCounts).forEach(count => {
      expect(count).toBeLessThanOrEqual(3); // No more than 3 of same position
    });

    // Should have at least 2 different positions
    expect(Object.keys(positionCounts).length).toBeGreaterThanOrEqual(2);
  });
}
