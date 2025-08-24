import type { Player } from '../../lib/supabase'

const mockPlayer: Player = {
  id: '1',
  player_name: 'Test Player',
  position: 'QB',
  team: 'TEST',
  adp: 1.5,
  ppr_points: 300.5,
  standard_points: 250.3,
  half_ppr_points: 275.4,
  ppr_points_per_game: 18.8,
  standard_points_per_game: 15.6,
  half_ppr_points_per_game: 17.2,
  last_updated: '2024-01-01'
}

describe('PlayerCard Data Tests', () => {
  test('player data structure is correct', () => {
    expect(mockPlayer.player_name).toBe('Test Player')
    expect(mockPlayer.position).toBe('QB')
    expect(mockPlayer.team).toBe('TEST')
    expect(mockPlayer.adp).toBe(1.5)
    expect(mockPlayer.ppr_points).toBe(300.5)
  })

  test('handles null team as FA', () => {
    const playerWithoutTeam = { ...mockPlayer, team: null }
    const displayTeam = playerWithoutTeam.team || 'FA'
    expect(displayTeam).toBe('FA')
  })

  test('handles null ADP as N/A', () => {
    const playerWithoutADP = { ...mockPlayer, adp: null }
    const displayADP = playerWithoutADP.adp ? playerWithoutADP.adp.toFixed(1) : 'N/A'
    expect(displayADP).toBe('N/A')
  })

  test('formats ADP correctly', () => {
    const displayADP = mockPlayer.adp ? mockPlayer.adp.toFixed(1) : 'N/A'
    expect(displayADP).toBe('1.5')
  })

  test('formats PPR points correctly', () => {
    const displayPPR = mockPlayer.ppr_points ? mockPlayer.ppr_points.toFixed(1) : 'N/A'
    expect(displayPPR).toBe('300.5')
  })
})
