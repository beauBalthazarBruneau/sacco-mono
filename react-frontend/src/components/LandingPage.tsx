import React from 'react'
import { Box } from '@mantine/core'
import { HeroSection } from './HeroSection'
import { FeaturesSection } from './sections/FeaturesSection'
import { HowItWorksSection } from './sections/HowItWorksSection'
import { TestimonialsSection } from './sections/TestimonialsSection'

export const LandingPage: React.FC = () => {
  console.log('🏠 LandingPage component mounting...')
  
  return (
    <Box
      style={{
        width: '100%',
        overflowX: 'hidden'
      }}
    >
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <TestimonialsSection />
    </Box>
  )
}
