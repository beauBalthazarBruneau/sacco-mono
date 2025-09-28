import React from 'react'
import { Container, Title, Text, Card, Avatar, Group, Stack, SimpleGrid, Box } from '@mantine/core'
import { IconStar } from '@tabler/icons-react'
import { motion } from 'framer-motion'

export const TestimonialsSection: React.FC = () => {
  const testimonials = [
    {
      name: 'Mike Rodriguez',
      role: 'League Champion 2024',
      avatar: '🏆',
      rating: 5,
      quote: "Sacco completely transformed my draft strategy. Went from last place to first in one season. The AI recommendations are spot-on every time."
    },
    {
      name: 'Sarah Chen',
      role: 'Fantasy Manager',
      avatar: '🎯',
      rating: 5,
      quote: "I was skeptical at first, but the data doesn't lie. Three consecutive playoff appearances and two championships since using Sacco."
    },
    {
      name: 'David Thompson',
      role: 'Commissioner',
      avatar: '📊',
      rating: 5,
      quote: "The real-time analytics during draft day gave me such an edge. My leaguemates are still wondering how I drafted so perfectly."
    },
    {
      name: 'Jessica Park',
      role: 'Fantasy Veteran',
      avatar: '🚀',
      rating: 5,
      quote: "After 10 years of mediocre finishes, Sacco helped me understand the game at a deeper level. Now I'm the one giving advice to others."
    },
    {
      name: 'Alex Johnson',
      role: 'Multiple League Winner',
      avatar: '💎',
      rating: 5,
      quote: "Managing 8 leagues used to be overwhelming. Sacco's insights keep me competitive across all my teams without the stress."
    },
    {
      name: 'Chris Martinez',
      role: 'Draft Day Expert',
      avatar: '🎪',
      rating: 5,
      quote: "The Chrome extension is a game-changer. Having all that data right there during the draft is like having a fantasy football PhD."
    }
  ]

  return (
    <Box
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #0a0a0a 0%, #1a1a1a 50%, #0c0c0c 100%)',
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
            Join the Winners
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
            Thousands of fantasy managers have already transformed their game with Sacco. 
            Here's what they're saying about their success.
          </Text>
        </motion.div>

        <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} spacing="xl">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
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
                  e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)'
                  e.currentTarget.style.backgroundColor = 'rgba(56, 189, 125, 0.08)'
                  e.currentTarget.style.borderColor = 'rgba(56, 189, 125, 0.25)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)'
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                }}
              >
                <Stack gap="lg">
                  {/* Rating Stars */}
                  <Group gap="xs">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <IconStar key={i} size={20} fill="#ffd43b" color="#ffd43b" />
                    ))}
                  </Group>
                  
                  {/* Quote */}
                  <Text
                    style={{
                      color: 'white',
                      fontSize: '1.1rem',
                      lineHeight: 1.6,
                      fontStyle: 'italic'
                    }}
                  >
                    "{testimonial.quote}"
                  </Text>
                  
                  {/* Author */}
                  <Group gap="md" mt="auto">
                    <Avatar
                      size={50}
                      radius="xl"
                      style={{
                        backgroundColor: '#38bd7d',
                        fontSize: '1.5rem'
                      }}
                    >
                      {testimonial.avatar}
                    </Avatar>
                    
                    <Stack gap={0}>
                      <Text
                        fw={600}
                        style={{
                          color: 'white',
                          fontSize: '1rem',
                          fontFamily: '"Montserrat", sans-serif'
                        }}
                      >
                        {testimonial.name}
                      </Text>
                      <Text
                        size="sm"
                        style={{
                          color: 'rgba(255, 255, 255, 0.6)'
                        }}
                      >
                        {testimonial.role}
                      </Text>
                    </Stack>
                  </Group>
                </Stack>
              </Card>
            </motion.div>
          ))}
        </SimpleGrid>
      </Container>
    </Box>
  )
}