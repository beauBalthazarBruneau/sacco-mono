import React, { useState, useEffect } from 'react'
import { Card, Stack, TextInput, Table, Text, Badge, Group, ScrollArea, Button, Center } from '@mantine/core'
import { IconSearch, IconChevronUp, IconChevronDown } from '@tabler/icons-react'
import { getPlayers, createDraftPick, type Player, type DraftPick } from '../../../lib/supabase'
import { useAuth } from '../../../hooks/useAuth'

interface PlayerDraftTableProps {
  sessionId: string
  draftPicks: DraftPick[]
  onPlayerDrafted: (pick: DraftPick) => void
  currentDraftPosition: number
  teamCount: number
}

const getPositionColor = (position: string | null) => {
  if (!position) return 'gray'
  switch (position) {
    case 'PG': return 'blue'
    case 'SG': return 'cyan'
    case 'SF': return 'green'
    case 'PF': return 'orange'
    case 'C': return 'red'
    case 'G': return 'grape'
    case 'F': return 'lime'
    case 'UTIL': return 'gray'
    default: return 'gray'
  }
}

export const PlayerDraftTable: React.FC<PlayerDraftTableProps> = ({
  sessionId,
  draftPicks,
  onPlayerDrafted,
  currentDraftPosition,
  teamCount
}) => {
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [sortField, setSortField] = useState<keyof Player | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [drafting, setDrafting] = useState<string | null>(null)

  // Calculate which team is currently drafting
  const getCurrentDraftingTeam = () => {
    const currentPick = draftPicks.length + 1
    const currentRound = Math.ceil(currentPick / teamCount)

    if (currentRound % 2 === 1) {
      // Odd rounds: normal order
      return ((currentPick - 1) % teamCount) + 1
    } else {
      // Even rounds: reverse order
      return teamCount - ((currentPick - 1) % teamCount)
    }
  }

  const currentDraftingTeam = getCurrentDraftingTeam()

  // Get drafted player names to filter them out
  const draftedPlayerNames = draftPicks.map(pick => pick.player_name)

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        setLoading(true)
        const response = await getPlayers(0, 100, searchTerm, undefined, 'adp', 'asc')
        if (response.error) {
          console.error('Error fetching players:', response.error)
        } else {
          setPlayers(response.data)
        }
      } catch (err) {
        console.error('Error fetching players:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchPlayers()
  }, [searchTerm])

  const handleDraftPlayer = async (player: Player) => {
    if (!user || drafting) return

    try {
      setDrafting(player.id)

      const currentPick = draftPicks.length + 1
      const currentRound = Math.ceil(currentPick / teamCount)

      const pickData = {
        draft_session_id: sessionId,
        player_name: player.player_name,
        position: player.position || 'UTIL',
        pick_number: currentPick,
        round: currentRound,
        team: `Team ${currentDraftingTeam}`,
        recommended: currentDraftingTeam === currentDraftPosition
      }

      const result = await createDraftPick(pickData)
      if (result.error) {
        console.error('Error drafting player:', result.error)
      } else if (result.data) {
        onPlayerDrafted(result.data)
      }
    } catch (err) {
      console.error('Error drafting player:', err)
    } finally {
      setDrafting(null)
    }
  }

  const handleMarkAsDrafted = async (player: Player) => {
    if (!user || drafting) return

    try {
      setDrafting(player.id)

      const currentPick = draftPicks.length + 1
      const currentRound = Math.ceil(currentPick / teamCount)

      const pickData = {
        draft_session_id: sessionId,
        player_name: player.player_name,
        position: player.position || 'UTIL',
        pick_number: currentPick,
        round: currentRound,
        team: `Team ${currentDraftingTeam}`,
        recommended: false // This is someone else's pick
      }

      const result = await createDraftPick(pickData)
      if (result.error) {
        console.error('Error marking player as drafted:', result.error)
      } else if (result.data) {
        onPlayerDrafted(result.data)
      }
    } catch (err) {
      console.error('Error marking player as drafted:', err)
    } finally {
      setDrafting(null)
    }
  }

  // Filter available players (not drafted) and by search term
  const filteredPlayers = players.filter(player => {
    const isDrafted = draftedPlayerNames.includes(player.player_name)
    const matchesSearch = player.player_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (player.position && player.position.toLowerCase().includes(searchTerm.toLowerCase()))

    return !isDrafted && matchesSearch
  })

  const handleSort = (field: keyof Player) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const getSortIcon = (field: keyof Player) => {
    if (sortField !== field) return null
    return sortDirection === 'asc' ? <IconChevronUp size={14} /> : <IconChevronDown size={14} />
  }

  const sortedPlayers = [...filteredPlayers].sort((a, b) => {
    if (!sortField) return 0

    const aValue = a[sortField]
    const bValue = b[sortField]

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue)
    }

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue
    }

    return 0
  })

  return (
    <>
      <style>{`
        .player-row:hover .drafted-button {
          display: block !important;
        }
      `}</style>
      <Card withBorder padding="lg" bg="var(--mantine-color-dark-6)">
        <Stack gap="md">
        {/* Search */}
        <TextInput
          placeholder="Search players..."
          leftSection={<IconSearch size={16} />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.currentTarget.value)}
        />

        {/* Players Table */}
        <ScrollArea h={500}>
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleSort('player_name')}
                >
                  <Group gap="xs" justify="space-between">
                    <Text size="sm" fw={600}>Player</Text>
                    {getSortIcon('player_name')}
                  </Group>
                </Table.Th>
                <Table.Th
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleSort('position')}
                >
                  <Group gap="xs" justify="space-between">
                    <Text size="sm" fw={600}>Pos</Text>
                    {getSortIcon('position')}
                  </Group>
                </Table.Th>
                <Table.Th
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleSort('adp')}
                >
                  <Group gap="xs" justify="space-between">
                    <Text size="sm" fw={600}>ADP</Text>
                    {getSortIcon('adp')}
                  </Group>
                </Table.Th>
                <Table.Th
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleSort('projected_points')}
                >
                  <Group gap="xs" justify="space-between">
                    <Text size="sm" fw={600}>Proj Pts</Text>
                    {getSortIcon('projected_points')}
                  </Group>
                </Table.Th>
                <Table.Th>
                  <Text size="sm" fw={600}>Team</Text>
                </Table.Th>
                <Table.Th style={{ width: '100px' }}>
                  <Text size="sm" fw={600}>Actions</Text>
                </Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {loading ? (
                <Table.Tr>
                  <Table.Td colSpan={6}>
                    <Center py="xl">
                      <Text c="dimmed" size="sm">Loading players...</Text>
                    </Center>
                  </Table.Td>
                </Table.Tr>
              ) : sortedPlayers.length === 0 ? (
                <Table.Tr>
                  <Table.Td colSpan={6}>
                    <Center py="xl">
                      <Text c="dimmed" size="sm">No available players found</Text>
                    </Center>
                  </Table.Td>
                </Table.Tr>
              ) : (
                sortedPlayers.map((player) => (
                  <Table.Tr
                    key={player.id}
                    style={{
                      cursor: 'pointer',
                      position: 'relative'
                    }}
                    className="player-row"
                  >
                    <Table.Td>
                      <Text size="sm" fw={500}>
                        {player.player_name}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Badge size="sm" color={getPositionColor(player.position)} variant="light">
                        {player.position || 'N/A'}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">{player.adp ? player.adp.toFixed(1) : 'N/A'}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">{player.projected_points ? player.projected_points.toFixed(1) : 'N/A'}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">{player.team || 'FA'}</Text>
                    </Table.Td>
                    <Table.Td>
                      {currentDraftingTeam === currentDraftPosition ? (
                        <Button
                          size="xs"
                          variant="light"
                          color="green"
                          loading={drafting === player.id}
                          onClick={() => handleDraftPlayer(player)}
                          disabled={!!drafting}
                        >
                          Draft
                        </Button>
                      ) : (
                        <Button
                          size="xs"
                          variant="outline"
                          color="red"
                          loading={drafting === player.id}
                          onClick={() => handleMarkAsDrafted(player)}
                          disabled={!!drafting}
                          className="drafted-button"
                          style={{ display: 'none' }}
                        >
                          Drafted
                        </Button>
                      )}
                    </Table.Td>
                  </Table.Tr>
                ))
              )}
            </Table.Tbody>
          </Table>
        </ScrollArea>
      </Stack>
    </Card>
    </>
  )
}