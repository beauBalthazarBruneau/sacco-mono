import React from 'react'
import { MantineProvider } from '@mantine/core'
import { theme } from './lib/mantine'
import { LandingPage } from './components/LandingPage'

function App() {
  return (
    <MantineProvider theme={theme} withGlobalStyles withNormalizeCSS>
      <LandingPage />
    </MantineProvider>
  )
}

export default App
