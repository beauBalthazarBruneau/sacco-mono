import React, { useState } from 'react'
import { Container, Grid, Stack, Title, Text, Group, Card, Box } from '@mantine/core'
import { DraftOrderBar } from '../components/DraftOrderBar'
import { PlayerDraftTable } from '../components/PlayerDraftTable'
import { DraftedTeamPanel } from '../components/DraftedTeamPanel'

export const DraftSession: React.FC = () => {
  // Mock data for now
  const leagueName = "Office League 2024"
  const currentRound = 3
  const currentPick = 5
  const draftType = "Snake Draft"

  const teams = Array.from({ length: 8 }, (_, i) => ({
    id: i + 1,
    name: i === 4 ? 'You' : `Team ${i + 1}`,
    pick: i * 3 + 21, // Mock pick numbers
    isCurrentUser: i === 4
  }))

  return (
    <Box style={{ minHeight: '100vh', backgroundColor: 'var(--mantine-color-dark-7)' }}>
      <Container size="xl" py="md">
        <Stack gap="lg">
          {/* Header */}
          <Group justify="space-between" align="center">
            <Stack gap="xs">
              <Title order={1} size="h3" c="white">
                Fantasy Draft Assistant
              </Title>
              <Text size="xl" fw={600} c="white">
                Live Draft - {leagueName}
              </Text>
            </Stack>
          </Group>

          {/* Round and Pick Info */}
          <Card withBorder padding="md" bg="var(--mantine-color-dark-6)">
            <Text size="lg" fw={600} ta="center">
              Round {currentRound}, Pick {currentPick} - {draftType}
            </Text>
          </Card>

          {/* Draft Order Bar */}
          <DraftOrderBar teams={teams} />

          {/* Main Draft Content */}
          <Grid>
            <Grid.Col span={{ base: 12, md: 8 }}>
              <PlayerDraftTable />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <DraftedTeamPanel />
            </Grid.Col>
          </Grid>
        </Stack>
      </Container>
    </Box>
  )
}