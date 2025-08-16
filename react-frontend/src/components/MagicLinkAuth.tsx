import React, { useState } from 'react'
import { 
  Container, 
  Paper, 
  Title, 
  Text, 
  TextInput, 
  Button, 
  Stack, 
  Alert,
  Box,
  ThemeIcon
} from '@mantine/core'
import { IconLock, IconMail, IconAlertCircle, IconCheck } from '@tabler/icons-react'
import { signInWithMagicLink } from '../lib/supabase'

interface MagicLinkAuthProps {
  onSuccess?: () => void
}

export const MagicLinkAuth: React.FC<MagicLinkAuthProps> = ({ onSuccess }) => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error'>('success')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const { error } = await signInWithMagicLink(email)
      
      if (error) {
        setMessageType('error')
        setMessage(error.message)
      } else {
        setMessageType('success')
        setMessage('Check your email for the magic link!')
        onSuccess?.()
      }
    } catch (error) {
      setMessageType('error')
      setMessage('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

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
            <IconLock size={40} />
          </ThemeIcon>

          <Box ta="center">
            <Title order={1} size="h2" mb="xs">
              Welcome to Sacco
            </Title>
            <Text c="dimmed" size="sm">
              Your fantasy football draft assistant
            </Text>
          </Box>

          <form onSubmit={handleSubmit} style={{ width: '100%' }}>
            <Stack gap="md">
              <TextInput
                label="Email address"
                placeholder="Enter your email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftSection={<IconMail size={16} />}
                size="md"
              />

              {message && (
                <Alert
                  icon={messageType === 'success' ? <IconCheck size={16} /> : <IconAlertCircle size={16} />}
                  title={messageType === 'success' ? 'Success' : 'Error'}
                  color={messageType === 'success' ? 'green' : 'red'}
                  variant="light"
                >
                  {message}
                </Alert>
              )}

              <Button
                type="submit"
                loading={loading}
                size="md"
                fullWidth
                variant="gradient"
                gradient={{ from: 'green.6', to: 'green.7' }}
              >
                {loading ? 'Sending magic link...' : 'Send Magic Link'}
              </Button>
            </Stack>
          </form>

          <Text size="xs" c="dimmed" ta="center">
            By continuing, you agree to our{' '}
            <Text component="a" href="#" c="green.4" style={{ textDecoration: 'none' }}>
              Terms of Service
            </Text>{' '}
            and{' '}
            <Text component="a" href="#" c="green.4" style={{ textDecoration: 'none' }}>
              Privacy Policy
            </Text>
          </Text>
        </Stack>
      </Paper>
    </Container>
  )
}
