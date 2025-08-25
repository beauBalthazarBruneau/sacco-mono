import { MantineProvider } from '@mantine/core'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { theme } from './lib/mantine'
import { AuthProvider } from './contexts/AuthContext'
import { LandingPage } from './components/LandingPage'
import { SignUp } from './components/SignUp'
import { AuthCallback } from './components/AuthCallback'
import { PlayerBrowser } from './components/PlayerBrowser'
import { BlogPost } from './components/BlogPost'
import { ProtectedRoute } from './components/ProtectedRoute'
function App() {
  return (
    <HelmetProvider>
      <MantineProvider theme={theme} defaultColorScheme="dark">
        <AuthProvider>
          <Router>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
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
    </HelmetProvider>
  )
}

export default App
