/**
 * Integration tests for the recommendation engine
 * Tests the full pipeline from players -> recommendations
 */

import { describe, test, expect } from '@jest/globals';
import { 
  generateRecommendations,
  createPlayersMap,
  createSampleDraftState,
  formatRecommendationSummary,
  applyDraftPick,
  validatePick
} from '../algorithm/draft';
import { DraftState } from '../algorithm/models';

// Sample player data for testing
const samplePlayerData = [
  { index: 1, playerName: 'Josh Allen', position: 'QB', team: 'BUF', ppg: 22.4, adp: 24.3 },
  { index: 2, playerName: 'Lamar Jackson', position: 'QB', team: 'BAL', ppg: 22.2, adp: 23.5 },
  { index: 3, playerName: 'Bijan Robinson', position: 'RB', team: 'ATL', ppg: 20.0, adp: 2.6 },
  { index: 4, playerName: 'Saquon Barkley', position: 'RB', team: 'PHI', ppg: 19.6, adp: 4.9 },
  { index: 5, playerName: "Ja'Marr Chase", position: 'WR', team: 'CIN', ppg: 20.8, adp: 1.2 },
  { index: 6, playerName: 'Tyreek Hill', position: 'WR', team: 'MIA', ppg: 18.2, adp: 3.8 },
  { index: 7, playerName: 'Travis Kelce', position: 'TE', team: 'KC', ppg: 16.5, adp: 8.1 },
  { index: 8, playerName: 'Mark Andrews', position: 'TE', team: 'BAL', ppg: 14.2, adp: 15.3 },
  // Add more players for realistic testing
  { index: 9, playerName: 'Christian McCaffrey', position: 'RB', team: 'SF', ppg: 19.8, adp: 1.8 },
  { index: 10, playerName: 'CeeDee Lamb', position: 'WR', team: 'DAL', ppg: 19.1, adp: 2.4 },
  { index: 11, playerName: 'Stefon Diggs', position: 'WR', team: 'HOU', ppg: 17.9, adp: 6.2 },
  { index: 12, playerName: 'Derrick Henry', position: 'RB', team: 'BAL', ppg: 17.2, adp: 12.1 },
  { index: 13, playerName: 'Joe Mixon', position: 'RB', team: 'HOU', ppg: 16.8, adp: 18.4 },
  { index: 14, playerName: 'Amon-Ra St. Brown', position: 'WR', team: 'DET', ppg: 17.1, adp: 11.7 },
  { index: 15, playerName: 'Puka Nacua', position: 'WR', team: 'LAR', ppg: 16.9, adp: 13.2 }
];

describe('End-to-End Recommendation Engine', () => {
  let players: Map<number, any>;
  let draftState: DraftState;

  beforeEach(() => {
    players = createPlayersMap(samplePlayerData);
    draftState = createSampleDraftState(12, 15, 0, 1);
  });

  test('generates reasonable recommendations at draft start', () => {
    const result = generateRecommendations(players, draftState, {
      topN: 8,
      candidatePoolSize: 15
    });

    expect(result.recommendations).toBeDefined();
    expect(result.recommendations.length).toBe(8);
    expect(result.horizon).toBeGreaterThan(0);
    expect(result.positionDrain).toBeDefined();

    // All recommendations should have valid structure
    for (const rec of result.recommendations) {
      expect(rec.playerName).toBeTruthy();
      expect(['QB', 'RB', 'WR', 'TE']).toContain(rec.position);
      expect(rec.ppg).toBeGreaterThan(0);
      expect(rec.davarScore).toBeDefined();
      expect(rec.survivalPercent).toMatch(/^\d+%$/);
    }

    // Recommendations should be sorted by DAVAR score descending
    for (let i = 1; i < result.recommendations.length; i++) {
      expect(result.recommendations[i-1].davarScore).toBeGreaterThanOrEqual(
        result.recommendations[i].davarScore
      );
    }
  });

  test('recommendations adapt as draft progresses', () => {
    // Initial recommendations
    const initialRecs = generateRecommendations(players, draftState, { topN: 5 });
    
    // Make a few picks
    const pick1 = applyDraftPick(5, players, draftState); // Ja'Marr Chase (WR)
    expect(pick1.success).toBe(true);
    
    const pick2 = applyDraftPick(3, players, draftState); // Bijan Robinson (RB) 
    expect(pick2.success).toBe(true);

    // Get recommendations after picks
    const laterRecs = generateRecommendations(players, draftState, { topN: 5 });
    
    // Picked players should not appear in later recommendations
    const laterPlayerNames = laterRecs.recommendations.map(r => r.playerName);
    expect(laterPlayerNames).not.toContain("Ja'Marr Chase");
    expect(laterPlayerNames).not.toContain('Bijan Robinson');
    
    // Horizon should change based on draft progression
    expect(laterRecs.horizon).not.toBe(initialRecs.horizon);
  });

  test('validates picks correctly', () => {
    // Valid pick
    const validResult = validatePick(1, players, draftState, 0);
    expect(validResult.valid).toBe(true);

    // Invalid player
    const invalidPlayer = validatePick(999, players, draftState, 0);
    expect(invalidPlayer.valid).toBe(false);
    expect(invalidPlayer.reason).toContain('not found');

    // Already taken player
    draftState.taken.add(1);
    const takenResult = validatePick(1, players, draftState, 0);
    expect(takenResult.valid).toBe(false);
    expect(takenResult.reason).toContain('already drafted');
  });

  test('position scarcity affects recommendations appropriately', () => {
    // Fill most RB spots by simulating picks
    const rbPlayers = [3, 4, 9, 12, 13]; // All RBs from our sample
    for (const playerId of rbPlayers.slice(0, 3)) {
      applyDraftPick(playerId, players, draftState);
    }

    const recs = generateRecommendations(players, draftState, { topN: 10 });
    
    // Remaining RBs should have high survival probabilities and good scores
    const rbRecs = recs.recommendations.filter(r => r.position === 'RB');
    if (rbRecs.length > 0) {
      // Should have reasonable DAVAR scores reflecting scarcity
      expect(rbRecs[0].davarScore).toBeGreaterThan(-5); // Not too negative
    }
  });

  test('horizon calculation is reasonable', () => {
    // At pick 1, user team 0 should have horizon until their next pick
    expect(draftState.stepsUntilUserNextPick()).toBeGreaterThan(0);
    expect(draftState.stepsUntilUserNextPick()).toBeLessThan(24); // Reasonable for 12-team

    // Change current pick and verify horizon changes
    draftState.currentPick = 13; // Start of round 2
    const horizonR2 = draftState.stepsUntilUserNextPick();
    expect(horizonR2).toBeGreaterThan(0);
  });

  test('recommendation summary formats correctly', () => {
    const result = generateRecommendations(players, draftState, { topN: 3 });
    const summary = formatRecommendationSummary(result, draftState);
    
    expect(summary).toContain('Horizon to your next pick');
    expect(summary).toContain('== Recommendations');
    expect(summary).toContain('Position drain');
    
    // Should contain player names from recommendations
    for (const rec of result.recommendations.slice(0, 2)) {
      expect(summary).toContain(rec.playerName);
    }
  });

  test('picks are applied correctly with snake draft logic', () => {
    // Pick 1 should be team 0
    expect(draftState.pickOwner(1)).toBe(0);
    
    const result1 = applyDraftPick(5, players, draftState); // Team 0 picks
    expect(result1.success).toBe(true);
    expect(result1.pickDetails?.team).toBe(0);
    expect(result1.pickDetails?.pickNumber).toBe(1);
    expect(draftState.currentPick).toBe(2);
    
    // Pick 2 should be team 1
    expect(draftState.pickOwner(2)).toBe(1);
    
    // Team 0 should have the player in their roster
    expect(draftState.teams[0].picks).toContain(5);
    expect(draftState.taken).toContain(5);
  });

  test('roster needs are updated correctly after picks', () => {
    const team = draftState.teams[0];
    
    // Initial state - can draft any position
    expect(team.canDraft('QB')).toBe(true);
    expect(team.canDraft('RB')).toBe(true);
    expect(team.canDraft('WR')).toBe(true);
    expect(team.canDraft('TE')).toBe(true);
    
    // Pick a QB
    applyDraftPick(1, players, draftState); // Josh Allen (QB)
    
    // Should still be able to draft QB (bench), but needs should decrease
    const qbNeedBefore = team.need.QB;
    expect(qbNeedBefore).toBe(0); // Should be 0 after drafting starter
    
    // Pick RBs to fill spots
    for (let i = 0; i < 2 && draftState.currentPick <= 24; i++) {
      const rbPlayer = [3, 4, 9][i];
      if (rbPlayer && !draftState.taken.has(rbPlayer)) {
        // Advance to user's next pick
        while (draftState.pickOwner(draftState.currentPick) !== 0 && draftState.currentPick <= 180) {
          draftState.currentPick++;
        }
        if (draftState.currentPick <= 180) {
          applyDraftPick(rbPlayer, players, draftState);
        }
      }
    }
  });
});

describe('Edge Cases and Error Handling', () => {
  test('handles empty player pool gracefully', () => {
    const emptyPlayers = new Map();
    const draftState = createSampleDraftState(12, 15, 0, 1);
    
    const result = generateRecommendations(emptyPlayers, draftState);
    expect(result.recommendations).toHaveLength(0);
    expect(result.positionDrain).toBeDefined();
  });

  test('handles draft completion', () => {
    const players = createPlayersMap(samplePlayerData);
    const draftState = createSampleDraftState(2, 2, 0, 5); // Draft complete
    
    expect(draftState.isComplete()).toBe(true);
    
    // Should still generate recommendations even if draft is "complete"
    const result = generateRecommendations(players, draftState);
    expect(result.recommendations).toBeDefined();
  });

  test('handles extreme parameter values', () => {
    const players = createPlayersMap(samplePlayerData.slice(0, 5));
    const draftState = createSampleDraftState(12, 15, 0, 1);
    
    // Very small candidate pool
    const smallPool = generateRecommendations(players, draftState, { 
      candidatePoolSize: 2, 
      topN: 1 
    });
    expect(smallPool.recommendations).toHaveLength(1);
    
    // Very large top N (larger than available)
    const largeN = generateRecommendations(players, draftState, { 
      topN: 100 
    });
    expect(largeN.recommendations.length).toBeLessThanOrEqual(5);
  });
});
