import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Container, Grid, Stack, Title, Text, Group, Card, Box, Loader, Center } from '@mantine/core'
import { DraftOrderBar } from '../components/DraftOrderBar'
import { PlayerDraftTable } from '../components/PlayerDraftTable'
import { DraftedTeamPanel } from '../components/DraftedTeamPanel'
import { getDraftSession, getDraftPicks, supabase, type DraftSession as DraftSessionType, type DraftPick } from '../../../lib/supabase'
import { useAuth } from '../../../hooks/useAuth'

export const DraftSession: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>()
  const { user } = useAuth()

  const [session, setSession] = useState<DraftSessionType | null>(null)
  const [draftPicks, setDraftPicks] = useState<DraftPick[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDraftData = async () => {
      if (!sessionId || !user) return

      try {
        setLoading(true)

        // Fetch draft session details
        const sessionResponse = await getDraftSession(sessionId)
        if (sessionResponse.error || !sessionResponse.data) {
          setError(sessionResponse.error?.message || 'Draft session not found')
          return
        }

        // Fetch draft picks
        const picksResponse = await getDraftPicks(sessionId)
        if (picksResponse.error) {
          console.error('Error fetching draft picks:', picksResponse.error)
        }

        setSession(sessionResponse.data)
        setDraftPicks(picksResponse.data || [])
      } catch (err) {
        console.error('Error fetching draft data:', err)
        setError('Failed to load draft data')
      } finally {
        setLoading(false)
      }
    }

    fetchDraftData()
  }, [sessionId, user])

  // Set up real-time subscription for draft picks
  useEffect(() => {
    if (!sessionId || !supabase) return

    const channel = supabase
      .channel('draft_picks')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'draft_picks',
          filter: `draft_session_id=eq.${sessionId}`
        },
        (payload) => {
          console.log('New draft pick:', payload)
          if (payload.new) {
            setDraftPicks(prev => [...prev, payload.new as DraftPick])
          }
        }
      )
      .subscribe()

    return () => {
      if (supabase) {
        supabase.removeChannel(channel)
      }
    }
  }, [sessionId])

  // Calculate current draft state
  const currentPick = draftPicks.length + 1
  const currentRound = Math.ceil(currentPick / (session?.team_count || 1))

  // Calculate which team is currently drafting
  const getCurrentDraftingTeam = () => {
    if (!session) return 1
    const teamCount = session.team_count

    if (currentRound % 2 === 1) {
      // Odd rounds: normal order
      return ((currentPick - 1) % teamCount) + 1
    } else {
      // Even rounds: reverse order
      return teamCount - ((currentPick - 1) % teamCount)
    }
  }

  const currentDraftingTeam = getCurrentDraftingTeam()
  const isUserTurn = currentDraftingTeam === session?.draft_position

  // Generate teams array with current user position
  const teams = session ? Array.from({ length: session.team_count }, (_, i) => {
    const teamNumber = i + 1
    const isCurrentUser = teamNumber === session.draft_position

    // Calculate this team's next pick number based on snake draft
    let nextPick = teamNumber
    for (let round = 2; round <= currentRound; round++) {
      if (round % 2 === 0) {
        // Even rounds go in reverse order
        nextPick += (session.team_count * 2) - (teamNumber * 2) + 1
      } else {
        // Odd rounds go in normal order
        nextPick += session.team_count
      }
    }

    return {
      id: teamNumber,
      name: isCurrentUser ? 'You' : `Team ${teamNumber}`,
      pick: nextPick > draftPicks.length ? nextPick : draftPicks.length + teamNumber,
      isCurrentUser
    }
  }) : []

  if (loading) {
    return (
      <Box style={{ minHeight: '100vh', backgroundColor: 'var(--mantine-color-dark-7)' }}>
        <Center h="100vh">
          <Loader size="lg" />
        </Center>
      </Box>
    )
  }

  if (error || !session) {
    return (
      <Box style={{ minHeight: '100vh', backgroundColor: 'var(--mantine-color-dark-7)' }}>
        <Center h="100vh">
          <Text c="red" size="lg">{error || 'Draft session not found'}</Text>
        </Center>
      </Box>
    )
  }

  return (
    <Box style={{ minHeight: '100vh', backgroundColor: 'var(--mantine-color-dark-7)' }}>
      <Container size="xl" py="md">
        <Stack gap="lg">
          {/* Header */}
          <Group justify="space-between" align="center">
            <Stack gap="xs">
              <Title order={1} size="h3" c="white">
                Fantasy Draft Assistant
              </Title>
              <Text size="xl" fw={600} c="white">
                Live Draft - {session.league_name}
              </Text>
            </Stack>
          </Group>

          {/* Round and Pick Info */}
          <Card withBorder padding="md" bg="var(--mantine-color-dark-6)">
            <Stack gap="xs">
              <Text size="lg" fw={600} ta="center">
                Round {currentRound}, Pick {currentPick} - Snake Draft
              </Text>
              <Text
                size="md"
                ta="center"
                c={isUserTurn ? 'green' : 'dimmed'}
                fw={isUserTurn ? 700 : 400}
              >
                {isUserTurn ? 'YOUR TURN!' : `Team ${currentDraftingTeam} is drafting...`}
              </Text>
            </Stack>
          </Card>

          {/* Draft Order Bar */}
          <DraftOrderBar teams={teams} currentDraftingTeam={currentDraftingTeam} />

          {/* Main Draft Content */}
          <Grid>
            <Grid.Col span={{ base: 12, md: 8 }}>
              <PlayerDraftTable
                sessionId={sessionId!}
                draftPicks={draftPicks}
                onPlayerDrafted={(newPick) => setDraftPicks([...draftPicks, newPick])}
                currentDraftPosition={session.draft_position}
                teamCount={session.team_count}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <DraftedTeamPanel
                sessionId={sessionId!}
                userId={user?.id || ''}
                draftPicks={draftPicks}
                userDraftPosition={session.draft_position}
                teamCount={session.team_count}
              />
            </Grid.Col>
          </Grid>
        </Stack>
      </Container>
    </Box>
  )
}