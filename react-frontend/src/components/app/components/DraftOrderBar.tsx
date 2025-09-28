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
  currentDraftingTeam: number
}

export const DraftOrderBar: React.FC<DraftOrderBarProps> = ({ teams, currentDraftingTeam }) => {
  return (
    <Group justify="center" gap="xs">
      {teams.map((team) => {
        const isCurrentDrafting = team.id === currentDraftingTeam
        const isCurrentUser = team.isCurrentUser

        return (
          <Card
            key={team.id}
            withBorder
            padding="md"
            radius="md"
            style={{
              minWidth: '120px',
              backgroundColor: isCurrentUser
                ? 'var(--mantine-color-dark-8)'
                : isCurrentDrafting
                  ? 'var(--mantine-color-blue-9)'
                  : 'var(--mantine-color-dark-6)',
              borderColor: isCurrentUser
                ? 'var(--mantine-color-green-6)'
                : isCurrentDrafting
                  ? 'var(--mantine-color-blue-6)'
                  : 'var(--mantine-color-dark-4)',
              borderWidth: (isCurrentUser || isCurrentDrafting) ? '2px' : '1px',
              transform: isCurrentDrafting ? 'scale(1.05)' : 'scale(1)',
              transition: 'all 0.2s ease'
            }}
          >
            <Box ta="center">
              <Text
                fw={isCurrentUser || isCurrentDrafting ? 700 : 600}
                size="sm"
                c={isCurrentUser ? 'white' : isCurrentDrafting ? 'blue' : 'dimmed'}
              >
                {team.name}
                {isCurrentDrafting && !isCurrentUser && (
                  <Text component="span" size="xs" c="blue" fw={700} ml="xs">
                    (drafting)
                  </Text>
                )}
              </Text>
              <Text
                size="xs"
                c={isCurrentUser ? 'green' : isCurrentDrafting ? 'blue' : 'dimmed'}
                mt="xs"
              >
                Pick {team.pick}
              </Text>
            </Box>
          </Card>
        )
      })}
    </Group>
  )
}