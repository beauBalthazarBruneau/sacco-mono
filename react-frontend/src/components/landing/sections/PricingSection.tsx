import React, { useState } from 'react'
import { Container, Title, Text, Card, Button, Box, Badge, Stack, Group, SimpleGrid } from '@mantine/core'
import { IconCheck } from '@tabler/icons-react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { signInWithMagicLink } from '../../../lib/supabase'
import saccoPricing from '../../../assets/landing_page_gallery/sacco-pricing.jpg'

export const PricingSection: React.FC = () => {
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

  const plan = {
    name: 'Sacco Draft Assistant',
    price: '$10',
    period: 'one-time payment',
    description: 'Start with 3 FREE picks, then pay only if you want more',
    features: [
      '3 FREE draft picks before any payment',
      'Works with any fantasy platform',
      'Advanced player analytics and rankings',
      'Unlimited picks after payment',
      'Full refund if you finish last in your league',
      'No subscription, no recurring fees'
    ],
    cta: 'Start Free Trial',
    popular: true,
    badge: 'Risk-Free Guarantee'
  }

  return (
    <section
      id="pricing"
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
            No subscription, just buy us a six pack.
          </Title>
          
          <Text
            ta="center"
            size="xl"
            style={{
              color: 'rgba(255, 255, 255, 0.7)',
              marginBottom: '1rem',
              fontSize: '1.25rem',
              maxWidth: '600px',
              fontWeight: 600,
              margin: '0 auto 4rem auto'
            }}
          >
            Full refund if you finish last in your league.
          </Text>


        </motion.div>

        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl" style={{ alignItems: 'center' }}>
          {/* Left Column - Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            viewport={{ once: true }}
          >
            <Box>
              <Title
                order={3}
                style={{
                  fontSize: '2.5rem',
                  fontWeight: 700,
                  color: 'white',
                  fontFamily: '"Montserrat", sans-serif',
                  marginBottom: '1.5rem'
                }}
              >
                We're Beau & Rui
              </Title>
              
              <Box style={{ position: 'relative' }}>
                <img
                  src={saccoPricing}
                  alt="Beau & Rui - The team behind Sacco"
                  style={{
                    width: '200px',
                    height: 'auto',
                    borderRadius: '12px',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                    float: 'right',
                    margin: '0 0 1rem 1.5rem',
                    shapeOutside: 'margin-box'
                  }}
                />
                
                <Text
                  style={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontSize: '1.25rem',
                    lineHeight: 1.6,
                    marginBottom: '0',
                    textAlign: 'justify'
                  }}
                >
                  We're two engineers who came up with Sacco at 3AM one night after a few too many beers. Rui is getting his PhD and Beau vibe codes. So we decided to make Rui's mathematical approach to fantasy accessible to everyone. Sacco basically takes an economic approach to fantasy, where we treat draft picks like a free market, analyzing demand and supply of outstanding players. We're not trying to get rich, but we like beer!
                </Text>
              </Box>
            </Box>
          </motion.div>

          {/* Right Column - Pricing Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            viewport={{ once: true }}
            style={{ display: 'flex', justifyContent: 'center' }}
          >
              <Card
                style={{
                  backgroundColor: plan.popular ? 'rgba(56, 189, 125, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                  border: plan.popular ? '2px solid #38bd7d' : '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '16px',
                  padding: '2rem',
                  height: '100%',
                  backdropFilter: 'blur(10px)',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  transform: plan.popular ? 'scale(1.05)' : 'scale(1)'
                }}
                onMouseEnter={(e) => {
                  if (!plan.popular) {
                    e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)'
                    e.currentTarget.style.backgroundColor = 'rgba(56, 189, 125, 0.08)'
                    e.currentTarget.style.borderColor = 'rgba(56, 189, 125, 0.25)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!plan.popular) {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)'
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                  }
                }}
              >
                {plan.popular}

                <Stack gap="lg" style={{ height: '100%' }}>
                <Title
                      order={3}
                      style={{
                        color: 'white',
                        fontSize: '1.8rem',
                        fontWeight: 700,
                        fontFamily: '"Montserrat", sans-serif'
                      }}
                    >
                      {plan.name}
                    </Title>
                  <Box>
                    <Badge
                      variant="outline"
                      color="teal"
                      size="sm"
                      style={{ marginBottom: '1rem' }}
                    >
                      {plan.badge}
                    </Badge>
                    <Badge
                      variant="outline"
                      color="white"
                      size="sm"
                      style={{ marginBottom: '1rem', marginLeft: '1rem' }}
                    >
                      Unlimited drafts & leagues for one season
                    </Badge>
                    

                    
                    <Group align="baseline" gap="xs" mb="sm">
                      <Text
                        style={{
                          color: 'white',
                          fontSize: '3rem',
                          fontWeight: 800,
                          lineHeight: 1,
                          fontFamily: '"Montserrat", sans-serif'
                        }}
                      >
                        {plan.price}
                      </Text>
                      <Text
                        style={{
                          color: 'rgba(255, 255, 255, 0.6)',
                          fontSize: '1.1rem'
                        }}
                      >
                        {plan.period}
                      </Text>
                    </Group>
                    
                    <Text
                      style={{
                        color: 'rgba(255, 255, 255, 0.7)',
                        marginBottom: '2rem'
                      }}
                    >
                      {plan.description}
                    </Text>
                  </Box>

                  <Stack gap="sm" style={{ flex: 1 }}>
                    {plan.features.map((feature, featureIndex) => (
                      <Group key={featureIndex} gap="sm" align="flex-start">
                        <IconCheck 
                          size={18} 
                          color="#38bd7d" 
                          style={{ marginTop: '2px', flexShrink: 0 }} 
                        />
                        <Text
                          style={{
                            color: 'rgba(255, 255, 255, 0.8)',
                            fontSize: '0.95rem',
                            lineHeight: 1.4
                          }}
                        >
                          {feature}
                        </Text>
                      </Group>
                    ))}
                  </Stack>

                  <Box mt="auto">
                    <Stack gap="sm">
                      <input
                        type="email"
                        placeholder="Enter your email to start free trial"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSignUp()}
                        style={{
                          padding: '12px 16px',
                          fontSize: '1rem',
                          borderRadius: '8px',
                          border: '2px solid rgba(255, 255, 255, 0.2)',
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          color: 'white',
                          fontFamily: '"Montserrat", sans-serif',
                          width: '100%',
                          outline: 'none'
                        }}
                      />
                      <Button
                        fullWidth
                        size="lg"
                        onClick={handleSignUp}
                        disabled={isLoading || !email}
                        style={{
                          backgroundColor: '#38bd7d',
                          border: 'none',
                          fontWeight: 700,
                          fontSize: '1.1rem',
                          fontFamily: '"Montserrat", sans-serif',
                          borderRadius: '8px',
                          padding: '16px'
                        }}
                      >
                        {isLoading ? 'Starting Free Trial...' : 'Get 3 FREE Picks'}
                      </Button>
                    </Stack>
                  </Box>
                </Stack>
              </Card>
          </motion.div>
        </SimpleGrid>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
          viewport={{ once: true }}
        >
          <Text
            ta="center"
            style={{
              color: 'rgba(255, 255, 255, 0.6)',
              fontSize: '0.9rem',
              marginTop: '2rem',
              fontStyle: 'italic'
            }}
          >
            Start with 3 free picks. No payment required until you decide to continue.
          </Text>
        </motion.div>
      </Container>
    </section>
  )
}
