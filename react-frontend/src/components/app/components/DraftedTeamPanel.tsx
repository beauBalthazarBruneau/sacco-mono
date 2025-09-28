import React from 'react'
import { Card, Stack, Title, Text, Group, Checkbox, Badge, Divider } from '@mantine/core'

interface DraftedPlayer {
  id: number
  name: string
  position: string
}

interface Position {
  name: string
  needed: number
  filled: number
}

export const DraftedTeamPanel: React.FC = () => {
  // Mock data based on the prototype
  const positions: Position[] = [
    { name: 'PG', needed: 2, filled: 1 },
    { name: 'SG', needed: 2, filled: 0 },
    { name: 'SF', needed: 2, filled: 0 },
    { name: 'PF', needed: 2, filled: 0 },
    { name: 'C', needed: 2, filled: 1 },
    { name: 'G', needed: 1, filled: 0 },
    { name: 'F', needed: 1, filled: 0 },
    { name: 'UTIL', needed: 2, filled: 0 },
  ]

  const draftedPlayers: DraftedPlayer[] = [
    { id: 1, name: 'Nikola Jokic', position: 'C' },
    { id: 2, name: 'Tyrese Haliburton', position: 'PG' },
  ]

  const getPositionColor = (position: string) => {
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

  return (
    <Card withBorder padding="lg" bg="var(--mantine-color-dark-6)" style={{ height: 'fit-content' }}>
      <Stack gap="lg">
        <Title order={3} size="h4">
          Your Team
        </Title>

        {/* Positions Needed Section */}
        <Stack gap="sm">
          <Text size="md" fw={600}>
            Positions Needed
          </Text>

          {positions.map((position) => (
            <Group key={position.name} justify="space-between" align="center">
              <Group gap="sm">
                <Checkbox
                  checked={position.filled >= position.needed}
                  readOnly
                  size="sm"
                />
                <Text size="sm">
                  {position.name} ({position.filled}/{position.needed})
                </Text>
              </Group>
            </Group>
          ))}
        </Stack>

        <Divider />

        {/* Drafted Players Section */}
        <Stack gap="sm">
          <Text size="md" fw={600}>
            Drafted Players
          </Text>

          {draftedPlayers.length === 0 ? (
            <Text size="sm" c="dimmed" ta="center" py="md">
              No players drafted yet
            </Text>
          ) : (
            <Stack gap="sm">
              {draftedPlayers.map((player) => (
                <Group key={player.id} justify="space-between" align="center">
                  <Text size="sm" fw={500}>
                    {player.name}
                  </Text>
                  <Badge size="sm" color={getPositionColor(player.position)} variant="light">
                    {player.position}
                  </Badge>
                </Group>
              ))}
            </Stack>
          )}
        </Stack>
      </Stack>
    </Card>
  )
}