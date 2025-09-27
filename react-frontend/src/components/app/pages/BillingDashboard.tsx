import { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Paper,
  Title,
  Text,
  Stack,
  Group,
  Button,
  Badge,
  Table,
  Alert,
  Loader,
  Center,
  Divider,
} from '@mantine/core';
import { 
  IconExternalLink, 
  IconAlertCircle, 
  IconReceipt,
  IconUser
} from '@tabler/icons-react';
import { useAuth } from '../../../hooks/useAuth';
import { supabase } from '../../../lib/supabase';
import { formatCurrency } from '../../../lib/stripe';
import { TrialStatus } from '../components/TrialStatus';

interface UserProfile {
  id: string;
  email: string;
  username: string | null;
  subscription_tier: 'free' | 'basic' | 'premium';
  subscription_expires_at: string | null;
  draft_picks_used: number;
  draft_picks_limit: number;
  trial_started_at: string | null;
  stripe_customer_id: string | null;
  created_at: string;
}

interface PaymentRecord {
  id: string;
  amount: number;
  currency: string;
  subscription_tier: string;
  status: string;
  created_at: string;
  stripe_payment_intent_id: string | null;
  stripe_invoice_id: string | null;
}

export function BillingDashboard() {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [portalLoading, setPortalLoading] = useState(false);

  const fetchUserData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch user profile
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (profileError) throw profileError;
      setUserProfile(profile);

      // Fetch payment history
      const { data: paymentHistory, error: paymentsError } = await supabase
        .from('payment_history')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (paymentsError) throw paymentsError;
      setPayments(paymentHistory || []);

    } catch (err) {
      console.error('Error fetching user data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load billing data');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user, fetchUserData]);

  const openCustomerPortal = async () => {
    try {
      setPortalLoading(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session found');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-customer-portal`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({
            return_url: window.location.href,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create customer portal session');
      }

      const { url } = await response.json();
      window.location.href = url;

    } catch (err) {
      console.error('Error opening customer portal:', err);
      setError(err instanceof Error ? err.message : 'Failed to open customer portal');
    } finally {
      setPortalLoading(false);
    }
  };

  const getSubscriptionStatus = () => {
    if (!userProfile) return 'Loading...';
    
    const { subscription_tier, subscription_expires_at } = userProfile;
    
    if (subscription_tier === 'free') {
      return 'Free Trial';
    }
    
    if (subscription_expires_at) {
      const expiryDate = new Date(subscription_expires_at);
      const now = new Date();
      
      if (expiryDate > now) {
        return `Active until ${expiryDate.toLocaleDateString()}`;
      } else {
        return 'Expired';
      }
    }
    
    return subscription_tier.charAt(0).toUpperCase() + subscription_tier.slice(1);
  };

  const getStatusColor = (): string => {
    if (!userProfile) return 'gray';
    
    const { subscription_tier } = userProfile;
    
    switch (subscription_tier) {
      case 'premium': return 'gold';
      case 'basic': return 'blue';
      case 'free': return 'green';
      default: return 'gray';
    }
  };

  if (loading) {
    return (
      <Container size="lg" py="xl">
        <Center>
          <Stack align="center" gap="md">
            <Loader size="xl" />
            <Text>Loading billing information...</Text>
          </Stack>
        </Center>
      </Container>
    );
  }

  if (error) {
    return (
      <Container size="lg" py="xl">
        <Alert icon={<IconAlertCircle size={16} />} color="red" title="Error">
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container size="lg" py="xl">
      <Stack gap="xl">
        <div>
          <Title order={1}>Billing & Subscription</Title>
          <Text c="dimmed">Manage your subscription and payment methods</Text>
        </div>

        {/* Trial Status */}
        {userProfile && (
          <TrialStatus userProfile={userProfile} />
        )}

        {/* Account Information */}
        <Paper p="xl" withBorder>
          <Stack gap="lg">
            <Group justify="space-between">
              <Group gap="md">
                <IconUser size={24} />
                <div>
                  <Text size="lg" fw={500}>Account Information</Text>
                  <Text size="sm" c="dimmed">Your subscription details</Text>
                </div>
              </Group>
              <Badge size="lg" color={getStatusColor()} variant="filled">
                {getSubscriptionStatus()}
              </Badge>
            </Group>

            <Divider />

            <Group justify="space-between">
              <div>
                <Text size="sm" c="dimmed">Email</Text>
                <Text fw={500}>{userProfile?.email}</Text>
              </div>
              <div>
                <Text size="sm" c="dimmed">Member since</Text>
                <Text fw={500}>
                  {userProfile?.created_at 
                    ? new Date(userProfile.created_at).toLocaleDateString()
                    : 'Unknown'
                  }
                </Text>
              </div>
            </Group>

            {userProfile?.stripe_customer_id && (
              <Group justify="flex-end">
                <Button
                  leftSection={<IconExternalLink size={16} />}
                  onClick={openCustomerPortal}
                  loading={portalLoading}
                  variant="outline"
                >
                  Manage Payment Methods
                </Button>
              </Group>
            )}
          </Stack>
        </Paper>

        {/* Payment History */}
        <Paper p="xl" withBorder>
          <Stack gap="lg">
            <Group gap="md">
              <IconReceipt size={24} />
              <div>
                <Text size="lg" fw={500}>Payment History</Text>
                <Text size="sm" c="dimmed">Your recent transactions</Text>
              </div>
            </Group>

            {payments.length === 0 ? (
              <Text c="dimmed" ta="center" py="xl">
                No payment history yet
              </Text>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <Table>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Date</Table.Th>
                      <Table.Th>Amount</Table.Th>
                      <Table.Th>Plan</Table.Th>
                      <Table.Th>Status</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {payments.map((payment) => (
                      <Table.Tr key={payment.id}>
                        <Table.Td>
                          {new Date(payment.created_at).toLocaleDateString()}
                        </Table.Td>
                        <Table.Td>
                          {formatCurrency(payment.amount, payment.currency)}
                        </Table.Td>
                        <Table.Td>
                          <Badge size="sm" variant="light">
                            {payment.subscription_tier}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          <Badge 
                            size="sm" 
                            color={payment.status === 'succeeded' ? 'green' : 'red'}
                          >
                            {payment.status}
                          </Badge>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </div>
            )}
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
}
