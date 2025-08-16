import React from 'react'
import { 
  Container, 
  Group, 
  Title, 
  Text, 
  Button, 
  Card, 
  Stack, 
  Grid, 
  ThemeIcon,
  Box,
  ActionIcon,
  Badge
} from '@mantine/core'
import { 
  IconLock, 
  IconChartBar, 
  IconBolt, 
  IconClock, 
  IconPlus, 
  IconHistory,
  IconLogout,
  IconUser
} from '@tabler/icons-react'
import { useAuth } from '../hooks/useAuth'

export const Dashboard: React.FC = () => {
  const { user, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
    window.location.href = '/'
  }

  const features = [
    {
      icon: <IconChartBar size={24} />,
      title: 'Draft Analytics',
      description: 'Track your draft performance'
    },
    {
      icon: <IconBolt size={24} />,
      title: 'Smart Picks',
      description: 'AI-powered recommendations'
    },
    {
      icon: <IconClock size={24} />,
      title: 'Real-time Updates',
      description: 'Live draft assistance'
    }
  ]

  const comingSoon = [
    'Chrome extension for real-time draft assistance',
    'Advanced player analytics and rankings',
    'Team optimization and trade suggestions'
  ]

  return (
    <Box>
      {/* Header */}
      <Box 
        h={70} 
        p="md" 
        bg="var(--mantine-color-dark-6)"
        style={{ borderBottom: '1px solid var(--mantine-color-dark-4)' }}
      >
        <Group justify="space-between" h="100%">
          <Group>
            <ThemeIcon 
              size={32} 
              radius="md" 
              variant="gradient"
              gradient={{ from: 'green.6', to: 'green.7' }}
            >
              <IconLock size={20} />
            </ThemeIcon>
            <Title order={1} size="h3">Sacco</Title>
          </Group>
          <Group>
            <Text size="sm" c="dimmed">
              <IconUser size={14} style={{ display: 'inline', marginRight: 4 }} />
              {user?.email}
            </Text>
            <ActionIcon 
              variant="subtle" 
              color="gray" 
              onClick={handleSignOut}
              title="Sign out"
            >
              <IconLogout size={18} />
            </ActionIcon>
          </Group>
        </Group>
      </Box>

      {/* Main Content */}
      <Container size="xl" py="xl">
        <Stack gap="xl">
          {/* Welcome Section */}
          <Card>
            <Stack gap="lg">
              <Box>
                <Title order={2} size="h2" mb="xs">
                  Welcome back, {user?.email?.split('@')[0]}! 🏈
                </Title>
                <Text c="dimmed">
                  Ready to dominate your fantasy football draft?
                </Text>
              </Box>

              <Grid>
                {features.map((feature, index) => (
                  <Grid.Col key={index} span={{ base: 12, md: 4 }}>
                    <Card 
                      withBorder 
                      padding="lg" 
                      radius="md"
                      bg="var(--mantine-color-dark-5)"
                    >
                      <Group>
                        <ThemeIcon 
                          size={40} 
                          radius="md" 
                          variant="gradient"
                          gradient={{ from: 'green.6', to: 'green.7' }}
                        >
                          {feature.icon}
                        </ThemeIcon>
                        <Box>
                          <Text fw={600} size="lg">{feature.title}</Text>
                          <Text size="sm" c="dimmed">{feature.description}</Text>
                        </Box>
                      </Group>
                    </Card>
                  </Grid.Col>
                ))}
              </Grid>
            </Stack>
          </Card>

          {/* Quick Actions */}
          <Card>
            <Stack gap="lg">
              <Title order={3} size="h3">Quick Actions</Title>
              <Grid>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <Button
                    fullWidth
                    size="lg"
                    variant="gradient"
                    gradient={{ from: 'green.6', to: 'green.7' }}
                    leftSection={<IconPlus size={20} />}
                  >
                    Start New Draft
                  </Button>
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <Button
                    fullWidth
                    size="lg"
                    variant="outline"
                    leftSection={<IconHistory size={20} />}
                  >
                    View Draft History
                  </Button>
                </Grid.Col>
              </Grid>
            </Stack>
          </Card>

          {/* Coming Soon */}
          <Card>
            <Stack gap="lg">
              <Title order={3} size="h3">Coming Soon</Title>
              <Stack gap="xs">
                {comingSoon.map((item, index) => (
                  <Group key={index} gap="xs">
                    <Badge 
                      size="sm" 
                      variant="dot" 
                      color="green"
                      style={{ animation: 'pulse 2s infinite' }}
                    />
                    <Text size="sm" c="dimmed">{item}</Text>
                  </Group>
                ))}
              </Stack>
            </Stack>
          </Card>
        </Stack>
      </Container>
    </Box>
  )
}
