import React from 'react'
import { Card, Text, Group, Badge, Stack, Box } from '@mantine/core'
import type { Player } from '../../../lib/supabase'

interface PlayerCardProps {
  player: Player
}

const getPositionColor = (position: string) => {
  switch (position) {
    case 'QB': return 'red'
    case 'RB': return 'green'
    case 'WR': return 'blue'
    case 'TE': return 'orange'
    default: return 'gray'
  }
}

export const PlayerCard: React.FC<PlayerCardProps> = ({ player }) => {
  return (
    <Card
      shadow="sm"
      padding="lg"
      radius="md"
      withBorder
      style={{
        height: '100%',
        background: 'var(--mantine-color-dark-6)',
        borderColor: 'var(--mantine-color-dark-4)',
        transition: 'transform 0.2s ease, border-color 0.2s ease',
        cursor: 'pointer'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)'
        e.currentTarget.style.borderColor = 'var(--mantine-color-green-6)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0px)'
        e.currentTarget.style.borderColor = 'var(--mantine-color-dark-4)'
      }}
    >
      <Stack gap="sm" h="100%">
        {/* Header with name and position */}
        <Group justify="space-between" align="flex-start">
          <Box style={{ flex: 1 }}>
            <Text 
              fw={600} 
              size="lg" 
              style={{ 
                color: 'white',
                lineHeight: 1.2,
                wordBreak: 'break-word'
              }}
            >
              {player.player_name}
            </Text>
          </Box>
          <Badge 
            color={getPositionColor(player.position)}
            variant="filled"
            size="sm"
            style={{ flexShrink: 0 }}
          >
            {player.position}
          </Badge>
        </Group>

        {/* Team and ADP */}
        <Group justify="space-between" align="center">
          <Text size="sm" c="dimmed" fw={500}>
            {player.team || 'FA'}
          </Text>
          <Group gap="xs">
            <Text size="xs" c="dimmed">ADP:</Text>
            <Text size="sm" fw={600} c="green">
              {player.adp ? player.adp.toFixed(1) : 'N/A'}
            </Text>
          </Group>
        </Group>

        {/* Fantasy Points */}
        <Box
          p="xs"
          style={{
            backgroundColor: 'var(--mantine-color-dark-7)',
            borderRadius: 'var(--mantine-radius-sm)',
            marginTop: 'auto'
          }}
        >
          <Stack gap="xs">
            <Group justify="space-between">
              <Text size="xs" c="dimmed">PPR Points:</Text>
              <Text size="sm" fw={600} c="white">
                {player.ppr_points ? player.ppr_points.toFixed(1) : 'N/A'}
              </Text>
            </Group>
            <Group justify="space-between">
              <Text size="xs" c="dimmed">Standard:</Text>
              <Text size="sm" c="dimmed">
                {player.standard_points ? player.standard_points.toFixed(1) : 'N/A'}
              </Text>
            </Group>
            <Group justify="space-between">
              <Text size="xs" c="dimmed">Half-PPR:</Text>
              <Text size="sm" c="dimmed">
                {player.half_ppr_points ? player.half_ppr_points.toFixed(1) : 'N/A'}
              </Text>
            </Group>
          </Stack>
        </Box>
      </Stack>
    </Card>
  )
}
