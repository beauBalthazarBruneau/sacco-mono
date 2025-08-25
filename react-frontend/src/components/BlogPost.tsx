import React from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import '../styles/blog.css'
import { 
  Container, 
  Title, 
  Text, 
  Box, 
  Badge, 
  Stack, 
  Group, 
  Button, 
  Divider,
  Avatar,
  Card,
  SimpleGrid
} from '@mantine/core'
import { 
  IconArrowLeft, 
  IconCalendar, 
  IconClock,
  IconShare,
  IconBookmark
} from '@tabler/icons-react'
import { motion } from 'framer-motion'
import { getBlogPostBySlug, getRelatedBlogPosts } from '../utils/blog'
import { BlogPostSEO } from './SEO/BlogPostSEO'

export const BlogPost: React.FC = () => {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  
  if (!slug) {
    navigate('/')
    return null
  }

  const post = getBlogPostBySlug(slug)
  
  if (!post) {
    return (
      <Container size="md" style={{ paddingTop: '4rem', paddingBottom: '4rem' }}>
        <Stack align="center" gap="lg">
          <Title order={1} style={{ color: 'white' }}>
            Blog Post Not Found
          </Title>
          <Text style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            The blog post you're looking for doesn't exist or has been moved.
          </Text>
          <Button
            leftSection={<IconArrowLeft size={16} />}
            onClick={() => navigate('/')}
            variant="outline"
            color="teal"
          >
            Back to Home
          </Button>
        </Stack>
      </Container>
    )
  }

  const relatedPosts = getRelatedBlogPosts(post, 3)

  // Convert markdown content to HTML (simple implementation)
  const formatContent = (content: string): string => {
    return content
      .replace(/# (.*)/g, '<h1>$1</h1>')
      .replace(/## (.*)/g, '<h2>$1</h2>')
      .replace(/### (.*)/g, '<h3>$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>')
      .replace(/^/, '<p>')
      .replace(/$/, '</p>')
      .replace(/```(\w+)([^`]+)```/g, '<pre><code class="language-$1">$2</code></pre>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/- (.*?)(<br>|$)/g, '<li>$1</li>')
      .replace(/(<li>.*<\/li>)/g, '<ul>$1</ul>')
  }

  return (
    <>
      <BlogPostSEO post={post} />
      
      <Box
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(180deg, #0a0a0a 0%, #1a1a1a 50%, #0c0c0c 100%)',
          paddingTop: '2rem'
        }}
      >
        <Container size="md">
          {/* Back Button */}
          <Button
            leftSection={<IconArrowLeft size={16} />}
            variant="subtle"
            color="teal"
            onClick={() => navigate('/')}
            style={{ marginBottom: '2rem' }}
          >
            Back to Home
          </Button>

          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Stack gap="lg" style={{ marginBottom: '3rem' }}>
              {/* Category Badge */}
              <Badge
                size="lg"
                style={{
                  backgroundColor: '#38bd7d',
                  color: 'white',
                  alignSelf: 'flex-start'
                }}
              >
                {post.category}
              </Badge>

              {/* Title */}
              <Title
                order={1}
                style={{
                  fontSize: '3rem',
                  fontWeight: 800,
                  color: 'white',
                  fontFamily: '"Montserrat", sans-serif',
                  lineHeight: 1.2
                }}
              >
                {post.title}
              </Title>

              {/* Excerpt */}
              <Text
                size="xl"
                style={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontSize: '1.25rem',
                  lineHeight: 1.6
                }}
              >
                {post.excerpt}
              </Text>

              {/* Meta Information */}
              <Group gap="xl" style={{ flexWrap: 'wrap' }}>
                <Group gap="sm">
                  <Avatar
                    src={post.author.avatar}
                    alt={post.author.name}
                    size="md"
                    radius="xl"
                  />
                  <Stack gap={2}>
                    <Text
                      style={{
                        color: 'white',
                        fontWeight: 600,
                        fontSize: '0.95rem'
                      }}
                    >
                      {post.author.name}
                    </Text>
                    {post.author.bio && (
                      <Text
                        size="sm"
                        style={{
                          color: 'rgba(255, 255, 255, 0.6)',
                          fontSize: '0.8rem'
                        }}
                      >
                        {post.author.bio}
                      </Text>
                    )}
                  </Stack>
                </Group>

                <Group gap="lg">
                  <Group gap="xs">
                    <IconCalendar size={16} color="rgba(255, 255, 255, 0.6)" />
                    <Text style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                      {new Date(post.publishedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </Text>
                  </Group>

                  <Group gap="xs">
                    <IconClock size={16} color="rgba(255, 255, 255, 0.6)" />
                    <Text style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                      {post.readTime}
                    </Text>
                  </Group>
                </Group>
              </Group>

              {/* Share Buttons */}
              <Group gap="sm">
                <Button
                  leftSection={<IconShare size={16} />}
                  variant="outline"
                  color="teal"
                  size="sm"
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: post.title,
                        text: post.excerpt,
                        url: window.location.href
                      })
                    } else {
                      navigator.clipboard.writeText(window.location.href)
                    }
                  }}
                >
                  Share
                </Button>
                <Button
                  leftSection={<IconBookmark size={16} />}
                  variant="outline"
                  color="gray"
                  size="sm"
                >
                  Save
                </Button>
              </Group>
            </Stack>
          </motion.div>

          {/* Featured Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Box
              style={{
                height: '400px',
                backgroundImage: `url(${post.image.url})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                borderRadius: '16px',
                marginBottom: '3rem',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            />
          </motion.div>

          {/* Article Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Box
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                borderRadius: '16px',
                padding: '3rem',
                marginBottom: '3rem'
              }}
            >
              <div
                className="blog-content"
                dangerouslySetInnerHTML={{
                  __html: formatContent(post.content)
                }}
              />
            </Box>
          </motion.div>

          {/* Tags */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Group gap="sm" style={{ marginBottom: '3rem' }}>
              <Text
                style={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  fontWeight: 600
                }}
              >
                Tags:
              </Text>
              {post.tags.map(tag => (
                <Badge
                  key={tag}
                  variant="outline"
                  color="teal"
                  style={{
                    borderColor: 'rgba(56, 189, 125, 0.5)',
                    color: '#38bd7d'
                  }}
                >
                  {tag}
                </Badge>
              ))}
            </Group>
          </motion.div>

          <Divider style={{ borderColor: 'rgba(255, 255, 255, 0.1)', marginBottom: '3rem' }} />

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <Title
                order={3}
                style={{
                  color: 'white',
                  fontFamily: '"Montserrat", sans-serif',
                  marginBottom: '2rem'
                }}
              >
                Related Articles
              </Title>

              <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} spacing="xl">
                {relatedPosts.map(relatedPost => (
                  <Card
                    key={relatedPost.id}
                    component={Link}
                    to={`/blog/${relatedPost.slug}`}
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '16px',
                      padding: '0',
                      height: '100%',
                      textDecoration: 'none',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)'
                      e.currentTarget.style.backgroundColor = 'rgba(56, 189, 125, 0.08)'
                      e.currentTarget.style.borderColor = 'rgba(56, 189, 125, 0.25)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                    }}
                  >
                    <Box
                      style={{
                        height: '150px',
                        backgroundImage: `url(${relatedPost.image.url})`,
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
                        {relatedPost.category}
                      </Badge>
                    </Box>

                    <Stack gap="sm" style={{ padding: '1.5rem' }}>
                      <Title
                        order={5}
                        style={{
                          color: 'white',
                          fontSize: '1.1rem',
                          fontWeight: 600,
                          lineHeight: 1.3,
                          fontFamily: '"Montserrat", sans-serif'
                        }}
                      >
                        {relatedPost.title}
                      </Title>

                      <Text
                        size="sm"
                        style={{
                          color: 'rgba(255, 255, 255, 0.7)',
                          lineHeight: 1.4
                        }}
                      >
                        {relatedPost.excerpt.substring(0, 120)}...
                      </Text>

                      <Group gap="sm" style={{ fontSize: '0.8rem' }}>
                        <Text style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                          {relatedPost.author.name}
                        </Text>
                        <Text style={{ color: 'rgba(255, 255, 255, 0.5)' }}>•</Text>
                        <Text style={{ color: '#38bd7d' }}>
                          {relatedPost.readTime}
                        </Text>
                      </Group>
                    </Stack>
                  </Card>
                ))}
              </SimpleGrid>
            </motion.div>
          )}

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
            style={{ marginTop: '4rem' }}
          >
            <Card
              style={{
                backgroundColor: 'rgba(56, 189, 125, 0.1)',
                border: '1px solid rgba(56, 189, 125, 0.3)',
                borderRadius: '16px',
                padding: '3rem',
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
                  Ready to Dominate Your League?
                </Title>
                
                <Text
                  style={{
                    color: 'rgba(255, 255, 255, 0.8)',
                    fontSize: '1.1rem',
                    maxWidth: '500px',
                    lineHeight: 1.5
                  }}
                >
                  Put these insights to work with Sacco's AI-powered fantasy football assistant. 
                  Get personalized recommendations and dominate your draft.
                </Text>

                <Button
                  component={Link}
                  to="/signup"
                  size="lg"
                  style={{
                    backgroundColor: '#38bd7d',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '1.2rem',
                    fontFamily: '"Montserrat", sans-serif',
                    borderRadius: '12px',
                    padding: '18px 32px'
                  }}
                >
                  Start Free Trial
                </Button>
              </Stack>
            </Card>
          </motion.div>
        </Container>
      </Box>
    </>
  )
}
