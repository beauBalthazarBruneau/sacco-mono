import React from 'react'
import { Navigate } from 'react-router-dom'
import { Box, Loader, Container, Title } from '@mantine/core'
import { useAuth } from '../../hooks/useAuth'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading, profileLoading } = useAuth()

  if (loading) {
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
          <Loader size="lg" color="green" style={{ marginBottom: '2rem' }} />
          <Title
            order={1}
            size="2rem"
            fw={700}
            style={{
              color: 'white',
              fontFamily: '"Montserrat", sans-serif'
            }}
          >
            {profileLoading ? 'Setting up your profile...' : 'Loading...'}
          </Title>
        </Container>
      </Box>
    )
  }

  if (!user) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
