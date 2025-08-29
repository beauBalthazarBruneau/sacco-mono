import React, { useState } from 'react'
import { Container, Paper, Title, Stack, Text, Button } from '@mantine/core'
import { CodeInput } from './CodeInput'

export const CodeInputDemo: React.FC = () => {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleCodeComplete = (completedCode: string) => {
    console.log('Code completed:', completedCode)
    setError('')
    
    // Simulate verification
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      if (completedCode === '123456') {
        alert('✅ Code verified successfully!')
        setCode('')
      } else {
        setError('Invalid code. Try 123456 for demo.')
      }
    }, 1000)
  }

  const handleCodeChange = (newCode: string) => {
    setCode(newCode)
    if (error) setError('') // Clear error when user starts typing
  }

  const handleClearCode = () => {
    setCode('')
    setError('')
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
          <Title order={2} ta="center">
            CodeInput Demo
          </Title>
          
          <Text c="dimmed" size="sm" ta="center">
            Try typing digits, pasting "123456", or using keyboard navigation
          </Text>

          <CodeInput
            length={6}
            type="number"
            onComplete={handleCodeComplete}
            onChange={handleCodeChange}
            error={error}
            loading={loading}
            size="md"
          />

          <Stack gap="xs" align="center">
            <Text size="sm">Current code: {code || '(empty)'}</Text>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearCode}
              disabled={loading}
            >
              Clear Code
            </Button>
          </Stack>

          <Stack gap="xs">
            <Text size="xs" c="dimmed">
              <strong>Features to test:</strong>
            </Text>
            <Text size="xs" c="dimmed">• Auto-navigation between inputs</Text>
            <Text size="xs" c="dimmed">• Backspace to go back</Text>
            <Text size="xs" c="dimmed">• Arrow keys for navigation</Text>
            <Text size="xs" c="dimmed">• Paste "123456" in first input</Text>
            <Text size="xs" c="dimmed">• Enter "123456" to see success</Text>
          </Stack>
        </Stack>
      </Paper>
    </Container>
  )
}

export default CodeInputDemo
