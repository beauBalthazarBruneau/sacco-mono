import React, { useState, useEffect } from 'react'
import {
  Card,
  Title,
  Text,
  Stack,
  Box,
  Divider,
  ThemeIcon,
  Group,
  Loader,
  Center,
  Badge
} from '@mantine/core'
import { IconTrendingUp } from '@tabler/icons-react'
import { getPlayers, type Player } from '../../../lib/supabase'

export const PlayerRankings: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTopPlayers = async () => {
      try {
        setLoading(true)
        const response = await getPlayers(0, 15, '', '', 'adp', 'asc')

        if (response.error) {
          setError(response.error)
        } else {
          setPlayers(response.data)
        }
      } catch {
        setError('Failed to load player rankings')
      } finally {
        setLoading(false)
      }
    }

    fetchTopPlayers()
  }, [])

  const getPositionColor = (position: string | null) => {
    if (!position) return 'gray'
    switch (position.toUpperCase()) {
      case 'QB': return 'red'
      case 'RB': return 'green'
      case 'WR': return 'blue'
      case 'TE': return 'orange'
      case 'K': return 'yellow'
      case 'DEF':
      case 'DST': return 'purple'
      default: return 'gray'
    }
  }

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
            Top Player Rankings
          </Title>
        </Group>

        {/* Rankings List */}
        {loading ? (
          <Center py="xl">
            <Loader size="md" />
          </Center>
        ) : error ? (
          <Center py="xl">
            <Text c="red" size="sm">{error}</Text>
          </Center>
        ) : (
          <Stack gap={0}>
            {players.map((player, index) => (
              <Box key={player.id}>
                <Box py="md">
                  <Group justify="space-between" align="center">
                    <Box>
                      <Group gap="xs" align="center">
                        <Text size="md" fw={500}>
                          {player.player_name}
                        </Text>
                        {player.position && (
                          <Badge
                            size="sm"
                            color={getPositionColor(player.position)}
                            variant="light"
                          >
                            {player.position.toUpperCase()}
                          </Badge>
                        )}
                      </Group>
                      <Text size="xs" c="dimmed">
                        {player.team && `${player.team} • `}
                        ADP: {player.adp ? player.adp.toFixed(1) : 'N/A'}
                      </Text>
                    </Box>
                    <Text size="sm" fw={600} c="green">
                      #{index + 1}
                    </Text>
                  </Group>
                </Box>
                {index < players.length - 1 && (
                  <Divider color="var(--mantine-color-dark-4)" />
                )}
              </Box>
            ))}
          </Stack>
        )}
      </Stack>
    </Card>
  )
}
