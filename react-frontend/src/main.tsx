import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@mantine/core/styles.css'
import './index.css'
import App from './App.tsx'

console.log('🚀 Starting React app...')
console.log('📦 Imports loaded successfully')

const rootElement = document.getElementById('root')
console.log('🎯 Root element found:', rootElement)

createRoot(rootElement!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
