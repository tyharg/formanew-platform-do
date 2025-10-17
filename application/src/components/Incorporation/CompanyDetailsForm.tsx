'use client';

import {
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { IncorporationCompanyDetails } from 'types';

interface CompanyDetailsFormProps {
  formData: Partial<IncorporationCompanyDetails>;
  onFormChange: (field: keyof IncorporationCompanyDetails, value: string) => void;
}

const CompanyDetailsForm: React.FC<CompanyDetailsFormProps> = ({
  formData,
  onFormChange,
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    onFormChange(name as keyof IncorporationCompanyDetails, value);
  };

  return (
    <Stack spacing={3}>
      <Typography variant="h5" gutterBottom>
        Duration of the Company
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Provide the duration the company will be transacting business.
      </Typography>
      <FormControl component="fieldset">
        <RadioGroup
          name="durationType"
          value={formData.durationType || 'Perpetual'}
          onChange={handleChange}
        >
          <FormControlLabel value="Perpetual" control={<Radio />} label="Perpetual" />
          <FormControlLabel value="Limited" control={<Radio />} label="Limited/Future Date" />
        </RadioGroup>
      </FormControl>
      {formData.durationType === 'Limited' && (
        <TextField
          name="durationDate"
          label="Duration Date"
          type="date"
          value={formData.durationDate || ''}
          onChange={handleChange}
          fullWidth
          InputLabelProps={{
            shrink: true,
          }}
        />
      )}
      <Typography variant="h6">Purpose Statement</Typography>
      <Typography variant="body2" color="text.secondary">
        The purpose for which the company is organized:
      </Typography>
      <TextField
        name="purposeStatement"
        label="Purpose Statement"
        value={formData.purposeStatement || ''}
        onChange={handleChange}
        fullWidth
        multiline
        rows={4}
        helperText="If stated, please list a specific purpose for which the company is organized (i.e. the type of activities conducted or services performed)."
      />
    </Stack>
  );
};

export default CompanyDetailsForm;
