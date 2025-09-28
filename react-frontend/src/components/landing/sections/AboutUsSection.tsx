import React, { useState } from 'react'
import { Container, Title, Text, Card, Button, SimpleGrid, Box, Avatar, Stack, Group } from '@mantine/core'
import { IconBrain, IconCode, IconTrophy, IconRocket } from '@tabler/icons-react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { signInWithMagicLink } from '../../../lib/supabase'

export const AboutUsSection: React.FC = () => {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleSignUp = async () => {
    if (!email) return
    
    setIsLoading(true)
    try {
      const { error } = await signInWithMagicLink(email)
      if (error) {
        console.error('Error sending magic link:', error)
      } else {
        navigate('/signup')
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const teamStats = [
    {
      icon: IconCode,
      value: '10+',
      label: 'Years of Experience',
      description: 'Combined software engineering experience'
    },
    {
      icon: IconBrain,
      value: '1M+',
      label: 'Data Points',
      description: 'Analyzed daily for better predictions'
    },
    {
      icon: IconTrophy,
      value: '85%',
      label: 'Win Rate',
      description: 'Average improvement in league standings'
    },
    {
      icon: IconRocket,
      value: '10K+',
      label: 'Happy Users',
      description: 'Fantasy managers using Sacco'
    }
  ]

  return (
    <section
      id="about"
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #1a1a1a 0%, #0c0c0c 50%, #1a1a1a 100%)',
        padding: '80px 0',
        display: 'flex',
        alignItems: 'center'
      }}
    >
      <Container size="xl">
        <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="xl" style={{ alignItems: 'center' }}>
          {/* Content Side */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true }}
          >
            <Title
              order={2}
              style={{
                fontSize: '3.5rem',
                fontWeight: 800,
                color: 'white',
                marginBottom: '1.5rem',
                fontFamily: '"Montserrat", sans-serif'
              }}
            >
              Built by Engineers,
              <br />
              <span style={{ color: '#38bd7d' }}>Powered by Passion</span>
            </Title>
            
            <Text
              size="lg"
              style={{
                color: 'rgba(255, 255, 255, 0.8)',
                marginBottom: '2rem',
                fontSize: '1.2rem',
                lineHeight: 1.6
              }}
            >
              We're a team of <strong style={{ color: '#38bd7d' }}>Georgia Tech engineers</strong> who 
              got tired of losing our fantasy leagues to friends who seemed to have some secret sauce. 
              Instead of accepting defeat, we decided to build our own.
            </Text>

            <Text
              size="lg"
              style={{
                color: 'rgba(255, 255, 255, 0.8)',
                marginBottom: '2rem',
                fontSize: '1.2rem',
                lineHeight: 1.6
              }}
            >
              After countless hours analyzing player data, studying game theory, and testing algorithms, 
              we created Sacco—the AI-powered fantasy football assistant that turns analytical thinking 
              into championship victories.
            </Text>

            <Text
              style={{
                color: 'rgba(255, 255, 255, 0.7)',
                marginBottom: '2rem',
                fontSize: '1.1rem',
                lineHeight: 1.6,
                fontStyle: 'italic'
              }}
            >
              "We built Sacco because we believe every fantasy manager deserves access to the same 
              advanced analytics that professional sports teams use. No more guessing, no more gut feelings—just 
              data-driven decisions that win championships."
            </Text>

            <Box style={{ marginBottom: '2rem' }}>
              <Stack gap="sm">
                <input
                  type="email"
                  placeholder="Enter your email to start winning"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSignUp()}
                  style={{
                    padding: '16px 20px',
                    fontSize: '1.1rem',
                    borderRadius: '12px',
                    border: '2px solid rgba(255, 255, 255, 0.2)',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    fontFamily: '"Montserrat", sans-serif',
                    width: '100%',
                    outline: 'none'
                  }}
                />
                <Button
                  size="lg"
                  onClick={handleSignUp}
                  disabled={isLoading || !email}
                  style={{
                    backgroundColor: '#38bd7d',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '1.2rem',
                    fontFamily: '"Montserrat", sans-serif',
                    borderRadius: '12px',
                    padding: '18px 32px',
                    width: '100%'
                  }}
                >
                  {isLoading ? 'Starting Your Journey...' : 'Join the Engineering Advantage'}
                </Button>
              </Stack>
            </Box>
          </motion.div>

          {/* Stats Side */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            viewport={{ once: true }}
          >
            <SimpleGrid cols={{ base: 2, sm: 2 }} spacing="lg">
              {teamStats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 + 0.4, ease: "easeOut" }}
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
                      transition: 'all 0.3s ease',
                      textAlign: 'center'
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
                    <Stack align="center" gap="md">
                      <Avatar
                        size={60}
                        radius="xl"
                        style={{
                          backgroundColor: '#38bd7d',
                          color: 'white'
                        }}
                      >
                        <stat.icon size={30} />
                      </Avatar>
                      
                      <Title
                        order={3}
                        style={{
                          color: 'white',
                          fontSize: '2.5rem',
                          fontWeight: 800,
                          lineHeight: 1,
                          fontFamily: '"Montserrat", sans-serif'
                        }}
                      >
                        {stat.value}
                      </Title>
                      
                      <Text
                        fw={600}
                        style={{
                          color: '#38bd7d',
                          fontSize: '1.1rem',
                          fontFamily: '"Montserrat", sans-serif'
                        }}
                      >
                        {stat.label}
                      </Text>
                      
                      <Text
                        ta="center"
                        style={{
                          color: 'rgba(255, 255, 255, 0.7)',
                          fontSize: '0.9rem',
                          lineHeight: 1.4
                        }}
                      >
                        {stat.description}
                      </Text>
                    </Stack>
                  </Card>
                </motion.div>
              ))}
            </SimpleGrid>

            {/* Additional Team Info */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8, ease: "easeOut" }}
              viewport={{ once: true }}
            >
              <Card
                style={{
                  backgroundColor: 'rgba(56, 189, 125, 0.1)',
                  border: '1px solid rgba(56, 189, 125, 0.3)',
                  borderRadius: '16px',
                  padding: '2rem',
                  marginTop: '2rem',
                  backdropFilter: 'blur(10px)'
                }}
              >
                <Stack align="center" gap="md">
                  <Group gap="sm">
                    <Avatar size={40} style={{ backgroundColor: '#FFB400', fontSize: '1.2rem' }}>
                      🐝
                    </Avatar>
                    <Text
                      fw={700}
                      style={{
                        color: 'white',
                        fontSize: '1.3rem',
                        fontFamily: '"Montserrat", sans-serif'
                      }}
                    >
                      Georgia Tech Engineers
                    </Text>
                  </Group>
                  
                  <Text
                    ta="center"
                    style={{
                      color: 'rgba(255, 255, 255, 0.9)',
                      fontSize: '1rem',
                      lineHeight: 1.5
                    }}
                  >
                    Combining rigorous engineering principles with deep fantasy football knowledge 
                    to create the most advanced draft assistant ever built.
                  </Text>
                </Stack>
              </Card>
            </motion.div>
          </motion.div>
        </SimpleGrid>
      </Container>
    </section>
  )
}
