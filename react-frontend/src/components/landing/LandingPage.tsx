import React from 'react'
import { HeroSection } from './HeroSection'
import { FeaturesSection } from './sections/FeaturesSection'
import { HowItWorksSection } from './sections/HowItWorksSection'
import { TestimonialsSection } from './sections/TestimonialsSection'
import { PricingSection } from './sections/PricingSection'
import { AboutUsSection } from './sections/AboutUsSection'
import { BlogSection } from './sections/BlogSection'

export const LandingPage: React.FC = () => {
  React.useEffect(() => {
    // SEO meta tags
    document.title = 'Sacco - AI-Powered Fantasy Football Draft Assistant | Win Your League'
    
    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Stop sucking at fantasy football! Sacco\'s AI-powered draft assistant helps you dominate your league with data-driven picks. Start your free trial with 3 draft picks.')
    } else {
      const meta = document.createElement('meta')
      meta.name = 'description'
      meta.content = 'Stop sucking at fantasy football! Sacco\'s AI-powered draft assistant helps you dominate your league with data-driven picks. Start your free trial with 3 draft picks.'
      document.head.appendChild(meta)
    }

    const metaKeywords = document.querySelector('meta[name="keywords"]')
    if (metaKeywords) {
      metaKeywords.setAttribute('content', 'fantasy football, draft assistant, AI, fantasy sports, chrome extension, draft strategy, player analytics, Georgia Tech engineers')
    } else {
      const meta = document.createElement('meta')
      meta.name = 'keywords'
      meta.content = 'fantasy football, draft assistant, AI, fantasy sports, chrome extension, draft strategy, player analytics, Georgia Tech engineers'
      document.head.appendChild(meta)
    }
  }, [])

  return (
    <main
      style={{
        width: '100%',
        overflowX: 'hidden'
      }}
    >
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <PricingSection />
      <AboutUsSection />
      <TestimonialsSection />
      <BlogSection />
    </main>
  )
}
