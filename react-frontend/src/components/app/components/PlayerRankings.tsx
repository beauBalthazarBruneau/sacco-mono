import React from 'react'
import {
  Card,
  Title,
  Text,
  Stack,
  Box,
  Divider,
  ThemeIcon,
  Group
} from '@mantine/core'
import { IconTrendingUp } from '@tabler/icons-react'

interface PlayerRanking {
  id: string
  name: string
  rank: number
}

const mockRankings: PlayerRanking[] = [
  { id: '1', name: 'Josh Allen', rank: 1 },
  { id: '2', name: 'Christian McCaffrey', rank: 2 },
  { id: '3', name: 'Cooper Kupp', rank: 3 },
  { id: '4', name: 'Travis Kelce', rank: 4 },
  { id: '5', name: 'Austin Ekeler', rank: 5 },
  { id: '6', name: 'Tyreek Hill', rank: 6 },
  { id: '7', name: 'Davante Adams', rank: 7 },
  { id: '8', name: 'Derrick Henry', rank: 8 },
  { id: '9', name: 'Stefon Diggs', rank: 9 },
  { id: '10', name: 'Nick Chubb', rank: 10 },
  { id: '11', name: 'Saquon Barkley', rank: 11 },
  { id: '12', name: 'Mike Evans', rank: 12 },
  { id: '13', name: 'Alvin Kamara', rank: 13 },
  { id: '14', name: 'DK Metcalf', rank: 14 },
  { id: '15', name: 'Dalvin Cook', rank: 15 }
]

export const PlayerRankings: React.FC = () => {
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
            <IconTrendingUp size={20} />
          </ThemeIcon>
          <Title order={3} size="h4">
            Player Rankings
          </Title>
        </Group>

        {/* Rankings List */}
        <Stack gap={0}>
          {mockRankings.map((player, index) => (
            <Box key={player.id}>
              <Box py="md">
                <Text size="md" fw={500}>
                  {player.name} #{player.rank}
                </Text>
              </Box>
              {index < mockRankings.length - 1 && (
                <Divider color="var(--mantine-color-dark-4)" />
              )}
            </Box>
          ))}
        </Stack>
      </Stack>
    </Card>
  )
}
