import React, { useEffect, useState } from 'react'
import { 
  Container, 
  Paper, 
  Title, 
  Text, 
  Button, 
  Stack, 
  ThemeIcon,
  Box
} from '@mantine/core'
import { IconAlertCircle, IconLoader } from '@tabler/icons-react'
import { supabase } from '../lib/supabase'

export const AuthCallback: React.FC = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          setError(error.message)
        } else if (data.session) {
          // Successfully authenticated, redirect to dashboard
          window.location.href = '/dashboard'
        } else {
          setError('No session found')
        }
      } catch (err) {
        setError('An unexpected error occurred')
      } finally {
        setLoading(false)
      }
    }

    handleAuthCallback()
  }, [])

  if (loading) {
    return (
      <Container size="xs" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
        <Paper 
          radius="lg" 
          p="xl" 
          withBorder 
          style={{ width: '100%' }}
          bg="var(--mantine-color-dark-7)"
        >
          <Stack gap="lg" align="center">
            <ThemeIcon 
              size={80} 
              radius="xl" 
              variant="gradient"
              gradient={{ from: 'green.6', to: 'green.7' }}
            >
              <IconLoader size={40} style={{ animation: 'spin 1s linear infinite' }} />
            </ThemeIcon>
            
            <Box ta="center">
              <Title order={1} size="h2" mb="xs">
                Completing sign in...
              </Title>
              <Text c="dimmed">
                Please wait while we authenticate you
              </Text>
            </Box>
          </Stack>
        </Paper>
      </Container>
    )
  }

  if (error) {
    return (
      <Container size="xs" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
        <Paper 
          radius="lg" 
          p="xl" 
          withBorder 
          style={{ width: '100%' }}
          bg="var(--mantine-color-dark-7)"
        >
          <Stack gap="lg" align="center">
            <ThemeIcon 
              size={80} 
              radius="xl" 
              color="red"
            >
              <IconAlertCircle size={40} />
            </ThemeIcon>
            
            <Box ta="center">
              <Title order={1} size="h2" mb="xs">
                Sign in failed
              </Title>
              <Text c="dimmed" mb="lg">{error}</Text>
            </Box>

            <Button
              variant="gradient"
              gradient={{ from: 'green.6', to: 'green.7' }}
              onClick={() => window.location.href = '/'}
            >
              Try again
            </Button>
          </Stack>
        </Paper>
      </Container>
    )
  }

  return null
}
