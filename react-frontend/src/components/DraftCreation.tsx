import React, { useState, useEffect } from 'react'
import {
  Container,
  Card,
  Title,
  Text,
  TextInput,
  Select,
  NumberInput,
  Button,
  Stack,
  Group,
  Alert,
  Stepper,
  Grid,
  Paper,
  ThemeIcon,
  Box
} from '@mantine/core'
import { DateTimePicker } from '@mantine/dates'
import {
  IconTrophy,
  IconSettings,
  IconUsers,
  IconCalendar,
  IconCheck,
  IconAlertCircle,
  IconArrowLeft,
  IconArrowRight
} from '@tabler/icons-react'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { 
  createDraftSession, 
  getUserPreferences,
  updateUserPreferences,
  type DraftSessionForm,
  type LeagueType,
  type DraftStrategy,
  type UserPreferences
} from '../lib/supabase'

const PLATFORMS = [
  { value: 'ESPN', label: 'ESPN' },
  { value: 'Yahoo', label: 'Yahoo Fantasy' },
  { value: 'Sleeper', label: 'Sleeper' },
  { value: 'NFL.com', label: 'NFL.com' },
  { value: 'Other', label: 'Other' }
]

const LEAGUE_TYPES: { value: LeagueType; label: string; description: string }[] = [
  { value: 'PPR', label: 'PPR (Point Per Reception)', description: 'Full point for each reception' },
  { value: 'Half-PPR', label: 'Half PPR', description: '0.5 points for each reception' },
  { value: 'Standard', label: 'Standard', description: 'No reception bonus' },
  { value: 'Superflex', label: 'Superflex', description: 'QB can be played in flex position' }
]

const DRAFT_STRATEGIES: { value: DraftStrategy; label: string; description: string }[] = [
  { value: 'Best Available', label: 'Best Available', description: 'Always pick the highest-ranked player' },
  { value: 'Position Need', label: 'Position Need', description: 'Fill roster based on positional requirements' },
  { value: 'Zero RB', label: 'Zero RB', description: 'Wait on RBs, focus on WR/TE early' },
  { value: 'Hero RB', label: 'Hero RB', description: 'Draft one elite RB, then wait' },
  { value: 'Late Round QB', label: 'Late Round QB', description: 'Wait until late rounds for QB' },
  { value: 'Streaming', label: 'Streaming D/ST', description: 'Focus on streamable defenses' }
]

export const DraftCreation: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  
  const [activeStep, setActiveStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null)
  
  const [formData, setFormData] = useState<DraftSessionForm>({
    league_name: '',
    platform: '',
    team_count: 12,
    draft_position: 1,
    draft_date: undefined,
    league_type: 'PPR',
    preferred_strategy: 'Best Available'
  })

  useEffect(() => {
    loadUserPreferences()
  }, [])

  const loadUserPreferences = async () => {
    try {
      const { data, error } = await getUserPreferences()
      if (error) {
        console.warn('Could not load user preferences:', error)
        return
      }
      
      if (data) {
        setUserPreferences(data)
        // Pre-fill form with user preferences
        setFormData(prev => ({
          ...prev,
          team_count: data.team_count,
          draft_position: data.draft_position || 1,
          league_type: data.league_type,
          preferred_strategy: data.preferred_strategy
        }))
      }
    } catch (err) {
      console.warn('Error loading user preferences:', err)
    }
  }

  const handleInputChange = (field: keyof DraftSessionForm, value: string | number | Date | LeagueType | DraftStrategy | null | undefined) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleNext = () => {
    setActiveStep(prev => Math.min(prev + 1, 2))
  }

  const handlePrevious = () => {
    setActiveStep(prev => Math.max(prev - 1, 0))
  }

  const validateCurrentStep = () => {
    switch (activeStep) {
      case 0:
        return formData.league_name.trim() !== '' && formData.platform !== ''
      case 1:
        return formData.team_count >= 4 && formData.team_count <= 20 && 
               formData.draft_position >= 1 && formData.draft_position <= formData.team_count
      case 2:
        return true // Settings are optional
      default:
        return false
    }
  }

  const handleSubmit = async () => {
    try {
      setLoading(true)
      setError(null)

      // Update user preferences if they changed
      if (userPreferences) {
        const preferencesChanged = 
          formData.team_count !== userPreferences.team_count ||
          formData.league_type !== userPreferences.league_type ||
          formData.preferred_strategy !== userPreferences.preferred_strategy

        if (preferencesChanged) {
          await updateUserPreferences({
            team_count: formData.team_count,
            league_type: formData.league_type,
            preferred_strategy: formData.preferred_strategy,
            draft_position: formData.draft_position
          })
        }
      }

      // Create draft session
      const { data, error } = await createDraftSession(formData)
      
      if (error) {
        setError(typeof error === 'string' ? error : error.message)
        return
      }

      if (data) {
        // Navigate to the new draft session
        navigate(`/drafts/${data.id}`)
      }
    } catch (err) {
      console.error('Error creating draft:', err)
      setError('An unexpected error occurred while creating your draft.')
    } finally {
      setLoading(false)
    }
  }

  const renderBasicInfo = () => (
    <Stack gap="md">
      <TextInput
        label="League Name"
        placeholder="My Fantasy League"
        value={formData.league_name}
        onChange={(e) => handleInputChange('league_name', e.target.value)}
        required
        leftSection={<IconTrophy size={16} />}
      />
      
      <Select
        label="Fantasy Platform"
        placeholder="Select platform"
        value={formData.platform}
        onChange={(value) => handleInputChange('platform', value || '')}
        data={PLATFORMS}
        required
        leftSection={<IconSettings size={16} />}
      />
      
      <DateTimePicker
        label="Draft Date & Time (Optional)"
        placeholder="Select draft date and time"
        value={formData.draft_date}
        onChange={(value) => handleInputChange('draft_date', value)}
        leftSection={<IconCalendar size={16} />}
        clearable
      />
    </Stack>
  )

  const renderLeagueSettings = () => (
    <Stack gap="md">
      <Grid>
        <Grid.Col span={6}>
          <NumberInput
            label="Number of Teams"
            value={formData.team_count}
            onChange={(value) => handleInputChange('team_count', value || 12)}
            min={4}
            max={20}
            required
            leftSection={<IconUsers size={16} />}
          />
        </Grid.Col>
        <Grid.Col span={6}>
          <NumberInput
            label="Your Draft Position"
            value={formData.draft_position}
            onChange={(value) => handleInputChange('draft_position', value || 1)}
            min={1}
            max={formData.team_count}
            required
            leftSection={<IconTrophy size={16} />}
          />
        </Grid.Col>
      </Grid>
      
      <Select
        label="League Type"
        value={formData.league_type}
        onChange={(value) => handleInputChange('league_type', value as LeagueType)}
        data={LEAGUE_TYPES.map(type => ({
          value: type.value,
          label: type.label
        }))}
        required
      />
      
      <Paper p="sm" withBorder>
        <Text size="sm" c="dimmed" mb="xs">League Type Information:</Text>
        <Text size="xs" c="dimmed">
          {LEAGUE_TYPES.find(type => type.value === formData.league_type)?.description}
        </Text>
      </Paper>
    </Stack>
  )

  const renderDraftStrategy = () => (
    <Stack gap="md">
      <Select
        label="Preferred Draft Strategy"
        value={formData.preferred_strategy}
        onChange={(value) => handleInputChange('preferred_strategy', value as DraftStrategy)}
        data={DRAFT_STRATEGIES.map(strategy => ({
          value: strategy.value,
          label: strategy.label
        }))}
        required
      />
      
      <Paper p="md" withBorder>
        <Text size="sm" fw={600} mb="xs">
          {DRAFT_STRATEGIES.find(s => s.value === formData.preferred_strategy)?.label}
        </Text>
        <Text size="sm" c="dimmed">
          {DRAFT_STRATEGIES.find(s => s.value === formData.preferred_strategy)?.description}
        </Text>
      </Paper>
      
      <Alert
        icon={<IconCheck size={16} />}
        color="green"
        title="Ready to Draft!"
      >
        Your draft session will be created with these settings. You can modify your strategy during the draft if needed.
      </Alert>
    </Stack>
  )

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return renderBasicInfo()
      case 1:
        return renderLeagueSettings()
      case 2:
        return renderDraftStrategy()
      default:
        return null
    }
  }

  if (!user) {
    return (
      <Container size="sm" py="xl">
        <Alert
          icon={<IconAlertCircle size={16} />}
          title="Authentication Required"
          color="red"
        >
          Please sign in to create a draft session.
        </Alert>
      </Container>
    )
  }

  return (
    <Container size="sm" py="xl">
      <Card withBorder padding="xl" radius="lg">
        <Stack gap="xl">
          {/* Header */}
          <Box ta="center">
            <ThemeIcon
              size={60}
              radius="xl"
              variant="gradient"
              gradient={{ from: 'green.6', to: 'green.7' }}
              mx="auto"
              mb="md"
            >
              <IconTrophy size={30} />
            </ThemeIcon>
            <Title order={2} size="h1" mb="xs">Create New Draft</Title>
            <Text c="dimmed">
              Set up your fantasy football draft session with AI-powered assistance
            </Text>
          </Box>

          {/* Error Alert */}
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

          {/* Stepper */}
          <Stepper active={activeStep} onStepClick={setActiveStep}>
            <Stepper.Step
              label="Basic Info"
              description="League details"
              icon={<IconTrophy size={16} />}
            />
            <Stepper.Step
              label="League Settings"
              description="Teams & format"
              icon={<IconUsers size={16} />}
            />
            <Stepper.Step
              label="Draft Strategy"
              description="AI preferences"
              icon={<IconSettings size={16} />}
            />
          </Stepper>

          {/* Step Content */}
          <Box>
            {renderStepContent()}
          </Box>

          {/* Navigation */}
          <Group justify="space-between">
            <Button
              variant="subtle"
              leftSection={<IconArrowLeft size={16} />}
              onClick={handlePrevious}
              disabled={activeStep === 0}
            >
              Previous
            </Button>

            {activeStep < 2 ? (
              <Button
                rightSection={<IconArrowRight size={16} />}
                onClick={handleNext}
                disabled={!validateCurrentStep()}
              >
                Next
              </Button>
            ) : (
              <Button
                variant="gradient"
                gradient={{ from: 'green.6', to: 'green.7' }}
                rightSection={<IconCheck size={16} />}
                onClick={handleSubmit}
                loading={loading}
                disabled={!validateCurrentStep()}
              >
                Create Draft
              </Button>
            )}
          </Group>
        </Stack>
      </Card>
    </Container>
  )
}
