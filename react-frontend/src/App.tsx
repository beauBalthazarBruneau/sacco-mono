import { MantineProvider } from '@mantine/core'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { theme } from './lib/mantine'
import { AuthProvider } from './contexts/AuthContext'
import { LandingPage } from './components/LandingPage'
import { SignUp } from './components/SignUp'
import { AuthCallback } from './components/AuthCallback'
function App() {
  console.log('🎨 App component rendering...')
  console.log('⚙️ Mantine theme loaded')
  console.log('🔑 AuthProvider initializing')
  console.log('🗺 Router setup complete')
  
  return (
    <MantineProvider theme={theme} defaultColorScheme="dark">
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
          </Routes>
        </Router>
      </AuthProvider>
    </MantineProvider>
  )
}

console.log('✅ App component exported')

export default App
