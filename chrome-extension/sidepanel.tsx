import { MantineProvider } from '@mantine/core'
import { AuthProvider } from './contexts/AuthContext'
import { useAuth } from './hooks/useAuth'
import { Login } from './components/Login'
import { UserProfile } from './components/UserProfile'
import { Loader, Center } from '@mantine/core'

function AuthenticatedApp() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <Center style={{ height: '100vh' }}>
        <Loader size="lg" />
      </Center>
    )
  }

  if (!user) {
    return <Login />
  }

  return <UserProfile />
}

function IndexSidePanel() {
  return (
    <MantineProvider>
      <AuthProvider>
        <AuthenticatedApp />
      </AuthProvider>
    </MantineProvider>
  )
}

export default IndexSidePanel
