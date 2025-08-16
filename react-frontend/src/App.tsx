import { MantineProvider } from '@mantine/core'
import { theme } from './lib/mantine'
import { LandingPage } from './components/LandingPage'

function App() {
  return (
    <MantineProvider theme={theme} defaultColorScheme="dark">
      <LandingPage />
    </MantineProvider>
  )
}

export default App
