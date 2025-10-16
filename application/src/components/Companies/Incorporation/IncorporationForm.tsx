'use client';

import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from '@mui/material';
import { Company } from 'lib/api/companies';
import { Incorporation } from 'types';
import BusinessAddressForm from './BusinessAddressForm';
import CompanyDetailsForm from './CompanyDetailsForm';
import AttestationForm from './AttestationForm';

const steps = [
  'Business Information',
  'Business Address',
  'Company Details',
  'Attestation',
];

interface IncorporationFormProps {
  company: Company;
}

const IncorporationForm: React.FC<IncorporationFormProps> = ({ company }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState<Partial<Incorporation>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchIncorporationData = async () => {
      try {
        const response = await fetch(`/api/company/${company.id}/incorporation`);
        if (response.ok) {
          const data = await response.json();
          if (data.incorporation) {
            setFormData(data.incorporation);
          }
        }
      } catch (error) {
        console.error('Failed to fetch incorporation data', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchIncorporationData();
  }, [company.id]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const url = formData.id
        ? `/api/company/${company.id}/incorporation/${formData.id}`
        : `/api/company/${company.id}/incorporation`;
      const method = formData.id ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        setFormData(data.incorporation);
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
      } else {
        console.error('Failed to save incorporation data');
      }
    } catch (error) {
      console.error('Failed to save incorporation data', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      handleSave();
    } else {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleFormChange = (field: keyof Incorporation, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNestedFormChange = (
    model: keyof Incorporation,
    field: string,
    value: any
  ) => {
    setFormData((prev) => ({
      ...prev,
      [model]: {
        ...(prev[model] as object),
        [field]: value,
      },
    }));
  };

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <BusinessInformationForm
            formData={formData}
            onFormChange={handleFormChange}
          />
        );
      case 1:
        return (
          <BusinessAddressForm
            formData={formData.businessAddress || {}}
            onFormChange={(field, value) =>
              handleNestedFormChange('businessAddress', field, value)
            }
          />
        );
      case 2:
        return (
          <CompanyDetailsForm
            formData={formData.companyDetails || {}}
            onFormChange={(field, value) =>
              handleNestedFormChange('companyDetails', field, value)
            }
          />
        );
      case 3:
        return (
          <AttestationForm
            formData={formData.attestation || {}}
            onFormChange={(field, value) =>
              handleNestedFormChange('attestation', field, value)
            }
          />
        );
      default:
        return <Typography>Unknown step</Typography>;
    }
  };

  if (isLoading) {
    return <CircularProgress />;
  }

  return (
    <Box>
      <Stepper activeStep={activeStep} alternativeLabel>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      <Box sx={{ mt: 4 }}>
        {activeStep === steps.length ? (
          <Box>
            <Typography sx={{ mt: 2, mb: 1 }}>
              All steps completed - you&apos;re finished
            </Typography>
          </Box>
        ) : (
          <Box>
            {getStepContent(activeStep)}
            <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
              <Button
                color="inherit"
                disabled={activeStep === 0}
                onClick={handleBack}
                sx={{ mr: 1 }}
              >
                Back
              </Button>
              <Box sx={{ flex: '1 1 auto' }} />
              <Button onClick={handleNext} disabled={isSaving}>
                {isSaving ? (
                  <CircularProgress size={24} />
                ) : activeStep === steps.length - 1 ? (
                  'Finish'
                ) : (
                  'Next'
                )}
              </Button>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default IncorporationForm;
