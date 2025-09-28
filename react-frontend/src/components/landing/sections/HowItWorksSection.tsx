import React from 'react'
import { Container, Title, Text, Timeline, Box, Card, Group, Avatar } from '@mantine/core'
import { IconDownload, IconBrain, IconTrophy, IconRocket } from '@tabler/icons-react'
import { motion } from 'framer-motion'

export const HowItWorksSection: React.FC = () => {
  const steps = [
    {
      icon: IconDownload,
      title: 'Install the Extension',
      description: 'Get our Chrome extension and connect to your favorite fantasy platform instantly.',
      color: '#38bd7d'
    },
    {
      icon: IconBrain,
      title: 'AI Analysis',
      description: 'Our advanced algorithms analyze millions of data points in real-time.',
      color: '#4dabf7'
    },
    {
      icon: IconTrophy,
      title: 'Make Smart Picks',
      description: 'Get personalized recommendations for every draft pick and waiver decision.',
      color: '#ff6b6b'
    },
    {
      icon: IconRocket,
      title: 'Dominate Your League',
      description: 'Watch as your strategic advantage transforms you into a fantasy champion.',
      color: '#ffd43b'
    }
  ]

  return (
    <Box
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #1a1a1a 0%, #0c0c0c 50%, #1a1a1a 100%)',
        padding: '80px 0',
        display: 'flex',
        alignItems: 'center'
      }}
    >
      <Container size="lg">
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
            How It Works
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
            From installation to championship in four simple steps. 
            Let our AI do the heavy lifting while you enjoy the victories.
          </Text>
        </motion.div>

        <Timeline
          active={-1}
          bulletSize={80}
          lineWidth={4}
          style={{
            '--timeline-line-color': 'rgba(56, 189, 125, 0.3)'
          }}
        >
          {steps.map((step, index) => (
            <Timeline.Item
              key={step.title}
              bullet={
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  whileInView={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2, ease: "easeOut" }}
                  viewport={{ once: true }}
                >
                  <Avatar
                    size={60}
                    radius="xl"
                    style={{
                      backgroundColor: step.color,
                      border: '3px solid rgba(255, 255, 255, 0.1)'
                    }}
                  >
                    <step.icon size={30} color="white" />
                  </Avatar>
                </motion.div>
              }
            >
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 + 0.3, ease: "easeOut" }}
                viewport={{ once: true }}
              >
                <Card
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '12px',
                    padding: '2rem',
                    marginBottom: '2rem',
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  <Group align="flex-start" gap="lg">
                    <Box style={{ flex: 1 }}>
                      <Title
                        order={3}
                        style={{
                          color: 'white',
                          fontSize: '1.5rem',
                          fontWeight: 700,
                          marginBottom: '0.5rem',
                          fontFamily: '"Montserrat", sans-serif'
                        }}
                      >
                        {step.title}
                      </Title>
                      
                      <Text
                        style={{
                          color: 'rgba(255, 255, 255, 0.7)',
                          lineHeight: 1.6,
                          fontSize: '1.1rem'
                        }}
                      >
                        {step.description}
                      </Text>
                    </Box>
                  </Group>
                </Card>
              </motion.div>
            </Timeline.Item>
          ))}
        </Timeline>
      </Container>
    </Box>
  )
}