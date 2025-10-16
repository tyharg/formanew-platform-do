'use client';

import { Stack, TextField, Typography } from '@mui/material';
import { BusinessAddress } from 'types';

interface BusinessAddressFormProps {
  formData: Partial<BusinessAddress>;
  onFormChange: (field: keyof BusinessAddress, value: any) => void;
}

const BusinessAddressForm: React.FC<BusinessAddressFormProps> = ({
  formData,
  onFormChange,
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    onFormChange(name as keyof BusinessAddress, value);
  };

  return (
    <Stack spacing={3}>
      <Typography variant="h6">Business Address and Contact Information</Typography>
      <Typography variant="body2" color="text.secondary">
        Provide the street address of the limited liability company&apos;s current principal place of
        business, which may or may not be the same as the registered agent office address.
      </Typography>
      <Typography variant="subtitle1">Principal Place of Business Address</Typography>
      <TextField
        name="principalAddress"
        label="Address"
        value={formData.principalAddress || ''}
        onChange={handleChange}
        fullWidth
        required
      />
      <TextField
        name="principalSteAptFl"
        label="STE/APT/FL"
        value={formData.principalSteAptFl || ''}
        onChange={handleChange}
        fullWidth
      />
      <TextField
        name="principalAttention"
        label="Attention"
        value={formData.principalAttention || ''}
        onChange={handleChange}
        fullWidth
      />
      <TextField
        name="principalCity"
        label="City"
        value={formData.principalCity || ''}
        onChange={handleChange}
        fullWidth
        required
      />
      <TextField
        name="principalState"
        label="State"
        value={formData.principalState || ''}
        onChange={handleChange}
        fullWidth
        required
      />
      <TextField
        name="principalZip"
        label="ZIP code"
        value={formData.principalZip || ''}
        onChange={handleChange}
        fullWidth
        required
      />
      <TextField
        name="principalCountry"
        label="Country"
        value={formData.principalCountry || ''}
        onChange={handleChange}
        fullWidth
        required
      />
      <Typography variant="subtitle1">Business Mailing Address</Typography>
      <TextField
        name="mailingAddress"
        label="Address"
        value={formData.mailingAddress || ''}
        onChange={handleChange}
        fullWidth
        required
      />
      <TextField
        name="mailingSteAptFl"
        label="STE/APT/FL"
        value={formData.mailingSteAptFl || ''}
        onChange={handleChange}
        fullWidth
      />
      <TextField
        name="mailingAttention"
        label="Attention"
        value={formData.mailingAttention || ''}
        onChange={handleChange}
        fullWidth
      />
      <TextField
        name="mailingCity"
        label="City"
        value={formData.mailingCity || ''}
        onChange={handleChange}
        fullWidth
        required
      />
      <TextField
        name="mailingState"
        label="State"
        value={formData.mailingState || ''}
        onChange={handleChange}
        fullWidth
        required
      />
      <TextField
        name="mailingZip"
        label="ZIP code"
        value={formData.mailingZip || ''}
        onChange={handleChange}
        fullWidth
        required
      />
      <TextField
        name="mailingCountry"
        label="Country"
        value={formData.mailingCountry || ''}
        onChange={handleChange}
        fullWidth
        required
      />
      <TextField
        name="businessPhone"
        label="Business Phone Number"
        value={formData.businessPhone || ''}
        onChange={handleChange}
        fullWidth
        helperText="This field is optional and is for Secretary of State use only. It is not publicly displayed."
      />
      <TextField
        name="businessEmail"
        label="Business Email Address"
        value={formData.businessEmail || ''}
        onChange={handleChange}
        fullWidth
        required
        helperText="This field is required and is for Secretary of State use. Business notices will be sent to this address."
      />
    </Stack>
  );
};

export default BusinessAddressForm;
