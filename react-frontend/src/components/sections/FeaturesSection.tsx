import React from 'react'
import { Container, Title, Text, SimpleGrid, Card, ThemeIcon, Stack, Box } from '@mantine/core'
import { IconTrophy, IconBrain, IconChartLine, IconUsers } from '@tabler/icons-react'
import { motion } from 'framer-motion'

export const FeaturesSection: React.FC = () => {
  const features = [
    {
      icon: IconTrophy,
      title: 'Win Your League',
      description: 'Advanced algorithms and real-time data analysis to give you the competitive edge you need to dominate your fantasy league.'
    },
    {
      icon: IconBrain,
      title: 'Smart Draft Assistant',
      description: 'AI-powered draft recommendations based on player value, team needs, and advanced statistical modeling.'
    },
    {
      icon: IconChartLine,
      title: 'Player Analytics',
      description: 'Deep dive into player performance metrics, injury reports, and matchup analysis to make informed decisions.'
    },
    {
      icon: IconUsers,
      title: 'Community Insights',
      description: 'Connect with other fantasy managers and share strategies, tips, and insights to improve your game.'
    }
  ]

  return (
    <Box
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #0c0c0c 0%, #1a1a1a 50%, #0a0a0a 100%)',
        padding: '80px 0',
        display: 'flex',
        alignItems: 'center'
      }}
    >
      <Container size="xl">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
        >
          <Title
            order={2}
            ta="center"
            style={{
              fontSize: '3.5rem',
              fontWeight: 800,
              color: 'white',
              marginBottom: '1rem',
              fontFamily: '"Montserrat", sans-serif'
            }}
          >
            Why Sacco Dominates
          </Title>
          
          <Text
            ta="center"
            size="xl"
            style={{
              color: 'rgba(255, 255, 255, 0.7)',
              marginBottom: '4rem',
              fontSize: '1.25rem',
              maxWidth: '600px',
              margin: '0 auto 4rem auto'
            }}
          >
            Stop relying on gut feelings and outdated advice. Our platform combines cutting-edge analytics 
            with real-time insights to transform you from league loser to fantasy champion.
          </Text>
        </motion.div>

        <SimpleGrid cols={{ base: 1, md: 2, lg: 4 }} spacing="xl">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
              viewport={{ once: true }}
            >
              <Card
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '16px',
                  padding: '2rem',
                  height: '100%',
                  backdropFilter: 'blur(10px)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)'
                  e.currentTarget.style.backgroundColor = 'rgba(56, 189, 125, 0.1)'
                  e.currentTarget.style.borderColor = 'rgba(56, 189, 125, 0.3)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                }}
              >
                <Stack align="center" gap="lg">
                  <ThemeIcon
                    size={60}
                    radius="md"
                    style={{
                      backgroundColor: '#38bd7d',
                      color: 'white'
                    }}
                  >
                    <feature.icon size={30} />
                  </ThemeIcon>
                  
                  <Title
                    order={3}
                    ta="center"
                    style={{
                      color: 'white',
                      fontSize: '1.5rem',
                      fontWeight: 700,
                      fontFamily: '"Montserrat", sans-serif'
                    }}
                  >
                    {feature.title}
                  </Title>
                  
                  <Text
                    ta="center"
                    style={{
                      color: 'rgba(255, 255, 255, 0.7)',
                      lineHeight: 1.6
                    }}
                  >
                    {feature.description}
                  </Text>
                </Stack>
              </Card>
            </motion.div>
          ))}
        </SimpleGrid>
      </Container>
    </Box>
  )
}