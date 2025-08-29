import React, { useState, useEffect, useCallback } from 'react'
import {
  Card,
  Title,
  Text,
  Button,
  Stack,
  Group,
  Alert,
  Badge,
  Box,
  ThemeIcon,
  ActionIcon,
  Modal,
  Skeleton,
  Grid
} from '@mantine/core'
import {
  IconTrophy,
  IconPlayerPlay,
  IconEye,
  IconTrash,
  IconCalendar,
  IconUsers,
  IconCrown,
  IconCheck,
  IconAlertCircle,
  IconSettings
} from '@tabler/icons-react'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { 
  getDraftSessions, 
  deleteDraftSession,
  type DraftSession 
} from '../lib/supabase'

interface DraftManagementProps {
  onNavigateToDraft?: (draftId: string) => void
  onCreateNew?: () => void
  limit?: number
  showCreateButton?: boolean
}

export const DraftManagement: React.FC<DraftManagementProps> = ({
  onNavigateToDraft,
  onCreateNew,
  limit,
  showCreateButton = true
}) => {
  const { user } = useAuth()
  const navigate = useNavigate()
  
  const [drafts, setDrafts] = useState<DraftSession[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedDraftId, setSelectedDraftId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const loadDrafts = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const { data, error } = await getDraftSessions()
      
      if (error) {
        setError(typeof error === 'string' ? error : error.message)
        return
      }
      
      // Apply limit if specified
      const limitedData = limit ? data.slice(0, limit) : data
      setDrafts(limitedData)
    } catch (err) {
      console.error('Error loading drafts:', err)
      setError('Failed to load draft sessions.')
    } finally {
      setLoading(false)
    }
  }, [limit])

  useEffect(() => {
    if (user) {
      loadDrafts()
    }
  }, [user, loadDrafts])

  const handleContinueDraft = (draftId: string) => {
    if (onNavigateToDraft) {
      onNavigateToDraft(draftId)
    } else {
      navigate(`/drafts/${draftId}`)
    }
  }

  const handleViewResults = (draftId: string) => {
    navigate(`/drafts/${draftId}/results`)
  }

  const handleCreateNew = () => {
    if (onCreateNew) {
      onCreateNew()
    } else {
      navigate('/drafts/create')
    }
  }

  const openDeleteModal = (draftId: string) => {
    setSelectedDraftId(draftId)
    setDeleteModalOpen(true)
  }

  const handleDeleteDraft = async () => {
    if (!selectedDraftId) return
    
    try {
      setDeleting(true)
      
      const { error } = await deleteDraftSession(selectedDraftId)
      
      if (error) {
        setError(typeof error === 'string' ? error : error.message)
        return
      }

      // Remove from local state
      setDrafts(prev => prev.filter(draft => draft.id !== selectedDraftId))
      setDeleteModalOpen(false)
      setSelectedDraftId(null)
    } catch (err) {
      console.error('Error deleting draft:', err)
      setError('Failed to delete draft session.')
    } finally {
      setDeleting(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'blue'
      case 'completed': return 'green'
      case 'cancelled': return 'red'
      default: return 'gray'
    }
  }

  const getLeagueType = (settings: Record<string, unknown>) => {
    return settings.league_type as string || 'PPR'
  }

  const getStrategy = (settings: Record<string, unknown>) => {
    return settings.preferred_strategy as string || 'Best Available'
  }

  if (!user) {
    return (
      <Alert
        icon={<IconAlertCircle size={16} />}
        title="Authentication Required"
        color="red"
      >
        Please sign in to view your drafts.
      </Alert>
    )
  }

  if (loading) {
    return (
      <Stack gap="md">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} height={120} radius="md" />
        ))}
      </Stack>
    )
  }

  if (error) {
    return (
      <Alert
        icon={<IconAlertCircle size={16} />}
        title="Error"
        color="red"
        onClose={() => setError(null)}
        withCloseButton
      >
        {error}
      </Alert>
    )
  }

  if (drafts.length === 0) {
    return (
      <Card withBorder padding="xl" radius="md">
        <Box ta="center">
          <ThemeIcon
            size={60}
            radius="xl"
            variant="gradient"
            gradient={{ from: 'gray.5', to: 'gray.6' }}
            mx="auto"
            mb="md"
          >
            <IconTrophy size={30} />
          </ThemeIcon>
          <Title order={4} size="h4" mb="xs">No drafts yet</Title>
          <Text c="dimmed" mb="lg">
            Create your first draft to get started with AI-powered recommendations!
          </Text>
          {showCreateButton && (
            <Button
              variant="gradient"
              gradient={{ from: 'green.6', to: 'green.7' }}
              leftSection={<IconTrophy size={16} />}
              onClick={handleCreateNew}
            >
              Create Your First Draft
            </Button>
          )}
        </Box>
      </Card>
    )
  }

  return (
    <Stack gap="md">
      {drafts.map((draft) => (
        <Card key={draft.id} withBorder padding="lg" radius="md">
          <Group justify="space-between" align="flex-start">
            <Box flex={1}>
              <Group align="center" mb="xs">
                <Text fw={600} size="lg">{draft.league_name}</Text>
                <Badge color={getStatusColor(draft.status)} variant="light">
                  {draft.status}
                </Badge>
                <Text size="sm" c="dimmed">
                  {draft.platform}
                </Text>
              </Group>
              
              <Grid mb="sm">
                <Grid.Col span={4}>
                  <Group gap="xs">
                    <IconUsers size={14} />
                    <Text size="sm">{draft.team_count} teams</Text>
                  </Group>
                </Grid.Col>
                <Grid.Col span={4}>
                  <Group gap="xs">
                    <IconCrown size={14} />
                    <Text size="sm">Pick #{draft.draft_position}</Text>
                  </Group>
                </Grid.Col>
                <Grid.Col span={4}>
                  <Group gap="xs">
                    <IconCalendar size={14} />
                    <Text size="sm">Created {formatDate(draft.created_at)}</Text>
                  </Group>
                </Grid.Col>
              </Grid>

              <Group gap="md" mb="xs">
                <Group gap="xs">
                  <IconSettings size={12} />
                  <Text size="xs" c="dimmed">{getLeagueType(draft.settings)}</Text>
                </Group>
                <Group gap="xs">
                  <IconCheck size={12} />
                  <Text size="xs" c="dimmed">{getStrategy(draft.settings)}</Text>
                </Group>
              </Group>

              {draft.draft_date && (
                <Text size="sm" c="green">
                  <IconCalendar size={14} style={{ display: 'inline', marginRight: 4 }} />
                  Draft: {formatDate(draft.draft_date)}
                </Text>
              )}
            </Box>
            
            <Group gap="xs">
              {draft.status === 'active' ? (
                <Button
                  size="sm"
                  variant="gradient"
                  gradient={{ from: 'green.6', to: 'green.7' }}
                  leftSection={<IconPlayerPlay size={16} />}
                  onClick={() => handleContinueDraft(draft.id)}
                >
                  Continue
                </Button>
              ) : draft.status === 'completed' ? (
                <Button
                  size="sm"
                  variant="outline"
                  leftSection={<IconEye size={16} />}
                  onClick={() => handleViewResults(draft.id)}
                >
                  View Results
                </Button>
              ) : null}
              
              <ActionIcon
                size="lg"
                variant="subtle"
                color="red"
                onClick={() => openDeleteModal(draft.id)}
                title="Delete draft"
              >
                <IconTrash size={16} />
              </ActionIcon>
            </Group>
          </Group>
        </Card>
      ))}

      {showCreateButton && (
        <Button
          variant="light"
          leftSection={<IconTrophy size={16} />}
          onClick={handleCreateNew}
        >
          Create New Draft
        </Button>
      )}

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
    </Stack>
  )
}
