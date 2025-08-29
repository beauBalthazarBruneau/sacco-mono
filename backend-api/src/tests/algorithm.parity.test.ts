/**
 * Algorithm parity tests (TypeScript)
 * Mirrors Python tests in proto/tests to validate consistent behavior
 */

import { describe, test, expect } from '@jest/globals';
import { DraftState, Team, LINEUP } from '../../src/algorithm/models.js';
import { 
  getSurvivalProbabilities,
  getExpectedPositionDrain
} from '../../src/algorithm/survival.js';
import {
  calculateDavarEsbn,
  calculateSimpleVar
} from '../../src/algorithm/scoring.js';

// Minimal mock Player type for focused tests
type Player = {
  index: number;
  playerName: string;
  position: 'QB' | 'RB' | 'WR' | 'TE';
  team: string | null;
  ppg: number;
  adp?: number;
  globalRank?: number;
  espnRank?: number;
};

function playersToMap(players: Player[]): Map<number, Player> {
  const map = new Map<number, Player>();
  for (const p of players) map.set(p.index, p);
  return map;
}

describe('TS Parity: Survival and Drain', () => {
  test('survival probabilities mirror Python logic', () => {
    const hazards = [
      { 1: 0.3, 2: 0.1 },
      { 1: 0.5 },
    ];
    const surv = getSurvivalProbabilities(hazards as any, [1, 2, 3]);

    expect(Number((surv[1]).toFixed(4))).toBe(Number(((1-0.3)*(1-0.5)).toFixed(4)));
    expect(Number((surv[2]).toFixed(4))).toBe(Number(((1-0.1)*1.0).toFixed(4)));
    expect(surv[3]).toBe(1.0);
  });

  test('expected position drain sums correctly by position', () => {
    const players: Player[] = [
      { index: 1, playerName: 'A', position: 'QB', team: null, ppg: 20 },
      { index: 2, playerName: 'B', position: 'RB', team: null, ppg: 15 },
      { index: 3, playerName: 'C', position: 'WR', team: null, ppg: 16 },
      { index: 4, playerName: 'D', position: 'TE', team: null, ppg: 9  },
    ];

    const hazards = [
      { 1: 0.2, 2: 0.3 },
      { 3: 0.4 },
    ];

    const drain = getExpectedPositionDrain(hazards as any, playersToMap(players) as any);
    expect(Number(drain['QB']!.toFixed(3))).toBe(0.2);
    expect(Number(drain['RB']!.toFixed(3))).toBe(0.3);
    expect(Number(drain['WR']!.toFixed(3))).toBe(0.4);
    expect((drain as any)['TE'] ?? 0).toBe(0);
  });
});

describe('TS Parity: Snake draft logic', () => {
  test('pickOwner for 12 teams works like Python', () => {
    const ds = new DraftState(12, 15, 0);
    expect(ds.pickOwner(1)).toBe(0);
    expect(ds.pickOwner(6)).toBe(5);
    expect(ds.pickOwner(12)).toBe(11);
    expect(ds.pickOwner(13)).toBe(11);
    expect(ds.pickOwner(18)).toBe(6);
    expect(ds.pickOwner(24)).toBe(0);
    expect(ds.pickOwner(25)).toBe(0);
  });
});

describe('TS Parity: VAR & DAVAR primitives', () => {
  test('simple VAR is player ppg minus replacement', () => {
    const varQB = calculateSimpleVar(20, 'QB', { QB: 12, RB: 0, WR: 0, TE: 0 } as any);
    expect(varQB).toBe(8);
  });

  test('davar_esbn base components combine as expected', () => {
    const player: Player = { index: 10, playerName: 'X', position: 'RB', team: null, ppg: 18 };
    const bestNow = { QB: 20, RB: 18, WR: 17, TE: 10 } as any;
    const Ebest  = { QB: 18, RB: 16, WR: 15, TE:  9 } as any;
    const repl   = { QB: 12, RB: 10, WR:  9, TE:  6 } as any;

    const s = 0.7; // survival
    const score = calculateDavarEsbn(player as any, bestNow, Ebest, repl, s, { alpha: 0.9, beta: 0.8 });
    // base = 18 - 10 = 8
    // delta_pos = (1-0.7) * max(0, 18-16) = 0.3 * 2 = 0.6; alpha*delta_pos = 0.54
    // hedge_loss = max( QB: 20-18=2, WR: 17-15=2, TE: 10-9=1 ) = 2; beta*hedge_loss = 1.6
    // total ≈ 8 + 0.54 - 1.6 = 6.94
    expect(Number(score.toFixed(2))).toBe(6.94);
  });
});

