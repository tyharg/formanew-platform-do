import { BaseThemeConfig } from '../ThemeRegistry';

export const skyTheme: BaseThemeConfig = {
  name: 'sky',
  displayName: 'Sky',
  palette: {
    light: {
      mode: 'light',
      primary: {
        main: '#4A73FF', // Clean blue similar to the reference
        light: '#E8F1FF',
        dark: '#3A5DCC',
        contrastText: '#ffffff',
      },
      secondary: {
        main: '#6B73FF',
        light: '#F0F2FF',
        dark: '#5A5FE6',
        contrastText: '#ffffff',
      },
      success: {
        main: '#00D97E',
        light: '#E6FFF6',
        dark: '#00B368',
        contrastText: '#ffffff',
      },
      error: {
        main: '#FF5722',
        light: '#FFEDE8',
        dark: '#E64A19',
        contrastText: '#ffffff',
      },
      warning: {
        main: '#FFC107',
        light: '#FFF8E1',
        dark: '#FF8F00',
        contrastText: '#ffffff',
      },
      grey: {
        100: '#F8FAFC',
        200: '#F1F5F9',
        300: '#E2E8F0',
        400: '#94A3B8',
        500: '#64748B',
        600: '#475569',
      },
      text: {
        primary: '#1E293B', // Darker for better contrast
        secondary: '#64748B',
      },
      background: {
        default: '#eff6ff', // Light blue background matching --tw-gradient-from: #eff6ff (blue-50)
        paper: '#FFFFFF',
      },
      divider: '#E2E8F0',
    },
    dark: {
      mode: 'dark',
      primary: {
        main: '#4A73FF',
        light: '#2D3748',
        dark: '#3A5DCC',
        contrastText: '#ffffff',
      },
      secondary: {
        main: '#6B73FF',
        light: '#2D3748',
        dark: '#5A5FE6',
        contrastText: '#ffffff',
      },
      success: {
        main: '#00D97E',
        light: '#065F46',
        dark: '#00B368',
        contrastText: '#ffffff',
      },
      error: {
        main: '#FF5722',
        light: '#7F1D1D',
        dark: '#E64A19',
        contrastText: '#ffffff',
      },
      warning: {
        main: '#FFC107',
        light: '#78350F',
        dark: '#FF8F00',
        contrastText: '#ffffff',
      },
      grey: {
        100: '#0F172A',
        200: '#1E293B',
        300: '#334155',
        400: '#64748B',
        500: '#94A3B8',
        600: '#E2E8F0',
      },
      text: {
        primary: '#F8FAFC',
        secondary: '#CBD5E0',
      },
      background: {
        default: '#0F172A',
        paper: '#1E293B',
      },
      divider: '#334155',
    },
  },
  typography: {
    fontFamily:
      'var(--font-plus-jakarta-sans), "Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '3rem',
      lineHeight: '3.5rem',
      letterSpacing: '-0.025em',
    },
    h2: {
      fontWeight: 700,
      fontSize: '2.25rem',
      lineHeight: '2.5rem',
      letterSpacing: '-0.025em',
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.875rem',
      lineHeight: '2.25rem',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: '2rem',
    },
    h5: {
      fontWeight: 500,
      fontSize: '1.25rem',
      lineHeight: '1.75rem',
    },
    h6: {
      fontWeight: 600,
      fontSize: '1.125rem',
      lineHeight: '1.5rem',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: '1.75rem',
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: '1.5rem',
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
      fontSize: '0.875rem',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: '8px',
          fontWeight: 600,
          padding: '8px 16px',
          fontSize: '0.875rem',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(74, 115, 255, 0.15)',
          },
        },
        sizeSmall: {
          padding: '6px 12px',
          fontSize: '0.8125rem',
          height: 36,
          // For icon-only buttons with specific dimensions
          '&.MuiButton-root[style*="width: 40px"]': {
            padding: '8px',
            minWidth: '40px',
          },
        },
        contained: {
          '&:hover': {
            boxShadow: '0 8px 25px rgba(74, 115, 255, 0.25)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '16px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(226, 232, 240, 0.8)',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.05)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: ({ theme }) => ({
          '& .MuiOutlinedInput-root': {
            borderRadius: '12px',
            backgroundColor: theme.palette.background.paper,
            '& fieldset': {
              borderColor: '#E2E8F0',
            },
            '&:hover fieldset': {
              borderColor: '#CBD5E0',
            },
            '&.Mui-focused fieldset': {
              borderColor: theme.palette.primary.main,
              borderWidth: '2px',
            },
            '& input': {
              padding: '14px 16px',
              '&:-webkit-autofill, &:-webkit-autofill:hover, &:-webkit-autofill:focus': {
                WebkitBoxShadow: `0 0 0 1000px ${theme.palette.background.paper} inset`,
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
    MuiContainer: {
      styleOverrides: {
        root: {
          paddingLeft: '24px',
          paddingRight: '24px',
        },
      },
    },
  },
};
