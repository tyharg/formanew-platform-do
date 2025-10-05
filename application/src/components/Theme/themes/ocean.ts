import { BaseThemeConfig } from '../ThemeRegistry';

export const oceanTheme: BaseThemeConfig = {
  name: 'ocean',
  displayName: 'Ocean Blue',
  palette: {
    light: {
      mode: 'light',
      primary: {
        main: '#0077BE',
        light: '#E3F2FD',
        dark: '#004D7A',
        contrastText: '#ffffff',
      },
      secondary: {
        main: '#00BCD4',
        light: '#E0F2F1',
        dark: '#00838F',
        contrastText: '#ffffff',
      },
      success: {
        main: '#4CAF50',
        light: '#E8F5E8',
        dark: '#2E7D32',
        contrastText: '#ffffff',
      },
      error: {
        main: '#F44336',
        light: '#FFEBEE',
        dark: '#C62828',
        contrastText: '#ffffff',
      },
      warning: {
        main: '#FF9800',
        light: '#FFF3E0',
        dark: '#E65100',
        contrastText: '#ffffff',
      },
      background: {
        default: '#F8FBFF',
        paper: '#FFFFFF',
      },
      text: {
        primary: '#1A1A1A',
        secondary: '#616161',
      },
      divider: '#E1F5FE',
    },
    dark: {
      mode: 'dark',
      primary: {
        main: '#29B6F6',
        light: '#4FC3F7',
        dark: '#0277BD',
        contrastText: '#ffffff',
      },
      secondary: {
        main: '#26C6DA',
        light: '#4DD0E1',
        dark: '#00ACC1',
        contrastText: '#ffffff',
      },
      success: {
        main: '#66BB6A',
        light: '#81C784',
        dark: '#388E3C',
        contrastText: '#ffffff',
      },
      error: {
        main: '#EF5350',
        light: '#E57373',
        dark: '#C62828',
        contrastText: '#ffffff',
      },
      warning: {
        main: '#FFA726',
        light: '#FFB74D',
        dark: '#F57C00',
        contrastText: '#ffffff',
      },
      background: {
        default: '#0A1929',
        paper: '#132F4C',
      },
      text: {
        primary: '#FFFFFF',
        secondary: '#B0BEC5',
      },
      divider: '#1E3A8A',
    },
  },
  typography: {
    fontFamily: 'var(--font-roboto), "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 300,
      fontSize: '3rem',
      lineHeight: 1.2,
      letterSpacing: '-0.01em',
    },
    h2: {
      fontWeight: 300,
      fontSize: '2.5rem',
      lineHeight: 1.3,
      letterSpacing: '-0.01em',
    },
    h4: {
      fontWeight: 400,
      fontSize: '1.5rem',
      lineHeight: 1.4,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: '8px',
          fontWeight: 500,
          padding: '8px 16px',
          transition: 'all 0.2s ease-in-out',
        },
        contained: {
          boxShadow: '0 2px 4px rgba(0, 119, 190, 0.2)',
          '&:hover': {
            boxShadow: '0 4px 8px rgba(0, 119, 190, 0.3)',
            transform: 'translateY(-1px)',
          },
        },
        sizeSmall: {
          padding: '6px 12px',
          fontSize: '0.875rem',
          height: 36,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0, 119, 190, 0.1)',
          border: '1px solid rgba(0, 119, 190, 0.08)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: ({ theme }) => ({
          '& .MuiOutlinedInput-root': {
            borderRadius: '8px',
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

// Export as default for better compatibility
export default oceanTheme;
