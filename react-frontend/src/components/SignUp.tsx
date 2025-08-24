import React from 'react'
import { Container, Title, Text, Box, Button } from '@mantine/core'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export const SignUp: React.FC = () => {
  const [searchParams] = useSearchParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const isAuthenticated = searchParams.get('authenticated') === 'true' || !!user

  const handleGetStarted = () => {
    navigate('/players')
  }

  return (
    <Box
      style={{
        height: '100vh',
        width: '100vw',
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0c0c0c 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <Container size="lg" style={{ textAlign: 'center' }}>
        {isAuthenticated ? (
          <>
            <Title 
              order={1} 
              size="4rem" 
              fw={900}
              style={{ 
                color: 'white',
                marginBottom: '2rem',
                fontFamily: '"Montserrat", sans-serif'
              }}
            >
              Welcome to Sacco! 🎉
            </Title>
            <Text 
              size="xl" 
              style={{ 
                color: 'rgba(255, 255, 255, 0.8)',
                fontFamily: '"Montserrat", sans-serif',
                marginBottom: '1rem'
              }}
            >
              Your email ({user?.email}) has been successfully verified. You're now ready to dominate your fantasy drafts!
            </Text>
            <Text 
              size="lg" 
              style={{ 
                color: 'rgba(255, 255, 255, 0.6)',
                fontFamily: '"Montserrat", sans-serif',
                marginBottom: '3rem'
              }}
            >
              You're logged in and ready to go!
            </Text>
            <Button 
              size="lg"
              variant="filled"
              onClick={handleGetStarted}
              style={{
                fontSize: '1.25rem',
                padding: '16px 32px',
                borderRadius: '12px',
                fontWeight: 700,
                backgroundColor: '#38bd7d',
                border: 'none',
                color: 'white',
                fontFamily: '"Montserrat", sans-serif'
              }}
            >
              Browse Player Database
            </Button>
          </>
        ) : (
          <>
            <Title 
              order={1} 
              size="4rem" 
              fw={900}
              style={{ 
                color: 'white',
                marginBottom: '2rem',
                fontFamily: '"Montserrat", sans-serif'
              }}
            >
              Check Your Email
            </Title>
            <Text 
              size="xl" 
              style={{ 
                color: 'rgba(255, 255, 255, 0.8)',
                fontFamily: '"Montserrat", sans-serif'
              }}
            >
              We've sent you a magic link to sign up for Sacco.
            </Text>
          </>
        )}
      </Container>
    </Box>
  )
}
