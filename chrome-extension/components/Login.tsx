import { useState } from 'react'
import { 
  TextInput, 
  Button, 
  Paper, 
  Title, 
  Text, 
  Container,
  Alert,
  Loader
} from '@mantine/core'
import { IconMail, IconCheck, IconAlertCircle } from '@tabler/icons-react'
import { useAuth } from '../hooks/useAuth'

export const Login = () => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { signInWithMagicLink } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { error } = await signInWithMagicLink(email)
      if (error) {
        setError(error.message)
      } else {
        setSent(true)
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <Container size="sm" py="xl">
        <Paper shadow="md" p="xl" radius="md">
          <div style={{ textAlign: 'center' }}>
            <IconCheck size={48} color="green" style={{ margin: '0 auto 16px' }} />
            <Title order={2} mb="md">Check your email!</Title>
            <Text c="dimmed" mb="lg">
              We've sent a magic link to <strong>{email}</strong>
            </Text>
            <Text size="sm" c="dimmed">
              Click the link in your email to sign in to Sacco.
            </Text>
            <Button 
              variant="subtle" 
              mt="md"
              onClick={() => {
                setSent(false)
                setEmail('')
              }}
            >
              Try a different email
            </Button>
          </div>
        </Paper>
      </Container>
    )
  }

  return (
    <Container size="sm" py="xl">
      <Paper shadow="md" p="xl" radius="md">
        <Title order={2} ta="center" mb="lg">
          Welcome to Sacco
        </Title>
        <Text c="dimmed" ta="center" mb="xl">
          Sign in to your account to get started
        </Text>

        <form onSubmit={handleSubmit}>
          <TextInput
            label="Email address"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftSection={<IconMail size={16} />}
            required
            type="email"
            mb="md"
          />

          {error && (
            <Alert 
              icon={<IconAlertCircle size={16} />} 
              title="Error" 
              color="red" 
              mb="md"
            >
              {error}
            </Alert>
          )}

          <Button 
            type="submit" 
            fullWidth 
            loading={loading}
            leftSection={loading ? <Loader size={16} /> : <IconMail size={16} />}
          >
            {loading ? 'Sending...' : 'Send magic link'}
          </Button>
        </form>
      </Paper>
    </Container>
  )
}
