import React, { useState } from 'react'
import { Container, Title, Text, Card, Button, Box, Badge, Stack, Group, ActionIcon, SimpleGrid } from '@mantine/core'
import { IconArrowLeft, IconArrowRight, IconCalendar, IconUser, IconExternalLink } from '@tabler/icons-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, Link } from 'react-router-dom'
import { signInWithMagicLink } from '../../../lib/supabase'
import { getRecentBlogPosts } from '../../../utils/blog'

export const BlogSection: React.FC = () => {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)
  const navigate = useNavigate()

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

  // Load blog posts from JSON files
  const blogPosts = getRecentBlogPosts(5)

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % Math.ceil(blogPosts.length / 3))
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + Math.ceil(blogPosts.length / 3)) % Math.ceil(blogPosts.length / 3))
  }

  const getVisiblePosts = () => {
    const startIndex = currentSlide * 3
    return blogPosts.slice(startIndex, startIndex + 3)
  }

  return (
    <section
      id="blog"
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #0a0a0a 0%, #1a1a1a 50%, #0c0c0c 100%)',
        padding: '80px 0',
        display: 'flex',
        alignItems: 'center'
      }}
    >
      <Container size="xl">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
        >
          <Title
            order={2}
            ta="center"
            style={{
              fontSize: '3.5rem',
              fontWeight: 800,
              color: 'white',
              marginBottom: '1rem',
              fontFamily: '"Montserrat", sans-serif'
            }}
          >
            Fantasy Insights
          </Title>
          
          <Text
            ta="center"
            size="xl"
            style={{
              color: 'rgba(255, 255, 255, 0.7)',
              marginBottom: '4rem',
              fontSize: '1.25rem',
              maxWidth: '600px',
              margin: '0 auto 4rem auto'
            }}
          >
            Stay ahead of the competition with expert analysis, advanced strategies, 
            and the latest insights from our engineering team.
          </Text>
        </motion.div>

        {/* Blog Carousel */}
        <Box style={{ position: 'relative', marginBottom: '3rem' }}>
          {/* Navigation Buttons */}
          <Group justify="space-between" style={{ marginBottom: '2rem' }}>
            <ActionIcon
              size="xl"
              variant="outline"
              color="teal"
              onClick={prevSlide}
              style={{
                borderColor: 'rgba(56, 189, 125, 0.5)',
                backgroundColor: 'rgba(56, 189, 125, 0.1)',
                '&:hover': {
                  backgroundColor: 'rgba(56, 189, 125, 0.2)'
                }
              }}
            >
              <IconArrowLeft size={24} color="#38bd7d" />
            </ActionIcon>

            <Text
              style={{
                color: 'rgba(255, 255, 255, 0.6)',
                fontSize: '1rem',
                fontFamily: '"Montserrat", sans-serif'
              }}
            >
              {currentSlide + 1} of {Math.ceil(blogPosts.length / 3)}
            </Text>

            <ActionIcon
              size="xl"
              variant="outline"
              color="teal"
              onClick={nextSlide}
              style={{
                borderColor: 'rgba(56, 189, 125, 0.5)',
                backgroundColor: 'rgba(56, 189, 125, 0.1)',
                '&:hover': {
                  backgroundColor: 'rgba(56, 189, 125, 0.2)'
                }
              }}
            >
              <IconArrowRight size={24} color="#38bd7d" />
            </ActionIcon>
          </Group>

          {/* Blog Posts */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            >
              <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} spacing="xl">
                {getVisiblePosts().map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
                    viewport={{ once: true }}
                  >
                    <Card
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '16px',
                        padding: '0',
                        height: '100%',
                        backdropFilter: 'blur(10px)',
                        transition: 'all 0.3s ease',
                        overflow: 'hidden'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-8px)'
                        e.currentTarget.style.backgroundColor = 'rgba(56, 189, 125, 0.08)'
                        e.currentTarget.style.borderColor = 'rgba(56, 189, 125, 0.25)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)'
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                      }}
                    >
                      {/* Image */}
                      <Box
                        style={{
                          height: '200px',
                      backgroundImage: `url(${post.image.url})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          position: 'relative'
                        }}
                      >
                        <Badge
                          style={{
                            position: 'absolute',
                            top: '1rem',
                            left: '1rem',
                            backgroundColor: '#38bd7d',
                            color: 'white'
                          }}
                        >
                          {post.category}
                        </Badge>
                      </Box>

                      {/* Content */}
                      <Stack gap="md" style={{ padding: '1.5rem', height: 'calc(100% - 200px)' }}>
                        <Title
                          order={4}
                          style={{
                            color: 'white',
                            fontSize: '1.3rem',
                            fontWeight: 700,
                            lineHeight: 1.3,
                            fontFamily: '"Montserrat", sans-serif'
                          }}
                        >
                          {post.title}
                        </Title>

                        <Text
                          style={{
                            color: 'rgba(255, 255, 255, 0.7)',
                            lineHeight: 1.5,
                            fontSize: '0.95rem',
                            flex: 1
                          }}
                        >
                          {post.excerpt}
                        </Text>

                        {/* Meta Info */}
                        <Stack gap="xs">
                          <Group gap="sm" style={{ fontSize: '0.85rem' }}>
                            <Group gap="xs">
                              <IconUser size={16} color="rgba(255, 255, 255, 0.5)" />
                        <Text style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                                {post.author.name}
                              </Text>
                            </Group>
                            <Group gap="xs">
                              <IconCalendar size={16} color="rgba(255, 255, 255, 0.5)" />
                              <Text style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                                {new Date(post.publishedAt).toLocaleDateString()}
                              </Text>
                            </Group>
                          </Group>

                          <Text
                            style={{
                              color: '#38bd7d',
                              fontSize: '0.85rem',
                              fontWeight: 600
                            }}
                          >
                            {post.readTime}
                          </Text>
                        </Stack>

                        {/* Read More Button */}
                        <Button
                          component={Link}
                          to={`/blog/${post.slug}`}
                          variant="outline"
                          color="teal"
                          size="sm"
                          rightSection={<IconExternalLink size={16} />}
                          style={{
                            borderColor: '#38bd7d',
                            color: '#38bd7d',
                            fontFamily: '"Montserrat", sans-serif',
                            marginTop: 'auto',
                            textDecoration: 'none'
                          }}
                        >
                          Read More
                        </Button>
                      </Stack>
                    </Card>
                  </motion.div>
                ))}
              </SimpleGrid>
            </motion.div>
          </AnimatePresence>
        </Box>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
          viewport={{ once: true }}
        >
          <Card
            style={{
              backgroundColor: 'rgba(56, 189, 125, 0.1)',
              border: '1px solid rgba(56, 189, 125, 0.3)',
              borderRadius: '16px',
              padding: '3rem',
              backdropFilter: 'blur(10px)',
              textAlign: 'center'
            }}
          >
            <Stack align="center" gap="lg">
              <Title
                order={3}
                style={{
                  color: 'white',
                  fontSize: '2rem',
                  fontWeight: 700,
                  fontFamily: '"Montserrat", sans-serif'
                }}
              >
                Ready to Put These Strategies to Work?
              </Title>
              
              <Text
                style={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontSize: '1.1rem',
                  maxWidth: '500px',
                  lineHeight: 1.5
                }}
              >
                Join thousands of fantasy managers who are using our draft insights 
                to dominate their leagues. Try it out today.
              </Text>

              <Box style={{ width: '100%', maxWidth: '400px' }}>
                <Stack gap="sm">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSignUp()}
                    style={{
                      padding: '16px 20px',
                      fontSize: '1.1rem',
                      borderRadius: '12px',
                      border: '2px solid rgba(255, 255, 255, 0.2)',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      color: 'white',
                      fontFamily: '"Montserrat", sans-serif',
                      width: '100%',
                      outline: 'none'
                    }}
                  />
                  <Button
                    size="lg"
                    onClick={handleSignUp}
                    disabled={isLoading || !email}
                    style={{
                      backgroundColor: '#38bd7d',
                      border: 'none',
                      fontWeight: 700,
                      fontSize: '1.2rem',
                      fontFamily: '"Montserrat", sans-serif',
                      borderRadius: '12px',
                      padding: '18px 32px',
                      width: '100%'
                    }}
                  >
                    {isLoading ? 'Starting Trial...' : 'Start Free Trial'}
                  </Button>
                </Stack>
              </Box>

              <Group gap="lg">
                <Button
                  component={Link}
                  to="/#blog"
                  variant="subtle"
                  color="teal"
                  size="sm"
                  rightSection={<IconExternalLink size={16} />}
                  style={{
                    textDecoration: 'none'
                  }}
                >
                  View All Articles
                </Button>
              </Group>
            </Stack>
          </Card>
        </motion.div>
      </Container>
    </section>
  )
}
