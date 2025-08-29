import React, { useState, useEffect, useCallback } from 'react'
import {
  Container,
  Group,
  Title,
  Text,
  Button,
  Card,
  Stack,
  Grid,
  ThemeIcon,
  Box,
  ActionIcon,
  Badge,
  Skeleton,
  Alert,
  Modal,
  Anchor,
  Progress
} from '@mantine/core'
import {
  IconTrophy,
  IconPlus,
  IconHistory,
  IconLogout,
  IconUser,
  IconUsers,
  IconExclamationMark,
  IconCreditCard,
  IconAlertCircle
} from '@tabler/icons-react'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { DraftManagement } from './DraftManagement'

// Types based on database schema
interface UserProfile {
  id: string
  email: string
  username: string | null
  subscription_tier: 'free' | 'basic' | 'premium'
  subscription_expires_at: string | null
  draft_picks_used: number
  draft_picks_limit: number
  trial_started_at: string | null
  created_at: string
}


export const UserDashboard: React.FC = () => {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedDraftId, setSelectedDraftId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Load user profile
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user!.id)
        .single()

      if (profileError) {
        throw new Error(`Failed to load user profile: ${profileError.message}`)
      }

      setUserProfile(profile)

    } catch (err) {
      console.error('Error loading dashboard data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (user) {
      loadDashboardData()
    }
  }, [user, loadDashboardData])

  const handleSignOut = async () => {
    await signOut()
    window.location.href = '/'
  }

  const handleCreateNewDraft = () => {
    if (userProfile && userProfile.subscription_tier === 'free' && userProfile.draft_picks_used >= userProfile.draft_picks_limit) {
      // Show upgrade prompt
      navigate('/billing/payment-setup')
    } else {
      // Navigate to draft creation
      navigate('/drafts/create')
    }
  }


  const handleDeleteDraft = async () => {
    if (!selectedDraftId) return
    
    try {
      setDeleting(true)
      
      // Delete draft picks first (due to foreign key constraint)
      await supabase
        .from('draft_picks')
        .delete()
        .eq('draft_session_id', selectedDraftId)
      
      // Then delete the draft session
      const { error } = await supabase
        .from('draft_sessions')
        .delete()
        .eq('id', selectedDraftId)

      if (error) {
        throw error
      }

      // Refresh data
      await loadDashboardData()
      setDeleteModalOpen(false)
      setSelectedDraftId(null)
    } catch (err) {
      console.error('Error deleting draft:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete draft')
    } finally {
      setDeleting(false)
    }
  }


  const getTrialProgress = () => {
    if (!userProfile || userProfile.subscription_tier !== 'free') return null
    return (userProfile.draft_picks_used / userProfile.draft_picks_limit) * 100
  }

  if (loading) {
    return (
      <Box>
        {/* Header */}
        <Box 
          h={70} 
          p="md" 
          bg="var(--mantine-color-dark-6)"
          style={{ borderBottom: '1px solid var(--mantine-color-dark-4)' }}
        >
          <Group justify="space-between" h="100%">
            <Group>
              <ThemeIcon 
                size={32} 
                radius="md" 
                variant="gradient"
                gradient={{ from: 'green.6', to: 'green.7' }}
              >
                <IconTrophy size={20} />
              </ThemeIcon>
              <Title order={1} size="h3">Sacco</Title>
            </Group>
          </Group>
        </Box>
        
        <Container size="xl" py="xl">
          <Stack gap="xl">
            <Skeleton height={200} />
            <Skeleton height={150} />
            <Skeleton height={300} />
          </Stack>
        </Container>
      </Box>
    )
  }

  return (
    <Box>
      {/* Header */}
      <Box 
        h={70} 
        p="md" 
        bg="var(--mantine-color-dark-6)"
        style={{ borderBottom: '1px solid var(--mantine-color-dark-4)' }}
      >
        <Group justify="space-between" h="100%">
          <Group>
            <ThemeIcon 
              size={32} 
              radius="md" 
              variant="gradient"
              gradient={{ from: 'green.6', to: 'green.7' }}
            >
              <IconTrophy size={20} />
            </ThemeIcon>
            <Title order={1} size="h3">Sacco</Title>
          </Group>
          <Group>
            <Text size="sm" c="dimmed">
              <IconUser size={14} style={{ display: 'inline', marginRight: 4 }} />
              {user?.email}
            </Text>
            <ActionIcon 
              variant="subtle" 
              color="gray" 
              onClick={handleSignOut}
              title="Sign out"
            >
              <IconLogout size={18} />
            </ActionIcon>
          </Group>
        </Group>
      </Box>

      {/* Main Content */}
      <Container size="xl" py="xl">
        <Stack gap="xl">
          {error && (
            <Alert 
              icon={<IconAlertCircle size={16} />} 
              title="Error" 
              color="red"
              onClose={() => setError(null)}
              withCloseButton
            >
              {error}
            </Alert>
          )}

          {/* Welcome Section with Subscription Status */}
          <Card>
            <Stack gap="lg">
              <Box>
                <Group justify="space-between" align="flex-start">
                  <Box>
                    <Title order={2} size="h2" mb="xs">
                      Welcome back, {user?.email?.split('@')[0]}! 🏈
                    </Title>
                    <Text c="dimmed">
                      Ready to dominate your fantasy football draft?
                    </Text>
                  </Box>
                  
                  {userProfile && (
                    <Box>
                      <Badge 
                        size="lg" 
                        variant="gradient"
                        gradient={userProfile.subscription_tier === 'free' 
                          ? { from: 'gray.6', to: 'gray.7' }
                          : { from: 'green.6', to: 'green.7' }
                        }
                      >
                        {userProfile.subscription_tier.toUpperCase()}
                      </Badge>
                    </Box>
                  )}
                </Group>
                
                {/* Trial Status for Free Users */}
                {userProfile && userProfile.subscription_tier === 'free' && (
                  <Box mt="lg">
                    <Group justify="space-between" align="center" mb="xs">
                      <Text size="sm" fw={600}>
                        Draft Picks Used: {userProfile.draft_picks_used} / {userProfile.draft_picks_limit}
                      </Text>
                      {userProfile.draft_picks_used >= userProfile.draft_picks_limit && (
                        <Anchor 
                          size="sm" 
                          onClick={() => navigate('/billing/payment-setup')}
                          c="green"
                        >
                          Upgrade Now
                        </Anchor>
                      )}
                    </Group>
                    <Progress 
                      value={getTrialProgress() || 0} 
                      color={getTrialProgress() === 100 ? 'red' : 'green'}
                      size="md"
                    />
                    {userProfile.draft_picks_used >= userProfile.draft_picks_limit && (
                      <Text size="xs" c="red" mt="xs">
                        <IconExclamationMark size={14} style={{ display: 'inline', marginRight: 4 }} />
                        Trial limit reached. Upgrade to continue drafting.
                      </Text>
                    )}
                  </Box>
                )}
              </Box>
            </Stack>
          </Card>

          {/* Quick Actions */}
          <Card>
            <Stack gap="lg">
              <Group justify="space-between" align="center">
                <Title order={3} size="h3">Quick Actions</Title>
                <Button
                  size="sm"
                  variant="gradient"
                  gradient={{ from: 'green.6', to: 'green.7' }}
                  leftSection={<IconPlus size={16} />}
                  onClick={handleCreateNewDraft}
                  disabled={userProfile?.subscription_tier === 'free' && (userProfile?.draft_picks_used || 0) >= (userProfile?.draft_picks_limit || 0)}
                >
                  Create New Draft
                </Button>
              </Group>
              
              <Grid>
                <Grid.Col span={{ base: 12, md: 4 }}>
                  <Card 
                    withBorder 
                    padding="lg" 
                    radius="md"
                    bg="var(--mantine-color-dark-5)"
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate('/players')}
                  >
                    <Group>
                      <ThemeIcon 
                        size={40} 
                        radius="md" 
                        variant="gradient"
                        gradient={{ from: 'blue.6', to: 'blue.7' }}
                      >
                        <IconUsers size={24} />
                      </ThemeIcon>
                      <Box>
                        <Text fw={600} size="lg">Browse Players</Text>
                        <Text size="sm" c="dimmed">Explore player rankings and stats</Text>
                      </Box>
                    </Group>
                  </Card>
                </Grid.Col>
                
                <Grid.Col span={{ base: 12, md: 4 }}>
                  <Card 
                    withBorder 
                    padding="lg" 
                    radius="md"
                    bg="var(--mantine-color-dark-5)"
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate('/billing')}
                  >
                    <Group>
                      <ThemeIcon 
                        size={40} 
                        radius="md" 
                        variant="gradient"
                        gradient={{ from: 'yellow.6', to: 'yellow.7' }}
                      >
                        <IconCreditCard size={24} />
                      </ThemeIcon>
                      <Box>
                        <Text fw={600} size="lg">Billing</Text>
                        <Text size="sm" c="dimmed">Manage subscription and payments</Text>
                      </Box>
                    </Group>
                  </Card>
                </Grid.Col>
                
                <Grid.Col span={{ base: 12, md: 4 }}>
                  <Card 
                    withBorder 
                    padding="lg" 
                    radius="md"
                    bg="var(--mantine-color-dark-5)"
                    opacity={0.6}
                  >
                    <Group>
                      <ThemeIcon 
                        size={40} 
                        radius="md" 
                        variant="gradient"
                        gradient={{ from: 'gray.6', to: 'gray.7' }}
                      >
                        <IconHistory size={24} />
                      </ThemeIcon>
                      <Box>
                        <Text fw={600} size="lg">Analytics</Text>
                        <Text size="sm" c="dimmed">Coming soon</Text>
                      </Box>
                    </Group>
                  </Card>
                </Grid.Col>
              </Grid>
            </Stack>
          </Card>

          {/* Draft Sessions */}
          <Card>
            <Stack gap="lg">
              <Group justify="space-between" align="center">
                <Title order={3} size="h3">Your Drafts</Title>
                <Text size="sm" c="dimmed">
                  Recent draft sessions
                </Text>
              </Group>
              
              <DraftManagement 
                limit={3}
                onCreateNew={handleCreateNewDraft}
                showCreateButton={false}
              />
              
              <Group justify="center">
                <Button
                  variant="light"
                  onClick={() => navigate('/drafts')}
                >
                  View All Drafts
                </Button>
              </Group>
            </Stack>
          </Card>
        </Stack>
      </Container>

      {/* Delete Confirmation Modal */}
      <Modal
        opened={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Draft"
        centered
      >
        <Stack gap="md">
          <Text>
            Are you sure you want to delete this draft? This action cannot be undone.
          </Text>
          
          <Group justify="flex-end" gap="sm">
            <Button 
              variant="outline" 
              onClick={() => setDeleteModalOpen(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button 
              color="red" 
              onClick={handleDeleteDraft}
              loading={deleting}
            >
              Delete
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Box>
  )
}
