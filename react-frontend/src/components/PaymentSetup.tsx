import { useState, useEffect } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { 
  Container, 
  Paper, 
  Title, 
  Text, 
  Stack, 
  Button, 
  Group,
  Alert,
  Loader,
  Center
} from '@mantine/core';
import { IconAlertCircle, IconArrowLeft } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { getStripe, formatCurrency, DRAFT_PICKS_FEE } from '../lib/stripe';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { PaymentForm } from './PaymentForm';

export function PaymentSetup() {
  const [clientSecret, setClientSecret] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const { user } = useAuth();
  const navigate = useNavigate();
  const stripe = getStripe();

  useEffect(() => {
    if (!user) {
      navigate('/signup');
      return;
    }

    createPaymentIntent();
  }, [user, navigate]);

  const createPaymentIntent = async () => {
    try {
      setLoading(true);
      setError('');

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No session found');
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-payment-intent`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({
            amount: DRAFT_PICKS_FEE,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create payment intent');
      }

      const { client_secret } = await response.json();
      setClientSecret(client_secret);
    } catch (err) {
      console.error('Error creating payment intent:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    navigate('/players', { 
      state: { message: 'Payment successful! You can now continue drafting.' }
    });
  };

  const handleBack = () => {
    navigate('/players');
  };

  if (loading) {
    return (
      <Container size="sm" py="xl">
        <Center>
          <Stack align="center" gap="md">
            <Loader size="xl" />
            <Text>Setting up payment...</Text>
          </Stack>
        </Center>
      </Container>
    );
  }

  if (error) {
    return (
      <Container size="sm" py="xl">
        <Paper p="xl" withBorder>
          <Stack gap="md">
            <Alert icon={<IconAlertCircle size={16} />} color="red" title="Payment Setup Error">
              {error}
            </Alert>
            <Group justify="center">
              <Button variant="outline" onClick={createPaymentIntent}>
                Try Again
              </Button>
              <Button variant="light" onClick={handleBack}>
                Go Back
              </Button>
            </Group>
          </Stack>
        </Paper>
      </Container>
    );
  }

  if (!clientSecret) {
    return (
      <Container size="sm" py="xl">
        <Paper p="xl" withBorder>
          <Text ta="center">Unable to initialize payment. Please try again.</Text>
          <Group justify="center" mt="md">
            <Button onClick={createPaymentIntent}>Retry</Button>
          </Group>
        </Paper>
      </Container>
    );
  }

  const appearance = {
    theme: 'night' as const,
    variables: {
      colorPrimary: '#228be6',
    },
  };

  const options = {
    clientSecret,
    appearance,
  };

  return (
    <Container size="sm" py="xl">
      <Paper p="xl" withBorder>
        <Stack gap="lg">
          <Group gap="md">
            <Button 
              variant="subtle" 
              size="sm"
              leftSection={<IconArrowLeft size={16} />}
              onClick={handleBack}
            >
              Back
            </Button>
          </Group>

          <Stack gap="md" align="center">
            <Title order={2} ta="center">Complete Your Payment</Title>
            <Text size="lg" c="dimmed" ta="center">
              Continue drafting for {formatCurrency(DRAFT_PICKS_FEE)}
            </Text>
            <Text size="sm" c="dimmed" ta="center">
              One-time payment • Secure checkout powered by Stripe
            </Text>
          </Stack>

          <Elements stripe={stripe} options={options}>
            <PaymentForm onSuccess={handlePaymentSuccess} />
          </Elements>
        </Stack>
      </Paper>
    </Container>
  );
}
