import { BaseThemeConfig } from '../ThemeRegistry';

export const minimalistTheme: BaseThemeConfig = {
  name: 'minimalist',
  displayName: 'Minimalist',
  palette: {
    light: {
      mode: 'light',
      primary: {
        main: '#1A1A1A', // Pure charcoal for minimalist feel
        light: '#4F4F4F',
        dark: '#000000',
        contrastText: '#ffffff',
      },
      secondary: {
        main: '#6B7280', // Neutral gray
        light: '#9CA3AF',
        dark: '#4B5563',
        contrastText: '#ffffff',
      },
      success: {
        main: '#10B981', // Clean green
        light: '#34D399',
        dark: '#059669',
        contrastText: '#ffffff',
      },
      error: {
        main: '#EF4444', // Clean red
        light: '#F87171',
        dark: '#DC2626',
        contrastText: '#ffffff',
      },
      warning: {
        main: '#F59E0B', // Clean amber
        light: '#FBBF24',
        dark: '#D97706',
        contrastText: '#ffffff',
      },
      info: {
        main: '#3B82F6', // Clean blue
        light: '#60A5FA',
        dark: '#2563EB',
        contrastText: '#ffffff',
      },
      grey: {
        50: '#FAFAFA',
        100: '#F4F4F5',
        200: '#E4E4E7',
        300: '#D4D4D8',
        400: '#A1A1AA',
        500: '#71717A',
        600: '#52525B',
        700: '#3F3F46',
        800: '#27272A',
        900: '#18181B',
      },
      text: {
        primary: '#1A1A1A',
        secondary: '#6B7280',
        disabled: '#A1A1AA',
      },
      background: {
        default: '#FFFFFF',
        paper: '#FFFFFF',
      },
      divider: '#E4E4E7',
      action: {
        active: '#52525B',
        hover: 'rgba(26, 26, 26, 0.04)',
        selected: 'rgba(26, 26, 26, 0.08)',
        disabled: 'rgba(161, 161, 170, 0.26)',
        disabledBackground: 'rgba(161, 161, 170, 0.12)',
      },
    },
    dark: {
      mode: 'dark',
      primary: {
        main: '#FFFFFF', // Pure white for dark mode
        light: '#FFFFFF',
        dark: '#E4E4E7',
        contrastText: '#1A1A1A',
      },
      secondary: {
        main: '#A1A1AA', // Light gray
        light: '#D4D4D8',
        dark: '#71717A',
        contrastText: '#1A1A1A',
      },
      success: {
        main: '#22C55E', // Brighter green for dark mode
        light: '#4ADE80',
        dark: '#16A34A',
        contrastText: '#000000',
      },
      error: {
        main: '#F87171', // Softer red for dark mode
        light: '#FCA5A5',
        dark: '#EF4444',
        contrastText: '#000000',
      },
      warning: {
        main: '#FBBF24', // Brighter amber for dark mode
        light: '#FCD34D',
        dark: '#F59E0B',
        contrastText: '#000000',
      },
      info: {
        main: '#60A5FA', // Brighter blue for dark mode
        light: '#93C5FD',
        dark: '#3B82F6',
        contrastText: '#000000',
      },
      grey: {
        50: '#18181B',
        100: '#27272A',
        200: '#3F3F46',
        300: '#52525B',
        400: '#71717A',
        500: '#A1A1AA',
        600: '#D4D4D8',
        700: '#E4E4E7',
        800: '#F4F4F5',
        900: '#FAFAFA',
      },
      text: {
        primary: '#FAFAFA',
        secondary: '#D4D4D8',
        disabled: '#71717A',
      },
      background: {
        default: '#0A0A0A', // Pure black background
        paper: '#18181B', // Slightly lighter for cards
      },
      divider: '#3F3F46',
      action: {
        active: '#D4D4D8',
        hover: 'rgba(255, 255, 255, 0.05)',
        selected: 'rgba(255, 255, 255, 0.08)',
        disabled: 'rgba(212, 212, 216, 0.3)',
        disabledBackground: 'rgba(212, 212, 216, 0.12)',
      },
    },
  },
  typography: {
    fontFamily:
      'var(--font-inter), "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", sans-serif',
    h1: {
      fontWeight: 300, // Light weight for minimalist feel
      fontSize: '3rem',
      lineHeight: '3.5rem',
      letterSpacing: '-0.02em',
    },
    h2: {
      fontWeight: 300,
      fontSize: '2.25rem',
      lineHeight: '2.75rem',
      letterSpacing: '-0.02em',
    },
    h3: {
      fontWeight: 400,
      fontSize: '1.875rem',
      lineHeight: '2.25rem',
      letterSpacing: '-0.015em',
    },
    h4: {
      fontWeight: 400,
      fontSize: '1.5rem',
      lineHeight: '2rem',
      letterSpacing: '-0.015em',
    },
    h5: {
      fontWeight: 500,
      fontSize: '1.25rem',
      lineHeight: '1.75rem',
      letterSpacing: '-0.01em',
    },
    h6: {
      fontWeight: 500,
      fontSize: '1.125rem',
      lineHeight: '1.5rem',
      letterSpacing: '-0.01em',
    },
    subtitle1: {
      fontWeight: 400,
      fontSize: '1rem',
      lineHeight: '1.5rem',
    },
    subtitle2: {
      fontWeight: 400,
      fontSize: '0.875rem',
      lineHeight: '1.25rem',
    },
    body1: {
      fontWeight: 400,
      fontSize: '1rem',
      lineHeight: '1.625rem', // More breathing space
    },
    body2: {
      fontWeight: 400,
      fontSize: '0.875rem',
      lineHeight: '1.375rem',
    },
    button: {
      fontWeight: 500, // Lighter than before
      fontSize: '0.875rem',
      lineHeight: '1.25rem',
      textTransform: 'none',
      letterSpacing: '0',
    },
    caption: {
      fontWeight: 400,
      fontSize: '0.75rem',
      lineHeight: '1rem',
    },
    overline: {
      fontWeight: 500,
      fontSize: '0.6875rem', // Slightly smaller
      lineHeight: '1rem',
      textTransform: 'uppercase',
      letterSpacing: '0.08em',
    },
  },
  components: {
    // Button Components
    MuiButton: {
      styleOverrides: {
        root: () => ({
          textTransform: 'none',
          borderRadius: '4px', // More minimal rounded corners
          fontWeight: 500,
          padding: '8px 16px',
          fontSize: '0.875rem',
          lineHeight: '1.25rem',
          transition: 'all 0.2s ease-in-out',
          boxShadow: 'none',
          border: 'none',
          minHeight: '36px',
          '&:hover': {
            boxShadow: 'none',
            transform: 'none', // Remove transform for minimalist approach
          },
          // Make startIcon and endIcon grey
          '& .MuiButton-startIcon': {
            color: 'inherit', // Let it inherit the button color, but we'll override with grey for specific cases
          },
          '& .MuiButton-endIcon': {
            color: 'inherit',
          },
        }),
        contained: () => ({
          '&:hover': {
            boxShadow: 'none',
            opacity: 0.9,
          },
        }),
        outlined: ({ theme }) => ({
          borderWidth: '1px',
          borderStyle: 'solid',
          borderColor: theme.palette.divider,
          backgroundColor: 'transparent',
          color: theme.palette.grey[500], // Make outlined button text/icons grey
          '&:hover': {
            borderColor: theme.palette.text.primary,
            backgroundColor: 'transparent',
            color: theme.palette.text.primary, // Darker on hover
          },
          // Ensure icons in outlined buttons are grey
          '& .MuiButton-startIcon': {
            color: theme.palette.grey[500],
          },
          '& .MuiButton-endIcon': {
            color: theme.palette.grey[500],
          },
          '&:hover .MuiButton-startIcon': {
            color: theme.palette.text.primary,
          },
          '&:hover .MuiButton-endIcon': {
            color: theme.palette.text.primary,
          },
        }),
        text: ({ theme }) => ({
          '&:hover': {
            backgroundColor: theme.palette.action?.hover,
          },
        }),
        sizeSmall: {
          padding: '6px 12px',
          fontSize: '0.8125rem',
          minHeight: '32px',
        },
        sizeLarge: {
          padding: '12px 24px',
          fontSize: '0.9375rem',
          minHeight: '44px',
        },
      },
    },
    // IconButton Components - Make icons grey for minimal look
    MuiIconButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          color: theme.palette.grey[500], // Use grey color for icons
          '&:hover': {
            backgroundColor: theme.palette.action?.hover,
            color: theme.palette.text.primary, // Slightly darker on hover
          },
        }),
      },
    },
    // Card Components
    MuiCard: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: '8px',
          border: `1px solid ${theme.palette.divider}`,
          boxShadow: 'none', // Remove shadows for minimalist approach
          transition: 'border-color 0.2s ease-in-out',
          '&:hover': {
            borderColor: theme.palette.action?.hover,
          },
        }),
      },
    }, // Input Components
    MuiTextField: {
      styleOverrides: {
        root: ({ theme }) => ({
          '& .MuiOutlinedInput-root': {
            borderRadius: '4px', // More minimal border radius
            transition: 'border-color 0.2s ease-in-out',
            '&:hover': {
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: theme.palette.text.secondary,
              },
            },
            '&.Mui-focused': {
              '& .MuiOutlinedInput-notchedOutline': {
                borderWidth: '1px', // Keep consistent border width
                borderColor: theme.palette.primary.main,
              },
            },
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
          '& .MuiInputLabel-root': {
            fontWeight: 400, // Lighter font weight
          },
        }),
      },
    },
    // InputAdornment Components - Make search icon grey
    MuiInputAdornment: {
      styleOverrides: {
        root: ({ theme }) => ({
          color: theme.palette.grey[500], // Make search icon grey
        }),
      },
    },
    // Chip Components
    MuiChip: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: '16px', // Pill shape for chips
          fontWeight: 500, // Slightly bolder for better visibility
          fontSize: '0.8125rem',
          height: '28px', // Slightly taller for better presence
          backgroundColor: theme.palette.grey[100], // Light background for better visibility
          color: theme.palette.text.primary,
          border: `1px solid ${theme.palette.grey[300]}`, // Subtle border
          '&:hover': {
            backgroundColor: theme.palette.grey[200],
          },
        }),
        colorPrimary: ({ theme }) => ({
          backgroundColor: theme.palette.primary.main,
          color: theme.palette.primary.contrastText,
          border: 'none',
          '&:hover': {
            backgroundColor: theme.palette.primary.dark,
          },
        }),
        colorSuccess: ({ theme }) => ({
          backgroundColor: theme.palette.success.main,
          color: theme.palette.success.contrastText,
          border: 'none',
          '&:hover': {
            backgroundColor: theme.palette.success.dark,
          },
        }),
      },
    }, // Paper Components
    MuiPaper: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: '8px',
          border: `1px solid ${theme.palette.divider}`,
          boxShadow: 'none', // Remove all shadows for minimalist approach
        }),
      },
    }, // Dialog Components
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: '8px',
          boxShadow: 'none',
        },
      },
    },

    // Menu Components
    MuiMenu: {
      styleOverrides: {
        paper: ({ theme }) => ({
          borderRadius: '4px',
          border: `1px solid ${theme.palette.divider}`,
          boxShadow: 'none',
        }),
      },
    }, // List Components
    MuiListItemButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: '4px',
          margin: '1px 0', // Minimal spacing
          padding: '8px 16px',
          '&:hover': {
            backgroundColor: theme.palette.action?.hover,
          },
          '&.Mui-selected': {
            backgroundColor: theme.palette.action?.selected,
            '&:hover': {
              backgroundColor: theme.palette.action?.selected,
            },
          },
        }),
      },
    },

    // Tab Components
    MuiTab: {
      styleOverrides: {
        root: () => ({
          textTransform: 'none',
          fontWeight: 400, // Lighter for minimalist feel
          fontSize: '0.875rem',
          minHeight: '40px', // Shorter tabs
          '&.Mui-selected': {
            fontWeight: 500, // Subtle difference when selected
          },
        }),
      },
    },

    // Switch Components
    MuiSwitch: {
      styleOverrides: {
        root: ({ theme }) => ({
          '& .MuiSwitch-switchBase': {
            '&.Mui-checked': {
              '& + .MuiSwitch-track': {
                backgroundColor: theme.palette.primary.main,
                opacity: 1,
              },
            },
          },
          '& .MuiSwitch-track': {
            borderRadius: '12px', // More minimal rounded track
          },
        }),
      },
    },

    // AppBar Components
    MuiAppBar: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.primary,
          borderBottom: `1px solid ${theme.palette.divider}`,
          boxShadow: 'none',
        }),
      },
    },

    // Toolbar Components
    MuiToolbar: {
      styleOverrides: {
        root: {
          minHeight: '56px !important', // Shorter for minimalist approach
          padding: '0 16px', // Less padding
        },
      },
    },
  },
};

// Export as both named and default for compatibility
export default minimalistTheme;
