'use client';

import {
  FormControlLabel,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { Attestation } from 'types';

interface AttestationFormProps {
  formData: Partial<Attestation>;
  onFormChange: <Field extends keyof Attestation>(
    field: Field,
    value: Attestation[Field]
  ) => void;
}

const AttestationForm: React.FC<AttestationFormProps> = ({
  formData,
  onFormChange,
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = event.target;
    const field = name as keyof Attestation;

    if (type === 'checkbox') {
      onFormChange(field, checked as Attestation[typeof field]);
      return;
    }

    if (type === 'date') {
      const nextValue = value ? new Date(value) : null;
      onFormChange(field, nextValue as Attestation[typeof field]);
      return;
    }

    onFormChange(field, value as Attestation[typeof field]);
  };

  const formatDateInputValue = (date?: Date | string | null) =>
    date ? new Date(date).toISOString().split('T')[0] : '';

  return (
    <Stack spacing={3}>
      <Typography variant="h6">Attestations</Typography>
      <Typography variant="body2" color="text.secondary">
        Read and check each attestation prior to signing this document. Intentionally filing a
        false document may result in a criminal or civil liability.
      </Typography>
      <FormControlLabel
        control={
          <Switch
            checked={formData.infoIsPublic || false}
            onChange={handleChange}
            name="infoIsPublic"
          />
        }
        label="I understand that the information I enter into the online system is public information and will appear online and on copy requests exactly as I enter it into the system."
      />
      <FormControlLabel
        control={
          <Switch
            checked={formData.authorizedToFile || false}
            onChange={handleChange}
            name="authorizedToFile"
          />
        }
        label="I have been authorized by the business entity to file this document online."
      />
      <FormControlLabel
        control={
          <Switch
            checked={formData.swornTrue || false}
            onChange={handleChange}
            name="swornTrue"
          />
        }
        label="I, HEREBY SWEAR AND/OR AFFIRM, under penalty of law, including criminal prosecution, that the facts contained in this document are true. I certify that I am signing this document as the person(s) whose signature is required, or as an agent of the person(s) whose signature is required, who has authorized me to place his/her signature on this document."
      />
      <Typography variant="h6">Organizer(s)</Typography>
      <Typography variant="body2" color="text.secondary">
        A minimum of 1 Organizer is required. The organizer is the individual/business establishing
        the limited liability company, not the limited liability company that is registering with
        this filing. They are not required to be members/managers. Please note that Organizers may
        not be amended in the future.
      </Typography>
      <TextField
        name="organizerTitle"
        label="Title"
        value={formData.organizerTitle || ''}
        onChange={handleChange}
        fullWidth
      />
      <TextField
        name="organizerName"
        label="Name of individual or organization"
        value={formData.organizerName || ''}
        onChange={handleChange}
        fullWidth
      />
      <TextField
        name="organizerAddress"
        label="Address"
        value={formData.organizerAddress || ''}
        onChange={handleChange}
        fullWidth
      />
      <Typography variant="h6">Signer&apos;s Capacity</Typography>
      <TextField
        name="signerCapacity"
        label="Signer's Capacity"
        value={formData.signerCapacity || ''}
        onChange={handleChange}
        fullWidth
      />
      <TextField
        name="onBehalfOf"
        label="On behalf of"
        value={formData.onBehalfOf || ''}
        onChange={handleChange}
        fullWidth
      />
      <TextField
        name="signature"
        label="Signature"
        value={formData.signature || ''}
        onChange={handleChange}
        fullWidth
      />
      <TextField
        name="dateSigned"
        label="Date"
        type="date"
        value={formatDateInputValue(formData.dateSigned)}
        onChange={handleChange}
        fullWidth
        InputLabelProps={{
          shrink: true,
        }}
      />
    </Stack>
  );
};

export default AttestationForm;
