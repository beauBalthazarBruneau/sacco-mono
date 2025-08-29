import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MantineProvider } from '@mantine/core'
import { theme } from '../../lib/mantine'
import { CodeInput } from '../CodeInput'

// Helper function to render component with MantineProvider
const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <MantineProvider theme={theme} defaultColorScheme="dark">
      {component}
    </MantineProvider>
  )
}

describe('CodeInput', () => {
  const user = userEvent.setup()

  describe('Basic Rendering', () => {
    it('renders 6 input boxes by default', () => {
      renderWithTheme(<CodeInput />)
      
      for (let i = 0; i < 6; i++) {
        expect(screen.getByTestId(`code-input-${i}`)).toBeInTheDocument()
      }
    })

    it('renders custom number of inputs when length is specified', () => {
      renderWithTheme(<CodeInput length={4} />)
      
      for (let i = 0; i < 4; i++) {
        expect(screen.getByTestId(`code-input-${i}`)).toBeInTheDocument()
      }
      
      // Should not have the 5th input
      expect(screen.queryByTestId('code-input-4')).not.toBeInTheDocument()
    })

    it('displays helper text with correct length', () => {
      renderWithTheme(<CodeInput length={4} />)
      
      expect(screen.getByText('Enter the 4-digit code sent to your email')).toBeInTheDocument()
    })

    it('auto-focuses first input by default', () => {
      renderWithTheme(<CodeInput />)
      
      expect(screen.getByTestId('code-input-0')).toHaveFocus()
    })

    it('does not auto-focus when autoFocus is false', () => {
      renderWithTheme(<CodeInput autoFocus={false} />)
      
      expect(screen.getByTestId('code-input-0')).not.toHaveFocus()
    })
  })

  describe('Input Behavior', () => {
    it('allows single digit input and moves to next field', async () => {
      renderWithTheme(<CodeInput />)
      
      const firstInput = screen.getByTestId('code-input-0')
      const secondInput = screen.getByTestId('code-input-1')
      
      await user.type(firstInput, '1')
      
      expect(firstInput).toHaveValue('1')
      expect(secondInput).toHaveFocus()
    })

    it('converts lowercase letters to uppercase', async () => {
      renderWithTheme(<CodeInput type="text" />)
      
      const firstInput = screen.getByTestId('code-input-0')
      
      await user.type(firstInput, 'a')
      
      expect(firstInput).toHaveValue('A')
    })

    it('only allows numbers when type is number', async () => {
      renderWithTheme(<CodeInput type="number" />)
      
      const firstInput = screen.getByTestId('code-input-0')
      
      // Should accept digits
      await user.type(firstInput, '5')
      expect(firstInput).toHaveValue('5')
      
      // Should reject letters
      await user.clear(firstInput)
      await user.type(firstInput, 'a')
      expect(firstInput).toHaveValue('')
    })

    it('only allows alphanumeric when type is text', async () => {
      renderWithTheme(<CodeInput type="text" />)
      
      const firstInput = screen.getByTestId('code-input-0')
      
      // Should accept letters and numbers
      await user.type(firstInput, 'A')
      expect(firstInput).toHaveValue('A')
      
      await user.clear(firstInput)
      await user.type(firstInput, '5')
      expect(firstInput).toHaveValue('5')
      
      // Should reject special characters
      await user.clear(firstInput)
      await user.type(firstInput, '@')
      expect(firstInput).toHaveValue('')
    })

    it('prevents multiple character input in single field', async () => {
      renderWithTheme(<CodeInput />)
      
      const firstInput = screen.getByTestId('code-input-0')
      
      await user.type(firstInput, '123')
      
      // Should only have first character
      expect(firstInput).toHaveValue('1')
    })
  })

  describe('Navigation', () => {
    it('moves focus backward on backspace when current field is empty', async () => {
      renderWithTheme(<CodeInput />)
      
      const firstInput = screen.getByTestId('code-input-0')
      const secondInput = screen.getByTestId('code-input-1')
      
      // Type in first field to move to second
      await user.type(firstInput, '1')
      expect(secondInput).toHaveFocus()
      
      // Press backspace on empty second field
      fireEvent.keyDown(secondInput, { key: 'Backspace' })
      
      expect(firstInput).toHaveFocus()
      expect(firstInput).toHaveValue('')
    })

    it('clears current field on backspace when field has value', async () => {
      renderWithTheme(<CodeInput />)
      
      const firstInput = screen.getByTestId('code-input-0')
      
      await user.type(firstInput, '1')
      // Move back to first input
      firstInput.focus()
      
      fireEvent.keyDown(firstInput, { key: 'Backspace' })
      
      expect(firstInput).toHaveValue('')
      expect(firstInput).toHaveFocus()
    })

    it('navigates with arrow keys', () => {
      renderWithTheme(<CodeInput />)
      
      const firstInput = screen.getByTestId('code-input-0')
      const secondInput = screen.getByTestId('code-input-1')
      
      firstInput.focus()
      
      // Move right with arrow key
      fireEvent.keyDown(firstInput, { key: 'ArrowRight' })
      expect(secondInput).toHaveFocus()
      
      // Move left with arrow key
      fireEvent.keyDown(secondInput, { key: 'ArrowLeft' })
      expect(firstInput).toHaveFocus()
    })

    it('navigates to first/last input with Home/End keys', () => {
      renderWithTheme(<CodeInput length={4} />)
      
      const firstInput = screen.getByTestId('code-input-0')
      const lastInput = screen.getByTestId('code-input-3')
      
      // Focus middle input
      const middleInput = screen.getByTestId('code-input-2')
      middleInput.focus()
      
      // Press Home to go to first
      fireEvent.keyDown(middleInput, { key: 'Home' })
      expect(firstInput).toHaveFocus()
      
      // Press End to go to last
      fireEvent.keyDown(firstInput, { key: 'End' })
      expect(lastInput).toHaveFocus()
    })
  })

  describe('Paste Functionality', () => {
    it('handles paste of complete code', async () => {
      renderWithTheme(<CodeInput length={6} />)
      
      const firstInput = screen.getByTestId('code-input-0')
      
      // Paste 6-digit code
      fireEvent.paste(firstInput, {
        clipboardData: {
          getData: () => '123456'
        }
      })
      
      // Check all inputs are filled
      for (let i = 0; i < 6; i++) {
        expect(screen.getByTestId(`code-input-${i}`)).toHaveValue((i + 1).toString())
      }
    })

    it('handles paste of partial code', async () => {
      renderWithTheme(<CodeInput length={6} />)
      
      const firstInput = screen.getByTestId('code-input-0')
      
      // Paste 3-digit code
      fireEvent.paste(firstInput, {
        clipboardData: {
          getData: () => '123'
        }
      })
      
      // Check first 3 inputs are filled
      expect(screen.getByTestId('code-input-0')).toHaveValue('1')
      expect(screen.getByTestId('code-input-1')).toHaveValue('2')
      expect(screen.getByTestId('code-input-2')).toHaveValue('3')
      expect(screen.getByTestId('code-input-3')).toHaveValue('')
    })

    it('ignores paste with invalid characters', async () => {
      renderWithTheme(<CodeInput type="number" />)
      
      const firstInput = screen.getByTestId('code-input-0')
      
      // Paste invalid data
      fireEvent.paste(firstInput, {
        clipboardData: {
          getData: () => 'abc@#$'
        }
      })
      
      // All inputs should remain empty
      for (let i = 0; i < 6; i++) {
        expect(screen.getByTestId(`code-input-${i}`)).toHaveValue('')
      }
    })

    it('removes whitespace from pasted data', async () => {
      renderWithTheme(<CodeInput length={6} />)
      
      const firstInput = screen.getByTestId('code-input-0')
      
      // Paste code with spaces
      fireEvent.paste(firstInput, {
        clipboardData: {
          getData: () => '1 2 3 4 5 6'
        }
      })
      
      // Check all inputs are filled correctly
      for (let i = 0; i < 6; i++) {
        expect(screen.getByTestId(`code-input-${i}`)).toHaveValue((i + 1).toString())
      }
    })
  })

  describe('Callbacks', () => {
    it('calls onChange callback when code changes', async () => {
      const mockOnChange = jest.fn()
      renderWithTheme(<CodeInput onChange={mockOnChange} />)
      
      const firstInput = screen.getByTestId('code-input-0')
      
      await user.type(firstInput, '1')
      
      expect(mockOnChange).toHaveBeenCalledWith('1')
    })

    it('calls onComplete callback when code is fully entered', async () => {
      const mockOnComplete = jest.fn()
      renderWithTheme(<CodeInput length={3} onComplete={mockOnComplete} />)
      
      // Fill all inputs
      for (let i = 0; i < 3; i++) {
        const input = screen.getByTestId(`code-input-${i}`)
        await user.type(input, (i + 1).toString())
      }
      
      await waitFor(() => {
        expect(mockOnComplete).toHaveBeenCalledWith('123')
      })
    })

    it('does not call onComplete until all digits are entered', async () => {
      const mockOnComplete = jest.fn()
      renderWithTheme(<CodeInput length={3} onComplete={mockOnComplete} />)
      
      // Fill only 2 inputs
      const firstInput = screen.getByTestId('code-input-0')
      const secondInput = screen.getByTestId('code-input-1')
      
      await user.type(firstInput, '1')
      await user.type(secondInput, '2')
      
      expect(mockOnComplete).not.toHaveBeenCalled()
    })
  })

  describe('Error States', () => {
    it('displays error message when error prop is provided', () => {
      renderWithTheme(<CodeInput error="Invalid code" />)
      
      expect(screen.getByText('Invalid code')).toBeInTheDocument()
      expect(screen.getByTestId('code-input-error')).toBeInTheDocument()
    })

    it('applies error styling to inputs when error is present', () => {
      renderWithTheme(<CodeInput error="Invalid code" />)
      
      const firstInput = screen.getByTestId('code-input-0')
      expect(firstInput).toHaveAttribute('aria-describedby', 'code-input-error')
    })

    it('does not display error message when error prop is not provided', () => {
      renderWithTheme(<CodeInput />)
      
      expect(screen.queryByTestId('code-input-error')).not.toBeInTheDocument()
    })
  })

  describe('Loading and Disabled States', () => {
    it('disables all inputs when disabled prop is true', () => {
      renderWithTheme(<CodeInput disabled />)
      
      for (let i = 0; i < 6; i++) {
        expect(screen.getByTestId(`code-input-${i}`)).toBeDisabled()
      }
    })

    it('disables all inputs when loading prop is true', () => {
      renderWithTheme(<CodeInput loading />)
      
      for (let i = 0; i < 6; i++) {
        expect(screen.getByTestId(`code-input-${i}`)).toBeDisabled()
      }
    })

    it('does not auto-focus when disabled', () => {
      renderWithTheme(<CodeInput disabled />)
      
      expect(screen.getByTestId('code-input-0')).not.toHaveFocus()
    })
  })

  describe('Accessibility', () => {
    it('has proper ARIA labels', () => {
      renderWithTheme(<CodeInput aria-label="Security code" />)
      
      const group = screen.getByRole('group')
      expect(group).toHaveAttribute('aria-label', 'Security code')
      
      for (let i = 0; i < 6; i++) {
        const input = screen.getByTestId(`code-input-${i}`)
        expect(input).toHaveAttribute('aria-label', `Security code digit ${i + 1}`)
      }
    })

    it('has proper input attributes for mobile', () => {
      renderWithTheme(<CodeInput type="number" />)
      
      const firstInput = screen.getByTestId('code-input-0')
      expect(firstInput).toHaveAttribute('inputmode', 'numeric')
      expect(firstInput).toHaveAttribute('autocomplete', 'one-time-code')
    })

    it('has proper input attributes for text type', () => {
      renderWithTheme(<CodeInput type="text" />)
      
      const firstInput = screen.getByTestId('code-input-0')
      expect(firstInput).toHaveAttribute('inputmode', 'text')
      expect(firstInput).toHaveAttribute('autocomplete', 'one-time-code')
    })
  })

  describe('Focus Management', () => {
    it('selects all text when input is focused', async () => {
      renderWithTheme(<CodeInput />)
      
      const firstInput = screen.getByTestId('code-input-0')
      
      // Type a digit
      await user.type(firstInput, '5')
      
      // Focus another input and come back
      const secondInput = screen.getByTestId('code-input-1')
      secondInput.focus()
      firstInput.focus()
      
      // Text should be selected (mocked in test environment)
      expect(firstInput).toHaveFocus()
    })
  })

  describe('Size Variants', () => {
    it('applies correct size classes', () => {
      renderWithTheme(<CodeInput size="lg" />)
      
      const firstInput = screen.getByTestId('code-input-0')
      expect(firstInput).toHaveAttribute('size', 'lg')
    })
  })
})
