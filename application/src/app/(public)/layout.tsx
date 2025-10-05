'use client';

import { Box } from '@mui/material';
import NavBar from 'components/Public/NavBar/NavBar';
import Footer from 'components/Public/Footer/Footer';
import PublicThemeProvider from 'components/Theme/PublicThemeProvider';
import { useNavigating } from 'hooks/navigation';
import { useEffect } from 'react';

/**
 * Public layout used by pages such as login, signup or landing pages.
 * Apply general structure with NavBar, main content and Footer.
 *
 * @param children - Content displayed in the central area of the layout.
 */
const PublicLayout = ({ children }: { children: React.ReactNode }) => {
  const { setNavigating } = useNavigating();

  useEffect(() => {
    setNavigating(false);
  }, [setNavigating]);

  return (
    <PublicThemeProvider>
      <Box display="flex" flexDirection="column" minHeight="100vh">
        <NavBar />
        <Box component="main" flexGrow={1}>
          {children}
        </Box>
        <Footer />
      </Box>
    </PublicThemeProvider>
  );
};

export default PublicLayout;
