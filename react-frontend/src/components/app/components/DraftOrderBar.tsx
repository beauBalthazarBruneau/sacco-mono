import React from 'react'
import { Group, Card, Text, Box } from '@mantine/core'

interface Team {
  id: number
  name: string
  pick: number
  isCurrentUser: boolean
}

interface DraftOrderBarProps {
  teams: Team[]
}

export const DraftOrderBar: React.FC<DraftOrderBarProps> = ({ teams }) => {
  return (
    <Group justify="center" gap="xs">
      {teams.map((team) => (
        <Card
          key={team.id}
          withBorder
          padding="md"
          radius="md"
          style={{
            minWidth: '120px',
            backgroundColor: team.isCurrentUser
              ? 'var(--mantine-color-dark-8)'
              : 'var(--mantine-color-dark-6)',
            borderColor: team.isCurrentUser
              ? 'var(--mantine-color-green-6)'
              : 'var(--mantine-color-dark-4)',
            borderWidth: team.isCurrentUser ? '2px' : '1px'
          }}
        >
          <Box ta="center">
            <Text
              fw={team.isCurrentUser ? 700 : 600}
              size="sm"
              c={team.isCurrentUser ? 'white' : 'dimmed'}
            >
              {team.name}
            </Text>
            <Text
              size="xs"
              c={team.isCurrentUser ? 'green' : 'dimmed'}
              mt="xs"
            >
              Pick {team.pick}
            </Text>
          </Box>
        </Card>
      ))}
    </Group>
  )
}