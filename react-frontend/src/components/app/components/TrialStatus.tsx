import { Progress, Paper, Text, Group, Badge, Button, Stack } from '@mantine/core';
import { IconDashboard, IconCreditCard } from '@tabler/icons-react';
import { useAuth } from '../../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { formatCurrency, DRAFT_PICKS_FEE } from '../../../lib/stripe';

interface TrialStatusProps {
  userProfile?: {
    draft_picks_used: number;
    draft_picks_limit: number;
    subscription_tier: 'free' | 'basic' | 'premium';
    trial_started_at: string | null;
  };
}

export function TrialStatus({ userProfile }: TrialStatusProps) {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user || !userProfile) {
    return null;
  }

  const { draft_picks_used, draft_picks_limit, subscription_tier } = userProfile;
  const picksRemaining = Math.max(0, draft_picks_limit - draft_picks_used);
  const usagePercentage = (draft_picks_used / draft_picks_limit) * 100;
  const isTrialUser = subscription_tier === 'free';
  const hasExceededLimit = draft_picks_used >= draft_picks_limit;

  const getStatusColor = () => {
    if (hasExceededLimit) return 'red';
    if (usagePercentage > 80) return 'yellow';
    return 'blue';
  };

  const getStatusText = () => {
    if (subscription_tier === 'premium') return 'Premium';
    if (subscription_tier === 'basic') return 'Basic';
    if (hasExceededLimit) return 'Limit Reached';
    return 'Free Trial';
  };

  return (
    <Paper p="md" withBorder>
      <Stack gap="md">
        <Group justify="space-between">
          <Group gap="xs">
            <IconDashboard size={20} />
            <Text fw={500}>Draft Pick Usage</Text>
          </Group>
          <Badge color={getStatusColor()} variant="filled">
            {getStatusText()}
          </Badge>
        </Group>

        <Stack gap="xs">
          <Group justify="space-between">
            <Text size="sm" c="dimmed">
              Picks Used
            </Text>
            <Text size="sm" fw={500}>
              {draft_picks_used} / {draft_picks_limit}
            </Text>
          </Group>

          <Progress 
            value={Math.min(usagePercentage, 100)} 
            color={getStatusColor()}
            size="lg"
          />

          {isTrialUser && (
            <Text size="sm" c="dimmed" ta="center">
              {picksRemaining > 0 
                ? `${picksRemaining} picks remaining in your free trial`
                : `Free trial completed. Upgrade to continue using draft picks.`
              }
            </Text>
          )}
        </Stack>

        {hasExceededLimit && isTrialUser && (
          <Stack gap="xs">
            <Text size="sm" c="red" ta="center">
              You've used all your free draft picks!
            </Text>
            <Button 
              leftSection={<IconCreditCard size={16} />}
              onClick={() => navigate('/billing/payment-setup')}
              fullWidth
              color="blue"
            >
              Continue for {formatCurrency(DRAFT_PICKS_FEE)}
            </Button>
          </Stack>
        )}

        {subscription_tier !== 'free' && (
          <Group justify="center">
            <Button 
              variant="light" 
              size="sm"
              onClick={() => navigate('/billing')}
            >
              Manage Billing
            </Button>
          </Group>
        )}
      </Stack>
    </Paper>
  );
}
