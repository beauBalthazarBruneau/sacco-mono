import React from 'react'
import { Container, Stack, Title, Grid, Box, Group, Button } from '@mantine/core'
import { IconSettings } from '@tabler/icons-react'
import { LeaguesList, PlayerRankings } from '../components'

export const Dashboard: React.FC = () => {
  return (
    <Box style={{ minHeight: '100vh' }}>
      <Container size="xl" py="xl">
        <Stack gap="xl">
          {/* Header */}
          <Group justify="space-between">
            <Title order={1} size="h1">
              Fantasy Draft Assistant
            </Title>
            <Group gap="md">
              <Button variant="outline" leftSection={<IconSettings size={16} />}>
                Account Settings
              </Button>
              <Button 
                variant="gradient"
                gradient={{ from: 'green.6', to: 'green.7' }}
              >
                Start Free Trial
              </Button>
            </Group>
          </Group>

          {/* Main Content Grid */}
          <Grid>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <PlayerRankings />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 8 }}>
              <LeaguesList />
            </Grid.Col>
          </Grid>
        </Stack>
      </Container>
    </Box>
  )
}
