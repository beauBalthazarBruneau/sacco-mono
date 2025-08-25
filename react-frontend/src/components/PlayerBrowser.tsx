import React, { useState, useEffect, useCallback } from 'react'
import {
  Container,
  Stack,
  Title,
  Text,
  Grid,
  Center,
  Loader,
  Alert,
  Button,
  Card,
  Group,
  ThemeIcon,
  Box,
  ActionIcon
} from '@mantine/core'
import {
  IconAlertCircle,
  IconLock,
  IconDownload,
  IconExternalLink,
  IconLogout,
  IconUser
} from '@tabler/icons-react'
import { useAuth } from '../hooks/useAuth'
import { getPlayers, type Player } from '../lib/supabase'
import { PlayerCard } from './PlayerCard'
import { SearchFilters } from './SearchFilters'

export const PlayerBrowser: React.FC = () => {
  const { user, signOut } = useAuth()
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [search, setSearch] = useState('')
  const [position, setPosition] = useState('ALL')
  const [sortBy, setSortBy] = useState<'adp' | 'ppr_points'>('adp')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  const playersPerPage = 25
  const totalPages = Math.ceil(totalCount / playersPerPage)

  const fetchPlayers = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await getPlayers(
        currentPage - 1, // Convert to 0-based index
        playersPerPage,
        search,
        position,
        sortBy,
        sortOrder
      )

      if (response.error) {
        setError(response.error)
        setPlayers([])
        setTotalCount(0)
      } else {
        setPlayers(response.data)
        setTotalCount(response.count)
      }
    } catch {
      setError('Failed to fetch players. Please try again.')
      setPlayers([])
      setTotalCount(0)
    } finally {
      setLoading(false)
    }
  }, [currentPage, search, position, sortBy, sortOrder])

  useEffect(() => {
    fetchPlayers()
  }, [fetchPlayers])

  const handleSearchChange = useCallback((newSearch: string) => {
    setSearch(newSearch)
    setCurrentPage(1) // Reset to first page when searching
  }, [])

  const handlePositionChange = useCallback((newPosition: string) => {
    setPosition(newPosition)
    setCurrentPage(1) // Reset to first page when filtering
  }, [])

  const handleSortChange = useCallback((newSortBy: 'adp' | 'ppr_points', newSortOrder: 'asc' | 'desc') => {
    setSortBy(newSortBy)
    setSortOrder(newSortOrder)
    setCurrentPage(1) // Reset to first page when sorting
  }, [])

  const handleSignOut = async () => {
    await signOut()
    window.location.href = '/'
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
              <IconLock size={20} />
            </ThemeIcon>
            <Title order={1} size="h3">Sacco Player Database</Title>
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
          {/* Chrome Extension CTA */}
          <Card 
            withBorder
            padding="lg"
            style={{
              background: 'linear-gradient(45deg, var(--mantine-color-green-9), var(--mantine-color-green-8))',
              borderColor: 'var(--mantine-color-green-6)'
            }}
          >
            <Group justify="space-between" align="center" wrap="nowrap">
              <Box>
                <Title order={3} size="h4" c="white" mb="xs">
                  🚀 Ready to dominate your drafts?
                </Title>
                <Text c="green.1" size="sm">
                  Browse our player database below, then download our Chrome extension for real-time draft assistance!
                </Text>
              </Box>
              <Button
                leftSection={<IconDownload size={16} />}
                rightSection={<IconExternalLink size={16} />}
                variant="white"
                color="green"
                size="md"
                style={{ flexShrink: 0 }}
              >
                Download Extension
              </Button>
            </Group>
          </Card>

          {/* Page Title and Stats */}
          <Stack gap="sm">
            <Title order={2}>Player Rankings</Title>
            <Text c="dimmed">
              {totalCount > 0 && !loading ? (
                `Showing ${players.length} of ${totalCount.toLocaleString()} players`
              ) : (
                'Browse our comprehensive player database'
              )}
            </Text>
          </Stack>

          {/* Search and Filters */}
          <Card withBorder p="md" bg="var(--mantine-color-dark-6)">
            <SearchFilters
              search={search}
              position={position}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSearchChange={handleSearchChange}
              onPositionChange={handlePositionChange}
              onSortChange={handleSortChange}
              isLoading={loading}
            />
          </Card>

          {/* Error State */}
          {error && (
            <Alert icon={<IconAlertCircle size="1rem" />} color="red">
              {error}
            </Alert>
          )}

          {/* Loading State */}
          {loading && (
            <Center py="xl">
              <Stack align="center" gap="md">
                <Loader size="lg" color="green" />
                <Text c="dimmed">Loading players...</Text>
              </Stack>
            </Center>
          )}

          {/* Players Grid */}
          {!loading && !error && players.length > 0 && (
            <>
              <Grid gutter="md">
                {players.map((player) => (
                  <Grid.Col 
                    key={player.id} 
                    span={{ base: 12, xs: 6, sm: 4, md: 3, lg: 3 }}
                  >
                    <PlayerCard player={player} />
                  </Grid.Col>
                ))}
              </Grid>

              {/* Pagination - Temporarily simplified */}
              {totalPages > 1 && (
                <Center>
                  <Group gap="sm">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(currentPage - 1)}
                    >
                      Previous
                    </Button>
                    <Text size="sm" c="dimmed">
                      Page {currentPage} of {totalPages}
                    </Text>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(currentPage + 1)}
                    >
                      Next
                    </Button>
                  </Group>
                </Center>
              )}
            </>
          )}

          {/* No Results State */}
          {!loading && !error && players.length === 0 && (
            <Center py="xl">
              <Stack align="center" gap="md">
                <Text size="lg" c="dimmed">No players found</Text>
                <Text size="sm" c="dimmed">
                  Try adjusting your search or filter criteria
                </Text>
              </Stack>
            </Center>
          )}

          {/* Bottom CTA */}
          {!loading && players.length > 0 && (
            <Card 
              withBorder
              padding="lg"
              bg="var(--mantine-color-dark-6)"
              style={{ textAlign: 'center' }}
            >
              <Stack gap="md">
                <Title order={3} size="h4">
                  Ready to use this data in your drafts?
                </Title>
                <Text c="dimmed">
                  Get real-time player recommendations and draft assistance with our Chrome extension
                </Text>
                <Button
                  leftSection={<IconDownload size={16} />}
                  variant="gradient"
                  gradient={{ from: 'green.6', to: 'green.7' }}
                  size="lg"
                >
                  Download Chrome Extension
                </Button>
              </Stack>
            </Card>
          )}
        </Stack>
      </Container>
    </Box>
  )
}
