import React, { useState } from 'react'
import { Card, Stack, TextInput, Table, Text, Badge, Group, ScrollArea, ActionIcon } from '@mantine/core'
import { IconSearch, IconChevronUp, IconChevronDown } from '@tabler/icons-react'

interface Player {
  id: number
  name: string
  position: string
  rank: number
  ppg: number
  survivePercent: number
  oppCost: number
  davar: number
  idx: number
  isDrafted: boolean
}

// Mock player data based on the prototype
const mockPlayers: Player[] = [
  { id: 1, name: 'Nikola Jokic', position: 'C', rank: 1, ppg: 26.4, survivePercent: 92, oppCost: 1.2, davar: 8.4, idx: 1.0, isDrafted: true },
  { id: 2, name: 'Luka Doncic', position: 'PG', rank: 2, ppg: 32.1, survivePercent: 89, oppCost: 1.1, davar: 7.9, idx: 1.1, isDrafted: true },
  { id: 3, name: 'Shai Gilgeous-Alexander', position: 'PG', rank: 3, ppg: 30.8, survivePercent: 88, oppCost: 1.0, davar: 7.6, idx: 1.2, isDrafted: false },
  { id: 4, name: 'Giannis Antetokounmpo', position: 'PF', rank: 4, ppg: 30.2, survivePercent: 85, oppCost: 0.9, davar: 7.4, idx: 1.3, isDrafted: true },
  { id: 5, name: 'Anthony Davis', position: 'C', rank: 5, ppg: 25.9, survivePercent: 76, oppCost: 0.8, davar: 7.1, idx: 1.4, isDrafted: false },
  { id: 6, name: 'Jayson Tatum', position: 'SF', rank: 6, ppg: 27.8, survivePercent: 91, oppCost: 0.7, davar: 6.9, idx: 1.5, isDrafted: false },
  { id: 7, name: 'Anthony Edwards', position: 'SG', rank: 7, ppg: 26.6, survivePercent: 87, oppCost: 0.6, davar: 6.7, idx: 1.6, isDrafted: false },
  { id: 8, name: 'Tyrese Haliburton', position: 'PG', rank: 8, ppg: 20.1, survivePercent: 81, oppCost: 0.5, davar: 6.5, idx: 1.7, isDrafted: true },
  { id: 9, name: 'Victor Wembanyama', position: 'C', rank: 9, ppg: 21.4, survivePercent: 79, oppCost: 0.4, davar: 6.3, idx: 1.8, isDrafted: false },
  { id: 10, name: 'Donovan Mitchell', position: 'SG', rank: 10, ppg: 28.3, survivePercent: 88, oppCost: 0.3, davar: 6.1, idx: 1.9, isDrafted: false },
  { id: 11, name: 'Karl-Anthony Towns', position: 'C', rank: 11, ppg: 22.0, survivePercent: 74, oppCost: 0.2, davar: 5.9, idx: 2.0, isDrafted: false },
  { id: 12, name: 'LeBron James', position: 'SF', rank: 12, ppg: 25.7, survivePercent: 82, oppCost: 0.1, davar: 5.7, idx: 2.1, isDrafted: false },
  { id: 13, name: 'Damian Lillard', position: 'PG', rank: 13, ppg: 24.3, survivePercent: 86, oppCost: 0.0, davar: 5.5, idx: 2.2, isDrafted: false },
  { id: 14, name: 'Paolo Banchero', position: 'PF', rank: 14, ppg: 22.6, survivePercent: 83, oppCost: -0.1, davar: 5.3, idx: 2.3, isDrafted: false },
]

const getPositionColor = (position: string) => {
  switch (position) {
    case 'PG': return 'blue'
    case 'SG': return 'cyan'
    case 'SF': return 'green'
    case 'PF': return 'orange'
    case 'C': return 'red'
    default: return 'gray'
  }
}

export const PlayerDraftTable: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortField, setSortField] = useState<keyof Player | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  const filteredPlayers = mockPlayers.filter(player =>
    player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    player.position.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
                  onClick={() => handleSort('name')}
                >
                  <Group gap="xs" justify="space-between">
                    <Text size="sm" fw={600}>Player</Text>
                    {getSortIcon('name')}
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
                  onClick={() => handleSort('rank')}
                >
                  <Group gap="xs" justify="space-between">
                    <Text size="sm" fw={600}>Rank</Text>
                    {getSortIcon('rank')}
                  </Group>
                </Table.Th>
                <Table.Th
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleSort('ppg')}
                >
                  <Group gap="xs" justify="space-between">
                    <Text size="sm" fw={600}>PPG</Text>
                    {getSortIcon('ppg')}
                  </Group>
                </Table.Th>
                <Table.Th
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleSort('survivePercent')}
                >
                  <Group gap="xs" justify="space-between">
                    <Text size="sm" fw={600}>Survive %</Text>
                    {getSortIcon('survivePercent')}
                  </Group>
                </Table.Th>
                <Table.Th
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleSort('oppCost')}
                >
                  <Group gap="xs" justify="space-between">
                    <Text size="sm" fw={600}>Opp Cost</Text>
                    {getSortIcon('oppCost')}
                  </Group>
                </Table.Th>
                <Table.Th
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleSort('davar')}
                >
                  <Group gap="xs" justify="space-between">
                    <Text size="sm" fw={600}>DAVAR</Text>
                    {getSortIcon('davar')}
                  </Group>
                </Table.Th>
                <Table.Th
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleSort('idx')}
                >
                  <Group gap="xs" justify="space-between">
                    <Text size="sm" fw={600}>Idx</Text>
                    {getSortIcon('idx')}
                  </Group>
                </Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {sortedPlayers.map((player) => (
                <Table.Tr
                  key={player.id}
                  style={{
                    textDecoration: player.isDrafted ? 'line-through' : 'none',
                    opacity: player.isDrafted ? 0.6 : 1,
                    cursor: player.isDrafted ? 'default' : 'pointer'
                  }}
                >
                  <Table.Td>
                    <Text size="sm" fw={500}>
                      {player.name}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Badge size="sm" color={getPositionColor(player.position)} variant="light">
                      {player.position}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">{player.rank}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">{player.ppg.toFixed(1)}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">{player.survivePercent}%</Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">{player.oppCost.toFixed(1)}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">{player.davar.toFixed(1)}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">{player.idx.toFixed(1)}</Text>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </ScrollArea>
      </Stack>
    </Card>
  )
}