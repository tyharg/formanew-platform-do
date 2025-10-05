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
      <Box sx={{ display: 'flex', minHeight: '100vh', width: '100%' }}>
        <Sidebar />
        <Box
          sx={{
            flexGrow: 1,
            padding: '1rem',
            overflowY: 'auto',
            position: 'relative',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              zIndex: 10,
              display: { xs: 'none', md: 'block' }, // Hide on mobile since FAB is used
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
    </MaterialThemeProvider>
  );
}
