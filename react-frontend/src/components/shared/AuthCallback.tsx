import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { Container, Title, Text, Box, Loader } from '@mantine/core'

export const AuthCallback: React.FC = () => {
  const navigate = useNavigate()
  const [isProcessing, setIsProcessing] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    console.log('AuthCallback component mounted')
    console.log('Current URL:', window.location.href)

    const handleAuthCallback = async () => {
      console.log('Starting auth callback handler')

      if (!supabase) {
        console.error('Supabase not available')
        setError('Authentication service not available.')
        setIsProcessing(false)
        return
      }

      // Add a small delay to ensure Supabase has processed the URL
      await new Promise(resolve => setTimeout(resolve, 1000))

      try {
        console.log('Checking for session...')
        const { data, error } = await supabase.auth.getSession()

        console.log('Session check result:', {
          hasSession: !!data.session,
          hasUser: !!data.session?.user,
          error: error?.message
        })

        if (error) {
          console.error('Session error:', error)
          setError(`Authentication failed: ${error.message}`)
          setIsProcessing(false)
          return
        }

        if (data.session) {
          console.log('Session found, navigating to dashboard')
          navigate('/dashboard', { replace: true })
        } else {
          console.log('No session found')
          setError('No session found. Please try the magic link again.')
          setIsProcessing(false)
        }
      } catch (err) {
        console.error('Unexpected auth callback error:', err)
        setError('An unexpected error occurred.')
        setIsProcessing(false)
      }
    }

    handleAuthCallback()
  }, [navigate])

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
        {isProcessing ? (
          <>
            <Loader size="lg" color="green" style={{ marginBottom: '2rem' }} />
            <Title 
              order={1} 
              size="2rem" 
              fw={700}
              style={{ 
                color: 'white',
                marginBottom: '1rem',
                fontFamily: '"Montserrat", sans-serif'
              }}
            >
              Verifying Your Email
            </Title>
            <Text 
              size="lg" 
              style={{ 
                color: 'rgba(255, 255, 255, 0.8)',
                fontFamily: '"Montserrat", sans-serif'
              }}
            >
              Please wait while we authenticate your email...
            </Text>
          </>
        ) : (
          <>
            <Title 
              order={1} 
              size="2rem" 
              fw={700}
              style={{ 
                color: '#ef4444',
                marginBottom: '1rem',
                fontFamily: '"Montserrat", sans-serif'
              }}
            >
              Authentication Failed
            </Title>
            <Text 
              size="lg" 
              style={{ 
                color: 'rgba(255, 255, 255, 0.8)',
                fontFamily: '"Montserrat", sans-serif',
                marginBottom: '2rem'
              }}
            >
              {error}
            </Text>
            <button
              onClick={() => navigate('/')}
              style={{
                padding: '12px 24px',
                backgroundColor: '#38bd7d',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: 600,
                fontFamily: '"Montserrat", sans-serif',
                cursor: 'pointer'
              }}
            >
              Back to Home
            </button>
          </>
        )}
      </Container>
    </Box>
  )
}
