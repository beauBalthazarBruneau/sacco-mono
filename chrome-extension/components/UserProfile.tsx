import { 
  Paper, 
  Title, 
  Text, 
  Button, 
  Group, 
  Avatar,
  Container,
  Divider
} from '@mantine/core'
import { IconLogout, IconUser } from '@tabler/icons-react'
import { useAuth } from '../hooks/useAuth'

export const UserProfile = () => {
  const { user, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <Container size="sm" py="xl">
      <Paper shadow="md" p="xl" radius="md">
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <Avatar 
            size={80} 
            radius={80} 
            mx="auto" 
            mb="md"
            color="blue"
          >
            <IconUser size={40} />
          </Avatar>
          <Title order={2} mb="xs">
            Welcome back!
          </Title>
          <Text c="dimmed" size="lg">
            {user?.email}
          </Text>
        </div>

        <Divider my="lg" />

        <Group justify="space-between" mb="md">
          <div>
            <Text size="sm" c="dimmed">User ID</Text>
            <Text size="xs" style={{ fontFamily: 'monospace' }}>
              {user?.id}
            </Text>
          </div>
        </Group>

        <Group justify="space-between" mb="lg">
          <div>
            <Text size="sm" c="dimmed">Last Sign In</Text>
            <Text size="xs">
              {user?.last_sign_in_at 
                ? new Date(user.last_sign_in_at).toLocaleDateString()
                : 'Unknown'
              }
            </Text>
          </div>
        </Group>

        <Button 
          fullWidth 
          variant="outline" 
          color="red"
          leftSection={<IconLogout size={16} />}
          onClick={handleSignOut}
        >
          Sign Out
        </Button>
      </Paper>
    </Container>
  )
}
