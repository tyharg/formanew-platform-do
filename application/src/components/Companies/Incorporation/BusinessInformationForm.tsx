'use client';

import {
  FormControlLabel,
  Link,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { Incorporation } from 'types';

interface BusinessInformationFormProps {
  formData: Partial<Incorporation>;
  onFormChange: <Field extends keyof Incorporation>(
    field: Field,
    value: Incorporation[Field]
  ) => void;
}

const BusinessInformationForm: React.FC<BusinessInformationFormProps> = ({
  formData,
  onFormChange,
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = event.target;
    const field = name as keyof Incorporation;

    if (type === 'checkbox') {
      onFormChange(field, checked as Incorporation[typeof field]);
      return;
    }

    onFormChange(field, value as Incorporation[typeof field]);
  };

  return (
    <Stack spacing={3}>
      <Typography variant="h6">Business Information</Typography>
      <Typography variant="body2" color="text.secondary">
        These Articles are filed pursuant to{' '}
        <Link
          href="https://nmonesource.com/nmos/nmsa/en/item/4400/index.do#a19"
          target="_blank"
          rel="noopener noreferrer"
        >
          Chapter 53, Article 19 NMSA 1978
        </Link>
        , which may be cited as the &quot;Limited Liability Company Act&quot;.
      </Typography>
      <Typography variant="body2" color="text.secondary">
        The undersigned, acting as organizer(s) to form a limited liability company under the New
        Mexico Limited Liability Act, adopt the following Articles of Organization:
      </Typography>
      <TextField
        name="llcName"
        label="Limited Liability Company Name"
        value={formData.llcName || ''}
        onChange={handleChange}
        fullWidth
        helperText='The name of a limited liability company and, if different, the name under which it proposes to transact business in New Mexico shall be stated in its articles of organization and shall contain the words "limited liability company" or "limited company" or the abbreviation "L.L.C.", "LLC", "L.C." or "LC". The word "limited" may be abbreviated as "ltd." and the word "company" may be abbreviated as "co."'
      />
      <TextField
        name="confirmLlcName"
        label="Confirm Limited Liability Company Name"
        value={formData.confirmLlcName || ''}
        onChange={handleChange}
        fullWidth
      />
      <FormControlLabel
        control={
          <Switch
            checked={formData.dbaDifferent || false}
            onChange={handleChange}
            name="dbaDifferent"
          />
        }
        label="Is the name proposed to do business in New Mexico different than the registered LLC name?"
      />
    </Stack>
  );
};

export default BusinessInformationForm;
