import React, { useState, useEffect } from 'react'
import { 
  Container, 
  Title, 
  Button, 
  Box
} from '@mantine/core'

// Import images
import datenightImg from '../assets/landing_page_gallery/datenight.png'
import calendarImg from '../assets/landing_page_gallery/calendar.webp'
import highwayImg from '../assets/landing_page_gallery/highway.webp'
import lemonadeImg from '../assets/landing_page_gallery/lemonade.webp'
import satsImg from '../assets/landing_page_gallery/SATs.png'
import wafflesImg from '../assets/landing_page_gallery/waffles.png'

export const LandingPage: React.FC = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setMousePosition({ x: event.clientX, y: event.clientY })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

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
      <img
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
          transform: 'rotate(-5deg)',
          zIndex: 1
        }}
      />
      
      <img
        src={calendarImg}
        alt="Calendar"
        style={{
          position: 'absolute',
          top: '10%',
          left: '50%',
          transform: 'translateX(-50%) rotate(8deg)',
          width: '220px',
          height: 'auto',
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          zIndex: 1
        }}
      />
      
      <img
        src={highwayImg}
        alt="Highway"
        style={{
          position: 'absolute',
          bottom: '12%',
          left: '35%',
          width: '260px',
          height: 'auto',
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          transform: 'rotate(-12deg)',
          zIndex: 1
        }}
      />
      
      <img
        src={lemonadeImg}
        alt="Lemonade"
        style={{
          position: 'absolute',
          bottom: '8%',
          right: '3%',
          width: '240px',
          height: 'auto',
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          transform: 'rotate(15deg)',
          zIndex: 1
        }}
      />
      
      <img
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
          transform: 'rotate(8deg)',
          zIndex: 1
        }}
      />
      
      <img
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
          transform: 'rotate(3deg)',
          zIndex: 1
        }}
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
        <Title 
          order={1} 
          size="6rem" 
          fw={900}
          style={{ 
            lineHeight: 1.1,
            background: 'linear-gradient(135deg, #ffffff 0%, #e0e0e0 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: '3rem',
            textShadow: '0 4px 8px rgba(0, 0, 0, 0.3)'
          }}
        >
          STOP SUCKING AT FANTASY
        </Title>

        <Button 
          size="lg" 
          variant="filled"
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
            '&:hover': {
              backgroundColor: '#16a34a',
              border: 'none',
              transform: 'translateY(-2px)',
              boxShadow: '0 12px 32px rgba(255, 255, 255, 0.6)'
            }
          }}
        >
          Try Sacco
        </Button>
      </Container>
    </Box>
  )
}
