import React, { useState, useEffect } from 'react'
import {
  Card,
  Title,
  Text,
  Stack,
  Group,
  Box,
  ActionIcon,
  ThemeIcon,
  Button,
  Badge,
  Loader,
  Center,
  Modal,
  TextInput,
  NumberInput,
  Select
} from '@mantine/core'
import {
  IconPlus,
  IconDots,
  IconTrophy
} from '@tabler/icons-react'
import { getDraftSessions, createDraftSession, type DraftSession } from '../../../lib/supabase'
import { useAuth } from '../../../hooks/useAuth'

export const LeaguesList: React.FC = () => {
  const { user } = useAuth()
  const [draftSessions, setDraftSessions] = useState<DraftSession[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modalOpened, setModalOpened] = useState(false)
  const [creating, setCreating] = useState(false)

  // Form state for new league
  const [newLeague, setNewLeague] = useState({
    league_name: '',
    platform: 'ESPN',
    team_count: 12,
    draft_position: 1,
    draft_date: '',
    status: 'active' as const,
    settings: {}
  })

  useEffect(() => {
    const fetchDraftSessions = async () => {
      if (!user) return

      try {
        setLoading(true)
        const response = await getDraftSessions(user.id)

        if (response.error) {
          setError(response.error)
        } else {
          setDraftSessions(response.data)
        }
      } catch (err) {
        setError('Failed to load draft sessions')
      } finally {
        setLoading(false)
      }
    }

    fetchDraftSessions()
  }, [user])

  const handleCreateLeague = async () => {
    if (!user) return

    try {
      setCreating(true)


      const sessionData = {
        ...newLeague,
        user_id: user.id,
        draft_date: newLeague.draft_date || null
      }

      console.log('Creating league with data:', sessionData)
      const { data, error } = await createDraftSession(sessionData)

      if (error) {
        console.error('Error creating league:', error)
      } else if (data) {
        setDraftSessions(prev => [data, ...prev])
        setModalOpened(false)
        setNewLeague({
          league_name: '',
          platform: 'ESPN',
          team_count: 12,
          draft_position: 1,
          draft_date: '',
          status: 'active',
          settings: {}
        })
      }
    } catch (err) {
      console.error('Error creating league:', err)
    } finally {
      setCreating(false)
    }
  }

  const formatDraftDate = (dateString: string | null) => {
    if (!dateString) return 'TBD'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'active': return 'green'
      case 'completed': return 'blue'
      case 'cancelled': return 'red'
      default: return 'gray'
    }
  }

  return (
    <>
      <Card withBorder padding="lg" bg="var(--mantine-color-dark-6)">
        <Stack gap="lg">
          {/* Header */}
          <Group gap="md">
            <ThemeIcon
              size={32}
              radius="md"
              variant="gradient"
              gradient={{ from: 'green.6', to: 'green.7' }}
            >
              <IconTrophy size={20} />
            </ThemeIcon>
            <Title order={3} size="h4">
              My Leagues
            </Title>
          </Group>

          {/* Leagues List */}
          {loading ? (
            <Center py="xl">
              <Loader size="md" />
            </Center>
          ) : error ? (
            <Center py="xl">
              <Text c="red" size="sm">{error}</Text>
            </Center>
          ) : (
            <Stack gap="md">
              {draftSessions.length === 0 ? (
                <Center py="xl">
                  <Text c="dimmed" size="sm">No leagues yet. Create your first one!</Text>
                </Center>
              ) : (
                draftSessions.map((session) => (
                  <Card
                    key={session.id}
                    withBorder
                    padding="md"
                    radius="md"
                    bg="var(--mantine-color-dark-5)"
                    style={{
                      borderColor: 'var(--mantine-color-dark-4)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <Group justify="space-between" align="flex-start">
                      <Box style={{ flex: 1 }}>
                        <Group gap="xs" align="center" mb="xs">
                          <Text fw={600} size="md">
                            {session.league_name}
                          </Text>
                          <Badge
                            size="sm"
                            color={getStatusColor(session.status)}
                            variant="light"
                          >
                            {session.status || 'active'}
                          </Badge>
                        </Group>
                        <Text size="sm" c="dimmed" mb="xs">
                          {session.team_count} teams • Position #{session.draft_position} • {session.platform}
                        </Text>
                        <Text size="xs" c="dimmed">
                          Draft: {formatDraftDate(session.draft_date)}
                        </Text>
                      </Box>
                      <ActionIcon variant="subtle" color="gray">
                        <IconDots size={16} />
                      </ActionIcon>
                    </Group>
                  </Card>
                ))
              )}
            </Stack>
          )}

          {/* Add New League */}
          <Button
            variant="outline"
            size="md"
            leftSection={<IconPlus size={16} />}
            style={{
              borderStyle: 'dashed',
              borderColor: 'var(--mantine-color-green-6)',
              color: 'var(--mantine-color-green-6)',
              backgroundColor: 'transparent'
            }}
            fullWidth
            onClick={() => setModalOpened(true)}
          >
            + Add New League
          </Button>
        </Stack>
      </Card>

      {/* Create League Modal */}
      <Modal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        title="Create New League"
        size="md"
      >
        <Stack gap="md">
          <TextInput
            label="League Name"
            placeholder="Enter league name"
            required
            value={newLeague.league_name}
            onChange={(e) => setNewLeague(prev => ({ ...prev, league_name: e.target.value }))}
          />

          <Select
            label="Platform"
            required
            value={newLeague.platform}
            onChange={(value) => setNewLeague(prev => ({ ...prev, platform: value || 'ESPN' }))}
            data={[
              { value: 'ESPN', label: 'ESPN' },
              { value: 'Yahoo', label: 'Yahoo Fantasy' },
              { value: 'Sleeper', label: 'Sleeper' },
              { value: 'Other', label: 'Other' }
            ]}
          />

          <Group grow>
            <NumberInput
              label="Number of Teams"
              required
              min={4}
              max={20}
              value={newLeague.team_count}
              onChange={(value) => setNewLeague(prev => ({ ...prev, team_count: Number(value) || 12 }))}
            />

            <NumberInput
              label="Your Draft Position"
              required
              min={1}
              max={newLeague.team_count}
              value={newLeague.draft_position}
              onChange={(value) => setNewLeague(prev => ({ ...prev, draft_position: Number(value) || 1 }))}
            />
          </Group>

          <TextInput
            label="Draft Date (Optional)"
            placeholder="YYYY-MM-DD HH:MM"
            value={newLeague.draft_date}
            onChange={(e) => setNewLeague(prev => ({ ...prev, draft_date: e.target.value }))}
          />

          <Group justify="flex-end" mt="md">
            <Button variant="outline" onClick={() => setModalOpened(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateLeague}
              loading={creating}
              disabled={!newLeague.league_name.trim()}
            >
              Create League
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  )
}
