import React, { useState, useRef, useEffect, KeyboardEvent, ClipboardEvent } from 'react'
import { Box, Input, Stack, Text, Alert } from '@mantine/core'
import Icon from './Icon'

interface CodeInputProps {
  /** Number of code digits (default: 6) */
  length?: number
  /** Callback fired when code is complete */
  onComplete?: (code: string) => void
  /** Callback fired when code changes */
  onChange?: (code: string) => void
  /** Error message to display */
  error?: string
  /** Loading state */
  loading?: boolean
  /** Disabled state */
  disabled?: boolean
  /** Placeholder character for empty inputs */
  placeholder?: string
  /** Size of the input boxes */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  /** Whether to auto-focus the first input on mount */
  autoFocus?: boolean
  /** ARIA label for accessibility */
  'aria-label'?: string
  /** Input type (text or number) */
  type?: 'text' | 'number'
}

export const CodeInput: React.FC<CodeInputProps> = ({
  length = 6,
  onComplete,
  onChange,
  error,
  loading = false,
  disabled = false,
  placeholder = '',
  size = 'md',
  autoFocus = true,
  'aria-label': ariaLabel = 'Verification code',
  type = 'text'
}) => {
  const [values, setValues] = useState<string[]>(Array(length).fill(''))
  const inputRefs = useRef<(HTMLInputElement | null)[]>(Array(length).fill(null))

  // Auto-focus first input on mount
  useEffect(() => {
    if (autoFocus && inputRefs.current[0] && !disabled) {
      inputRefs.current[0].focus()
    }
  }, [autoFocus, disabled])

  // Call onChange and onComplete when values change
  useEffect(() => {
    const code = values.join('')
    onChange?.(code)
    
    if (code.length === length && !code.includes('')) {
      onComplete?.(code)
    }
  }, [values, length, onChange, onComplete])

  const handleInputChange = (index: number, value: string) => {
    // Only allow single characters for individual inputs
    if (value.length > 1) return

    // Only allow numbers for number type, or alphanumeric for text type
    if (type === 'number' && value && !/^\d$/.test(value)) return
    if (type === 'text' && value && !/^[a-zA-Z0-9]$/.test(value)) return

    const newValues = [...values]
    newValues[index] = value.toUpperCase()
    setValues(newValues)

    // Auto-focus next input if value is entered
    if (value && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace
    if (e.key === 'Backspace') {
      e.preventDefault()
      
      if (values[index]) {
        // Clear current input
        const newValues = [...values]
        newValues[index] = ''
        setValues(newValues)
      } else if (index > 0) {
        // Move to previous input and clear it
        const newValues = [...values]
        newValues[index - 1] = ''
        setValues(newValues)
        inputRefs.current[index - 1]?.focus()
      }
    }
    
    // Handle arrow keys for navigation
    if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault()
      inputRefs.current[index - 1]?.focus()
    }
    
    if (e.key === 'ArrowRight' && index < length - 1) {
      e.preventDefault()
      inputRefs.current[index + 1]?.focus()
    }

    // Handle home/end keys
    if (e.key === 'Home') {
      e.preventDefault()
      inputRefs.current[0]?.focus()
    }
    
    if (e.key === 'End') {
      e.preventDefault()
      inputRefs.current[length - 1]?.focus()
    }
  }

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    
    const pasteData = e.clipboardData?.getData('text') || ''
    const cleanData = pasteData.replace(/\s/g, '') // Remove whitespace
    
    // Validate pasted data
    const regex = type === 'number' ? /^\d+$/ : /^[a-zA-Z0-9]+$/
    if (!cleanData || !regex.test(cleanData)) return
    
    // Take only the number of characters we need
    const pasteValues = cleanData.slice(0, length).split('')
    
    const newValues = [...values]
    pasteValues.forEach((char, index) => {
      if (index < length) {
        newValues[index] = char.toUpperCase()
      }
    })
    
    setValues(newValues)
    
    // Focus the next empty input or the last input
    const nextEmptyIndex = newValues.findIndex(val => !val)
    const focusIndex = nextEmptyIndex === -1 ? length - 1 : Math.min(nextEmptyIndex, length - 1)
    inputRefs.current[focusIndex]?.focus()
  }

  const handleFocus = (index: number) => {
    // Select all text when focusing
    inputRefs.current[index]?.select()
  }

  // Calculate input box size based on size prop
  const getInputSize = () => {
    const sizeMap = {
      xs: { width: 32, height: 32, fontSize: 'xs' },
      sm: { width: 40, height: 40, fontSize: 'sm' },
      md: { width: 48, height: 48, fontSize: 'md' },
      lg: { width: 56, height: 56, fontSize: 'lg' },
      xl: { width: 64, height: 64, fontSize: 'xl' }
    }
    return sizeMap[size]
  }

  const inputSize = getInputSize()

  return (
    <Stack gap="sm">
      <Box
        style={{
          display: 'flex',
          gap: size === 'xs' || size === 'sm' ? 8 : 12,
          justifyContent: 'center',
          alignItems: 'center'
        }}
        role="group"
        aria-label={ariaLabel}
      >
        {values.map((value, index) => (
          <Input
            key={index}
            ref={(ref) => (inputRefs.current[index] = ref)}
            value={value}
            onChange={(e) => handleInputChange(index, e.currentTarget.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={index === 0 ? handlePaste : undefined} // Only allow paste on first input
            onFocus={() => handleFocus(index)}
            placeholder={placeholder}
            disabled={disabled || loading}
            error={!!error}
            maxLength={1}
            size={size}
            style={{
              width: inputSize.width,
              height: inputSize.height,
              textAlign: 'center',
              fontSize: `var(--mantine-font-size-${inputSize.fontSize})`,
              fontWeight: 600,
              fontFamily: 'monospace',
              transition: 'all 0.2s ease',
            }}
            styles={{
              input: {
                textAlign: 'center',
                fontWeight: 600,
                fontSize: `var(--mantine-font-size-${inputSize.fontSize})`,
                fontFamily: 'monospace',
                '&:focus': {
                  transform: 'scale(1.05)',
                  borderColor: error ? 'var(--mantine-color-red-6)' : 'var(--mantine-color-green-6)',
                  boxShadow: error 
                    ? '0 0 0 2px var(--mantine-color-red-1)' 
                    : '0 0 0 2px var(--mantine-color-green-1)',
                },
                '&[data-disabled]': {
                  opacity: 0.6,
                  cursor: 'not-allowed',
                },
                ...(loading && {
                  opacity: 0.7,
                  cursor: 'wait',
                }),
                ...(error && {
                  borderColor: 'var(--mantine-color-red-6)',
                  '&:focus': {
                    borderColor: 'var(--mantine-color-red-6)',
                  }
                })
              }
            }}
            aria-label={`${ariaLabel} digit ${index + 1}`}
            aria-describedby={error ? 'code-input-error' : undefined}
            inputMode={type === 'number' ? 'numeric' : 'text'}
            autoComplete="one-time-code"
            data-testid={`code-input-${index}`}
          />
        ))}
      </Box>

      {error && (
        <Alert
          icon={<Icon name="alert-circle" size={16} />}
          color="red"
          variant="light"
          id="code-input-error"
          data-testid="code-input-error"
        >
          {error}
        </Alert>
      )}

      <Text size="xs" c="dimmed" ta="center">
        Enter the {length}-digit code sent to your email
      </Text>
    </Stack>
  )
}

export default CodeInput
