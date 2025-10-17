import React from 'react';
import { Checkbox, FormControlLabel, Box, Typography } from '@mui/material';
import { Attestation } from 'types';

interface AttestationFormProps {
  formData: Partial<Attestation>;
  onFormChange: (field: keyof Attestation, value: boolean) => void;
}

const AttestationForm: React.FC<AttestationFormProps> = ({ formData, onFormChange }) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    onFormChange(name as keyof Attestation, checked);
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Attestation
      </Typography>
      <FormControlLabel
        control={
          <Checkbox
            name="swornTrue"
            checked={formData.swornTrue || false}
            onChange={handleChange}
            color="primary"
          />
        }
        label="I attest that the information provided is true and accurate to the best of my knowledge."
      />
    </Box>
  );
};

export default AttestationForm;
