'use client';
import { Box, CircularProgress, Fade } from '@mui/material';
import { useNavigating } from 'hooks/navigation';

/**
 * Full screen loading spinner.
 * Used as overlay with semi-transparent background.
 */
const LoadingSpinner = () => (
  <Box
    sx={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      bgcolor: 'rgba(255, 255, 255, 0.6)',
      backdropFilter: 'blur(2px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1300,
    }}
  >
    <CircularProgress color="primary" size={48} />
  </Box>
);

/**
 * Wrapper showing a spinner while navigation is active.
 * Use Fade to apply smooth animation during loading.
 *
 * @param children - Application content that is rendered while there is no load.
 */
const WithLoadingSpinner = ({ children }: { children: React.ReactNode }) => {
  const { navigating } = useNavigating();

  const loading = navigating;

  return (
    <>
      <Fade in={loading} unmountOnExit timeout={250}>
        <div>
          <LoadingSpinner />
        </div>
      </Fade>
      {children}
    </>
  );
};

export default WithLoadingSpinner;
