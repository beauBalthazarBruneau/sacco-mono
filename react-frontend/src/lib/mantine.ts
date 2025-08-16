import { createTheme } from '@mantine/core';

export const theme = createTheme({
  primaryColor: 'green',
  colors: {
    green: [
      '#f0fdf4',
      '#dcfce7',
      '#bbf7d0',
      '#86efac',
      '#4ade80',
      '#38bd7d', // Your primary green
      '#16a34a',
      '#15803d',
      '#166534',
      '#14532d',
    ],
  },
  fontFamily: '"Montserrat", sans-serif',
  headings: {
    fontFamily: '"Montserrat", sans-serif',
    fontWeight: '700',
    sizes: {
      h1: { fontSize: '4.5rem', lineHeight: '1.1', fontWeight: '800' },
      h2: { fontSize: '3rem', lineHeight: '1.2', fontWeight: '700' },
      h3: { fontSize: '2rem', lineHeight: '1.3', fontWeight: '600' },
      h4: { fontSize: '1.5rem', lineHeight: '1.4', fontWeight: '600' },
    },
  },
  components: {
    Button: {
      defaultProps: {
        radius: 'md',
      },
      styles: {
        root: {
          fontWeight: 600,
          letterSpacing: '0.025em',
        },
      },
    },
    Card: {
      defaultProps: {
        radius: 'lg',
        withBorder: true,
      },
      styles: {
        root: {
          backgroundColor: 'var(--mantine-color-dark-6)',
          borderColor: 'var(--mantine-color-dark-4)',
        },
      },
    },
    Input: {
      defaultProps: {
        radius: 'md',
      },
      styles: {
        input: {
          backgroundColor: 'var(--mantine-color-dark-6)',
          borderColor: 'var(--mantine-color-dark-4)',
          '&:focus': {
            borderColor: 'var(--mantine-color-green-6)',
          },
        },
      },
    },
    Text: {
      styles: {
        root: {
          letterSpacing: '0.01em',
        },
      },
    },
  },
  other: {
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  },
});
