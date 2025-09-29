import React, { useState, useEffect } from 'react'
import { 
  Container, 
  Title, 
  Button, 
  Box
} from '@mantine/core'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { signInWithMagicLink } from '../../lib/supabase'

// Import images
import datenightImg from '../../assets/landing_page_gallery/datenight.png'
import calendarImg from '../../assets/landing_page_gallery/calendar.webp'
import highwayImg from '../../assets/landing_page_gallery/highway.webp'
import lemonadeImg from '../../assets/landing_page_gallery/lemonade.webp'
import satsImg from '../../assets/landing_page_gallery/SATs.png'
import wafflesImg from '../../assets/landing_page_gallery/waffles.png'

export const HeroSection: React.FC = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [showEmailInput, setShowEmailInput] = useState(false)
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setMousePosition({ x: event.clientX, y: event.clientY })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

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

  return (
    <Box
      style={{
        height: '100vh',
        width: '100vw',
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0c0c0c 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      {/* Scattered Images */}
      <motion.img
        src={datenightImg}
        alt="Date night"
        style={{
          position: 'absolute',
          top: '5%',
          left: '3%',
          width: '280px',
          height: 'auto',
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          zIndex: 1
        }}
        initial={{ rotate: -5 }}
        whileHover={{ scale: 1.2, rotate: -5 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      />
      
      <motion.img
        src={calendarImg}
        alt="Calendar"
        style={{
          position: 'absolute',
          top: '5%',
          left: '50%',
          width: '300px',
          height: 'auto',
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          zIndex: 1
        }}
        initial={{ x: '-50%', rotate: 8 }}
        whileHover={{ scale: 1.2, rotate: 8 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      />
      
      <motion.img
        src={highwayImg}
        alt="Highway"
        style={{
          position: 'absolute',
          bottom: '5%',
          left: '35%',
          width: '350px',
          height: 'auto',
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          zIndex: 1
        }}
        initial={{ rotate: -12 }}
        whileHover={{ scale: 1.2, rotate: -12 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      />
      
      <motion.img
        src={lemonadeImg}
        alt="Lemonade"
        style={{
          position: 'absolute',
          bottom: '8%',
          right: '3%',
          width: '400px',
          height: 'auto',
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          zIndex: 1
        }}
        initial={{ rotate: 15 }}
        whileHover={{ scale: 1.2, rotate: 15 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      />
      
      <motion.img
        src={satsImg}
        alt="SATs"
        style={{
          position: 'absolute',
          top: '55%',
          left: '10%',
          width: '200px',
          height: 'auto',
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          zIndex: 1
        }}
        initial={{ rotate: 8 }}
        whileHover={{ scale: 1.2, rotate: 8 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      />
      
      <motion.img
        src={wafflesImg}
        alt="Waffles"
        style={{
          position: 'absolute',
          top: '15%',
          left: '70%',
          width: '250px',
          height: 'auto',
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          zIndex: 1
        }}
        initial={{ rotate: 3 }}
        whileHover={{ scale: 1.2, rotate: 3 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      />

      {/* Cursor Glow */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          pointerEvents: 'none',
          zIndex: 0,
          background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255, 255, 255, 0.15) 0%, transparent 25%)`,
          transition: 'background 0.1s ease-out'
        }}
      />

      {/* Main Content */}
      <Container 
        size="lg" 
        style={{ 
          position: 'relative', 
          zIndex: 4,
          textAlign: 'center'
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <Title 
            order={1} 
            fw={900}
            style={{ 
              fontSize: '6rem',
              lineHeight: 1.1,
              color: 'white',
              marginBottom: '1rem',
              textShadow: '0 8px 32px rgba(12, 12, 12, 0.8), 0 4px 16px rgba(12, 12, 12, 0.6)',
              fontFamily: '"Montserrat", sans-serif'
            }}
          >
            STOP SUCKING AT FANTASY
          </Title>
        </motion.div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', alignItems: 'center' }}>
          <motion.div
            initial={{ opacity: 0, x: 50, width: 0 }}
            animate={{ 
              opacity: showEmailInput ? 1 : 0, 
              x: showEmailInput ? 0 : 50,
              width: showEmailInput ? '300px' : 0
            }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            style={{ overflow: 'hidden' }}
          >
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSignUp()}
              style={{
                padding: '12px 16px',
                fontSize: '1rem',
                borderRadius: '8px',
                border: '2px solid rgba(255, 255, 255, 0.2)',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                fontFamily: '"Montserrat", sans-serif',
                width: '250px',
                outline: 'none'
              }}
            />
          </motion.div>

          <Button 
            size="lg" 
            variant="filled"
            onClick={handleButtonClick}
            disabled={isLoading}
            style={{
              fontSize: '1.25rem',
              padding: '16px 32px',
              borderRadius: '12px',
              fontWeight: 700,
              backgroundColor: '#38bd7d',
              border: 'none',
              color: 'white',
              fontFamily: '"Montserrat", sans-serif',
              boxShadow: '0 8px 24px rgba(255, 255, 255, 0.4)',
              transition: 'all 0.3s ease',
              opacity: isLoading ? 0.7 : 1,
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
      </Container>
    </Box>
  )
}