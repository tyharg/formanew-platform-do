'use client';

import { Box } from '@mui/material';
import { Company } from 'types';
import IncorporationForm from '@/components/Incorporation/IncorporationForm';

interface IncorporationTabProps {
  company: Company;
}

const IncorporationTab: React.FC<IncorporationTabProps> = ({ company }) => {
  return (
    <Box>
      <IncorporationForm company={company} />
    </Box>
  );
};

export default IncorporationTab;
