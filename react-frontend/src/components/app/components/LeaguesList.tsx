import React from 'react'
import {
  Card,
  Title,
  Text,
  Stack,
  Group,
  Box,
  ActionIcon,
  ThemeIcon,
  Button
} from '@mantine/core'
import {
  IconPlus,
  IconDots,
  IconTrophy
} from '@tabler/icons-react'

interface League {
  id: string
  name: string
  teams: number
  draftDate: string
  draftTime: string
}

const mockLeagues: League[] = [
  {
    id: '1',
    name: 'Office League 2024',
    teams: 12,
    draftDate: 'Oct 15',
    draftTime: '8:00 PM'
  },
  {
    id: '2',
    name: 'Friends & Family',
    teams: 10,
    draftDate: 'Oct 18',
    draftTime: '7:30 PM'
  },
  {
    id: '3',
    name: 'High Stakes League',
    teams: 14,
    draftDate: 'Oct 20',
    draftTime: '9:00 PM'
  }
]

export const LeaguesList: React.FC = () => {
  return (
    <Card withBorder padding="lg" bg="var(--mantine-color-dark-6)">
      <Stack gap="lg">
        {/* Header */}
        <Group gap="md">
          <ThemeIcon 
            size={32} 
            radius="md" 
            variant="gradient"
            gradient={{ from: 'green.6', to: 'green.7' }}
          >
            <IconTrophy size={20} />
          </ThemeIcon>
          <Title order={3} size="h4">
            My Leagues
          </Title>
        </Group>

        {/* Leagues List */}
        <Stack gap="md">
          {mockLeagues.map((league) => (
            <Card 
              key={league.id}
              withBorder 
              padding="md" 
              radius="md"
              bg="var(--mantine-color-dark-5)"
              style={{ 
                borderColor: 'var(--mantine-color-dark-4)',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <Group justify="space-between" align="center">
                <Box style={{ flex: 1 }}>
                  <Text fw={600} size="md" mb="xs">
                    {league.name}
                  </Text>
                  <Text size="sm" c="dimmed">
                    {league.teams} teams • Draft: {league.draftDate}, {league.draftTime}
                  </Text>
                </Box>
                <ActionIcon variant="subtle" color="gray">
                  <IconDots size={16} />
                </ActionIcon>
              </Group>
            </Card>
          ))}
        </Stack>

        {/* Add New League */}
        <Button
          variant="outline"
          size="md"
          leftSection={<IconPlus size={16} />}
          style={{ 
            borderStyle: 'dashed',
            borderColor: 'var(--mantine-color-green-6)',
            color: 'var(--mantine-color-green-6)',
            backgroundColor: 'transparent'
          }}
          fullWidth
        >
          + Add New League
        </Button>
      </Stack>
    </Card>
  )
}
