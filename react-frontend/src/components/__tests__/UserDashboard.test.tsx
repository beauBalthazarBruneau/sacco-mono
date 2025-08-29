import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { MantineProvider } from '@mantine/core'
import { vi } from 'vitest'
import { UserDashboard } from '../UserDashboard'
import { AuthContext } from '../../contexts/AuthContext'
import { theme } from '../../lib/mantine'

// Mock Supabase
vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => ({ data: null, error: null })),
          order: vi.fn(() => ({ data: [], error: null }))
        }))
      }))
    }))
  }
}))

// Mock auth hook
vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'test-user', email: 'test@example.com' },
    signOut: vi.fn()
  })
}))

const MockAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const mockValue = {
    user: { id: 'test-user', email: 'test@example.com' },
    session: { access_token: 'test-token' },
    loading: false,
    signOut: vi.fn()
  }

  return (
    <AuthContext.Provider value={mockValue}>
      {children}
    </AuthContext.Provider>
  )
}

const renderUserDashboard = () => {
  return render(
    <MantineProvider theme={theme}>
      <MockAuthProvider>
        <BrowserRouter>
          <UserDashboard />
        </BrowserRouter>
      </MockAuthProvider>
    </MantineProvider>
  )
}

describe('UserDashboard', () => {
  it('renders the dashboard header', async () => {
    renderUserDashboard()
    
    await waitFor(() => {
      expect(screen.getByText('Sacco')).toBeInTheDocument()
    })
  })

  it('displays user email in header', async () => {
    renderUserDashboard()
    
    await waitFor(() => {
      expect(screen.getByText('test@example.com')).toBeInTheDocument()
    })
  })

  it('shows welcome message with username', async () => {
    renderUserDashboard()
    
    await waitFor(() => {
      expect(screen.getByText(/Welcome back, test!/)).toBeInTheDocument()
    })
  })

  it('displays Create New Draft button', async () => {
    renderUserDashboard()
    
    await waitFor(() => {
      expect(screen.getByText('Create New Draft')).toBeInTheDocument()
    })
  })

  it('shows Quick Actions section', async () => {
    renderUserDashboard()
    
    await waitFor(() => {
      expect(screen.getByText('Quick Actions')).toBeInTheDocument()
      expect(screen.getByText('Browse Players')).toBeInTheDocument()
      expect(screen.getByText('Billing')).toBeInTheDocument()
    })
  })

  it('displays Your Drafts section', async () => {
    renderUserDashboard()
    
    await waitFor(() => {
      expect(screen.getByText('Your Drafts')).toBeInTheDocument()
    })
  })
})
