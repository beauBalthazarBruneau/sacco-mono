import React from 'react'
import { 
  Container, 
  Title, 
  Text, 
  Button, 
  Group, 
  Stack, 
  Card, 
  ThemeIcon,
  Box,
  Grid,
  Badge,
  ActionIcon
} from '@mantine/core'
import { 
  IconLock, 
  IconChartBar, 
  IconBolt, 
  IconClock, 
  IconArrowRight,
  IconStar,
  IconUsers,
  IconTrophy,
  IconBrain,
  IconTarget,
  IconQuote
} from '@tabler/icons-react'

export const LandingPage: React.FC = () => {
  const features = [
    {
      icon: <IconBrain size={32} />,
      title: 'AI-Powered Picks',
      description: 'Advanced algorithms analyze player data, team needs, and draft position to recommend the best picks in real-time.'
    },
    {
      icon: <IconChartBar size={32} />,
      title: 'Draft Analytics',
      description: 'Track your draft performance with detailed analytics, player rankings, and team optimization insights.'
    },
    {
      icon: <IconClock size={32} />,
      title: 'Real-time Updates',
      description: 'Get instant notifications and live updates as the draft progresses, ensuring you never miss a crucial pick.'
    },
    {
      icon: <IconTarget size={32} />,
      title: 'Smart Targeting',
      description: 'Identify sleepers, avoid busts, and target the right players at the right time with our intelligent recommendations.'
    },
    {
      icon: <IconUsers size={32} />,
      title: 'League Insights',
      description: 'Analyze your league mates\' tendencies and draft strategies to gain a competitive advantage.'
    },
    {
      icon: <IconTrophy size={32} />,
      title: 'Championship Focus',
      description: 'Every recommendation is designed to help you build a championship-caliber team from day one.'
    }
  ]

  const testimonials = [
    {
      name: 'Mike Johnson',
      league: '12-Team PPR',
      text: 'Sacco helped me win my league last year. The AI recommendations were spot on!',
      rating: 5
    },
    {
      name: 'Sarah Chen',
      league: '10-Team Standard',
      text: 'Finally, a tool that actually understands fantasy football strategy. Game changer!',
      rating: 5
    },
    {
      name: 'David Rodriguez',
      league: '14-Team Dynasty',
      text: 'The real-time updates and player insights gave me a huge advantage over my league mates.',
      rating: 5
    }
  ]

  return (
    <Box>
      {/* Hero Section */}
      <Box 
        style={{
          background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0c0c0c 100%)',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Background Pattern */}
        <Box
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 20% 80%, rgba(56, 189, 125, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(56, 189, 125, 0.05) 0%, transparent 50%)',
            pointerEvents: 'none'
          }}
        />

        <Container size="lg" py="xl" style={{ position: 'relative', zIndex: 1 }}>
          <Grid gutter={50} align="center" justify="center">
            <Grid.Col span={{ base: 12, md: 7 }}>
              <Stack gap="xl" align="center" ta="center">
                <Box>
                  <Badge 
                    size="xl" 
                    variant="gradient" 
                    gradient={{ from: 'green.6', to: 'green.7' }}
                    mb="xl"
                    style={{ fontSize: '1rem', padding: '12px 24px' }}
                  >
                    🏈 AI-Powered Fantasy Football Draft Assistant
                  </Badge>
                  
                  {/* Large Quote */}
                  <Box mb="xl">
                    <IconQuote 
                      size={48} 
                      style={{ 
                        color: 'var(--mantine-color-green-6)', 
                        marginBottom: '1rem',
                        opacity: 0.8
                      }} 
                    />
                    <Title 
                      order={1} 
                      size="4.5rem" 
                      fw={800}
                      style={{ 
                        lineHeight: 1.1,
                        background: 'linear-gradient(135deg, #ffffff 0%, #e0e0e0 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        marginBottom: '1rem'
                      }}
                    >
                      "Dominate Your
                      <Text 
                        component="span" 
                        variant="gradient" 
                        gradient={{ from: 'green.6', to: 'green.7' }}
                        inherit
                        style={{ WebkitTextFillColor: 'unset' }}
                      >
                        {' '}Draft
                      </Text>
                      <br />
                      Like a Pro"
                    </Title>
                  </Box>

                  <Text 
                    size="1.5rem" 
                    c="dimmed" 
                    mb="xl"
                    style={{ 
                      lineHeight: 1.4,
                      maxWidth: '600px',
                      fontWeight: 400
                    }}
                  >
                    Stop guessing. Start winning. Our AI analyzes thousands of data points to give you 
                    the edge you need to build championship teams.
                  </Text>
                </Box>

                {/* Bold CTA */}
                <Box>
                  <Button 
                    size="xl" 
                    variant="gradient"
                    gradient={{ from: 'green.6', to: 'green.7' }}
                    rightSection={<IconArrowRight size={24} />}
                    style={{
                      fontSize: '1.25rem',
                      padding: '20px 40px',
                      borderRadius: '12px',
                      fontWeight: 700,
                      boxShadow: '0 8px 32px rgba(56, 189, 125, 0.3)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 12px 40px rgba(56, 189, 125, 0.4)'
                      }
                    }}
                  >
                    SIGN UP NOW
                  </Button>
                  
                  <Text size="sm" c="dimmed" mt="md" style={{ fontWeight: 500 }}>
                    Join 10,000+ fantasy players already winning championships
                  </Text>
                </Box>

                {/* Social Proof */}
                <Group gap="xl" mt="xl" justify="center">
                  <Group gap="xs">
                    <IconStar size={20} style={{ color: 'var(--mantine-color-yellow-4)' }} />
                    <Text size="sm" fw={600}>4.9/5 Rating</Text>
                  </Group>
                  <Group gap="xs">
                    <IconUsers size={20} style={{ color: 'var(--mantine-color-blue-4)' }} />
                    <Text size="sm" fw={600}>10,000+ Users</Text>
                  </Group>
                  <Group gap="xs">
                    <IconTrophy size={20} style={{ color: 'var(--mantine-color-yellow-4)' }} />
                    <Text size="sm" fw={600}>78% Championship Rate</Text>
                  </Group>
                </Group>
              </Stack>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 5 }}>
              <Box ta="center">
                <Card 
                  withBorder 
                  p="xl" 
                  radius="xl"
                  bg="var(--mantine-color-dark-6)"
                  style={{ 
                    borderColor: 'var(--mantine-color-dark-4)',
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
                    maxWidth: '500px',
                    margin: '0 auto'
                  }}
                >
                  <Stack gap="lg">
                    <Group justify="center">
                      <ThemeIcon 
                        size={48} 
                        radius="md" 
                        variant="gradient"
                        gradient={{ from: 'green.6', to: 'green.7' }}
                      >
                        <IconLock size={24} />
                      </ThemeIcon>
                      <Box>
                        <Title order={3} size="h4">Sacco</Title>
                        <Text c="dimmed">Your AI Draft Assistant</Text>
                      </Box>
                    </Group>

                    <Box>
                      <Text fw={600} mb="xs">Current Pick: Round 3, Pick 28</Text>
                      <Text size="sm" c="dimmed" mb="md">Your team needs: RB, WR</Text>
                      
                      <Stack gap="sm">
                        <Card p="md" radius="md" bg="var(--mantine-color-dark-5)">
                          <Group>
                            <ThemeIcon size={32} radius="md" color="green">
                              <IconBolt size={16} />
                            </ThemeIcon>
                            <Box>
                              <Text fw={600} size="sm">Recommended: Breece Hall</Text>
                              <Text size="xs" c="dimmed">RB • NYJ • 95% confidence</Text>
                            </Box>
                          </Group>
                        </Card>

                        <Card p="md" radius="md" bg="var(--mantine-color-dark-5)">
                          <Group>
                            <ThemeIcon size={32} radius="md" color="blue">
                              <IconTarget size={16} />
                            </ThemeIcon>
                            <Box>
                              <Text fw={600} size="sm">Alternative: DeVonta Smith</Text>
                              <Text size="xs" c="dimmed">WR • PHI • 87% confidence</Text>
                            </Box>
                          </Group>
                        </Card>
                      </Stack>
                    </Box>
                  </Stack>
                </Card>
              </Box>
            </Grid.Col>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container size="lg" py="xl">
        <Box ta="center" mb="xl">
          <Title order={2} size="3rem" mb="md" fw={700}>
            Why Choose Sacco?
          </Title>
          <Text size="xl" c="dimmed" maw={700} mx="auto" style={{ lineHeight: 1.5 }}>
            Built by fantasy football experts and powered by advanced AI, 
            Sacco gives you the tools to dominate your draft and win championships.
          </Text>
        </Box>

        <Grid gutter="xl" justify="center">
          {features.map((feature, index) => (
            <Grid.Col key={index} span={{ base: 12, md: 6, lg: 4 }}>
              <Card 
                withBorder 
                p="xl" 
                radius="lg"
                h="100%"
                style={{ 
                  borderColor: 'var(--mantine-color-dark-4)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 24px rgba(0, 0, 0, 0.2)'
                  }
                }}
              >
                <Stack gap="md" align="center" ta="center">
                  <ThemeIcon 
                    size={64} 
                    radius="xl" 
                    variant="gradient"
                    gradient={{ from: 'green.6', to: 'green.7' }}
                  >
                    {feature.icon}
                  </ThemeIcon>
                  <Title order={3} size="h4">{feature.title}</Title>
                  <Text c="dimmed" style={{ lineHeight: 1.6 }}>{feature.description}</Text>
                </Stack>
              </Card>
            </Grid.Col>
          ))}
        </Grid>
      </Container>

      {/* Testimonials Section */}
      <Box bg="var(--mantine-color-dark-7)" py="xl">
        <Container size="lg">
          <Box ta="center" mb="xl">
            <Title order={2} size="3rem" mb="md" fw={700}>
              What Our Users Say
            </Title>
            <Text size="xl" c="dimmed" maw={700} mx="auto" style={{ lineHeight: 1.5 }}>
              Join thousands of fantasy football players who have transformed their draft experience with Sacco.
            </Text>
          </Box>

          <Grid gutter="xl" justify="center">
            {testimonials.map((testimonial, index) => (
              <Grid.Col key={index} span={{ base: 12, md: 4 }}>
                <Card 
                  withBorder 
                  p="xl" 
                  radius="lg"
                  h="100%"
                  bg="var(--mantine-color-dark-6)"
                  style={{ 
                    borderColor: 'var(--mantine-color-dark-4)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 12px 24px rgba(0, 0, 0, 0.2)'
                    }
                  }}
                >
                  <Stack gap="md">
                    <Group justify="center">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <IconStar 
                          key={i} 
                          size={16} 
                          style={{ color: 'var(--mantine-color-yellow-4)' }} 
                        />
                      ))}
                    </Group>
                    <Text style={{ fontStyle: 'italic', lineHeight: 1.6 }} size="lg" ta="center">"{testimonial.text}"</Text>
                    <Box ta="center">
                      <Text fw={600} size="lg">{testimonial.name}</Text>
                      <Text size="sm" c="dimmed">{testimonial.league}</Text>
                    </Box>
                  </Stack>
                </Card>
              </Grid.Col>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Container size="lg" py="xl">
        <Card 
          withBorder 
          p="xl" 
          radius="xl"
          ta="center"
          bg="var(--mantine-color-dark-6)"
          style={{ 
            borderColor: 'var(--mantine-color-dark-4)',
            background: 'linear-gradient(135deg, var(--mantine-color-dark-6) 0%, var(--mantine-color-dark-5) 100%)'
          }}
        >
          <Stack gap="lg" align="center">
            <Title order={2} size="3rem" fw={700}>
              Ready to Dominate Your Draft?
            </Title>
            <Text size="xl" c="dimmed" maw={700} style={{ lineHeight: 1.5 }}>
              Join thousands of fantasy football players who are already winning championships with Sacco.
            </Text>
            <Group gap="md" mt="md" justify="center">
              <Button 
                size="xl" 
                variant="gradient"
                gradient={{ from: 'green.6', to: 'green.7' }}
                rightSection={<IconArrowRight size={24} />}
                style={{
                  fontSize: '1.25rem',
                  padding: '20px 40px',
                  borderRadius: '12px',
                  fontWeight: 700,
                  boxShadow: '0 8px 32px rgba(56, 189, 125, 0.3)'
                }}
              >
                SIGN UP NOW
              </Button>
              <Button 
                size="xl" 
                variant="outline"
                color="gray"
                style={{
                  fontSize: '1.25rem',
                  padding: '20px 40px',
                  borderRadius: '12px',
                  fontWeight: 600
                }}
              >
                Learn More
              </Button>
            </Group>
          </Stack>
        </Card>
      </Container>
    </Box>
  )
}
