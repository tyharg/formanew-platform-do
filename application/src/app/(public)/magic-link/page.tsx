import { Suspense } from 'react';
import MagicLinkVerifier from 'components/Public/MagicLinkVerifier/MagicLinkVerifier';

/**
 * Public magic link verify page.
 * Render the magic link verification component with the corresponding layout.
 */
const MagicLinkVerifyPage: React.FC = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MagicLinkVerifier />
    </Suspense>
  );
};

export default MagicLinkVerifyPage;
