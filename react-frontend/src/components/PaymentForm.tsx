import { useState, FormEvent } from 'react';
import {
  useStripe,
  useElements,
  PaymentElement,
} from '@stripe/react-stripe-js';
import { Button, Stack, Alert, Text } from '@mantine/core';
import { IconCreditCard, IconAlertCircle } from '@tabler/icons-react';

interface PaymentFormProps {
  onSuccess: () => void;
}

export function PaymentForm({ onSuccess }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string>('');

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      setError('Stripe has not loaded yet. Please try again.');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      const { error: submitError } = await elements.submit();
      if (submitError) {
        throw new Error(submitError.message);
      }

      const { error: paymentError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin + '/billing/success',
        },
        redirect: 'if_required',
      });

      if (paymentError) {
        throw new Error(paymentError.message);
      }

      // Payment succeeded
      onSuccess();
    } catch (err) {
      console.error('Payment error:', err);
      setError(err instanceof Error ? err.message : 'Payment failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap="lg">
        <PaymentElement />

        {error && (
          <Alert icon={<IconAlertCircle size={16} />} color="red">
            {error}
          </Alert>
        )}

        <Stack gap="xs">
          <Button
            type="submit"
            loading={isProcessing}
            disabled={!stripe || !elements || isProcessing}
            leftSection={<IconCreditCard size={16} />}
            size="lg"
            fullWidth
          >
            {isProcessing ? 'Processing...' : 'Complete Payment'}
          </Button>
          
          <Text size="xs" c="dimmed" ta="center">
            Your payment information is secure and encrypted
          </Text>
        </Stack>
      </Stack>
    </form>
  );
}
