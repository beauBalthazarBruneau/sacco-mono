import React, { useState } from 'react'
import { Container, Title, Text, Card, Button, SimpleGrid, Box, Badge, Stack, Group } from '@mantine/core'
import { IconCheck } from '@tabler/icons-react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { signInWithMagicLink } from '../../../lib/supabase'

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

  const plans = [
    {
      name: 'Free Trial',
      price: '$0',
      period: '3 draft picks',
      description: 'Perfect for testing our AI-powered recommendations',
      features: [
        '3 free draft picks with AI guidance',
        'Basic player analytics',
        'Matchup insights',
        'Chrome extension access'
      ],
      cta: 'Start Free Trial',
      popular: false,
      badge: 'Try Risk-Free'
    },
    {
      name: 'Pro Monthly',
      price: '$19',
      period: 'per month',
      description: 'Complete fantasy football domination toolkit',
      features: [
        'Unlimited AI draft assistance',
        'Advanced player analytics',
        'Waiver wire recommendations',
        'Trade analyzer',
        'Injury impact analysis',
        'Weekly lineup optimization',
        'Priority customer support'
      ],
      cta: 'Go Pro Monthly',
      popular: true,
      badge: 'Most Popular'
    },
    {
      name: 'Pro Annual',
      price: '$149',
      period: 'per year',
      description: 'Best value for serious fantasy managers',
      features: [
        'Everything in Pro Monthly',
        '4 months FREE (save $79)',
        'Exclusive draft strategy guides',
        'Early access to new features',
        'Personal fantasy consultant',
        'League analysis reports'
      ],
      cta: 'Go Pro Annual',
      popular: false,
      badge: 'Best Value'
    }
  ]

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
            Simple, Transparent Pricing
          </Title>
          
          <Text
            ta="center"
            size="xl"
            style={{
              color: 'rgba(255, 255, 255, 0.7)',
              marginBottom: '1rem',
              fontSize: '1.25rem',
              maxWidth: '600px',
              margin: '0 auto 1rem auto'
            }}
          >
            Start with a free trial. Upgrade when you're ready to dominate every league.
          </Text>

          <Text
            ta="center"
            style={{
              color: '#38bd7d',
              fontSize: '1.1rem',
              fontWeight: 600,
              marginBottom: '4rem',
              fontFamily: '"Montserrat", sans-serif'
            }}
          >
            💰 <strong>Full refund if you still finish last in your league!</strong>
          </Text>
        </motion.div>

        <SimpleGrid cols={{ base: 1, md: 3 }} spacing="xl">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
              viewport={{ once: true }}
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
                {plan.popular && (
                  <Badge
                    style={{
                      position: 'absolute',
                      top: '-12px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      backgroundColor: '#38bd7d',
                      color: 'white',
                      fontSize: '0.9rem',
                      padding: '8px 16px'
                    }}
                  >
                    {plan.badge}
                  </Badge>
                )}

                <Stack gap="lg" style={{ height: '100%' }}>
                  <Box>
                    <Badge
                      variant="outline"
                      color="teal"
                      size="sm"
                      style={{ marginBottom: '1rem' }}
                    >
                      {plan.badge}
                    </Badge>
                    
                    <Title
                      order={3}
                      style={{
                        color: 'white',
                        fontSize: '1.8rem',
                        fontWeight: 700,
                        marginBottom: '0.5rem',
                        fontFamily: '"Montserrat", sans-serif'
                      }}
                    >
                      {plan.name}
                    </Title>
                    
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
                    {plan.name === 'Free Trial' ? (
                      <Stack gap="sm">
                        <input
                          type="email"
                          placeholder="Enter your email"
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
                          {isLoading ? 'Starting Trial...' : plan.cta}
                        </Button>
                      </Stack>
                    ) : (
                      <Button
                        fullWidth
                        size="lg"
                        variant={plan.popular ? "filled" : "outline"}
                        style={{
                          backgroundColor: plan.popular ? '#38bd7d' : 'transparent',
                          borderColor: '#38bd7d',
                          color: plan.popular ? 'white' : '#38bd7d',
                          fontWeight: 700,
                          fontSize: '1.1rem',
                          fontFamily: '"Montserrat", sans-serif',
                          borderRadius: '8px',
                          padding: '16px'
                        }}
                        onClick={() => {
                          // For now, just scroll to free trial or navigate to sign up
                          window.scrollTo({ top: 0, behavior: 'smooth' })
                        }}
                      >
                        {plan.cta}
                      </Button>
                    )}
                  </Box>
                </Stack>
              </Card>
            </motion.div>
          ))}
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
            All plans include a 30-day money-back guarantee. Cancel anytime.
          </Text>
        </motion.div>
      </Container>
    </section>
  )
}
