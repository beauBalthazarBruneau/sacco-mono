import React, { useState, useEffect } from 'react'
import { HeroSection } from './HeroSection'
import { MobileHeroSection } from './MobileHeroSection'
import { FeaturesSection } from './sections/FeaturesSection'
import { HowItWorksSection } from './sections/HowItWorksSection'
import { PricingSection } from './sections/PricingSection'
import { BlogSection } from './sections/BlogSection'

export const LandingPage: React.FC = () => {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // SEO meta tags
    document.title = 'Sacco - Fantasy Football Draft Assistant | Win Your League'
    
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

    // Mobile detection
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => {
      window.removeEventListener('resize', checkMobile)
    }
  }, [])

  return (
    <main
      style={{
        width: '100%',
        overflowX: 'hidden'
      }}
    >
      {isMobile ? <MobileHeroSection /> : <HeroSection />}
      <FeaturesSection />
      <HowItWorksSection />
      <PricingSection />
      {/* <AboutUsSection /> */}
      {/* <TestimonialsSection /> */}
      <BlogSection />
    </main>
  )
}
