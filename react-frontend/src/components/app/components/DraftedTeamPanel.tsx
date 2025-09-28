import React, { useMemo } from 'react'
import { Card, Stack, Title, Text, Group, Checkbox, Badge, Divider } from '@mantine/core'
import { type DraftPick } from '../../../lib/supabase'

interface DraftedTeamPanelProps {
  sessionId: string
  userId: string
  draftPicks: DraftPick[]
  userDraftPosition: number
  teamCount: number
}

interface Position {
  name: string
  needed: number
  filled: number
}

export const DraftedTeamPanel: React.FC<DraftedTeamPanelProps> = ({
  draftPicks,
  userDraftPosition,
  teamCount
}) => {
  // Calculate user's draft picks based on draft position and snake draft logic
  const userPicks = useMemo(() => {
    const userPickNumbers: number[] = []

    for (let round = 1; round <= Math.ceil(draftPicks.length / teamCount) + 2; round++) {
      let pickInRound: number
      if (round % 2 === 1) {
        // Odd rounds: normal order
        pickInRound = userDraftPosition
      } else {
        // Even rounds: reverse order
        pickInRound = teamCount - userDraftPosition + 1
      }

      const globalPick = (round - 1) * teamCount + pickInRound
      userPickNumbers.push(globalPick)
    }

    return draftPicks.filter(pick => userPickNumbers.includes(pick.pick_number))
  }, [draftPicks, userDraftPosition, teamCount])

  // Calculate position needs and fills
  const positions: Position[] = useMemo(() => {
    const positionCounts = {
      'PG': 0, 'SG': 0, 'SF': 0, 'PF': 0, 'C': 0,
      'G': 0, 'F': 0, 'UTIL': 0
    }

    userPicks.forEach(pick => {
      const pos = pick.position
      if (pos && pos in positionCounts) {
        positionCounts[pos as keyof typeof positionCounts]++
      }
    })

    return [
      { name: 'PG', needed: 2, filled: positionCounts.PG },
      { name: 'SG', needed: 2, filled: positionCounts.SG },
      { name: 'SF', needed: 2, filled: positionCounts.SF },
      { name: 'PF', needed: 2, filled: positionCounts.PF },
      { name: 'C', needed: 2, filled: positionCounts.C },
      { name: 'G', needed: 1, filled: positionCounts.G },
      { name: 'F', needed: 1, filled: positionCounts.F },
      { name: 'UTIL', needed: 2, filled: positionCounts.UTIL },
    ]
  }, [userPicks])

  const getPositionColor = (position: string) => {
    switch (position) {
      case 'PG': return 'blue'
      case 'SG': return 'cyan'
      case 'SF': return 'green'
      case 'PF': return 'orange'
      case 'C': return 'red'
      case 'G': return 'grape'
      case 'F': return 'lime'
      case 'UTIL': return 'gray'
      default: return 'gray'
    }
  }

  return (
    <Card withBorder padding="lg" bg="var(--mantine-color-dark-6)" style={{ height: 'fit-content' }}>
      <Stack gap="lg">
        <Title order={3} size="h4">
          Your Team
        </Title>

        {/* Positions Needed Section */}
        <Stack gap="sm">
          <Text size="md" fw={600}>
            Positions Needed
          </Text>

          {positions.map((position) => (
            <Group key={position.name} justify="space-between" align="center">
              <Group gap="sm">
                <Checkbox
                  checked={position.filled >= position.needed}
                  readOnly
                  size="sm"
                />
                <Text size="sm">
                  {position.name} ({position.filled}/{position.needed})
                </Text>
              </Group>
            </Group>
          ))}
        </Stack>

        <Divider />

        {/* Drafted Players Section */}
        <Stack gap="sm">
          <Text size="md" fw={600}>
            Drafted Players
          </Text>

          {userPicks.length === 0 ? (
            <Text size="sm" c="dimmed" ta="center" py="md">
              No players drafted yet
            </Text>
          ) : (
            <Stack gap="sm">
              {userPicks.map((pick) => (
                <Group key={pick.id} justify="space-between" align="center">
                  <Text size="sm" fw={500}>
                    {pick.player_name}
                  </Text>
                  <Badge size="sm" color={getPositionColor(pick.position)} variant="light">
                    {pick.position}
                  </Badge>
                </Group>
              ))}
            </Stack>
          )}
        </Stack>
      </Stack>
    </Card>
  )
}