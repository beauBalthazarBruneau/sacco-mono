import { MantineProvider } from '@mantine/core'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { theme } from './lib/mantine'
import { AuthProvider } from './contexts/AuthContext'
import { LandingPage } from './components/LandingPage'
import { SignUp } from './components/SignUp'
import { AuthCallback } from './components/AuthCallback'
import { PlayerBrowser } from './components/PlayerBrowser'
import { BlogPost } from './components/BlogPost'
import { ProtectedRoute } from './components/ProtectedRoute'
import { BillingDashboard } from './components/BillingDashboard'
import { PaymentSetup } from './components/PaymentSetup'
import { UserDashboard } from './components/UserDashboard'
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
              path="/players" 
              element={
                <ProtectedRoute>
                  <PlayerBrowser />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/billing" 
              element={
                <ProtectedRoute>
                  <BillingDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/billing/payment-setup" 
              element={
                <ProtectedRoute>
                  <PaymentSetup />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <UserDashboard />
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
