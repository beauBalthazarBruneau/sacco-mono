import React, { useState, useEffect, useRef } from 'react'
import { 
  Title, 
  Button, 
  Box
} from '@mantine/core'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { signInWithMagicLink } from '../../lib/supabase'

// Import images
import datenightImg from '../../assets/landing_page_gallery/datenight.png'
import calendarImg from '../../assets/landing_page_gallery/calendar.webp'
import highwayImg from '../../assets/landing_page_gallery/highway.webp'

interface TouchPosition {
  x: number
  y: number
}

export const MobileHeroSection: React.FC = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showTitle, setShowTitle] = useState(false)
  const [showEmailInput, setShowEmailInput] = useState(false)
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [touchStart, setTouchStart] = useState<TouchPosition | null>(null)
  const [touchEnd, setTouchEnd] = useState<TouchPosition | null>(null)
  const navigate = useNavigate()
  const containerRef = useRef<HTMLDivElement>(null)

  const images = [
    { src: datenightImg, alt: 'Date night' },
    { src: calendarImg, alt: 'Calendar' },
    { src: highwayImg, alt: 'Highway' }
  ]

  const minSwipeDistance = 50

  // Prevent body scrolling when mobile hero is active
  useEffect(() => {
    // Prevent all scrolling
    document.body.style.overflow = 'hidden'
    document.body.style.position = 'fixed'
    document.body.style.width = '100%'
    document.body.style.height = '100%'
    
    return () => {
      // Restore scrolling only after title is shown
      if (showTitle) {
        document.body.style.overflow = 'unset'
        document.body.style.position = 'unset'
        document.body.style.width = 'unset'
        document.body.style.height = 'unset'
      }
    }
  }, [showTitle])

  // Hide mobile hero after title is shown for a few seconds
  useEffect(() => {
    if (showTitle) {
      const timer = setTimeout(() => {
        setIsComplete(true)
        // Restore body scrolling
        document.body.style.overflow = 'unset'
        document.body.style.position = 'unset'
        document.body.style.width = 'unset'
        document.body.style.height = 'unset'
      }, 3000) // Show title for 3 seconds then allow scrolling

      return () => clearTimeout(timer)
    }
  }, [showTitle])

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault() // Prevent page scrolling
    setTouchEnd(null)
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    })
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault() // Prevent page scrolling
    setTouchEnd({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    })
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault() // Prevent page scrolling
    if (!touchStart || !touchEnd) return

    const distanceY = touchStart.y - touchEnd.y
    const isUpSwipe = distanceY > minSwipeDistance

    // Only respond to upward swipes
    if (isUpSwipe) {
      if (currentImageIndex < images.length - 1) {
        setCurrentImageIndex(prev => prev + 1)
      } else {
        setShowTitle(true)
      }
    }
  }

  const handleSignUp = async () => {
    if (!email) return
    
    setIsLoading(true)
    try {
      const { error } = await signInWithMagicLink(email)
      if (error) {
        console.error('Error sending magic link:', error)
      } else {
        navigate('/signup')
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleButtonClick = () => {
    if (showEmailInput) {
      handleSignUp()
    } else {
      setShowEmailInput(true)
    }
  }

  // Hide the mobile hero after completion
  if (isComplete) {
    return null
  }

  return (
    <Box
      ref={containerRef}
      style={{
        height: '100vh',
        width: '100vw',
        maxWidth: '100vw',
        position: 'fixed',
        top: 0,
        left: 0,
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0c0c0c 100%)',
        touchAction: 'pan-y', // Only allow vertical panning
        boxSizing: 'border-box',
        margin: 0,
        padding: 0,
        zIndex: 9999 // Ensure it's above everything
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Swipeable Images */}
      <AnimatePresence mode="wait">
        {!showTitle && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2
            }}
          >
            <motion.div
              key={currentImageIndex}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ 
                opacity: 0, 
                scale: 0.8, 
                y: -200
              }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              style={{
                width: '85vw',
                maxWidth: '400px',
                height: 'auto',
                borderRadius: '20px',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <img
                src={images[currentImageIndex].src}
                alt={images[currentImageIndex].alt}
                style={{
                  width: '100%',
                  height: 'auto',
                  borderRadius: '20px',
                  display: 'block',
                  objectFit: 'cover'
                }}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>


      {/* Main Title - Revealed after all images are swiped */}
      <AnimatePresence>
        {showTitle && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 4,
              textAlign: 'center',
              padding: '0 20px',
              width: '100%',
              maxWidth: '400px'
            }}
          >
            <Title 
              order={1} 
              fw={900}
              style={{ 
                fontSize: 'clamp(2.5rem, 8vw, 4rem)',
                lineHeight: 1.1,
                color: 'white',
                textShadow: '0 8px 32px rgba(12, 12, 12, 0.8), 0 4px 16px rgba(12, 12, 12, 0.6)',
                fontFamily: '"Montserrat", sans-serif'
              }}
            >
              STOP SUCKING AT FANTASY
            </Title>

            <div style={{ 
              display: 'flex', 
              flexDirection: 'column',
              gap: '1rem', 
              alignItems: 'center',
              maxWidth: '400px',
              margin: '0 auto'
            }}>
              <motion.div
                initial={{ opacity: 0, y: 50, width: 0 }}
                animate={{ 
                  opacity: showEmailInput ? 1 : 0, 
                  y: showEmailInput ? 0 : 50,
                  width: showEmailInput ? '100%' : 0
                }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                style={{ overflow: 'hidden', width: '100%' }}
              >
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSignUp()}
                  style={{
                    padding: '16px 20px',
                    fontSize: '1rem',
                    borderRadius: '12px',
                    border: '2px solid rgba(255, 255, 255, 0.2)',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    fontFamily: '"Montserrat", sans-serif',
                    width: '100%',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </motion.div>

              <Button 
                size="xl" 
                variant="filled"
                onClick={handleButtonClick}
                disabled={isLoading}
                style={{
                  fontSize: '1.25rem',
                  padding: '20px 40px',
                  borderRadius: '16px',
                  fontWeight: 700,
                  backgroundColor: '#38bd7d',
                  border: 'none',
                  color: 'white',
                  fontFamily: '"Montserrat", sans-serif',
                  boxShadow: '0 8px 24px rgba(255, 255, 255, 0.4)',
                  transition: 'all 0.3s ease',
                  opacity: isLoading ? 0.7 : 1,
                  width: '100%',
                  '&:hover': {
                    backgroundColor: '#16a34a',
                    border: 'none',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 12px 32px rgba(255, 255, 255, 0.6)'
                  }
                }}
              >
                {isLoading ? 'Sending...' : (showEmailInput ? 'Sign Up' : 'Try Sacco')}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  )
}
