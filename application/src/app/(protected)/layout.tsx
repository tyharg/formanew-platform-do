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
            bgcolor: (theme) => theme.palette.grey[50],
            px: { xs: 2.5, md: 4, lg: 6 },
            py: { xs: 4, md: 6 },
            overflowY: 'auto',
          }}
        >
          <Box
            sx={{
              position: 'relative',
              maxWidth: 1400,
              mx: 'auto',
              width: '100%',
              minHeight: '100%',
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                right: 0,
                zIndex: 10,
                display: { xs: 'none', md: 'block' },
              }}
            >
              <ThemePicker />
            </Box>
            {/* Mobile theme picker renders itself with fixed positioning */}
            <Box sx={{ display: { xs: 'block', md: 'none' }, mb: 3 }}>
              <ThemePicker />
            </Box>
            <Box sx={{ pt: { xs: 0, md: 1 }, pb: { xs: 2, md: 4 } }}>{children}</Box>
          </Box>
        </Box>
      </Box>
    </MaterialThemeProvider>
  );
}
