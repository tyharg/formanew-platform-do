import { BaseThemeConfig } from '../ThemeRegistry';

export const defaultTheme: BaseThemeConfig = {
  name: 'default',
  displayName: 'Default',
  palette: {
    light: {
      mode: 'light',
      primary: {
        main: '#0061EB',
      },
      background: {
        default: '#ffffff',
        paper: '#ffffff',
      },
    },
    dark: {
      mode: 'dark',
      primary: {
        main: '#0061EB',
      },
      background: {
        default: '#121212',
        paper: '#1e1e1e',
      },
    },
  },
  typography: {
    fontFamily: 'var(--font-roboto), "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      marginBottom: '16px',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 700,
      marginBottom: '48px',
    },
  },
  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true,
        variant: 'outlined',
      },
      styleOverrides: {
        contained: {
          textTransform: 'none',
          fontWeight: 600,
          height: 44,
          paddingLeft: 16,
          paddingRight: 16,
        },
        sizeSmall: {
          height: 36,
          paddingLeft: 12,
          paddingRight: 12,
          fontSize: '0.875rem',
        },
      },
    },
    MuiCard: {
      defaultProps: {
        variant: 'outlined',
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: ({ theme }) => ({
          '& .MuiOutlinedInput-root': {
            '& input': {
              '&:-webkit-autofill, &:-webkit-autofill:hover, &:-webkit-autofill:focus': {
                WebkitBoxShadow: `0 0 0 1000px ${theme.palette.background.default} inset`,
                WebkitTextFillColor: theme.palette.text.primary,
                fontSize: 'inherit',
                fontFamily: 'inherit',
                fontWeight: 'inherit',
                transition: 'background-color 5000s ease-in-out 0s',
              },
            },
          },
        }),
      },
    },
  },
};
