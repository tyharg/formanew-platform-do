import { Box } from '@mui/material';
import Sidebar from 'components/Common/Sidebar/Sidebar';
import MaterialThemeProvider from 'components/Theme/Theme';
import { ThemePicker } from 'components/Theme/ThemePicker';
import NavigationHandler from './NavigationHandler';

/**
 * Dashboard layout wrapper.
 * Injects the Dashboard layout and renders its child content.
 *
 * @param children - Content of the pages inside the dashboard layout.
 */
export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <MaterialThemeProvider>
      <NavigationHandler />
      <Box
        sx={{
          display: 'flex',
          minHeight: '100vh',
          width: '100%',
          bgcolor: 'background.default',
        }}
      >
        <Sidebar />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            overflowY: 'auto',
          }}
        >
          <Box
            sx={{
              position: 'relative',
              minHeight: '100%',
              maxWidth: { lg: 'min(1200px, 100%)', xl: 1400 },
              mx: 'auto',
              px: { xs: 2, md: 5, xl: 6 },
              py: { xs: 4, md: 6 },
              display: 'flex',
              flexDirection: 'column',
              gap: { xs: 3, md: 4 },
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: 24,
                right: 24,
                zIndex: 10,
                display: { xs: 'none', md: 'block' },
              }}
            >
              <ThemePicker />
            </Box>
            {/* Mobile theme picker renders itself with fixed positioning */}
            <Box sx={{ display: { xs: 'block', md: 'none' } }}>
              <ThemePicker />
            </Box>
            {children}
          </Box>
        </Box>
      </Box>
    </MaterialThemeProvider>
  );
}
