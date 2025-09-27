import { MantineProvider } from '@mantine/core'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { theme } from './lib/mantine'
import { AuthProvider } from './contexts/AuthContext'
import { LandingPage, BlogPost } from './components/landing'
import { SignUp, AuthCallback, ProtectedRoute } from './components/shared'
import { Dashboard, PlayerBrowser } from './components/app'
function App() {
  return (
    <MantineProvider theme={theme} defaultColorScheme="dark">
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/players" 
              element={
                <ProtectedRoute>
                  <PlayerBrowser />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </Router>
      </AuthProvider>
    </MantineProvider>
  )
}

export default App
