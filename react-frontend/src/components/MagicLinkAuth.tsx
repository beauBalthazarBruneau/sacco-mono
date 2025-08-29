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
  ThemeIcon,
  Radio,
  Group,
  Divider,
  Transition
} from '@mantine/core'
import { IconLock, IconMail, IconAlertCircle, IconCheck, IconKey, IconSend } from '@tabler/icons-react'
import { signInWithMagicLink, signInWithCode, verifyCode, resendCode } from '../lib/supabase'
import { CodeInput } from './CodeInput'

interface MagicLinkAuthProps {
  onSuccess?: () => void
}

type AuthMethod = 'magic-link' | 'code'
type AuthStep = 'method-selection' | 'code-input'

export const MagicLinkAuth: React.FC<MagicLinkAuthProps> = ({ onSuccess }) => {
  const [email, setEmail] = useState('')
  const [authMethod, setAuthMethod] = useState<AuthMethod>('code')
  const [authStep, setAuthStep] = useState<AuthStep>('method-selection')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error'>('success')
  const [codeValue, setCodeValue] = useState('')
  const [canResend, setCanResend] = useState(true)
  const [resendCountdown, setResendCountdown] = useState(0)

  // Handle magic link authentication
  const handleMagicLinkSubmit = async (e: React.FormEvent) => {
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
    } catch {
      setMessageType('error')
      setMessage('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Handle code authentication - send code
  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    
    setLoading(true)
    setMessage('')

    try {
      const { error } = await signInWithCode(email)
      
      if (error) {
        setMessageType('error')
        setMessage(error.message)
      } else {
        setMessageType('success')
        setMessage('6-digit code sent to your email!')
        setAuthStep('code-input')
        startResendCountdown()
      }
    } catch {
      setMessageType('error')
      setMessage('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Handle code verification
  const handleCodeComplete = async (code: string) => {
    setLoading(true)
    setMessage('')
    
    try {
      const { data, error } = await verifyCode(email, code)
      
      if (error) {
        setMessageType('error')
        setMessage(error.message || 'Invalid code. Please try again.')
        setCodeValue('') // Clear the code on error
      } else if (data?.user) {
        setMessageType('success')
        setMessage('Successfully signed in!')
        onSuccess?.()
      }
    } catch {
      setMessageType('error')
      setMessage('An unexpected error occurred. Please try again.')
      setCodeValue('') // Clear the code on error
    } finally {
      setLoading(false)
    }
  }

  // Handle resend code
  const handleResendCode = async () => {
    if (!canResend) return
    
    setLoading(true)
    setMessage('')
    
    try {
      const { error } = await resendCode(email)
      
      if (error) {
        setMessageType('error')
        setMessage(error.message)
      } else {
        setMessageType('success')
        setMessage('New code sent to your email!')
        setCodeValue('')
        startResendCountdown()
      }
    } catch {
      setMessageType('error')
      setMessage('Failed to resend code. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Start resend countdown (30 seconds)
  const startResendCountdown = () => {
    setCanResend(false)
    setResendCountdown(30)
    
    const interval = setInterval(() => {
      setResendCountdown((prev) => {
        if (prev <= 1) {
          setCanResend(true)
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  // Go back to method selection
  const handleBackToMethods = () => {
    setAuthStep('method-selection')
    setMessage('')
    setCodeValue('')
    setCanResend(true)
    setResendCountdown(0)
  }

  const handleSubmit = authMethod === 'magic-link' ? handleMagicLinkSubmit : handleCodeSubmit

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

          {authStep === 'method-selection' && (
            <>
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

                  <Box>
                    <Text size="sm" fw={500} mb="xs">
                      Choose sign-in method:
                    </Text>
                    <Radio.Group value={authMethod} onChange={setAuthMethod as any}>
                      <Stack gap="xs">
                        <Radio 
                          value="code" 
                          label={<Group gap="xs"><IconKey size={16} /> Send 6-digit code to email</Group>}
                        />
                        <Radio 
                          value="magic-link" 
                          label={<Group gap="xs"><IconSend size={16} /> Send magic link to email</Group>}
                        />
                      </Stack>
                    </Radio.Group>
                  </Box>

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
                    leftSection={authMethod === 'code' ? <IconKey size={16} /> : <IconSend size={16} />}
                  >
                    {loading 
                      ? (authMethod === 'code' ? 'Sending code...' : 'Sending magic link...') 
                      : (authMethod === 'code' ? 'Send 6-Digit Code' : 'Send Magic Link')
                    }
                  </Button>
                </Stack>
              </form>
            </>
          )}

          {authStep === 'code-input' && (
            <Transition mounted={true} transition="slide-up" duration={200}>
              {(styles) => (
                <Box style={{ ...styles, width: '100%' }}>
                  <Stack gap="md" align="center">
                    <Box ta="center">
                      <Text size="sm" c="dimmed" mb="xs">
                        We sent a 6-digit code to:
                      </Text>
                      <Text size="sm" fw={500}>
                        {email}
                      </Text>
                    </Box>

                    <CodeInput
                      length={6}
                      type="number"
                      onComplete={handleCodeComplete}
                      onChange={setCodeValue}
                      error={messageType === 'error' ? message : ''}
                      loading={loading}
                      size="md"
                    />

                    {message && messageType === 'success' && (
                      <Alert
                        icon={<IconCheck size={16} />}
                        color="green"
                        variant="light"
                      >
                        {message}
                      </Alert>
                    )}

                    <Group justify="center" gap="md">
                      <Button
                        variant="subtle"
                        size="sm"
                        onClick={handleBackToMethods}
                        disabled={loading}
                      >
                        ← Back
                      </Button>
                      
                      <Button
                        variant="subtle"
                        size="sm"
                        onClick={handleResendCode}
                        disabled={!canResend || loading}
                        loading={loading}
                      >
                        {canResend ? 'Resend Code' : `Resend in ${resendCountdown}s`}
                      </Button>
                    </Group>
                  </Stack>
                </Box>
              )}
            </Transition>
          )}

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
